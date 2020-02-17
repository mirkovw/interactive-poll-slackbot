import config from 'config';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { log } from '../utils';

// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet(config.get('sheet.id'));

// use service account creds

export default async () => {
    await doc.useServiceAccountAuth({
        client_email: config.get('google.client_email'),
        private_key: config.get('google.private_key'),
    });

    await doc.loadInfo();

    log.info(doc.title);

    const sheet = await doc.sheetsByIndex[1]; // or use doc.sheetsById[id]
    log.info(sheet.title);
    log.info(sheet.rowCount);

    // log.info(sheet.row[0]);

    const rows = await sheet.getRows();

    log.info(rows[0]);
    //log.info(rows[0].UniqueId)


    //console.log(Object.assign({}, rows[0].UniqueId));


    // log.info('total questions: ' + rows.length);

    // const availableRows = rows.filter((row) => row.Used === 'NO');

    // log.info('available questions: ' + availableRows.length);


    // log.info(rows[0].Question);

    // log.info(rows[0].Answers)

    // rows[0].Answers = '8';

    // log.info(rows[0].Answers)

    // await rows[0].save();

    // let answerersArray = rows[0].Right.split(',');

    // answerersArray.push("Johnny");

    // log.info(answerersArray.toString());

    // rows[0].Right = answerersArray.toString();

    // await rows[0].save();





    return 'ok';

};
