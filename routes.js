const routes = require("next-routes")();

routes
  .add("/dashboard", "/")
  .add("/play/:address/g/:gameID", "/play")
  .add("/play/:address", "/play")
  .add("/play", "/load")
  .add("/operate/:address/invalid", "/invalid-operator")
  .add("/operate/:address", "/operate")
  .add("/operate", "/load-operator")
  .add("/new", "/factory");

module.exports = routes;
