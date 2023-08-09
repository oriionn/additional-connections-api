const crypto = require("crypto");
require("dotenv").config();

module.exports = (encryptedText) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.AESKEY, 'salt', 32);
  const iv = Buffer.alloc(16, 0);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}