const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const fs = require("fs");

app.use(cors());
app.use(express.json());

const accounts = JSON.parse(fs.readFileSync("./db.json"));

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = accounts.balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (accounts.balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    accounts.balances[sender] -= amount;
    accounts.balances[recipient] += amount;
    res.send({ balance: accounts.balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!accounts[address]) {
    accounts[address] = 0;
  }
}
