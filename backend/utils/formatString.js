const toTitleCase = (str) => {
  if (!str) return null;

  return str
    .toLowerCase()
    .split(' ')
    .filter(word => word)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getFirstWord = (str) => {
  if(!str) return null

  str = str.toLowerCase().split(' ')[0]
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = { toTitleCase, getFirstWord }