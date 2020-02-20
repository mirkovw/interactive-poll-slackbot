import config from 'config';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getCellArr } from '../utils';

const doc = new GoogleSpreadsheet(config.get('sheet.id'));

export const getSheetData = async (index) => {
    await doc.useServiceAccountAuth({
        client_email: config.get('google.client_email'),
        private_key: config.get('google.private_key'),
    });

    await doc.loadInfo();
    return doc.sheetsByIndex[index];
};

export const checkIfCorrect = async (poll, answer) => {
    const pollsRows = await getSheetData(0).then((sheet) => sheet.getRows());
    const [ pollRow ]  = pollsRows.filter((row) => row.UniqueId === poll.uniqueId);
    return pollRow.CorrectOption === answer.value;
};

export const checkIfNew = async (resultRow, poll, user) => {
    const allResultsArr = getCellArr(resultRow.Right).concat(getCellArr(resultRow.Wrong));
    return !allResultsArr.includes(user.id);
};

export const updateResults = async (row, user, answer) => {
    const resultRow = row;
    const responsesRightArr = getCellArr(resultRow.Right);
    const responsesWrongArr = getCellArr(resultRow.Wrong);
    if (answer.correct) {
        responsesRightArr.push(user.id);
        resultRow.Right = responsesRightArr.toString();
        if (user.winner) resultRow.PollWinner = user.id;
    } else {
        responsesWrongArr.push(user.id);
        resultRow.Wrong = responsesWrongArr.toString();
    }
    resultRow.PollResponses = responsesRightArr.length + responsesWrongArr.length;
    await resultRow.save();
};

export const updateUsers = async (user, answer, poll) => {
    const usersSheet = await getSheetData(2);
    const usersRows = await usersSheet.getRows();
    let [userRow] = usersRows.filter((row) => row.UserId === user.id);

    if (userRow === undefined) {
        userRow = await usersSheet.addRow({
            UserId: user.id,
            UserName: user.name,
            Wins: 0,
            Right: 0,
            Wrong: 0,
        });
    }

    if (answer.correct) {
        userRow.Right = parseInt(userRow.Right) + 1;
        if (user.winner) userRow.Wins = parseInt(userRow.Wins) + 1;
    } else {
        userRow.Wrong = parseInt(userRow.Wrong) + 1;
    }
    const participations = getCellArr(userRow.Participations);
    participations.push(poll.uniqueId);
    userRow.Participations = participations.toString();
    await userRow.save();
};
