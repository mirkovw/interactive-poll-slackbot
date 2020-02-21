"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closeOpenPolls = exports.closePoll = exports.handlePollAnswer = exports.handleNewCommand = exports.createPoll = exports.handleTop10Command = exports.handleStatsCommand = void 0;

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
  return (0, _utils.isEmpty)(cellValue) ? 0 : parseInt(cellValue);
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
            allChannels = result.data.channels;
            botChannels = allChannels.filter(function (channel) {
              return channel.is_member === true;
            });
            return _context3.abrupt("return", botChannels);

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](0);

            _utils.log.error(_context3.t0);

            return _context3.abrupt("return", false);

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 9]]);
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
            return _context4.abrupt("return", _context4.sent);

          case 6:
            _context4.prev = 6;
            _context4.t0 = _context4["catch"](0);

            _utils.log.error(_context4.t0);

            return _context4.abrupt("return", _context4.t0);

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 6]]);
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
    var pollsRows, availablePolls, randomPoll, resultsSheet, resultsRows, isNewResult, msg, targetChannels, result, newRow, responseStr, _responseStr;

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
            availablePolls = pollsRows.filter(function (row) {
              return row.PollUsed === 'NO';
            });

            if (!(availablePolls.length > 0)) {
              _context5.next = 37;
              break;
            }

            randomPoll = (0, _utils.returnRandom)(availablePolls);

            _utils.log.info('opening poll id ' + randomPoll.UniqueId); // Add new row in results with UniqueId and DateShown


            _context5.next = 9;
            return (0, _sheets.getSheetData)(1);

          case 9:
            resultsSheet = _context5.sent;
            _context5.next = 12;
            return resultsSheet.getRows();

          case 12:
            resultsRows = _context5.sent;
            isNewResult = resultsRows.filter(function (row) {
              return row.UniqueId === randomPoll.UniqueId;
            }).length === 0;

            if (!isNewResult) {
              _context5.next = 32;
              break;
            }

            // Compose new poll
            msg = (0, _blocks.composePollMsg)(randomPoll);
            _context5.next = 18;
            return findChannels();

          case 18:
            targetChannels = _context5.sent;
            _context5.next = 21;
            return sendMessage('https://slack.com/api/chat.postMessage', {
              channel: targetChannels[targetChannels.length - 1].id,
              text: 'Your daily poll is here.',
              blocks: msg.blocks
            });

          case 21:
            result = _context5.sent;
            _context5.next = 24;
            return resultsSheet.addRow({
              UniqueId: randomPoll.UniqueId,
              DateShown: (0, _utils.getDateStr)(),
              Status: 'Open',
              TimeStamp: result.data.ts,
              Channel: targetChannels[targetChannels.length - 1].id
            });

          case 24:
            newRow = _context5.sent;
            _context5.next = 27;
            return newRow.save();

          case 27:
            randomPoll.PollUsed = 'YES'; // set current poll to used: yes

            _context5.next = 30;
            return randomPoll.save();

          case 30:
            _context5.next = 35;
            break;

          case 32:
            // Respond in channel - cant make new poll
            responseStr = 'Can\'t make new poll as there is already a result for this poll in the results list';

            _utils.log.info(responseStr);

            return _context5.abrupt("return", false);

          case 35:
            _context5.next = 40;
            break;

          case 37:
            _responseStr = 'Can\'t make new poll as there are no polls left in the feed.';

            _utils.log.info(_responseStr);

            return _context5.abrupt("return", false);

          case 40:
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
  var _ref6 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6() {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return createPoll();

          case 2:
            return _context6.abrupt("return", {
              response_type: 'ephemeral',
              text: "Opened new poll."
            });

          case 3:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function handleNewCommand() {
    return _ref6.apply(this, arguments);
  };
}();

exports.handleNewCommand = handleNewCommand;

var handlePollAnswer =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(payload, res) {
    var user, answer, poll, resultsRows, _resultsRows$filter, _resultsRows$filter2, resultRow, responsesAmount, updatedMsg;

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
              text: "who cares",
              blocks: (0, _blocks.composeUpdatedMsg)(payload, responsesAmount)
            });

          case 27:
            updatedMsg = _context7.sent;
            _context7.next = 30;
            return sendMessage('https://slack.com/api/chat.postEphemeral', {
              channel: payload.container.channel_id,
              user: payload.user.id,
              blocks: [(0, _blocks.composeContextBlock)('Your answer has been recorded.')]
            });

          case 30:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function handlePollAnswer(_x4, _x5) {
    return _ref7.apply(this, arguments);
  };
}();

exports.handlePollAnswer = handlePollAnswer;

var closePoll = function closePoll(pollRow, resultRow) {
  var winnerText = (0, _utils.isEmpty)(resultRow.PollWinner) ? "No winner." : "Winner: <@" + resultRow.PollWinner + ">!";
  var responsesText = (0, _utils.isEmpty)(resultRow.PollResponses) ? 'No Responses' : (0, _blocks.composeMonksAnsweredText)(resultRow.PollResponses);
  var msg = (0, _blocks.composeUpdatedPollMsg)(pollRow.PollQuestion, winnerText, responsesText);
  sendMessage('https://slack.com/api/chat.update', {
    channel: resultRow.Channel,
    ts: resultRow.TimeStamp,
    blocks: msg.blocks,
    text: "Poll has closed."
  });
  resultRow.Status = 'Closed';
  resultRow.save();
};

exports.closePoll = closePoll;

var closeOpenPolls =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(
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
              _utils.log.info('closing poll id ' + openResults[i].UniqueId);

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
    return _ref8.apply(this, arguments);
  };
}();

exports.closeOpenPolls = closeOpenPolls;