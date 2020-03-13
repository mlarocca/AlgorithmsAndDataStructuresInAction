import Trie from '../../src/trie/trie.js';
import { ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';
import { testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING = (fname, val, pname = 'key') => `Illegal argument for ${fname}: ${pname} = ${val} must be a non-empty string`;

describe('Trie API', () => {

  it('# should have a constructor method', function () {
    Trie.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let trie = new Trie();

    let methods = ['constructor', 'isEmpty', 'put', 'get', 'delete', 'contains', 'longestPrefixOf', 'keysWithPrefix', 'keys', 'items'];
    let attributes = ['size'];
    testAPI(trie, attributes, methods);
  });
});

describe('Trie Creation', () => {
  it('# Constructor shoulf take no arguments', function () {
    Trie.length.should.equal(0);
    expect(() => new Trie()).not.to.throw();
  });
});

describe('Attributes', () => {
  describe('size', () => {
    describe('Behaviour', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should be 0 for brand new tries', () => {
        trie.size.should.equal(0);
      });

      it('should account for keys added to the trie', () => {
        trie.size.should.equal(0);
        trie.put('abc');
        trie.size.should.equal(1);
        trie.put('abcd');
        trie.size.should.equal(2);
      });

      it('should not increase for updated keys', () => {
        trie.size.should.equal(0);
        trie.put('abc');
        trie.size.should.equal(1);
        trie.put('abc');
        trie.size.should.equal(1);
      });

      it('should account for deleted keys', () => {
        trie.size.should.equal(0);
        trie.put('abc');
        trie.size.should.equal(1);
        trie.delete('abc');
        trie.size.should.equal(0);
        let keys = ['a', 'b', 'ab', 'abc', 'abcd', '1', '123', '12'];
        let n = keys.length;
        keys.forEach((k, i) => {
          trie.put(k);
          trie.size.should.equal(i + 1);
        });
        trie.size.should.equal(n);
        keys.forEach((k, i) => {
          trie.delete(k);
          trie.size.should.equal(n - i - 1);
        });
        trie.size.should.equal(0);
        trie.put('abc');
        trie.size.should.equal(1);
      });
    });
  });
});

