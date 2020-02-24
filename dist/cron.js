"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pollCloseCronJob = exports.pollStartCrobJob = void 0;

var _config = _interopRequireDefault(require("config"));

var _cron = require("cron");

var _utils = require("./utils");

var _utils2 = require("./slack/utils");

var _sheets = require("./google/sheets");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var pollStartCrobJob = new _cron.CronJob(_config["default"].get('common.pollStartSchedule'),
/*#__PURE__*/
_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  var pollsAllowed;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _utils.log.info('Opening new poll'); // check if polls allowed


          _context.next = 3;
          return (0, _sheets.checkIfPollsAllowed)();

        case 3:
          pollsAllowed = _context.sent;

          if (!pollsAllowed) {
            _context.next = 9;
            break;
          }

          _context.next = 7;
          return (0, _utils2.createPoll)();

        case 7:
          _context.next = 10;
          break;

        case 9:
          _utils.log.info('PollsAllowed = false. Not serving polls.');

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));
exports.pollStartCrobJob = pollStartCrobJob;
var pollCloseCronJob = new _cron.CronJob(_config["default"].get('common.pollCloseSchedule'),
/*#__PURE__*/
_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee2() {
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _utils.log.info('Closing open polls');

          _context2.next = 3;
          return (0, _utils2.closeOpenPolls)();

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
})));
exports.pollCloseCronJob = pollCloseCronJob;