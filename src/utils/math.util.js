"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.BN = exports.BN_ROUNDING = void 0;
var bignumber_js_1 = require("bignumber.js");
var decimals_enum_1 = require("@/enums/decimals.enum");
var BN_ROUNDING;
(function (BN_ROUNDING) {
    BN_ROUNDING[BN_ROUNDING["DEFAULT"] = 4] = "DEFAULT";
    BN_ROUNDING[BN_ROUNDING["UP"] = 0] = "UP";
    BN_ROUNDING[BN_ROUNDING["DOWN"] = 1] = "DOWN";
    BN_ROUNDING[BN_ROUNDING["CEIL"] = 2] = "CEIL";
    BN_ROUNDING[BN_ROUNDING["FLOOR"] = 3] = "FLOOR";
    BN_ROUNDING[BN_ROUNDING["HALF_UP"] = 4] = "HALF_UP";
    BN_ROUNDING[BN_ROUNDING["HALF_DOWN"] = 5] = "HALF_DOWN";
    BN_ROUNDING[BN_ROUNDING["HALF_EVEN"] = 6] = "HALF_EVEN";
    BN_ROUNDING[BN_ROUNDING["HALF_CEIL"] = 7] = "HALF_CEIL";
    BN_ROUNDING[BN_ROUNDING["HALF_FLOOR"] = 8] = "HALF_FLOOR";
})(BN_ROUNDING = exports.BN_ROUNDING || (exports.BN_ROUNDING = {}));
bignumber_js_1["default"].config({
    DECIMAL_PLACES: 0,
    ROUNDING_MODE: BN_ROUNDING.DEFAULT,
    FORMAT: {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3
    }
});
var BN = /** @class */ (function () {
    function BN(bigLike, cfg) {
        _BN_bn.set(this, void 0);
        _BN_cfg.set(this, void 0);
        __classPrivateFieldSet(this, _BN_bn, this._bn(bigLike, cfg), "f");
        __classPrivateFieldSet(this, _BN_cfg, cfg, "f");
    }
    BN.isBn = function (arg) {
        return arg instanceof BN;
    };
    BN.min = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new BN(bignumber_js_1["default"].minimum.apply(bignumber_js_1["default"], args.map(function (e) { return __classPrivateFieldGet(new BN(e), _BN_bn, "f"); })));
    };
    BN.max = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new BN(bignumber_js_1["default"].maximum.apply(bignumber_js_1["default"], args.map(function (e) { return __classPrivateFieldGet(new BN(e), _BN_bn, "f"); })));
    };
    BN.prototype.mul = function (other, cfg) {
        if (cfg === void 0) { cfg = __classPrivateFieldGet(this, _BN_cfg, "f"); }
        return new BN(__classPrivateFieldGet(this, _BN_bn, "f").multipliedBy(this._bn(other)), cfg);
    };
    BN.prototype.div = function (other, cfg) {
        if (cfg === void 0) { cfg = __classPrivateFieldGet(this, _BN_cfg, "f"); }
        return new BN(__classPrivateFieldGet(this, _BN_bn, "f").dividedBy(this._bn(other)), cfg);
    };
    BN.prototype.add = function (other, cfg) {
        if (cfg === void 0) { cfg = __classPrivateFieldGet(this, _BN_cfg, "f"); }
        return new BN(__classPrivateFieldGet(this, _BN_bn, "f").plus(this._bn(other)), cfg);
    };
    BN.prototype.sub = function (other, cfg) {
        if (cfg === void 0) { cfg = __classPrivateFieldGet(this, _BN_cfg, "f"); }
        return new BN(__classPrivateFieldGet(this, _BN_bn, "f").minus(this._bn(other)), cfg);
    };
    BN.prototype.pow = function (other, cfg) {
        if (cfg === void 0) { cfg = __classPrivateFieldGet(this, _BN_cfg, "f"); }
        return new BN(__classPrivateFieldGet(this, _BN_bn, "f").pow(this._bn(other)), cfg);
    };
    /**
     * this > other => 1;
     * this < other => -1;
     * this === other => 0;
     *
     * @param {BnLike} other
     * @returns {number}
     */
    BN.prototype.compare = function (other) {
        return __classPrivateFieldGet(this, _BN_bn, "f").comparedTo(this._bn(other));
    };
    BN.prototype.round = function (precision, mode) {
        return __classPrivateFieldGet(this, _BN_bn, "f").toPrecision(precision, mode);
    };
    BN.prototype.format = function (format) {
        try {
            var _a = format || {}, _b = _a.decimals, decimals = _b === void 0 ? bignumber_js_1["default"].config({}).DECIMAL_PLACES : _b, _c = _a.rounding, rounding = _c === void 0 ? bignumber_js_1["default"].config({}).ROUNDING_MODE : _c, noGroupSeparator = _a.noGroupSeparator, fmt = __rest(_a, ["decimals", "rounding", "noGroupSeparator"]);
            var groupSeparatorFormat = __assign({}, (fmt.groupSeparator
                ? { groupSeparator: fmt.groupSeparator }
                : {}));
            if (noGroupSeparator) {
                groupSeparatorFormat.groupSeparator = '';
            }
            Object.assign(fmt, bignumber_js_1["default"].config({}).FORMAT, groupSeparatorFormat);
            return __classPrivateFieldGet(this, _BN_bn, "f").toFormat(decimals, rounding, fmt);
        }
        catch (error) {
            console.error(error);
            return '—';
        }
    };
    BN.prototype.toFraction = function (decimals) {
        var fr = decimals ? new BN(10).pow(decimals) : BN.TO_WEI_FACTOR;
        return this.mul(fr);
    };
    BN.prototype.fromFraction = function (decimals) {
        var fr = decimals ? new BN(0.1).pow(decimals) : BN.FROM_WEI_FACTOR;
        return this.mul(fr);
    };
    BN.prototype.toWei = function () {
        return this.toFraction();
    };
    BN.prototype.fromWei = function () {
        return this.fromFraction();
    };
    BN.prototype.toString = function () {
        return __classPrivateFieldGet(this, _BN_bn, "f").toFormat({
            groupSeparator: '',
            decimalSeparator: '.',
            fractionGroupSeparator: ''
        });
    };
    BN.prototype.toJSON = function () {
        return this.toString();
    };
    BN.prototype.valueOf = function () {
        return this.toString();
    };
    BN.prototype._bn = function (value, config) {
        var ctor = bignumber_js_1["default"];
        if (config) {
            ctor = ctor.clone();
            ctor.config(__assign(__assign({}, ('decimals' in config ? { DECIMAL_PLACES: config.decimals } : {})), ('rounding' in config ? { ROUNDING_MODE: config.rounding } : {})));
        }
        if (bignumber_js_1["default"].isBigNumber(value)) {
            return value;
        }
        if (value instanceof BN) {
            return __classPrivateFieldGet(value, _BN_bn, "f");
        }
        try {
            return new ctor(value);
        }
        catch (error) {
            throw new TypeError("Cannot convert the given \"".concat(value, "\" to BN!"));
        }
    };
    var _BN_bn, _BN_cfg;
    _BN_bn = new WeakMap(), _BN_cfg = new WeakMap();
    BN.TO_WEI_FACTOR = new BN(10).pow(decimals_enum_1.WEB3_DECIMALS.WEI);
    BN.MIN_WEI_STR = new BN(0.1).pow(decimals_enum_1.WEB3_DECIMALS.WEI).toString();
    BN.FROM_WEI_FACTOR = new BN(0.1).pow(decimals_enum_1.WEB3_DECIMALS.WEI);
    BN.ROUNDING = BN_ROUNDING;
    BN.MAX_UINT256 = new BN(2).pow(256).sub(1);
    return BN;
}());
exports.BN = BN;
