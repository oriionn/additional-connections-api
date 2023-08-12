const fs = require("fs");
const axios = require("axios");
const decrypt = require('../utils/decrypt');
const isDiscordUserId = require('../utils/isDiscordUserId');

module.exports = {
  method: "POST",
  execute: (req, res) => {
    let token = req.body.token;
    let mt_token = req.body.monkeytype_token;

    if (mt_token === undefined) return res.status(400).json({
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

    axios.get(`https://api.monkeytype.com/users`, { headers: { "Authorization": "Bearer " + mt_token } }).then(resp => {
      let username = resp.data.data.name;

      if (username === undefined) return res.status(400).json({
        status: 400,
        message: "Bad Request"
      });

      db[id].monkeytype = { username: username, link: `https://monkeytype.com/profile/${username}` };
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