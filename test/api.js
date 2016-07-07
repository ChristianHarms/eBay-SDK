import {assert} from 'chai';
import sinon from 'sinon';
import mock from './mocks/server';
import {each, values} from '../dist/util';
import {normalizeQuery, Api} from '../dist/api';
import apiList from '../dist/definitions/index';
import {fieldNames} from '../dist/constants';

describe('Api', () => {
  const profile = {devKey: 123};

  it('Interface', () => {
    const api = new Api('shopping', 'GetUserProfile', 'url', profile);

    assert.property(api, 'call');
  });

  it('Call returns a promise + stream interface', () => {
    const host = 'http://google.com';
    const path = '/';
    const operation = 'GetUserProfile';
    const api = apiList['shopping'][operation];

    mock(host, path, {});

    const call = new Api(operation, host + path, api, profile).call();

    assert.property(call, 'then');
    assert.property(call, 'on');
    assert.property(call, 'pipe');
  });

});