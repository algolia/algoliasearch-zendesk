/* eslint-env mocha */

import jsdom from 'jsdom-global';

import expect from 'expect';

describe('AlgoliasearchZendeskHC', () => {
  let AlgoliasearchZendeskHC;

  before(function () {
    this.jsdom = jsdom();
    AlgoliasearchZendeskHC = require('../src/AlgoliasearchZendeskHC.js').default;
  });

  it('should exist', () => {
    expect(AlgoliasearchZendeskHC).toNotBe(undefined);
  });

  it('should throw usage without options', () => {
    expect(() => (new AlgoliasearchZendeskHC())).toThrow(/Usage/);
  });

  after(function () {
    this.jsdom();
  });
});
