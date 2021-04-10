const routes = require("next-routes")();

routes
  .add("/games", "/")
  .add("/rock-paper-scissors/g/:gameID", "/rock-paper-scissors")
  .add("/pick3/g/:gameID", "/pick3");

module.exports = routes;
