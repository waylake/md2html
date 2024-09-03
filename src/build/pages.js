const fs = require("fs-extra");
const ejs = require("ejs");
const path = require("path");
const helpers = require("../utils/helpers");

async function buildPages(config, posts) {
  console.log("Building pages...");
  const templates = {
    home: await fs.readFile("templates/home.ejs", "utf8"),
    index: await fs.readFile("templates/index.ejs", "utf8"),
    category: await fs.readFile("templates/category.ejs", "utf8"),
    pagination: await fs.readFile("templates/pagination.ejs", "utf8"),
  };

  // Build home page
  const homeHtml = ejs.render(
    templates.home,
    { config, posts: posts.slice(0, 5), helpers },
    { filename: "templates/home.ejs" },
  );
  await fs.outputFile("public/index.html", homeHtml);

  // Build 404 page
  const notFoundTemplate = await fs.readFile("templates/404.ejs", "utf8");
  const notFoundHtml = ejs.render(
    notFoundTemplate,
    { config, title: "404 Not Found" },
    { filename: "templates/404.ejs" },
  );
  await fs.outputFile("public/404.html", notFoundHtml);

  // Build paginated blog index pages
  const postsPerPage = config.postsPerPage || 10;
  const totalPages = Math.ceil(posts.length / postsPerPage);

  for (let page = 1; page <= totalPages; page++) {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const pagePosts = posts.slice(startIndex, endIndex);

    const paginationHtml = ejs.render(
      templates.pagination,
      {
        config,
        posts: pagePosts,
        currentPage: page,
        totalPages,
        helpers,
      },
      { filename: "templates/pagination.ejs" },
    );

    if (page === 1) {
      await fs.outputFile("public/blog/index.html", paginationHtml);
    }
    await fs.outputFile(`public/blog/page/${page}.html`, paginationHtml);
  }

  // Build category pages (with pagination)
  const categories = [
    ...new Set(posts.flatMap((post) => post.categories || [])),
  ];
  for (const category of categories) {
    const categoryPosts = posts.filter(
      (post) => post.categories && post.categories.includes(category),
    );
    const categoryTotalPages = Math.ceil(categoryPosts.length / postsPerPage);

    for (let page = 1; page <= categoryTotalPages; page++) {
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const categoryPagePosts = categoryPosts.slice(startIndex, endIndex);

      const categoryHtml = ejs.render(
        templates.category,
        {
          config,
          category,
          posts: categoryPagePosts,
          currentPage: page,
          totalPages: categoryTotalPages,
          helpers,
        },
        { filename: "templates/category.ejs" },
      );

      if (page === 1) {
        await fs.outputFile(
          `public/category/${category}/index.html`,
          categoryHtml,
        );
      }
      await fs.outputFile(
        `public/category/${category}/page/${page}.html`,
        categoryHtml,
      );
    }
  }

  // Generate search index
  const searchIndex = posts.map((post) => ({
    title: post.title,
    description: post.description,
    url: post.url,
    categories: post.categories,
    date: post.date,
  }));
  await fs.writeJson("public/search-index.json", searchIndex);

  console.log("Pages built successfully");
}

module.exports = { buildPages };
