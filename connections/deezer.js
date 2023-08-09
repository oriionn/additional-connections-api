const fs = require("fs");
const axios = require("axios");
const decrypt = require('../utils/decrypt');
const isDiscordUserId = require('../utils/isDiscordUserId');

module.exports = (req, res) => {
  if (req.method !== "GET") return res.status(400).json({
    status: 400,
    message: "This endpoint only accept GET requests"
  });
  let { code } = req.query;
  let token = '';

  if (!code) return res.status(400).json({
    status: 400,
    message: "\"code\" query parameter is missing"
  });

  let id = decrypt(token);
  if (isDiscordUserId(id) === false) return res.status(400).json({
    status: 400,
    message: "Invalid token"
  });

  let db = JSON.parse(fs.readFileSync(process.env.DB_PATH).toString());
  if (!db[id]) db[id] = {};

  axios.get(`https://connect.deezer.com/oauth/access_token.php?app_id=625784&secret=c1468059fe0a1de8f1e31b51d3cb1c2b&code=${code}&output=json`).then((response) => {
    let { access_token: token } = response.data;
    if (!token) return res.status(400).json({
      status: 400,
      message: "Authorization failed"
    });

    axios.get(`https://api.deezer.com/user/me?access_token=${token}`).then((response) => {
      const { data } = response;
      db[id].deezer = { id: data.id, name: data.name, link: data.link };
      fs.writeFileSync(process.env.DB_PATH, JSON.stringify(db));
      res.json({
        status: 200,
        message: "OK"
      })
    });
  }).catch((err) => {
    res.status(400).json({
      status: 400,
      message: "Bad Request"
    });
  })
}
