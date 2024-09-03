const express = require("express");
const path = require("path");

function serve() {
  const app = express();
  const publicDir = path.join(process.cwd(), "public");

  app.use(express.static(publicDir));

  app.get("*", (req, res, next) => {
    let filePath = path.join(publicDir, req.path);

    // If the path doesn't end with .html, try adding it
    if (!filePath.endsWith(".html")) {
      filePath += ".html";
    }

    res.sendFile(filePath, (err) => {
      if (err) {
        // If the file doesn't exist, try serving the 404 page
        res.status(404).sendFile(path.join(publicDir, "404.html"));
      }
    });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

if (require.main === module) {
  serve();
}

module.exports = { serve };
