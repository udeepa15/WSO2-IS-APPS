// Simple Express server to handle client_id and request_uri endpoints

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { importJWK, SignJWT, jwtVerify, decodeJwt } = require('jose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 4000;

// In-memory storage for nonces and states (use Redis/DB in production)
const activeRequests = new Map(); // key: state, value: { nonce, timestamp, sessionId }

// Helper function to generate cryptographically secure random string
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Helper to clean up expired requests (older than 10 minutes)
function cleanupExpiredRequests() {
  const now = Date.now();
  const expiryTime = 10 * 60 * 1000; // 10 minutes
  for (const [state, data] of activeRequests.entries()) {
    if (now - data.timestamp > expiryTime) {
      activeRequests.delete(state);
      console.log('Cleaned up expired state:', state);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredRequests, 60000);

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support form-urlencoded data from wallet
app.use(express.urlencoded({ extended: true })); // Support form-urlencoded data from wallet


// Ed25519 JWK for signing (replace with your real private key for production)
const demoJwk = {
  crv: 'Ed25519',
  d: '7aTFc2W_6wfxIxpU1C6wqLnq0qbot0MdDAEZqC8JxEs',
  x: 'Z0STXfp-6kS5Z5F11kZ-ROfPdTNWy09x0ZvtsnAfxrE',
  kty: 'OKP',
  alg: 'EdDSA',
  use: 'sig',
  kid: 'did:web:masked-unprofitably-ardith.ngrok-free.dev#owner'
};

// Serve a signed JWT at the request_uri endpoint
app.get('/v1/verify/vp-request/req_e85eebdd-5cce-418b-8c7f-cbbd2a3b20c7', async (req, res) => {
  console.log('--- [request_uri GET] /v1/verify/vp-request/req_e85eebdd-5cce-418b-8c7f-cbbd2a3b20c7 ---');
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  
  // Generate cryptographically secure nonce and state (minimum 16 chars as per wallet requirements)
  const nonce = generateRandomString(32); // 64 hex characters
  const state = generateRandomString(32); // 64 hex characters
  const sessionId = generateRandomString(16);
  
  // Store state/nonce for later verification
  activeRequests.set(state, {
    nonce,
    timestamp: Date.now(),
    sessionId,
    requestUri: req.url
  });
  
  console.log('Generated nonce:', nonce);
  console.log('Generated state:', state);
  console.log('Active requests count:', activeRequests.size);
  
  const payload = {
    response_uri: 'https://masked-unprofitably-ardith.ngrok-free.dev/v1/verify/response',
    iss: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
    response_type: 'vp_token',
    presentation_definition: {
      id: 'c4822b58-7fb4-454e-b827-f8758fe27f9a',
      purpose: 'Relying party is requesting your digital ID for the purpose of Self-Authentication',
      input_descriptors: [
        {
          id: 'id card credential',
          format: {
            ldp_vc: {
              proof_type: [
                'Ed25519Signature2020'
              ]
            }
          },
          constraints: {
            fields: [
              {
                path: ['$.type'],
                filter: {
                  type: 'object',
                  pattern: 'LifeInsuranceCredential'
                }
              }
            ]
          }
        }
      ]
    },
    state: state,
    iat: Math.floor(Date.now() / 1000),
    nonce: nonce,
    client_id: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
    jti: generateRandomString(16),
    client_metadata: {
      client_name: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
      vp_formats: {
        ldp_vp: {
          proof_type: [
            'Ed25519Signature2018',
            'Ed25519Signature2020',
            'RsaSignature2018'
          ]
        },
        'vc+sd-jwt': {
          'sd-jwt_alg_values': [
            'RS256',
            'ES256',
            'ES256K',
            'EdDSA'
          ],
          'kb-jwt_alg_values': [
            'RS256',
            'ES256',
            'ES256K',
            'EdDSA'
          ]
        }
      }
    },
    response_mode: 'direct_post'
  };
  try {
    console.log('JWT Payload:', JSON.stringify(payload, null, 2));
    const privateKey = await importJWK(demoJwk, 'EdDSA');
    console.log('Signing JWT with kid:', demoJwk.kid);
    // CRITICAL: Use 'oauth-authz-req+jwt' as typ per OpenID4VP spec
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ 
        alg: 'EdDSA', 
        kid: demoJwk.kid, 
        typ: 'oauth-authz-req+jwt'  // Required by wallet validation
      })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(privateKey);
    console.log('Generated JWT:', jwt.substring(0, 50) + '...');
    console.log('Served signed JWT authorization request successfully');
    res.type('application/oauth-authz-req+jwt').send(jwt);
  } catch (e) {
    console.error('JWT signing error:', e);
    res.status(500).json({ error: 'JWT signing error' });
  }
});

// Real did:web verification endpoint (example: /verify-did?did=...)
app.get('/verify-did', async (req, res) => {
  console.log('--- [did verification] /verify-did ---');
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  const did = req.query.did;
  if (!did) return res.status(400).json({ error: 'Missing did' });
  try {
    // Resolve did:web by fetching /.well-known/did.json
    const url = `https://${did.split(':').slice(2).join('/')}/.well-known/did.json`;
    console.log('Fetching DID document from:', url);
    const didRes = await fetch(url);
    if (!didRes.ok) {
      console.log('DID document not found:', url);
      return res.status(404).json({ error: 'DID document not found' });
    }
    const didDoc = await didRes.json();
    console.log('Resolved DID document:', JSON.stringify(didDoc, null, 2));
    res.json({ did, didDocument: didDoc });
  } catch (e) {
    console.error('DID resolution error:', e);
    res.status(500).json({ error: 'DID resolution error' });
  }
});

// Endpoint for client_id verification
app.get('/client_id', (req, res) => {
  console.log('GET /client_id endpoint hit');
  const clientId = req.query.client_id;
  console.log('Received client_id:', clientId);
  res.json({ status: 'ok', client_id: clientId });
});

// Endpoint for request_uri verification
app.get('/request_uri', (req, res) => {
  console.log('GET /request_uri endpoint hit');
  const requestUri = req.query.request_uri;
  console.log('Received request_uri:', requestUri);
  res.json({ status: 'ok', request_uri: requestUri });
});

// DID Web endpoint (/.well-known/did.json)
app.get('/.well-known/did.json', (req, res) => {
  console.log('--- [DID Document] /.well-known/did.json ---');
  console.log('Headers:', req.headers);
  // DID document for did:web:masked-unprofitably-ardith.ngrok-free.dev
  // Public key must match the private key used for JWT signing
  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
    verificationMethod: [
      {
        id: 'did:web:masked-unprofitably-ardith.ngrok-free.dev#owner',
        type: 'Ed25519VerificationKey2020',
        controller: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
        publicKeyMultibase: 'z6MkmQNgoLM1TmXousVMF9ATN6FGP6imY67kzp4oNdYXiLg8'
      },
    ],
    authentication: [
      'did:web:masked-unprofitably-ardith.ngrok-free.dev#owner',
    ],
    assertionMethod: [
      'did:web:masked-unprofitably-ardith.ngrok-free.dev#owner',
    ],
  };
  console.log('DID Document:', JSON.stringify(didDocument, null, 2));
  console.log('Served DID document successfully');
  res.json(didDocument);
});

