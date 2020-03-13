import * as array from '../../src/common/array.js';
import * as basic from '../../src/common/basic.js';
import * as errors from '../../src/common/errors.js';
import * as numbers from '../../src/common/numbers.js';
import * as sort from '../../src/common/sort.js';
import * as strings from '../../src/common/strings.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

describe('consistentStringify()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(strings.consistentStringify).to.be.a('function');
      strings.consistentStringify.should.have.length(1);
    });
  });

  describe('Numbers', () => {
    it('# should match JSON.stringify', function () {
      [0, -1, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE, numbers.randomInt(), Math.random()].forEach(x =>
        strings.consistentStringify(x).should.eql(JSON.stringify(x)));
    });
  });

  describe('Booleans', () => {
    it('# should match JSON.stringify', function () {
      strings.consistentStringify(true).should.eql(JSON.stringify(true));
      strings.consistentStringify(false).should.eql(JSON.stringify(false));
    });
  });

  describe('Strings', () => {
    it('# should match JSON.stringify', function () {
      ['', ' ', '\n', 'A', '1', '{1: () => ["x"]}', strings.randomString(numbers.randomInt(10, 100))].forEach(s =>
        strings.consistentStringify(s).should.eql(JSON.stringify(s)));
    });
  });

  describe('Arrays', () => {
    it('# should match JSON.stringify in-depth', function () {
      [[], [1], [1, 'a'], [1, 2, '3', 4, Math.random()]].forEach(a =>
        strings.consistentStringify(a).should.eql(JSON.stringify(a.map(JSON.stringify))));
    });
  });

  describe('Objects', () => {
    var obj;
    var expectedString;

    beforeEach(() => {
      obj = {
        'x': 1,
        'z': 2,
        'y': 44,
        1: 'a',
        2: 'b',
        4: 'c',
        3: 'd'
      };
      expectedString = '{"1":"a","2":"b","3":"d","4":"c","x":1,"y":44,"z":2}';
    });

    it('# should not match JSON.stringify', function () {
      strings.consistentStringify(obj).should.not.eql(JSON.stringify(obj));
    });

    it('# should have all the fields ordered', function () {
      strings.consistentStringify(obj).should.eql(expectedString);
    });

    it('# when parsed with JSON.parse() should match the original object', function () {
      JSON.parse(strings.consistentStringify(obj)).should.eql(obj);
    });

    it('# should work with nested objects', function () {
      let nestedObj = {
        1: 'a',
        2: 'b',
        3: 'd',
        4: 'c',
        'x': 1,
        'y': 44,
        'z': 2,
        'obj': {
          'a': 1,
          'b': obj
        }
      };
      let expectedStringNested = '{"1":"a","2":"b","3":"d","4":"c","obj":{"a":1,"b":{"1":"a","2":"b","3":"d","4":"c","x":1,"y":44,"z":2}},"x":1,"y":44,"z":2}';

      strings.consistentStringify(nestedObj).should.eql(expectedStringNested);
      JSON.parse(strings.consistentStringify(nestedObj)).should.eql(nestedObj);
    });
  });

  describe('Null', () => {
    it('# should match JSON.stringify', function () {
      strings.consistentStringify(null).should.eql(JSON.stringify(null));
    });
  });
});

describe('randomInt()', () => {

  describe('API', () => {
    it('# should provide a function with 0 mandatory argument', function () {
      expect(numbers.randomInt).to.be.a('function');
      numbers.randomInt.should.have.length(0);
    });

    it('# should throw if a is not a safe integer', function () {
      expect(() => numbers.randomInt('a')).to.throw(errors.ERROR_MSG_RANGE_LOWER('randomInt', 'a'));
      expect(() => numbers.randomInt('1')).to.throw(errors.ERROR_MSG_RANGE_LOWER('randomInt', '1'));
      expect(() => numbers.randomInt(null)).to.throw(errors.ERROR_MSG_RANGE_LOWER('randomInt', null));
      expect(() => numbers.randomInt(Number.MAX_VALUE)).to.throw(errors.ERROR_MSG_RANGE_LOWER('randomInt', Number.MAX_VALUE));
      expect(() => numbers.randomInt(Number.MIN_VALUE)).to.throw(errors.ERROR_MSG_RANGE_LOWER('randomInt', Number.MIN_VALUE));
    });

    it('# should throw if b is not a safe integer', function () {
      expect(() => numbers.randomInt(1, 'a')).to.throw(errors.ERROR_MSG_RANGE_UPPER('randomInt', 'a'));
      expect(() => numbers.randomInt(1, '1')).to.throw(errors.ERROR_MSG_RANGE_UPPER('randomInt', '1'));
      expect(() => numbers.randomInt(1, null)).to.throw(errors.ERROR_MSG_RANGE_UPPER('randomInt', null));
      expect(() => numbers.randomInt(1, Number.MAX_VALUE)).to.throw(errors.ERROR_MSG_RANGE_UPPER('randomInt', Number.MAX_VALUE));
      expect(() => numbers.randomInt(1, Number.MIN_VALUE)).to.throw(errors.ERROR_MSG_RANGE_UPPER('randomInt', Number.MIN_VALUE));
    });

    it('# should throw if b <= a', function () {
      expect(() => numbers.randomInt(1, 0)).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('randomInt', 1, 0));
      expect(() => numbers.randomInt(1, 1)).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('randomInt', 1, 1));
      expect(() => numbers.randomInt(-1, -2)).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('randomInt', -1, -2));
      expect(() => numbers.randomInt(3, 2)).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('randomInt', 3, 2));
    });

    it('# should accept two safe integers a, b with a < b', function () {
      expect(() => numbers.randomInt(0, 1)).not.to.throw();
      expect(() => numbers.randomInt(-1, 1)).not.to.throw();
      expect(() => numbers.randomInt(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).not.to.throw();
    });
  });

  describe('Behaviour', () => {
    it('# should return a safe integer', function () {
      Number.isSafeInteger(numbers.randomInt(-10, 10)).should.be.true();
    });

    it('# should have a default value for b', function () {
      Number.isSafeInteger(numbers.randomInt(-10)).should.be.true();
    });

    it('# should have a default value for a', function () {
      Number.isSafeInteger(numbers.randomInt()).should.be.true();
    });

    it('# should return a if a === b + 1', function () {
      numbers.randomInt(0, 1).should.equal(0);
      numbers.randomInt(1, 2).should.equal(1);
      numbers.randomInt(-10, -9).should.equal(-10);
      numbers.randomInt(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).should.equal(Number.MAX_SAFE_INTEGER - 1);
      numbers.randomInt(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).should.equal(Number.MIN_SAFE_INTEGER);
    });

    it('# should return a safe integer i, a <= i < b', function () {
      numbers.range(0, 100).forEach(j => {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let i = numbers.randomInt(a, b);
        Number.isSafeInteger(i).should.be.true();
        i.should.not.be.lessThan(a);
        i.should.be.lessThan(b);
      });
    });
  });
});

