const crypto = require("crypto");
require("dotenv").config();

module.exports = (text) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.AESKEY,'salt', 32);
  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}