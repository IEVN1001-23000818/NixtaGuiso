from flask import Blueprint, request, jsonify, session

from database import mysql
from utils.seguridad import cliente_requerido
from blueprints.auth.routes import obtener_usuario, PATRON_CORREO, PATRON_TELEFONO, PATRON_RFC

perfil_bp = Blueprint('perfil', __name__)


# ---------------------------------------------------------------------
#  VER PERFIL
# ---------------------------------------------------------------------

@perfil_bp.route('/api/perfil', methods=['GET'])
@cliente_requerido
def ver_perfil():
    cursor = None

    try:
        cursor = mysql.connection.cursor()
        usuario = obtener_usuario(cursor, session['id_usuario'])

        if not usuario:
            return jsonify({'exito': False, 'mensaje': 'La cuenta ya no está activa'}), 404

        # Resumen de compras
        cursor.execute("""
            SELECT COUNT(*) AS total_pedidos,
                   COALESCE(SUM(CASE WHEN estado = 'entregado' THEN total END), 0) AS total_comprado
            FROM pedidos
            WHERE id_cliente = %s AND estado <> 'cancelado'
        """, (session['id_cliente'],))
        compras = cursor.fetchone()

        # Referidos: invitados y los que ya hicieron su primer pedido entregado
        cursor.execute("""
            SELECT COUNT(*) AS invitados,
                   COALESCE(SUM(EXISTS (
                       SELECT 1 FROM pedidos p
                       WHERE p.id_cliente = c.id_cliente AND p.estado = 'entregado'
                   )), 0) AS concretados
            FROM clientes c
            WHERE c.id_referido_por = %s
        """, (session['id_cliente'],))
        referidos = cursor.fetchone()

        return jsonify({
            'exito': True,
            'usuario': usuario,
            'resumen': {
                'total_pedidos': compras['total_pedidos'],
                'total_comprado': float(compras['total_comprado']),
                'referidos_invitados': int(referidos['invitados']),
                'referidos_concretados': int(referidos['concretados'])
            }
        }), 200

    except Exception as e:
        print("ERROR AL VER PERFIL:", str(e))
        return jsonify({'exito': False, 'mensaje': 'No se pudo obtener el perfil'}), 500

    finally:
        if cursor:
            cursor.close()


# ---------------------------------------------------------------------
#  EDITAR PERFIL
#  El tipo de cuenta (Hogar o Negocio) y el nivel B2B no se editan aquí.
# ---------------------------------------------------------------------

@perfil_bp.route('/api/perfil', methods=['PUT'])
@cliente_requerido
def editar_perfil():
    cursor = None

    try:
        datos = request.get_json(silent=True) or {}

        nombre = str(datos.get('nombre', '')).strip()
        correo = str(datos.get('correo', '')).strip().lower()
        telefono = str(datos.get('telefono', '')).strip()
        direccion = str(datos.get('direccion', '') or '').strip()
        nombre_negocio = str(datos.get('nombre_negocio', '') or '').strip()
        rfc = str(datos.get('rfc', '') or '').strip().upper()

        if len(nombre) < 3:
            return jsonify({'exito': False, 'mensaje': 'El nombre debe tener al menos 3 caracteres'}), 400

        if not PATRON_CORREO.match(correo):
            return jsonify({'exito': False, 'mensaje': 'El correo no es válido'}), 400

        if not PATRON_TELEFONO.match(telefono):
            return jsonify({'exito': False, 'mensaje': 'El teléfono debe tener 10 dígitos'}), 400

        cursor = mysql.connection.cursor()

        cursor.execute(
            "SELECT tipo FROM clientes WHERE id_cliente = %s", (session['id_cliente'],)
        )
        tipo = cursor.fetchone()['tipo']

        if tipo == 'B2B':
            if len(nombre_negocio) < 3:
                return jsonify({'exito': False, 'mensaje': 'Escribe el nombre del negocio'}), 400
            if rfc and not PATRON_RFC.match(rfc):
                return jsonify({'exito': False, 'mensaje': 'El RFC no es válido'}), 400
        else:
            nombre_negocio = ''
            rfc = ''

        # El correo no puede ser de otra cuenta
        cursor.execute(
            "SELECT 1 FROM usuarios WHERE correo = %s AND id_usuario <> %s",
            (correo, session['id_usuario'])
        )
        if cursor.fetchone():
            return jsonify({'exito': False, 'mensaje': 'Ese correo ya está registrado en otra cuenta'}), 409

        cursor.execute("""
            UPDATE usuarios SET nombre = %s, correo = %s, telefono = %s
            WHERE id_usuario = %s
        """, (nombre, correo, telefono, session['id_usuario']))

        cursor.execute("""
            UPDATE clientes SET direccion = %s, nombre_negocio = %s, rfc = %s
            WHERE id_cliente = %s
        """, (direccion or None, nombre_negocio or None, rfc or None, session['id_cliente']))

        mysql.connection.commit()

        return jsonify({
            'exito': True,
            'mensaje': 'Perfil actualizado',
            'usuario': obtener_usuario(cursor, session['id_usuario'])
        }), 200

    except Exception as e:
        print("ERROR AL EDITAR PERFIL:", str(e))
        mysql.connection.rollback()
        return jsonify({'exito': False, 'mensaje': 'No se pudo actualizar el perfil'}), 500

    finally:
        if cursor:
            cursor.close()
