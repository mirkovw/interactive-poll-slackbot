import config from 'config';
import { CronJob } from 'cron';
import { log } from './utils';
import { createPoll, closeOpenPolls } from './slack/utils';
import { checkIfPollsAllowed } from './google/sheets';

export const pollStartCrobJob = new CronJob(config.get('common.pollStartSchedule'), async () => {
    log.info('Opening new poll');
    // check if polls allowed
    const pollsAllowed = await checkIfPollsAllowed();
    if (pollsAllowed) {
        await createPoll();
    } else {
        log.info('PollsAllowed = false. Not serving polls.');
    }
});

export const pollCloseCronJob = new CronJob(config.get('common.pollCloseSchedule'), async () => {
    log.info('Closing open polls');
    await closeOpenPolls();
});
