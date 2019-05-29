import * as utils from '../../src/utils/utils.js';

const should = require('should');
const chai = require('chai');
const expect = chai.expect;

const ERROR_MSG_RANDOM_STRING_LENGTH =  val => `Illegal argument for randomString: length = ${val} must be a non-negative SafeInteger`;
const ERROR_MSG_RANDOM_STRING_TOO_LARGE = val => `Illegal argument for randomString: length ${val} is too large to be allocated`;
const ERROR_MSG_RANGE_LOWER = (fname, val) => `Illegal argument for ${fname}: a = ${val} must be a SafeInteger`;
const ERROR_MSG_RANGE_UPPER = (fname, val) => `Illegal argument for ${fname}: b = ${val} must be a SafeInteger`;
const ERROR_MSG_RANGE_BOUNDARIES = (fname, a, b) => `Illegal argument for ${fname}: must be a <[=] b, but ${a} >[=] ${b}`;
const ERROR_MSG_RANGE_TOO_BIG = (fname, a, b) => `Illegal argument for ${fname}: range [${a}, ${b}] is too large to be allocated`;
const ERROR_MSG_RANGE_STEP = (fname, val) => `Illegal argument for ${fname}: step = ${val} must be a positive SafeInteger`;

describe('consistentStringify()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(utils.consistentStringify).to.be.a('function');
      utils.consistentStringify.should.have.length(1);
    });
  });

  describe('Numbers', () => {
    it('# should match JSON.stringify', function () {
      [0, -1, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE, utils.randomInt(), Math.random()].forEach(x =>
        utils.consistentStringify(x).should.eql(JSON.stringify(x)));
    });
  });

  describe('Booleans', () => {
    it('# should match JSON.stringify', function () {
      utils.consistentStringify(true).should.eql(JSON.stringify(true));
      utils.consistentStringify(false).should.eql(JSON.stringify(false));
    });
  });

  describe('Strings', () => {
    it('# should match JSON.stringify', function () {
      ['', ' ', '\n', 'A', '1', '{1: () => ["x"]}', utils.randomString(utils.randomInt(10, 100))].forEach(s =>
        utils.consistentStringify(s).should.eql(JSON.stringify(s)));
    });
  });

  describe('Arrays', () => {
    it('# should match JSON.stringify', function () {
      [[], [1], [1, 'a'], [1, 2, '3', 4, Math.random()]].forEach(a =>
        utils.consistentStringify(a).should.eql(JSON.stringify(a)));
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
      utils.consistentStringify(obj).should.not.eql(JSON.stringify(obj));
    });

    it('# should have all the fields ordered', function () {
      utils.consistentStringify(obj).should.eql(expectedString);
    });

    it('# when parsed with JSON.parse() should match the original object', function () {
      JSON.parse(utils.consistentStringify(obj)).should.eql(obj);
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

      utils.consistentStringify(nestedObj).should.eql(expectedStringNested);
      JSON.parse(utils.consistentStringify(nestedObj)).should.eql(nestedObj);
    });
  });

  describe('Null', () => {
    it('# should match JSON.stringify', function () {
      utils.consistentStringify(null).should.eql(JSON.stringify(null));
    });
  });
});

