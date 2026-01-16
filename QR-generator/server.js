// Simple Express server to handle client_id and request_uri endpoints
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Endpoint for client_id verification
app.get('/client_id', (req, res) => {
  const clientId = req.query.client_id;
  console.log('Received client_id:', clientId);
  res.json({ status: 'ok', client_id: clientId });
});

// Endpoint for request_uri verification
app.get('/request_uri', (req, res) => {
  const requestUri = req.query.request_uri;
  console.log('Received request_uri:', requestUri);
  res.json({ status: 'ok', request_uri: requestUri });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
