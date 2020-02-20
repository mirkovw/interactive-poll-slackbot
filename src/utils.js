import morgan from 'morgan';
import tracer from 'tracer';

const add0 = (number) => number < 10 ? '0' + number.toString() : number;
export const returnRandom = (arr) => arr[Math.floor(arr.length * Math.random())];
export const isEmpty = (cell) => cell === '' || cell === undefined;
export const getCellArr = (results) => isEmpty(results) ? [] : results.split(',');

export const log = (() => {
    const logger = tracer.colorConsole();
    logger.requestLogger = morgan('dev');
    return logger;
})();

export const getDateStr = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = add0(date.getMonth() + 1);
    const day = add0(date.getDate());
    const hour = add0((date.getHours() + (date.getTimezoneOffset() / 60)) + 1);
    const minute = add0(date.getMinutes());
    const dateStr = day + '-' + month + '-' + year + ' ' + hour + ':' + minute;
    return dateStr;
};
