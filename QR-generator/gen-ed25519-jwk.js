// Generate Ed25519 JWK for OpenID4VP
const { generateKeyPairSync } = require('crypto');
const { exportJWK } = require('jose');

(async () => {
  console.log('Generating Ed25519 keypair...');
  
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  
  // Export as JWK
  const privateJwk = await exportJWK(privateKey);
  const publicJwk = await exportJWK(publicKey);
  
  // Add metadata
  privateJwk.alg = 'EdDSA';
  privateJwk.use = 'sig';
  privateJwk.kid = 'did:web:masked-unprofitably-ardith.ngrok-free.dev#owner';
  
  console.log('\n=== Ed25519 Private JWK (use this in server.js) ===');
  console.log(JSON.stringify(privateJwk, null, 2));
  
  console.log('\n=== Ed25519 Public JWK (for DID document) ===');
  publicJwk.alg = 'EdDSA';
  publicJwk.use = 'sig';
  console.log(JSON.stringify(publicJwk, null, 2));
})();
