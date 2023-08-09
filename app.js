const express = require('express');
const app = express();

const crypto = require("crypto");
require("dotenv").config();

function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.AESKEY,'salt', 32);
  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

function decrypt(encryptedText) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.AESKEY, 'salt', 32);
  const iv = Buffer.alloc(16, 0);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

function isDiscordUserId(id) {
  const discordIdRegex = /^[0-9]{17,20}$/;
  return discordIdRegex.test(id);
}

app.get('/', (req, res) => {
    res.json({
      status: 200,
      message: "API is running"
    })
});

app.get("/getUserKey", (req, res) => {
  let userId = req.query.id;
  let apiKey = req.query.key;

  if (userId === undefined || apiKey === undefined) return res.status(400).json({
    status: 400,
    message: "Bad Request"
  });
  if (isDiscordUserId(userId) === false) return res.status(400).json({
    status: 400,
    message: "Bad Request"
  });
  if (apiKey !== process.env.APIKEY) return res.status(401).json({
    status: 401,
    message: "Unauthorized"
  });

  let userKey = encrypt(userId);
  res.json({
    status: 200,
    message: userKey
  });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});