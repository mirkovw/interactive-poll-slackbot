"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUsers = exports.updateResults = exports.checkIfNew = exports.checkIfCorrect = exports.getSheetData = void 0;

var _config = _interopRequireDefault(require("config"));

var _googleSpreadsheet = require("google-spreadsheet");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var doc = new _googleSpreadsheet.GoogleSpreadsheet(_config["default"].get('sheet.id'));

var getSheetData =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(index) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return doc.useServiceAccountAuth({
              client_email: _config["default"].get('google.client_email'),
              private_key: _config["default"].get('google.private_key')
            });

          case 2:
            _context.next = 4;
            return doc.loadInfo();

          case 4:
            return _context.abrupt("return", doc.sheetsByIndex[index]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getSheetData(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.getSheetData = getSheetData;

var checkIfCorrect =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(poll, answer) {
    var pollsRows, _pollsRows$filter, _pollsRows$filter2, pollRow;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return getSheetData(0).then(function (sheet) {
              return sheet.getRows();
            });

          case 2:
            pollsRows = _context2.sent;
            _pollsRows$filter = pollsRows.filter(function (row) {
              return row.UniqueId === poll.uniqueId;
            }), _pollsRows$filter2 = _slicedToArray(_pollsRows$filter, 1), pollRow = _pollsRows$filter2[0];
            return _context2.abrupt("return", pollRow.CorrectOption === answer.value);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function checkIfCorrect(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

exports.checkIfCorrect = checkIfCorrect;

var checkIfNew =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(resultRow, poll, user) {
    var allResultsArr;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            allResultsArr = (0, _utils.getCellArr)(resultRow.Right).concat((0, _utils.getCellArr)(resultRow.Wrong));
            return _context3.abrupt("return", !allResultsArr.includes(user.id));

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function checkIfNew(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

exports.checkIfNew = checkIfNew;

var updateResults =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(row, user, answer) {
    var resultRow, responsesRightArr, responsesWrongArr;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            resultRow = row;
            responsesRightArr = (0, _utils.getCellArr)(resultRow.Right);
            responsesWrongArr = (0, _utils.getCellArr)(resultRow.Wrong);

            if (answer.correct) {
              responsesRightArr.push(user.id);
              resultRow.Right = responsesRightArr.toString();
              if (user.winner) resultRow.PollWinner = user.id;
            } else {
              responsesWrongArr.push(user.id);
              resultRow.Wrong = responsesWrongArr.toString();
            }

            resultRow.PollResponses = responsesRightArr.length + responsesWrongArr.length;
            _context4.next = 7;
            return resultRow.save();

          case 7:
            return _context4.abrupt("return", resultRow.PollResponses);

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function updateResults(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}();

exports.updateResults = updateResults;

var updateUsers =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(user, answer, poll) {
    var usersSheet, usersRows, _usersRows$filter, _usersRows$filter2, userRow, participations;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return getSheetData(2);

          case 2:
            usersSheet = _context5.sent;
            _context5.next = 5;
            return usersSheet.getRows();

          case 5:
            usersRows = _context5.sent;
            _usersRows$filter = usersRows.filter(function (row) {
              return row.UserId === user.id;
            }), _usersRows$filter2 = _slicedToArray(_usersRows$filter, 1), userRow = _usersRows$filter2[0];

            if (!(userRow === undefined)) {
              _context5.next = 11;
              break;
            }

            _context5.next = 10;
            return usersSheet.addRow({
              UserId: user.id,
              UserName: user.name,
              Wins: 0,
              Right: 0,
              Wrong: 0
            });

          case 10:
            userRow = _context5.sent;

          case 11:
            if (answer.correct) {
              userRow.Right = parseInt(userRow.Right) + 1;
              if (user.winner) userRow.Wins = parseInt(userRow.Wins) + 1;
            } else {
              userRow.Wrong = parseInt(userRow.Wrong) + 1;
            }

            participations = (0, _utils.getCellArr)(userRow.Participations);
            participations.push(poll.uniqueId);
            userRow.Participations = participations.toString();
            _context5.next = 17;
            return userRow.save();

          case 17:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function updateUsers(_x10, _x11, _x12) {
    return _ref5.apply(this, arguments);
  };
}();

exports.updateUsers = updateUsers;