describe('randomString()', () => {
  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(strings.randomString).to.be.a('function');
      strings.randomString.should.have.length(1);
    });

    it('# should throw if a is not a safe non-negative integer', function () {
      expect(() => strings.randomString(-1)).to.throw(errors.ERROR_MSG_RANDOM_STRING_LENGTH(-1));
      expect(() => strings.randomString('a')).to.throw(errors.ERROR_MSG_RANDOM_STRING_LENGTH('a'));
      expect(() => strings.randomString('1')).to.throw(errors.ERROR_MSG_RANDOM_STRING_LENGTH('1'));
      expect(() => strings.randomString(null)).to.throw(errors.ERROR_MSG_RANDOM_STRING_LENGTH(null));
      expect(() => strings.randomString(Number.MAX_VALUE)).to.throw(errors.ERROR_MSG_RANDOM_STRING_LENGTH(Number.MAX_VALUE));
      expect(() => strings.randomString(Number.MIN_VALUE)).to.throw(errors.ERROR_MSG_RANDOM_STRING_LENGTH(Number.MIN_VALUE));
    });

    it('# should throw if the size of the string would be too big to allocate it', function () {
      expect(() => strings.randomString(Number.MAX_SAFE_INTEGER)).to.throw(errors.ERROR_MSG_RANDOM_STRING_TOO_LARGE(Number.MAX_SAFE_INTEGER));
    });

    it('# should accept any safe non-negative integer', function () {
      expect(strings.randomString(0)).to.be.a('string');
      expect(strings.randomString(10)).to.be.a('string');
      expect(strings.randomString(10000)).to.be.a('string');
    });
  });

  describe('Behaviour', () => {
    it('# should return a string', function () {
      numbers.range(0, 100).forEach(() => {
        (typeof strings.randomString(numbers.randomInt(0, 100))).should.equal('string');
      });
    });

    it('# should return an empty string when length === 0', function () {
      strings.randomString(0).should.equal('');
    });

    it('# should return an empty string when length === 0', function () {
      numbers.range(0, 100).forEach(() => {
        let n = numbers.randomInt(0, 256);
        strings.randomString(n).length.should.equal(n);
      });
    });
  });
});


