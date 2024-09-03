function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

module.exports = {
  formatDate,
  truncate,
};
