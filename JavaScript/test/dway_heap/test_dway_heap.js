import DWayHeap from '../../src/dway_heap/dway_heap.js';
import { testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM = (str) => `Illegal argument for DWayHeap constructor: branchFactor ${str}`;
const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_SND_PARAM = (str) => `Illegal argument for DWayHeap constructor: elements ${str}`;
const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM = (str) => `Illegal argument for DWayHeap constructor: compare ${str}`;
const ERROR_MSG_DWAYHEAP_PUSH = (str) => `Illegal argument for push: ${str}`;
const ERROR_MSG_DWAYHEAP_EMPTY_HEAP = () => `Invalid Status: Empty Heap`;
const ERROR_MSG_DWAYHEAP_CHECK = () => `Heap Properties Violated`;
const ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY = (str) => `Out of range argument: element ${str} not stored in the heap`;
const ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API = (str) => `Illegal argument for updatePriority: ${str}`;
const ERROR_MSG_DWAYHEAP_ELEMENT_POSITION = (str) => `Error: can't find position for elem:  ${str}`;


describe('DWayHeap API', () => {

  it('# Class should have a constructor method', function () {
    DWayHeap.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let heap = new DWayHeap(2);
    let methods = ['constructor', 'push', 'top', 'peek', 'updatePriority', 'contains', 'isEmpty', 'sorted'];
    let attributes = ['size', 'branchFactor'];
    testAPI(heap, attributes, methods);

  });
});

describe('DWayHeap Creation', () => {
  var heap;

  before(() => {
    heap = new DWayHeap(2);
  });

  describe('# Parameters', () => {
    describe('# 1st argument (mandatory)', () => {
      it('should default to branchFactor 2', () => {
        new DWayHeap().branchFactor.should.equal(2);
      });

      it('should throw with non-integer branching factor', () => {
        expect(() => new DWayHeap([])).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM([]));
        expect(() => new DWayHeap('g')).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM('g'));
        expect(() => new DWayHeap({ '1': 2 })).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM({ '1': 2 }));
      });

      it('should throw with branching factor < 2', () => {
        expect(() => new DWayHeap(1)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM(1));
        expect(() => new DWayHeap(1.5)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM(1.5));
        expect(() => new DWayHeap('1.99')).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM('1.99'));
      });

      it('should NOT throw with branching factor parsable to an int >= 2', () => {
        expect(() => new DWayHeap(3)).not.to.throw();
        expect(() => new DWayHeap('2')).not.to.throw();
      });
    });

    describe('# 2nd argument (optional)', () => {

      it('should throw when it\'s not an array', () => {
        expect(() => new DWayHeap(2, 4)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_SND_PARAM(4));
        expect(() => new DWayHeap(4, '4')).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_SND_PARAM('4'));
        expect(() => new DWayHeap(3, { '4': 4 })).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_SND_PARAM({ '4': 4 }));
      });

      it('should NOT throw with isEmpty arrays', () => {
        expect(() => new DWayHeap(2, [])).not.to.throw();
      });

      it('should throw for null', () => {
        expect(() => new DWayHeap(2, null)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_SND_PARAM(null));
      });
    });

    describe('# 3rd argument (optional)', () => {

      it('should throw with null', () => {
        expect(() => new DWayHeap(2, [], null)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM(null));
      });

      it('should throw if it\'s not a function', () => {
        expect(() => new DWayHeap(3, [], 'r')).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM('r'));
        expect(() => new DWayHeap(3, [], 'r')).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM('r'));
        expect(() => new DWayHeap(3, [], 5)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM(5));
        expect(() => new DWayHeap(3, [], { '5': 5 })).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM({ '5': 5 }));
      });

      it('should throw if compare function contains length !== 2', () => {
        let f = () => undefined;
        expect(() => new DWayHeap(2, [], f)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM(f));
        f = (a) => undefined;
        expect(() => new DWayHeap(2, [], f)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM(f));
        f = (a, b, c) => 1;
        expect(() => new DWayHeap(2, [], f)).to.throw(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM(f));
      });

      it('should NOT throw if compare function contains length == 2', () => {
        expect(() => new DWayHeap(2, [], (a, b) => null)).not.to.throw();
      });
    });
  });
});

