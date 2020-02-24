"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleCloseCommand = exports.closeOpenPolls = exports.closePoll = exports.handlePollAnswer = exports.handleNewCommand = exports.createPoll = exports.handleTop10Command = exports.handleStatsCommand = void 0;

var _config = _interopRequireDefault(require("config"));

var _axios = _interopRequireDefault(require("axios"));

var _utils = require("../utils");

var _blocks = require("./blocks");

var _sheets = require("../google/sheets");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var getCellNum = function getCellNum(cellValue) {
  return (0, _utils.isEmpty)(cellValue) ? 0 : parseInt(cellValue, 10);
};

var handleStatsCommand =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(payload) {
    var user, userRows, _userRows$filter, _userRows$filter2, userRow, msg;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            user = {
              id: payload.user_id
            };
            _context.next = 3;
            return (0, _sheets.getSheetData)(2).then(function (sheet) {
              return sheet.getRows();
            });

          case 3:
            userRows = _context.sent;
            _userRows$filter = userRows.filter(function (row) {
              return row.UserId === user.id;
            }), _userRows$filter2 = _slicedToArray(_userRows$filter, 1), userRow = _userRows$filter2[0];

            if (!(userRow !== undefined)) {
              _context.next = 12;
              break;
            }

            user.wins = getCellNum(userRow.Wins);
            user.answersCorrect = getCellNum(userRow.Right);
            user.answersWrong = getCellNum(userRow.Wrong);
            user.participations = user.answersCorrect + user.answersWrong;
            msg = (0, _blocks.composeUserStatsMsg)(user);
            return _context.abrupt("return", {
              response_type: 'in_channel',
              blocks: msg.blocks
            });

          case 12:
            return _context.abrupt("return", 'User not found. Participate in a poll first.');

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function handleStatsCommand(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.handleStatsCommand = handleStatsCommand;

var handleTop10Command =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var userRows, sortedRows, msg;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _sheets.getSheetData)(2).then(function (sheet) {
              return sheet.getRows();
            });

          case 2:
            userRows = _context2.sent;
            sortedRows = userRows.sort((0, _utils.compareValues)('Wins', 'desc'));
            msg = (0, _blocks.composeLeaderboardMsg)(sortedRows);
            return _context2.abrupt("return", {
              response_type: 'in_channel',
              blocks: msg.blocks
            });

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function handleTop10Command() {
    return _ref2.apply(this, arguments);
  };
}();

exports.handleTop10Command = handleTop10Command;

var findChannels =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var result, allChannels, botChannels;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return _axios["default"].get('https://slack.com/api/conversations.list', {
              params: {
                token: _config["default"].get('slack.botToken')
              }
            });

          case 3:
            result = _context3.sent;

            _utils.log.info(result.data);

            allChannels = result.data.channels;

            _utils.log.info(allChannels);

            botChannels = allChannels.filter(function (channel) {
              return channel.is_member === true;
            });
            return _context3.abrupt("return", botChannels);

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](0);

            _utils.log.error(_context3.t0);

            return _context3.abrupt("return", false);

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 11]]);
  }));

  return function findChannels() {
    return _ref3.apply(this, arguments);
  };
}();

var sendMessage =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(url, options) {
    var result;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _axios["default"].post(url, options, {
              headers: {
                Authorization: "Bearer ".concat(_config["default"].get('slack.botToken'))
              }
            });

          case 3:
            result = _context4.sent;

            _utils.log.info(result.data);

            return _context4.abrupt("return", result);

          case 8:
            _context4.prev = 8;
            _context4.t0 = _context4["catch"](0);

            _utils.log.error(_context4.t0);

            return _context4.abrupt("return", _context4.t0);

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 8]]);
  }));

  return function sendMessage(_x2, _x3) {
    return _ref4.apply(this, arguments);
  };
}();

