const fs = require("fs");
const axios = require("axios");
const decrypt = require('../utils/decrypt');
const isDiscordUserId = require('../utils/isDiscordUserId');

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(400).json({
    status: 400,
    message: "This endpoint only accept POST requests"
  });
  let token = req.body.token;
  let h_token = req.body.hyakanime_token;

  if (h_token === undefined) return res.status(400).json({
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

  axios.get("https://api.hyakanime.fr/user/complete-information", { headers: { "Authorization": `${h_token}` } }).then((response) => {
    let username = response.data.username;
    if (username === undefined) return res.status(400).json({
      status: 400,
      message: "Bad Request"
    });

    db[id].hyakanime = { username: username, link: `https://hyakanime.fr/profile/${username}` };
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
