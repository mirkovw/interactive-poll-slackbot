import config from 'config';
import axios from 'axios';
import {
    log,
    getDateStr,
    returnRandom,
} from '../utils';
import {
    composePollMsg,
    composeContextBlock,
} from './blocks';

import {
    getSheetData,
    updateResults,
    updateUsers,
    checkAnswer,
    checkIfNewAnswer,
} from '../google/sheets';

const findChannels = async () => {
    try {
        const result = await axios.get('https://slack.com/api/conversations.list', {
            params: {
                token: config.get('slack.botToken'),
            },
        });
        const allChannels = result.data.channels;
        const botChannels = allChannels.filter((channel) => channel.is_member === true);
        return botChannels;
    } catch (err) {
        log.error(err);
        return false;
    }
};

const sendPoll = async (msg, targetChannels) => {
    try {
        const result = await axios.post('https://slack.com/api/chat.postMessage', {
            channel: targetChannels.id,
            text: 'Your daily poll',
            blocks: msg.blocks,
        }, {
            headers: { Authorization: `Bearer ${config.get('slack.botToken')}` },
        });
        return result;
    } catch (err) {
        log.error(err);
        return false;
    }
};

export const createPoll = async () => {
    const sheetRows = await getSheetData(0).then((sheet)=>sheet.getRows());
    const availablePolls = sheetRows.filter((row) => row.PollUsed === 'NO');
    const randomPoll = returnRandom(availablePolls);
    // Add new row in results with UniqueId and DateShown
    const resultSheet = await getSheetData(1);
    const resultSheetRows = await resultSheet.getRows();
    const isNewResult = resultSheetRows.filter((row) => row.UniqueId === randomPoll.UniqueId).length === 0;
    if (isNewResult) {
        const newRow = await resultSheet.addRow({
            UniqueId: randomPoll.UniqueId,
            DateShown: getDateStr(),
        });
        await newRow.save();
        // Compose new poll
        const msg = composePollMsg(randomPoll);
        const targetChannels = await findChannels();
        sendPoll(msg, targetChannels[targetChannels.length-1]);
        for (let i = 0; i < 1; i += 1) {
            //sendPoll(msg, targetChannels[i]);
        }
    }
    else {
        // Respond in channel - cant make new poll
        let responseStr = 'Can\'t make new poll as there is already a result for this poll in the results list'
        log.info(responseStr);
        return false;
    }
};

export const handlePollAnswer = async (payload) => {
    const userId = payload.user.id;
    const userName = payload.user.username;
    const pollId = payload.actions[0].block_id;
    const answer = payload.actions[0].action_id;

    log.info('Checking if new answer..')
    const newAnswer = await checkIfNewAnswer(pollId, userId);
    log.info('Answer new: ' + newAnswer);

    if (!newAnswer) {
        log.info('User already submitted answer. Exiting.');
        try {
            axios.post('https://slack.com/api/chat.postEphemeral', {
                channel: payload.container.channel_id,
                user: payload.user.id,
                //text: 'You already submitted an answer.',
                blocks: [composeContextBlock('You already submitted an answer.')],
            }, {
                headers: { Authorization: `Bearer ${config.get('slack.botToken')}` },
            });
            return false;
        } catch (err) {
            log.error(err);
        }
    }

    log.info('Checking if correct answer..')
    const answerCorrect = await checkAnswer(pollId, answer);
    log.info('Answer correct: ' + answerCorrect)

    log.info('Updating results...');
    const user = await updateResults(pollId, userId, answerCorrect);
    log.info('Results updated.');

    log.info('Updating user...');
    await updateUsers(userId, userName, user.isWinner, answerCorrect, pollId);
    log.info('User updated.');

    // update original poll message block with updated info (x users submitted)
    const originalMsg = payload.message.blocks;
    if (originalMsg.length === 3) {
        const newBlock = composeContextBlock('`1 Monk has answered`');
        originalMsg.splice(2, 0, newBlock);

    } else {
        let origText = originalMsg[2].elements[0].text;
        let newText = '`'+(parseInt(origText.substr(1,1))+1) + " Monks have answered"+'`';
        originalMsg[2].elements[0].text = newText;
    }

    try {
        axios.post('https://slack.com/api/chat.update', {
            channel: payload.container.channel_id,
            ts: payload.message.ts,
            blocks: originalMsg,
        }, {
            headers: { Authorization: `Bearer ${config.get('slack.botToken')}` },
        });
    } catch (err) {
        log.error(err);
    }

    try {
        axios.post('https://slack.com/api/chat.postEphemeral', {
            channel: payload.container.channel_id,
            user: payload.user.id,
            blocks: [composeContextBlock('Your answer has been recorded.')],
        }, {
            headers: { Authorization: `Bearer ${config.get('slack.botToken')}` },
        });
        return false;
    } catch (err) {
        log.error(err);
    }
};

export const respondCustom = async (responseUrl, options) => {
    try {
        const result = await axios.post(responseUrl, options);
        return result;
    } catch (err) {
        log.error(err);
        return false;
    }
}
