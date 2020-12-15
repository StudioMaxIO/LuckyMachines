const routes = require("next-routes")();

routes
  .add("/dashboard", "/")
  .add("/play/:address", "/play")
  .add("/new", "/factory");

module.exports = routes;
