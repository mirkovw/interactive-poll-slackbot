import config from 'config';
import axios from 'axios';
import {
    log,
    getDateStr,
    returnRandom,
    isEmpty,
    getCellArr,
} from '../utils';
import {
    composePollMsg,
    composeContextBlock,
    composeUpdatedMsg,
} from './blocks';

import {
    getSheetData,
    updateResults,
    updateUsers,
    checkIfCorrect,
    checkIfNew,
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

const sendMessage = async (url, options) => {
    try {
        return await axios.post(url, options, {
            headers: { Authorization: `Bearer ${config.get('slack.botToken')}` },
        });
    } catch (err) {
        log.error(err);
        return err;
    }
}

export const createPoll = async () => {
    const pollsRows = await getSheetData(0).then((sheet)=>sheet.getRows());
    const availablePolls = pollsRows.filter((row) => row.PollUsed === 'NO');
    if (availablePolls.length > 0) {
        const randomPoll = returnRandom(availablePolls);
        // Add new row in results with UniqueId and DateShown
        const resultsSheet = await getSheetData(1);
        const resultsRows = await resultsSheet.getRows();
        const isNewResult = resultsRows.filter((row) => row.UniqueId === randomPoll.UniqueId).length === 0;
        if (isNewResult) {
            // Compose new poll
            const msg = composePollMsg(randomPoll);
            const targetChannels = await findChannels();
            const result = await sendMessage('https://slack.com/api/chat.postMessage', {
                channel: targetChannels[targetChannels.length - 1].id,
                text: 'Your daily poll is here.',
                blocks: msg.blocks,
            });

            const newRow = await resultsSheet.addRow({
                UniqueId: randomPoll.UniqueId,
                DateShown: getDateStr(),
                Status: 'Open',
                TimeStamp: result.data.ts,
                Channel: targetChannels[targetChannels.length - 1].id,
            });
            await newRow.save();
            randomPoll.PollUsed = 'YES'; // set current poll to used: yes
            await randomPoll.save();

        } else {
            // Respond in channel - cant make new poll
            const responseStr = 'Can\'t make new poll as there is already a result for this poll in the results list'
            log.info(responseStr);
            return false;
        }
    } else {
        const responseStr = 'Can\'t make new poll as there are no polls left in the feed.'
        log.info(responseStr);
        return false;
    }
};

export const handlePollAnswer = async (payload, res) => {
    const user = {
        id: payload.user.id,
        name: payload.user.username,
        winner: false,
    };
    const answer = {
        value: payload.actions[0].action_id,
        correct: false,
    };
    const poll = {
        uniqueId: payload.actions[0].block_id,
    };

    const resultsRows = await getSheetData(1).then((sheet)=>sheet.getRows());
    const [resultRow] = resultsRows.filter((row) => row.UniqueId === poll.uniqueId);
    answer.new = await checkIfNew(resultRow, poll, user);
    if (!answer.new) {
        await sendMessage('https://slack.com/api/chat.postEphemeral', {
            channel: payload.container.channel_id,
            user: payload.user.id,
            text: 'Well, well, well...',
            blocks: [composeContextBlock('Uh-uh. You already submitted an answer.')],
        });
        return res.status(200).json(); // quickly return if answer is not new.
    }

    answer.correct = await checkIfCorrect(poll, answer);
    if (answer.correct && isEmpty(resultRow.PollWinner)) user.winner = true;
    await updateResults(resultRow, user, answer);

    await res.status(200).json();

    await updateUsers(user, answer, poll);

    await sendMessage('https://slack.com/api/chat.update', {
        channel: payload.container.channel_id,
        ts: payload.message.ts,
        blocks: composeUpdatedMsg(payload),
    });

    await sendMessage('https://slack.com/api/chat.postEphemeral', {
        channel: payload.container.channel_id,
        user: payload.user.id,
        blocks: [composeContextBlock('Your answer has been recorded.')],
    });
};

export const closeCurrentPoll = async () => {
    const resultsRows = await getSheetData(1).then((sheet)=>sheet.getRows());
    log.info(resultsRows.length);

    log.info('latest poll should be')
    log.info(resultsRows[resultsRows.length-1]);

    const latestPoll = resultsRows[resultsRows.length - 1];

    log.info(latestPoll.TimeStamp);

    const result = await sendMessage('https://slack.com/api/chat.update', {
        channel: latestPoll.Channel,
        ts: latestPoll.TimeStamp,
        // blocks: composeUpdatedMsg(payload),
        text: "THIS POLL IS CLOSED",
    });

    log.info(result.data);



}
