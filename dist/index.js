"use strict";

require("@babel/polyfill");

var _config = _interopRequireDefault(require("config"));

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _bootstrap = _interopRequireDefault(require("./bootstrap"));

var _utils = require("./utils");

var _sheets = _interopRequireDefault(require("./google/sheets"));

var _utils2 = require("./slack/utils");

var _cron = require("./cron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var app = (0, _express["default"])();
app.start =
/*#__PURE__*/
_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  var port, server;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _utils.log.info('Starting Server now...');

          _cron.pollStartCrobJob.start();

          _cron.pollCloseCronJob.start(); //createPoll();
          // setTimeout( () => {
          //     log.info("closing poll");
          //     //closeOpenPolls();
          // }, 12000 )


          _utils.log.info((0, _utils.getDateStr)());

          port = _config["default"].get('common.port');
          app.set('port', port);
          (0, _bootstrap["default"])(app);
          server = _http["default"].createServer(app);
          server.on('error', function (error) {
            if (error.syscall !== 'listen') throw error;

            _utils.log.error("Failed to start server: ".concat(error));

            process.exit(1);
          });
          server.on('listening', function () {
            var address = server.address();

            _utils.log.info("Server listening ".concat(address.address, ":").concat(address.port));
          });
          server.listen(port);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));
app.start()["catch"](function (err) {
  _utils.log.error(err);
});