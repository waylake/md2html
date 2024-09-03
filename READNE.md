# MD2HTML - Simple Static Site Generator

MD2HTML is a lightweight static site generator that converts Markdown files into a fully functional blog website. It uses Node.js, EJS templates, and Bootstrap for styling.

## Features

- Convert Markdown to HTML
- Generate index pages for blog posts
- Create category pages
- Responsive design using Bootstrap
- Built-in development server

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/waylake/md2html.git
   cd md2html
   ```

2. Install dependencies:

   ```
   npm install
   ```

### Usage

1. Add your Markdown files to the `content/posts` directory.

2. Configure your site settings in `config/site.yml`.

3. Build the site:

   ```
   npm run build
   ```

4. Start the development server:

   ```
   npm run serve
   ```

5. Visit `http://localhost:3000` in your browser to see your site.

### Scripts

- `npm run build`: Build the static site
- `npm run serve`: Start the development server
- `npm start`: Build the site and start the server

## Project Structure

```
md2html/
├── config/
│   └── site.yml
├── content/
│   └── posts/
│       └── some-markdown-file-here.md
├── src/
│   ├── build/
│   │   ├── index.js
│   │   ├── posts.js
│   │   └── pages.js
│   ├── serve/
│   │   └── index.js
│   └── utils/
│       └── helpers.js
├── templates/
│   ├── layouts/
│   │   └── main.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── category.ejs
│   ├── index.ejs
│   ├── post.ejs
│   └── home.ejs
├── public/
│   └── (generated files)
├── package.json
└── README.md
```

## Customization

- Modify EJS templates in the `templates` directory to change the site's structure and design.
- Update styles by editing the Bootstrap classes or adding custom CSS.
- Extend functionality by adding new scripts in the `src` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
