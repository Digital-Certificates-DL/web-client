"use strict";
exports.__esModule = true;
exports.DateUtil = void 0;
var dayjs_1 = require("dayjs");
var relativeTime_1 = require("dayjs/plugin/relativeTime");
dayjs_1["default"].extend(relativeTime_1["default"]);
var DateUtil = /** @class */ (function () {
    function DateUtil() {
    }
    Object.defineProperty(DateUtil, "ISOFormat", {
        get: function () {
            return 'YYYY-MM-DDT00:00:00+00:00';
        },
        enumerable: false,
        configurable: true
    });
    DateUtil.toISO = function (date, format) {
        return this._instance(date, format).format(this.ISOFormat);
    };
    DateUtil.toTimestamp = function (date, format) {
        return this._instance(date, format).unix();
    };
    DateUtil.fromTimestampSec = function (timestamp) {
        return dayjs_1["default"].unix(timestamp);
    };
    DateUtil._instance = function (date, format) {
        return format ? (0, dayjs_1["default"])(date, format) : (0, dayjs_1["default"])(date);
    };
    DateUtil.timeLeft = function (date) {
        if (!date)
            return 0;
        var currentDate = this._instance();
        var targetDate = this._instance(date);
        return targetDate.diff(currentDate, 'ms');
    };
    DateUtil.diffs = function (checkingDate, targetDate) {
        return this._instance(checkingDate).diff(this._instance(targetDate));
    };
    DateUtil.format = function (date, format) {
        return this._instance(date).format(format);
    };
    DateUtil.formatFromNow = function (date) {
        return (0, dayjs_1["default"])(date).fromNow();
    };
    return DateUtil;
}());
exports.DateUtil = DateUtil;
