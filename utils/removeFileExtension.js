module.exports = (fileName) => {
  return fileName.split('.').slice(0, -1).join('.');
}