describe('range()', () => {

  describe('API', () => {
    it('# should provide a function with 2 mandatory arguments', function () {
      expect(numbers.range).to.be.a('function');
      numbers.range.should.have.length(2);
    });

    it('# should throw if a is not a safe integer', function () {
      expect(() => numbers.range('a')).to.throw(errors.ERROR_MSG_RANGE_LOWER('range', 'a'));
      expect(() => numbers.range('1')).to.throw(errors.ERROR_MSG_RANGE_LOWER('range', '1'));
      expect(() => numbers.range(2.3)).to.throw(errors.ERROR_MSG_RANGE_LOWER('range', 2.3));
      expect(() => numbers.range(null)).to.throw(errors.ERROR_MSG_RANGE_LOWER('range', null));
      expect(() => numbers.range(Number.MAX_VALUE)).to.throw(errors.ERROR_MSG_RANGE_LOWER('range', Number.MAX_VALUE));
      expect(() => numbers.range(Number.MIN_VALUE)).to.throw(errors.ERROR_MSG_RANGE_LOWER('range', Number.MIN_VALUE));
    });

    it('# should throw if b is not a safe integer', function () {
      expect(() => numbers.range(1, 'a')).to.throw(errors.ERROR_MSG_RANGE_UPPER('range', 'a'));
      expect(() => numbers.range(1, '1')).to.throw(errors.ERROR_MSG_RANGE_UPPER('range', '1'));
      expect(() => numbers.range(1, 1.2)).to.throw(errors.ERROR_MSG_RANGE_UPPER('range', 1.2));
      expect(() => numbers.range(1, null)).to.throw(errors.ERROR_MSG_RANGE_UPPER('range', null));
      expect(() => numbers.range(1, Number.MAX_VALUE)).to.throw(errors.ERROR_MSG_RANGE_UPPER('range', Number.MAX_VALUE));
      expect(() => numbers.range(1, Number.MIN_VALUE)).to.throw(errors.ERROR_MSG_RANGE_UPPER('range', Number.MIN_VALUE));
    });

    it('# should throw if step is not a safe integer', function () {
      expect(() => numbers.range(1, 1, 'a')).to.throw(errors.ERROR_MSG_RANGE_STEP('range', 'a'));
      expect(() => numbers.range(1, 1, '1')).to.throw(errors.ERROR_MSG_RANGE_STEP('range', '1'));
      expect(() => numbers.range(1, 1, 3.14)).to.throw(errors.ERROR_MSG_RANGE_STEP('range', 3.14));
      expect(() => numbers.range(1, 1, null)).to.throw(errors.ERROR_MSG_RANGE_STEP('range', null));
      expect(() => numbers.range(1, 1, Number.MAX_VALUE)).to.throw(errors.ERROR_MSG_RANGE_STEP('range', Number.MAX_VALUE));
      expect(() => numbers.range(1, 1, Number.MIN_VALUE)).to.throw(errors.ERROR_MSG_RANGE_STEP('range', Number.MIN_VALUE));
    });

    it('# should throw if b < a', function () {
      expect(() => numbers.range(1, 0)).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('range', 1, 0));
      expect(() => numbers.range(-1, -2)).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('range', -1, -2));
      expect(() => numbers.range(3, 2)).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('range', 3, 2));
    });

    it('# should throw if step is not positive', function () {
      expect(() => numbers.range(1, 1, 0)).to.throw(errors.ERROR_MSG_RANGE_STEP('range', 0));
      expect(() => numbers.range(1, 1, -2)).to.throw(errors.ERROR_MSG_RANGE_STEP('range', -2));
    });

    it('# should throw if the array for the numbers.range is too big', function () {
      expect(() => numbers.range(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).to.throw(errors.ERROR_MSG_RANGE_TOO_LARGE('range', Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
    });

    it('# should accept two safe integers a, b with a < b', function () {
      expect(() => numbers.range(0, 1)).not.to.throw();
      expect(() => numbers.range(-1, 1)).not.to.throw();
      expect(() => numbers.range(-10000, 10000)).not.to.throw();
    });

    it('# should accept a positive step', function () {
      expect(() => numbers.range(0, 1, 1)).not.to.throw();
      expect(() => numbers.range(-1, 1, 10)).not.to.throw();
    });
  });

  describe('Behaviour', () => {
    it('# should return an Array', function () {
      Array.isArray(numbers.range(-10, 10)).should.be.true();
    });

    it('# should return [] if a === b ', function () {
      numbers.range(0, 0).should.be.eql([]);
      numbers.range(1, 1).should.be.eql([]);
      numbers.range(-10, -10).should.be.eql([]);
      numbers.range(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).should.be.eql([]);
      numbers.range(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER).should.be.eql([]);
    });

    it('# should return [a] if a === b + 1', function () {
      numbers.range(0, 1).should.be.eql([0]);
      numbers.range(1, 2).should.be.eql([1]);
      numbers.range(-10, -9).should.be.eql([-10]);
      numbers.range(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).should.be.eql([Number.MAX_SAFE_INTEGER - 1]);
      numbers.range(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).should.be.eql([Number.MIN_SAFE_INTEGER]);
    });

    it('# should return the array [a, a+1 ... b-1] for step === 1', function () {
      for (let j = 0; j < 100; j++) {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let r = numbers.range(a, b);
        Array.isArray(r).should.be.true();
        r.length.should.equal(b - a);
        r.every(Number.isSafeInteger);
        r.sort().should.equal(r);
      }
    });

    it('# should return the array [a, a+step, a+2*step...] for ', function () {
      for (let j = 0; j < 100; j++) {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let step = numbers.randomInt(1, 11);
        let r = numbers.range(a, b, step);
        Array.isArray(r).should.be.true();
        r.length.should.equal(1 + Math.floor((b - a - 1) / step));
        r.every(Number.isSafeInteger);
        r.sort().should.equal(r);
        for (let i = a; i < b; i += step) {
          r.indexOf(i).should.be.greaterThan(-1);
        }
      }
    });
  });
});

