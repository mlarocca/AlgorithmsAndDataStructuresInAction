import BloomFilter from '../../src/bloom_filter/bloom_filter.js';
import {range, randomInt} from '../../src/common/numbers.js';
import {testAPI} from '../utils/test_common.js';

const should = require('should');
const chai = require('chai');

const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE = val => `Illegal argument for BloomFilter constructor: tolerance = ${val} must be a number t, 0 < t < 1`;
const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE = val => `Illegal argument for BloomFilter constructor: maxSize = ${val} must be a number`;
const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED = val => `Illegal argument for BloomFilter constructor: seed = ${val} must be a safe integer`;
const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE = () => `Impossible to allocate enough memory for a Bloom filter satisfying requirements`;

describe('BloomFilter Module interface', () => {

  it('# Module should have all the constructor methods', function () {
    BloomFilter.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let methods = ['constructor', 'contains', 'add', 'confidence', 'falsePositiveProbability'];
    let attributes = ['size', 'maxRemainingCapacity'];
    let bloomf = new BloomFilter(3);

    testAPI(bloomf, attributes, methods);
  });
});

describe('BloomFilter Creation', () => {
  var bloomfilter;

  before(() => {
    bloomfilter = new BloomFilter(10);
  });

  describe('# Parameters', () => {

    describe('# 1st argument (mandatory)', () => {

      it('should throw when it\'s not a number', () => {
        BloomFilter.bind(null, []).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE([]));
        BloomFilter.bind(null, 'h').should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE('h'));
        BloomFilter.bind(null, {'4': 4}).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE({'4': 4}));
      });

      it('should throw with non positive numbers', () => {
        BloomFilter.bind({}, 0).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE(0));
        BloomFilter.bind({}, -2).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE(-2));
      });

      it('should throw for null', () => {
        BloomFilter.bind(null, null).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE(null));
      });

      it('shouldn\'t throw with positive numbers', () => {
        BloomFilter.bind({}, 1).should.not.throw();
        BloomFilter.bind({}, 12).should.not.throw();
      });
    });

    describe('# 2nd argument (optional)', () => {
      it('should have default value for tolerance', () => {
        new BloomFilter(2).should.not.throw();
      });

      it('should throw with non-numeric tolerance', () => {
        BloomFilter.bind(null, 3, []).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE([]));
        BloomFilter.bind(null, 4, 'g').should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE('g'));
        BloomFilter.bind(null, 1, {'1': 2}).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE({'1': 2}));
      });

      it('should throw with tolerance <= 0', () => {
        BloomFilter.bind(null, 1, -1).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE(-1));
        BloomFilter.bind(null, 2, 0).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE(0));
        BloomFilter.bind(null, 33, '-1.99').should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE('-1.99'));
      });

      it('should throw with tolerance >= 1', () => {
        BloomFilter.bind(null, 44, 1).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE(1));
        BloomFilter.bind(null, 5, '1.001').should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE('1.001'));
      });

      it('should throw for null', () => {
        BloomFilter.bind(null, 2, null).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE(null));
      });

      it('should NOT throw with max tolerance parsable to a number > 0 and < 1', () => {
        BloomFilter.bind({}, 6, 0.3).should.not.throw();
        BloomFilter.bind({}, 7, '0.121').should.not.throw();
      });
    });

    describe('# 3rd argument (optional)', () => {
      it('should have default value for seed', () => {
        new BloomFilter(2, 0.1).should.not.throw();
      });

      it('should throw with non-numeric seed', () => {
        BloomFilter.bind(null, 3, 0.1, []).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED([]));
        BloomFilter.bind(null, 4, 0.1, 'g').should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED('g'));
        BloomFilter.bind(null, 1, 0.1, {'1': 2}).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED({'1': 2}));
      });

      it('should throw when seed isn\'t an integer', () => {
        BloomFilter.bind(null, 44, 0.1, 0.1).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED(0.1));
        BloomFilter.bind(null, 5, 0.1, 1.1).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED(1.1));
      });

      it('should throw when seed is too large (not a safe integer)', () => {
        BloomFilter.bind(null, 44, 0.2, Number.MAX_VALUE).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED(Number.MAX_VALUE));
        BloomFilter.bind(null, 5, 0.2, Number.MIN_VALUE).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED(Number.MIN_VALUE));
      });

      it('should throw for null', () => {
        BloomFilter.bind(null, 2, 0.1, null).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED(null));
      });

      it('should NOT throw when a safe integer is passed', () => {
        BloomFilter.bind({}, 6, 0.3, 0).should.not.throw();
        BloomFilter.bind({}, 6, 0.3, 1).should.not.throw();
        BloomFilter.bind({}, 6, 0.3, -22).should.not.throw();
        BloomFilter.bind({}, 7, '0.121', Number.MAX_SAFE_INTEGER).should.not.throw();
        BloomFilter.bind({}, 7, '0.121', Number.MIN_SAFE_INTEGER).should.not.throw();
      });
    });

    describe('# Allocation error', () => {
      it('should throw an exception if the desired precision requires too big an array to be allocated', () => {
        BloomFilter.bind({}, 1000000000, 0.1).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE());
        BloomFilter.bind({}, 100000000, 0.0000000001).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE());
        BloomFilter.bind({}, 10000000, 1e-55).should.throw(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE());
      });
    });
  });
});

