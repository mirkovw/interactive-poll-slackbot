import fs from 'fs';
import config from 'config';
import { CronJob } from 'cron';
import { log } from './utils';
import { createPoll, closeCurrentPoll } from './slack/utils';

export const pollStartCrobJob = new CronJob(config.get('common.pollStartSchedule'), async () => {
    log.info('Starting new poll');
    //await createPoll();
});

export const pollCloseCronJob = new CronJob(config.get('common.pollCloseSchedule'), async () => {
    log.info('Closing poll');
    //await closeCurrentPoll();
});
