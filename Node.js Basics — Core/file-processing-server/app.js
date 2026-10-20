const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);

  // Home route
  if (req.url === "/") {
    res.setHeader("Content-Type", "text/html");

    res.write("<h1>File Processing Server</h1>");
    res.write("<p>Try /file or /file-blocking</p>");

    return res.end();
  }

  // Non-blocking file reading
  if (req.url === "/file") {
    console.log("1. Starting async file read");

    fs.readFile("data.txt", "utf8", (err, data) => {
      if (err) {
        res.statusCode = 500;
        return res.end("Failed to read file");
      }

      console.log("3. Async file callback executing");

      res.setHeader("Content-Type", "text/plain");
      res.end(data);
    });

    console.log("2. JavaScript continues");

    return;
  }

  // Blocking file reading
  if (req.url === "/file-blocking") {
    console.log("1. Starting blocking file read");

    const data = fs.readFileSync("data.txt", "utf8");

    console.log("2. Blocking file read finished");

    res.setHeader("Content-Type", "text/plain");

    return res.end(data);
  }

  // 404
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain");
  res.end("Page not found");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});