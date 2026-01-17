// Convert Ed25519 public key from JWK to base58 format for Ed25519VerificationKey2018

const crypto = require('crypto');

// The public key x value from our JWK
const publicKeyJwkX = 'Z0STXfp-6kS5Z5F11kZ-ROfPdTNWy09x0ZvtsnAfxrE';

// Convert base64url to base58
function base64urlToBuffer(base64url) {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

function bufferToBase58(buffer) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes = [...buffer];
  
  let num = BigInt('0x' + Buffer.from(bytes).toString('hex'));
  let result = '';
  
  while (num > 0n) {
    const remainder = num % 58n;
    num = num / 58n;
    result = ALPHABET[Number(remainder)] + result;
  }
  
  // Handle leading zeros
  for (const byte of bytes) {
    if (byte === 0) result = '1' + result;
    else break;
  }
  
  return result || '1';
}

// Convert
const publicKeyBuffer = base64urlToBuffer(publicKeyJwkX);
const publicKeyBase58 = bufferToBase58(publicKeyBuffer);

console.log('Public Key (base64url):', publicKeyJwkX);
console.log('Public Key (base58):', publicKeyBase58);
console.log('\nUse this value in your DID document for Ed25519VerificationKey2018');
