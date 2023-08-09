const express = require('express');
const app = express();
app.use(express.json());

const decrypt = require("./utils/decrypt");
const encrypt = require("./utils/encrypt");
const isDiscordUserId = require("./utils/isDiscordUserId");
const removeFileExtension = require("./utils/removeFileExtension");
const fs = require("fs");
require("dotenv").config();

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

app.get("/connections", (req, res) => {
  let id = req.query.id;
  if (id === undefined) return res.status(400).json({
    status: 400,
    message: "Bad Request"
  });

  if (isDiscordUserId(id) === false) return res.status(400).json({
    status: 400,
    message: "Bad Request"
  })

  let db = JSON.parse(fs.readFileSync(process.env.DB_PATH));
  if (!db[id]) {
    db[id] = {}
    fs.writeFileSync(process.env.DB_PATH, JSON.stringify(db));
  }

  res.json({
    status: 200,
    message: db[id]
  })
})

fs.readdirSync("./connections").forEach(file => {
  app.all(`/connections/${removeFileExtension(file)}`, require(`./connections/${file}`));
})

/* app.post("/connections", (req, res) => {

}) */

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});
