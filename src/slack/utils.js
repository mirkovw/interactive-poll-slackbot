import config from 'config';
import axios from 'axios';
import {
    log,
    getDateStr,
    returnRandom,
    isEmpty,
    compareValues,
} from '../utils';
import {
    composePollMsg,
    composeContextBlock,
    composeUpdatedMsg,
    composeUpdatedPollMsg,
    composeMonksAnsweredText,
    composeUserStatsMsg,
    composeLeaderboardMsg,
} from './blocks';

import {
    getSheetData,
    updateResults,
    updateUsers,
    checkIfCorrect,
    checkIfNew, checkIfPollsAllowed,
} from '../google/sheets';

const getCellNum = (cellValue) => (isEmpty(cellValue) ? 0 : parseInt(cellValue, 10));

export const handleStatsCommand = async (payload) => {
    const user = {
        id: payload.user_id,
    };
    const userRows = await getSheetData(2).then((sheet) => sheet.getRows());
    const [userRow] = userRows.filter((row) => row.UserId === user.id);

    if (userRow !== undefined) {
        user.wins = getCellNum(userRow.Wins);
        user.answersCorrect = getCellNum(userRow.Right);
        user.answersWrong = getCellNum(userRow.Wrong);
        user.participations = user.answersCorrect + user.answersWrong;
        const msg = composeUserStatsMsg(user);
        return { response_type: 'in_channel', blocks: msg.blocks };
    }
    return 'User not found. Participate in a poll first.';
};

export const handleTop10Command = async () => {
    const userRows = await getSheetData(2).then((sheet) => sheet.getRows());
    const sortedRows = userRows.sort(compareValues('Wins', 'desc'));
    const msg = composeLeaderboardMsg(sortedRows);
    return { response_type: 'in_channel', blocks: msg.blocks };
};

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
};

export const createPoll = async () => {
    const pollsRows = await getSheetData(0).then((sheet) => sheet.getRows());
    const availablePolls = pollsRows.filter((row) => row.PollUsed === 'NO');
    if (availablePolls.length > 0) {
        const randomPoll = returnRandom(availablePolls);
        log.info(`opening poll id ${randomPoll.UniqueId}`);
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
            return true;
        }
        // Respond in channel - cant make new poll
        const responseStr = 'Can\'t make new poll as there is already a result for this poll in the results list';
        log.info(responseStr);
        return false;
    }
    const responseStr = 'Can\'t make new poll as there are no polls left in the feed.';
    log.info(responseStr);
    return false;
};

export const handleNewCommand = async () => {
    const pollsAllowed = await checkIfPollsAllowed();
    if (pollsAllowed) {
        await createPoll();
        return { response_type: 'ephemeral', text: 'Opened new poll.' };
    }
    return { response_type: 'ephemeral', text: 'PollsAllowed setting = OFF' };
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

    const resultsRows = await getSheetData(1).then((sheet) => sheet.getRows());
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
    const responsesAmount = await updateResults(resultRow, user, answer);

    await res.status(200).json();

    await updateUsers(user, answer, poll);

    await sendMessage('https://slack.com/api/chat.update', {
        channel: payload.container.channel_id,
        ts: payload.message.ts,
        text: 'who cares',
        blocks: composeUpdatedMsg(payload, responsesAmount),
    });

    await sendMessage('https://slack.com/api/chat.postEphemeral', {
        channel: payload.container.channel_id,
        user: payload.user.id,
        blocks: [composeContextBlock('Your answer has been recorded.')],
    });

    return true;
};

export const closePoll = (pollRow, row) => {
    const resultRow = row;
    const winnerText = isEmpty(resultRow.PollWinner) ? 'No winner.' : `Winner: <@${resultRow.PollWinner}>!`;
    const responsesText = isEmpty(resultRow.PollResponses) ? 'No Responses' : composeMonksAnsweredText(resultRow.PollResponses);
    const msg = composeUpdatedPollMsg(pollRow.PollQuestion, winnerText, responsesText);
    sendMessage('https://slack.com/api/chat.update', {
        channel: resultRow.Channel,
        ts: resultRow.TimeStamp,
        blocks: msg.blocks,
        text: 'Poll has closed.',
    });
    resultRow.Status = 'Closed';
    resultRow.save();
};

export const closeOpenPolls = async () => {
    const resultsRows = await getSheetData(1).then((sheet) => sheet.getRows());
    const pollsRows = await getSheetData(0).then((sheet) => sheet.getRows());
    const openResults = resultsRows.filter((row) => row.Status === 'Open'); // get polls that are open

    for (let i = 0; i < openResults.length; i += 1) {
        log.info(`closing poll id ${openResults[i].UniqueId}`);
        const [pollRow] = pollsRows.filter((row) => row.UniqueId === openResults[i].UniqueId);
        closePoll(pollRow, openResults[i]);
    }
};
