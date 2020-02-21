"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compareValues = exports.getDateStr = exports.log = exports.getCellArr = exports.isEmpty = exports.returnRandom = void 0;

var _morgan = _interopRequireDefault(require("morgan"));

var _tracer = _interopRequireDefault(require("tracer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var add0 = function add0(number) {
  return number < 10 ? '0' + number.toString() : number;
};

var returnRandom = function returnRandom(arr) {
  return arr[Math.floor(arr.length * Math.random())];
};

exports.returnRandom = returnRandom;

var isEmpty = function isEmpty(cell) {
  return cell === '' || cell === undefined;
};

exports.isEmpty = isEmpty;

var getCellArr = function getCellArr(results) {
  return isEmpty(results) ? [] : results.split(',');
};

exports.getCellArr = getCellArr;

var log = function () {
  var logger = _tracer["default"].colorConsole();

  logger.requestLogger = (0, _morgan["default"])('dev');
  return logger;
}();

exports.log = log;

var getDateStr = function getDateStr() {
  var date = new Date();
  var year = date.getFullYear();
  var month = add0(date.getMonth() + 1);
  var day = add0(date.getDate());
  var hour = add0(date.getHours() + date.getTimezoneOffset() / 60 + 1);
  var minute = add0(date.getMinutes());
  var dateStr = day + '-' + month + '-' + year + ' ' + hour + ':' + minute;
  return dateStr;
};

exports.getDateStr = getDateStr;

var compareValues = function compareValues(key) {
  var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'asc';
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    var varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    var varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
    var comparison = 0;

    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }

    return order === 'desc' ? comparison * -1 : comparison;
  };
};

exports.compareValues = compareValues;