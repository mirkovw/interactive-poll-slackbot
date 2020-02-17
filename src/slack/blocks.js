export const composeNotificationsModal = (user) => {
    const blocksArr = [];
    const dayOptionsArr = [];
    const initialDayOptionsArr = [];
    const hourOptionsArr = [];
    const minuteOptionsArr = [];
    let initialHourOptionObj;
    let initialMinuteOptionObj;

    const blocksContent = [
        { labelText: 'days', type: 'multi_static_select', action_id: 'days_select' },
        { labelText: 'hour', type: 'static_select', action_id: 'hour_select' },
        { labelText: 'minute', type: 'static_select', action_id: 'minute_select' },

    ];

    const daysArr = [
        { dayCode: '0', dayName: 'Monday' },
        { dayCode: '1', dayName: 'Tuesday' },
        { dayCode: '2', dayName: 'Wednesday' },
        { dayCode: '3', dayName: 'Thursday' },
        { dayCode: '4', dayName: 'Friday' },
        { dayCode: '5', dayName: 'Saturday' },
        { dayCode: '6', dayName: 'Sunday' },
    ];

    const view = {
        type: 'modal',
        callback_id: 'notifications_view',
        title: {
            type: 'plain_text',
            text: 'Notifications',
            emoji: true,
        },
        submit: {
            type: 'plain_text',
            text: 'Submit',
            emoji: true,
        },
        close: {
            type: 'plain_text',
            text: 'Cancel',
            emoji: true,
        },
    };

    for (let block = 0; block < 3; block += 1) {
        const tempBlock = {
            type: 'input',
            block_id: blocksContent[block].action_id,
            label: {
                type: 'plain_text',
                text: `Which ${blocksContent[block].labelText} would you like to receive a notification?`,
                emoji: true,
            },
            element: {
                type: blocksContent[block].type,
                action_id: `${blocksContent[block].action_id}_value`,
                placeholder: {
                    type: 'plain_text',
                    text: 'Choose an option...',
                    emoji: true,
                },
            },
        };

        blocksArr.push(tempBlock);
    }

    for (let day = 0; day < daysArr.length; day += 1) {
        const dayObj = { text: { type: 'plain_text', text: daysArr[day].dayName, emoji: true }, value: daysArr[day].dayCode };
        dayOptionsArr.push(dayObj);
        if (user.notifications.days.indexOf(dayObj.value) !== -1) initialDayOptionsArr.push(dayObj);
    }

    for (let hour = 0; hour < 24; hour += 1) {
        const hourObj = { text: { type: 'plain_text', text: hour.toString(), emoji: true }, value: hour.toString() };
        hourOptionsArr.push(hourObj);
        if (user.notifications.time.hour === hour.toString()) initialHourOptionObj = hourObj;
    }

    for (let minute = 0; minute < 60; minute += 1) {
        const minuteObj = { text: { type: 'plain_text', text: minute.toString(), emoji: true }, value: minute.toString() };
        minuteOptionsArr.push(minuteObj);
        if (user.notifications.time.minute === minute.toString()) {
            initialMinuteOptionObj = minuteObj;
        }
    }

    view.blocks = blocksArr;

    // Days
    view.blocks[0].element.options = dayOptionsArr; // add day options array to message blocks
    if (initialDayOptionsArr.length > 0) {
        view.blocks[0].element.initial_options = initialDayOptionsArr;
    } // add initial selected options if applicable

    // Hours
    view.blocks[1].element.options = hourOptionsArr; // add day options array to message blocks
    if (initialHourOptionObj) view.blocks[1].element.initial_option = initialHourOptionObj;

    // Minutes
    view.blocks[2].element.options = minuteOptionsArr; // add day options array to message blocks
    if (initialMinuteOptionObj) view.blocks[2].element.initial_option = initialMinuteOptionObj;

    return view;
};