describe('Methods', () => {
  describe('put()', () => {
    describe('API', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should throw when no key is passed', () => {
        expect(() => trie.put(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => trie.put(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', null));
        expect(() => trie.put(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', 2));
        expect(() => trie.put([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', []));
        expect(() => trie.put({ '4': 4 })).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', { '4': 4 }));
      });

      it('should throw with non-empty strings', () => {
        expect(() => trie.put('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', ''));
      });

      it('shouldn\'t throw with non empty strings', () => {
        expect(() => trie.put('a')).not.to.throw();
        expect(() => trie.put('0')).not.to.throw();
        expect(() => trie.put('this is a test')).not.to.throw();
        expect(() => trie.put('Aa;&1-\\@*Z')).not.to.throw();
      });

      it('should accept any value for the second parameter (defaulting to null)', () => {
        expect(() => trie.put('a', 1)).not.to.throw();
        expect(() => trie.put('0', null)).not.to.throw();
        expect(() => trie.put('this is a test', 'x')).not.to.throw();
        expect(() => trie.put('Aa;&1-\\@*Z', [])).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should return the trie itself', () => {
        trie.put('1').should.equal(trie);
      });

      it('should increment size after putting a new key', () => {
        trie.size.should.equal(0);
        trie.put('abc');
        trie.size.should.equal(1);
        trie.put('abcd');
        trie.size.should.equal(2);
        trie.put('ab');
        trie.size.should.equal(3);
      });

      it('should NOT increment size after putting a new value for an existing key', () => {
        trie.size.should.equal(0);
        trie.put('abc');
        trie.size.should.equal(1);
        trie.put('abc');
        trie.size.should.equal(1);
        trie.put('abc', 123);
        trie.size.should.equal(1);
      });

      it('should get the correct value after putting it', () => {
        trie.put('abc');
        expect(trie.get('abc')).to.be.eql(null);
        trie.put('x', 1);
        trie.get('x').should.equal(1);
        trie.put('ab', 123);
        expect(trie.get('abc')).to.be.eql(null);
        trie.get('x').should.equal(1);
        trie.get('ab').should.equal(123);
      });

      it('should overwrite the value associated with an existing key', () => {
        trie.put('abc');
        expect(trie.get('abc')).to.be.eql(null);
        trie.put('x', 1);
        trie.get('x').should.equal(1);
        trie.put('abc', 123);
        trie.get('abc').should.equal(123);
        trie.get('x').should.equal(1);
      });
    });
  });

  describe('get()', () => {
    describe('API', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should throw when no key is passed', () => {
        expect(() => trie.get(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => trie.get(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', null));
        expect(() => trie.get(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', 2));
        expect(() => trie.get([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', []));
        expect(() => trie.get({ '4': 4 })).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', { '4': 4 }));
        let f = () => '4';
        expect(() => trie.get(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', f));
      });

      it('should throw with non-empty strings', () => {
        expect(() => trie.get('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', ''));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => trie.get('a')).not.to.throw();
        expect(() => trie.get('0')).not.to.throw();
        expect(() => trie.get('this is a test')).not.to.throw();
        expect(() => trie.get('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should return undefined for never inserted keys', () => {
        expect(trie.get('abc')).to.be.eql(undefined);
        expect(trie.get('xyzw')).to.be.eql(undefined);
        trie.put('x', 1);
        expect(trie.get('xyzw')).to.be.eql(undefined);
      });

      it('should get the correct value after putting it', () => {
        trie.put('abc');
        expect(trie.get('abc')).to.be.eql(null);
        trie.put('x', 1);
        trie.get('x').should.equal(1);
        trie.put('ab', 123);
        expect(trie.get('abc')).to.be.eql(null);
        trie.get('x').should.equal(1);
        trie.get('ab').should.equal(123);
      });

      it('should get the latest the value associated with existing key', () => {
        trie.put('abc');
        expect(trie.get('abc')).to.be.eql(null);
        trie.put('x', 1);
        trie.get('x').should.equal(1);
        trie.put('abc', 123);
        trie.get('abc').should.equal(123);
        trie.get('x').should.equal(1);
        trie.put('x', '1');
        trie.get('abc').should.equal(123);
        trie.get('x').should.equal('1');
      });

      it('should be consistent over multiple calls', () => {
        trie.put('abc');
        expect(trie.get('abc')).to.be.eql(null);
        expect(trie.get('abc')).to.be.eql(null);
        trie.put('x', 1);
        trie.get('x').should.equal(trie.get('x'));
      });

      it('should return undefined for deleted keys', () => {
        trie.put('abc', []);
        expect(trie.get('abc')).to.be.eql([]);
        trie.delete('abc');
        expect(trie.get('abc')).to.be.eql(undefined);
      });
    });
  });

  describe('delete()', () => {
    describe('API', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should throw when no key is passed', () => {
        expect(() => trie.delete(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => trie.delete(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', null));
        expect(() => trie.delete(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', 2));
        expect(() => trie.delete([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', []));
        expect(() => trie.delete({ '4': 4 })).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', { '4': 4 }));
        let f = () => '4';
        expect(() => trie.delete(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', f));
      });

      it('should throw with non-empty strings', () => {
        expect(() => trie.delete('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', ''));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => trie.delete('a')).not.to.throw();
        expect(() => trie.delete('0')).not.to.throw();
        expect(() => trie.delete('this is a test')).not.to.throw();
        expect(() => trie.delete('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should return false for never inserted keys', () => {
        trie.delete('abc').should.be.false();
        trie.delete('xyzw').should.be.false();
        trie.put('x', 1);
        trie.delete('xyzw').should.be.false();
      });

      it('should return true for deleted keys, and actually remove them from the trie', () => {
        trie.put('abc');
        expect(trie.get('abc')).to.be.eql(null);
        expect(trie.delete('abc')).to.be.eql(true);
        expect(trie.get('abc')).to.be.eql(undefined);
      });

      it('should not affect prefixes of the key deleted', () => {
        trie.put('abc', 4);
        trie.put('ab', 44);
        trie.put('a', 444);
        expect(trie.get('abc')).to.be.eql(4);
        expect(trie.get('ab')).to.be.eql(44);
        expect(trie.get('a')).to.be.eql(444);
        expect(trie.delete('abc')).to.be.eql(true);
        expect(trie.get('abc')).to.be.eql(undefined);
        expect(trie.get('ab')).to.be.eql(44);
        expect(trie.get('a')).to.be.eql(444);
      });


      it('should not affect keys of which the deleted key is a prefix', () => {
        trie.put('abc', 4);
        trie.put('ab', 44);
        trie.put('a', 444);
        expect(trie.get('abc')).to.be.eql(4);
        expect(trie.get('ab')).to.be.eql(44);
        expect(trie.get('a')).to.be.eql(444);
        expect(trie.delete('a')).to.be.eql(true);
        expect(trie.get('abc')).to.be.eql(4);
        expect(trie.get('ab')).to.be.eql(44);
        expect(trie.get('a')).to.be.eql(undefined);
      });
    });
  });

  describe('contains()', () => {
    describe('API', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should throw when no key is passed', () => {
        expect(() => trie.contains(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => trie.contains(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', null));
        expect(() => trie.contains(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', 2));
        expect(() => trie.contains([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', []));
        expect(() => trie.contains({ '4': 4 })).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', { '4': 4 }));
        let f = () => '4';
        expect(() => trie.contains(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', f));
      });

      it('should throw with non-empty strings', () => {
        expect(() => trie.contains('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', ''));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => trie.contains('a')).not.to.throw();
        expect(() => trie.contains('0')).not.to.throw();
        expect(() => trie.contains('this is a test')).not.to.throw();
        expect(() => trie.contains('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should return false for never inserted keys', () => {
        trie.contains('abc').should.be.false();
        trie.contains('xyzw').should.be.false();
        trie.put('x', 1);
        trie.contains('xyzw').should.be.false();
      });

      it('should return true for keys in the trie', () => {
        trie.put('abc');
        trie.contains('abc').should.be.true();
        trie.put('x', 1);
        trie.contains('x').should.be.true();
        trie.put('ab', 123);
        trie.contains('abc').should.be.true();
        trie.contains('x').should.be.true();
        trie.contains('ab').should.be.true();
      });

      it('should return true for updated keys', () => {
        trie.contains('abc').should.be.false();
        trie.put('abc');
        trie.contains('abc').should.be.true();
        trie.put('x', 1);
        trie.contains('x').should.be.true();
        trie.put('abc', 123);
        trie.contains('abc').should.be.true();
        trie.contains('x').should.be.true();
      });

      it('should return false for deleted keys', () => {
        trie.put('abc', []);
        trie.contains('abc').should.be.true();
        trie.delete('abc');
        trie.contains('abc').should.be.false();
      });
    });
  });

  describe('isEmpty()', () => {
    describe('API', () => {
      it('should take no parameters', () => {
        new Trie().isEmpty.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should return false for brand new tries', () => {
        trie.isEmpty().should.be.true();
      });

      it('should return true for keys in the trie', () => {
        trie.isEmpty().should.be.true();
        trie.put('abc');
        trie.isEmpty().should.be.false();
        trie.put('abcd');
        trie.isEmpty().should.be.false();
      });

      it('should return false after updating keys', () => {
        trie.isEmpty().should.be.true();
        trie.put('abc');
        trie.isEmpty().should.be.false();
        trie.put('abc');
        trie.isEmpty().should.be.false();
      });

      it('should return true after all keys are deleted', () => {
        trie.isEmpty().should.be.true();
        trie.put('abc');
        trie.isEmpty().should.be.false();
        trie.delete('abc');
        trie.isEmpty().should.be.true();
        let keys = ['a', 'b', 'ab', 'abc', 'abcd', '1', '123', '12'];
        let n = keys.length;
        keys.forEach(k => trie.put(k));
        trie.isEmpty().should.be.false();
        keys.forEach((k, i) => {
          trie.delete(k);
          trie.isEmpty().should.equal(i === n - 1);
        });
        trie.isEmpty().should.be.true();
        trie.put('abc');
        trie.isEmpty().should.be.false();
      });
    });
  });

  describe('longestPrefixOf()', () => {
    describe('API', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should throw when no key is passed', () => {
        expect(() => trie.longestPrefixOf(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', undefined, 's'));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => trie.longestPrefixOf(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', null, 's'));
        expect(() => trie.longestPrefixOf(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', 2, 's'));
        expect(() => trie.longestPrefixOf([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', [], 's'));
        expect(() => trie.longestPrefixOf({ '4': 4 })).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', { '4': 4 }, 's'));
        let f = () => '4';
        expect(() => trie.longestPrefixOf(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', f, 's'));
      });

      it('should throw with non-empty strings', () => {
        expect(() => trie.longestPrefixOf('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', '', 's'));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => trie.longestPrefixOf('a')).not.to.throw();
        expect(() => trie.longestPrefixOf('0')).not.to.throw();
        expect(() => trie.longestPrefixOf('this is a test')).not.to.throw();
        expect(() => trie.longestPrefixOf('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should return the empty string on no-match', () => {
        trie.isEmpty().should.be.true();
        trie.longestPrefixOf('x').should.equal('');
        trie.put('xy');
        trie.longestPrefixOf('x').should.equal('');
      });

      it('should return the longest prefix stored', () => {
        trie.isEmpty().should.be.true();
        trie.put('she');
        trie.put('shells');
        trie.put('shelley');
        trie.longestPrefixOf('shell').should.equal('she');
        trie.put('shell');
        trie.longestPrefixOf('shell').should.equal('shell');
        trie.longestPrefixOf('shel').should.equal('she');
        trie.longestPrefixOf('shells').should.equal('shells');
      });

    });

  });

  describe('keysWithPrefix()', () => {
    describe('API', () => {
      var trie;
      beforeEach(function () {
        trie = new Trie();
      });

      it('should throw when no key is passed', () => {
        expect(() => trie.keysWithPrefix().next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', undefined, 'string'));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => trie.keysWithPrefix(null).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', null, 'string'));
        expect(() => trie.keysWithPrefix(2).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', 2, 'string'));
        expect(() => trie.keysWithPrefix([]).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', [], 'string'));
        expect(() => trie.keysWithPrefix({ '4': 4 }).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', { '4': 4 }, 'string'));
        let f = () => '4';
        expect(() => trie.keysWithPrefix(f).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', f, 'string'));
      });

      it('should not throw with empty strings', () => {
        expect(() => trie.keysWithPrefix('')).not.to.throw();
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => trie.keysWithPrefix('a')).not.to.throw();
        expect(() => trie.keysWithPrefix('0')).not.to.throw();
        expect(() => trie.keysWithPrefix('this is a test')).not.to.throw();
        expect(() => trie.keysWithPrefix('Aa;&1-\\@*Z')).not.to.throw();
      });

    });

    describe('Behaviour', () => {
      var trie;
      var items;
      beforeEach(function () {
        trie = new Trie();
        items = [
          { key: 'a', value: 1 },
          { key: 'b', value: 2 },
          { key: 'ab', value: 3 },
          { key: 'test', value: 4 },
          { key: 'test1', value: 5 },
          { key: 'test12', value: 6 },
          { key: 'test123', value: 7 },
          { key: 'test1234', value: 8 },
          { key: 'Aa;&1-\\@*Z', value: 9 }
        ];
        items.forEach(({ key, value }) => {
          trie.put(key, value);
        });
      });

      it('# should be empty for prefixes not in the trie', () => {
        [...trie.keysWithPrefix('abc')].should.be.empty();
      });

      it('# should all the keys added to the trie, in sorted order', () => {
        let prefixes = ['te', 'test12', 'a', 'xyz'];
        prefixes.forEach(prefix => {
          let result = [...trie.keysWithPrefix(prefix)];

          let expected = items.map(({ key, value }) => key).filter(key => key.startsWith(prefix));
          result.should.be.an.Array();
          result.length.should.eql(expected.length);
          result.should.eql(result.sort());
          result.should.eql(expected.sort());
        });
      });
    });
  });

  describe('keys()', () => {
    describe('API', () => {
      it('should take no parameters', () => {
        new Trie().keys.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var trie;
      var items;
      beforeEach(function () {
        trie = new Trie();
        items = [
          { key: 'a', value: 1 },
          { key: 'b', value: 2 },
          { key: 'ab', value: 3 },
          { key: 'test', value: 4 },
          { key: 'test1', value: 5 },
          { key: 'test12', value: 6 },
          { key: 'test123', value: 7 },
          { key: 'test1234', value: 8 },
          { key: 'Aa;&1-\\@*Z', value: 9 }
        ];
        items.forEach(({ key, value }) => {
          trie.put(key, value);
        });
      });

      it('# should all the keys added to the trie, in sorted order', () => {
        let result = [...trie.keys()];
        let size = items.length;
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.should.eql(result.sort());
        result.should.eql(items.map(({ key, value }) => key).sort());
      });

      it('# should all the keys currently in the trie', () => {
        let deletedKeys = ['test', 'test123'];
        deletedKeys.forEach(key => trie.delete(key));
        let result = [...trie.keys()];
        let size = items.length - deletedKeys.length;
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.should.eql(result.sort());
        result.should.eql(items.map(({ key, value }) => key).filter(key => deletedKeys.indexOf(key) < 0).sort());
      });
    });

  });

  describe('items()', () => {
    describe('API', () => {
      it('# should take no parameters', () => {
        new Trie().items.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var trie;
      var items;
      beforeEach(function () {
        trie = new Trie();
        items = [
          { key: 'a', value: 1 },
          { key: 'b', value: 2 },
          { key: 'ab', value: 3 },
          { key: 'test', value: 4 },
          { key: 'test1', value: 5 },
          { key: 'test12', value: 6 },
          { key: 'test123', value: 7 },
          { key: 'test1234', value: 8 },
          { key: 'Aa;&1-\\@*Z', value: 9 }
        ];
        items.forEach(({ key, value }) => {
          trie.put(key, value);
        });
      });

      it('# should return all the items added to the trie, in sorted order', () => {
        let result = [...trie.items()];
        let size = items.length;
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.should.eql(result.sort());
        result.should.eql(items.sort(((it1, it2) => it1.key <= it2.key ? -1 : 1)));
      });
    });

  });

  describe('iterator', () => {
    describe('Behaviour', () => {
      var trie;
      var items;
      beforeEach(function () {
        trie = new Trie();
        items = [
          { key: 'a', value: 1 },
          { key: 'b', value: 2 },
          { key: 'ab', value: 3 },
          { key: 'test', value: 4 },
          { key: 'test1', value: 5 },
          { key: 'test12', value: 6 },
          { key: 'test123', value: 7 },
          { key: 'test1234', value: 8 },
          { key: 'Aa;&1-\\@*Z', value: 9 }
        ];
        items.forEach(({ key, value }) => {
          trie.put(key, value);
        });
      });

      it('# should allow iteration through elements in sorted order', () => {
        let result = [];
        let size = items.length;
        for (let k of trie) {
          result.push(k);
        }
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.should.eql(result.sort());
        result.should.eql(items.sort(((it1, it2) => it1.key <= it2.key ? -1 : 1)));
      });
    });

  });

});