// Simple Express server to handle client_id and request_uri endpoints
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
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


// DID Web endpoint (/.well-known/did.json)
app.get('/.well-known/did.json', (req, res) => {
  // Example DID document for did:web:masked-unprofitably-ardith.ngrok-free.dev
  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1'
    ],
    id: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
    verificationMethod: [
      {
        id: 'did:web:masked-unprofitably-ardith.ngrok-free.dev#owner',
        type: 'JsonWebKey2020',
        controller: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
        publicKeyJwk: {
          kty: 'EC',
          crv: 'P-256',
          x: 'example_x',
          y: 'example_y',
        },
      },
    ],
    authentication: [
      'did:web:masked-unprofitably-ardith.ngrok-free.dev#owner',
    ],
  };
  console.log('DID document served');
  res.json(didDocument);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
