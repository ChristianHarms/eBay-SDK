'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var apiMap = require('./api');
var endPoints = require('./endpoints');
var normalizeParameters = require('./normalizeParameters');
var request = require('request-promise');
var qs = require('qs');
var _ = require('lodash');

var Ebay = function Ebay(_ref) {
  var _this = this;

  var devKey = _ref.devKey;
  var responseFormat = _ref.responseFormat;
  var serviceVersion = _ref.serviceVersion;
  var sandbox = _ref.sandbox;

  _classCallCheck(this, Ebay);

  if (!devKey) throw new Error('devKey not provided');
  if (responseFormat && !responseFormat.match(/json|xml/i)) throw new Error('Response format must be xml or json');

  this._endPoints = endPoints[sandbox ? 'sandbox' : 'production'];

  var api = _.reduce(apiMap, function (prev, cur) {
    return prev.concat(_.keys(cur));
  }, []);

  // Generate methods for all API
  api.forEach(function (method) {
    var service = _.findKey(apiMap, method);
    _this[method] = new Api(method, _this._endPoints[service], { devKey: devKey, responseFormat: responseFormat, serviceVersion: serviceVersion });
  });
};

// Class used for all generated api methods

var Api = function () {
  function Api(api, endpoint, _ref2) {
    var _credentials;

    var devKey = _ref2.devKey;
    var serviceVersion = _ref2.serviceVersion;
    var responseFormat = _ref2.responseFormat;

    _classCallCheck(this, Api);

    this._api = api;
    this._service = [_.findKey(apiMap, this._api)];
    this._field = normalizeParameters[this._service];
    this._endPoint = endpoint;
    this._credentials = (_credentials = {}, _defineProperty(_credentials, this._field.devKey, devKey), _defineProperty(_credentials, this._field.serviceVersion, serviceVersion || '1.13.0'), _defineProperty(_credentials, this._field.responseFormat, responseFormat || 'JSON'), _credentials);
  }

  _createClass(Api, [{
    key: 'call',
    value: function call(options) {
      // using modified qs here to encode url because of ebay's unconventional api...
      var operation = this._field.operation + '=' + this._api;
      var credentials = qs.stringify(this._credentials, { delimiter: '&' });
      var query = qs.stringify(normalizeQuery(options, this._service + '.' + this._api), { delimiter: '&' });
      var uri = this._endPoint + '?' + operation + '&' + credentials + '&' + query;

      return request(uri);
    }
  }]);

  return Api;
}();

// Validates query and appends @ to detected attributes fields

function normalizeQuery(query, path) {
  if (!_.isPlainObject(query)) throw new TypeError('Query must be an object literal');

  return _.transform(query, function (accumulator, value, key) {
    var list = _.get(apiMap, path);
    var listValue = list[key] || list;

    // Validations
    if (!value) throw new Error(key + ' argument is empty');
    if (!list[key]) throw new Error('Invalid argument: ' + key);

    // Add @ to attributes
    if (listValue === 'attribute') accumulator['@' + key] = value;
    if (listValue === 'value') accumulator[key] = value;

    // Recursively inspect all elements in object
    if (_.isPlainObject(value) && _.isPlainObject(listValue)) return accumulator[key] = normalizeQuery(value, path + '.' + key);
  });
}

module.exports = {
  Ebay: Ebay,
  Api: Api,
  normalizeQuery: normalizeQuery
};
//# sourceMappingURL=index.js.map