describe('randomInt()', () => {

  describe('API', () => {
    it('# should provide a function with 0 mandatory argument', function () {
      expect(utils.randomInt).to.be.a('function');
      utils.randomInt.should.have.length(0);
    });

    it('# should throw if a is not a safe integer', function () {
      utils.randomInt.bind(null, 'a').should.throw(ERROR_MSG_RANGE_LOWER('randomInt', 'a'));
      utils.randomInt.bind(null, '1').should.throw(ERROR_MSG_RANGE_LOWER('randomInt', '1'));
      utils.randomInt.bind(null, null).should.throw(ERROR_MSG_RANGE_LOWER('randomInt', null));
      utils.randomInt.bind(null, Number.MAX_VALUE).should.throw(ERROR_MSG_RANGE_LOWER('randomInt', Number.MAX_VALUE));
      utils.randomInt.bind(null, Number.MIN_VALUE).should.throw(ERROR_MSG_RANGE_LOWER('randomInt', Number.MIN_VALUE));
    });

    it('# should throw if b is not a safe integer', function () {
      utils.randomInt.bind(null, 1, 'a').should.throw(ERROR_MSG_RANGE_UPPER('randomInt', 'a'));
      utils.randomInt.bind(null, 1, '1').should.throw(ERROR_MSG_RANGE_UPPER('randomInt', '1'));
      utils.randomInt.bind(null, 1, null).should.throw(ERROR_MSG_RANGE_UPPER('randomInt', null));
      utils.randomInt.bind(null, 1, Number.MAX_VALUE).should.throw(ERROR_MSG_RANGE_UPPER('randomInt', Number.MAX_VALUE));
      utils.randomInt.bind(null, 1, Number.MIN_VALUE).should.throw(ERROR_MSG_RANGE_UPPER('randomInt', Number.MIN_VALUE));
    });

    it('# should throw if b <= a', function () {
      utils.randomInt.bind(null, 1, 0).should.throw(ERROR_MSG_RANGE_BOUNDARIES('randomInt', 1, 0));
      utils.randomInt.bind(null, 1, 1).should.throw(ERROR_MSG_RANGE_BOUNDARIES('randomInt', 1, 1));
      utils.randomInt.bind(null, -1, -2).should.throw(ERROR_MSG_RANGE_BOUNDARIES('randomInt', -1, -2));
      utils.randomInt.bind(null, 3, 2).should.throw(ERROR_MSG_RANGE_BOUNDARIES('randomInt', 3, 2));
    });

    it('# should accept two safe integers a, b with a < b', function () {
      utils.randomInt.bind(null, 0, 1).should.not.throw();
      utils.randomInt.bind(null, -1, 1).should.not.throw();
      utils.randomInt.bind(null, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).should.not.throw();
    });
  });

  describe('Behaviour', () => {
    it('# should return a safe integer', function () {
      Number.isSafeInteger(utils.randomInt(-10, 10)).should.be.true();
    });

    it('# should have a default value for b', function () {
      Number.isSafeInteger(utils.randomInt(-10)).should.be.true();
    });

    it('# should have a default value for a', function () {
      Number.isSafeInteger(utils.randomInt()).should.be.true();
    });

    it('# should return a if a === b + 1', function () {
      utils.randomInt(0, 1).should.equal(0);
      utils.randomInt(1, 2).should.equal(1);
      utils.randomInt(-10, -9).should.equal(-10);
      utils.randomInt(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).should.equal(Number.MAX_SAFE_INTEGER - 1);
      utils.randomInt(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).should.equal(Number.MIN_SAFE_INTEGER);
    });

    it('# should return a safe integer i, a <= i < b', function () {
      utils.range(0, 100).forEach(j => {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let i = utils.randomInt(a, b);
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
      expect(utils.randomString).to.be.a('function');
      utils.randomString.should.have.length(1);
    });

    it('# should throw if a is not a safe non-negative integer', function () {
      utils.randomString.bind(null, -1).should.throw(ERROR_MSG_RANDOM_STRING_LENGTH(-1));
      utils.randomString.bind(null, 'a').should.throw(ERROR_MSG_RANDOM_STRING_LENGTH('a'));
      utils.randomString.bind(null, '1').should.throw(ERROR_MSG_RANDOM_STRING_LENGTH('1'));
      utils.randomString.bind(null, null).should.throw(ERROR_MSG_RANDOM_STRING_LENGTH(null));
      utils.randomString.bind(null, Number.MAX_VALUE).should.throw(ERROR_MSG_RANDOM_STRING_LENGTH(Number.MAX_VALUE));
      utils.randomString.bind(null, Number.MIN_VALUE).should.throw(ERROR_MSG_RANDOM_STRING_LENGTH(Number.MIN_VALUE));
    });

    it('# should throw if the size of the string would be too big to allocate it', function () {
      utils.randomString.bind(null, Number.MAX_SAFE_INTEGER).should.throw(ERROR_MSG_RANDOM_STRING_TOO_LARGE(Number.MAX_SAFE_INTEGER));
    });

    it('# should accept any safe non-negative integer', function () {
      expect(utils.randomString(0)).to.be.a('string');
      expect(utils.randomString(10)).to.be.a('string');
      expect(utils.randomString(10000)).to.be.a('string');
    });
  });

  describe('Behaviour', () => {
    it('# should return a string', function () {
      utils.range(0, 100).forEach(() => {
        (typeof utils.randomString(utils.randomInt(0, 100))).should.equal('string');
      });
    });

    it('# should return an empty string when length === 0', function () {
      utils.randomString(0).should.equal('');
    });

    it('# should return an empty string when length === 0', function () {
      utils.range(0, 100).forEach(() => {
        let n = utils.randomInt(0, 256);
        utils.randomString(n).length.should.equal(n);
      });
    });
  });
});


describe('range()', () => {

  describe('API', () => {
    it('# should provide a function with 2 mandatory arguments', function () {
      expect(utils.range).to.be.a('function');
      utils.range.should.have.length(2);
    });

    it('# should throw if a is not a safe integer', function () {
      utils.range.bind(null, 'a').should.throw(ERROR_MSG_RANGE_LOWER('range', 'a'));
      utils.range.bind(null, '1').should.throw(ERROR_MSG_RANGE_LOWER('range', '1'));
      utils.range.bind(null, 2.3).should.throw(ERROR_MSG_RANGE_LOWER('range', 2.3));
      utils.range.bind(null, null).should.throw(ERROR_MSG_RANGE_LOWER('range', null));
      utils.range.bind(null, Number.MAX_VALUE).should.throw(ERROR_MSG_RANGE_LOWER('range', Number.MAX_VALUE));
      utils.range.bind(null, Number.MIN_VALUE).should.throw(ERROR_MSG_RANGE_LOWER('range', Number.MIN_VALUE));
    });

    it('# should throw if b is not a safe integer', function () {
      utils.range.bind(null, 1, 'a').should.throw(ERROR_MSG_RANGE_UPPER('range', 'a'));
      utils.range.bind(null, 1, '1').should.throw(ERROR_MSG_RANGE_UPPER('range', '1'));
      utils.range.bind(null, 1, 1.2).should.throw(ERROR_MSG_RANGE_UPPER('range', 1.2));
      utils.range.bind(null, 1, null).should.throw(ERROR_MSG_RANGE_UPPER('range', null));
      utils.range.bind(null, 1, Number.MAX_VALUE).should.throw(ERROR_MSG_RANGE_UPPER('range', Number.MAX_VALUE));
      utils.range.bind(null, 1, Number.MIN_VALUE).should.throw(ERROR_MSG_RANGE_UPPER('range', Number.MIN_VALUE));
    });

    it('# should throw if step is not a safe integer', function () {
      utils.range.bind(null, 1, 1, 'a').should.throw(ERROR_MSG_RANGE_STEP('range', 'a'));
      utils.range.bind(null, 1, 1, '1').should.throw(ERROR_MSG_RANGE_STEP('range', '1'));
      utils.range.bind(null, 1, 1, 3.14).should.throw(ERROR_MSG_RANGE_STEP('range', 3.14));
      utils.range.bind(null, 1, 1, null).should.throw(ERROR_MSG_RANGE_STEP('range', null));
      utils.range.bind(null, 1, 1, Number.MAX_VALUE).should.throw(ERROR_MSG_RANGE_STEP('range', Number.MAX_VALUE));
      utils.range.bind(null, 1, 1, Number.MIN_VALUE).should.throw(ERROR_MSG_RANGE_STEP('range', Number.MIN_VALUE));
    });

    it('# should throw if b < a', function () {
      utils.range.bind(null, 1, 0).should.throw(ERROR_MSG_RANGE_BOUNDARIES('range', 1, 0));
      utils.range.bind(null, -1, -2).should.throw(ERROR_MSG_RANGE_BOUNDARIES('range', -1, -2));
      utils.range.bind(null, 3, 2).should.throw(ERROR_MSG_RANGE_BOUNDARIES('range', 3, 2));
    });

    it('# should throw if step is not positive', function () {
      utils.range.bind(null, 1, 1, 0).should.throw(ERROR_MSG_RANGE_STEP('range', 0));
      utils.range.bind(null, 1, 1, -2).should.throw(ERROR_MSG_RANGE_STEP('range',-2));
    });

    it('# should throw if the array for the utils.range is too big', function () {
      utils.range.bind(null, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).should.throw(ERROR_MSG_RANGE_TOO_BIG('range', Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
    });

    it('# should accept two safe integers a, b with a < b', function () {
      utils.range.bind(null, 0, 1).should.not.throw();
      utils.range.bind(null, -1, 1).should.not.throw();
      utils.range.bind(null, -10000, 10000).should.not.throw();
    });

    it('# should accept a positive step', function () {
      utils.range.bind(null, 0, 1, 1).should.not.throw();
      utils.range.bind(null, -1, 1, 10).should.not.throw();
    });
  });

  describe('Behaviour', () => {
    it('# should return an Array', function () {
      Array.isArray(utils.range(-10, 10)).should.be.true();
    });

    it('# should return [] if a === b ', function () {
      utils.range(0, 0).should.be.eql([]);
      utils.range(1, 1).should.be.eql([]);
      utils.range(-10, -10).should.be.eql([]);
      utils.range(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).should.be.eql([]);
      utils.range(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER).should.be.eql([]);
    });

    it('# should return [a] if a === b + 1', function () {
      utils.range(0, 1).should.be.eql([0]);
      utils.range(1, 2).should.be.eql([1]);
      utils.range(-10, -9).should.be.eql([-10]);
      utils.range(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).should.be.eql([Number.MAX_SAFE_INTEGER - 1]);
      utils.range(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).should.be.eql([Number.MIN_SAFE_INTEGER]);
    });

    it('# should return the array [a, a+1 ... b-1] for step === 1', function () {
      for(let j = 0; j < 100; j++) {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let r = utils.range(a, b);
        Array.isArray(r).should.be.true();
        r.length.should.equal(b - a);
        r.every(Number.isSafeInteger);
        r.sort().should.equal(r);
      }
    });

    it('# should return the array [a, a+step, a+2*step...] for ', function () {
      for(let j = 0; j < 100; j++) {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let step = utils.randomInt(1, 11);
        let r = utils.range(a, b, step);
        Array.isArray(r).should.be.true();
        r.length.should.equal(1 + Math.floor((b - a - 1) / step));
        r.every(Number.isSafeInteger);
        r.sort().should.equal(r);
        for (let i = a; i < b; i+= step) {
          r.indexOf(i).should.be.greaterThan(-1);
        }
      }
    });
  });
});

describe('xrange()', () => {

  describe('API', () => {
    it('# should provide a function with 2 mandatory arguments', function () {
      expect(utils.xrange).to.be.a('function');
      utils.xrange.should.have.length(2);
    });

    it('# should throw if a is not a safe integer', function () {
      expect(() => utils.xrange('a').next()).to.throw(ERROR_MSG_RANGE_LOWER('xrange', 'a'));
      expect(() => utils.xrange('1').next()).to.throw(ERROR_MSG_RANGE_LOWER('xrange', '1'));
      expect(() => utils.xrange(1.2).next()).to.throw(ERROR_MSG_RANGE_LOWER('xrange', 1.2));
      expect(() => utils.xrange(null).next()).to.throw(ERROR_MSG_RANGE_LOWER('xrange', null));
      expect(() => utils.xrange(Number.MAX_VALUE).next()).to.throw(ERROR_MSG_RANGE_LOWER('xrange', Number.MAX_VALUE));
      expect(() => utils.xrange(Number.MIN_VALUE).next()).to.throw(ERROR_MSG_RANGE_LOWER('xrange', Number.MIN_VALUE));
    });

    it('# should throw if b is not a safe integer', function () {
      expect(() => utils.xrange(1, 'a').next()).to.throw(ERROR_MSG_RANGE_UPPER('xrange', 'a'));
      expect(() => utils.xrange(2, '1').next()).to.throw(ERROR_MSG_RANGE_UPPER('xrange', '1'));
      expect(() => utils.xrange(2, 3.14).next()).to.throw(ERROR_MSG_RANGE_UPPER('xrange', 3.14));
      expect(() => utils.xrange(3, null).next()).to.throw(ERROR_MSG_RANGE_UPPER('xrange', null));
      expect(() => utils.xrange(4, Number.MAX_VALUE).next()).to.throw(ERROR_MSG_RANGE_UPPER('xrange', Number.MAX_VALUE));
      expect(() => utils.xrange(5, Number.MIN_VALUE).next()).to.throw(ERROR_MSG_RANGE_UPPER('xrange', Number.MIN_VALUE));
    });

    it('# should throw if step is not a safe integer', function () {
      expect(() => utils.xrange(1, 1, 'a').next()).to.throw(ERROR_MSG_RANGE_STEP('xrange', 'a'));
      expect(() => utils.xrange(1, 1, '1').next()).to.throw(ERROR_MSG_RANGE_STEP('xrange', '1'));
      expect(() => utils.xrange(1, 1, 3.14).next()).to.throw(ERROR_MSG_RANGE_STEP('xrange', 3.14));
      expect(() => utils.xrange(1, 1, null).next()).to.throw(ERROR_MSG_RANGE_STEP('xrange', null));
      expect(() => utils.xrange(1, 1, Number.MAX_VALUE).next()).to.throw(ERROR_MSG_RANGE_STEP('xrange', Number.MAX_VALUE));
      expect(() => utils.xrange(1, 1, Number.MIN_VALUE).next()).to.throw(ERROR_MSG_RANGE_STEP('xrange', Number.MIN_VALUE));
    });

    it('# should throw if b < a', function () {
      expect(() => utils.xrange(1, 0).next()).to.throw(ERROR_MSG_RANGE_BOUNDARIES('xrange', 1, 0));
      expect(() => utils.xrange(-1, -2).next()).to.throw(ERROR_MSG_RANGE_BOUNDARIES('xrange', -1, -2));
      expect(() => utils.xrange(3, 2).next()).to.throw(ERROR_MSG_RANGE_BOUNDARIES('xrange', 3, 2));
    });

    it('# should throw if step is not positive', function () {
      expect(() => utils.xrange(1, 1, 0).next()).to.throw(ERROR_MSG_RANGE_STEP('xrange', 0));
      expect(() => utils.xrange(1, 1, -2).next()).to.throw(ERROR_MSG_RANGE_STEP('xrange',-2));
    });

    it('# should NOT throw despite the size of the utils.range', function () {
      expect(() => utils.xrange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).next()).not.to.throw();
    });

    it('# should accept two safe integers a, b with a < b', function () {
      utils.xrange.bind(null, 0, 1).should.not.throw();
      utils.xrange.bind(null, -1, 1).should.not.throw();
      utils.xrange.bind(null, -10000, 10000).should.not.throw();
    });

    it('# should accept a positive step', function () {
      utils.xrange.bind(null, 0, 1, 1).should.not.throw();
      utils.xrange.bind(null, -1, 1, 10).should.not.throw();
    });
  });

  describe('Behaviour', () => {
    it('# should return a generator', function () {
      expect(utils.xrange(-10, 10)).to.be.a('object');
      expect(utils.xrange(-10, 10).next).to.be.a('function');
    });

    it('# should be empty if a === b ', function () {
      utils.xrange(0, 0).next().should.be.eql({value: undefined, done: true});
      utils.xrange(1, 1).next().should.be.eql({value: undefined, done: true});
      utils.xrange(-101, -101).next().should.be.eql({value: undefined, done: true});
      utils.xrange(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER).next().should.be.eql({value: undefined, done: true});
      utils.xrange(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER).next().should.be.eql({value: undefined, done: true});
    });

    it('# should return [a] if a === b + 1', function () {
      utils.xrange(0, 1).next().value.should.equal(0);
      utils.xrange(0, 1).next().done.should.be.false();
      utils.xrange(1, 2).next().value.should.equal(1);
      utils.xrange(1, 2).next().done.should.be.false();
      utils.xrange(-101, -100).next().value.should.equal(-101);
      utils.xrange(-101, -100).next().done.should.be.false();
      utils.xrange(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).next().value.should.equal(Number.MAX_SAFE_INTEGER - 1);
      utils.xrange(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER).next().done.should.be.false();
      utils.xrange(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).next().value.should.equal(Number.MIN_SAFE_INTEGER);
      utils.xrange(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 1).next().done.should.be.false();
    });

    it('# should return all elements [a, a+1 ... b-1] for step === 1', function () {
      utils.range(0, 100).forEach(j => {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let r = [...utils.xrange(a, b)];
        Array.isArray(r).should.be.true();
        r.length.should.equal(b - a);
        r.every(i => Number.isSafeInteger(i));
        r.sort().should.equal(r);
      });
    });

    it('# should return the array [a, a+step, a+2*step...] for ', function () {
      for(let j = 0; j < 100; j++) {
        let a = -50 + j;
        let b = a + 1 + 5 * j;
        let step = utils.randomInt(1, 11);
        let r = [...utils.xrange(a, b, step)];
        Array.isArray(r).should.be.true();
        r.length.should.equal(1 + Math.floor((b - a - 1) / step));
        r.every(Number.isSafeInteger);
        r.sort().should.equal(r);
        for (let i = a; i < b; i+= step) {
          r.indexOf(i).should.be.greaterThan(-1);
        }
      }
    });
  });
});

describe('isNumber()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(utils.isNumber).to.be.a('function');
      utils.isNumber.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(utils.isNumber()).to.be.a('boolean');
      expect(utils.isNumber('s')).to.be.a('boolean');
    });

    it('# should be false when called with no argument, undefined, null', function () {
      utils.isNumber().should.be.false();
      utils.isNumber(undefined).should.be.false();
      utils.isNumber(null).should.be.false();
    });

    it('# should be false for other types', function () {
      utils.isNumber('x').should.be.false();
      utils.isNumber(true).should.be.false();
      utils.isNumber({'1': 1}).should.be.false();
      utils.isNumber([]).should.be.false();
    });

    it('# should be true for numbers', function () {
      utils.isNumber(1).should.be.true();
      utils.isNumber(1.0).should.be.true();
      utils.isNumber(Number.MAX_SAFE_INTEGER).should.be.true();
      utils.isNumber(Number.MAX_VALUE).should.be.true();
      utils.isNumber(Number.POSITIVE_INFINITY).should.be.true();
    });

    it('# should be true for string that can be parsed to numbers', function () {
      utils.isNumber('1').should.be.true();
      utils.isNumber('3.14').should.be.true();
      utils.isNumber('2e10').should.be.true();
    });
  });
});

