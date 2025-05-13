const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();

const publicKey = secp.getPublicKey(privateKey);

console.log("private key", toHex(privateKey));
console.log("public key", `0x${toHex(publicKey).slice(-20)}`);
