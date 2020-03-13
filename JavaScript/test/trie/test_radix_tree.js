import RadixTree from '../../src/trie/radix_tree.js';
import {ERROR_MSG_PARAM_TYPE} from '../../src/common/errors.js';
import {testAPI} from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING = (fname, val, pname='key') => `Illegal argument for ${fname}: ${pname} = ${val} must be a non-empty string`;

describe('RadixTree API', () => {

  it('# should have a the constructor method', function () {
    RadixTree.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let radixTree = new RadixTree();

    let methods = ['constructor', 'isEmpty', 'put', 'get', 'delete', 'contains', 'longestPrefixOf', 'keysWithPrefix', 'keys', 'items'];
    let attributes = ['size'];
    testAPI(radixTree, attributes, methods);
  });
});

describe('RadixTree Creation', () => {
  it('# Constructor shoulf take no arguments', function () {
    RadixTree.length.should.equal(0);
    expect(() => new RadixTree()).not.to.throw();
  });
});

describe('Attributes', () => {
  describe('size', () => {
    describe('Behaviour', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should be 0 for brand new radixTrees', () => {
        radixTree.size.should.equal(0);
      });

      it('should account for keys added to the radixTree', () => {
        radixTree.size.should.equal(0);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
        radixTree.put('abcd');
        radixTree.size.should.equal(2);
      });

      it('should not increase for updated keys', () => {
        radixTree.size.should.equal(0);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
      });

      it('should account for deleted keys', () => {
        radixTree.size.should.equal(0);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
        radixTree.delete('abc');
        radixTree.size.should.equal(0);
        let keys = ['a', 'b', 'ab', 'abc', 'abcd', '1', '123', '12'];
        let n = keys.length;
        keys.forEach((k, i) => {
          radixTree.put(k);
          radixTree.size.should.equal(i + 1);
        });
        radixTree.size.should.equal(n);
        keys.forEach((k, i) => {
          radixTree.delete(k);
          radixTree.size.should.equal(n - i - 1);
        });
        radixTree.size.should.equal(0);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
      });
    });
  });
});

