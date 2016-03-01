import {assert} from 'chai';
import sinon from 'sinon';
import promise from 'bluebird';
import MemoryStream from 'memorystream';
import apiList from '../dist/definitions/index';
import Request from '../dist/Request';
import _ from '../dist/util';

// Mock server setup
const mockHost   = 'http://ebay.test';
const mockPath   = '/';
const mockData   = require('./mocks/data.js');
const mockServer = require('./mocks/server.js');

mockServer(mockHost, mockPath, mockData);

describe('Request', function () {
  const generateRequest = (q) => (new Request(mockHost + mockPath, q || {keywords: 'iphone'}));

  it('Return result in promise', done => {
    const request = generateRequest();

    request.then(d => {
      assert.deepEqual(d, mockData);
      done();
    })
  });

  it('Return result in stream', done => {
    const request = generateRequest();
    const stream  = new MemoryStream(null, {readable: false});

    request.pipe(stream);

    stream.on('finish', () => {
      const result = stream.toString();

      assert.equal(result, JSON.stringify(mockData));

      done()
    })
  });

  it('Get page range', done => {
    const query   = {keywords: 'titan'};
    const request = generateRequest(query);
    const from    = 2;
    const to      = 5;

    request.getPages(from, to).then(d => {
      assert.equal(d.length, 4);

      _.each(d, v => assert.equal(JSON.stringify(v), JSON.stringify(mockData)));

      done();
    });
  });

  it('Return results for all pages', done => {
    const request    = generateRequest();

    request.getAllPages().then(d => {
      assert.equal(d.length, 100);

      _.each(d, v => assert.equal(JSON.stringify(v), JSON.stringify(mockData)));

      done();
    });
  });

  it('Return array of raw request objects for all pages', done => {
    const request         = generateRequest();
    const isRequestObject = v => (v.then && v.pipe && v.on);

    request.getAllPages(false).then(d => {
      assert.equal(d.length, 100);

      _.each(d, v => assert.isOk(isRequestObject(v)));

      done();
    });
  });

  it('Return entry count', done => {
    const request         = generateRequest();
    const getTotalEntries = request.getEntryCount();

    getTotalEntries.then(totalEntries => {
      assert.equal(totalEntries, 20000);
      done();
    });
  });
});