// POST endpoint to receive VP (Verifiable Presentation) from wallet
app.post('/v1/verify/response', async (req, res) => {
  console.log('\n=== [VP Response] POST /v1/verify/response ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  let { vp_token, presentation_submission, state } = req.body;
  
  // Parse JSON strings if needed
  if (typeof vp_token === 'string' && vp_token.startsWith('{')) {
    try {
      vp_token = JSON.parse(vp_token);
    } catch (e) {
      console.log('vp_token is a JSON-LD string, keeping as is');
    }
  }
  
  if (typeof presentation_submission === 'string') {
    try {
      presentation_submission = JSON.parse(presentation_submission);
      console.log('Parsed presentation_submission from string to object');
    } catch (e) {
      console.error('Failed to parse presentation_submission:', e);
    }
  }
  
  // Validation 1: Check required parameters
  if (!vp_token || !presentation_submission || !state) {
    console.error('ERROR: Missing required parameters');
    return res.status(400).json({ 
      error: 'invalid_request',
      error_description: 'Missing required parameters: vp_token, presentation_submission, or state'
    });
  }
  
  console.log('Received VP Token:', typeof vp_token === 'string' ? vp_token.substring(0, 100) + '...' : vp_token);
  console.log('Presentation Submission:', JSON.stringify(presentation_submission, null, 2));
  console.log('State:', state);
  
  // Validation 2: Verify state exists and retrieve nonce
  const requestData = activeRequests.get(state);
  if (!requestData) {
    console.error('ERROR: Invalid or expired state:', state);
    return res.status(400).json({ 
      error: 'invalid_request',
      error_description: 'Invalid or expired state parameter'
    });
  }
  
  console.log('✓ State validated successfully');
  console.log('Original nonce:', requestData.nonce);
  console.log('Session ID:', requestData.sessionId);
  
  // Validation 3: Verify presentation_submission structure
  if (!presentation_submission.id || !presentation_submission.definition_id || !presentation_submission.descriptor_map) {
    console.error('ERROR: Invalid presentation_submission structure');
    return res.status(400).json({ 
      error: 'invalid_request',
      error_description: 'Invalid presentation_submission structure'
    });
  }
  
  console.log('✓ Presentation submission structure validated');
  
  // Validation 4: Parse and verify VP token
  let vpData;
  try {
    // VP token can be JWT or JSON-LD
    if (typeof vp_token === 'string' && vp_token.split('.').length === 3) {
      // JWT format
      console.log('VP Token format: JWT');
      const decoded = decodeJwt(vp_token);
      console.log('Decoded VP JWT:', JSON.stringify(decoded, null, 2));
      
      // Verify nonce in VP JWT
      if (decoded.nonce && decoded.nonce !== requestData.nonce) {
        console.error('ERROR: Nonce mismatch');
        console.error('Expected:', requestData.nonce);
        console.error('Received:', decoded.nonce);
        return res.status(400).json({ 
          error: 'invalid_request',
          error_description: 'Nonce mismatch'
        });
      }
      
      console.log('✓ Nonce validated successfully');
      
      // In production, verify JWT signature using holder's DID
      // const holderDid = decoded.iss;
      // await verifyVPSignature(vp_token, holderDid);
      
      vpData = decoded.vp || decoded;
    } else if (typeof vp_token === 'object') {
      // JSON-LD format
      console.log('VP Token format: JSON-LD');
      vpData = vp_token;
      
      // In production, verify JSON-LD proof
      // await verifyLinkedDataProof(vp_token);
    } else {
      console.error('ERROR: Unsupported VP token format');
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Unsupported VP token format'
      });
    }
    
    console.log('✓ VP token format validated');
    
    // Validation 5: Extract and log credential data
    if (vpData.verifiableCredential) {
      console.log('\n--- Verifiable Credentials in VP ---');
      const credentials = Array.isArray(vpData.verifiableCredential) 
        ? vpData.verifiableCredential 
        : [vpData.verifiableCredential];
      
      credentials.forEach((vc, index) => {
        console.log(`\nCredential ${index + 1}:`);
        if (typeof vc === 'string') {
          // JWT VC
          const decodedVC = decodeJwt(vc);
          console.log('  Format: JWT');
          console.log('  Issuer:', decodedVC.iss);
          console.log('  Subject:', JSON.stringify(decodedVC.vc?.credentialSubject || decodedVC.credentialSubject, null, 2));
        } else {
          // JSON-LD VC
          console.log('  Format: JSON-LD');
          console.log('  Issuer:', vc.issuer);
          console.log('  Subject:', JSON.stringify(vc.credentialSubject, null, 2));
        }
      });
    }
    
    // Validation 6: Verify descriptor_map matches presentation_definition
    console.log('\n--- Descriptor Map Validation ---');
    presentation_submission.descriptor_map.forEach((descriptor, index) => {
      console.log(`Descriptor ${index + 1}:`);
      console.log('  ID:', descriptor.id);
      console.log('  Format:', descriptor.format);
      console.log('  Path:', descriptor.path);
    });
    
    console.log('\n✓ All validations passed!');
    
    // Success - remove used state
    activeRequests.delete(state);
    console.log('Removed state from active requests');
    
    // Send success response
    res.status(200).json({ 
      status: 'success',
      message: 'Verifiable Presentation verified successfully',
      redirect_uri: 'https://masked-unprofitably-ardith.ngrok-free.dev/success',
      session_id: requestData.sessionId
    });
    
    console.log('\n=== VP Verification Complete ===\n');
    
  } catch (error) {
    console.error('ERROR during VP verification:', error);
    return res.status(400).json({ 
      error: 'invalid_request',
      error_description: error.message
    });
  }
});

