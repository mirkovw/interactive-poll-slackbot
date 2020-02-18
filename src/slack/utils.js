import config from 'config';
import axios from 'axios';
import {
    log,
} from '../utils';
import {
    composePollMsg,
} from './blocks';

import getSheetData from '../google/sheets';

const returnRandom = (arr) => arr[Math.floor(arr.length * Math.random())];

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

        return true;
    } catch (err) {
        log.error(err);
        return false;
    }
};

export const createPoll = async () => {
    const sheetRows = await getSheetData(0);
    const availablePolls = sheetRows.filter((row) => row.PollUsed === 'NO');
    const randomPoll = returnRandom(availablePolls);
    const msg = composePollMsg(randomPoll);
    const targetChannels = await findChannels();

    for (let i = 0; i < targetChannels.length; i += 1) {
        sendPoll(msg, targetChannels[i]);
    }
};

const checkAnswer = async (pollId, answer) => {
    const sheetRows = await getSheetData(0);
    const poll = sheetRows.filter((row) => row.UniqueId === pollId);
    return poll[0].CorrectOption === answer;
};

const checkIfNewAnswer = async (pollId, userId) => {
    const sheetRows = await getSheetData(2);
    const user = sheetRows.filter((row) => row.UserId === userId);

    if (user.length === 0) return true; // new user
    return user[0].Participations.split(',').includes(pollId);
};


export const handlePollAnswer = async (payload) => {
    const userId = payload.user.id;
    const userName = payload.user.username;
    const pollId = payload.actions[0].block_id;
    const answer = payload.actions[0].action_id;

    const newAnswer = await checkIfNewAnswer(pollId, userId);

    const answerCorrect = await checkAnswer(pollId, answer);

    // first, we update the userlist
    // await updateUserList(payload);

    // then we update the results list
    // await updateResultsList(payload);


    log.info(answerCorrect);
};


// export const handleCommand = async (payload) => {
//     let msg;
//     let msgUpdate;

//     let user = await findUser(payload.user_id);
//     if (user === undefined) user = await writeUser(newUser(payload));

//     if (payload.command === '/ns') {
//         const isSettings = payload.text.toLocaleLowerCase() === 'settings' || (payload.text === '' && user.station === 'NONE');
//         const responseType = isSettings ? 'ephemeral' : 'in_channel';

//         if (isSettings) {
//             log.info(`${user.userName} request settings`);
//             msg = await composeSettingsMsg(user); // send settings page
//         } else {
//             const station = payload.text !== '' ? findStation(payload.text) : findStation(user.station);
//             log.info(`${user.userName} REQUEST DEPARTURES FOR ${station.label.toUpperCase()}`);
//             const departures = await getNsData(station);
//             msg = await composeDeparturesMsg(user, station, departures);

//             if (station.label !== user.station) {
//                 msgUpdate = composeUpdateDefaultMsg(user, station);
//             }
//         }

//         if (msgUpdate) await respondCustom(payload.response_url, { response_type: 'ephemeral', blocks: msgUpdate.blocks });
//         return { response_type: responseType, replace_original: false, blocks: msg.blocks };
//     }
//     return false;
// };

// export const updateDefaultStation = async (payload, userParam) => {
//     const user = userParam;
//     const station = findStation(payload.actions[0].value);
//     user.station = station.label; // update default station in user object
//     await writeUser(user); // write user object to json

//     log.info(`UPDATED DEFAULT STATION TO ${station.label.toUpperCase()}`);

//     return respondCustom(payload.response_url, {
//         replace_original: true,
//         blocks: composeUpdateDefaultConfirmMsg(station).blocks,
//     });
// };


// export const updateNotifications = async (payload, userParam) => {
//     let user = userParam;
//     user.updateSettings.channelId = payload.container.channel_id;
//     user.updateSettings.ts = payload.container.message_ts;
//     user.updateSettings.responseUrl = payload.response_url;
//     user = await writeUser(user);
//     log.info(`UPDATE NOTIFICATIONS FOR ${user.userName}`);

//     const view = composeNotificationsModal(user);

//     return respondCustom('https://slack.com/api/views.open', {
//         trigger_id: payload.trigger_id,
//         view,
//     }, {
//         headers: { Authorization: `Bearer ${config.get('slack.botToken')}` },
//     });
// };


// export const handleViewSubmission = async (payload, userParam) => {
//     let user = userParam;
//     const { values } = payload.view.state;
//     user.notifications.enabled = true;
//     user.notifications.days = [];
//     for (let i = 0; i < values.days_select.days_select_value.selected_options.length; i += 1) {
//         const theVal = values.days_select.days_select_value.selected_options[i].value;
//         user.notifications.days.push(theVal);
//     }
//     user.notifications.time.hour = values.hour_select.hour_select_value.selected_option.value;
//     user.notifications.time.minute = values.minute_select.minute_select_value.selected_option.value;
//     user = await writeUser(user);

//     const blocks = await composeSettingsMsg(user);

//     log.info(`NOTIFICATIONS UPDATED FOR ${user.userName}`);

//     return respondCustom(user.updateSettings.responseUrl, {
//         replace_original: true,
//         blocks: blocks.blocks,
//     });
// };

// export const clearNotifications = async (payload, userParam) => {
//     let user = userParam;
//     user.notifications.enabled = false;
//     user = await writeUser(user);

//     const blocks = await composeSettingsMsg(user);

//     log.info(`NOTIFICATIONS OFF FOR ${user.userName}`);

//     return respondCustom(payload.response_url, {
//         replace_original: true,
//         blocks: blocks.blocks,
//     });
// };

// export const sendNotification = async (user) => {
//     log.info(`Sending notification to ${user.userName}`);
//     const station = findStation(user.station);
//     const departures = await getNsData(station);
//     const msg = await composeDeparturesMsg(user, station, departures);

//     try {
//         await respondCustom('https://slack.com/api/chat.postMessage', {
//             channel: user.userId,
//             text: 'Your daily NS Departures notification is ready to view.',
//             blocks: msg.blocks,
//         }, {
//             headers: { Authorization: `Bearer ${config.get('slack.botToken')}` },
//         });
//     } catch (err) {
//         log.error(err);
//     }
// };