describe('isString()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(utils.isString).to.be.a('function');
      utils.isString.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(utils.isString()).to.be.a('boolean');
      expect(utils.isString('s')).to.be.a('boolean');
    });

    it('# should be false when called with no argument, undefined, null', function () {
      utils.isString().should.be.false();
      utils.isString(undefined).should.be.false();
      utils.isString(null).should.be.false();
    });

    it('# should be false for other types', function () {
      utils.isString(1).should.be.false();
      utils.isString(true).should.be.false();
      utils.isString({'1': 1}).should.be.false();
      utils.isString([]).should.be.false();
    });

    it('# should be true for the empty string', function () {
      utils.isString('').should.be.true();
    });

    it('# should be true for non-empty strings', function () {
      utils.isString('1').should.be.true();
      utils.isString('xghxh').should.be.true();
      utils.isString(utils.randomString(utils.randomInt(1, 100))).should.be.true();
    });
  });
});

describe('isNonEmptyString()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(utils.isNonEmptyString).to.be.a('function');
      utils.isNonEmptyString.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(utils.isNonEmptyString()).to.be.a('boolean');
      expect(utils.isNonEmptyString('s')).to.be.a('boolean');
    });

    it('# should be false when called with no argument, undefined, null', function () {
      utils.isNonEmptyString().should.be.false();
      utils.isNonEmptyString(undefined).should.be.false();
      utils.isNonEmptyString(null).should.be.false();
    });

    it('# should be false for other types', function () {
      utils.isNonEmptyString(1).should.be.false();
      utils.isNonEmptyString(true).should.be.false();
      utils.isNonEmptyString({'1': 1}).should.be.false();
      utils.isNonEmptyString([]).should.be.false();
    });

    it('# should be false for the empty string', function () {
      utils.isNonEmptyString('').should.be.false();
    });

    it('# should be true for non-empty strings', function () {
      utils.isNonEmptyString('1').should.be.true();
      utils.isNonEmptyString('xghxh').should.be.true();
      utils.isNonEmptyString(utils.randomString(utils.randomInt(1, 100))).should.be.true();
    });
  });
});

