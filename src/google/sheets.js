import config from 'config';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { log } from '../utils';

// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet(config.get('sheet.id'));

export default async (index) => {
    log.info(`getting sheet ${index}`);

    await doc.useServiceAccountAuth({
        client_email: config.get('google.client_email'),
        private_key: config.get('google.private_key'),
    });

    await doc.loadInfo();
    const sheet = await doc.sheetsByIndex[index];
    const rows = await sheet.getRows();
    return rows;
};
