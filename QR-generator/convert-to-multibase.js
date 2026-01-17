// Convert Ed25519 public key from JWK to multibase format

// The public key x value from our JWK
const publicKeyJwkX = 'Z0STXfp-6kS5Z5F11kZ-ROfPdTNWy09x0ZvtsnAfxrE';

// Convert base64url to buffer
function base64urlToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

// Convert buffer to base58btc
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
  
  for (const byte of bytes) {
    if (byte === 0) result = '1' + result;
    else break;
  }
  
  return result || '1';
}

// Ed25519 public keys in multibase format use:
// - Multicodec prefix 0xed01 for Ed25519 public key
// - Base58btc encoding with 'z' prefix
const publicKeyBuffer = base64urlToBuffer(publicKeyJwkX);

// Add multicodec prefix for Ed25519 public key (0xed 0x01)
const prefixedBuffer = Buffer.concat([
  Buffer.from([0xed, 0x01]),
  publicKeyBuffer
]);

const base58 = bufferToBase58(prefixedBuffer);
const multibase = 'z' + base58;

console.log('Public Key (JWK x):', publicKeyJwkX);
console.log('Public Key (multibase):', multibase);
console.log('\nUse this in your DID document for Ed25519VerificationKey2020');
