const express = require('express');
const cors = require('cors')
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }))
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const pino = require('pino')
const pretty = require('pino-pretty')
const logger = pino(pretty())

const encrypt = require("./utils/encrypt");
const isDiscordUserId = require("./utils/isDiscordUserId");
const removeFileExtension = require("./utils/removeFileExtension");
const fs = require("fs");
const decrypt = require("./utils/decrypt");
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

app.get("/oauth2-link/:connection", (req, res) => {
  if(!process.env.DEEZER_APPID || !process.env.DEEZER_SECRET) return res.status(500).json({
    status: 500,
    message: "Deezer is not enable on this server."
  });
  const { connection } = req.params;
  const links = {
    deezer: `https://connect.deezer.com/oauth/auth.php?app_id=${process.env.DEEZER_APPID}&redirect_uri=${process.env.DEEZER_REDIRECT_URI}&perms=basic_access`
  };

  if (!links[connection]) return res.status(400).json({
    status: 400,
    message: "This connection has no OAuth2 URL or does not exists."
  });

  return res.status(200).json({
    status: 200,
    message: links[connection]
  })
});

const connections = [];
logger.info("Handling connections...");
fs.readdirSync("./connections").forEach(file => {
  if (!file.endsWith(".js")) return;
  connections.push(file);
  let connection = require(`./connections/${file}`);
  if (removeFileExtension(file) === "deezer") if (!process.env.DEEZER_APPID || !process.env.DEEZER_SECRET) return logger.warn("Deezer is not enable on this server.");
  if (connection.method.toLowerCase() === "get") {
    app.get(`/connections/${removeFileExtension(file)}`, connection.execute);
  } else if (connection.method.toLowerCase() === "post") {
    app.post(`/connections/${removeFileExtension(file)}`, connection.execute);
  }
  logger.info(`${file} loaded.`);
})

app.delete("/connections/:connection", (req, res) => {
  let token = req.body.token;
  let connection = req.params.connection;
  if (connections.includes(`${connection}.js`) === false) return res.status(400).json({
    status: 400,
    message: "Bad Request"
  });

  if (token === undefined) return res.status(400).json({
    status: 400,
    message: "Bad Request"
  })

  let id = decrypt(token);
  if (isDiscordUserId(id) === false) return res.status(400).json({
    status: 400,
    message: "Bad Request"
  });

  let db = JSON.parse(fs.readFileSync(process.env.DB_PATH));
  if (!db[id]) {
    db[id] = {}
  }

  db[id][connection] = undefined;
  fs.writeFileSync(process.env.DB_PATH, JSON.stringify(db));
  res.json({
    status: 200,
    message: "OK"
  })
})

app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server started on port ${process.env.PORT || 3000}`);
    if (process.env.APIKEY === "ui2P8GrL75") logger.warn("APIKEY is still default, please change it in .env file");
    if (process.env.AESKEY === "MrJ73Gp94g") logger.warn("AESKEY is still default, please change it in .env file");
    if (process.env.DB_PATH === "./db.example.json") logger.warn("DB_PATH is still default, please change it in .env file");
});
