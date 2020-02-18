import fs from 'fs';
import config from 'config';
import { CronJob } from 'cron';
import { log } from './utils';
// import { sendNotification, sendPoll } from './slack/utils';

export default new CronJob('*/5 * * * *', async () => {
    // every 5 minutes: '*/5 * * * *'
    log.info('Checking on notifications to send');
    // sendPoll();
    // const usersData = await JSON.parse(fs.readFileSync(config.get('userDataPath')));

    // const date = new Date();

    // // with Date().getDay, sunday is 0 and in my array, sunday is 6
    // const currentDay = date.getDay() !== 0 ? date.getDay() - 1 : 6;

    // // with Date().getDay, sunday is 0 and in my array, sunday is 6
    // const currentHour = (date.getHours() + (date.getTimezoneOffset() / 60)) + 1;

    // const currentMinute = date.getMinutes();

    // // filter out the users who should be receiving a notification
    // const r1 = usersData.filter((user) => user.notifications.enabled === true);

    // const r2 = r1.filter((user) => user.notifications.days.indexOf(currentDay.toString()) !== -1);

    // const r3 = r2.filter((user) => user.notifications.time.hour === currentHour.toString());

    // const uL = r3.filter((user) => Math.abs(user.notifications.time.minute - currentMinute) <= 2);

    // for (let i = 0; i < uL.length; i += 1) {
    //     sendNotification(uL[i]);
    // }
});
