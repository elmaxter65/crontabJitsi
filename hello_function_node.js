const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const firestore = new Firestore();
let executionCount = 0;
let isRunning = false;

const SECRET_KEY = process.env.JWT_SECRET || 'mysecret';
const API_KEY = process.env.API_KEY || 'myapikey';

// Middleware: validate JWT or API Key
authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];
  const apiKey = req.query.key;

  if (token) {
    jwt.verify(token, SECRET_KEY, (err) => {
      if (err) return res.status(403).send('Token inválido');
      return next();
    });
  } else if (apiKey === API_KEY) {
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
