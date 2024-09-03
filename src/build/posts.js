const fs = require("fs-extra");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const hljs = require("highlight.js");
const ejs = require("ejs");
const helpers = require("../utils/helpers");

// Configure marked to use highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  },
});

async function buildPosts(config) {
  console.log("Building posts...");
  const contentDir = path.join(process.cwd(), "content");
  const posts = await walkDirectory(contentDir);

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const template = await fs.readFile("templates/post.ejs", "utf8");

  for (const post of posts) {
    const html = ejs.render(
      template,
      { post, config, helpers },
      { filename: "templates/post.ejs" },
    );
    await fs.outputFile(`public${post.url}.html`, html);
  }

  await fs.writeJson("public/posts.json", posts);
  console.log(`Built ${posts.length} posts`);
  return posts;
}

async function walkDirectory(dir, baseDir = dir) {
  let posts = [];
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      posts = posts.concat(await walkDirectory(fullPath, baseDir));
    } else if (path.extname(item) === ".md") {
      const content = await fs.readFile(fullPath, "utf8");
      const { data, content: markdownContent } = matter(content);
      const html = marked(markdownContent);

      // Generate URL based on file path
      const url = "/" + path.relative(baseDir, fullPath).replace(/\.md$/, "");

      posts.push({ ...data, content: html, url });
    }
  }

  return posts;
}

module.exports = { buildPosts };
