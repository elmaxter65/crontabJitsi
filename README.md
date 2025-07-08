# 🧠 Microservicio `hello_function` (Python y Node.js)

Este repositorio contiene dos versiones del microservicio `hello_function`, una en Python (Flask) y otra en Node.js (Express), ambas listas para ser desplegadas en **Google Cloud Run**. Ambas versiones exponen un endpoint HTTP protegido por autenticación, que registra métricas en Firestore, previene ejecuciones simultáneas y simula errores para pruebas.

---

## 📁 Estructura del proyecto

```
/crontabJitsi/
├── hello_function_node.js        # Versión Node.js (Express)
├── hello_function_python.py      # Versión Python (Flask)
└── README.md
```

---

## 🚀 Despliegue en Cloud Run (Python)

### Requisitos:
- Python 3.10+
- Google Cloud SDK
- Firestore habilitado

### Instalación local:
```bash
pip install flask google-cloud-firestore pyjwt
python hello_function_python.py
```

### Despliegue en Cloud Run:
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/hello-python
gcloud run deploy hello-python \
  --image gcr.io/[PROJECT_ID]/hello-python \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🚀 Despliegue en Cloud Run (Node.js)

### Requisitos:
- Node.js 18+
- Google Cloud SDK
- Firestore habilitado

### Instalación local:
```bash
npm install express @google-cloud/firestore jsonwebtoken
node hello_function_node.js
```


## 🧪 Funcionalidades destacadas

- Control de concurrencia: no permite doble ejecución simultánea.
- Registro en Firestore: duración y conteo de ejecuciones.
- Simulación de errores cada 5 llamadas.