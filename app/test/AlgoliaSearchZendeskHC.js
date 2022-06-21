/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'jsdom-global';

describe('AlgoliasearchZendeskHC', () => {
  let AlgoliasearchZendeskHC;

  beforeEach(function () {
    this.jsdom = jsdom();
    AlgoliasearchZendeskHC = require('../src/AlgoliasearchZendeskHC').default;
  });

  it('should exist', () => {
    expect(AlgoliasearchZendeskHC).toNotBe(undefined);
  });

  it('should throw usage without options', () => {
    expect(() => new AlgoliasearchZendeskHC()).toThrow(/Usage/);
  });

  afterEach(function () {
    this.jsdom();
  });
});
