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
  const staticImagesDir = path.join(process.cwd(), "static", "images");
  const posts = await walkDirectory(contentDir, staticImagesDir);

  // 필터링: about.md 파일을 제외한 나머지 포스트만 posts 리스트에 추가
  const filteredPosts = posts.filter((post) => !post.url.includes("/about"));

  // 날짜 순으로 포스트 정렬
  filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const template = await fs.readFile("templates/post.ejs", "utf8");

  // 모든 포스트에 대해 HTML 파일 생성
  for (const post of posts) {
    const html = ejs.render(
      template,
      { post, config, helpers },
      { filename: "templates/post.ejs" },
    );
    await fs.outputFile(`public${post.url}.html`, html);
  }

  // about.md 파일을 제외한 포스트들을 posts.json에 저장
  await fs.writeJson("public/posts.json", filteredPosts);

  console.log(`Built ${posts.length} posts (excluding about.md from listing)`);
  return filteredPosts;
}

async function walkDirectory(dir, staticImagesDir, baseDir = dir) {
  let posts = [];
  const items = await fs.readdir(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      posts = posts.concat(
        await walkDirectory(fullPath, staticImagesDir, baseDir),
      );
    } else if (path.extname(item) === ".md") {
      const content = await fs.readFile(fullPath, "utf8");
      const { data, content: markdownContent } = matter(content);

      // 이미지 경로 처리
      const postName = path.basename(item, ".md");
      const postImagesDir = path.join("images", "posts", postName);

      // image 처리
      if (data.image) {
        if (data.image.startsWith("static/images/")) {
          data.image = "/" + data.image.slice(7); // 'static/' 제거
        } else if (!data.image.startsWith("/")) {
          data.image = "/" + path.join(postImagesDir, data.image);
        }
      }
      // 이미지가 없는 경우 image 속성을 설정하지 않음

      // 마크다운 내용의 이미지 경로 수정
      const processedContent = markdownContent.replace(
        /!\[(.+)?\]\((?!http|https)(.+)\)/g,
        (match, alt, src) => {
          if (src.startsWith("static/images/")) {
            return `![${alt}](/${src.slice(7)})`;
          } else if (!src.startsWith("/")) {
            return `![${alt}](/${path.join(postImagesDir, src)})`;
          }
          return match;
        },
      );

      const html = marked(processedContent);

      // Generate URL based on file path
      const url = "/" + path.relative(baseDir, fullPath).replace(/\.md$/, "");
      posts.push({
        ...data,
        content: html,
        url,
        imagePath: "/" + postImagesDir,
      });
    }
  }
  return posts;
}

module.exports = { buildPosts };
