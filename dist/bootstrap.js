"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _utils = require("./utils");

var _routes = _interopRequireDefault(require("./routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _default(app) {
  app.use(_bodyParser["default"].json());
  app.use(_bodyParser["default"].urlencoded({
    extended: true
  })); // Routes

  app.use(_routes["default"]); // 404

  app.use(function (req, res) {
    res.status(404).send({
      status: 404,
      message: 'The requested resource was not found'
    });
  }); // 5xx

  app.use(function (err, req, res) {
    _utils.log.error(err.stack);

    var message = process.env.NODE_ENV === 'production' ? 'Something went wrong, we\'re looking into it...' : err.stack;
    res.status(500).send({
      status: 500,
      message: message
    });
  });
}