describe('Attributes', () => {
  describe('size', () => {
    var maxS = 5;
    var bloomf;

    beforeEach(() => {
      bloomf = new BloomFilter(maxS);
    });

    it('# Should return 0 for empty Bloom filter', () => {
      bloomf.size.should.equal(0);
    });

    it('# Add method should increment the filter\'s size when new unique keys are added', () => {
      bloomf.add(12);
      bloomf.size.should.equal(1);
      bloomf.add(11);
      bloomf.add(14);
      bloomf.size.should.equal(3);
    });

    it('# Add method should NOT increment the filter\'s size when duplicate keys are added', () => {
      bloomf.add(12);
      bloomf.add(11);
      bloomf.size.should.equal(2);
      bloomf.add(12);
      bloomf.size.should.equal(2);
      bloomf.add(11);
      bloomf.size.should.equal(2);
    });
  });

  describe('maxRemainingCapacity', () => {
    var maxS = 5;
    var bloomf;

    beforeEach(() => {
      bloomf = new BloomFilter(maxS);
    });

    it('# Should return the max total capacity for empty Bloom filter', () => {
      bloomf.maxRemainingCapacity.should.equal(maxS);
    });

    it('# Add method should decrement the filter\'s residual capacity when new unique keys are added', () => {
      bloomf.add(12);
      bloomf.maxRemainingCapacity.should.equal(maxS - 1);
      bloomf.add(11);
      bloomf.add(13);
      bloomf.maxRemainingCapacity.should.equal(maxS - 3);
    });

    it('# Add method should NOT decrement the filter\'s residual capacity when duplicate keys are added', () => {
      bloomf.add(102);
      bloomf.add(151);
      bloomf.maxRemainingCapacity.should.equal(maxS - 2);
      bloomf.add(151);
      bloomf.add(102);
      bloomf.maxRemainingCapacity.should.equal(maxS - 2);
    });

    it('# After adding maxSize or more elements, residual capacity should be 0', () => {
      bloomf.add(1);
      bloomf.maxRemainingCapacity.should.be.greaterThan(0);
      bloomf.add(2);
      bloomf.add(3);
      bloomf.add(4);
      bloomf.add(5);
      bloomf.maxRemainingCapacity.should.equal(0);
      bloomf.add(12);
      bloomf.maxRemainingCapacity.should.equal(0);
    });
  });
});

describe('Methods', () => {
  describe('falsePositiveProbability()', () => {
    var maxS = 10;
    var maxT = 0.1;
    var bloomf;

    beforeEach(() => {
      bloomf = new BloomFilter(maxS, maxT);
    });

    it('# Should be 0 for empty Bloom filter', () => {
      bloomf.falsePositiveProbability().should.equal(0);
    });

    it('# Should be > 0 after a single insertion Bloom filter', () => {
      bloomf.add('x');
      bloomf.falsePositiveProbability().should.be.greaterThan(0);
    });


    it('# Should be greater than max expected tolerance when maxCapacity is exceeded', () => {
      let i = 0;
      while (bloomf.size < maxS) {
        //make sure we have maxS distinct elements
        bloomf.add(i++);
      }

      bloomf.falsePositiveProbability().should.be.greaterThan(maxT);
    });
  });

  describe('confidence()', () => {
    var maxS = 15;
    var maxT = 0.01;
    var bloomf = new BloomFilter(maxS, maxT);

    it('# Should be 1 for empty Bloom filter', () => {
      bloomf.confidence().should.equal(1);
    });

    it('# Should be < 1 after a single insertion Bloom filter', () => {
      bloomf.add('x');
      bloomf.confidence().should.be.lessThan(1);
    });


    it('# Should be smaller than 1 minus max expected tolerance when maxCapacity is exceeded', () => {
      range(0, maxS + 1).forEach(i => bloomf.add(i));
      bloomf.confidence().should.be.lessThan(1 - maxT);
    });
  });

  describe('contains() + get()', () => {
    var maxS = 15;
    var bloomf = new BloomFilter(maxS);

    it('# Should be always false for empty Bloom filter', () => {
      range(0, maxS).every(i => !bloomf.contains(i)).should.be.true();
    });

    it('# Should be false for keys not added to Bloom filter (low false positives when low tolerance)', () => {
      let maxT = 1e-20;
      let bloomf = new BloomFilter(maxS, maxT);
      range(0, maxS).forEach(i => bloomf.add(i));
      range(0, 2 * maxS).every(i => !bloomf.contains(maxS + i)).should.be.true();
    });

    it('# Should have some false positives with high load and high tolerance', () => {
      let maxT = 1e-1;
      let bloomf = new BloomFilter(maxS, maxT);
      range(0, maxS).forEach(i => bloomf.add(i));
      range(0, 3 * maxS).some(i => bloomf.contains(maxS + i)).should.be.true();
    });

    it('# Should always be true for keys added to Bloom filter (NO false negatives)', () => {
      range(0, maxS).forEach(i => bloomf.add(i));
      range(0, maxS).every(i => bloomf.contains(i)).should.be.true();
    });
  });
  
  describe('contains() false positive ratio', () => {
    it('# Should be at most equal to tolerance', () => {
      let maxS = 1000;
      let maxToleranceArray = [1e-1, 1e-2, 1e-3, 1e-5, 1e-10, 1e-20];
      maxToleranceArray.forEach(maxT => {
        let bloomf = new BloomFilter(maxS, maxT);
        let v = randomInt(0, 1);
        let elements = [v];
        range(0, maxS).forEach(() => {
          v += randomInt(1, 10);
          elements.push(v);
          bloomf.add(v);
        });
        (range(0, v + 1).reduce((tot, i) => tot + (bloomf.contains(i) != (elements.indexOf(i) >= 0) ? 1 : 0)) / (v + 1)).should.not.be.greaterThan(maxT);
      });
    });
  });
});