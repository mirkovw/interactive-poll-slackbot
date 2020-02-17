import express from 'express';
import { log } from './utils';

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
    res.send("Home Page")
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
    log.info("/slack/commands/ns")
});

router.post('/slack/actions', async (req, res) => {
    // try {
    //     const payload = JSON.parse(req.body.payload);
    //     const user = await findUser(payload.user.id); // find user

    //     if (payload.type === 'block_actions') {
    //         const [actions] = payload.actions;
    //         if (actions.action_id === 'updateDefaultStation') await updateDefaultStation(payload, user);
    //         if (actions.action_id === 'updateNotifications') await updateNotifications(payload, user);
    //         if (actions.action_id === 'clearNotifications') await clearNotifications(payload, user);
    //     }

    //     if (payload.type === 'view_submission') {
    //         await handleViewSubmission(payload, user);
    //     }
    //     return res.status(200).json(); // typical ack response
    // } catch (err) {
    //     log.error(err);
    //     return res.status(500).send('Something blew up. We\'re looking into it.');
    // }

    log.info("/slack/actions")
});

export default router;
