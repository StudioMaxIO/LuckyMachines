const routes = require("next-routes")();

routes
  .add("/dashboard", "/")
  .add("/play/:address/g/:gameID", "/play")
  .add("/play/:address", "/play")
  .add("/play", "/load")
  .add("/new", "/factory");

module.exports = routes;
