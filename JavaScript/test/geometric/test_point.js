import Point from '../../src/geometric/point.js';
import { isUndefined } from '../../src/common/basic.js';
import { range } from '../../src/common/numbers.js';
import { ERROR_MSG_INVALID_DIMENSION_INDEX, ERROR_MSG_PARAM_EMPTY_ARRAY, ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';
import { testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_PARAM_INVALID_POINT = (fname, val, dimension, pname = 'point') => `Illegal argument for ${fname}: ${pname} = ${val} must be of class Point${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;

describe('Point API', () => {

  it('# should have a constructor method', function () {
    Point.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let point = new Point(1, 2);

    let methods = ['constructor', 'coordinates', 'coordinate', 'equals', 'distanceTo', 'maxDistance', 'minDistance', 'toString'];
    let attributes = ['dimensionality'];
    testAPI(point, attributes, methods);
  });

  it('# Static methods', () => {
    expect(Point.validatePoint).to.be.a('function');
    expect(Point.validatePointArray).to.be.a('function');
    expect(Point.random).to.be.a('function');
    expect(Point.zero).to.be.a('function');
  });
});

describe('Point Creation', () => {
  var point;

  describe('# Parameters', () => {
    it('should throw when no key is passed', () => {
      expect(() => new Point()).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [undefined], 'sequence of numbers'));
    });

    it('should throw when x is not a number', () => {
      expect(() => new Point(null)).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [null], 'sequence of numbers'));
      expect(() => new Point('a')).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', ['a'], 'sequence of numbers'));
      expect(() => new Point([])).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [[]], 'sequence of numbers'));
      expect(() => new Point({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [{ '4': 4 }], 'sequence of numbers'));
    });

    it('should throw when y is not a number', () => {
      expect(() => new Point(1, null)).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [1, null], 'sequence of numbers'));
      expect(() => new Point(2, 'erwer')).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [2, 'erwer'], 'sequence of numbers'));
      expect(() => new Point(3, [])).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [3, []], 'sequence of numbers'));
      expect(() => new Point(4, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [4, { '4': 4 }], 'sequence of numbers'));
    });

    it('should throw when z is not a number', () => {
      expect(() => new Point(1, 1, null)).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [1, 1, null], 'sequence of numbers'));
      expect(() => new Point(2, 2, 'erwer')).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [2, 2, 'erwer'], 'sequence of numbers'));
      expect(() => new Point(3, 3, [])).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [3, 3, []], 'sequence of numbers'));
      expect(() => new Point(4, 4, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [4, 4, { '4': 4 }], 'sequence of numbers'));
    });

    it('should not throw with valid parameters', () => {
      expect(() => new Point(1)).not.to.throw();
      expect(() => new Point(1, 2)).not.to.throw();
      expect(() => new Point(0, 3.1415, -20.12)).not.to.throw();
      expect(() => new Point(Number.MAX_VALUE, Number.MAX_VALUE)).not.to.throw();
      expect(() => new Point(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).not.to.throw();
    });
  });
});

describe('Attributes', () => {
  var point1D;
  var point2D;
  var point3D;
  var point4D;

  before(function () {
    point1D = Point.random(1);
    point2D = Point.random(2);
    point3D = Point.random(3);
    point4D = Point.random(4);
  });

  describe('dimensionality', () => {
    it('should hold the correct value', () => {
      point1D.dimensionality.should.equal(1);
      point2D.dimensionality.should.equal(2);
      point3D.dimensionality.should.equal(3);
      point4D.dimensionality.should.equal(4);
    });
  });
});

describe('Static Methods', () => {
  describe('validatePoint()', () => {
    describe('API', () => {
      it('should expect 1 parameter', () => {
        Point.validatePoint.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Point.validatePoint()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', undefined));
      });

      it('should throw if dimensionality is not a valid safe integer', () => {
        expect(() => Point.validatePoint(new Point(1, 2), 0)).to.throw(ERROR_MSG_PARAM_TYPE('validatePoint', 'dimensionality', 0, 'positive integer'));
        expect(() => Point.validatePoint(new Point(1, 2), -1)).to.throw(ERROR_MSG_PARAM_TYPE('validatePoint', 'dimensionality', -1, 'positive integer'));
        expect(() => Point.validatePoint(new Point(1, 2), 1.2)).to.throw(ERROR_MSG_PARAM_TYPE('validatePoint', 'dimensionality', 1.2, 'positive integer'));
      });

      it('should accept an optional function name', () => {
        expect(() => Point.validatePoint(null, 1, 'test')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('test', null));
      });
    });

    describe('Behaviour', () => {
      it('should throw if the argument is not a valid point', () => {
        expect(() => Point.validatePoint(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', 1));
        expect(() => Point.validatePoint(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', false));
        expect(() => Point.validatePoint('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', 's'));
        expect(() => Point.validatePoint([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', []));
        expect(() => Point.validatePoint({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', { '4': 4 }));
      });

      it('should throw if the coordinates are not valid', () => {
        class StrangePoint extends Point {
          coordinates() {
            return ['s', 2];
          }
        }
        expect(() => Point.validatePoint(new StrangePoint(1, 2))).to.throw(ERROR_MSG_PARAM_TYPE('validatePoint', 'coordinates', ['s', 2], 'sequence of numbers'));
      });

      it('should throw if the point contains a different dimensionality', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => Point.validatePoint(p2D, 1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', p2D, 1));
        expect(() => Point.validatePoint(p2D, 3)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', p2D, 3));
        expect(() => Point.validatePoint(p4D, 2)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', p4D, 2));
        expect(() => Point.validatePoint(p4D, 3)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', p4D, 3));
        expect(() => Point.validatePoint(p4D, 5)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', p4D, 5));
      });

      it('should not throw if the point contains the right different dimensionality', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => Point.validatePoint(p2D)).not.to.throw();
        expect(() => Point.validatePoint(p2D, 2)).not.to.throw();
        expect(() => Point.validatePoint(p4D)).not.to.throw();
        expect(() => Point.validatePoint(p4D, 4)).not.to.throw();
      });
    });
  });

  describe('random()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        Point.random.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Point.random()).to.throw(ERROR_MSG_PARAM_TYPE('random', 'dimensionality', undefined, 'positive integer'));
      });

      it('should throw if the argument is not a positive integer', () => {
        expect(() => Point.random(0)).to.throw(ERROR_MSG_PARAM_TYPE('random', 'dimensionality', 0, 'positive integer'));
        expect(() => Point.random(-1)).to.throw(ERROR_MSG_PARAM_TYPE('random', 'dimensionality', -1, 'positive integer'));
        expect(() => Point.random('s')).to.throw(ERROR_MSG_PARAM_TYPE('random', 'dimensionality', 's', 'positive integer'));
        expect(() => Point.random([])).to.throw(ERROR_MSG_PARAM_TYPE('random', 'dimensionality', [], 'positive integer'));
      });

      it('should accept an optional function name', () => {
        expect(() => Point.random(null, 'test')).to.throw(ERROR_MSG_PARAM_TYPE('test', 'dimensionality', null, 'positive integer'));
      });
    });

    describe('Behaviour', () => {
      it('should return a Point', () => {
        expect(Point.random(1)).to.be.an.instanceOf(Point);
        expect(Point.random(3)).to.be.an.instanceOf(Point);
      });

      it('should return a Point with the right number of coordinates', () => {
        Point.random(1).dimensionality.should.equal(1);
        Point.random(2).dimensionality.should.equal(2);
        Point.random(3).dimensionality.should.equal(3);
        Point.random(4).dimensionality.should.equal(4);
      });

      it('should return a random Point', () => {
        range(1, 10).some(i => {
          let a = Point.random(i);
          let b = Point.random(i);
          return a.equals(b);
        }).should.false();
      });
    });
  });

  describe('zero()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        Point.zero.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Point.zero()).to.throw(ERROR_MSG_PARAM_TYPE('zero', 'dimensionality', undefined, 'positive integer'));
      });

      it('should throw if the argument is not a positive integer', () => {
        expect(() => Point.zero(0)).to.throw(ERROR_MSG_PARAM_TYPE('zero', 'dimensionality', 0, 'positive integer'));
        expect(() => Point.zero(-1)).to.throw(ERROR_MSG_PARAM_TYPE('zero', 'dimensionality', -1, 'positive integer'));
        expect(() => Point.zero('s')).to.throw(ERROR_MSG_PARAM_TYPE('zero', 'dimensionality', 's', 'positive integer'));
        expect(() => Point.zero([])).to.throw(ERROR_MSG_PARAM_TYPE('zero', 'dimensionality', [], 'positive integer'));
      });

      it('should accept an optional function name', () => {
        expect(() => Point.zero(null, 'test')).to.throw(ERROR_MSG_PARAM_TYPE('test', 'dimensionality', null, 'positive integer'));
      });
    });

    describe('Behaviour', () => {
      it('should return a Point', () => {
        expect(Point.zero(1)).to.be.an.instanceOf(Point);
        expect(Point.zero(3)).to.be.an.instanceOf(Point);
      });

      it('should return a Point with the right number of coordinates', () => {
        Point.zero(1).dimensionality.should.equal(1);
        Point.zero(2).dimensionality.should.equal(2);
        Point.zero(3).dimensionality.should.equal(3);
        Point.zero(4).dimensionality.should.equal(4);
      });

      it('should return a the origin for R^k', () => {
        range(1, 10).every(i => {
          let p = Point.zero(i);
          return range(0, i).every(d => p.coordinate(d) === 0);
        }).should.true();
      });
    });
  });

  describe('validatePointArray()', () => {
    describe('API', () => {
      it('should expect 2 mandatory arguments', () => {
        Point.validatePointArray.length.should.eql(2);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Point.validatePointArray()).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'maybePointsArray', undefined, 'array'));
      });

      it('should throw if dimensionality is not a valid safe integer', () => {
        expect(() => Point.validatePointArray([new Point(1, 2)], 0)).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'dimensionality', 0, 'positive integer'));
        expect(() => Point.validatePointArray([new Point(1, 2)], -1)).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'dimensionality', -1, 'positive integer'));
        expect(() => Point.validatePointArray([new Point(1, 2)], 1.2)).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'dimensionality', 1.2, 'positive integer'));
      });

    });

    describe('Behaviour', () => {
      it('should throw if the argument is not a valid array', () => {
        expect(() => Point.validatePointArray(1)).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'maybePointsArray', 1, 'array'));
        expect(() => Point.validatePointArray(false)).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'maybePointsArray', false, 'array'));
        expect(() => Point.validatePointArray('s')).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'maybePointsArray', 's', 'array'));
        expect(() => Point.validatePointArray(new Point(0, 0))).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'maybePointsArray', new Point(0, 0), 'array'));
        expect(() => Point.validatePointArray({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('validatePointArray', 'maybePointsArray', { '4': 4 }, 'array'));
      });

      it('should throw if the points have a different dimensionality than the requested one', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => Point.validatePointArray([p2D], 1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePointArray', [p2D], 1));
        expect(() => Point.validatePointArray([p4D], 2)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePointArray', [p4D], 2));
      });

      it('should throw if the points don\'t all have the same dimensionality', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => Point.validatePointArray([p2D, p4D], 2)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePointArray', p4D, 2));
      });

      it('should not throw if the array contains points with the right dimensionality', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => Point.validatePointArray([p2D])).not.to.throw();
        expect(() => Point.validatePointArray([p2D], 2)).not.to.throw();
        expect(() => Point.validatePointArray([p4D], 4)).not.to.throw();
      });

      it('should accept an optional function name', () => {
        expect(() => Point.validatePointArray(null, 1, 'test')).to.throw(ERROR_MSG_PARAM_TYPE('test', 'maybePointsArray', null, 'array'));
      });
    });
  });

  describe('centroid()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        Point.centroid.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Point.centroid()).to.throw(ERROR_MSG_PARAM_TYPE('centroid', 'maybePointsArray', undefined, 'array'));
      });

      it('should throw if the argument is not a valid points array', () => {
        expect(() => Point.centroid(1)).to.throw(ERROR_MSG_PARAM_TYPE('centroid', 'maybePointsArray', 1, 'array'));
        expect(() => Point.centroid(false)).to.throw(ERROR_MSG_PARAM_TYPE('centroid', 'maybePointsArray', false, 'array'));
        expect(() => Point.centroid('s')).to.throw(ERROR_MSG_PARAM_TYPE('centroid', 'maybePointsArray', 's', 'array'));
        expect(() => Point.centroid(new Point(0, 0))).to.throw(ERROR_MSG_PARAM_TYPE('centroid', 'maybePointsArray', new Point(0, 0), 'array'));
        expect(() => Point.centroid({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('centroid', 'maybePointsArray', { '4': 4 }, 'array'));
      });

      it('should throw if the argument is an empty array', () => {
        expect(() => Point.centroid([])).to.throw(ERROR_MSG_PARAM_EMPTY_ARRAY('centroid', 'pointsArray', 1, 'array'));
      });

      it('should throw if the points don\'t all have the same dimensionality', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => Point.centroid([p2D, p4D])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('centroid', p4D, 2));
      });

      it('should not throw if all the points have the same dimensionality', () => {
        let p2D = new Point(1, 2);
        expect(() => Point.centroid([p2D])).not.to.throw();
        expect(() => Point.centroid([p2D, p2D])).not.to.throw();
      });

      it('should accept an optional function name', () => {
        expect(() => Point.centroid(null, 'test')).to.throw(ERROR_MSG_PARAM_TYPE('test', 'maybePointsArray', null, 'array'));
      });

    });

    describe('Behaviour', () => {
      it('should return the point itself for a singleton', () => {
        let point = new Point(1, 2, 3, 4, 5);
        Point.centroid([point]).equals(point).should.be.true();
        point = new Point(1, 2, 3, 4, 5);
        Point.centroid([point]).equals(point).should.be.true();
      });

      it('should return the mean point of the set', () => {
        Point.centroid([new Point(1), new Point(2), new Point(3), new Point(-3), new Point(5)]).equals(new Point(8 / 5)).should.be.true();
        Point.centroid([new Point(0.5, 1), new Point(-1, 2), new Point(1.5, 0.75)]).equals(new Point(1 / 3, 1.25)).should.be.true();
        Point.centroid([new Point(0, 1, 0), new Point(-1, 1, 2), new Point(3, 4, 5)]).equals(new Point(2 / 3, 2, 7 / 3)).should.be.true();
      });
    });
  });
});

describe('Methods', () => {
  var point;
  var point2;
  var point3D;
  const x1 = 23;
  const y1 = -45;
  const x2 = Number.MAX_SAFE_INTEGER;
  const y2 = 2.1547889;
  const z2 = -66;

  before(function () {
    point = new Point(x1, y1);
    point2 = new Point(x2, y2);
    point3D = new Point(x2, y2, z2);
  });

  describe('coordinates()', () => {
    describe('API', () => {
      it('should expect no arguments', () => {
        point.coordinates.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      it('should return the correct value', () => {
        point.coordinates().should.be.eql([x1, y1]);
        point2.coordinates().should.be.eql([x2, y2]);
        point3D.coordinates().should.be.eql([x2, y2, z2]);
      });
    });
  });

  describe('coordinate()', () => {
    describe('API', () => {
      it('should expect 1 argument', () => {
        point.coordinate.length.should.eql(1);
      });

      it('should throw if the argument is not a valid integer', () => {
        expect(() => point.coordinate(1.2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', 1.2, 2));
        expect(() => point.coordinate(false)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', false, 2));
        expect(() => point.coordinate('s')).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', 's', 2));
        expect(() => point.coordinate({ '4': 4 })).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', { '4': 4 }, 2));
      });

      it('should throw if the argument is an integer but negative or greather than K - 1', () => {
        expect(() => point.coordinate(-1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', -1, 2));
        expect(() => point.coordinate(2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', 2, 2));

        let p = new Point(1, 2, 3, 4);
        expect(() => p.coordinate(-1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', -1, 4));
        expect(() => p.coordinate(5)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', 5, 4));
      });

      it('should accept either 0 or 1 for a 2d Point', () => {
        expect(() => point.coordinate(0)).not.to.throw();
        expect(() => point.coordinate(1)).not.to.throw();
      });

      it('should accept up to K-1 for a KD Point', () => {
        let p = new Point(1, 2, 3, 4);
        expect(() => p.coordinate(0)).not.to.throw();
        expect(() => p.coordinate(1)).not.to.throw();
        expect(() => p.coordinate(2)).not.to.throw();
        expect(() => p.coordinate(3)).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      it('should return the ith coordinate', () => {
        point.coordinate(0).should.be.eql(x1);
        point.coordinate(1).should.be.eql(y1);
        point2.coordinate(0).should.be.eql(x2);
        point2.coordinate(1).should.be.eql(y2);
        point3D.coordinate(0).should.be.eql(x2);
        point3D.coordinate(1).should.be.eql(y2);
        point3D.coordinate(2).should.be.eql(z2);
      });
    });
  });

  describe('equals()', () => {
    describe('API', () => {
      it('should expect 1 argument', () => {
        point.equals.length.should.eql(1);
      });
    });

    describe('Behaviour', () => {
      it('should return false if the argument is not a point', () => {
        point.equals().should.be.false();
        point2.equals().should.be.false();
      });

      it('should return false if the argument is a point with different coordinates', () => {
        point.equals(point2).should.be.false();
        point.equals(new Point(...point.coordinates().map(_ => _ + 1))).should.be.false();
        point.equals(Point.random(2)).should.be.false();
      });

      it('should return true if the argument is a point with the same coordinates', () => {
        point.equals(point).should.be.true();
        point.equals(new Point(...point.coordinates())).should.be.true();
        point3D.equals(new Point(...point3D.coordinates())).should.be.true();
        let [x, y] = [Math.random(), Math.random()];
        let p1 = new Point(x, y);
        let p2 = new Point(x, y);
        p1.equals(p2).should.be.true();
      });
    });
  });

  describe('toString()', () => {
    describe('API', () => {
      it('should expect no arguments', () => {
        point.toString.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      it('should return the string representation of a point', () => {
        point.toString().should.equal(`(${x1},${y1})`);
        point2.toString().should.equal(`(${x2},${y2})`);
        point3D.toString().should.equal(`(${x2},${y2},${z2})`);
        new Point(1, 2).toString().should.equal('(1,2)');
        new Point(-3.14).toString().should.equal('(-3.14)');
      });
    });
  });

  describe('distanceTo()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        point.distanceTo.length.should.eql(1);
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => point.distanceTo(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', 1, 2));
        expect(() => point.distanceTo(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', false, 2));
        expect(() => point.distanceTo('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', 's', 2));
        expect(() => point.distanceTo([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', [], 2));
        expect(() => point.distanceTo({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', { '4': 4 }, 2));
      });

      it('should throw if the points doesn\'t have the same dimensionality', () => {
        expect(() => point.distanceTo(new Point(1))).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', new Point(1), 2));
        expect(() => point3D.distanceTo(point)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', point, 3));
        expect(() => point.distanceTo(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', point3D, 2));
      });

      it('should throw if the coordinates are not valid', () => {
        class StrangePoint extends Point {
          coordinates() {
            return ['s', 2];
          }
        }
        expect(() => point.distanceTo(new StrangePoint(1, 2))).to.throw(ERROR_MSG_PARAM_TYPE('distanceTo', 'coordinates', ['s', 2], 'sequence of numbers'));
      });
    });

    describe('Behaviour', () => {
      it('should return the correct Euclidean distance', () => {
        let point = new Point(0, 0);
        let point2 = new Point(3, 4);
        point.distanceTo(point2).should.be.eql(5);
        point2.distanceTo(point).should.be.eql(5);
        point.distanceTo(point).should.be.eql(0);
        point2.distanceTo(point2).should.be.eql(0);
        point = new Point(2, 3);
        point.distanceTo(point2).should.be.eql(Math.sqrt(2));
        point = new Point(-2, 0, -1.75);
        point2 = new Point(1, 2, 1.25);
        point.distanceTo(point2).should.be.eql(Math.sqrt(22));
        point = new Point(0, 0, 0, 0);
        point2 = new Point(1, 1, 1, 1);
        point.distanceTo(point2).should.be.eql(2);
        point.distanceTo(point2).should.be.eql(point2.distanceTo(point));
      });
    });
  });

  describe('maxDistance()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        point.maxDistance.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => point.maxDistance()).to.throw(ERROR_MSG_PARAM_TYPE('maxDistance', 'maybePointsArray', undefined, 'array'));
      });

      it('should throw if the argument is not a valid points array', () => {
        expect(() => point.maxDistance(1)).to.throw(ERROR_MSG_PARAM_TYPE('maxDistance', 'maybePointsArray', 1, 'array'));
        expect(() => point.maxDistance(false)).to.throw(ERROR_MSG_PARAM_TYPE('maxDistance', 'maybePointsArray', false, 'array'));
        expect(() => point.maxDistance('s')).to.throw(ERROR_MSG_PARAM_TYPE('maxDistance', 'maybePointsArray', 's', 'array'));
        expect(() => point.maxDistance(new Point(0, 0))).to.throw(ERROR_MSG_PARAM_TYPE('maxDistance', 'maybePointsArray', new Point(0, 0), 'array'));
        expect(() => point.maxDistance({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('maxDistance', 'maybePointsArray', { '4': 4 }, 'array'));
      });

      it('should throw if the argument is an empty array', () => {
        expect(() => point.maxDistance([])).to.throw(ERROR_MSG_PARAM_EMPTY_ARRAY('maxDistance', 'pointsArray', 1, 'array'));
      });

      it('should throw if the points don\'t all have the same dimensionality', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => point.maxDistance([p2D, p4D])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('maxDistance', p4D, 2));
      });

      it('should not throw if all the points have the same dimensionality', () => {
        let p2D = new Point(1, 2);
        expect(() => point.maxDistance([p2D])).not.to.throw();
        expect(() => point.maxDistance([p2D, p2D])).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      it('should return the furthest point', () => {
        let point0 = new Point(0, 0);
        let point1 = new Point(3, 4);
        let point2 = new Point(1, 2);
        let point3 = new Point(-1, 2);
        let point4 = new Point(-1, -2);

        let [p, dist] = point0.maxDistance([point1, point2, point3]);
        p.equals(point1).should.be.true();
        dist.should.be.eql(p.distanceTo(point0));

        [p, dist] = point1.maxDistance([point0, point1, point2, point3, point4]);
        p.equals(point4).should.be.true();
        dist.should.be.eql(p.distanceTo(point1));
      });

      it('should check the whole array', () => {
        point = new Point(0, 0);
        let point1 = new Point(3, 4);
        let point2 = new Point(1, 2);
        let point3 = new Point(-1, 2);

        let [p, dist] = point.maxDistance([point1, point2, point, point3]);
        p.equals(point1).should.be.true();

        [p, dist] = point.maxDistance([point2, point1, point, point3]);
        p.equals(point1).should.be.true();

        [p, dist] = point.maxDistance([point2, point3, point, point1]);
        p.equals(point1).should.be.true();
      });
    });
  });

  describe('minDistance()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        point.minDistance.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => point.minDistance()).to.throw(ERROR_MSG_PARAM_TYPE('minDistance', 'maybePointsArray', undefined, 'array'));
      });

      it('should throw if the argument is not a valid points array', () => {
        expect(() => point.minDistance(1)).to.throw(ERROR_MSG_PARAM_TYPE('minDistance', 'maybePointsArray', 1, 'array'));
        expect(() => point.minDistance(false)).to.throw(ERROR_MSG_PARAM_TYPE('minDistance', 'maybePointsArray', false, 'array'));
        expect(() => point.minDistance('s')).to.throw(ERROR_MSG_PARAM_TYPE('minDistance', 'maybePointsArray', 's', 'array'));
        expect(() => point.minDistance(new Point(0, 0))).to.throw(ERROR_MSG_PARAM_TYPE('minDistance', 'maybePointsArray', new Point(0, 0), 'array'));
        expect(() => point.minDistance({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('minDistance', 'maybePointsArray', { '4': 4 }, 'array'));
      });

      it('should throw if the argument is an empty array', () => {
        expect(() => point.minDistance([])).to.throw(ERROR_MSG_PARAM_EMPTY_ARRAY('minDistance', 'pointsArray', 1, 'array'));
      });

      it('should throw if the points don\'t all have the same dimensionality', () => {
        let p2D = new Point(1, 2);
        let p4D = new Point(1, 2, 3, 4);
        expect(() => point.minDistance([p2D, p4D])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('minDistance', p4D, 2));
      });

      it('should not throw if all the points have the same dimensionality', () => {
        let p2D = new Point(1, 2);
        expect(() => point.minDistance([p2D])).not.to.throw();
        expect(() => point.minDistance([p2D, p2D])).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      it('should return the closest point', () => {
        let point = new Point(0, 0);
        let point1 = new Point(3, 4);
        let point2 = new Point(1, 2);
        let point3 = new Point(-1, 2);
        let point4 = new Point(-1, -2);

        let [p, dist] = point.minDistance([point1, point2, point3]);
        p.equals(point2).should.be.true();
        dist.should.be.eql(p.distanceTo(point));

        [p, dist] = point3.minDistance([point, point2, point1, point4]);
        p.equals(point2).should.be.true();
        dist.should.be.eql(p.distanceTo(point3));
      });

      it('should return itself when among the checked points', () => {
        let point = new Point(3, 4);
        let point1 = new Point(3, 4);
        let point2 = new Point(3 + 1e-20, 2);
        let point3 = new Point(-1, 2);

        let [p, dist] = point.minDistance([point1, point2, point3]);
        p.equals(point).should.be.true();
        dist.should.be.eql(0);
      });

      it('should check the whole array', () => {
        let point = new Point(0, 0);
        let point1 = new Point(3, 4);
        let point2 = new Point(1, 2);
        let point3 = new Point(-1, 2);

        let [p, dist] = point1.minDistance([point2, point, point3]);
        p.equals(point2).should.be.true();

        [p, dist] = point1.minDistance([point, point2, point3]);
        p.equals(point2).should.be.true();

        [p, dist] = point1.minDistance([point, point3, point2]);
        p.equals(point2).should.be.true();
      });
    });
  });

});