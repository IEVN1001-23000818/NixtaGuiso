import re

from flask import Blueprint, request, jsonify

from database import mysql
from utils.seguridad import admin_requerido
from utils.validaciones import ErrorValidacion, texto, booleano

admin_despacho_bp = Blueprint('admin_despacho', __name__)

PATRON_TELEFONO = re.compile(r'^[0-9]{10}$')
PATRON_PLACAS = re.compile(r'^[A-Z0-9-]{5,10}$')


# =====================================================================
#  REPARTIDORES
#  (la gestión de pedidos del Módulo 10 se agrega en el paso 8)
# =====================================================================

def leer_repartidor(datos):
    nombre = texto(datos, 'nombre', 'Nombre', minimo=3, maximo=100)
    telefono = str(datos.get('telefono', '')).strip()
    placas = str(datos.get('placas', '')).strip().upper()

    if not PATRON_TELEFONO.match(telefono):
        raise ErrorValidacion('El teléfono debe tener 10 dígitos')
    if not PATRON_PLACAS.match(placas):
        raise ErrorValidacion('Las placas deben tener de 5 a 10 letras, números o guiones')

    return nombre, telefono, placas


@admin_despacho_bp.route('/api/admin/repartidores', methods=['GET'])
@admin_requerido
def listar_repartidores():
    cursor = None

    try:
        incluir_inactivos = request.args.get('incluir_inactivos', '0') == '1'

        consulta = """
            SELECT r.id_repartidor, r.nombre, r.telefono, r.placas, r.activo,
                   COUNT(p.id_pedido) AS pedidos_en_ruta
            FROM repartidores r
            LEFT JOIN pedidos p ON p.id_repartidor = r.id_repartidor AND p.estado = 'en_ruta'
        """
        if not incluir_inactivos:
            consulta += " WHERE r.activo = TRUE"
        consulta += " GROUP BY r.id_repartidor, r.nombre, r.telefono, r.placas, r.activo ORDER BY r.nombre"

        cursor = mysql.connection.cursor()
        cursor.execute(consulta)

        repartidores = [{
            'id_repartidor': r['id_repartidor'],
            'nombre': r['nombre'],
            'telefono': r['telefono'],
            'placas': r['placas'],
            'activo': bool(r['activo']),
            'pedidos_en_ruta': r['pedidos_en_ruta']
        } for r in cursor.fetchall()]

        return jsonify({'exito': True, 'repartidores': repartidores}), 200

    except Exception as e:
        print("ERROR AL LISTAR REPARTIDORES:", str(e))
        return jsonify({'exito': False, 'mensaje': 'No se pudieron obtener los repartidores'}), 500

    finally:
        if cursor:
            cursor.close()


@admin_despacho_bp.route('/api/admin/repartidores', methods=['POST'])
@admin_requerido
def crear_repartidor():
    cursor = None

    try:
        nombre, telefono, placas = leer_repartidor(request.get_json(silent=True) or {})

        cursor = mysql.connection.cursor()
        cursor.execute("""
            INSERT INTO repartidores (nombre, telefono, placas) VALUES (%s, %s, %s)
        """, (nombre, telefono, placas))
        id_repartidor = cursor.lastrowid
        mysql.connection.commit()

        return jsonify({
            'exito': True,
            'mensaje': 'Repartidor registrado',
            'id_repartidor': id_repartidor
        }), 201

    except ErrorValidacion as e:
        return jsonify({'exito': False, 'mensaje': e.mensaje}), e.codigo

    except Exception as e:
        print("ERROR AL CREAR REPARTIDOR:", str(e))
        mysql.connection.rollback()
        return jsonify({'exito': False, 'mensaje': 'No se pudo registrar el repartidor'}), 500

    finally:
        if cursor:
            cursor.close()


@admin_despacho_bp.route('/api/admin/repartidores/<int:id_repartidor>', methods=['PUT'])
@admin_requerido
def editar_repartidor(id_repartidor):
    cursor = None

    try:
        datos = request.get_json(silent=True) or {}
        nombre, telefono, placas = leer_repartidor(datos)
        activo = booleano(datos, 'activo', True)

        cursor = mysql.connection.cursor()

        cursor.execute("SELECT 1 FROM repartidores WHERE id_repartidor = %s", (id_repartidor,))
        if not cursor.fetchone():
            return jsonify({'exito': False, 'mensaje': 'El repartidor no existe'}), 404

        if not activo:
            cursor.execute("""
                SELECT COUNT(*) AS total FROM pedidos
                WHERE id_repartidor = %s AND estado = 'en_ruta'
            """, (id_repartidor,))
            if cursor.fetchone()['total'] > 0:
                raise ErrorValidacion('No se puede desactivar: tiene pedidos en ruta', 409)

        cursor.execute("""
            UPDATE repartidores SET nombre = %s, telefono = %s, placas = %s, activo = %s
            WHERE id_repartidor = %s
        """, (nombre, telefono, placas, activo, id_repartidor))
        mysql.connection.commit()

        return jsonify({'exito': True, 'mensaje': 'Repartidor actualizado'}), 200

    except ErrorValidacion as e:
        return jsonify({'exito': False, 'mensaje': e.mensaje}), e.codigo

    except Exception as e:
        print("ERROR AL EDITAR REPARTIDOR:", str(e))
        mysql.connection.rollback()
        return jsonify({'exito': False, 'mensaje': 'No se pudo actualizar el repartidor'}), 500

    finally:
        if cursor:
            cursor.close()
