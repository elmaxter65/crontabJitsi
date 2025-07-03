from flask import Flask, request, jsonify
from google.cloud import firestore
import os
import time
import jwt
from functools import wraps

app = Flask(__name__)
db = firestore.Client()

execution_count = 0
is_running = False

SECRET_KEY = os.environ.get('JWT_SECRET', 'mysecret')
API_KEY = os.environ.get('API_KEY', 'myapikey')

# Middleware para autenticación
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        key = request.args.get('key')

        if token:
            try:
                jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expirado"}), 403
            except jwt.InvalidTokenError:
                return jsonify({"error": "Token inválido"}), 403
        elif key != API_KEY:
            return jsonify({"error": "No autorizado"}), 401

        return f(*args, **kwargs)
    return decorated

@app.route('/', methods=['GET'])
@auth_required
def hello_world():
    global execution_count, is_running

    if is_running:
        return "Ya se está ejecutando", 429

    is_running = True
    execution_count += 1
    start = time.time()

    if execution_count % 5 == 0:
        is_running = False
        return "Error simulado para pruebas", 500

    try:
        time.sleep(1)  # Simula trabajo
        duration = round((time.time() - start) * 1000)

        db.collection('metrics').add({
            'timestamp': firestore.SERVER_TIMESTAMP,
            'duration': duration,
            'executionCount': execution_count
        })

        return f"¡Hola desde Cloud Run! Tiempo: {duration} ms"
    except Exception as e:
        return f"Error inesperado: {str(e)}", 500
    finally:
        is_running = False

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
