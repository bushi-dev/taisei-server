const http = require("http");
const url = require("url");
const db = require("./db");

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const path = reqUrl.pathname;

  res.setHeader("Content-Type", "application/json");

  if (path === "/show" && req.method === "GET") {
    const ip = req.socket.remoteAddress;
    db.get(`SELECT takara FROM items WHERE ip = ?`, [ip], (err, row) => {
      if (err) {
        console.error(err.message);
        res.writeHead(500);
        res.end(JSON.stringify({ message: "Server error" }));
        return;
      }
      if (row) {
        res.writeHead(200);
        res.end(row.takara);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Not found" }));
      }
    });
  } else if (path.startsWith("/add/") && req.method === "POST") {
    const ip = req.socket.remoteAddress;
    const id = path.split("/")[2];

    db.get(`SELECT takara FROM items WHERE ip = ?`, [ip], (err, row) => {
      if (err) {
        console.error(err.message);
        res.writeHead(500);
        res.end(JSON.stringify({ message: "Server error" }));
        return;
      }

      let takara = [];
      if (row) {
        takara = JSON.parse(row.takara);
      }

      takara.push(parseInt(id));

      db.run(
        `INSERT OR REPLACE INTO items (ip, takara) VALUES (?, ?)`,
        [ip, JSON.stringify(takara)],
        (err) => {
          if (err) {
            console.error(err.message);
            res.writeHead(500);
            res.end(JSON.stringify({ message: "Server error" }));
            return;
          }
          res.writeHead(200);
          res.end(JSON.stringify({ message: "Takara added" }));
        }
      );
    });
  } else if (path === "/test2" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({ message: "Test2 endpoint" }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Not found" }));
  }
});

server.listen(() => {
  console.log("Server listening");
});
