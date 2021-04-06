const routes = require("next-routes")();

routes
  .add("/games", "/")
  .add("/rock-paper-scissors/g/:gameID", "/rock-paper-scissors");

module.exports = routes;
