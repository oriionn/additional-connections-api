const fs = require("fs");
const axios = require("axios");
const decrypt = require('../utils/decrypt');
const isDiscordUserId = require('../utils/isDiscordUserId');

module.exports = {
  method: "POST",
  execute: (req, res) => {
    let token = req.body.token;
    let m_token = req.body.mangacollec_token;

    if (m_token === undefined) return res.status(400).json({
      status: 400,
      message: "Bad Request"
    });
    if (token === undefined) return res.status(400).json({
      status: 400,
      message: "Bad Request"
    });

    let id = decrypt(token);
    if (isDiscordUserId(id) === false) return res.status(400).json({
      status: 400,
      message: "Bad Request"
    });

    let db = JSON.parse(fs.readFileSync(process.env.DB_PATH));
    if (!db[id]) {
      db[id] = {}
    }

    axios.get("https://api.mangacollec.com/v1/users/me", { headers: { "Authorization": `Bearer ${m_token}` } }).then((response) => {
      let username = response.data.username;
      if (username === undefined) return res.status(400).json({
        status: 400,
        message: "Bad Request"
      });

      db[id].mangacollec = { username: username, link: `https://www.mangacollec.com/user/${username}/collection` };
      fs.writeFileSync(process.env.DB_PATH, JSON.stringify(db));
      res.json({
        status: 200,
        message: "OK"
      })
    }).catch((err) => {
      res.status(400).json({
        status: 400,
        message: "Bad Request"
      });
    })
  }
}