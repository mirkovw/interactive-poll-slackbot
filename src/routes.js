import express from 'express';
import { log } from './utils';
import { handlePollAnswer } from './slack/utils';

const router = new express.Router();

router.get('/', async (req, res) => {
    // try {
    //     const payload = req.body;
    //     const response = await handleCommand(payload);
    //     return res.status(200).send(response);
    // } catch (err) {
    //     log.error(err);
    //     return res.status(500).send('Something blew up. We\'re looking into it.');
    // }
    res.send('Home Page');
});

router.post('/slack/commands/ns', async (req, res) => {
    // try {
    //     const payload = req.body;
    //     const response = await handleCommand(payload);
    //     return res.status(200).send(response);
    // } catch (err) {
    //     log.error(err);
    //     return res.status(500).send('Something blew up. We\'re looking into it.');
    // }
    log.info('/slack/commands/ns');
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
         // typical ack response
    } catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. We\'re looking into it.');
    }
});

export default router;
