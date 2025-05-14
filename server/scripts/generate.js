const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const fs = require("fs");
const path = require("path");

function generateKeys() {
  const privateKey = toHex(secp.utils.randomPrivateKey());
  const publicKey = toHex(secp.getPublicKey(privateKey));
  return { privateKey, publicKey };
}

const createThreeUsers = () => {
  const keyPairs = [...Array(3)].map(() => generateKeys());
  return keyPairs;
};

// Format users for db.json - add balances and addresses based on public keys
const formatUsersForDB = (keyPairs) => {
  // Create object with public keys as addresses and initial balances
  const balances = {};
  const users = [];

  keyPairs.forEach((pair, index) => {
    // Use the last 20 bytes of public key as the Ethereum address with 0x prefix
    const address = `0x${pair.publicKey.slice(-40)}`;
    balances[address] = 100; // Give each user 100 initial balance
    
    // Store the full user data for convenient reference
    users.push({
      privateKey: pair.privateKey,
      publicKey: pair.publicKey,
      address: address,
      balance: 100,
    });
  });

  // Return data structure suited for db.json
  return { balances, users };
};

// Generate the data
const keyPairs = createThreeUsers();
const data = formatUsersForDB(keyPairs);

// Save to db.json
const dbPath = path.join(__dirname, "../db.json");
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

console.log("Generated users and saved to db.json:");
console.log(JSON.stringify(data.users, null, 2));
console.log("\nNOTE: Keep the private keys secure! They are stored in db.json for development purposes only.");
