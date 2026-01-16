const { generateKeyPairSync } = require('crypto');
const { exportJWK } = require('jose');

(async () => {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = await exportJWK(privateKey);
  jwk.alg = 'ES256';
  jwk.use = 'sig';
  console.log(JSON.stringify(jwk, null, 2));
})();
