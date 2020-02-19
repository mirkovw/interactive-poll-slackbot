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
                // confirm: {
                //     title: {
                //         type: 'plain_text',
                //         text: 'Are you sure?',
                //     },
                //     text: {
                //         type: 'mrkdwn',
                //         text: `Your answer: ${buttonsArray[i].text}`,
                //     },
                //     confirm: {
                //         type: 'plain_text',
                //         text: 'Yes, I\'m sure',
                //     },
                //     deny: {
                //         type: 'plain_text',
                //         text: "Stop, I've changed my mind!",
                //     },
                // },
                style: 'primary',
            };
            elementsArr.push(arrayVal);
        }
    }

    const msg = {
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Question:\n*" + poll.PollQuestion  + "*"
                }
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

export const composeContextBlock = (str) => {
    return {
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": str
            }
        ]
    }
}

export const otherMsg = (poll) => {
    const bar = 'foo';
    return bar;
};
