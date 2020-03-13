import DisjointSet from '../../src/disjointset/disjointset.js';
import DisjointSetLists from '../../src/disjointset/variants/disjointset_lists.js';
import DisjointSetTrees from '../../src/disjointset/variants/disjointset_trees.js';
import {ERROR_MSG_INVALID_ARGUMENT} from '../../src/common/errors.js';
import {testAPI} from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT = (val, klassName) => `Illegal argument for ${klassName} constructor: ${val}`;
const ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT = (val, klassName) => `Duplicate element in initial set for ${klassName} constructor: ${val}`;
const ERROR_MSG_FIND_NOT_IN_SET = (val) => `Argument ${val} for method find does not belong to this set`;

/**
 * As in the basic version of the API findPartition returns a set, while in more sophisticated versions it returns the root
 * of the tree, we created a helper function to assert the result of findPartition in both cases.
 *
 * @param arg The arg used for findPartition (needed to check that the argument to findPartition itself is not a set).
 * @param expected The expected result from findPartition(arg).
 * @param result The actual result from findPartition(arg).
 */
function assertFind(arg, expected, result) {
  if ((result instanceof Set) && !(arg instanceof Set)) {
    result.has(expected).should.be.true();
  } else {
    result.should.eql(expected);
  }
}

let test = klass => {
  describe(`Testing ${klass.name}`, () => {
    describe('klass Module interface', () => {
      it('# Module should have all the constructor methods', () => {
        klass.should.be.a.constructor();
      });

      it('# Object\'s interface should be complete', () => {
        let uf = new klass();
        let methods = ['constructor', 'add', 'areDisjoint', 'merge', 'findPartition'];
        let attributes = ['size'];
        testAPI(uf, attributes, methods);
      });
    });


    describe('klass Creation', () => {
      describe('# Illegal arguments should throw', function () {
        it('> Not an array', () => {
          let arg = '123';
          klass.bind({}, arg).should.throw(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT(arg, klass.name));
          arg = {1: 1, 2: 'c', 'a': 3};
          klass.bind({}, arg).should.throw(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT(arg, klass.name));
        });

        it('> An array containing undefined or null', () => {
          klass.bind({}, ['1', null]).should.throw(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT(null, klass.name));
          klass.bind({}, ['a', undefined, '3',]).should.throw(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT(undefined, klass.name));
        });

        it('> Non-unique objects', () => {
          klass.bind({}, ['1', '1']).should.throw(ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT('1', klass.name));
          klass.bind({}, ['a', '2', '3', 'a']).should.throw(ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT('a', klass.name));
        });
      });

      describe('Shouldn\'t throw', () => {
        it('> with iterables', () => {
          klass.bind({}, [1, 2, 'a', new Set()]).should.not.throw();
          klass.bind({}, new Set(['a', 'bcd', [1, 2, 3]])).should.not.throw();
          klass.bind({}, new Map([[1, x => x], ['s', x => x.toString()]])).should.not.throw();
        });

        it('> when elements are different, but alike', () => {
          klass.bind({}, ['1', 1, '2', 2]).should.not.throw();
          klass.bind({}, new Set(['1', 1, '2', 2])).should.not.throw();
          klass.bind({}, new Map([['1', 2], [1, 2]])).should.not.throw();
          klass.bind({}, new Map([['1', '2'], ['1', 2]])).should.not.throw();
          klass.bind({}, new Map([['1', '2'], [1, 2]])).should.not.throw();
        });

      });
    });


    describe('findPartition method', () => {
      let uf;
      let keys = ['1', '2', '3', 'a', 'abc'];

      before(() => {
        uf = new klass(keys);
      });

      describe('# Illegal arguments should throw', function () {
        it('> Undefined', () => {
          uf.findPartition.bind(uf).should.throw(ERROR_MSG_INVALID_ARGUMENT('findPartition', 'elem', undefined));
        });
        it('> Not in the disjoint-set', () => {
          uf.findPartition.bind(uf, 'x').should.throw(ERROR_MSG_FIND_NOT_IN_SET('x'));
        });
      });

      it('# Called on existing elements, right after initialization', () => {
        keys.forEach(function testFind(k) {
          assertFind(k, k, uf.findPartition(k));
        });
      });
    });


    describe('merge method', () => {
      let uf;
      let keys = ['1', '2', '3', '4', '5', '6'];

      before(() => {
        uf = new klass(keys);
      });

      describe('# Illegal arguments should throw', function () {
        it('> Undefined', () => {
          uf.merge.bind(uf).should.throw();
          uf.merge.bind(uf, 'x').should.throw();
        });
        it('> Not in the klass', () => {
          uf.merge.bind(uf, 'x', 'y').should.throw();
        });
      });

      it('# Called on existing elements, right after initialization', () => {
        uf.merge.bind(uf, '1', '2').should.not.throw();
        //Now findPartition should be equal for both
        uf.findPartition('1').should.equal(uf.findPartition('2'));
      });

      it('# Called on elements in different groups, should return true', () => {
        uf.merge('5', '6').should.equal(true);
        //Now findPartition should be equal for both
        uf.findPartition('5').should.equal(uf.findPartition('6'));
      });

      it('# Called on elements in the same groups, should return false', () => {
        uf.merge('5', '6').should.equal(false);
        //Now findPartition should be equal for both
        uf.findPartition('5').should.equal(uf.findPartition('6'));
      });

      it('# Union of elements with different rank', () => {
        let uf = new klass(keys);
        let r;

        uf.merge('1', '2').should.equal(true);
        //INVARIANT: the three with '1' and '2' has already rank 1
        r = uf.findPartition('1'); //INVARIANT: either '1' or '2'
        uf.merge.bind(uf, '1', '3').should.not.throw();
        //Now findPartition should be equal for both
        uf.findPartition('3').should.equal(r);

        //Now merge more
        uf.merge.bind(uf, '3', '4').should.not.throw();
        uf.findPartition('4').should.equal(uf.findPartition('1'));
        uf.findPartition('4').should.equal(uf.findPartition('2'));
        uf.findPartition('4').should.equal(uf.findPartition('3'));

        //Now merge 5 and 6 => their rank should be smaller than 1 -> 2 -> 3 -> 4...

        uf.merge.bind(uf, '5', '6').should.not.throw();
        uf.findPartition('5').should.equal(uf.findPartition('6'));

        //... so they should become a subset of the other three
        uf.merge.bind(uf, '3', '6').should.not.throw();
        uf.findPartition('5').should.equal(r);
        uf.findPartition('6').should.equal(r);
      });
    });


    describe('areDisjoint method', () => {
      let uf;
      let keys = ['1', '2', '3'];

      beforeEach(() => {
        uf = new klass(keys);
      });

      describe('# Illegal arguments should throw', function () {
        it('> Undefined', () => {
          uf.areDisjoint.bind(uf).should.throw();
          uf.areDisjoint.bind(uf, 'x').should.throw();
        });

        it('> Not in the klass', () => {
          uf.areDisjoint.bind(uf, 'x', 'y').should.throw();
        });
      });

      it('# If elements are disjoint should return true', () => {
        let n = keys.length;
        Object.keys(keys).forEach(function testFind(i) {
          i = Number(i);
          if (i < n - 1) {
            uf.areDisjoint(keys[i], keys[i + 1]).should.equal(true);
          }
        });
      });

      it('# If elements are NOT disjoint should return false', () => {
        uf.merge('3', '1');
        uf.areDisjoint('1', '3').should.equal(false);
      });

      it('# Order shouldn\'t matter', () => {
        uf.areDisjoint('1', '3').should.equal(uf.areDisjoint('3', '1'));
        uf.areDisjoint('1', '2').should.equal(uf.areDisjoint('2', '1'));
        uf.areDisjoint('2', '3').should.equal(uf.areDisjoint('3', '2'));
      });
    });


    describe('add method', () => {
      let uf;
      let keys = ['1', '2', '3', 1];

      before(() => {
        uf = new klass(keys);
      });

      describe('# Illegal arguments should throw', function () {
        it('> Undefined', () => {
          uf.add.bind(uf).should.throw(ERROR_MSG_INVALID_ARGUMENT('add', 'elem', undefined));
        });
        it('> Null', () => {
          uf.add.bind(uf, null).should.throw(ERROR_MSG_INVALID_ARGUMENT('add', 'elem', null));
        });
      });

      it('# Trying to add an existing element return false', () => {
        keys.forEach(function testFind(k) {
          uf.add(k).should.equal(false);
        });
      });

      it('# Trying to add a new element succeeds returning true', () => {
        let testKeys = ['new', [], {}, 2];
        testKeys.forEach(function (a) {
          uf.add(a).should.equal(true);
          assertFind(a, a, uf.findPartition(a));
        });
      });
    });

    describe('Size method', () => {
      let uf;
      let keys = ['1', '2', '3'];

      beforeEach(() => {
        uf = new klass(keys);
      });

      describe('# After creation', function () {
        it('> Size should be consistent', () => {
          uf.size.should.equal(keys.length);
        });

        it('> Union should not change size', () => {
          uf.merge('1', '2');
          uf.size.should.equal(keys.length);

          uf.merge('3', '2');
          uf.size.should.equal(keys.length);
        });
      });

      it('# Adding element should correctly modify size', () => {
        let testKeys = ['new', [], [2], {}];

        testKeys.forEach(function (k) {
          let oldSize = uf.size;
          let res = uf.add(k);

          if (res) {
            uf.size.should.equal(oldSize + 1);
          } else {
            uf.size.should.equal(oldSize);
          }
        });
      });
    });
  });
};

// We conveniently run the same tests for the three versions of DisjointSet that we have defined, to show they are equivalent.
[DisjointSet, DisjointSetLists, DisjointSetTrees].forEach(test);