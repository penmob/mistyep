'use strict';

var expect = require('chai').expect;
var mistyep = require('../index');

describe('#mistyep', function() {
  it('should not correct an expected email address', function() {
    var result = mistyep.email('example@gmail.com');
    expect(result).to.equal('example@gmail.com');
  });
  it('should correct an unexpected email address domain', function() {
    var result = mistyep.email('example@gail.com');
    expect(result).to.equal('example@gmail.com');
  });
  it('should correct an unexpected email address tld', function() {
    var result = mistyep.email('example@gmail.con');
    expect(result).to.equal('example@gmail.com');
  });
  it('should correct an unexpected email address domain & tld', function() {
    var result = mistyep.email('example@gnail.con');
    expect(result).to.equal('example@gmail.com');
  });
  it('should not correct an expected email address with custom domain', function() {
    var result = mistyep.email('example@example.com', {customDomains: ['example']});
    expect(result).to.equal('example@example.com');
  });
  it('should correct an unexpected email address with custom domain', function() {
    var result = mistyep.email('example@exanple.com', {customDomains: ['example']});
    expect(result).to.equal('example@example.com');
  });
  it('should not correct an expected email address with custom tld', function() {
    var result = mistyep.email('example@gmail.ninja', {customTLDs: ['ninja']});
    expect(result).to.equal('example@gmail.ninja');
  });
  it('should correct an unexpected email address with custom tld', function() {
    var result = mistyep.email('example@gmail.ninka', {customTLDs: ['ninja']});
    expect(result).to.equal('example@gmail.ninja');
  });
  it('should not correct an expected email address with custom domain & tld', function() {
    var result = mistyep.email('example@example.ninja', {customDomains: ['example'], customTLDs: ['ninja']});
    expect(result).to.equal('example@example.ninja');
  });
  it('should correct an unexpected email address with custom domain & tld', function() {
    var result = mistyep.email('example@exanple.ninka', {customDomains: ['example'], customTLDs: ['ninja']});
    expect(result).to.equal('example@example.ninja');
  });
  it('should not correct an expected word in the word bank', function() {
    var result = mistyep.custom('testing', ['test', 'testing', 'tester']);
    expect(result).to.equal('testing');
  });
  it('should correct an unexpected word in the word bank', function() {
    var result = mistyep.custom('testingg', ['test', 'testing', 'tester']);
    expect(result).to.equal('testing');
  });
  it('should do nothing if no wordBank is provided in custom()', function() {
    var result = mistyep.custom('testing');
    expect(result).to.equal('testing');
  });
});