describe('isUndefined()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(utils.isUndefined).to.be.a('function');
      utils.isUndefined.should.have.length(1);
    });
  });

  describe('Behaviour', () => {
    it('# should return a boolean', function () {
      expect(utils.isUndefined(undefined)).to.be.a('boolean');
      expect(utils.isUndefined('s')).to.be.a('boolean');
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.isUndefined()).to.throw(utils.ERROR_MSG_TOO_FEW_ARGUMENTS('isUndefined', 1, 0));
    });

    it('# should be false for other falsy values', function () {
      utils.isUndefined(0).should.be.false();
      utils.isUndefined('').should.be.false();
      utils.isUndefined(false).should.be.false();
      utils.isUndefined(null).should.be.false();
    });

    it('# should be false for other types', function () {
      utils.isUndefined(1).should.be.false();
      utils.isUndefined('1').should.be.false();
      utils.isUndefined(true).should.be.false();
      utils.isUndefined({'1': 1}).should.be.false();
      utils.isUndefined([]).should.be.false();
    });

    it('# should be work despite possible local shadowing of undefined', function () {
      let f = () => undefined;
      (() => {
        /* jshint ignore:start */
        let undefined = '1';
        /* jshint ignore:end */
        expect(f()).not.to.be.eql(undefined);
        utils.isUndefined(undefined).should.be.false();
        utils.isUndefined(f()).should.be.true();
      })();
    });

    it('# should be true when called with undefined', function () {
      utils.isUndefined(undefined).should.be.true();
    });
  });
});