describe('Attributes', () => {
  describe('size', () => {
    var heaps;
    before(function () {
      heaps = [
        new DWayHeap(2),
        new DWayHeap(3),
        new DWayHeap(4),
        new DWayHeap(5),
        new DWayHeap(6)
      ];
    });

    it('# should return 0 for empty heap', () => {
      heaps.forEach(function (h) {
        h.size.should.equal(0);
      });
    });

    it('# Push method should increment heap size', () => {
      heaps.forEach(function (h) {
        h.push(Math.random());
        h.size.should.equal(1);
      });

      heaps.forEach(function (h) {
        h.push(Math.random());
        h.size.should.equal(2);
      });
    });

    it('# should return the right value when initialized with an array', () => {
      [2, 3, 4, 5, 6].forEach(function (b) {
        var h = new DWayHeap(b, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        h.size.should.equal(10);
      });
    });
  });

  describe('branchFactor', () => {
    it('# should return the right value for upon construction', () => {
      [2, 3, 4, 5, 6].forEach(function (b) {
        var h = new DWayHeap(b, []);
        h.branchFactor.should.equal(b);
        h = new DWayHeap(b, [1, 2, 3]);
        h.branchFactor.should.equal(b);
      });
    });
  });
});

describe('Methods', () => {
  describe('isEmpty()', () => {
    var heaps;
    before(function () {
      heaps = [
        new DWayHeap(2),
        new DWayHeap(3),
        new DWayHeap(4),
        new DWayHeap(5),
        new DWayHeap(6)
      ];
    });

    it('# should return true on empty heap', () => {
      heaps.forEach(function (h) {
        h.isEmpty().should.equal(true);
      });
    });

    it('# should return false after insertion', () => {
      heaps.forEach(function (h) {
        h.push(Math.random());
        h.isEmpty().should.equal(false);
      });
    });

    it('# should return false when initialized with a non empty array', () => {
      [2, 3, 4, 5, 6].forEach(function (b) {
        var h = new DWayHeap(b, [1, 2]);
        h.isEmpty().should.equal(false);
      });
    });
  });

  describe('push()', () => {
    var heaps;
    before(function () {
      heaps = [
        new DWayHeap(2),
        new DWayHeap(3),
        new DWayHeap(4),
        new DWayHeap(5),
        new DWayHeap(6)
      ];
    });

    it('# should throw when called with illegal arguments', () => {
      heaps.forEach(function (h) {
        expect(() => h.push()).to.throw(ERROR_MSG_DWAYHEAP_PUSH());
        expect(() => h.push(null)).to.throw(ERROR_MSG_DWAYHEAP_PUSH(null));
      });
    });

    it('# should insert values correctly', () => {
      heaps.forEach(function (h) {
        expect(() => h.push(Math.random())).not.to.throw();
        expect(() => h.push('1')).not.to.throw();
        expect(() => h.push(false)).not.to.throw();
        expect(() => h.push([Math.random()])).not.to.throw();
        expect(() => h.push({ 'x': Math.random() })).not.to.throw();
      });
    });

    it('# should work correctly with compare functions', () => {
      heaps = [
        new DWayHeap(2, undefined, function (x, y) {
          return x - y;
        }),
        new DWayHeap(3, undefined, function (x, y) {
          return y - x;
        }),
        new DWayHeap(4, undefined, function (x, y) {
          return x < y ? -1 : (x === y ? 0 : 1);
        }),
        new DWayHeap(5, undefined, function (x, y) {
          return x - y;
        }),
        new DWayHeap(6, undefined, function (x, y) {
          return x > y ? -1 : (x === y ? 0 : 1);
        })
      ];

      heaps.forEach(function (h) {
        [2, '3', [4], { 6: '6' }].forEach(function (elem) {
          expect(() => h.push(elem)).not.to.throw();
        });
      });

      heaps.forEach(function (h) {
        var i;
        for (i = 0; i < 100; i++) {
          expect(() => h.push(Math.random())).not.to.throw();
        }
      });
    });

  });

  describe('peek()', () => {
    var heaps;
    before(function () {
      heaps = [
        new DWayHeap(2),
        new DWayHeap(3),
        new DWayHeap(4),
        new DWayHeap(5),
        new DWayHeap(6)
      ];
    });

    it('# should throw when heap is empty', () => {
      heaps.forEach(function (h) {
        expect(() => h.peek()).to.throw(ERROR_MSG_DWAYHEAP_EMPTY_HEAP());
      });
    });

    it('# should peek the \'smallest\' value in the heap', () => {
      heaps.forEach(function (h) {
        [7, 6, 5, 4, 3, 2, 1].forEach(function (v) {
          h.push(v);
          h.peek().should.equal(v);
        });
      });
    });

    it('# should peek the \'smallest\' value in the heap (heapify version)', () => {
      heaps = [
        new DWayHeap(2, [7, 6, 5, 4, 3, 2, 1]),
        new DWayHeap(3, [1, 6, 3, 4, 23, 2, 11]),
        new DWayHeap(4, [1, 2, 3, 4, 5, 6, 7]),
        new DWayHeap(5, [12, 6, 35, 14, 1, 3, 23, 11]),
        new DWayHeap(6, [7, 6, 5, 4, 3, 2, 1])
      ];
      heaps.forEach(function (h) {
        h.peek().should.equal(1);
      });
    });

    it('# should work correctly with compare functions', () => {
      var functions = [
        function (x, y) {
          return x - y;
        },
        function (x, y) {
          return y - x;
        },
        function (x, y) {
          return x < y ? -1 : (x === y ? 0 : 1);
        },
        function (x, y) {
          return x - y;
        },
        function (x, y) {
          return x > y ? -1 : (x === y ? 0 : 1);
        }
      ],
        heaps = [
          new DWayHeap(2, undefined, functions[0]),
          new DWayHeap(3, undefined, functions[1]),
          new DWayHeap(4, undefined, functions[2]),
          new DWayHeap(5, undefined, functions[3]),
          new DWayHeap(6, undefined, functions[4])
        ],
        keys = [2, '3', [4], { 6: '6' }],
        counter = 0;

      heaps.forEach(function (h) {
        var i,
          n,
          minEl = keys[0];
        for (i = 0, n = keys.length; i < n; i++) {
          h.push(keys[i]);
          if (functions[counter](keys[i], minEl) < 0) {
            minEl = keys[i];
          }
          h.peek().should.eql(minEl);
        }

        counter += 1;
      });
    });

  });


  describe('top()', () => {
    var heaps;
    before(function () {
      heaps = [
        new DWayHeap(2),
        new DWayHeap(3),
        new DWayHeap(4),
        new DWayHeap(5),
        new DWayHeap(6)
      ];
    });

    it('# should throw only when heap is empty', () => {
      heaps.forEach(function (h) {
        expect(() => h.top()).to.throw(ERROR_MSG_DWAYHEAP_EMPTY_HEAP());
      });

      heaps.forEach(function (h) {
        h.push(Math.random());
        expect(() => h.top()).not.to.throw(); //First time the heap is not empty...
        expect(() => h.top()).to.throw(ERROR_MSG_DWAYHEAP_EMPTY_HEAP()); //..but second time it should better be
      });
    });

    it('# should return the \'smallest\' value in the heap', () => {
      heaps.forEach(function (h) {
        var i,
          size;
        h.push(1);
        for (i = 0; i < 1 + Math.random() * 100; i++) {
          h.push(1 + Math.random());  //Number greater than 1
        }
        size = h.size;
        h.top().should.equal(1);
        h.size.should.equal(size - 1);
      });
    });

    it('# should return the \'smallest\' value in the heap (heapify version)', () => {
      heaps = [
        new DWayHeap(2, [7, 6, 5, 4, 3, 2, 1]),
        new DWayHeap(3, [1, 6, 3, 4, 23, 2, 11]),
        new DWayHeap(4, [1, 2, 3, 4, 5, 6, 7]),
        new DWayHeap(5, [12, 6, 35, 14, 1, 3, 23, 11]),
        new DWayHeap(6, [7, 6, 5, 4, 3, 2, 1])
      ];
      heaps.forEach(function (h) {
        h.top().should.equal(1);
      });
    });

    it('# should work correctly with compare functions', () => {
      var functions = [
        function (x, y) {
          return x - y;
        },
        function (x, y) {
          return y - x;
        },
        function (x, y) {
          return x < y ? -1 : (x === y ? 0 : 1);
        },
        function (x, y) {
          return x - y;
        },
        function (x, y) {
          return x > y ? -1 : (x === y ? 0 : 1);
        }
      ],
        heaps = [
          new DWayHeap(2, undefined, functions[0]),
          new DWayHeap(3, undefined, functions[1]),
          new DWayHeap(4, undefined, functions[2]),
          new DWayHeap(5, undefined, functions[3]),
          new DWayHeap(6, undefined, functions[4])
        ],
        keys = [2, '3', [4], { 6: '6' }],
        counter = 0;

      heaps.forEach(function (h) {
        var i,
          n,
          minEl = keys[0];
        for (i = 0, n = keys.length; i < n; i++) {
          h.push(keys[i]);
          if (functions[counter](keys[i], minEl) < 0) {
            minEl = keys[i];
          }
        }
        h.top().should.equal(minEl);

        counter += 1;
      });
    });

  });

  describe('contains()', () => {
    var heaps;

    before(function () {
      heaps = [
        new DWayHeap(2),
        new DWayHeap(3),
        new DWayHeap(4),
        new DWayHeap(5),
        new DWayHeap(6)
      ];
    });

    it('# should NOT throw when the argument is undefined or null or a function', () => {
      heaps.forEach(function (h) {
        expect(() => h.contains()).not.to.throw();
        expect(() => h.contains(null)).not.to.throw();
        expect(() => h.contains(function () {
        })).not.to.throw();
      });
    });

    it('# should return false when the argument is undefined or null or a function', () => {
      heaps.forEach(function (h) {
        h.contains().should.equal(false);
        h.contains(null).should.equal(false);
        h.contains(function () {
        }).should.equal(false);
      });
    });

    it('# should return true only if the element is present', () => {
      heaps = [
        new DWayHeap(2, [7, 6, 5, 4, 3, 2, 1]),
        new DWayHeap(3, [1, 6, 3, 4, 23, 2, 11]),
        new DWayHeap(4, [1, 2, 3, 4, 5, 6, 7]),
        new DWayHeap(5, [12, 6, 35, 4, 1, 3, 23, 11]),
        new DWayHeap(6, [7, 6, 5, 4, 3, 2, 1])
      ];
      heaps.forEach(function (h) {
        var x = [4, 6, 1][Math.floor(Math.random() * 3)];
        h.contains(x).should.equal(true);
        h.contains('x').should.equal(false);
      });
    });

    it('# should work for different data types', () => {
      var heap = new DWayHeap(2, ['7', '6', '5', '4', '3', '2', '1']);
      heap.contains('5').should.equal(true);
      heap.contains('55').should.equal(false);

      let array = [['7', '6', '5'], ['4', '3'], [], ['2', '1']];
      let [a, _, c, __] = array;
      heap = new DWayHeap(3, array);
      heap.contains(c).should.equal(true);
      heap.contains(a).should.equal(true);
      // Different array with different values
      heap.contains(['7', '5', '6']).should.equal(false);
      // Different array with same values
      heap.contains(['7', '5', '6']).should.equal(false);
    });
  });

  describe('updatePriority()', () => {
    var heaps;
    before(function () {
      heaps = [
        new DWayHeap(2),
        new DWayHeap(3),
        new DWayHeap(4),
        new DWayHeap(5),
        new DWayHeap(6)
      ];
    });


    it('# should throw when one of the arguments is undefined or null or a function', () => {
      heaps.forEach(function (h) {
        expect(() => h.updatePriority()).to.throw(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION());
        expect(() => h.updatePriority(null)).to.throw(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION(null));
        expect(() => h.updatePriority(() => {
        })).to.throw(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION(() => {
        }));
        h.push(1);
        expect(() => h.updatePriority(1)).to.throw(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API());
        expect(() => h.updatePriority(1, null)).to.throw(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API(null));
        expect(() => h.updatePriority(1, function () {
        })).to.throw(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API(function () {
        }));
      });
    });

    it('# should throw when the element is not in the heap', () => {
      heaps.forEach(function (h) {
        expect(() => h.updatePriority(5, 2)).to.throw(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION(5));
      });
    });


    it('# should not throw on existing values', () => {
      heaps = [
        new DWayHeap(2, [7, 6, 5, 4, 3, 2, 1]),
        new DWayHeap(3, [1, 6, 3, 4, 23, 2, 11]),
        new DWayHeap(4, [1, 2, 3, 4, 5, 6, 7]),
        new DWayHeap(5, [12, 6, 35, 4, 1, 3, 23, 11]),
        new DWayHeap(6, [7, 6, 5, 4, 3, 2, 1])
      ];
      heaps.forEach(function (h) {
        expect(() => h.updatePriority(4, Math.random())).not.to.throw();
      });
    });

    it('# should not violate heap properties', () => {
      heaps = [
        new DWayHeap(2, [7, 6, 5, 4, 3, 2, 1]),
        new DWayHeap(3, [1, 6, 3, 4, 23, 2, 11]),
        new DWayHeap(4, [1, 2, 3, 4, 5, 6, 7]),
        new DWayHeap(5, [12, 6, 35, 4, 1, 3, 23, 11]),
        new DWayHeap(6, [7, 6, 5, 4, 3, 2, 1])
      ];
      heaps.forEach(function (h) {
        var hKeys;
        expect(() => h.updatePriority([4, 6, 1][Math.floor(Math.random() * 3)], Math.random())).not.to.throw();
        hKeys = h.sorted();
        hKeys.should.be.an.Array();
        hKeys.should.eql(hKeys.sort());
      });
    });

  });

  describe('sorted()', () => {
    var heaps;

    before(function () {
      heaps = [
        new DWayHeap(2, [7, 6, 5, 4, 3, 2, 1]),
        new DWayHeap(3, [1, 6, 3, 4, 23, 2, 11]),
        new DWayHeap(4, [1, 2, 3, 4, 5, 6, 7]),
        new DWayHeap(5, [12, 6, 35, 4, 1, 3, 23, 11]),
        new DWayHeap(6, [7, 6, 5, 4, 3, 2, 1])
      ];
    });

    it('# should return a sorted array', () => {

      heaps.forEach(function (h) {
        var size = h.size;
        var elements = h.sorted();
        elements.should.be.an.Array();
        elements.length.should.eql(size);
        elements.should.eql(elements.sort());
      });
    });
  });

  describe('iterator', () => {
    var heaps;

    before(function () {
      heaps = [
        new DWayHeap(2, [7, 6, 5, 4, 3, 2, 1]),
        new DWayHeap(3, [1, 6, 3, 4, 23, 2, 11]),
        new DWayHeap(4, [1, 2, 3, 4, 5, 6, 7]),
        new DWayHeap(5, [12, 6, 35, 4, 1, 3, 23, 11]),
        new DWayHeap(6, [7, 6, 5, 4, 3, 2, 1])
      ];
    });

    it('# should allow iteration through elements in sorted order', () => {
      heaps.forEach(function (h) {
        var elements = [];
        var size = h.size;
        for (let el of h) {
          elements.push(el);
        }
        elements.should.be.an.Array();
        elements.length.should.eql(size);
        elements.should.eql(elements.sort());
      });
    });
  });
});