describe('xrange()', () => {

  describe('API', () => {
    it('# should provide a function with 2 mandatory arguments', function () {
      expect(numbers.xrange).to.be.a('function');
      numbers.xrange.should.have.length(2);
    });

    it('# should throw if a is not a safe integer', function () {
      expect(() => numbers.xrange('a').next()).to.throw(errors.ERROR_MSG_RANGE_LOWER('xrange', 'a'));
      expect(() => numbers.xrange('1').next()).to.throw(errors.ERROR_MSG_RANGE_LOWER('xrange', '1'));
      expect(() => numbers.xrange(1.2).next()).to.throw(errors.ERROR_MSG_RANGE_LOWER('xrange', 1.2));
      expect(() => numbers.xrange(null).next()).to.throw(errors.ERROR_MSG_RANGE_LOWER('xrange', null));
      expect(() => numbers.xrange(Number.MAX_VALUE).next()).to.throw(errors.ERROR_MSG_RANGE_LOWER('xrange', Number.MAX_VALUE));
      expect(() => numbers.xrange(Number.MIN_VALUE).next()).to.throw(errors.ERROR_MSG_RANGE_LOWER('xrange', Number.MIN_VALUE));
    });

    it('# should throw if b is not a safe integer', function () {
      expect(() => numbers.xrange(1, 'a').next()).to.throw(errors.ERROR_MSG_RANGE_UPPER('xrange', 'a'));
      expect(() => numbers.xrange(2, '1').next()).to.throw(errors.ERROR_MSG_RANGE_UPPER('xrange', '1'));
      expect(() => numbers.xrange(2, 3.14).next()).to.throw(errors.ERROR_MSG_RANGE_UPPER('xrange', 3.14));
      expect(() => numbers.xrange(3, null).next()).to.throw(errors.ERROR_MSG_RANGE_UPPER('xrange', null));
      expect(() => numbers.xrange(4, Number.MAX_VALUE).next()).to.throw(errors.ERROR_MSG_RANGE_UPPER('xrange', Number.MAX_VALUE));
      expect(() => numbers.xrange(5, Number.MIN_VALUE).next()).to.throw(errors.ERROR_MSG_RANGE_UPPER('xrange', Number.MIN_VALUE));
    });

    it('# should throw if step is not a safe integer', function () {
      expect(() => numbers.xrange(1, 1, 'a').next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', 'a'));
      expect(() => numbers.xrange(1, 1, '1').next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', '1'));
      expect(() => numbers.xrange(1, 1, 3.14).next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', 3.14));
      expect(() => numbers.xrange(1, 1, null).next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', null));
      expect(() => numbers.xrange(1, 1, Number.MAX_VALUE).next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', Number.MAX_VALUE));
      expect(() => numbers.xrange(1, 1, Number.MIN_VALUE).next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', Number.MIN_VALUE));
    });

    it('# should throw if b < a', function () {
      expect(() => numbers.xrange(1, 0).next()).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('xrange', 1, 0));
      expect(() => numbers.xrange(-1, -2).next()).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('xrange', -1, -2));
      expect(() => numbers.xrange(3, 2).next()).to.throw(errors.ERROR_MSG_RANGE_BOUNDARIES('xrange', 3, 2));
    });

    it('# should throw if step is not positive', function () {
      expect(() => numbers.xrange(1, 1, 0).next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', 0));
      expect(() => numbers.xrange(1, 1, -2).next()).to.throw(errors.ERROR_MSG_RANGE_STEP('xrange', -2));
    });

    it('# should NOT throw despite the size of the numbers.range', function () {
      expect(() => numbers.xrange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).next()).not.to.throw();
    });

    it('# should accept two safe integers a, b with a < b', function () {
      expect(() => numbers.xrange(0, 1)).not.to.throw();
      expect(() => numbers.xrange(-1, 1)).not.to.throw();
      expect(() => numbers.xrange(-10000, 10000)).not.to.throw();
    });

    it('# should accept a positive step', function () {
      expect(() => numbers.xrange(0, 1, 1)).not.to.throw();
      expect(() => numbers.xrange(-1, 1, 10)).not.to.throw();
    });
  });

  describe('Behaviour', () => {
    it('# should return a generator', function () {
      expect(numbers.xrange(-10, 10).next).to.be.a('function');
    });

    it('# should be empty if a === b ', function () {
      numbers.xrange(0, 0).next().should.be.eql({ value: undefined, done: true });
      numbers.xrange(1, 1).next().should.be.eql({ value: undefined, done: true });
      numbers.xrange(-101, -101).next().should.be.eql({ value: undefined, done: true });
      numbers.xrange(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).next().should.be.eql({ value: undefined, done: true });
      numbers.xrange(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER).next().should.be.eql({ value: undefined, done: true });
    });

    it('# should return [a] if a === b + 1', function () {
      numbers.xrange(0, 1).next().value.should.equal(0);
      numbers.xrange(0, 1).next().done.should.be.false();
      numbers.xrange(1, 2).next().value.should.equal(1);
      numbers.xrange(1, 2).next().done.should.be.false();
      numbers.xrange(-101, -100).next().value.should.equal(-101);
      numbers.xrange(-101, -100).next().done.should.be.false();
      numbers.xrange(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).next().value.should.equal(Number.MAX_SAFE_INTEGER - 1);
      numbers.xrange(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).next().done.should.be.false();
      numbers.xrange(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).next().value.should.equal(Number.MIN_SAFE_INTEGER);
      numbers.xrange(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).next().done.should.be.false();
    });

    it('# should return all elements [a, a+1 ... b-1] for step === 1', function () {
      numbers.range(0, 100).forEach(j => {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let r = [...numbers.xrange(a, b)];
        Array.isArray(r).should.be.true();
        r.length.should.equal(b - a);
        r.every(i => Number.isSafeInteger(i));
        r.sort().should.equal(r);
      });
    });

    it('# should return the array [a, a+step, a+2*step...] for ', function () {
      for (let j = 0; j < 100; j++) {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let step = numbers.randomInt(1, 11);
        let r = [...numbers.xrange(a, b, step)];
        Array.isArray(r).should.be.true();
        r.length.should.equal(1 + Math.floor((b - a - 1) / step));
        r.every(Number.isSafeInteger);
        r.sort().should.equal(r);
        for (let i = a; i < b; i += step) {
          r.indexOf(i).should.be.greaterThan(-1);
        }
      }
    });
  });
});

describe('isNumber()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(numbers.isNumber).to.be.a('function');
      numbers.isNumber.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(numbers.isNumber()).to.be.a('boolean');
      expect(numbers.isNumber('s')).to.be.a('boolean');
    });

    it('# should be false when called with no argument, undefined, null', function () {
      numbers.isNumber().should.be.false();
      numbers.isNumber(undefined).should.be.false();
      numbers.isNumber(null).should.be.false();
    });

    it('# should be false for other types', function () {
      numbers.isNumber('x').should.be.false();
      numbers.isNumber(true).should.be.false();
      numbers.isNumber({ '1': 1 }).should.be.false();
      numbers.isNumber([]).should.be.false();
    });

    it('# should be true for numbers', function () {
      numbers.isNumber(1).should.be.true();
      numbers.isNumber(1.0).should.be.true();
      numbers.isNumber(Number.MAX_SAFE_INTEGER).should.be.true();
      numbers.isNumber(Number.MAX_VALUE).should.be.true();
      numbers.isNumber(Number.POSITIVE_INFINITY).should.be.true();
    });

    it('# should be true for string that can be parsed to numbers', function () {
      numbers.isNumber('1').should.be.true();
      numbers.isNumber('3.14').should.be.true();
      numbers.isNumber('2e10').should.be.true();
    });
  });
});