describe('insertionSort()', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(utils.insertionSort).to.be.a('function');
      utils.insertionSort.should.have.length(1);
    });

    it('# should return an array', function () {
      expect(utils.insertionSort([])).to.be.an.instanceOf(Array);
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.insertionSort()).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', undefined, 'Array'));
    });

    it('# should throw when called with anything but arrays', function () {
      expect(() => utils.insertionSort(null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', null, 'Array'));
      expect(() => utils.insertionSort(true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', true, 'Array'));
      expect(() => utils.insertionSort(1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', 1, 'Array'));
      expect(() => utils.insertionSort('[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', '[]', 'Array'));
      expect(() => utils.insertionSort({a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', {a: 1}, 'Array'));
      expect(() => utils.insertionSort(new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'array', new Set(), 'Array'));
    });

    it('# should throw when the second parameter is not a function', function () {
      expect(() => utils.insertionSort([], null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', null, 'Function'));
      expect(() => utils.insertionSort([], true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', true, 'Function'));
      expect(() => utils.insertionSort([], 1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', 1, 'Function'));
      expect(() => utils.insertionSort([], '[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', '[]', 'Function'));
      expect(() => utils.insertionSort([], {a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', {a: 1}, 'Function'));
      expect(() => utils.insertionSort([], new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('insertionSort', 'key', new Set(), 'Function'));
    });
  });

  describe('Behaviour', () => {
    it('# should return a sorted array', function () {
      utils.insertionSort([]).should.be.eql([]);
      utils.insertionSort([1]).should.be.eql([1]);
      utils.insertionSort([2, 1]).should.be.eql(utils.range(1, 3));
      utils.insertionSort([-2, 1]).should.be.eql([-2, 1]);
      utils.insertionSort([3, 2, 1, 0, 5, 4]).should.be.eql(utils.range(0, 6));
      let array = [3, 2, 1, 0, 5, 4, 5, 2, 1, 5, 7, 88, 2.14, -0.45];
      utils.insertionSort(array).should.be.eql(array.sort());
    });

    it('# should accept a function as second parameter and apply it to every element to extract its key', function () {
      let strLen = _ => _.length;
      utils.insertionSort([], strLen).should.be.eql([]);
      utils.insertionSort(['1'], strLen).should.be.eql(['1']);
      utils.insertionSort(['22', '1'], strLen).should.be.eql(['1', '22']);
      let array = ['a', 'bc', 'abc', ''];
      utils.insertionSort(array, strLen).should.be.eql(['', 'a', 'bc', 'abc']);
    });

    it('# should be stable', function () {
      let strLen = _ => _.length;
      let array = ['a', 'bc', 'ab', '', 'c'];
      utils.insertionSort(array, strLen).should.be.eql(['', 'a', 'c', 'bc', 'ab']);
    });
  });
});

describe('randomizedSelect()', () => {

  describe('API', () => {
    it('# should provide a function with 2 mandatory arguments', function () {
      expect(utils.randomizedSelect).to.be.a('function');
      utils.randomizedSelect.should.have.length(2);
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.randomizedSelect()).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', undefined, 'Array'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => utils.randomizedSelect(null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', null, 'Array'));
      expect(() => utils.randomizedSelect(true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', true, 'Array'));
      expect(() => utils.randomizedSelect(1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', 1, 'Array'));
      expect(() => utils.randomizedSelect('[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', '[]', 'Array'));
      expect(() => utils.randomizedSelect({a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', {a: 1}, 'Array'));
      expect(() => utils.randomizedSelect(new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', new Set(), 'Array'));
    });

    it('# should throw when the second parameter is not a (safe) integer', function () {
      expect(() => utils.randomizedSelect([], null)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', null));
      expect(() => utils.randomizedSelect([], true)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', true));
      expect(() => utils.randomizedSelect([], 1.3)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 1.3));
      expect(() => utils.randomizedSelect([], Number.MAX_VALUE)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', Number.MAX_VALUE ));
      expect(() => utils.randomizedSelect([], '[]')).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', '[]'));
      expect(() => utils.randomizedSelect([], {a: 1})).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', {a: 1}));
    });

    it('# should throw when the second parameter is out of bounds', function () {
      expect(() => utils.randomizedSelect([], -1)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', -1));
      expect(() => utils.randomizedSelect([], 0)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 0));
      expect(() => utils.randomizedSelect([1], 2)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 2));
      expect(() => utils.randomizedSelect([1, 2], 44)).to.throw(utils.ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', 44));
    });

    it('# should throw when the third parameter is not a function', function () {
      expect(() => utils.randomizedSelect([1], 1, null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', null, 'Function'));
      expect(() => utils.randomizedSelect([1], 1, true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', true, 'Function'));
      expect(() => utils.randomizedSelect([1], 1, 1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', 1, 'Function'));
      expect(() => utils.randomizedSelect([1], 1, '[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', '[]', 'Function'));
      expect(() => utils.randomizedSelect([1], 1, {a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', {a: 1}, 'Function'));
      expect(() => utils.randomizedSelect([1], 1, new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', new Set(), 'Function'));
    });
  });

  describe('Behaviour', () => {
    it('# should return a sorted array', function () {
      utils.randomizedSelect([1], 1).should.equal(1);
      utils.randomizedSelect([2, 1], 1).should.equal(1);
      utils.randomizedSelect([2, 1], 2).should.equal(2);
      utils.randomizedSelect([2, 1, 0], 1).should.equal(0);
      utils.randomizedSelect([2, 1, 0], 2).should.equal(1);
      utils.randomizedSelect([2, 1, 0], 3).should.equal(2);
      utils.randomizedSelect([2, 1, 0, 1, 1], 2).should.equal(1);
      utils.randomizedSelect([2, 1, 0, 1, 1], 3).should.equal(1);
      utils.randomizedSelect([2, 1, 0, 1, 1], 4).should.equal(1);
    });

    it('# should accept a function as third parameter and apply it to every element to extract its key', function () {
      let strLen = _ => _.length;
      utils.randomizedSelect(['1'], 1, strLen).should.equal('1');
      utils.randomizedSelect(['22', '1'], 1, strLen).should.equal('1');
      utils.randomizedSelect(['22', '1'], 2, strLen).should.equal('22');
      let array = ['a', 'bc', 'abc', ''];
      utils.randomizedSelect(array, 1, strLen).should.equal('');
      utils.randomizedSelect(array, 2, strLen).should.equal('a');
      utils.randomizedSelect(array, 3, strLen).should.equal('bc');
      utils.randomizedSelect(array, 4, strLen).should.equal('abc');
    });
  });
});

describe('median()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(utils.median).to.be.a('function');
      utils.median.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.median()).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'array', undefined, 'Array'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => utils.median(null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'array', null, 'Array'));
      expect(() => utils.median(true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'array', true, 'Array'));
      expect(() => utils.median(1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'array', 1, 'Array'));
      expect(() => utils.median('[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'array', '[]', 'Array'));
      expect(() => utils.median({a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'array', {a: 1}, 'Array'));
      expect(() => utils.median(new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'array', new Set(), 'Array'));
    });

    it('# should throw when the second parameter is not a function', function () {
      expect(() => utils.median([1], null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'key', null, 'Function'));
      expect(() => utils.median([1], true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'key', true, 'Function'));
      expect(() => utils.median([1], 1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'key', 1, 'Function'));
      expect(() => utils.median([1], '[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'key', '[]', 'Function'));
      expect(() => utils.median([1], {a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'key', {a: 1}, 'Function'));
      expect(() => utils.median([1], new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('median', 'key', new Set(), 'Function'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the median', function () {
      utils.median([1]).should.be.eql([1, [], []]);
      utils.median([2, 1]).should.be.eql([1, [], [2]]);
      utils.median([2, 1, 0]).should.be.eql([1, [0], [2]]);
      let [median, left, right] = utils.median([2, 1, 0, 1, 1]);
      median.should.equal(1);
      left.sort().should.be.eql([0, 1]);
      right.sort().should.be.eql([1, 2]);
      [median, left, right] = utils.median([2, 1, 0, 3, 4]);
      median.should.equal(2);
      left.sort().should.be.eql([0, 1]);
      right.sort().should.be.eql([3, 4]);
    });

    it('# should accept a function as third parameter and apply it to every element to extract its key', function () {
      let strLen = _ => _.length;
      utils.median(['1'], strLen).should.be.eql(['1', [], []]);
      utils.median(['22', '1'], strLen).should.be.eql(['1', [], ['22']]);
      let array = ['a', 'bc', 'abc', ''];
      let [median, left, right] = utils.median(array, strLen);
      median.should.equal('a');
      left.sort().should.be.eql(['']);
      right.sort().should.be.eql(['abc', 'bc']);
   
      array = [[1,-2,-3], [-1,2,-3]];
      [median, left, right] = utils.median(array, a => a[0]);
      left.should.be.eql([]);
      median.should.be.eql([-1,2,-3]);
      right.should.be.eql([[1, -2,-3]]);

      array = [[1,-2,-3], [-1,2,-3], [-1,-2,3]];
      [median, left, right] = utils.median(array, a => a[0]);
      median[0].should.be.eql(-1);
      right.should.be.eql([[1, -2,-3]]);
      if (median[1] === 2) {
        median.should.be.eql([-1,2,-3]);
        left.should.be.eql([[-1,-2,3]]);
      } else {
        median.should.be.eql([-1,-2,3]);
        left.should.be.eql([[-1,2,-3]]);
      }
    });
  });
});

describe('mean()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(utils.mean).to.be.a('function');
      utils.mean.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.mean()).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', undefined, 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => utils.mean(null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', null, 'Array<number>'));
      expect(() => utils.mean(true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', true, 'Array<number>'));
      expect(() => utils.mean(1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', 1, 'Array<number>'));
      expect(() => utils.mean('[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', '[]', 'Array<number>'));
      expect(() => utils.mean({a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', {a: 1}, 'Array<number>'));
      expect(() => utils.mean(new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', new Set(), 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => utils.mean(['a'])).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', ['a'], 'Array<number>'));
      expect(() => utils.mean([true, false])).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', [true, false], 'Array<number>'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => utils.mean([])).to.throw(utils.ERROR_MSG_PARAM_EMPTY_ARRAY('mean', 'values'));
      expect(() => utils.mean([true, false])).to.throw(utils.ERROR_MSG_PARAM_TYPE('mean', 'values', [true, false], 'Array<number>'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the mean', function () {
      utils.mean([1]).should.be.eql(1);
      utils.mean([1.75]).should.be.eql(1.75);
      utils.mean([2, 1]).should.be.eql(1.5);
      utils.mean([2, 1, 0]).should.be.eql(1);
      utils.mean([2, 1, 0, 1, 1]).should.be.eql(1);
      utils.mean([2, 1, 0, 3, 4]).should.be.eql(2);
      utils.mean([2, 1, 2.5, 3, 4]).should.be.eql(2.5);
    });
  });
});

describe('variance()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(utils.variance).to.be.a('function');
      utils.variance.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.variance()).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', undefined, 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => utils.variance(null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', null, 'Array<number>'));
      expect(() => utils.variance(true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', true, 'Array<number>'));
      expect(() => utils.variance(1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', 1, 'Array<number>'));
      expect(() => utils.variance('[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', '[]', 'Array<number>'));
      expect(() => utils.variance({a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', {a: 1}, 'Array<number>'));
      expect(() => utils.variance(new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', new Set(), 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => utils.variance(['a'])).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', ['a'], 'Array<number>'));
      expect(() => utils.variance([true, false])).to.throw(utils.ERROR_MSG_PARAM_TYPE('variance', 'values', [true, false], 'Array<number>'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => utils.variance([])).to.throw(utils.ERROR_MSG_PARAM_EMPTY_ARRAY('variance', 'values'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the variance', function () {
      utils.variance([1]).should.be.eql(0);
      utils.variance([2, 1]).should.be.eql(0.25);
      utils.variance([2, 1, 0]).should.be.eql(2 / 3);
      utils.variance([2, 1, 0, 1, 1]).should.be.eql(2 / 5);
      utils.variance([2, 1, 0, 3, 4]).should.be.eql(2);
      utils.variance([2, 1, 2.5, 3, 4]).should.be.eql(1);
      utils.variance([2, 1, 2.25, 3, 4]).should.be.eql(1.01);
    });
  });
});

describe('minIndex()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(utils.minIndex).to.be.a('function');
      utils.minIndex.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.minIndex()).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', undefined, 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => utils.minIndex(null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', null, 'Array<number>'));
      expect(() => utils.minIndex(true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', true, 'Array<number>'));
      expect(() => utils.minIndex(1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', 1, 'Array<number>'));
      expect(() => utils.minIndex('[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', '[]', 'Array<number>'));
      expect(() => utils.minIndex({a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', {a: 1}, 'Array<number>'));
      expect(() => utils.minIndex(new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', new Set(), 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => utils.minIndex(['a'])).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', ['a'], 'Array<number>'));
      expect(() => utils.minIndex([true, false])).to.throw(utils.ERROR_MSG_PARAM_TYPE('minIndex', 'values', [true, false], 'Array<number>'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => utils.minIndex([])).to.throw(utils.ERROR_MSG_PARAM_EMPTY_ARRAY('minIndex', 'values'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the index of the min value', function () {
      utils.minIndex([1]).should.be.eql(0);
      utils.minIndex([2, 1]).should.be.eql(1);
      utils.minIndex([2, 1, 0]).should.be.eql(2);
      utils.minIndex([2, 1, 0, -1, 1]).should.be.eql(3);
      utils.minIndex([2, 1, 2.5, 3, 0.4]).should.be.eql(4);
      utils.minIndex([-2, 1, 2.25, 3, 4]).should.be.eql(0);
    });
  });
});

describe('maxIndex()', () => {
  describe('API', () => {
    it('# should have 1 mandatory argument', function () {
      expect(utils.maxIndex).to.be.a('function');
      utils.maxIndex.should.have.length(1);
    });

    it('# should throw when called with no argument', function () {
      expect(() => utils.maxIndex()).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', undefined, 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array', function () {
      expect(() => utils.maxIndex(null)).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', null, 'Array<number>'));
      expect(() => utils.maxIndex(true)).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', true, 'Array<number>'));
      expect(() => utils.maxIndex(1)).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', 1, 'Array<number>'));
      expect(() => utils.maxIndex('[]')).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', '[]', 'Array<number>'));
      expect(() => utils.maxIndex({a: 1})).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', {a: 1}, 'Array<number>'));
      expect(() => utils.maxIndex(new Set())).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', new Set(), 'Array<number>'));
    });

    it('# should throw when the first parameter is not an array of numbers', function () {
      expect(() => utils.maxIndex(['a'])).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', ['a'], 'Array<number>'));
      expect(() => utils.maxIndex([true, false])).to.throw(utils.ERROR_MSG_PARAM_TYPE('maxIndex', 'values', [true, false], 'Array<number>'));
    });

    it('# should throw when the first parameter is an empty array', function () {
      expect(() => utils.maxIndex([])).to.throw(utils.ERROR_MSG_PARAM_EMPTY_ARRAY('maxIndex', 'values'));
    });
  });

  describe('Behaviour', () => {
    it('# should return the index of the min value', function () {
      utils.maxIndex([1]).should.be.eql(0);
      utils.maxIndex([2, 1]).should.be.eql(0);
      utils.maxIndex([0, 1, 2]).should.be.eql(2);
      utils.maxIndex([2, 1, 30, -1, 1]).should.be.eql(2);
      utils.maxIndex([2, 1, 2.5, 1.229e124, 1.23e124]).should.be.eql(4);
      utils.maxIndex([3.2, 1, 2.25, 3, 0.4]).should.be.eql(0);
    });
  });
});