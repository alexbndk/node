"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_ip_1 = tslib_1.__importDefault(require("is-ip"));
var axios_1 = tslib_1.__importDefault(require("axios"));
var axios_fetch_adapter_1 = tslib_1.__importDefault(require("@vespaiach/axios-fetch-adapter"));
var url_join_1 = tslib_1.__importDefault(require("url-join"));
var lru_cache_1 = tslib_1.__importDefault(require("lru-cache"));
var CACHE_MAX = 4096; // max number of items
var CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours
var DEFAULT_IP = 'DEFAULT_IP';
var VALID_FIELDS = [
    'ip',
    'is_eu',
    'city',
    'region',
    'region_code',
    'country_name',
    'country_code',
    'continent_name',
    'continent_code',
    'latitude',
    'longitude',
    'asn',
    'organisation',
    'postal',
    'calling_code',
    'flag',
    'emoji_flag',
    'emoji_unicode',
    'carrier',
    'languages',
    'currency',
    'time_zone',
    'threat',
    'count',
    'status',
];
var BASE_URL = 'https://api.ipdata.co/';
function isValidIP(ip) {
    return ip === DEFAULT_IP || is_ip_1.default(ip);
}
function isValidSelectField(field) {
    var index = VALID_FIELDS.indexOf(field);
    if (index === -1) {
        throw new Error(field + " is not a valid field.");
    }
    return true;
}
function isValidFields(fields) {
    var _a;
    if (((_a = fields) === null || _a === void 0 ? void 0 : _a.length) === undefined) {
        throw new Error('Fields should be an array.');
    }
    fields.forEach(function (field) {
        var index = VALID_FIELDS.indexOf(field);
        if (index === -1) {
            throw new Error(field + " is not a valid field.");
        }
    });
    return true;
}
var IPData = /** @class */ (function () {
    function IPData(apiKey, cacheConfig) {
        if (!apiKey) {
            throw new Error('An API key is required.');
        }
        this.axios = axios_1.default.create({
            adapter: axios_fetch_adapter_1.default,
        });
        this.apiKey = apiKey;
        this.cache = new lru_cache_1.default(tslib_1.__assign({ max: CACHE_MAX, maxAge: CACHE_MAX_AGE }, cacheConfig));
    }
    IPData.prototype.lookup = function (ip, selectField, fields) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var params, url, response, data, e_1, response;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        params = { 'api-key': this.apiKey };
                        url = ip ? url_join_1.default(BASE_URL, ip) : BASE_URL;
                        if (ip && !isValidIP(ip)) {
                            throw new Error(ip + " is an invalid IP address.");
                        }
                        if (this.cache.has(ip || DEFAULT_IP)) {
                            return [2 /*return*/, this.cache.get(ip || DEFAULT_IP)];
                        }
                        if (selectField && fields) {
                            throw new Error('The selectField and fields parameters cannot be used at the same time.');
                        }
                        if (selectField && isValidSelectField(selectField)) {
                            url = url_join_1.default(url, selectField);
                        }
                        if (fields && isValidFields(fields)) {
                            params.fields = fields.join(',');
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.axios.get(url, { params: params })];
                    case 2:
                        response = _b.sent();
                        data = tslib_1.__assign(tslib_1.__assign({}, response.data), { status: response.status });
                        if (selectField) {
                            data = (_a = {}, _a[selectField] = response.data, _a.status = response.status, _a);
                        }
                        this.cache.set(ip || DEFAULT_IP, data);
                        return [2 /*return*/, this.cache.get(ip || DEFAULT_IP)];
                    case 3:
                        e_1 = _b.sent();
                        response = e_1.response;
                        if (response) {
                            return [2 /*return*/, tslib_1.__assign(tslib_1.__assign({}, response.data), { status: response.status })];
                        }
                        throw e_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    IPData.prototype.bulkLookup = function (ips, fields) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var params, responses, bulk, response_1, e_2, response;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = { 'api-key': this.apiKey };
                        responses = [];
                        bulk = [];
                        if (ips.length < 2) {
                            throw new Error('Bulk Lookup requires more than 1 IP Address in the payload.');
                        }
                        ips.forEach(function (ip) {
                            if (!isValidIP(ip)) {
                                throw new Error(ip + " is an invalid IP address.");
                            }
                            if (_this.cache.has(ip)) {
                                responses.push(_this.cache.get(ip));
                            }
                            else {
                                bulk.push(ip);
                            }
                        });
                        if (fields && isValidFields(fields)) {
                            params.fields = fields.join(',');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(bulk.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.axios.post(url_join_1.default(BASE_URL, 'bulk'), bulk, { params: params })];
                    case 2:
                        response_1 = _a.sent();
                        response_1.data.forEach(function (info) {
                            _this.cache.set(info.ip, tslib_1.__assign(tslib_1.__assign({}, info), { status: response_1.status }));
                            responses.push(_this.cache.get(info.ip));
                        });
                        _a.label = 3;
                    case 3: return [2 /*return*/, responses];
                    case 4:
                        e_2 = _a.sent();
                        response = e_2.response;
                        if (response) {
                            return [2 /*return*/, tslib_1.__assign(tslib_1.__assign({}, response.data), { status: response.status })];
                        }
                        throw e_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return IPData;
}());
exports.default = IPData;
//# sourceMappingURL=ipdata.js.map