var createPoll =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var pollsRows, _ref6, _ref7, settings, availablePolls, randomPoll, resultsSheet, resultsRows, resultRow, msg, result, newRow, _responseStr, responseStr;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _sheets.getSheetData)(0).then(function (sheet) {
              return sheet.getRows();
            });

          case 2:
            pollsRows = _context5.sent;
            _context5.next = 5;
            return (0, _sheets.getSheetData)(3).then(function (sheet) {
              return sheet.getRows();
            });

          case 5:
            _ref6 = _context5.sent;
            _ref7 = _slicedToArray(_ref6, 1);
            settings = _ref7[0];
            availablePolls = pollsRows.filter(function (row) {
              return row.PollUsed === 'NO';
            });

            if (!(availablePolls.length > 0)) {
              _context5.next = 36;
              break;
            }

            randomPoll = (0, _utils.returnRandom)(availablePolls);

            _utils.log.info("opening poll id ".concat(randomPoll.UniqueId)); // Add new row in results with UniqueId and DateShown


            _context5.next = 14;
            return (0, _sheets.getSheetData)(1);

          case 14:
            resultsSheet = _context5.sent;
            _context5.next = 17;
            return resultsSheet.getRows();

          case 17:
            resultsRows = _context5.sent;
            resultRow = resultsRows.filter(function (row) {
              return row.UniqueId === randomPoll.UniqueId;
            });

            if (!(resultRow.length === 0)) {
              _context5.next = 33;
              break;
            }

            // Compose new poll
            msg = (0, _blocks.composePollMsg)(randomPoll);
            _context5.next = 23;
            return sendMessage('https://slack.com/api/chat.postMessage', {
              channel: settings.PollChannel,
              text: 'Your daily poll is here.',
              username: 'Braun Bot',
              blocks: msg.blocks
            });

          case 23:
            result = _context5.sent;
            _context5.next = 26;
            return resultsSheet.addRow({
              UniqueId: randomPoll.UniqueId,
              DateShown: (0, _utils.getDateStr)(),
              Status: 'Open',
              TimeStamp: result.data.ts,
              Channel: settings.PollChannel
            });

          case 26:
            newRow = _context5.sent;
            _context5.next = 29;
            return newRow.save();

          case 29:
            randomPoll.PollUsed = 'YES'; // set current poll to used: yes

            _context5.next = 32;
            return randomPoll.save();

          case 32:
            return _context5.abrupt("return", 'Opened new poll.');

          case 33:
            // Respond in channel - cant make new poll
            _responseStr = 'Can\'t make new poll as there is already a result for this poll in the results list';

            _utils.log.info(_responseStr);

            return _context5.abrupt("return", _responseStr);

          case 36:
            responseStr = 'Can\'t make new poll as there are no polls left in the feed.';

            _utils.log.info(responseStr);

            return _context5.abrupt("return", responseStr);

          case 39:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function createPoll() {
    return _ref5.apply(this, arguments);
  };
}();

exports.createPoll = createPoll;

var handleNewCommand =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6() {
    var _ref9, _ref10, settings, result;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _sheets.getSheetData)(3).then(function (sheet) {
              return sheet.getRows();
            });

          case 2:
            _ref9 = _context6.sent;
            _ref10 = _slicedToArray(_ref9, 1);
            settings = _ref10[0];

            if (!(settings.DevModeEnabled === 'ON')) {
              _context6.next = 10;
              break;
            }

            _context6.next = 8;
            return createPoll();

          case 8:
            result = _context6.sent;
            return _context6.abrupt("return", {
              response_type: 'ephemeral',
              text: result
            });

          case 10:
            return _context6.abrupt("return", {
              response_type: 'ephemeral',
              text: 'DevModeEnabled = OFF'
            });

          case 11:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function handleNewCommand() {
    return _ref8.apply(this, arguments);
  };
}();

exports.handleNewCommand = handleNewCommand;

