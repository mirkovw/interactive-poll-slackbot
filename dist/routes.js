"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _utils = require("./utils");

var _utils2 = require("./slack/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = new _express["default"].Router();
router.get('/',
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            res.send('Home Page');

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.post('/slack/commands/braunbot',
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res) {
    var payload, response;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            payload = req.body;

            _utils.log.info(payload.text);

            _context2.prev = 2;

            if (!(payload.text === 'stats')) {
              _context2.next = 9;
              break;
            }

            _context2.next = 6;
            return (0, _utils2.handleStatsCommand)(payload);

          case 6:
            response = _context2.sent;
            _context2.next = 23;
            break;

          case 9:
            if (!(payload.text === 'top10')) {
              _context2.next = 16;
              break;
            }

            _utils.log.info('top10');

            _context2.next = 13;
            return (0, _utils2.handleTop10Command)();

          case 13:
            response = _context2.sent;
            _context2.next = 23;
            break;

          case 16:
            if (!(payload.text === 'newpoll')) {
              _context2.next = 22;
              break;
            }

            _context2.next = 19;
            return (0, _utils2.handleNewCommand)();

          case 19:
            response = _context2.sent;
            _context2.next = 23;
            break;

          case 22:
            response = 'Command not supported';

          case 23:
            return _context2.abrupt("return", res.status(200).send(response));

          case 26:
            _context2.prev = 26;
            _context2.t0 = _context2["catch"](2);

            _utils.log.error(_context2.t0);

            return _context2.abrupt("return", res.status(500).send('Something blew up. We\'re looking into it.'));

          case 30:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 26]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
router.post('/slack/actions',
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(req, res) {
    var payload, _payload$actions, actions;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            payload = JSON.parse(req.body.payload);

            if (!(payload.type === 'block_actions')) {
              _context3.next = 8;
              break;
            }

            _payload$actions = _slicedToArray(payload.actions, 1), actions = _payload$actions[0];

            if (!(actions.value === 'pollAnswer')) {
              _context3.next = 8;
              break;
            }

            _context3.next = 7;
            return (0, _utils2.handlePollAnswer)(payload, res);

          case 7:
            _utils.log.info('Poll answer handled.');

          case 8:
            _context3.next = 14;
            break;

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](0);

            _utils.log.error(_context3.t0);

            return _context3.abrupt("return", res.status(500).send('Something blew up. We\'re looking into it.'));

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 10]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;