'use strict';
const apiMap = require('./api');
const endPoints = require('./endpoints');
const normalizeParameters = require('./normalizeParameters');
const request = require('request-promise');
const qs = require('qs');
const _ = require('lodash');

class Ebay {
  constructor({devKey, responseFormat, serviceVersion, sandbox}) {
    if (!devKey) throw new Error('devKey not provided');
    if (responseFormat && !responseFormat.match(/json|xml/i)) throw new Error('Response format must be xml or json');

    this._endPoints = endPoints[sandbox ? 'sandbox' : 'production'];

    let api = _.reduce(apiMap, (prev, cur) => { return prev.concat(_.keys(cur)); }, []);

    // Generate methods for all API
    api.forEach(method => {
      let service = _.findKey(apiMap, method);
      this[method] = new Api(method, this._endPoints[service], {devKey, responseFormat, serviceVersion});
    });
  }
}

// Class used for all generated api methods
class Api {
  constructor(api, endpoint, {devKey, serviceVersion, responseFormat}) {
    this._api = api;
    this._service = [_.findKey(apiMap, this._api)];
    this._field = normalizeParameters[this._service];
    this._endPoint = endpoint;
    this._credentials = {
      [this._field.devKey]: devKey,
      [this._field.serviceVersion]: serviceVersion || '1.13.0',
      [this._field.responseFormat]: responseFormat || 'JSON'
    };
  }

  call(options) {
    // using modified qs here to encode url because of ebay's unconventional api...
    const operation = this._field.operation + '=' + this._api;
    const credentials = qs.stringify(this._credentials, {delimiter: '&'});
    const query = qs.stringify(normalizeQuery(options, this._service + '.' + this._api), {delimiter: '&'});
    const uri = this._endPoint + '?' + operation + '&' + credentials + '&' + query;

    return request(uri);
  }
}

// Validates query and appends @ to detected attributes fields
function normalizeQuery(query, path) {
  if(!_.isPlainObject(query)) throw new TypeError('Query must be an object literal');

  return _.transform(query, (accumulator, value, key) => {
    const list = _.get(apiMap, path);
    const listValue = list[key] || list;

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
  Ebay,
  Api,
  normalizeQuery
};