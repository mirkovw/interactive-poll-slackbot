"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeLeaderboardMsg = exports.composeUserStatsMsg = exports.composeUpdatedPollMsg = exports.composeUpdatedMsg = exports.composeMonksAnsweredText = exports.composeContextBlock = exports.composePollMsg = void 0;

var _utils = require("../utils");

var composePollMsg = function composePollMsg(poll) {
  var elementsArr = [];
  var buttonsArray = [{
    value: 'A',
    text: poll.PollOptionA
  }, {
    value: 'B',
    text: poll.PollOptionB
  }, {
    value: 'C',
    text: poll.PollOptionC
  }, {
    value: 'D',
    text: poll.PollOptionD
  }];

  for (var i = 0; i < buttonsArray.length; i += 1) {
    if (buttonsArray[i].text !== '') {
      var arrayVal = {
        type: 'button',
        text: {
          type: 'plain_text',
          text: buttonsArray[i].text,
          emoji: true
        },
        value: 'pollAnswer',
        action_id: buttonsArray[i].value,
        confirm: {
          title: {
            type: 'plain_text',
            text: 'Are you sure?'
          },
          text: {
            type: 'mrkdwn',
            text: "Your answer: ".concat(buttonsArray[i].text)
          },
          confirm: {
            type: 'plain_text',
            text: 'Yes, I\'m sure'
          },
          deny: {
            type: 'plain_text',
            text: "Stop, I've changed my mind!"
          }
        },
        style: 'primary'
      };
      elementsArr.push(arrayVal);
    }
  }

  var msg = {
    blocks: [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Question:\n*" + poll.PollQuestion + "*"
      }
    }, {
      type: 'actions',
      block_id: poll.UniqueId,
      elements: elementsArr
    }, {
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: 'Remember: you only get one chance to submit your answer.'
      }]
    }]
  };
  return msg;
};

exports.composePollMsg = composePollMsg;

var composeContextBlock = function composeContextBlock(str) {
  return {
    "type": "context",
    "elements": [{
      "type": "mrkdwn",
      "text": str
    }]
  };
};

exports.composeContextBlock = composeContextBlock;

var composeMonksAnsweredText = function composeMonksAnsweredText(responsesAmount) {
  if (responsesAmount <= 1) return '1 monk has submitted an answer.';
  return responsesAmount + ' monks have submitted an answer.';
};

exports.composeMonksAnsweredText = composeMonksAnsweredText;

var composeUpdatedMsg = function composeUpdatedMsg(payload, responsesAmount) {
  var originalMsg = payload.message.blocks;
  var newText = composeMonksAnsweredText(responsesAmount);
  var newBlock = composeContextBlock('`' + newText + '`');

  if (originalMsg.length === 3) {
    originalMsg.splice(2, 0, newBlock);
    return originalMsg;
  }

  originalMsg[2].elements[0].text = '`' + newText + '`';
  return originalMsg;
};

exports.composeUpdatedMsg = composeUpdatedMsg;

var composeUpdatedPollMsg = function composeUpdatedPollMsg(pollQuestion, winnerText, responsesText) {
  var msg = {
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Question\n*" + pollQuestion + "*"
      }
    }, {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "```This poll is closed.\n" + winnerText + "```"
      }
    }, {
      "type": "context",
      "elements": [{
        "type": "mrkdwn",
        "text": '`' + responsesText + '`'
      }]
    }]
  };
  return msg;
};

exports.composeUpdatedPollMsg = composeUpdatedPollMsg;

var composeUserStatsMsg = function composeUserStatsMsg(user) {
  return {
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Braun Bot - Stats for <@" + user.id + ">"
      }
    }, {
      "type": "divider"
    }, {
      "type": "section",
      "fields": [{
        "type": "mrkdwn",
        "text": "*Wins:*\n" + user.wins + ""
      }, {
        "type": "mrkdwn",
        "text": "*Polls participated in:*\n" + user.participations + ""
      }, {
        "type": "mrkdwn",
        "text": "*Correct answers:*\n" + user.answersCorrect + ""
      }, {
        "type": "mrkdwn",
        "text": "*Wrong answers:*\n" + user.answersWrong + ""
      }]
    }]
  };
};

exports.composeUserStatsMsg = composeUserStatsMsg;

var composeLeaderboardMsg = function composeLeaderboardMsg(users) {
  _utils.log.info(users);

  var usersText = '';

  for (var i = 0; i < users.length; i += 1) {
    if (i < 10) {
      var newStr = users[i].Wins + ' wins - <@' + users[i].UserId + '>'; //usersTextArr.push(users[i].Wins + ' wins - <@' + users[i].UserId + '>')

      usersText += newStr + '\n';
    }
  }

  var msg = {
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Braun Bot - Top 10 Leaderboard"
      }
    }, {
      "type": "divider"
    }, {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": usersText
      }
    }]
  };
  return msg;
};

exports.composeLeaderboardMsg = composeLeaderboardMsg;