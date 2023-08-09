module.exports = (id) => {
  const discordIdRegex = /^[0-9]{17,20}$/;
  return discordIdRegex.test(id);
}