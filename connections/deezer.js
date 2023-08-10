const fs = require("fs");
const axios = require("axios");
const decrypt = require('../utils/decrypt');
const isDiscordUserId = require('../utils/isDiscordUserId');

require("dotenv").config();

module.exports = (req, res) => {
  if (req.method.toLowerCase() === "get") {
    let { code, token } = req.query;

    if (!code) return res.status(400).json({
      status: 400,
      message: "\"code\" query parameter is missing"
    });

    if (!token) return res.send(JSON.stringify({
      status: 400,
      message: "\"token\" query parameter is missing"
    }));

    let id = decrypt(token);
    if (isDiscordUserId(id) === false) return res.status(400).json({
      status: 400,
      message: "Invalid token"
    });

    let db = JSON.parse(fs.readFileSync(process.env.DB_PATH).toString());
    if (!db[id]) db[id] = {};

    axios.get(`https://connect.deezer.com/oauth/access_token.php?app_id=${process.env.DEEZER_APPID}&secret=${process.env.DEEZER_SECRET}&code=${code}&output=json`).then((response) => {
      let { access_token: token } = response.data;
      if (!token) return res.status(400).render("authorizedfailed", { oauthname: "Deezer" });

      axios.get(`https://api.deezer.com/user/me?access_token=${token}`).then((response) => {
        const { data } = response;
        db[id].deezer = { id: data.id, name: data.name, link: data.link };
        fs.writeFileSync(process.env.DB_PATH, JSON.stringify(db));
        res.render("authorized", { oauthname: "Deezer" });
      });
    }).catch((err) => {
      res.status(400).json({
        status: 400,
        message: "Bad Request"
      });
    })
  } else if (req.method.toLowerCase() === "delete") {
    let token = req.body.token;

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

    db[id].deezer = undefined;
    fs.writeFileSync(process.env.DB_PATH, JSON.stringify(db));
    res.json({
        status: 200,
        message: "OK"
    })
  } else {
    return res.status(400).json({
      status: 400,
      message: "This endpoint only accept GET requests"
    });
  }
}
