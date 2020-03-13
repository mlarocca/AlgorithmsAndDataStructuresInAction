import KdTree from '../../src/kd_tree/kd_tree.js';
import Point from '../../src/geometric/point.js';
import Point2D from '../../src/geometric/2d_point.js';
import Cube from '../../src/geometric/cube.js';
import { isUndefined } from '../../src/common/basic.js';
import { ERROR_MSG_INVALID_DIMENSION_INDEX, ERROR_MSG_INVALID_DISTANCE, ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';
import { range } from '../../src/common/numbers.js';
import { expectSetEquality, testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_PARAM_INVALID_POINT = (fname, val, dimension, pname = 'point') => `Illegal argument for ${fname}: ${pname} = ${val} must be of class Point${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;
const ERROR_MSG_PARAM_INVALID_CUBE = (fname, val, dimension, pname = 'cube') =>
  `Illegal argument for ${fname}: ${pname} = ${val} must be of class Cube${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;

describe('KdTree API', () => {

  it('# should have a constructor method', function () {
    KdTree.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let kdtree = new KdTree([]);

    let methods = ['constructor', 'isEmpty', 'contains', 'add', 'delete', 'findMin', 'findMax', 'nearestNeighbour', 'pointsWithinDistanceFrom', 'pointsInRegion'];
    let attributes = ['size', 'height', 'dimensionality'];
    testAPI(kdtree, attributes, methods);
  });
});

describe('KdTree Creation', () => {
  var kdTree;

  describe('# Parameters', () => {
    it('should expect 0 mandatory parameters', () => {
      KdTree.length.should.eql(0);
    });

    it('should throw if the argument is not a valid point', () => {
      expect(() => new KdTree(1)).to.throw(ERROR_MSG_PARAM_TYPE('KdTree', 'maybePointsArray', 1, 'array'));
      expect(() => new KdTree(false)).to.throw(ERROR_MSG_PARAM_TYPE('KdTree', 'maybePointsArray', false, 'array'));
      expect(() => new KdTree('s')).to.throw(ERROR_MSG_PARAM_TYPE('KdTree', 'maybePointsArray', 's', 'array'));
      expect(() => new KdTree({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('KdTree', 'maybePointsArray', { '4': 4 }, 'array'));
    });

    it('should throw if the array doesn\'t hold only points', () => {
      expect(() => new KdTree([1])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree', 1));
      expect(() => new KdTree([new Point2D(1, 2), 2.1])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree', 2.1));
    });

    it('should accept an array of points', () => {
      expect(() => new KdTree([new Point2D(1, 2)])).not.to.throw();
    });

    it('should have a default for the points array', () => {
      expect(() => new KdTree()).not.to.throw();
    });
  });

  describe('Behaviour', () => {
    it('should add all the points in the list (2D)', () => {
      let points = [new Point2D(1, 2), new Point2D(0, 1), new Point2D(3, 3), new Point2D(1.5, 2), new Point2D(5, -1)];
      let kdTree = new KdTree(points);
      points.every(p => kdTree.contains(p)).should.be.true();
    });

    it('should add all the points in the list (3D)', () => {
      let points = [new Point2D(1, 2, 0), new Point2D(0, 1, -1), new Point2D(3, 3, -2), new Point2D(1.5, 2, -3), new Point2D(5, -1, -4)];
      let kdTree = new KdTree(points);
      points.every(p => kdTree.contains(p)).should.be.true();
    });

  });
});

describe('Attributes', () => {
  let kdTree;

  describe('size', () => {
    beforeEach(function () {
      kdTree = new KdTree();
    });

    it('should be 0 for an empty tree', () => {
      kdTree.size.should.equal(0);
    });

    it('should be incremented on insertion', () => {
      kdTree.size.should.equal(0);
      kdTree.add(new Point2D(1, 2));
      kdTree.size.should.equal(1);
      kdTree.add(new Point(0, 1));
      kdTree.size.should.equal(2);
      kdTree.add(new Point(3, -2));
      kdTree.size.should.equal(3);
      kdTree.add(new Point(1.5, -2));
      kdTree.size.should.equal(4);
    });

    it('should NOT be incremented on update of existing keys', () => {
      kdTree.size.should.equal(0);
      kdTree.add(new Point2D(1, 2));
      kdTree.size.should.equal(1);
      kdTree.add(new Point2D(1, 2));
      kdTree.size.should.equal(1);
    });

    describe('should be decremented on deletion', () => {
      let points;

      beforeEach(() => {
        points = [new Point2D(1, 2), new Point(0, 1), new Point(3, 3), new Point(1.5, 2), new Point(5, -1)];
        kdTree = new KdTree(points);
      });

      it('should update size on singleton tree', () => {
        kdTree = new KdTree([new Point(1, 2, 4)]);
        kdTree.size.should.equal(1);
        kdTree.delete(new Point(1, 2, 4));
        kdTree.size.should.equal(0);
      });

      it('should update size deleting the root of a complex tree', () => {
        kdTree.delete(new Point2D(1.5, 2));
        kdTree.size.should.equal(4);
        kdTree.delete(new Point2D(5, -1));
        kdTree.size.should.equal(3);
      });

      it('should update size deleting an internal node of a complex tree', () => {
        kdTree.delete(new Point2D(3, 3));
        kdTree.size.should.equal(4);
        kdTree.delete(new Point2D(5, -1));
        kdTree.size.should.equal(3);
      });

      it('should update size deleting a leaf node of a complex tree', () => {
        kdTree.delete(new Point(5, -1));
        kdTree.size.should.equal(4);
        kdTree.delete(new Point(0, 1));
        kdTree.size.should.equal(3);
      });

      it('should NOT update size when point to delete is not in the tree', () => {
        kdTree.delete(new Point(-5, -1));
        kdTree.size.should.equal(5);
        kdTree.delete(new Point(12.45, 22));
        kdTree.size.should.equal(5);
      });
    });
  });

  describe('height', () => {
    beforeEach(function () {
      kdTree = new KdTree();
    });

    it('should be 0 for an empty tree', () => {
      kdTree.height.should.equal(0);
    });

    it('should be incremented on insertion', () => {
      kdTree.height.should.equal(0);
      kdTree.add(new Point2D(1, 2));
      kdTree.height.should.equal(1);
      kdTree.add(new Point(0, 1));
      kdTree.height.should.equal(2);
      kdTree.add(new Point(3, -2));
      kdTree.height.should.equal(2);
      kdTree.add(new Point(1.5, -2));
      kdTree.height.should.equal(3);
    });

    it('should NOT be incremented on update of existing keys', () => {
      kdTree.height.should.equal(0);
      kdTree.add(new Point2D(1, 2));
      kdTree.height.should.equal(1);
      kdTree.add(new Point2D(1, 2));
      kdTree.height.should.equal(1);
    });

    describe('should be decremented on deletion', () => {
      let points;

      beforeEach(() => {
        points = [new Point2D(1, 2), new Point(0, 1), new Point(3, 3), new Point(1.5, 2), new Point(5, -1)];
        kdTree = new KdTree(points);
      });

      it('should not change height on singleton tree', () => {
        kdTree = new KdTree([new Point(1, 2, 4)]);
        kdTree.height.should.equal(1);
        kdTree.delete(new Point(1, 2, 4));
        kdTree.height.should.equal(0);
      });

      it('should update height deleting a leaf node of a complex tree', () => {
        kdTree.delete(new Point(5, -1));
        kdTree.height.should.equal(3);
        kdTree.delete(new Point(0, 1));
        kdTree.height.should.equal(2);
      });

      it('should NOT update height when point to delete is not in the tree', () => {
        kdTree.delete(new Point(-5, -1));
        kdTree.height.should.equal(3);
        kdTree.delete(new Point(12.45, 22));
        kdTree.height.should.equal(3);
      });
    });
  });
});

describe('Methods', () => {
  describe('add()', () => {
    describe('API', () => {
      var point2D = new Point2D(1, 2);
      var point3D = new Point(1, 2, 3);
      var point4D = new Point(1, 2, 3, 4);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should expect 1 parameter', () => {
        kdTree.add.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => kdTree.add()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.add', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => kdTree.add(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.add', 1));
        expect(() => kdTree.add(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.add', false));
        expect(() => kdTree.add('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.add', 's'));
        expect(() => kdTree.add({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.add', { '4': 4 }));
      });

      it('should throw if the argument is a valid point with a different dimensionality', () => {
        kdTree.add(point2D);
        expect(() => kdTree.add(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.add', point3D));
        expect(() => kdTree.add(point4D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.add', point4D));
      });

      it('should accept a 2D point', () => {
        expect(() => kdTree.add(point2D)).not.to.throw();
      });

      it('should accept a 3D point', () => {
        expect(() => kdTree.add(point3D)).not.to.throw();
      });

      it('should return a HyperPoint', () => {
        expect(kdTree.add(point4D)).to.be.a('boolean');
      });

    });

    describe('Behaviour', () => {
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should add new points to empty trees', () => {
        let p1 = new Point2D(1, 2);
        let p2 = new Point(-1, 22);
        kdTree.contains(p1).should.be.false();
        kdTree.add(p1).should.be.true();
        kdTree.contains(p1).should.be.true();
        kdTree.contains(p2).should.be.false();
        kdTree.add(p2).should.be.true();
        kdTree.contains(p2).should.be.true();
      });

      it('should add new points to trees populated through the constructor', () => {
        let points = range(0, 10).map(_ => Point2D.random());
        let p1 = new Point2D(1, 2);
        let p2 = new Point(-1, 22);
        kdTree = new KdTree(points);

        kdTree.contains(p1).should.be.false();
        kdTree.add(p1).should.be.true();
        kdTree.contains(p1).should.be.true();
        kdTree.contains(p2).should.be.false();
        kdTree.add(p2).should.be.true();
        kdTree.contains(p2).should.be.true();
      });

      it('should correctly add points in trees with higher dimensionality', () => {
        let p1 = new Point(1, 2, 3);
        let p2 = new Point(-1, 22, -8);
        kdTree = new KdTree([p1]);
        kdTree.contains(p1).should.be.true();
        kdTree.add(p1).should.be.false();
        kdTree.contains(p2).should.be.false();
        kdTree.add(p2).should.be.true();
        kdTree.contains(p2).should.be.true();
      });

    });
  });

  describe('delete()', () => {
    describe('API', () => {
      var point2D = new Point2D(1, 2);
      var point3D = new Point(1, 2, 4);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should expect 1 parameter', () => {
        kdTree.delete.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => kdTree.delete()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.delete', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => kdTree.delete(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.delete', 1));
        expect(() => kdTree.delete(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.delete', false));
        expect(() => kdTree.delete('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.delete', 's'));
        expect(() => kdTree.delete({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.delete', { '4': 4 }));
      });

      it('should throw if the argument is a valid point with a different dimensionality', () => {
        kdTree.add(point2D);

        expect(() => kdTree.delete(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.delete', point3D));

        kdTree = new KdTree([point3D]);
        expect(() => kdTree.delete(point2D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.delete', point2D));
      });

      it('should accept a 2D point', () => {
        expect(() => kdTree.delete(point2D)).not.to.throw();
      });

      it('should accept a 3D point', () => {
        expect(() => kdTree.delete(point3D)).not.to.throw();
      });

      it('should return a boolean', () => {
        expect(kdTree.delete(point2D)).to.be.a('boolean');
      });

    });

    describe('Behaviour', () => {
      var p;
      var points;
      var kdTree;

      beforeEach(() => {
        p = new Point2D(1, 2);
        kdTree = new KdTree();
        points = range(0, 10).map(_ => Point2D.random());
      });

      it('should return false if the point is not in the three', () => {
        kdTree.delete(p).should.be.false();
        kdTree.add(p);
        kdTree.delete(Point2D.random()).should.be.false();

        kdTree = new KdTree(points);
        kdTree.delete(p).should.be.false();
      });

      it('should return true if the point is in the three, and delete it', () => {
        kdTree.add(p);
        kdTree.delete(p).should.be.true();
        kdTree.contains(p).should.be.false();

        kdTree = new KdTree(points);
        let p1 = points.splice(0, 1)[0];

        kdTree.delete(p1).should.be.true();
        kdTree.contains(p1).should.be.false();
        points.every(p => kdTree.contains(p)).should.be.true();
      });

    });
  });

  describe('contains()', () => {
    describe('API', () => {
      var point2D = new Point2D(1, 2);
      var point3D = new Point(1, 2, 3);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should expect 1 argument', () => {
        kdTree.contains.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => kdTree.contains()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.contains', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => kdTree.contains(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.contains', 1));
        expect(() => kdTree.contains(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.contains', false));
        expect(() => kdTree.contains('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.contains', 's'));
        expect(() => kdTree.contains({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.contains', { '4': 4 }));
      });

      it('should throw if the argument is a valid point with a different dimensionality', () => {
        kdTree.add(point2D);

        expect(() => kdTree.contains(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.contains', point3D));

        kdTree = new KdTree([point3D]);
        expect(() => kdTree.contains(point2D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.contains', point2D));
      });

      it('should accept a 2D point', () => {
        expect(() => kdTree.contains(point2D)).not.to.throw();
      });

      it('should accept a 3D point', () => {
        expect(() => kdTree.contains(point3D)).not.to.throw();
      });

      it('should return a boolean', () => {
        expect(kdTree.contains(point2D)).to.be.a('boolean');
      });

    });

    describe('Behaviour', () => {
      var kdTree;
      var p1;
      var p2;
      var p3;
      var p4;

      beforeEach(() => {
        kdTree = new KdTree();
        p1 = new Point2D(1, 2);
        p2 = new Point2D(-1, 22);
        p3 = new Point(0, 1, 0, 2);
        p4 = new Point(1, 1, 2, 3);
      });

      it('should return false for points not in the tree (2D)', () => {
        kdTree.contains(p1).should.be.false();
        kdTree.contains(p2).should.be.false();
        kdTree = new KdTree([p1]);
        kdTree.contains(p2).should.be.false();
      });

      it('should return false for points not in the tree (4D)', () => {
        kdTree.contains(p3).should.be.false();
        kdTree.contains(p4).should.be.false();
        kdTree = new KdTree([p3]);
        kdTree.contains(p4).should.be.false();
      });

      it('should find keys added through .add() (2D)', () => {
        kdTree.add(p1);
        kdTree.contains(p1).should.be.true();
        kdTree.add(p2);
        kdTree.contains(p2).should.be.true();
      });

      it('should find keys added through .add() (4D)', () => {
        kdTree.add(p3);
        kdTree.contains(p3).should.be.true();
        kdTree.add(p4);
        kdTree.contains(p4).should.be.true();
      });

      it('should find keys added through the constructor', () => {
        let points = range(0, 10).map(_ => Point2D.random());
        kdTree = new KdTree(points);

        points.every(p => kdTree.contains(p)).should.be.true();

        points = range(0, 20).map(_ => Point.random(3));
        kdTree = new KdTree(points);

        points.every(p => kdTree.contains(p)).should.be.true();
      });

      it('should return false for deleted keys (2d)', () => {
        kdTree = new KdTree([p1, p2]);
        kdTree.delete(p1);
        kdTree.contains(p1).should.be.false();
        kdTree.contains(p2).should.be.true();
        kdTree.delete(p2);
        kdTree.contains(p2).should.be.false();
      });

      it('should return false for deleted keys (4D)', () => {
        kdTree = new KdTree([p3, p4]);
        kdTree.delete(p3);
        kdTree.contains(p3).should.be.false();
        kdTree.contains(p4).should.be.true();
        kdTree.delete(p4);
        kdTree.contains(p4).should.be.false();
      });

    });
  });

  describe('isEmpty()', () => {
    describe('API', () => {
      var point = new Point2D(1, 2);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should expect no arguments', () => {
        kdTree.isEmpty.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var kdTree;
      var p1;
      var p2;

      beforeEach(() => {
        kdTree = new KdTree();
        p1 = new Point2D(1, 2);
        p2 = new Point2D(-1, 22);
      });

      it('should return true for empty trees', () => {
        kdTree.isEmpty().should.be.true();
      });

      it('should return false for trees initialized with an array of points', () => {
        kdTree = new KdTree([p1]);
        kdTree.isEmpty().should.be.false();
      });

      it('should return false after adding point', () => {
        kdTree.isEmpty().should.be.true();
        kdTree.add(p1);
        kdTree.isEmpty().should.be.false();
        kdTree.add(p2);
        kdTree.isEmpty().should.be.false();
      });

      it('should return true if all elements are deleted', () => {
        kdTree.isEmpty().should.be.true();
        kdTree.add(p1);
        kdTree.isEmpty().should.be.false();
        kdTree.delete(p1);
        kdTree.isEmpty().should.be.true();

        let points = range(0, 10).map(_ => Point2D.random());
        kdTree = new KdTree(points);
        kdTree.isEmpty().should.be.false();

        points.forEach(p => kdTree.delete(p).should.be.true());
        kdTree.isEmpty().should.be.true();
      });
    });
  });

  describe('findMin()', () => {
    describe('API', () => {
      var point = new Point2D(1, 2);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree([point]);
      });

      it('should expect 1 mandatory argument', () => {
        kdTree.findMin.length.should.eql(1);
      });

      it('should throw if the argument is not a valid integer', () => {
        expect(() => kdTree.findMin(1.2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', 1.2, 2));
        expect(() => kdTree.findMin(false)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', false, 2));
        expect(() => kdTree.findMin('s')).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', 's', 2));
        expect(() => kdTree.findMin({ '4': 4 })).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', { '4': 4 }, 2));
      });

      it('should throw if the argument is an integer but negative or greather than K - 1', () => {
        expect(() => kdTree.findMin(-1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', -1, 2));
        expect(() => kdTree.findMin(2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', 2, 2));
        kdTree = new KdTree();
        kdTree.add(new Point(1, 2, 3, 4));
        expect(() => kdTree.findMin(-1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', -1, 4));
        expect(() => kdTree.findMin(5)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', 5, 4));
      });

      it('should accept either 0 or 1 for a 2d Tree', () => {
        expect(() => kdTree.findMin(0)).not.to.throw();
        expect(() => kdTree.findMin(1)).not.to.throw();
      });

      it('should accept up to K-1 for KdTree', () => {
        kdTree = new KdTree();
        kdTree.add(new Point(1, 2, 3, 4));
        expect(() => kdTree.findMin(0)).not.to.throw();
        expect(() => kdTree.findMin(1)).not.to.throw();
        expect(() => kdTree.findMin(2)).not.to.throw();
        expect(() => kdTree.findMin(3)).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var kdTree;
      var p1;
      var p2;
      var points;

      beforeEach(() => {
        kdTree = new KdTree();
        p1 = new Point2D(1, 2);
        p2 = new Point2D(-1, 22);
      });

      it('should return undefined for empty trees', () => {
        kdTree.isEmpty().should.be.true();
        expect(kdTree.findMin(0)).to.be.eql(undefined);
        expect(kdTree.findMin(1)).to.be.eql(undefined);
      });

      it('should return the root when a single pooint is in the tree', () => {
        kdTree = new KdTree([p1]);
        kdTree.findMin(0).equals(p1).should.be.true();
        kdTree.findMin(1).equals(p1).should.be.true();
      });

      it('should return the min node in larger trees (2D)', () => {

        kdTree = new KdTree([p1, p2]);
        kdTree.findMin(0).should.be.eql(p2);

        points = range(0, 10).map(_ => Point2D.random());
        kdTree = new KdTree(points);
        let min = points.reduce((memo, p) => p.x < memo.x ? p : memo);

        kdTree.findMin(0).equals(min).should.be.true();
      });

      it('should return the min node in larger trees (4D)', () => {
        points = range(0, 20).map(_ => Point.random(4));
        kdTree = new KdTree(points);

        let min = points.reduce((memo, p) => p.coordinate(0) < memo.coordinate(0) ? p : memo);
        kdTree.findMin(0).equals(min).should.be.true();
      });

      it('should search according to the correct dimensionality (2D)', () => {
        kdTree = new KdTree([p1, p2]);
        kdTree.findMin(0).equals(p2).should.be.true();
        kdTree.findMin(1).equals(p1).should.be.true();

        points = range(0, 200).map(_ => Point2D.random());
        kdTree = new KdTree(points);
        kdTree.findMin(0).equals(points.reduce((memo, p) => p.x < memo.x ? p : memo)).should.be.true();
        kdTree.findMin(1).equals(points.reduce((memo, p) => p.y < memo.y ? p : memo)).should.be.true();

        kdTree.findMin(0).equals(points.reduce((memo, p) => p.y < memo.y ? p : memo)).should.be.false();
        kdTree.findMin(1).equals(points.reduce((memo, p) => p.x < memo.x ? p : memo)).should.be.false();
      });

      it('should search according to the correct dimensionality (3+D)', () => {
        let pA = new Point(-1, 2, 3);
        let pB = new Point(1, -2, 3);
        let pC = new Point(1, 2, -3);

        kdTree = new KdTree([pA, pB, pC]);
        kdTree.findMin(0).equals(pA).should.be.true();
        kdTree.findMin(1).equals(pB).should.be.true();
        kdTree.findMin(2).equals(pC).should.be.true();

        points = range(0, 200).map(_ => Point.random(4));
        kdTree = new KdTree(points);
        [0, 1, 2].forEach(dim => {
          let min = points.reduce((memo, p) => p.coordinate(dim) < memo.coordinate(dim) ? p : memo);
          kdTree.findMin(dim).equals(min).should.be.true();
          kdTree.findMin((dim + 1) % kdTree.dimensionality).equals(min).should.be.false();
        });
      });
    });
  });

  describe('findMax()', () => {
    describe('API', () => {
      var point = new Point(1, 2, 3);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree([point]);
      });

      it('should expect 1 mandatory argument', () => {
        kdTree.findMax.length.should.eql(1);
      });

      it('should throw if the argument is not a valid integer', () => {
        expect(() => kdTree.findMax(1.2)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', 1.2, 3));
        expect(() => kdTree.findMax(false)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', false, 3));
        expect(() => kdTree.findMax('s')).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', 's', 3));
        expect(() => kdTree.findMax({ '4': 4 })).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', { '4': 4 }, 3));
      });

      it('should throw if the argument is an integer but negative or greather than K - 1', () => {
        expect(() => kdTree.findMax(-1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', -1, 3));
        expect(() => kdTree.findMax(3)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', 3, 3));
        kdTree = new KdTree();
        kdTree.add(new Point(1, 2, 3, 4));
        expect(() => kdTree.findMax(-1)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', -1, 4));
        expect(() => kdTree.findMax(5)).to.throw(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', 5, 4));
      });

      it('should accept either 0 or 1 for a 2d Tree', () => {
        expect(() => kdTree.findMax(0)).not.to.throw();
        expect(() => kdTree.findMax(1)).not.to.throw();
      });

      it('should accept up to K-1 for KdTree', () => {
        kdTree = new KdTree();
        kdTree.add(new Point(1, 2, 3, 4));
        expect(() => kdTree.findMax(0)).not.to.throw();
        expect(() => kdTree.findMax(1)).not.to.throw();
        expect(() => kdTree.findMax(2)).not.to.throw();
        expect(() => kdTree.findMax(3)).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var kdTree;
      var p1;
      var p2;
      var points;

      beforeEach(() => {
        kdTree = new KdTree();
        p1 = new Point2D(1, 2);
        p2 = new Point2D(-1, 22);
      });

      it('should return undefined for empty trees', () => {
        kdTree.isEmpty().should.be.true();
        expect(kdTree.findMax(0)).to.be.eql(undefined);
        expect(kdTree.findMax(1)).to.be.eql(undefined);
      });

      it('should return the root when a single pooint is in the tree', () => {
        kdTree = new KdTree([p1]);
        kdTree.findMax(0).equals(p1).should.be.true();
        kdTree.findMax(1).equals(p1).should.be.true();
      });

      it('should return the min node in larger trees (2D)', () => {

        kdTree = new KdTree([p1, p2]);
        kdTree.findMax(0).should.be.eql(p2);

        points = range(0, 10).map(_ => Point2D.random());
        kdTree = new KdTree(points);
        let max = points.reduce((memo, p) => p.x > memo.x ? p : memo);

        kdTree.findMax(0).equals(max).should.be.true();
      });

      it('should return the min node in larger trees (4D)', () => {
        points = range(0, 20).map(_ => Point.random(4));
        kdTree = new KdTree(points);

        let max = points.reduce((memo, p) => p.coordinate(0) > memo.coordinate(0) ? p : memo);
        kdTree.findMax(0).equals(max).should.be.true();
      });

      it('should search according to the correct dimensionality (2D)', () => {
        kdTree = new KdTree([p1, p2]);
        kdTree.findMax(0).equals(p1).should.be.true();
        kdTree.findMax(1).equals(p2).should.be.true();

        points = range(0, 200).map(_ => Point2D.random());
        kdTree = new KdTree(points);
        kdTree.findMax(0).equals(points.reduce((memo, p) => p.x > memo.x ? p : memo)).should.be.true();
        kdTree.findMax(1).equals(points.reduce((memo, p) => p.y > memo.y ? p : memo)).should.be.true();

        kdTree.findMax(0).equals(points.reduce((memo, p) => p.y > memo.y ? p : memo)).should.be.false();
        kdTree.findMax(1).equals(points.reduce((memo, p) => p.x > memo.x ? p : memo)).should.be.false();
      });

      it('should search according to the correct dimensionality (3+D)', () => {
        let pA = new Point(1, -2, -3);
        let pB = new Point(-1, 2, -3);
        let pC = new Point(-1, -2, 3);

        kdTree = new KdTree([pA, pB, pC]);

        kdTree.findMax(0).equals(pA).should.be.true();
        kdTree.findMax(1).equals(pB).should.be.true();

        kdTree.findMax(2).equals(pC).should.be.true();

        points = range(0, 200).map(_ => Point.random(4));
        kdTree = new KdTree(points);
        [0, 1, 2].forEach(dim => {
          let min = points.reduce((memo, p) => p.coordinate(dim) > memo.coordinate(dim) ? p : memo);
          kdTree.findMax(dim).equals(min).should.be.true();
          kdTree.findMax((dim + 1) % kdTree.dimensionality).equals(min).should.be.false();
        });
      });
    });
  });

  describe('nearestNeighbour()', () => {
    describe('API', () => {
      var point2D = new Point2D(1, 2);
      var point3D = new Point(1, 2, 3);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should expect 1 argument', () => {
        kdTree.nearestNeighbour.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => kdTree.nearestNeighbour()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.nearestNeighbour', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => kdTree.nearestNeighbour(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.nearestNeighbour', 1));
        expect(() => kdTree.nearestNeighbour(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.nearestNeighbour', false));
        expect(() => kdTree.nearestNeighbour('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.nearestNeighbour', 's'));
        expect(() => kdTree.nearestNeighbour({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.nearestNeighbour', { '4': 4 }));
      });

      it('should throw if the argument is not a point with a different dimensionality', () => {
        kdTree = new KdTree([point2D]);

        expect(() => kdTree.nearestNeighbour(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.nearestNeighbour', point3D));
      });

      it('should accept a 2D point', () => {
        expect(() => kdTree.nearestNeighbour(point2D)).not.to.throw();
      });

      it('should accept a 3D point', () => {
        expect(() => kdTree.nearestNeighbour(point2D)).not.to.throw();
      });

      it('should return a Point', () => {
        kdTree = new KdTree([point2D]);
        expect(kdTree.nearestNeighbour(point2D)).to.be.an.instanceof(Point);
      });

    });

    describe('Behaviour', () => {
      var point = new Point2D(1, 2);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should return undefined for an empty tree', () => {
        expect(kdTree.nearestNeighbour(point)).to.equal(undefined);
      });

      it('should return the only point for a singleton tree', () => {
        kdTree.add(point);
        kdTree.nearestNeighbour(point).should.be.eql(point);

        let p = new Point(101, 200);
        kdTree = new KdTree([p]);
        kdTree.nearestNeighbour(point).should.be.eql(p);
      });

      it('should return the closest point (2D)', () => {
        let points = [new Point2D(1, 2), new Point(0, 1), new Point(3, 3), new Point(1.5, 2), new Point(5, -1)];
        let [p1, p2, p3, p4, p5] = points;

        kdTree = new KdTree(points);
        points.forEach(p => {
          kdTree.nearestNeighbour(p).should.be.eql(p);
        });
        kdTree.nearestNeighbour(new Point(1.1, 1.9)).equals(p1).should.be.true();
        kdTree.nearestNeighbour(new Point(-5, -5)).equals(p2).should.be.true();
        kdTree.nearestNeighbour(new Point(3.01, 2.9999)).equals(p3).should.be.true();
        kdTree.nearestNeighbour(new Point(1.6, 2)).equals(p4).should.be.true();
        kdTree.nearestNeighbour(new Point(160, 2)).equals(p5).should.be.true();
      });

      it('should return the closest point (3D)', () => {
        let points = [new Point(1, 2, 55), new Point(0, 1, 0.1), new Point(3, 3, 0.01), new Point(1.5, 2, -0.03), new Point(5, -1, 44)];
        let [p1, p2, p3, p4, p5] = points;

        kdTree = new KdTree(points);
        points.forEach(p => {
          kdTree.nearestNeighbour(p).should.be.eql(p);
        });
        kdTree.nearestNeighbour(new Point(1.1, 1.9, 49)).equals(p1).should.be.true();
        kdTree.nearestNeighbour(new Point(1.1, 1.9, 44)).equals(p5).should.be.true();
        kdTree.nearestNeighbour(new Point(-5, -5, 1)).equals(p2).should.be.true();
        kdTree.nearestNeighbour(new Point(3.01, 2.9999, -1)).equals(p3).should.be.true();
        kdTree.nearestNeighbour(new Point(1.6, 2, 0)).equals(p4).should.be.true();
        kdTree.nearestNeighbour(new Point(160, 2, 40)).equals(p5).should.be.true();
        kdTree.nearestNeighbour(new Point(160, 2, 0.1)).equals(p3).should.be.true();
      });
    });
  });

  describe('pointsWithinDistanceFrom()', () => {
    describe('API', () => {
      var point = new Point2D(1, 2);
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should expect 2 parameters', () => {
        kdTree.pointsWithinDistanceFrom.length.should.eql(2);
      });

      it('should throw if no argument is passed', () => {
        expect(() => [...kdTree.pointsWithinDistanceFrom()]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.pointsWithinDistanceFrom', undefined));
      });

      it('should throw if the first argument is not a valid point', () => {
        expect(() => [...kdTree.pointsWithinDistanceFrom(1)]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.pointsWithinDistanceFrom', 1));
        expect(() => [...kdTree.pointsWithinDistanceFrom(false)]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.pointsWithinDistanceFrom', false));
        expect(() => [...kdTree.pointsWithinDistanceFrom('s')]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.pointsWithinDistanceFrom', 's'));
        expect(() => [...kdTree.pointsWithinDistanceFrom({ '4': 4 })]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('KdTree.pointsWithinDistanceFrom', { '4': 4 }));
      });

      it('should throw if the second argument is not non-negative number', () => {
        expect(() => [...kdTree.pointsWithinDistanceFrom(point, false)]).to.throw(ERROR_MSG_INVALID_DISTANCE('KdTree.pointsWithinDistanceFrom', false));
        expect(() => [...kdTree.pointsWithinDistanceFrom(point, 's')]).to.throw(ERROR_MSG_INVALID_DISTANCE('KdTree.pointsWithinDistanceFrom', 's'));
        expect(() => [...kdTree.pointsWithinDistanceFrom(point, { '4': 4 })]).to.throw(ERROR_MSG_INVALID_DISTANCE('KdTree.pointsWithinDistanceFrom', { '4': 4 }));
        expect(() => [...kdTree.pointsWithinDistanceFrom(point, -1)]).to.throw(ERROR_MSG_INVALID_DISTANCE('KdTree.pointsWithinDistanceFrom', -1));
      });

      it('should accept a point and a valid distance', () => {
        expect(() => [...kdTree.pointsWithinDistanceFrom(point, 0)]).not.to.throw();
        expect(() => [...kdTree.pointsWithinDistanceFrom(point, 2)]).not.to.throw();
        expect(() => [...kdTree.pointsWithinDistanceFrom(point, 0.00001)]).not.to.throw();
      });

      it('should return an iterator Object', () => {
        expect(kdTree.pointsWithinDistanceFrom(point, 0)).to.be.an.instanceof(Object);
      });

    });

    describe('Behaviour', () => {
      var p1 = new Point2D(1, 2);
      var p2 = new Point2D(2, 1);
      var p3 = new Point2D(200, -100);
      var p4 = new Point2D(150, -50);
      var points3D = [new Point(0, 0, 0), new Point(-1, 2, 3.5), new Point(0.55, 30, -10), new Point(1, 1.2, 1.5), new Point(4.25, 0.37, 0)];

      it('should return an empty set in an empty tree', () => {
        let kdTree = new KdTree();
        let result = [...kdTree.pointsWithinDistanceFrom(p1, 100)];
        result.should.be.instanceOf(Array);
        result.length.should.be.eql(0);
      });

      it('should return an empty Set if all the points are not within distance', () => {
        let kdTree = new KdTree([p1]);
        let result = [...kdTree.pointsWithinDistanceFrom(p3, 100)];
        result.length.should.be.eql(0);

        kdTree = new KdTree([p1, p2]);
        result = [...kdTree.pointsWithinDistanceFrom(p3, 100)];
        result.length.should.be.eql(0);
      });

      it('should return the only point in a singleton tree, if within distance', () => {
        let kdTree = new KdTree([p1]);

        let result = [...kdTree.pointsWithinDistanceFrom(p2, 10)];
        result.length.should.be.eql(1);
        result.should.be.eql([p1]);

        result = [...kdTree.pointsWithinDistanceFrom(p1, 1)];
        result.length.should.be.eql(1);
        result.should.be.eql([p1]);
      });

      it('should include the points itself, if in the tree (2D)', () => {
        let kdTree = new KdTree([p1, p2]);

        let result = new Set(kdTree.pointsWithinDistanceFrom(p2, 1));
        result.has(p2).should.be.true();

        result = new Set(kdTree.pointsWithinDistanceFrom(p2, 0));
        result.has(p2).should.be.true();
      });

      it('should include the points itself, if in the tree (3D)', () => {
        let p = points3D[0];
        let kdTree = new KdTree(points3D);

        let result = new Set(kdTree.pointsWithinDistanceFrom(p, 1));
        result.has(p).should.be.true();

        result = new Set(kdTree.pointsWithinDistanceFrom(p, 0));
        result.has(p).should.be.true();
      });

      it('should return all the points within distance (2D)', () => {
        let points = [new Point2D(1, 2), new Point(0, 1), new Point(3, 3), new Point(1.5, 2), new Point(5, -1)];
        let [p1, p2, p3, p4, p5] = points;
        let result;

        let kdTree = new KdTree(points);

        let p = new Point(1.1, 1.9);
        let closerTo = (target) => (p1, p2) => p1.distanceTo(target) - p2.distanceTo(target);

        result = [...kdTree.pointsWithinDistanceFrom(p, 1)];
        result.sort(closerTo(p)).should.be.eql([p1, p4]);

        result = [...kdTree.pointsWithinDistanceFrom(new Point(1.1, 1.9), 10)];
        expectSetEquality(result, [p1, p2, p3, p4, p5]);

        result = [...kdTree.pointsWithinDistanceFrom(new Point(-5, -5), 1)];
        result.should.be.eql([]);
        result = [...kdTree.pointsWithinDistanceFrom(new Point(-5, -5), 10)];
        expectSetEquality(result, [p1, p2, p4]);
        result = [...kdTree.pointsWithinDistanceFrom(new Point(-5, -5), 10.78)];
        expectSetEquality(result, [p1, p2, p4, p5]);
        result = [...kdTree.pointsWithinDistanceFrom(new Point(3.01, 2.9999), 0.1)];
        expectSetEquality(result, [p3]);
        result = [...kdTree.pointsWithinDistanceFrom(new Point(3.01, 2.9999), 2)];
        expectSetEquality(result, [p3, p4]);
        result = [...kdTree.pointsWithinDistanceFrom(new Point(1.6, 2), 10)];
        expectSetEquality(result, [p1, p2, p3, p4, p5]);
        result = [...kdTree.pointsWithinDistanceFrom(new Point(160, 2), 160)];
        expectSetEquality(result, [p1, p3, p4, p5]);
      });
    });
  });

  describe('pointsInRegion()', () => {
    describe('API', () => {
      var point1;
      var point2;
      var cube;
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
        point1 = new Point(-1, -2);
        point2 = new Point2D(1, 2);
        cube = new Cube(point1, point2);
      });

      it('should expect 1 mandatory argument', () => {
        kdTree.pointsInRegion.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => [...kdTree.pointsInRegion()]).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('KdTree.pointsInRegion', undefined));
      });

      it('should throw if the argument is not a valid cube', () => {
        expect(() => [...kdTree.pointsInRegion(1)]).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('KdTree.pointsInRegion', 1));
        expect(() => [...kdTree.pointsInRegion(false)]).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('KdTree.pointsInRegion', false));
        expect(() => [...kdTree.pointsInRegion('s')]).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('KdTree.pointsInRegion', 's'));
        expect(() => [...kdTree.pointsInRegion({ '4': 4 })]).to.throw(ERROR_MSG_PARAM_INVALID_CUBE('KdTree.pointsInRegion', { '4': 4 }));
      });

      it('should accept a cube', () => {
        expect(() => kdTree.pointsInRegion(cube)).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      var points;
      var cube;
      var kdTree;

      beforeEach(() => {
        kdTree = new KdTree();
      });

      it('should accept R^k and return all the points in a tree', () => {
        points = range(0, 50).map(_ => Point2D.random());
        kdTree = new KdTree(points);
        let result = [...kdTree.pointsInRegion(Cube.R(2))];
        result.length.should.be.eql(points.length);
      });

      it('should only return points in the quadrant selected', () => {
        points = range(0, 50).map(_ => Point2D.random());
        kdTree = new KdTree(points);
        let origin = new Point(0, 0);
        let firstQuadrant = Cube.R(2).intersectWithBottomBound(origin, 0).intersectWithBottomBound(origin, 1);
        let thirdQuadrant = Cube.R(2).intersectWithTopBound(origin, 0).intersectWithTopBound(origin, 1);
        let result = [...kdTree.pointsInRegion(firstQuadrant)];
        result.length.should.be.greaterThan(0);
        result.every(p => p.x >= 0 && p.y >= 0).should.be.true();
        result = [...kdTree.pointsInRegion(thirdQuadrant)];
        result.length.should.be.greaterThan(0);
        result.every(p => p.x <= 0 && p.y <= 0).should.be.true();
      });

      it('should only return points in the cube selected', () => {
        points = range(0, 500).map(_ => new Point((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
        kdTree = new KdTree(points);
        let pointA = new Point(-5, 1, -0.3);
        let pointB = new Point(50, 60, 30);
        let result = [...kdTree.pointsInRegion(new Cube(pointA, pointB))];

        result.length.should.be.greaterThan(0);

        result.every(p => range(0, p.dimensionality).every(d => {
          return p.coordinate(d) >= pointA.coordinate(d) && p.coordinate(d) <= pointB.coordinate(d);
        })).should.be.true();
      });
    });
  });

  describe('iterator', () => {
    describe('Behaviour', () => {
      var kdTree;
      var points;

      beforeEach(function () {
        points = range(0, 50).map(_ => Point2D.random());
        kdTree = new KdTree(points);
      });

      it('# should return all the points inserted', () => {
        let result = [];
        let size = points.length;
        for (let p of kdTree) {
          result.push(p);
        }
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.every(p => kdTree.contains(p)).should.be.true();
      });
    });

  });
});