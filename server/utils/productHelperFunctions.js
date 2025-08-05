function generateSKU(title, size, color) {
  return `${title.slice(0, 3).toUpperCase()}-${size.toUpperCase()}-${color.toUpperCase()}`;
}


module.exports = {generateSKU};