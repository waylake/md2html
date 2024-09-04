function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

function generateMetaDescription(content, length = 160) {
  return (
    content
      .replace(/\n/g, " ")
      .replace(/<[^>]*>/g, "")
      .slice(0, length)
      .trim() + "..."
  );
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

module.exports = {
  formatDate,
  truncate,
  generateMetaDescription,
  generateSlug,
};
