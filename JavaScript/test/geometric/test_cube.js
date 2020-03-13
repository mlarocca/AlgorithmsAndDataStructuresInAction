import Cube from '../../src/geometric/cube.js';
import Point from '../../src/geometric/point.js';
import { isUndefined } from '../../src/common/basic.js';
import { range } from '../../src/common/numbers.js';
import { ERROR_MSG_INVALID_DIMENSION_INDEX, ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';
import { testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_PARAM_INVALID_CUBE = (fname, val, dimension, pname = 'cube') =>
  `Illegal argument for ${fname}: ${pname} = ${val} must be of class Cube${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;
const ERROR_MSG_PARAM_INVALID_POINT = (fname, val, dimension, pname = 'point') => `Illegal argument for ${fname}: ${pname} = ${val} must be of class Point${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;
const ERROR_MSG_PARAM_INVALID_VERTICES = (fname, v1, v2) =>
  `Illegal argument for ${fname}: vertex ${v1.toString()} is not stricly lower than vertex ${v2.toString()}`;

describe('Cube API', () => {

  it('# should have a constructor method', () => {
    Cube.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let cube = new Cube(new Point(1, 2), new Point(2, 3));

    let methods = ['constructor', 'intersectWithTopBound', 'intersectWithBottomBound', 'equals', 'contains', 'intersects', 'containsPoint', 'toString'];
    let attributes = ['dimensionality', 'bottom', 'top'];
    testAPI(cube, attributes, methods);
  });

  it('# Static methods', () => {
    expect(Cube.validateCube).to.be.a('function');
  });
});

describe('Cube Creation', () => {
  var cube;
  var p1;
  var p2;

  before(() => {
    p1 = new Point(0, 0);
    p2 = new Point(1, 1);
  });

  describe('# Parameters', () => {
    it('should throw when no key is passed', () => {
      expect(() => new Cube()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', undefined));
    });

    it('should throw when bottom is not a valid point', () => {
      expect(() => new Cube(null)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', null));
      expect(() => new Cube('a')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', 'a'));
      expect(() => new Cube([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', []));
      expect(() => new Cube({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', { '4': 4 }));
    });

    it('should throw when top is not a valid point', () => {
      expect(() => new Cube(p1, null)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', null));
      expect(() => new Cube(p1, 'a')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', 'a'));
      expect(() => new Cube(p1, [])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', []));
      expect(() => new Cube(p1, { '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', { '4': 4 }));
    });

    it('should throw when points have a different dimensionality', () => {
      let p3 = new Point(1, 2, 3);
      expect(() => new Cube(p1, p3)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.constructor', p3, 2));
    });

    it('should throw when bottom is not < top', () => {
      expect(() => new Cube(p1, p1)).to.throw(ERROR_MSG_PARAM_INVALID_VERTICES('Cube.constructor', p1, p1));
      expect(() => new Cube(p2, p2)).to.throw(ERROR_MSG_PARAM_INVALID_VERTICES('Cube.constructor', p2, p2));
      let p3 = new Point(-1, 100);
      expect(() => new Cube(p1, p3)).to.throw(ERROR_MSG_PARAM_INVALID_VERTICES('Cube.constructor', p1, p3));
      p3 = new Point(1, -1);
      expect(() => new Cube(p1, p3)).to.throw(ERROR_MSG_PARAM_INVALID_VERTICES('Cube.constructor', p1, p3));
    });

    it('should not throw with valid parameters', () => {
      expect(() => new Cube(p1, p2)).not.to.throw();
    });
  });
});

describe('Attributes', () => {
  var cube1D;
  var cube4D;
  var p1;
  var p2;
  var p3;
  var p4;

  before(() => {
    [p1, p2] = [new Point(1), new Point(2)];
    [p3, p4] = [new Point(-1, -2, -3, -4), new Point(1, 2, 3, 4)];
    cube1D = new Cube(p1, p2);
    cube4D = new Cube(p3, p4);
  });

  describe('dimensionality', () => {
    it('should hold the correct value', () => {
      cube1D.dimensionality.should.equal(1);
      cube4D.dimensionality.should.equal(4);
    });
  });

  describe('bottom', () => {
    it('should hold the correct value', () => {
      cube1D.bottom.equals(p1).should.be.true();
      cube4D.bottom.equals(p3).should.be.true();
    });
  });

  describe('top', () => {
    it('should hold the correct value', () => {
      cube1D.top.equals(p2).should.be.true();
      cube4D.top.equals(p4).should.be.true();
    });
  });
});

describe('Static Methods', () => {
  var cube2D;
  var cube4D;
  var p1;
  var p2;
  var p3;
  var p4;

  before(() => {
    [p1, p2] = [new Point(1, 0), new Point(2, 1)];
    [p3, p4] = [new Point(-1, -2, -3, -4), new Point(1, 2, 3, 4)];
    cube2D = new Cube(p1, p2);
    cube4D = new Cube(p3, p4);
  });

  describe('validateCube()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        Cube.validateCube.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Cube.validateCube()).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', undefined));
      });

      it('should throw if dimensionality is not a valid safe integer', () => {
        expect(() => Cube.validateCube(cube2D, 0)).to.throw(ERROR_MSG_PARAM_TYPE('validateCube', 'dimensionality', 0, 'positive integer'));
        expect(() => Cube.validateCube(cube2D, -1)).to.throw(ERROR_MSG_PARAM_TYPE('validateCube', 'dimensionality', -1, 'positive integer'));
        expect(() => Cube.validateCube(cube2D, 1.2)).to.throw(ERROR_MSG_PARAM_TYPE('validateCube', 'dimensionality', 1.2, 'positive integer'));
      });

    });

    describe('Behaviour', () => {
      it('should throw if the argument is not a valid cube', () => {
        expect(() => Cube.validateCube(1)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', 1));
        expect(() => Cube.validateCube(false)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', false));
        expect(() => Cube.validateCube('s')).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', 's'));
        expect(() => Cube.validateCube([])).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', []));
        expect(() => Cube.validateCube({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', { '4': 4 }));
      });

      it('should throw if the cube contains a different dimensionality', () => {
        expect(() => Cube.validateCube(cube2D, 1)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', cube2D, 1));
        expect(() => Cube.validateCube(cube2D, 3)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', cube2D, 3));
        expect(() => Cube.validateCube(cube4D, 2)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', cube4D, 2));
        expect(() => Cube.validateCube(cube4D, 3)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', cube4D, 3));
        expect(() => Cube.validateCube(cube4D, 5)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('validateCube', cube4D, 5));
      });

      it('should not throw if the cube contains the right different dimensionality', () => {
        expect(() => Cube.validateCube(cube2D)).not.to.throw();
        expect(() => Cube.validateCube(cube2D, 2)).not.to.throw();
        expect(() => Cube.validateCube(cube4D)).not.to.throw();
        expect(() => Cube.validateCube(cube4D, 4)).not.to.throw();
      });

      it('should accept an optional function name', () => {
        expect(() => Cube.validateCube(null, 1, 'test')).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('test', null));
      });
    });
  });

  describe('R()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        Cube.R.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Cube.R()).to.throw(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', undefined, 'positive integer'));
      });

      it('should throw if dimensionality is not a valid safe integer', () => {
        expect(() => Cube.R('s')).to.throw(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', 's', 'positive integer'));
        expect(() => Cube.R([])).to.throw(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', [], 'positive integer'));
        expect(() => Cube.R({ x: 3 })).to.throw(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', { x: 3 }, 'positive integer'));
        expect(() => Cube.R(0)).to.throw(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', 0, 'positive integer'));
        expect(() => Cube.R(-1)).to.throw(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', -1, 'positive integer'));
        expect(() => Cube.R(1.2)).to.throw(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', 1.2, 'positive integer'));
      });

      it('should accept valid dimensionality', () => {
        expect(() => Cube.R(1)).not.to.throw();
        expect(() => Cube.R(33)).not.to.throw();
      });

    });

    describe('Behaviour', () => {
      it('should return a cube with the right dimensionality', () => {
        [1, 2, 3, 5].forEach(d => {
          let c = Cube.R(d);
          expect(c).to.be.instanceOf(Cube);
          c.dimensionality.should.be.eql(d);
        });
      });

      it('vertices should be infinity', () => {
        let c1 = Cube.R(1);
        c1.bottom.coordinate(0).should.be.eql(Number.NEGATIVE_INFINITY);
        c1.top.coordinate(0).should.be.eql(Number.POSITIVE_INFINITY);
        range(2, 6).forEach(dim => {
          let c = Cube.R(dim);
          range(0, dim).every(d => c.bottom.coordinate(d) === Number.NEGATIVE_INFINITY).should.be.true();
          range(0, dim).every(d => c.top.coordinate(d) === Number.POSITIVE_INFINITY).should.be.true();
        });
      });
    });
  });
});

describe('Methods', () => {
  var cube1D;
  var cube2D;
  var cube3D;
  var p1;
  var p2;
  var p3;
  var p4;
  var p5;
  var p6;

  before(() => {
    [p1, p2] = [new Point(1), new Point(2)];
    [p3, p4] = [new Point(-1, -2), new Point(1, 3)];
    [p5, p6] = [new Point(-1, -2, -3), new Point(1, 2, 3)];
    cube1D = new Cube(p1, p2);
    cube2D = new Cube(p3, p4);
    cube3D = new Cube(p5, p6);
  });

  describe('intersectWithTopBound()', () => {
    describe('API', () => {
      it('should expect 2 mandatory arguments', () => {
        cube1D.intersectWithTopBound.length.should.eql(2);
      });

      it('should throw if the first argument is not a valid point', () => {
        expect(() => cube1D.intersectWithTopBound([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithTopBound', [], 1));
        expect(() => cube1D.intersectWithTopBound(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithTopBound', false, 1));
        expect(() => cube1D.intersectWithTopBound('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithTopBound', 's', 1));
        expect(() => cube1D.intersectWithTopBound({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithTopBound', { '4': 4 }, 1));
      });

      it('should throw if the first argument is a valid point with a different dimensionality', () => {
        expect(() => cube1D.intersectWithTopBound(p3)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithTopBound', p3, 1));
        expect(() => cube2D.intersectWithTopBound(p1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithTopBound', p1, 2));
      });

      it('should throw if the second argument is not a valid dimension index', () => {
        expect(() => cube1D.intersectWithTopBound(p1, 1.2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', 1.2, 1));
        expect(() => cube2D.intersectWithTopBound(p3, -1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', -1, 2));
        expect(() => cube2D.intersectWithTopBound(p3, false)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', false, 2));
        expect(() => cube2D.intersectWithTopBound(p3, 's')).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', 's', 2));
        expect(() => cube3D.intersectWithTopBound(p5, { '4': 4 })).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', { '4': 4 }, 3));
      });

      it('should throw if the second argument is not an integer between 0 and K-1', () => {
        expect(() => cube1D.intersectWithTopBound(p2, 1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', 1, 1));
        expect(() => cube2D.intersectWithTopBound(p4, 2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', 2, 2));
        expect(() => cube2D.intersectWithTopBound(p4, 4)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', 4, 2));
        expect(() => cube3D.intersectWithTopBound(p6, 3)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', 3, 3));
      });

      it('should accept proper values for the arguments', () => {
        expect(() => cube1D.intersectWithTopBound(new Point(50), 0)).not.to.throw();
        expect(() => cube2D.intersectWithTopBound(new Point(0, -0.5), 1)).not.to.throw();
        expect(() => cube3D.intersectWithTopBound(new Point(1, 5.1230, 1), 1)).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      it('should return the ith intersectWithTopBound', () => {
        cube1D.intersectWithTopBound(new Point(1.5), 0).equals(new Cube(p1, new Point(1.5))).should.be.true();
        cube1D.intersectWithTopBound(new Point(5), 0).equals(cube1D).should.be.true();
        cube2D.intersectWithTopBound(new Point(0.34, 0), 0).equals(new Cube(p3, new Point(0.34, 3))).should.be.true();
        cube2D.intersectWithTopBound(new Point(0, 0.34), 1).equals(new Cube(p3, new Point(1, 0.34))).should.be.true();
        cube3D.intersectWithTopBound(new Point(-1000, -100, -0.134), 2).equals(new Cube(p5, new Point(1, 2, -0.134))).should.be.true();
      });
    });
  });

  describe('intersectWithBottomBound()', () => {
    describe('API', () => {
      it('should expect 2 mandatory arguments', () => {
        cube1D.intersectWithBottomBound.length.should.eql(2);
      });

      it('should throw if the first argument is not a valid point', () => {
        expect(() => cube1D.intersectWithBottomBound([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithBottomBound', [], 1));
        expect(() => cube1D.intersectWithBottomBound(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithBottomBound', false, 1));
        expect(() => cube1D.intersectWithBottomBound('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithBottomBound', 's', 1));
        expect(() => cube1D.intersectWithBottomBound({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithBottomBound', { '4': 4 }, 1));
      });

      it('should throw if the first argument is a valid point with a different dimensionality', () => {
        expect(() => cube1D.intersectWithBottomBound(p3)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithBottomBound', p3, 1));
        expect(() => cube2D.intersectWithBottomBound(p1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('Cube.intersectWithBottomBound', p1, 2));
      });

      it('should throw if the second argument is not a valid dimension index', () => {
        expect(() => cube1D.intersectWithBottomBound(p1, 1.2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', 1.2, 1));
        expect(() => cube2D.intersectWithBottomBound(p3, -1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', -1, 2));
        expect(() => cube2D.intersectWithBottomBound(p3, false)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', false, 2));
        expect(() => cube2D.intersectWithBottomBound(p3, 's')).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', 's', 2));
        expect(() => cube3D.intersectWithBottomBound(p5, { '4': 4 })).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', { '4': 4 }, 3));
      });

      it('should throw if the second argument is not an integer between 0 and K-1', () => {
        expect(() => cube1D.intersectWithBottomBound(p2, 1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', 1, 1));
        expect(() => cube2D.intersectWithBottomBound(p4, 2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', 2, 2));
        expect(() => cube2D.intersectWithBottomBound(p4, 4)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', 4, 2));
        expect(() => cube3D.intersectWithBottomBound(p6, 3)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', 3, 3));
      });

      it('should accept proper values for the arguments', () => {
        expect(() => cube1D.intersectWithBottomBound(new Point(-100), 0)).not.to.throw();
        expect(() => cube2D.intersectWithBottomBound(new Point(0, -0.5), 1)).not.to.throw();
        expect(() => cube3D.intersectWithBottomBound(new Point(1, -5.1230, 1), 1)).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      it('should return the ith intersectWithBottomBound', () => {
        cube1D.intersectWithBottomBound(new Point(1.5), 0).equals(new Cube(new Point(1.5), p2)).should.be.true();
        cube1D.intersectWithBottomBound(new Point(-5), 0).equals(cube1D).should.be.true();
        cube2D.intersectWithBottomBound(new Point(0.34, -140), 0).equals(new Cube(new Point(0.34, -2), p4)).should.be.true();
        cube2D.intersectWithBottomBound(new Point(0, 0.34), 1).equals(new Cube(new Point(-1, 0.34), p4)).should.be.true();
        cube3D.intersectWithBottomBound(new Point(-500, -0.134, 500), 1).equals(new Cube(new Point(-1, -0.134, -3), p6)).should.be.true();
      });
    });
  });

  describe('equals()', () => {
    describe('API', () => {
      it('should expect 1 argument', () => {
        cube1D.equals.length.should.eql(1);
      });
    });

    describe('Behaviour', () => {
      it('should return false if the argument is not a cube', () => {
        cube1D.equals().should.be.false();
        cube2D.equals().should.be.false();
      });

      it('should return false if the argument is a cube with different point', () => {
        cube1D.equals(cube2D).should.be.false();
        cube1D.equals(new Cube(Point.random(1), new Point(Number.MAX_SAFE_INTEGER))).should.be.false();
        cube2D.equals(new Cube(Point.random(2), new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))).should.be.false();
      });

      it('should return true if the argument is a cube with the same point', () => {
        cube1D.equals(cube1D).should.be.true();
        cube1D.equals(new Cube(cube1D.bottom, cube1D.top)).should.be.true();
        cube3D.equals(new Cube(cube3D.bottom, cube3D.top)).should.be.true();
        let [bottom, top] = [Point.random(3), new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)];
        let c1 = new Cube(bottom, top);
        let c2 = new Cube(bottom, top);
        c1.equals(c2).should.be.true();
        [bottom, top] = [new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER), Point.random(2)];
        c1 = new Cube(bottom, top);
        c2 = new Cube(bottom, top);
        c1.equals(c2).should.be.true();
      });
    });
  });

  describe('containsPoint()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        cube1D.containsPoint.length.should.eql(1);
      });

      it('should throw if the argument is not a valid cube', () => {
        expect(() => cube1D.containsPoint(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', 1, 1));
        expect(() => cube1D.containsPoint(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', false, 1));
        expect(() => cube2D.containsPoint('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', 's', 2));
        expect(() => cube2D.containsPoint([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', [], 2));
        expect(() => cube3D.containsPoint({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', { '4': 4 }, 3));
      });

      it('should throw if the cubes doesn\'t have the same dimensionality', () => {
        expect(() => cube1D.containsPoint(p6)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', p6, 1));
        expect(() => cube3D.containsPoint(p1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', p1, 3));
        expect(() => cube2D.containsPoint(p5)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('containsPoint', p5, 2));
      });
    });

    describe('Behaviour', () => {
      let cubeA;
      let p1 = new Point(0, 0, 0);
      let p2 = new Point(-2, 0, 0);
      let p3 = new Point(-1, 0, 0);
      let p4 = new Point(0, 1, 0.5);

      before(() => {
        cubeA = new Cube(new Point(-1, -1, -5), new Point(2, 3, 0.32));
      });

      it('should return true for points contained in the cube', () => {
        cubeA.containsPoint(p1).should.be.true();
      });

      it('should return true if the argument is on the border', () => {
        cubeA.containsPoint(p3).should.be.true();
      });

      it('should return false if the point lies outside the cube', () => {
        cubeA.containsPoint(p2).should.be.false();
        cubeA.containsPoint(p4).should.be.false();
      });
    });
  });

  describe('contains()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        cube1D.contains.length.should.eql(1);
      });

      it('should throw if the argument is not a valid cube', () => {
        expect(() => cube1D.contains(1)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', 1, 1));
        expect(() => cube1D.contains(false)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', false, 1));
        expect(() => cube2D.contains('s')).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', 's', 2));
        expect(() => cube2D.contains([])).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', [], 2));
        expect(() => cube3D.contains({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', { '4': 4 }, 3));
      });

      it('should throw if the cubes doesn\'t have the same dimensionality', () => {
        expect(() => cube1D.contains(cube2D)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', cube2D, 1));
        expect(() => cube3D.contains(cube1D)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', cube1D, 3));
        expect(() => cube2D.contains(cube3D)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('contains', cube3D, 2));
      });

    });

    describe('Behaviour', () => {
      let cubeA;
      let cubeB;
      let cubeC;
      let cubeD;

      before(() => {
        cubeA = new Cube(new Point(-1, -1), new Point(2, 3));
        cubeB = new Cube(new Point(-0.5, 0.5), new Point(1, 2));
        cubeC = new Cube(new Point(-0.5, 0.5), new Point(2, 3));
        cubeD = new Cube(new Point(-1, -1.1), new Point(1, 1.9));
      });

      it('should return true for identical cubes', () => {
        cube1D.contains(cube1D).should.be.true();
        cube2D.contains(cube2D).should.be.true();
        cube3D.contains(cube3D).should.be.true();
        cubeA.contains(cubeA).should.be.true();
      });

      it('should return true for cubes totally contained in the current one', () => {
        cubeA.contains(cubeB).should.be.true();
        cubeA.contains(cubeC).should.be.true();
        cubeC.contains(cubeB).should.be.true();
      });

      it('should return false if the argument isn\'t entirely contained', () => {
        cubeB.contains(cubeA).should.be.false();
        cubeB.contains(cubeC).should.be.false();
        cubeC.contains(cubeA).should.be.false();
        cubeA.contains(cubeD).should.be.false();
        cubeD.contains(cubeA).should.be.false();
      });
    });
  });

  describe('intersects()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        cube1D.intersects.length.should.eql(1);
      });

      it('should throw if the argument is not a valid cube', () => {
        expect(() => cube1D.intersects(1)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', 1, 1));
        expect(() => cube1D.intersects(false)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', false, 1));
        expect(() => cube2D.intersects('s')).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', 's', 2));
        expect(() => cube2D.intersects([])).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', [], 2));
        expect(() => cube3D.intersects({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', { '4': 4 }, 3));
      });

      it('should throw if the cubes doesn\'t have the same dimensionality', () => {
        expect(() => cube1D.intersects(cube2D)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', cube2D, 1));
        expect(() => cube3D.intersects(cube1D)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', cube1D, 3));
        expect(() => cube2D.intersects(cube3D)).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('intersects', cube3D, 2));
      });
    });

    describe('Behaviour', () => {
      let cubeA;
      let cubeB;
      let cubeC;
      let cubeD;
      let cubeE;
      let cubeF;
      let cubeG;
      let cubeH;
      let cubeI;
      let cube3DA;
      let cube3DB;
      let cube3DC;
      let cube3DD;

      before(() => {
        cubeA = new Cube(new Point(-1, -1), new Point(2, 3));
        cubeB = new Cube(new Point(-0.5, 0.5), new Point(1, 2));
        cubeC = new Cube(new Point(-0.5, 0.5), new Point(2, 3));
        cubeD = new Cube(new Point(-1, -1.1), new Point(1, 1.9));
        cubeE = new Cube(new Point(-10, -11), new Point(-1, -1.1));
        cubeF = new Cube(new Point(-10, -11), new Point(-2, -1.1));
        cubeG = new Cube(new Point(2, 2), new Point(6, 6));
        cubeH = new Cube(new Point(3, 1), new Point(5, 7));
        cubeI = new Cube(new Point(3, 7), new Point(5, 9));
        cube3DA = Cube.R(3).intersectWithBottomBound(new Point(-1.4915232463016403, 0, 0), 0);
        cube3DB = new Cube(new Point(-5, 1, -0.3), new Point(50, 60, 30));
        cube3DC = new Cube(new Point(-5, -5, -5), new Point(5, 5, 5));
        cube3DD = new Cube(new Point(-3, -3, -7), new Point(3, 3, 7));
      });

      it('should return true for identical cubes', () => {
        cube1D.intersects(cube1D).should.be.true();
        cube2D.intersects(cube2D).should.be.true();
        cube3D.intersects(cube3D).should.be.true();
        cubeA.intersects(cubeA).should.be.true();
      });

      it('should return true for cubes totally contained in the current one', () => {
        cubeA.intersects(cubeB).should.be.true();
        cubeA.intersects(cubeC).should.be.true();
        cubeC.intersects(cubeB).should.be.true();
      });

      it('should return true if the argument is partially contained', () => {
        cubeB.intersects(cubeA).should.be.true();
        cubeB.intersects(cubeC).should.be.true();
        cubeC.intersects(cubeA).should.be.true();
        cubeA.intersects(cubeD).should.be.true();
        cubeD.intersects(cubeA).should.be.true();
      });

      it('should return true if none is contained in the other one, but they share some points', () => {
        cube3DA.intersects(cube3DB).should.be.true();
        cube3DB.intersects(cube3DA).should.be.true();
      });

      it('should return true if the cubes doesn\'t contains each other\'s vertices, but they share some points', () => {
        cubeH.intersects(cubeG).should.be.true();
        cubeG.intersects(cubeH).should.be.true();
        cube3DC.intersects(cube3DD).should.be.true();
        cube3DD.intersects(cube3DC).should.be.true();
      });

      it('should return true if just the borders touch', () => {
        cubeD.intersects(cubeE).should.be.true();
        cubeE.intersects(cubeD).should.be.true();
      });

      it('should return false if there is no intersection', () => {
        cubeG.intersects(cubeI).should.be.false();
        cubeD.intersects(cubeF).should.be.false();
      });

      it('should be symmetric', () => {
        cubeA.intersects(cubeB).should.equal(cubeB.intersects(cubeA));
        cubeA.intersects(cubeC).should.equal(cubeC.intersects(cubeA));
        cubeA.intersects(cubeD).should.equal(cubeD.intersects(cubeA));
        cubeD.intersects(cubeE).should.equal(cubeE.intersects(cubeD));
        cubeD.intersects(cubeF).should.equal(cubeF.intersects(cubeD));
        cubeG.intersects(cubeH).should.equal(cubeH.intersects(cubeG));
        cubeG.intersects(cubeI).should.equal(cubeI.intersects(cubeG));
      });
    });
  });

  describe('toString()', () => {
    describe('API', () => {
      it('should expect no arguments', () => {
        cube1D.toString.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      it('should return the string representation of a cube', () => {
        new Cube(new Point(1), new Point(2)).toString().should.equal('[(1) -> (2)]');
        new Cube(new Point(-1, -3.14), new Point(1, 22)).toString().should.equal('[(-1,-3.14) -> (1,22)]');
      });
    });
  });
});