import config from 'config';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getDateStr, log } from '../utils';
import { composePollMsg } from '../slack/blocks';

const doc = new GoogleSpreadsheet(config.get('sheet.id'));

export const getSheetData = async (index) => {
    await doc.useServiceAccountAuth({
        client_email: config.get('google.client_email'),
        private_key: config.get('google.private_key'),
    });

    await doc.loadInfo();
    return await doc.sheetsByIndex[index];
};

const isEmpty = (cell) => cell === '' || cell === undefined;

export const checkAnswer = async (pollId, answer) => {
    const sheetRows = await getSheetData(0).then((sheet)=>sheet.getRows());
    const [ poll ]  = sheetRows.filter((row) => row.UniqueId === pollId);
    return poll.CorrectOption === answer;
};

export const checkIfNewAnswer = async (pollId, userId) => {
    const sheetRows = await getSheetData(2).then((sheet)=>sheet.getRows());
    const user = sheetRows.filter((row) => row.UserId === userId);
    if (user.length === 0) return true; // new user
    if (user[0].Participations !== undefined) return !user[0].Participations.split(',').includes(pollId);
    return true;
};

export const updateResults = async (pollId, userId, answerCorrect) => {
    const allResultRows = await getSheetData(1).then((sheet) => sheet.getRows());
    const [resultRow] = allResultRows.filter((row) => row.UniqueId === pollId);
    let isWinnerBool;
    // first check if user is a WINNERRRR
    if (isEmpty(resultRow.PollWinner) && answerCorrect) {
        resultRow.PollWinner = userId;
        isWinnerBool = true;
    }
    // push userID to either right/wrong cell
    const rwCell = answerCorrect ? resultRow.Right : resultRow.Wrong;
    // let userList = isEmpty(rwCell) ? [] : rwCell.split(',');
    const userList = isEmpty(rwCell) ? [] : rwCell.split(',');
    userList.push(userId);
    if (answerCorrect) {
        resultRow.Right = userList.toString();
    } else {
        resultRow.Wrong = userList.toString();
    }
    // update amount of responses
    let responsesRight = isEmpty(resultRow.Right) ? 0 : resultRow.Right.split(',').length;
    let responsesWrong = isEmpty(resultRow.Wrong) ? 0 : resultRow.Wrong.split(',').length;
    let currentResponses = responsesRight + responsesWrong;
    resultRow.PollResponses = currentResponses;
    // save results to row
    await resultRow.save();
    return {isWinner: isWinnerBool};
};

export const updateUsers = async (userId, userName, isWinner, isCorrect, pollId) => {
    const userSheet = await getSheetData(2);
    const allUserRows = await userSheet.getRows();
    let [userRow] = allUserRows.filter((row) => row.UserId === userId);

    if (userRow === undefined) {
        log.info('new user apparently')
        userRow = await userSheet.addRow({
            UserId: userId,
            UserName: userName,
            Wins: 0,
            Right: 0,
            Wrong: 0,
        });
        await userRow.save();
    }

    if (isCorrect) {
        userRow.Right = parseInt(userRow.Right) + 1;
        if (isWinner) userRow.Wins = parseInt(userRow.Wins) + 1;
    } else {
        userRow.Wrong = parseInt(userRow.Wrong) + 1;
    }
    const participations = isEmpty(userRow.Participations) ? [] : userRow.Participations.split(',');
    participations.push(pollId);
    userRow.Participations = participations.toString();
    await userRow.save();
};
