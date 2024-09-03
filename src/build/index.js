const fs = require("fs-extra");
const yaml = require("js-yaml");
const path = require("path");
const { buildPosts } = require("./posts");
const { buildPages } = require("./pages");

async function build() {
  console.log("Starting build process...");

  // Load configuration
  console.log("Loading configuration...");
  const config = yaml.load(await fs.readFile("config/site.yml", "utf8"));

  // Ensure public directory exists
  console.log("Preparing public directory...");
  await fs.ensureDir("public");

  // Build posts
  console.log("Building posts...");
  const posts = await buildPosts(config);

  // Build pages
  console.log("Building pages...");
  await buildPages(config, posts);

  // Generate search index
  console.log("Generating search index...");
  const searchIndex = posts.map((post) => ({
    title: post.title,
    description: post.description,
    url: post.url,
    categories: post.categories,
    date: post.date,
  }));
  await fs.writeJson(path.join("public", "search-index.json"), searchIndex);

  // Copy static assets if the directory exists
  console.log("Copying static assets...");
  const staticDir = path.join(process.cwd(), "static");
  if (await fs.pathExists(staticDir)) {
    await fs.copy(staticDir, "public", { overwrite: true });
  } else {
    console.log("Static directory does not exist. Skipping asset copy.");
  }

  console.log("Site built successfully!");
}

if (require.main === module) {
  build().catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
}

module.exports = { build };