export const composeDeparturesMsg = async (user, station, departures) => {
    const msgFieldsArray = [];

    for (let i = 0; i < departures.length && i <= 9; i += 1) { // limit to 10 entries
        const { direction } = departures[i];
        const plannedDateTime = departures[i].plannedDateTime.substr(11, 5);
        const actualDateTime = departures[i].actualDateTime.substr(11, 5);
        const { plannedTrack } = departures[i];
        const { actualTrack } = departures[i];
        const { cancelled } = departures[i];
        const warnings = departures[i].messages;

        let directionStr = '';
        let dateStr = '';
        let trackStr = '';
        let warningStr = '';

        // find if train was cancelled
        if (!cancelled) {
            directionStr = `*${direction}*`;
        } else {
            directionStr = `*~${direction}~* \`Cancelled\``;
            // console.log('Train cancelled. Adding to message.')
        }

        // find if train is leaving on time
        if (actualDateTime === plannedDateTime) {
            dateStr = `\n${actualDateTime}`;
        } else {
            dateStr = `\n~${plannedDateTime}~ \`${actualDateTime}\``;
            // console.log('Train delay detected. Adjusting message.')
        }

        // find potential platform change
        if (actualTrack === undefined) {
            trackStr = `\nPlatform ${plannedTrack}`;
        } else {
            trackStr = `\n~Platform ${plannedTrack}~ \`Platform ${actualTrack}\``;
        }

        // find potential warning
        if (warnings !== undefined) {
            for (let p = 0; p < warnings.length; p += 1) {
                if (warnings[p].style === 'WARNING') {
                    warningStr += `${'\n_'}${warnings[p].message}_`;
                }
            }
        }

        // compose new addition to fields value
        const msgFieldsArrayValue = {
            type: 'mrkdwn',
            text: `${directionStr + dateStr + trackStr + warningStr}\n`,
        };

        // append to fields array, which will be inserted into blocks message below
        msgFieldsArray.push(msgFieldsArrayValue);
    }

    // construct and return message
    return {
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `<@${user.userId}>, here are the upcoming train departures from *${station.label}*:`,
                },
            },
            {
                type: 'section',
                fields: msgFieldsArray,
            },
        ],
    };
};

export const composeUpdateDefaultMsg = (user, station) => (
    {
        blocks: [
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `Your current default station is *${user.station}*. Would you like to update this to *${station.label}*?`,
                    },
                ],
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        style: 'primary',
                        action_id: 'updateDefaultStation',
                        text: {
                            type: 'plain_text',
                            text: 'Update',
                            emoji: true,
                        },
                        value: station.label,
                    },
                ],
            },
        ],
    });
export const composeUpdateDefaultConfirmMsg = (station) => (
    {
        blocks: [
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `Updated default station to: *${station.label}*`,
                    },
                ],
            },
        ],
    });
export const composeSettingsMsg = async (user) => {
    const settingsBlock = {
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: ':gear: Manage Default Station & Notifications',
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Default Station: *${user.station}*\n_You can set your default station easily when you use this bot for the first time: _\`/ns [station]\``,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Notifications: *${user.notifications.enabled ? 'ON' : 'OFF'}*\n_Once you have set your default station, you can have the bot send you a notification at a time of your choosing, for example 10 minutes before you usually leave work._`,
                },
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        style: user.notifications.enabled ? 'danger' : 'primary',
                        action_id: user.notifications.enabled ? 'clearNotifications' : 'updateNotifications',
                        text: {
                            type: 'plain_text',
                            text: user.notifications.enabled ? 'Turn Off' : 'Turn On',
                            emoji: true,
                        },
                        value: 'click_me_hue',
                    },
                ],
            },
        ],
    };

    const extraBtn = {
        type: 'button',
        style: 'primary',
        action_id: 'updateNotifications',
        text: {
            type: 'plain_text',
            text: 'Update Notifications',
            emoji: true,
        },
        value: 'click_me_hue',
    };

    const daysArr = [
        { dayCode: '0', dayName: 'Monday' },
        { dayCode: '1', dayName: 'Tuesday' },
        { dayCode: '2', dayName: 'Wednesday' },
        { dayCode: '3', dayName: 'Thursday' },
        { dayCode: '4', dayName: 'Friday' },
        { dayCode: '5', dayName: 'Saturday' },
        { dayCode: '6', dayName: 'Sunday' },
    ];

    let daysStr = '';
    for (let i = 0; i < user.notifications.days.length; i += 1) {
        daysStr += i < user.notifications.days.length - 1 ? `${daysArr[user.notifications.days[i]].dayName}, ` : daysArr[user.notifications.days[i]].dayName;
    }

    const hourStr = user.notifications.time.hour < 10 ? `0${user.notifications.time.hour}` : user.notifications.time.hour;
    const minuteStr = user.notifications.time.minute < 10 ? `0${user.notifications.time.minute}` : user.notifications.time.minute;

    const contextBlock = {
        type: 'context',
        elements: [
            {
                type: 'mrkdwn',
                text: `Notifications will be sent on *${daysStr}* at *${hourStr}:${minuteStr}*.`,
            },
        ],
    };

    if (user.notifications.enabled) {
        settingsBlock.blocks[3].elements.push(extraBtn);
        settingsBlock.blocks.push(contextBlock);
    }

    return settingsBlock;
};
