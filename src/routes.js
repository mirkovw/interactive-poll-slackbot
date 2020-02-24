import express from 'express';
import { log } from './utils';
import {
    handlePollAnswer, handleStatsCommand, handleTop10Command, handleNewCommand, handleCloseCommand,
} from './slack/utils';

const router = new express.Router();

router.get('/', async (req, res) => {
    res.send('Home Page');
});

router.post('/slack/commands/braunbot', async (req, res) => {
    const payload = req.body;
    log.info(payload.text);
    try {
        let response;

        if (payload.text === 'stats') {
            response = await handleStatsCommand(payload);
        } else if (payload.text === 'top10') {
            log.info('top10');
            response = await handleTop10Command();
        } else if (payload.text === 'newpoll') { // dev command
            response = await handleNewCommand();
        } else if (payload.text === 'closepolls') { // dev command
            response = await handleCloseCommand();
        } else {
            response = 'Command not supported';
        }
        return res.status(200).send(response);
    } catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. We\'re looking into it.');
    }
});

router.post('/slack/actions', async (req, res) => {
    try {
        const payload = JSON.parse(req.body.payload);
        if (payload.type === 'block_actions') {
            const [actions] = payload.actions;
            if (actions.value === 'pollAnswer') {
                await handlePollAnswer(payload, res);
                log.info('Poll answer handled.');
            }
        }
        return true;
        // typical ack response
    } catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. We\'re looking into it.');
    }
});

export default router;