describe('Methods', () => {
  describe('put()', () => {
    describe('API', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should throw when no key is passed', () => {
        expect(() => radixTree.put(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => radixTree.put(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', null));
        expect(() => radixTree.put(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', 2));
        expect(() => radixTree.put([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', []));
        expect(() => radixTree.put({'4': 4})).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', {'4': 4}));
      });

      it('should throw with non-empty strings', () => {
        expect(() => radixTree.put('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', ''));
      });

      it('shouldn\'t throw with non empty strings', () => {
        expect(() => radixTree.put('a')).not.to.throw();
        expect(() => radixTree.put('0')).not.to.throw();
        expect(() => radixTree.put('this is a test')).not.to.throw();
        expect(() => radixTree.put('Aa;&1-\\@*Z')).not.to.throw();
      });

      it('should accept any value for the second parameter (defaulting to null)', () => {
        expect(() => radixTree.put('a', 1)).not.to.throw();
        expect(() => radixTree.put('0', null)).not.to.throw();
        expect(() => radixTree.put('this is a test', 'x')).not.to.throw();
        expect(() => radixTree.put('Aa;&1-\\@*Z', [])).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should return the radixTree itself', () => {
        radixTree.put('1').should.equal(radixTree);
      });

      it('should increment size after putting a new key', () => {
        radixTree.size.should.equal(0);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
        radixTree.put('abcd');
        radixTree.size.should.equal(2);
        radixTree.put('ab');
        radixTree.size.should.equal(3);
      });

      it('should NOT increment size after putting a new value for an existing key', () => {
        radixTree.size.should.equal(0);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
        radixTree.put('abc');
        radixTree.size.should.equal(1);
        radixTree.put('abc', 123);
        radixTree.size.should.equal(1);
      });

      it('should get the correct value after putting it', () => {
        radixTree.put('abc');
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.put('x', 1);
        radixTree.get('x').should.equal(1);
        radixTree.put('ab', 123);
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.get('x').should.equal(1);
        radixTree.get('ab').should.equal(123);
      });

      it('should overwrite the value associated with an existing key', () => {
        radixTree.put('abc');
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.put('x', 1);
        radixTree.get('x').should.equal(1);
        radixTree.put('abc', 123);
        radixTree.get('abc').should.equal(123);
        radixTree.get('x').should.equal(1);
      });
    });
  });

  describe('get()', () => {
    describe('API', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should throw when no key is passed', () => {
        expect(() => radixTree.get(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => radixTree.get(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', null));
        expect(() => radixTree.get(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', 2));
        expect(() => radixTree.get([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', []));
        expect(() => radixTree.get({'4': 4})).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', {'4': 4}));
        let f = () => '4';
        expect(() => radixTree.get(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', f));
      });

      it('should throw with non-empty strings', () => {
        expect(() => radixTree.get('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', ''));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => radixTree.get('a')).not.to.throw();
        expect(() => radixTree.get('0')).not.to.throw();
        expect(() => radixTree.get('this is a test')).not.to.throw();
        expect(() => radixTree.get('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should return undefined for never inserted keys', () => {
        expect(radixTree.get('abc')).to.be.eql(undefined);
        expect(radixTree.get('xyzw')).to.be.eql(undefined);
        radixTree.put('x', 1);
        expect(radixTree.get('xyzw')).to.be.eql(undefined);
      });

      it('should get the correct value after putting it', () => {
        radixTree.put('abc');
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.put('x', 1);
        radixTree.get('x').should.equal(1);
        radixTree.put('ab', 123);
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.get('x').should.equal(1);
        radixTree.get('ab').should.equal(123);
        radixTree.put('abde', true);
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.get('x').should.equal(1);
        radixTree.get('ab').should.equal(123);
        radixTree.get('abde').should.be.true();
        radixTree.put('a', []);
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.get('x').should.equal(1);
        radixTree.get('ab').should.equal(123);
        radixTree.get('abde').should.be.true();
        radixTree.get('a').should.be.eql([]);
      });

      it('should get the latest the value associated with existing key', () => {
        radixTree.put('abc');
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.put('x', 1);
        radixTree.get('x').should.equal(1);
        radixTree.put('abc', 123);
        radixTree.get('abc').should.equal(123);
        radixTree.get('x').should.equal(1);
        radixTree.put('x', '1');
        radixTree.get('abc').should.equal(123);
        radixTree.get('x').should.equal('1');
      });

      it('should be consistent over multiple calls', () => {
        radixTree.put('abc');
        expect(radixTree.get('abc')).to.be.eql(null);
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.put('x', 1);
        radixTree.get('x').should.equal(radixTree.get('x'));
      });

      it('should return undefined for deleted keys', () => {
        radixTree.put('abc', []);
        expect(radixTree.get('abc')).to.be.eql([]);
        radixTree.delete('abc');
        expect(radixTree.get('abc')).to.be.eql(undefined);
      });
    });
  });

  describe('delete()', () => {
    describe('API', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should throw when no key is passed', () => {
        expect(() => radixTree.delete(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => radixTree.delete(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', null));
        expect(() => radixTree.delete(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', 2));
        expect(() => radixTree.delete([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', []));
        expect(() => radixTree.delete({'4': 4})).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', {'4': 4}));
        let f = () => '4';
        expect(() => radixTree.delete(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', f));
      });

      it('should throw with non-empty strings', () => {
        expect(() => radixTree.delete('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', ''));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => radixTree.delete('a')).not.to.throw();
        expect(() => radixTree.delete('0')).not.to.throw();
        expect(() => radixTree.delete('this is a test')).not.to.throw();
        expect(() => radixTree.delete('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should return false for never inserted keys', () => {
        radixTree.delete('abc').should.be.false();
        radixTree.delete('xyzw').should.be.false();
        radixTree.put('x', 1);
        radixTree.delete('xyzw').should.be.false();
      });

      it('should return true for deleted keys, and actually remove them from the radixTree', () => {
        radixTree.put('abc');
        expect(radixTree.get('abc')).to.be.eql(null);
        radixTree.delete('abc').should.be.true();
        expect(radixTree.get('abc')).to.be.eql(undefined);
      });

      it('should not affect prefixes of the key deleted', () => {
        radixTree.put('abc', 4);
        radixTree.put('ab', 44);
        radixTree.put('a', 444);
        radixTree.get('abc').should.equal(4);
        radixTree.get('ab').should.equal(44);
        radixTree.get('a').should.equal(444);
        radixTree.delete('abc').should.be.true();
        expect(radixTree.get('abc')).to.be.eql(undefined);
        radixTree.get('ab').should.equal(44);
        radixTree.get('a').should.equal(444);
      });


      it('should not affect keys of which the deleted key is a prefix', () => {
        radixTree.put('abc', 4);
        radixTree.put('ab', 44);
        radixTree.put('a', 444);
        radixTree.get('abc').should.equal(4);
        radixTree.get('ab').should.equal(44);
        radixTree.get('a').should.equal(444);
        radixTree.delete('a').should.be.true();
        radixTree.get('abc').should.equal(4);
        radixTree.get('ab').should.equal(44);
        expect(radixTree.get('a')).to.be.eql(undefined);
      });
    });
  });

  describe('contains()', () => {
    describe('API', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should throw when no key is passed', () => {
        expect(() => radixTree.contains(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', undefined));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => radixTree.contains(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', null));
        expect(() => radixTree.contains(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', 2));
        expect(() => radixTree.contains([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', []));
        expect(() => radixTree.contains({'4': 4})).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', {'4': 4}));
        let f = () => '4';
        expect(() => radixTree.contains(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', f));
      });

      it('should throw with non-empty strings', () => {
        expect(() => radixTree.contains('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', ''));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => radixTree.contains('a')).not.to.throw();
        expect(() => radixTree.contains('0')).not.to.throw();
        expect(() => radixTree.contains('this is a test')).not.to.throw();
        expect(() => radixTree.contains('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should return false for never inserted keys', () => {
        radixTree.contains('abc').should.be.false();
        radixTree.contains('xyzw').should.be.false();
        radixTree.put('x', 1);
        radixTree.contains('xyzw').should.be.false();
      });

      it('should return true for keys in the radixTree', () => {
        radixTree.put('abc');
        radixTree.contains('abc').should.be.true();
        radixTree.put('x', 1);
        radixTree.contains('x').should.be.true();
        radixTree.put('ab', 123);
        radixTree.contains('abc').should.be.true();
        radixTree.contains('x').should.be.true();
        radixTree.contains('ab').should.be.true();
      });

      it('should return true for updated keys', () => {
        radixTree.contains('abc').should.be.false();
        radixTree.put('abc');
        radixTree.contains('abc').should.be.true();
        radixTree.put('x', 1);
        radixTree.contains('x').should.be.true();
        radixTree.put('abc', 123);
        radixTree.contains('abc').should.be.true();
        radixTree.contains('x').should.be.true();
      });

      it('should return false for deleted keys', () => {
        radixTree.put('abc', []);
        radixTree.contains('abc').should.be.true();
        radixTree.delete('abc');
        radixTree.contains('abc').should.be.false();
      });
    });
  });

  describe('isEmpty()', () => {
    describe('API', () => {
      it('should take no parameters', () => {
        new RadixTree().isEmpty.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should return false for brand new radixTrees', () => {
        radixTree.isEmpty().should.be.true();
      });

      it('should return true for keys in the radixTree', () => {
        radixTree.isEmpty().should.be.true();
        radixTree.put('abc');
        radixTree.isEmpty().should.be.false();
        radixTree.put('abcd');
        radixTree.isEmpty().should.be.false();
      });

      it('should return false after updating keys', () => {
        radixTree.isEmpty().should.be.true();
        radixTree.put('abc');
        radixTree.isEmpty().should.be.false();
        radixTree.put('abc');
        radixTree.isEmpty().should.be.false();
      });

      it('should return true after all keys are deleted', () => {
        radixTree.isEmpty().should.be.true();
        radixTree.put('abc');
        radixTree.isEmpty().should.be.false();
        radixTree.delete('abc');
        radixTree.isEmpty().should.be.true();
        let keys = ['a', 'b', 'ab', 'abc', 'abcd', '1', '123', '12'];
        let n = keys.length;
        keys.forEach(k => radixTree.put(k));
        radixTree.isEmpty().should.be.false();
        keys.forEach((k, i) => {
          radixTree.delete(k);
          radixTree.isEmpty().should.equal(i === n - 1);
        });
        radixTree.isEmpty().should.be.true();
        radixTree.put('abc');
        radixTree.isEmpty().should.be.false();
      });
    });
  });

  describe('longestPrefixOf()', () => {
    describe('API', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should throw when no key is passed', () => {
        expect(() => radixTree.longestPrefixOf(undefined)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', undefined, 's'));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => radixTree.longestPrefixOf(null)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', null, 's'));
        expect(() => radixTree.longestPrefixOf(2)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', 2, 's'));
        expect(() => radixTree.longestPrefixOf([])).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', [], 's'));
        expect(() => radixTree.longestPrefixOf({'4': 4})).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', {'4': 4}, 's'));
        let f = () => '4';
        expect(() => radixTree.longestPrefixOf(f)).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', f, 's'));
      });

      it('should throw with non-empty strings', () => {
        expect(() => radixTree.longestPrefixOf('')).to.throw(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', '', 's'));
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => radixTree.longestPrefixOf('a')).not.to.throw();
        expect(() => radixTree.longestPrefixOf('0')).not.to.throw();
        expect(() => radixTree.longestPrefixOf('this is a test')).not.to.throw();
        expect(() => radixTree.longestPrefixOf('Aa;&1-\\@*Z')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should return the empty string on no-match', () => {
        radixTree.isEmpty().should.be.true();
        radixTree.longestPrefixOf('x').should.equal('');
        radixTree.put('xy');
        radixTree.longestPrefixOf('x').should.equal('');
      });

      it('should return the longest prefix stored', () => {
        radixTree.isEmpty().should.be.true();
        radixTree.put('she');
        radixTree.put('shells');
        radixTree.put('shelley');
        radixTree.longestPrefixOf('shell').should.equal('she');
        radixTree.put('shell');
        radixTree.longestPrefixOf('shell').should.equal('shell');
        radixTree.longestPrefixOf('shel').should.equal('she');
        radixTree.longestPrefixOf('shells').should.equal('shells');
      });

    });

  });

  describe('keysWithPrefix()', () => {
    describe('API', () => {
      var radixTree;
      beforeEach(function () {
        radixTree = new RadixTree();
      });

      it('should throw when no key is passed', () => {
        expect(() => radixTree.keysWithPrefix().next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', undefined, 'string'));
      });

      it('should throw when it\'s not a string', () => {
        expect(() => radixTree.keysWithPrefix(null).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', null, 'string'));
        expect(() => radixTree.keysWithPrefix(2).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', 2, 'string'));
        expect(() => radixTree.keysWithPrefix([]).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', [], 'string'));
        expect(() => radixTree.keysWithPrefix({'4': 4}).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', {'4': 4}, 'string'));
        let f = () => '4';
        expect(() => radixTree.keysWithPrefix(f).next()).to.throw(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', f, 'string'));
      });

      it('should not throw with empty strings', () => {
        expect(() => radixTree.keysWithPrefix('')).not.to.throw();
      });


      it('shouldn\'t throw with non empty strings', () => {
        expect(() => radixTree.keysWithPrefix('a')).not.to.throw();
        expect(() => radixTree.keysWithPrefix('0')).not.to.throw();
        expect(() => radixTree.keysWithPrefix('this is a test')).not.to.throw();
        expect(() => radixTree.keysWithPrefix('Aa;&1-\\@*Z')).not.to.throw();
      });

    });

    describe('Behaviour', () => {
      var radixTree;
      var items;
      beforeEach(function () {
        radixTree = new RadixTree();
        items = [
          {key: 'a', value: 1},
          {key: 'b', value: 2},
          {key: 'ab', value: 3},
          {key: 'test', value: 4},
          {key: 'test1', value: 5},
          {key: 'test12', value: 6},
          {key: 'test123', value: 7},
          {key: 'test12345', value: 8},
          {key: 'Aa;&1-\\@*Z', value: 9}
        ];
        items.forEach(({key, value}) => {
          radixTree.put(key, value);
        });
      });

      it('# should be empty for prefixes not in the radixTree', () => {
        [...radixTree.keysWithPrefix('abc')].should.be.empty();
      });

      it('# should return all the suffixes in the tree', () => {
        let prefixes = ['te', 'tes', 'test12', 'test1234', 'a', 'xyz'];
        prefixes.forEach(prefix => {
          let result = [...radixTree.keysWithPrefix(prefix)];

          let expected = items.map(({key, value})=> key).filter(key => key.startsWith(prefix));
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
        new RadixTree().keys.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      var items;
      beforeEach(function () {
        radixTree = new RadixTree();
        items = [
          {key: 'a', value: 1},
          {key: 'b', value: 2},
          {key: 'ab', value: 3},
          {key: 'test', value: 4},
          {key: 'test1', value: 5},
          {key: 'test12', value: 6},
          {key: 'test123', value: 7},
          {key: 'test1234', value: 8},
          {key: 'Aa;&1-\\@*Z', value: 9}
        ];
        items.forEach(({key, value}) => {
          radixTree.put(key, value);
        });
      });

      it('# should all the keys added to the radixTree, in sorted order', () => {
        let result = [...radixTree.keys()];
        let size = items.length;
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.should.eql(result.sort());
        result.should.eql(items.map(({key, value})=> key).sort());
      });

      it('# should all the keys currently in the radixTree', () => {
        let deletedKeys = ['test', 'test123'];
        deletedKeys.forEach(key => radixTree.delete(key));
        let result = [...radixTree.keys()];
        let size = items.length - deletedKeys.length;
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.should.eql(result.sort());
        result.should.eql(items.map(({key, value})=> key).filter(key => deletedKeys.indexOf(key) < 0).sort());
      });
    });

  });

  describe('items()', () => {
    describe('API', () => {
      it('# should take no parameters', () => {
        new RadixTree().items.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var radixTree;
      var items;
      beforeEach(function () {
        radixTree = new RadixTree();
        items = [
          {key: 'a', value: 1},
          {key: 'b', value: 2},
          {key: 'ab', value: 3},
          {key: 'test', value: 4},
          {key: 'test1', value: 5},
          {key: 'test12', value: 6},
          {key: 'test123', value: 7},
          {key: 'test1234', value: 8},
          {key: 'Aa;&1-\\@*Z', value: 9}
        ];
        items.forEach(({key, value}) => {
          radixTree.put(key, value);
        });
      });

      it('# should return all the items added to the radixTree, in sorted order', () => {
        let result = [...radixTree.items()];
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
      var radixTree;
      var items;
      beforeEach(function () {
        radixTree = new RadixTree();
        items = [
          {key: 'a', value: 1},
          {key: 'b', value: 2},
          {key: 'ab', value: 3},
          {key: 'test', value: 4},
          {key: 'test1', value: 5},
          {key: 'test12', value: 6},
          {key: 'test123', value: 7},
          {key: 'test1234', value: 8},
          {key: 'Aa;&1-\\@*Z', value: 9}
        ];
        items.forEach(({key, value}) => {
          radixTree.put(key, value);
        });
      });

      it('# should allow iteration through elements in sorted order', () => {
        let result = [];
        let size = items.length;
        for (let k of radixTree) {
          result.push(k);
        }
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.should.eql(result.sort());
        console.log(result)
        result.should.eql(items.sort(((it1, it2) => it1.key <= it2.key ? -1 : 1)));
      });
    });
  });
});