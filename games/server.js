const { createServer } = require("http");
const next = require("next");

const app = next({
  dev: process.env.NODE_ENV !== "production"
});

const routes = require("./routes");
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }
  createServer(handler).listen(port, err => {
    if (err) throw err;
    console.log("Ready on localhost:", port);
  });
});