describe('isString()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(strings.isString).to.be.a('function');
      strings.isString.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(strings.isString()).to.be.a('boolean');
      expect(strings.isString('s')).to.be.a('boolean');
    });

    it('# should be false when called with no argument, undefined, null', function () {
      strings.isString().should.be.false();
      strings.isString(undefined).should.be.false();
      strings.isString(null).should.be.false();
    });

    it('# should be false for other types', function () {
      strings.isString(1).should.be.false();
      strings.isString(true).should.be.false();
      strings.isString({ '1': 1 }).should.be.false();
      strings.isString([]).should.be.false();
    });

    it('# should be true for the empty string', function () {
      strings.isString('').should.be.true();
    });

    it('# should be true for non-empty strings', function () {
      strings.isString('1').should.be.true();
      strings.isString('xghxh').should.be.true();
      strings.isString(strings.randomString(numbers.randomInt(1, 100))).should.be.true();
    });
  });
});

describe('isNonEmptyString()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(strings.isNonEmptyString).to.be.a('function');
      strings.isNonEmptyString.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(strings.isNonEmptyString()).to.be.a('boolean');
      expect(strings.isNonEmptyString('s')).to.be.a('boolean');
    });

    it('# should be false when called with no argument, undefined, null', function () {
      strings.isNonEmptyString().should.be.false();
      strings.isNonEmptyString(undefined).should.be.false();
      strings.isNonEmptyString(null).should.be.false();
    });

    it('# should be false for other types', function () {
      strings.isNonEmptyString(1).should.be.false();
      strings.isNonEmptyString(true).should.be.false();
      strings.isNonEmptyString({ '1': 1 }).should.be.false();
      strings.isNonEmptyString([]).should.be.false();
    });

    it('# should be false for the empty string', function () {
      strings.isNonEmptyString('').should.be.false();
    });

    it('# should be true for non-empty strings', function () {
      strings.isNonEmptyString('1').should.be.true();
      strings.isNonEmptyString('xghxh').should.be.true();
      strings.isNonEmptyString(strings.randomString(numbers.randomInt(1, 100))).should.be.true();
    });
  });
});

describe('isUndefined()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(basic.isUndefined).to.be.a('function');
      basic.isUndefined.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(basic.isUndefined(undefined)).to.be.a('boolean');
      expect(basic.isUndefined('s')).to.be.a('boolean');
    });

    it('# should throw when called with no argument', function () {
      expect(() => basic.isUndefined()).to.throw(errors.ERROR_MSG_TOO_FEW_ARGUMENTS('isUndefined', 1, 0));
    });

    it('# should be false for other falsy values', function () {
      basic.isUndefined(0).should.be.false();
      basic.isUndefined('').should.be.false();
      basic.isUndefined(false).should.be.false();
      basic.isUndefined(null).should.be.false();
    });

    it('# should be false for other types', function () {
      basic.isUndefined(1).should.be.false();
      basic.isUndefined('1').should.be.false();
      basic.isUndefined(true).should.be.false();
      basic.isUndefined({ '1': 1 }).should.be.false();
      basic.isUndefined([]).should.be.false();
    });

    it('# should be work despite possible local shadowing of undefined', function () {
      let f = () => undefined;
      (() => {
        /* jshint ignore:start */
        let undefined = '1';
        /* jshint ignore:end */
        expect(f()).not.to.be.eql(undefined);
        basic.isUndefined(undefined).should.be.false();
        basic.isUndefined(f()).should.be.true();
      })();
    });

    it('# should be true when called with undefined', function () {
      basic.isUndefined(undefined).should.be.true();
    });
  });
});

