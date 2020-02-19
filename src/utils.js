import fs from 'fs';
import config from 'config';
import morgan from 'morgan';
import tracer from 'tracer';
import axios from 'axios';

const add0 = (number) => number < 10 ? '0' + number.toString() : number;

export const returnRandom = (arr) => arr[Math.floor(arr.length * Math.random())];

export const log = (() => {
    const logger = tracer.colorConsole();
    logger.requestLogger = morgan('dev');
    return logger;
})();

export const getDateStr = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = add0(date.getMonth() + 1);
    const day = add0(date.getDate());
    const hour = add0((date.getHours() + (date.getTimezoneOffset() / 60)) + 1);
    const minute = add0(date.getMinutes());
    const dateStr = day + '-' + month + '-' + year + ' ' + hour + ':' + minute;
    return dateStr;
};

// export const findUser = async (id) => {
//     // just in case file doesn't exist - create file with empty array
//     const fileExists = await fs.existsSync(config.get('userDataPath'));
//     if (!fileExists) await fs.writeFileSync(config.get('userDataPath'), '[]');
//     let user;
//     try {
//         const usersData = await JSON.parse(fs.readFileSync(config.get('userDataPath')));
//         user = usersData.find(({ userId }) => userId === id);
//     } catch (error) {
//         log.error(error);
//         user = '';
//     }
//     return user;
// };
//
// export const writeUser = async (data) => {
//     try {
//         const existingUsersData = await JSON.parse(fs.readFileSync(config.get('userDataPath')));
//         let isExistingUser = false;
//         for (let i = 0; i < existingUsersData.length; i += 1) {
//             if (data.userId === existingUsersData[i].userId) {
//                 existingUsersData[i] = data;
//                 isExistingUser = true;
//             }
//         }
//         if (!isExistingUser) existingUsersData.push(data);
//         const fileData = JSON.stringify(existingUsersData, null, 2);
//         try {
//             await fs.writeFileSync(config.get('userDataPath'), fileData);
//             return data;
//         } catch (error) {
//             log.error(error);
//         }
//     } catch (error) {
//         log.error(error);
//     }
//     return true;
// };
//
// export const newUser = (payload) => ({
//     userId: payload.user_id,
//     channelId: payload.channel_id,
//     userName: payload.user_name,
//     station: 'NONE',
//     notifications: {
//         enabled: false,
//         days: [],
//         time: {
//             hour: '',
//             minute: '',
//         },
//     },
//     updateSettings: {
//         channelId: '',
//         ts: '',
//         responseUrl: '',
//     },
// });
//
//
// export const respondCustom = async (url, options, params) => {
//     log.info('POST message to responseUrl');
//     let result;
//     try {
//         result = await axios.post(url, options, params);
//         log.info('Message Delivered');
//     } catch (error) {
//         log.error(error);
//         result = false;
//     }
//     return result;
// };
