const fs = require("fs-extra");
const yaml = require("js-yaml");
const path = require("path");
const { buildPosts } = require("./posts");
const { buildPages } = require("./pages");
const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");

async function generateSitemap(config, posts) {
  const links = [
    { url: "/", changefreq: "daily", priority: 1 },
    { url: "/about", changefreq: "monthly", priority: 0.8 },
    ...posts.map((post) => ({
      url: post.url,
      changefreq: "weekly",
      priority: 0.7,
    })),
  ];
  const stream = new SitemapStream({ hostname: config.siteUrl });
  const data = await streamToPromise(Readable.from(links).pipe(stream));
  await fs.writeFile("public/sitemap.xml", data);
}

async function copyImages() {
  const sourceDir = path.join(process.cwd(), "static", "images");
  const targetDir = path.join(process.cwd(), "public", "images");
  await fs.copy(sourceDir, targetDir);
}

async function build() {
  console.log("Starting build process...");

  // Load configuration
  const config = yaml.load(await fs.readFile("config/site.yml", "utf8"));

  await fs.ensureDir("public");

  // Build posts
  console.log("Building posts...");
  const posts = await buildPosts(config);

  // Build pages
  console.log("Building pages...");
  await buildPages(config, posts);

  await generateSitemap(config, posts);
  await fs.copy("static/robots.txt", "public/robots.txt");

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

  // Copy images
  await copyImages();

  console.log("Site built successfully!");
}

if (require.main === module) {
  build().catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
}

module.exports = { build };
