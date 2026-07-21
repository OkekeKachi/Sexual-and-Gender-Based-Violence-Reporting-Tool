// utils/hashPin.js
const bcrypt = require("bcrypt");

async function hashPin(pin) {
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
}

module.exports = hashPin;