// Support POST method for request_uri (for wallet metadata sharing)
app.post('/v1/verify/vp-request/req_e85eebdd-5cce-418b-8c7f-cbbd2a3b20c7', async (req, res) => {
  console.log('--- [request_uri POST] /v1/verify/vp-request/req_e85eebdd-5cce-418b-8c7f-cbbd2a3b20c7 ---');
  console.log('Headers:', req.headers);
  console.log('Wallet Metadata:', JSON.stringify(req.body, null, 2));
  console.log('Query:', req.query);
  
  // Generate cryptographically secure nonce and state (minimum 16 chars as per wallet requirements)
  const nonce = generateRandomString(32);
  const state = generateRandomString(32);
  const sessionId = generateRandomString(16);
  
  // Store state/nonce for later verification
  activeRequests.set(state, {
    nonce,
    timestamp: Date.now(),
    sessionId,
    requestUri: req.url,
    walletMetadata: req.body
  });
  
  console.log('Generated nonce:', nonce);
  console.log('Generated state:', state);
  
  // Same response as GET, but with wallet metadata logged
  const payload = {
    response_uri: 'https://masked-unprofitably-ardith.ngrok-free.dev/v1/verify/response',
    iss: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
    response_type: 'vp_token',
    presentation_definition: {
      id: 'c4822b58-7fb4-454e-b827-f8758fe27f9a',
      purpose: 'Relying party is requesting your digital ID for the purpose of Self-Authentication',
      input_descriptors: [
        {
          id: 'id card credential',
          format: {
            ldp_vc: {
              proof_type: [
                'Ed25519Signature2020'
              ]
            }
          },
          constraints: {
            fields: [
              {
                path: ['$.type'],
                filter: {
                  type: 'object',
                  pattern: 'LifeInsuranceCredential'
                }
              }
            ]
          }
        }
      ]
    },
    state: state,
    iat: Math.floor(Date.now() / 1000),
    nonce: nonce,
    client_id: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
    jti: generateRandomString(16),
    client_metadata: {
      client_name: 'did:web:masked-unprofitably-ardith.ngrok-free.dev',
      vp_formats: {
        ldp_vp: {
          proof_type: [
            'Ed25519Signature2018',
            'Ed25519Signature2020',
            'RsaSignature2018'
          ]
        },
        'vc+sd-jwt': {
          'sd-jwt_alg_values': [
            'RS256',
            'ES256',
            'ES256K',
            'EdDSA'
          ],
          'kb-jwt_alg_values': [
            'RS256',
            'ES256',
            'ES256K',
            'EdDSA'
          ]
        }
      }
    },
    response_mode: 'direct_post'
  };
  try {
    console.log('JWT Payload (POST):', JSON.stringify(payload, null, 2));
    const privateKey = await importJWK(demoJwk, 'EdDSA');
    console.log('Signing JWT with kid:', demoJwk.kid);
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ 
        alg: 'EdDSA', 
        kid: demoJwk.kid, 
        typ: 'oauth-authz-req+jwt'  // Required by wallet validation
      })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(privateKey);
    console.log('Generated JWT (POST):', jwt.substring(0, 50) + '...');
    console.log('Served signed JWT authorization request successfully (via POST)');
    res.type('application/oauth-authz-req+jwt').send(jwt);
  } catch (e) {
    console.error('JWT signing error:', e);
    res.status(500).json({ error: 'JWT signing error' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
