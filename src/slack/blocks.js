import { log } from '../utils';

export const composePollMsg = (poll) => {
    const elementsArr = [];
    const buttonsArray = [
        { value: 'A', text: poll.PollOptionA },
        { value: 'B', text: poll.PollOptionB },
        { value: 'C', text: poll.PollOptionC },
        { value: 'D', text: poll.PollOptionD },
    ];

    for (let i = 0; i < buttonsArray.length; i += 1) {
        if (buttonsArray[i].text !== '') {
            const arrayVal = {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: buttonsArray[i].text,
                    emoji: true,
                },
                value: 'pollAnswer',
                action_id: buttonsArray[i].value,
                confirm: {
                    title: {
                        type: 'plain_text',
                        text: 'Are you sure?',
                    },
                    text: {
                        type: 'mrkdwn',
                        text: `Your answer: ${buttonsArray[i].text}`,
                    },
                    confirm: {
                        type: 'plain_text',
                        text: 'Yes, I\'m sure',
                    },
                    deny: {
                        type: 'plain_text',
                        text: "Stop, I've changed my mind!",
                    },
                },
                style: 'primary',
            };
            elementsArr.push(arrayVal);
        }
    }

    const msg = {
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Question:\n*${poll.PollQuestion}*`,
                },
            },
            {
                type: 'actions',
                block_id: poll.UniqueId,
                elements: elementsArr,
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: 'Remember: you only get one chance to submit your answer.',
                    },
                ],
            },
        ],
    };

    return msg;
};

export const composeContextBlock = (str) => ({
    type: 'context',
    elements: [
        {
            type: 'mrkdwn',
            text: str,
        },
    ],
});

export const composeMonksAnsweredText = (responsesAmount) => {
    if (responsesAmount <= 1) return '1 monk has submitted an answer.';
    return `${responsesAmount} monks have submitted an answer.`;
};

export const composeUpdatedMsg = (payload, responsesAmount) => {
    const originalMsg = payload.message.blocks;
    const newText = composeMonksAnsweredText(responsesAmount);
    const newBlock = composeContextBlock(`\`${newText}\``);

    if (originalMsg.length === 3) {
        originalMsg.splice(2, 0, newBlock);
        return originalMsg;
    }
    originalMsg[2].elements[0].text = `\`${newText}\``;
    return originalMsg;
};

export const composeUpdatedPollMsg = (pollQuestion, winnerText, responsesText) => {
    const msg = {
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Question\n*${pollQuestion}*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `\`\`\`This poll is closed.\n${winnerText}\`\`\``,
                },
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `\`${responsesText}\``,
                    },
                ],
            },
        ],
    };

    return msg;
};

export const composeUserStatsMsg = (user) => ({
    blocks: [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Braun Bot - Stats for <@${user.id}>`,
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `*Wins:*\n${user.wins}`,
                },
                {
                    type: 'mrkdwn',
                    text: `*Polls participated in:*\n${user.participations}`,
                },
                {
                    type: 'mrkdwn',
                    text: `*Correct answers:*\n${user.answersCorrect}`,
                },
                {
                    type: 'mrkdwn',
                    text: `*Wrong answers:*\n${user.answersWrong}`,
                },
            ],
        },
    ],
});

export const composeLeaderboardMsg = (users) => {
    log.info(users);
    let usersText = '';

    for (let i = 0; i < users.length; i += 1) {
        if (i < 10) {
            const value = parseInt(users[i].Right, 10) / (parseInt(users[i].Wrong, 10) + parseInt(users[i].Right, 10));
            const percentage = Math.round(value * 100);
            const newStr = `${users[i].Wins} wins - <@${users[i].UserId}> (${percentage}% ratio)`;
            usersText += `${newStr}\n`;
        }
    }

    const msg = {
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Braun Bot - Top 10 Leaderboard',
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: usersText,
                },
            },
        ],
    };

    return msg;
};