var handlePollAnswer =
/*#__PURE__*/
function () {
  var _ref11 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(payload, res) {
    var user, answer, poll, resultsRows, _resultsRows$filter, _resultsRows$filter2, resultRow, responsesAmount;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            user = {
              id: payload.user.id,
              name: payload.user.username,
              winner: false
            };
            answer = {
              value: payload.actions[0].action_id,
              correct: false
            };
            poll = {
              uniqueId: payload.actions[0].block_id
            };
            _context7.next = 5;
            return (0, _sheets.getSheetData)(1).then(function (sheet) {
              return sheet.getRows();
            });

          case 5:
            resultsRows = _context7.sent;
            _resultsRows$filter = resultsRows.filter(function (row) {
              return row.UniqueId === poll.uniqueId;
            }), _resultsRows$filter2 = _slicedToArray(_resultsRows$filter, 1), resultRow = _resultsRows$filter2[0];
            _context7.next = 9;
            return (0, _sheets.checkIfNew)(resultRow, poll, user);

          case 9:
            answer["new"] = _context7.sent;

            if (answer["new"]) {
              _context7.next = 14;
              break;
            }

            _context7.next = 13;
            return sendMessage('https://slack.com/api/chat.postEphemeral', {
              channel: payload.container.channel_id,
              user: payload.user.id,
              text: 'Well, well, well...',
              blocks: [(0, _blocks.composeContextBlock)('Uh-uh. You already submitted an answer.')]
            });

          case 13:
            return _context7.abrupt("return", res.status(200).json());

          case 14:
            _context7.next = 16;
            return (0, _sheets.checkIfCorrect)(poll, answer);

          case 16:
            answer.correct = _context7.sent;
            if (answer.correct && (0, _utils.isEmpty)(resultRow.PollWinner)) user.winner = true;
            _context7.next = 20;
            return (0, _sheets.updateResults)(resultRow, user, answer);

          case 20:
            responsesAmount = _context7.sent;
            _context7.next = 23;
            return res.status(200).json();

          case 23:
            _context7.next = 25;
            return (0, _sheets.updateUsers)(user, answer, poll);

          case 25:
            _context7.next = 27;
            return sendMessage('https://slack.com/api/chat.update', {
              channel: payload.container.channel_id,
              ts: payload.message.ts,
              text: 'Msg Updated.',
              blocks: (0, _blocks.composeUpdatedMsg)(payload, responsesAmount)
            });

          case 27:
            _context7.next = 29;
            return sendMessage('https://slack.com/api/chat.postEphemeral', {
              channel: payload.container.channel_id,
              user: payload.user.id,
              blocks: [(0, _blocks.composeContextBlock)('Your answer has been recorded.')]
            });

          case 29:
            return _context7.abrupt("return", true);

          case 30:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function handlePollAnswer(_x4, _x5) {
    return _ref11.apply(this, arguments);
  };
}();

exports.handlePollAnswer = handlePollAnswer;

var closePoll = function closePoll(pollRow, row) {
  var resultRow = row;
  var winnerText = (0, _utils.isEmpty)(resultRow.PollWinner) ? 'No winner.' : "Winner: <@".concat(resultRow.PollWinner, ">!");
  var responsesText = (0, _utils.isEmpty)(resultRow.PollResponses) ? 'No Responses' : (0, _blocks.composeMonksAnsweredText)(resultRow.PollResponses);
  var msg = (0, _blocks.composeUpdatedPollMsg)(pollRow.PollQuestion, winnerText, responsesText);
  sendMessage('https://slack.com/api/chat.update', {
    channel: resultRow.Channel,
    ts: resultRow.TimeStamp,
    blocks: msg.blocks,
    text: 'Poll has closed.'
  });
  resultRow.Status = 'Closed';
  resultRow.save();
};

exports.closePoll = closePoll;

var closeOpenPolls =
/*#__PURE__*/
function () {
  var _ref12 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8() {
    var resultsRows, pollsRows, openResults, _loop, i;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return (0, _sheets.getSheetData)(1).then(function (sheet) {
              return sheet.getRows();
            });

          case 2:
            resultsRows = _context8.sent;
            _context8.next = 5;
            return (0, _sheets.getSheetData)(0).then(function (sheet) {
              return sheet.getRows();
            });

          case 5:
            pollsRows = _context8.sent;
            openResults = resultsRows.filter(function (row) {
              return row.Status === 'Open';
            }); // get polls that are open

            _loop = function _loop(i) {
              _utils.log.info("closing poll id ".concat(openResults[i].UniqueId));

              var _pollsRows$filter = pollsRows.filter(function (row) {
                return row.UniqueId === openResults[i].UniqueId;
              }),
                  _pollsRows$filter2 = _slicedToArray(_pollsRows$filter, 1),
                  pollRow = _pollsRows$filter2[0];

              closePoll(pollRow, openResults[i]);
            };

            for (i = 0; i < openResults.length; i += 1) {
              _loop(i);
            }

          case 9:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function closeOpenPolls() {
    return _ref12.apply(this, arguments);
  };
}();

exports.closeOpenPolls = closeOpenPolls;

var handleCloseCommand =
/*#__PURE__*/
function () {
  var _ref13 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9() {
    var _ref14, _ref15, settings;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _sheets.getSheetData)(3).then(function (sheet) {
              return sheet.getRows();
            });

          case 2:
            _ref14 = _context9.sent;
            _ref15 = _slicedToArray(_ref14, 1);
            settings = _ref15[0];

            if (!(settings.DevModeEnabled === 'ON')) {
              _context9.next = 9;
              break;
            }

            _context9.next = 8;
            return closeOpenPolls();

          case 8:
            return _context9.abrupt("return", {
              response_type: 'ephemeral',
              text: 'Closed all open polls.'
            });

          case 9:
            return _context9.abrupt("return", {
              response_type: 'ephemeral',
              text: 'DevModeEnabled = OFF'
            });

          case 10:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function handleCloseCommand() {
    return _ref13.apply(this, arguments);
  };
}();

exports.handleCloseCommand = handleCloseCommand;