const secp = require("ethereum-cryptography/secp256k1");

function generateSignature(message, privateKey) {
  const hash = keccak256(message);
  const signature = secp.sign(hash, privateKey, {
    recovery: false,
  });
  return signature;
}