describe('insertionSort()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(sort.insertionSort).to.be.a('function');
      sort.insertionSort.should.have.length(1);
    });

    it('# should return an array', function () {
      expect(sort.insertionSort([])).to.be.an.instanceOf(Array);
    });

    it('# should throw when called with no argument', function () {
      expect(() => sort.insertionSort()).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', undefined, 'Array'));
    });

    it('# should throw when called with anything but arrays', function () {
      expect(() => sort.insertionSort(null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', null, 'Array'));
      expect(() => sort.insertionSort(true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', true, 'Array'));
      expect(() => sort.insertionSort(1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', 1, 'Array'));
      expect(() => sort.insertionSort('[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', '[]', 'Array'));
      expect(() => sort.insertionSort({ a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', { a: 1 }, 'Array'));
      expect(() => sort.insertionSort(new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', new Set(), 'Array'));
    });

    it('# should throw when the second parameter is not a function', function () {
      expect(() => sort.insertionSort([], null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', null, 'Function'));
      expect(() => sort.insertionSort([], true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', true, 'Function'));
      expect(() => sort.insertionSort([], 1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', 1, 'Function'));
      expect(() => sort.insertionSort([], '[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', '[]', 'Function'));
      expect(() => sort.insertionSort([], { a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', { a: 1 }, 'Function'));
      expect(() => sort.insertionSort([], new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', new Set(), 'Function'));
    });
  });

  describe('Behaviour', () => {
    it('# should return a sorted array', function () {
      sort.insertionSort([]).should.be.eql([]);
      sort.insertionSort([1]).should.be.eql([1]);
      sort.insertionSort([2, 1]).should.be.eql(numbers.range(1, 3));
      sort.insertionSort([-2, 1]).should.be.eql([-2, 1]);
      sort.insertionSort([3, 2, 1, 0, 5, 4]).should.be.eql(numbers.range(0, 6));
      let array = [3, 2, 1, 0, 5, 4, 5, 2, 1, 5, 7, 88, 2.14, -0.45];
      sort.insertionSort(array).should.be.eql(array.sort());
    });

    it('# should accept a function as second parameter and apply it to every element to extract its key', function () {
      let strLen = _ => _.length;
      sort.insertionSort([], strLen).should.be.eql([]);
      sort.insertionSort(['1'], strLen).should.be.eql(['1']);
      sort.insertionSort(['22', '1'], strLen).should.be.eql(['1', '22']);
      let array = ['a', 'bc', 'abc', ''];
      sort.insertionSort(array, strLen).should.be.eql(['', 'a', 'bc', 'abc']);
    });

    it('# should be stable', function () {
      let strLen = _ => _.length;
      let array = ['a', 'bc', 'ab', '', 'c'];
      sort.insertionSort(array, strLen).should.be.eql(['', 'a', 'c', 'bc', 'ab']);
    });
  });
});

describe('randomizedSelect()', () => {

  describe('API', () => {
    it('# should provide a function with 2 mandatory arguments', function () {
      expect(sort.randomizedSelect).to.be.a('function');
      sort.randomizedSelect.should.have.length(2);
    });

    it('# should throw when called with no argument', function () {
      expect(() => sort.randomizedSelect()).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', undefined, 'Array'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => sort.randomizedSelect(null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', null, 'Array'));
      expect(() => sort.randomizedSelect(true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', true, 'Array'));
      expect(() => sort.randomizedSelect(1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', 1, 'Array'));
      expect(() => sort.randomizedSelect('[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', '[]', 'Array'));
      expect(() => sort.randomizedSelect({ a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', { a: 1 }, 'Array'));
      expect(() => sort.randomizedSelect(new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', new Set(), 'Array'));
    });

    it('# should throw when the second parameter is not a (safe) integer', function () {
      expect(() => sort.randomizedSelect([], null)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', null));
      expect(() => sort.randomizedSelect([], true)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', true));
      expect(() => sort.randomizedSelect([], 1.3)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 1.3));
      expect(() => sort.randomizedSelect([], Number.MAX_VALUE)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', Number.MAX_VALUE));
      expect(() => sort.randomizedSelect([], '[]')).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', '[]'));
      expect(() => sort.randomizedSelect([], { a: 1 })).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', { a: 1 }));
    });

    it('# should throw when the second parameter is out of bounds', function () {
      expect(() => sort.randomizedSelect([], -1)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', -1));
      expect(() => sort.randomizedSelect([], 0)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 0));
      expect(() => sort.randomizedSelect([1], 2)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 2));
      expect(() => sort.randomizedSelect([1, 2], 44)).to.throw(errors.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 44));
    });

    it('# should throw when the third parameter is not a function', function () {
      expect(() => sort.randomizedSelect([1], 1, null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', null, 'Function'));
      expect(() => sort.randomizedSelect([1], 1, true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', true, 'Function'));
      expect(() => sort.randomizedSelect([1], 1, 1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', 1, 'Function'));
      expect(() => sort.randomizedSelect([1], 1, '[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', '[]', 'Function'));
      expect(() => sort.randomizedSelect([1], 1, { a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', { a: 1 }, 'Function'));
      expect(() => sort.randomizedSelect([1], 1, new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', new Set(), 'Function'));
    });
  });

  describe('Behaviour', () => {
    it('# should return a sorted array', function () {
      sort.randomizedSelect([1], 1).should.equal(1);
      sort.randomizedSelect([2, 1], 1).should.equal(1);
      sort.randomizedSelect([2, 1], 2).should.equal(2);
      sort.randomizedSelect([2, 1, 0], 1).should.equal(0);
      sort.randomizedSelect([2, 1, 0], 2).should.equal(1);
      sort.randomizedSelect([2, 1, 0], 3).should.equal(2);
      sort.randomizedSelect([2, 1, 0, 1, 1], 2).should.equal(1);
      sort.randomizedSelect([2, 1, 0, 1, 1], 3).should.equal(1);
      sort.randomizedSelect([2, 1, 0, 1, 1], 4).should.equal(1);
    });

    it('# should accept a function as third parameter and apply it to every element to extract its key', function () {
      let strLen = _ => _.length;
      sort.randomizedSelect(['1'], 1, strLen).should.equal('1');
      sort.randomizedSelect(['22', '1'], 1, strLen).should.equal('1');
      sort.randomizedSelect(['22', '1'], 2, strLen).should.equal('22');
      let array = ['a', 'bc', 'abc', ''];
      sort.randomizedSelect(array, 1, strLen).should.equal('');
      sort.randomizedSelect(array, 2, strLen).should.equal('a');
      sort.randomizedSelect(array, 3, strLen).should.equal('bc');
      sort.randomizedSelect(array, 4, strLen).should.equal('abc');
    });
  });
});

describe('median()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(sort.median).to.be.a('function');
      sort.median.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => sort.median()).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'array', undefined, 'Array'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => sort.median(null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'array', null, 'Array'));
      expect(() => sort.median(true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'array', true, 'Array'));
      expect(() => sort.median(1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'array', 1, 'Array'));
      expect(() => sort.median('[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'array', '[]', 'Array'));
      expect(() => sort.median({ a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'array', { a: 1 }, 'Array'));
      expect(() => sort.median(new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'array', new Set(), 'Array'));
    });

    it('# should throw when the second parameter is not a function', function () {
      expect(() => sort.median([1], null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'key', null, 'Function'));
      expect(() => sort.median([1], true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'key', true, 'Function'));
      expect(() => sort.median([1], 1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'key', 1, 'Function'));
      expect(() => sort.median([1], '[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'key', '[]', 'Function'));
      expect(() => sort.median([1], { a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'key', { a: 1 }, 'Function'));
      expect(() => sort.median([1], new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('median', 'key', new Set(), 'Function'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the median', function () {
      sort.median([1]).should.be.eql([1, [], []]);
      sort.median([2, 1]).should.be.eql([1, [], [2]]);
      sort.median([2, 1, 0]).should.be.eql([1, [0], [2]]);
      let [median, left, right] = sort.median([2, 1, 0, 1, 1]);
      median.should.equal(1);
      left.sort().should.be.eql([0, 1]);
      right.sort().should.be.eql([1, 2]);
      [median, left, right] = sort.median([2, 1, 0, 3, 4]);
      median.should.equal(2);
      left.sort().should.be.eql([0, 1]);
      right.sort().should.be.eql([3, 4]);
    });

    it('# should accept a function as third parameter and apply it to every element to extract its key', function () {
      let strLen = _ => _.length;
      sort.median(['1'], strLen).should.be.eql(['1', [], []]);
      sort.median(['22', '1'], strLen).should.be.eql(['1', [], ['22']]);
      let array = ['a', 'bc', 'abc', ''];
      let [median, left, right] = sort.median(array, strLen);
      median.should.equal('a');
      left.sort().should.be.eql(['']);
      right.sort().should.be.eql(['abc', 'bc']);

      array = [[1, -2, -3], [-1, 2, -3]];
      [median, left, right] = sort.median(array, a => a[0]);
      left.should.be.eql([]);
      median.should.be.eql([-1, 2, -3]);
      right.should.be.eql([[1, -2, -3]]);

      array = [[1, -2, -3], [-1, 2, -3], [-1, -2, 3]];
      [median, left, right] = sort.median(array, a => a[0]);
      median[0].should.be.eql(-1);
      right.should.be.eql([[1, -2, -3]]);
      if (median[1] === 2) {
        median.should.be.eql([-1, 2, -3]);
        left.should.be.eql([[-1, -2, 3]]);
      } else {
        median.should.be.eql([-1, -2, 3]);
        left.should.be.eql([[-1, 2, -3]]);
      }
    });
  });
});

describe('mean()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(array.mean).to.be.a('function');
      array.mean.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => array.mean()).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', undefined, 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => array.mean(null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', null, 'Array<number>'));
      expect(() => array.mean(true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', true, 'Array<number>'));
      expect(() => array.mean(1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', 1, 'Array<number>'));
      expect(() => array.mean('[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', '[]', 'Array<number>'));
      expect(() => array.mean({ a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', { a: 1 }, 'Array<number>'));
      expect(() => array.mean(new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', new Set(), 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => array.mean(['a'])).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', ['a'], 'Array<number>'));
      expect(() => array.mean([true, false])).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', [true, false], 'Array<number>'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => array.mean([])).to.throw(errors.ERROR_MSG_PARAM_EMPTY_ARRAY('mean', 'values'));
      expect(() => array.mean([true, false])).to.throw(errors.ERROR_MSG_PARAM_TYPE('mean', 'values', [true, false], 'Array<number>'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the mean', function () {
      array.mean([1]).should.be.eql(1);
      array.mean([1.75]).should.be.eql(1.75);
      array.mean([2, 1]).should.be.eql(1.5);
      array.mean([2, 1, 0]).should.be.eql(1);
      array.mean([2, 1, 0, 1, 1]).should.be.eql(1);
      array.mean([2, 1, 0, 3, 4]).should.be.eql(2);
      array.mean([2, 1, 2.5, 3, 4]).should.be.eql(2.5);
    });
  });
});

describe('variance()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(array.variance).to.be.a('function');
      array.variance.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => array.variance()).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', undefined, 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => array.variance(null)).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', null, 'Array<number>'));
      expect(() => array.variance(true)).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', true, 'Array<number>'));
      expect(() => array.variance(1)).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', 1, 'Array<number>'));
      expect(() => array.variance('[]')).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', '[]', 'Array<number>'));
      expect(() => array.variance({ a: 1 })).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', { a: 1 }, 'Array<number>'));
      expect(() => array.variance(new Set())).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', new Set(), 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => array.variance(['a'])).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', ['a'], 'Array<number>'));
      expect(() => array.variance([true, false])).to.throw(errors.ERROR_MSG_PARAM_TYPE('variance', 'values', [true, false], 'Array<number>'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => array.variance([])).to.throw(errors.ERROR_MSG_PARAM_EMPTY_ARRAY('variance', 'values'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the variance', function () {
      array.variance([1]).should.be.eql(0);
      array.variance([2, 1]).should.be.eql(0.25);
      array.variance([2, 1, 0]).should.be.eql(2 / 3);
      array.variance([2, 1, 0, 1, 1]).should.be.eql(2 / 5);
      array.variance([2, 1, 0, 3, 4]).should.be.eql(2);
      array.variance([2, 1, 2.5, 3, 4]).should.be.eql(1);
      array.variance([2, 1, 2.25, 3, 4]).should.be.eql(1.01);
    });
  });
});

describe('arrayMin()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(array.arrayMin).to.be.a('function');
      array.arrayMin.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => array.arrayMin()).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', ['', basic.identity], '[Array<T>, Function<T, number>]'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => array.arrayMin(null)).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [null, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMin(true)).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [true, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMin(1)).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [1, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMin('[]')).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', ['[]', basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMin({ a: 1 })).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [{ a: 1 }, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMin(new Set())).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [new Set(), basic.identity], '[Array<T>, Function<T, number>]'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => array.arrayMin(['a'])).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [['a'], basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMin([true, false])).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [[true, false], basic.identity], '[Array<T>, Function<T, number>]'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => array.arrayMin([])).to.throw(errors.ERROR_MSG_PARAM_EMPTY_ARRAY('arrayMin', 'values'));
    });
  });

  describe('Behaviour', () => {
    const toArrayMinResult = (value, index) => ({
      index: index,
      value: value
    });

    it('# should return the index and value of the min value', function () {
      array.arrayMin([1]).should.be.eql(toArrayMinResult(1, 0));
      array.arrayMin([2, 1]).should.be.eql(toArrayMinResult(1, 1));
      array.arrayMin([2, 1, 0]).should.be.eql(toArrayMinResult(0, 2));
      array.arrayMin([2, 1, 0, -1, 1]).should.be.eql(toArrayMinResult(-1, 3));
      array.arrayMin([2, 1, 2.5, 3, 0.4]).should.be.eql(toArrayMinResult(0.4, 4));
      array.arrayMin([-2, 1, 2.25, 3, 4]).should.be.eql(toArrayMinResult(-2, 0));
    });
  });
});

describe('arrayMax()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(array.arrayMax).to.be.a('function');
      array.arrayMax.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => array.arrayMax()).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', ['', basic.identity], '[Array<T>, Function<T, number>]'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => array.arrayMax(null)).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [null, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMax(true)).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [true, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMax(1)).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [1, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMax('[]')).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', ['[]', basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMax({ a: 1 })).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [{ a: 1 }, basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMax(new Set())).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [new Set(), basic.identity], '[Array<T>, Function<T, number>]'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => array.arrayMax(['a'])).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [['a'], basic.identity], '[Array<T>, Function<T, number>]'));
      expect(() => array.arrayMax([true, false])).to.throw(errors.ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [[true, false], basic.identity], '[Array<T>, Function<T, number>]'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => array.arrayMax([])).to.throw(errors.ERROR_MSG_PARAM_EMPTY_ARRAY('arrayMax', 'values'));
    });
  });

  describe('Behaviour', () => {
    const toArrayMaxResult = (value, index) => ({
      index: index,
      value: value
    });

    it('# should return the index and value of the min value', function () {
      array.arrayMax([1]).should.be.eql(toArrayMaxResult(1, 0));
      array.arrayMax([2, 1]).should.be.eql(toArrayMaxResult(2, 0));
      array.arrayMax([0, 1, 2]).should.be.eql(toArrayMaxResult(2, 2));
      array.arrayMax([2, 1, 30, -1, 1]).should.be.eql(toArrayMaxResult(30, 2));
      array.arrayMax([2, 1, 2.5, 1.229e124, 1.23e124]).should.be.eql(toArrayMaxResult(1.23e124, 4));
      array.arrayMax([3.2, 1, 2.25, 3, 0.4]).should.be.eql(toArrayMaxResult(3.2, 0));
    });
  });
});