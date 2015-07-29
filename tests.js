var expect = require('chai').expect,
    app = require('./index.js');

describe('Module tests', function() {
  before(function(done){
    devKey = 'devdummy-24f2-47f4-a685-25d207cf23fe';
    ebay = new app({'SECURITY-APPNAME': devKey, sandbox: true});
    done();
  });

  describe('Config Validations', function() {
    before(function (done) {
      config = ebay.configValidations;
      done();
    });
    it('Reject calls without parameters', function (done) {
      var option = {};
      expect(config.bind(this, option)).to.throw('No parameters defined');
      done();
    });
    it('Reject calls without SECURITY-APPNAME', function(done) {
      var option = {'SERVICE-VERSION':1231212};
      expect(config.bind(this,option)).to.throw('SECURITY-APPNAME must be defined');
      done();
    });
    it('Reject SECURITY-APPNAME that is not 36 characters', function(done) {
      var option = {'SECURITY-APPNAME':'1231212'};
      expect(config.bind(this,option)).to.throw('SECURITY-APPNAME length must be 36 characters long');
      done();
    });
    it('Reject SECURITY-APPNAME that is not a string', function(done) {
      var option = {'SECURITY-APPNAME':1231212};
      expect(config.bind(this,option)).to.throw('SECURITY-APPNAME must be a string');
      done();
    });
    it('Reject RESPONSE-DATA-FORMAT that is not xml/json', function(done) {
      var option = {'SECURITY-APPNAME': devKey , 'RESPONSE-DATA-FORMAT':'hohoho'};
      expect(config.bind(this,option)).to.throw('RESPONSE-DATA-FORMAT must be xml or json');
      done();
    });
    it('Should pass validation', function(done) {
      var option = {'SECURITY-APPNAME': devKey , 'RESPONSE-DATA-FORMAT':'json'};
      expect(config.bind(this, option)).to.not.throw(Error);
      done();
    });
  });

  describe('Call Validations', function() {
    before(function(){
      callValidation = ebay.callValidation;
    });
    it('Match with no error', function() {
      var options = {keywords:'playstation'};
      expect(callValidation.bind(this,'findCompletedItems',options)).to.not.throw(Error);
    });
    it('Throw error for invalid call API name', function() {
      var options = {keywords:'playstation'};
      expect(callValidation.bind(this,'thisdoesnotexist',options)).to.throw('Invalid call');
    });
    it('Throw error for invalid call options', function() {
      var options = {mario:'playstation'};
      expect(callValidation.bind(this,'findCompletedItems',options)).to.throw('Invalid call option, check spelling');
    });
  });

  describe('Query builder', function(){
    it('return query', function(){
      var call = 'findCompletedItems';
      var options = {keywords: 'mario'};
      expect(ebay.buildQuery.call(ebay, call, options))
      .to.equal('?OPERATION-NAME=' + call + '&SECURITY-APPNAME=' + devKey + '&SERVICE-VERSION=1.13.0&RESPONSE-DATA-FORMAT=JSON&keywords=mario');
    });
  });

  describe('Finding api', function(){
    it('Tests ebay call *Internet connection required', function(done){
      this.timeout(10000);
      var call = 'findCompletedItems';
      var options = {keywords: 'mario'};
      ebay.finding(call, options)
      .then(function(res){
        expect(res).to.exist;
        done();
      })
      .catch(function(err){
        expect(err).to.be.undefined;
      });
    });
  });
});