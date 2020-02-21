import morgan from 'morgan';
import tracer from 'tracer';

const add0 = (number) => (number < 10 ? `0${number.toString()}` : number);
export const returnRandom = (arr) => arr[Math.floor(arr.length * Math.random())];
export const isEmpty = (cell) => cell === '' || cell === undefined;
export const getCellArr = (results) => (isEmpty(results) ? [] : results.split(','));

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
    const dateStr = `${day}-${month}-${year} ${hour}:${minute}`;
    return dateStr;
};


export const compareValues = (key, order = 'asc') => function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
    }

    const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
        comparison = 1;
    } else if (varA < varB) {
        comparison = -1;
    }
    return (
        (order === 'desc') ? (comparison * -1) : comparison
    );
};
