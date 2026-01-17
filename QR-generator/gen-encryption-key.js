// Generate P-256 key pair for ECDH-ES encryption

const { generateKeyPair, exportJWK } = require('jose');

async function generateEncryptionKey() {
  // Generate P-256 key pair for ECDH-ES with extractable option
  const { publicKey, privateKey } = await generateKeyPair('ECDH-ES', { extractable: true });
  
  const publicJwk = await exportJWK(publicKey);
  const privateJwk = await exportJWK(privateKey);
  
  // Add required JWK fields
  publicJwk.use = 'enc';
  publicJwk.kid = 'enc-key-1';
  publicJwk.alg = 'ECDH-ES';
  
  privateJwk.use = 'enc';
  privateJwk.kid = 'enc-key-1';
  privateJwk.alg = 'ECDH-ES';
  
  console.log('\n=== Public JWK (for client_metadata.jwks) ===');
  console.log(JSON.stringify(publicJwk, null, 2));
  
  console.log('\n=== Private JWK (store securely for decryption) ===');
  console.log(JSON.stringify(privateJwk, null, 2));
  
  console.log('\n=== JWKS format for client_metadata ===');
  console.log(JSON.stringify({ keys: [publicJwk] }, null, 2));
}

generateEncryptionKey().catch(console.error);
