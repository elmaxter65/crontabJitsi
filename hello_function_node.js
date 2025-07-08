const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

let executionCount = 0;
let isRunning = false;

const API_KEY = process.env.API_KEY || 'myapikey';
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || './credenciales.json';

// Configurar autenticación explícita para Firestore usando la clave de servicio
const firestore = new Firestore({
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS
});

// Middleware: validate JWT or API Key
authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (authHeader === API_KEY) {
    return next();
  } else {
    return res.status(401).send('No autorizado');
  }
};

app.get('/', authMiddleware, async (req, res) => {
  if (isRunning) {
    return res.status(429).send('La función ya se está ejecutando.');
  }

  isRunning = true;
  const start = Date.now();
  executionCount++;

  // Simular error cada 5 ejecuciones
  if (executionCount % 5 === 0) {
    isRunning = false;
    return res.status(500).send('Error simulado para pruebas');
  }

  try {
    // Simular alguna lógica de trabajo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const duration = Date.now() - start;
    try {
      // Verificar conexión con Firestore
      await firestore.collection('test_connection').limit(1).get();
      console.log('Conexión con Firestore exitosa');
    } catch (err) {
      console.error('Error de conexión con Firestore:', err);
      throw new Error('No se pudo conectar a la base de datos');
    }
    // Guardar en Firestore
    await firestore.collection('metrics').add({
      timestamp: new Date(),
      duration,
      executionCount
    });

    res.send(`¡Hola desde Cloud Run! Tiempo: ${duration} ms`);
  } catch (e) {
    res.status(500).send('Error inesperado');
  } finally {
    isRunning = false;
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
