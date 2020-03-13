import SsTree from '../../src/ss_tree/ss_tree.js';
import Point from '../../src/geometric/point.js';
import Point2D from '../../src/geometric/2d_point.js';
import { isUndefined } from '../../src/common/basic.js';
import { ERROR_MSG_METHOD_UNIMPLEMENTED, ERROR_MSG_INVALID_DISTANCE, ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';
import { range, randomInt } from '../../src/common/numbers.js';
import { testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_PARAM_INVALID_POINT = (fname, val, dimension, pname = 'point') => `Illegal argument for ${fname}: ${pname} = ${val} must be of class Point${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;

describe('SsTree API', () => {

  it('# should have a constructor method', function () {
    SsTree.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let kdtree = new SsTree([]);

    let methods = ['constructor', 'isEmpty', 'contains', 'add', 'delete', 'nearestNeighbour', 'pointsWithinDistanceFrom'];
    let attributes = ['size', 'height', 'dimensionality'];
    testAPI(kdtree, attributes, methods);
  });
});

describe('SsTree Creation', () => {
  var ssTree;

  describe('# Parameters', () => {
    it('should expect 0 mandatory parameters', () => {
      SsTree.length.should.eql(0);
    });

    it('should throw if the argument is not a valid point', () => {
      expect(() => new SsTree(1)).to.throw(ERROR_MSG_PARAM_TYPE('SsTree', 'maybePointsArray', 1, 'array'));
      expect(() => new SsTree(false)).to.throw(ERROR_MSG_PARAM_TYPE('SsTree', 'maybePointsArray', false, 'array'));
      expect(() => new SsTree('s')).to.throw(ERROR_MSG_PARAM_TYPE('SsTree', 'maybePointsArray', 's', 'array'));
      expect(() => new SsTree({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('SsTree', 'maybePointsArray', { '4': 4 }, 'array'));
    });

    it('should throw if the array doesn\'t hold only points', () => {
      expect(() => new SsTree([1])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree', 1));
      expect(() => new SsTree([new Point2D(1, 2), 2.1])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree', 2.1));
    });

    it('should accept an array of points', () => {
      expect(() => new SsTree([new Point2D(1, 2)])).not.to.throw();
    });

    it('should have a default for the points array', () => {
      expect(() => new SsTree()).not.to.throw();
    });
  });

  describe('Behaviour', () => {
    it('should add all the points in the list (2D)', () => {
      let points = [new Point2D(1, 2), new Point2D(0, 1), new Point2D(3, 3), new Point2D(1.5, 2), new Point2D(5, -1)];
      let ssTree = new SsTree(points);
      ssTree.size.should.be.eql(points.length);
      points.every(p => ssTree.contains(p)).should.be.true();
    });

    it('should add all the points in the list (2D), even with higher max number of elements per cluster', () => {
      let points = range(0, 100).map(_ => Point2D.random());
      let ssTree = new SsTree(points, 7);
      ssTree.size.should.be.eql(points.length);
      points.every(p => ssTree.contains(p)).should.be.true();
    });

    it('should add all the points in the list (3D)', () => {
      let points = [new Point2D(1, 2, 0), new Point2D(0, 1, -1), new Point2D(3, 3, -2), new Point2D(1.5, 2, -3), new Point2D(5, -1, -4)];
      let ssTree = new SsTree(points);
      points.every(p => ssTree.contains(p)).should.be.true();
    });

  });
});

describe('Attributes', () => {
  let ssTree;

  describe('height', () => {

    beforeEach(function () {
      ssTree = new SsTree([], 2);
    });

    it('should be 0 for an empty tree', () => {
      ssTree.height.should.equal(0);
    });

    it('should be 1 for a leaf', () => {
      ssTree = new SsTree([new Point(1)], 2);
      ssTree.height.should.equal(1);

      ssTree = new SsTree([new Point(1), new Point(2)], 2);
      ssTree.height.should.equal(1);

      ssTree = new SsTree([new Point(1), new Point(2), new Point(3)], 3);
      ssTree.height.should.equal(1);
    });

    it('should be incremented on insertion only when more than maxPointsPerNode are added', () => {
      ssTree.height.should.equal(0);
      ssTree.add(new Point2D(1, 2));
      ssTree.height.should.equal(1);
      ssTree.add(new Point(0, 1));
      ssTree.height.should.equal(1);
      ssTree.add(new Point(3, -2));
      ssTree.height.should.equal(2);
    });

    it('should be proportional to log_T(n) on construction', () => {
      let n = 100 + randomInt(0, 100);
      range(2, 10).forEach(T => {
        ssTree = new SsTree(range(0, n).map(_ => Point.random(T)), T);
        ssTree.height.should.be.eql(Math.ceil(Math.log2(n) / Math.log2(T)));
      });
    });
  });

  describe('size', () => {
    beforeEach(function () {
      ssTree = new SsTree([], 2);
    });

    it('should be 0 for an empty tree', () => {
      ssTree.size.should.equal(0);
    });

    it('should be incremented on insertion', () => {
      ssTree.size.should.equal(0);
      ssTree.add(new Point2D(1, 2));
      ssTree.size.should.equal(1);
      ssTree.add(new Point(0, 1));
      ssTree.size.should.equal(2);
      ssTree.add(new Point(3, -2));
      ssTree.size.should.equal(3);
      ssTree.add(new Point(1.5, -2));
      ssTree.size.should.equal(4);
    });

    it('should NOT be incremented on update of existing keys', () => {
      ssTree.size.should.equal(0);
      ssTree.add(new Point2D(1, 2));
      ssTree.size.should.equal(1);
      ssTree.add(new Point2D(1, 2));
      ssTree.size.should.equal(1);
    });

    describe('should be decremented on deletion', () => {
      let points;

      beforeEach(() => {
        points = [new Point2D(1, 2), new Point(0, 1), new Point(3, 3), new Point(1.5, 2), new Point(5, -1)];
        ssTree = new SsTree(points);
      });

      it('should update size on singleton tree', () => {
        expect(() => {
          ssTree = new SsTree([new Point(1, 2, 4)]);
          ssTree.size.should.equal(1);
          ssTree.delete(new Point(1, 2, 4));
          ssTree.size.should.equal(0);
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

      it('should update size deleting the root of a complex tree', () => {
        expect(() => {
          ssTree.delete(new Point2D(1.5, 2));
          ssTree.size.should.equal(4);
          ssTree.delete(new Point2D(5, -1));
          ssTree.size.should.equal(3);
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));

      });

      it('should update size deleting an internal node of a complex tree', () => {
        expect(() => {
          ssTree.delete(new Point2D(3, 3));
          ssTree.size.should.equal(4);
          ssTree.delete(new Point2D(5, -1));
          ssTree.size.should.equal(3);
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

      it('should update size deleting a leaf node of a complex tree', () => {
        expect(() => {
          ssTree.delete(new Point(5, -1));
          ssTree.size.should.equal(4);
          ssTree.delete(new Point(0, 1));
          ssTree.size.should.equal(3);
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

      it('should NOT update size when point to delete is not in the tree', () => {
        expect(() => {
          ssTree.delete(new Point(-5, -1));
          ssTree.size.should.equal(5);
          ssTree.delete(new Point(12.45, 22));
          ssTree.size.should.equal(5);
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
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
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should expect 1 parameter', () => {
        ssTree.add.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => ssTree.add()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.add', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => ssTree.add(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.add', 1));
        expect(() => ssTree.add(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.add', false));
        expect(() => ssTree.add('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.add', 's'));
        expect(() => ssTree.add({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.add', { '4': 4 }));
      });

      it('should throw if the argument is a valid point with a different dimensionality', () => {
        ssTree.add(point2D);
        expect(() => ssTree.add(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.add', point3D));
        expect(() => ssTree.add(point4D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.add', point4D));
      });

      it('should accept a 2D point', () => {
        expect(() => ssTree.add(point2D)).not.to.throw();
      });

      it('should accept a 3D point', () => {
        expect(() => ssTree.add(point3D)).not.to.throw();
      });

      it('should return a HyperPoint', () => {
        expect(ssTree.add(point4D)).to.be.a('boolean');
      });

    });

    describe('Behaviour', () => {
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should add new points to empty trees', () => {
        let p1 = new Point2D(1, 2);
        let p2 = new Point(-1, 22);
        ssTree.contains(p1).should.be.false();
        ssTree.add(p1).should.be.true();
        ssTree.contains(p1).should.be.true();
        ssTree.contains(p2).should.be.false();
        ssTree.add(p2).should.be.true();
        ssTree.contains(p2).should.be.true();
      });

      it('should add new points to trees populated through the constructor', () => {
        let points = range(0, 10).map(_ => Point2D.random());
        let p1 = new Point2D(1, 2);
        let p2 = new Point(-1, 22);
        ssTree = new SsTree(points);

        ssTree.contains(p1).should.be.false();
        ssTree.add(p1).should.be.true();
        ssTree.contains(p1).should.be.true();
        ssTree.contains(p2).should.be.false();
        ssTree.add(p2).should.be.true();
        ssTree.contains(p2).should.be.true();
      });

      it('should correctly add points in trees with higher dimensionality', () => {
        let p1 = new Point(1, 2, 3);
        let p2 = new Point(-1, 22, -8);
        ssTree = new SsTree([p1]);
        ssTree.contains(p1).should.be.true();
        ssTree.add(p1).should.be.false();
        ssTree.contains(p2).should.be.false();
        ssTree.add(p2).should.be.true();
        ssTree.contains(p2).should.be.true();
      });

      it('should add all the points in the list (2D)', () => {
        let points = range(0, 100).map(_ => Point2D.random());
        let ssTree = new SsTree([], 4);
        points.forEach(p => ssTree.add(p));
        ssTree.size.should.be.eql(points.length);
        points.every(p => ssTree.contains(p)).should.be.true();
      });
    });
  });

  describe('delete()', () => {
    describe('API', () => {
      var point2D = new Point2D(1, 2);
      var point3D = new Point(1, 2, 4);
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should expect 1 parameter', () => {
        ssTree.delete.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => ssTree.delete()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.delete', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => ssTree.delete(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.delete', 1));
        expect(() => ssTree.delete(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.delete', false));
        expect(() => ssTree.delete('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.delete', 's'));
        expect(() => ssTree.delete({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.delete', { '4': 4 }));
      });

      it('should throw if the argument is a valid point with a different dimensionality', () => {
        ssTree.add(point2D);
        expect(() => ssTree.delete(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.delete', point3D));

        ssTree = new SsTree([point3D]);
        expect(() => ssTree.delete(point2D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.delete', point2D));
      });

      it('should accept a 2D point', () => {
        expect(() => {
          expect(() => ssTree.delete(point2D)).not.to.throw();
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

      it('should accept a 3D point', () => {
        expect(() => {
          expect(() => ssTree.delete(point3D)).not.to.throw();
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

      it('should return a boolean', () => {
        expect(() => {
          expect(ssTree.delete(point2D)).to.be.a('boolean');
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

    });

    describe('Behaviour', () => {
      var p;
      var points;
      var ssTree;

      beforeEach(() => {
        p = new Point2D(1, 2);
        ssTree = new SsTree();
        points = range(0, 10).map(_ => Point2D.random());
      });

      it('should return false if the point is not in the three', () => {
        expect(() => {
          ssTree.delete(p).should.be.false();
          ssTree.add(p);
          ssTree.delete(Point2D.random()).should.be.false();

          ssTree = new SsTree(points);
          ssTree.delete(p).should.be.false();
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

      it('should return true if the point is in the three, and delete it', () => {
        expect(() => {
          ssTree.add(p);
          ssTree.delete(p).should.be.true();
          ssTree.contains(p).should.be.false();

          ssTree = new SsTree(points);
          let p1 = points.splice(0, 1)[0];

          ssTree.delete(p1).should.be.true();
          ssTree.contains(p1).should.be.false();
          points.every(p => ssTree.contains(p)).should.be.true();
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

    });
  });

  describe('contains()', () => {
    describe('API', () => {
      var point2D = new Point2D(1, 2);
      var point3D = new Point(1, 2, 3);
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should expect 1 argument', () => {
        ssTree.contains.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => ssTree.contains()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.contains', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => ssTree.contains(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.contains', 1));
        expect(() => ssTree.contains(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.contains', false));
        expect(() => ssTree.contains('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.contains', 's'));
        expect(() => ssTree.contains({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.contains', { '4': 4 }));
      });

      it('should throw if the argument is a valid point with a different dimensionality', () => {
        ssTree.add(point2D);

        expect(() => ssTree.contains(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.contains', point3D));

        ssTree = new SsTree([point3D]);
        expect(() => ssTree.contains(point2D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.contains', point2D));
      });

      it('should accept a 2D point', () => {
        expect(() => ssTree.contains(point2D)).not.to.throw();
      });

      it('should accept a 3D point', () => {
        expect(() => ssTree.contains(point3D)).not.to.throw();
      });

      it('should return a boolean', () => {
        expect(ssTree.contains(point2D)).to.be.a('boolean');
      });

    });

    describe('Behaviour', () => {
      var ssTree;
      var p1;
      var p2;
      var p3;
      var p4;

      beforeEach(() => {
        ssTree = new SsTree();
        p1 = new Point2D(1, 2);
        p2 = new Point2D(-1, 22);
        p3 = new Point(0, 1, 0, 2);
        p4 = new Point(1, 1, 2, 3);
      });

      it('should return false for points not in the tree (2D)', () => {
        ssTree.contains(p1).should.be.false();
        ssTree.contains(p2).should.be.false();
        ssTree = new SsTree([p1]);
        ssTree.contains(p2).should.be.false();
      });

      it('should return false for points not in the tree (4D)', () => {
        ssTree.contains(p3).should.be.false();
        ssTree.contains(p4).should.be.false();
        ssTree = new SsTree([p3]);
        ssTree.contains(p4).should.be.false();
      });

      it('should find keys added through .add() (2D)', () => {
        ssTree.add(p1);
        ssTree.contains(p1).should.be.true();
        ssTree.add(p2);
        ssTree.contains(p2).should.be.true();
      });

      it('should find keys added through .add() (4D)', () => {
        ssTree.add(p3);
        ssTree.contains(p3).should.be.true();
        ssTree.add(p4);
        ssTree.contains(p4).should.be.true();
      });

      it('should find keys added through the constructor', () => {
        let points = range(0, 10).map(_ => Point2D.random());
        ssTree = new SsTree(points);

        points.every(p => ssTree.contains(p)).should.be.true();

        points = range(0, 20).map(_ => Point.random(3));
        ssTree = new SsTree(points);

        points.every(p => ssTree.contains(p)).should.be.true();
      });

      it('should return false for deleted keys (2d)', () => {
        expect(() => {
          ssTree = new SsTree([p1, p2]);
          ssTree.delete(p1);
          ssTree.contains(p1).should.be.false();
          ssTree.contains(p2).should.be.true();
          ssTree.delete(p2);
          ssTree.contains(p2).should.be.false();
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

      it('should return false for deleted keys (4D)', () => {
        expect(() => {
          ssTree = new SsTree([p3, p4]);
          ssTree.delete(p3);
          ssTree.contains(p3).should.be.false();
          ssTree.contains(p4).should.be.true();
          ssTree.delete(p4);
          ssTree.contains(p4).should.be.false();
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });

    });
  });

  describe('isEmpty()', () => {
    describe('API', () => {
      var point = new Point2D(1, 2);
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should expect no arguments', () => {
        ssTree.isEmpty.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      var ssTree;
      var p1;
      var p2;

      beforeEach(() => {
        ssTree = new SsTree();
        p1 = new Point2D(1, 2);
        p2 = new Point2D(-1, 22);
      });

      it('should return true for empty trees', () => {
        ssTree.isEmpty().should.be.true();
      });

      it('should return false for trees initialized with an array of points', () => {
        ssTree = new SsTree([p1]);
        ssTree.isEmpty().should.be.false();
      });

      it('should return false after adding point', () => {
        ssTree.isEmpty().should.be.true();
        ssTree.add(p1);
        ssTree.isEmpty().should.be.false();
        ssTree.add(p2);
        ssTree.isEmpty().should.be.false();
      });

      it('should return true if all elements are deleted', () => {
        expect(() => {
          ssTree.isEmpty().should.be.true();
          ssTree.add(p1);
          ssTree.isEmpty().should.be.false();
          ssTree.delete(p1);
          ssTree.isEmpty().should.be.true();

          let points = range(0, 10).map(_ => Point2D.random());
          ssTree = new SsTree(points);
          ssTree.isEmpty().should.be.false();

          points.forEach(p => ssTree.delete(p).should.be.true());
          ssTree.isEmpty().should.be.true();
        }).to.throw(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
      });
    });
  });

  describe('nearestNeighbour()', () => {
    describe('API', () => {
      var point2D = new Point2D(1, 2);
      var point3D = new Point(1, 2, 3);
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should expect 1 argument', () => {
        ssTree.nearestNeighbour.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => ssTree.nearestNeighbour()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.nearestNeighbour', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => ssTree.nearestNeighbour(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.nearestNeighbour', 1));
        expect(() => ssTree.nearestNeighbour(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.nearestNeighbour', false));
        expect(() => ssTree.nearestNeighbour('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.nearestNeighbour', 's'));
        expect(() => ssTree.nearestNeighbour({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.nearestNeighbour', { '4': 4 }));
      });

      it('should throw if the argument is not a point with a different dimensionality', () => {
        ssTree = new SsTree([point2D]);

        expect(() => ssTree.nearestNeighbour(point3D)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.nearestNeighbour', point3D));
      });

      it('should accept a 2D point', () => {
        expect(() => ssTree.nearestNeighbour(point2D)).not.to.throw();
      });

      it('should accept a 3D point', () => {
        expect(() => ssTree.nearestNeighbour(point2D)).not.to.throw();
      });

      it('should return a Point', () => {
        ssTree = new SsTree([point2D]);
        expect(ssTree.nearestNeighbour(point2D)).to.be.an.instanceof(Point);
      });

    });

    describe('Behaviour', () => {
      var point = new Point2D(1, 2);
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should return undefined for an empty tree', () => {
        expect(ssTree.nearestNeighbour(point)).to.equal(undefined);
      });

      it('should return the only point for a singleton tree', () => {
        ssTree.add(point);
        ssTree.nearestNeighbour(point).should.be.eql(point);

        let p = new Point(101, 200);
        ssTree = new SsTree([p]);
        ssTree.nearestNeighbour(point).should.be.eql(p);
      });

      it('should return the closest point (2D)', () => {
        let points = [new Point2D(1, 2), new Point(0, 1), new Point(3, 3), new Point(1.5, 2), new Point(5, -1)];
        let [p1, p2, p3, p4, p5] = points;

        ssTree = new SsTree(points);
        points.forEach(p => {
          ssTree.nearestNeighbour(p).should.be.eql(p);
        });
        ssTree.nearestNeighbour(new Point(1.1, 1.9)).equals(p1).should.be.true();
        ssTree.nearestNeighbour(new Point(-5, -5)).equals(p2).should.be.true();
        ssTree.nearestNeighbour(new Point(3.01, 2.9999)).equals(p3).should.be.true();
        ssTree.nearestNeighbour(new Point(1.6, 2)).equals(p4).should.be.true();
        ssTree.nearestNeighbour(new Point(160, 2)).equals(p5).should.be.true();
      });

      it('should return the closest point (3D)', () => {
        let points = [new Point(1, 2, 55), new Point(0, 1, 0.1), new Point(3, 3, 0.01), new Point(1.5, 2, -0.03), new Point(5, -1, 44)];
        let [p1, p2, p3, p4, p5] = points;

        ssTree = new SsTree(points);
        points.forEach(p => {
          ssTree.nearestNeighbour(p).should.be.eql(p);
        });
        ssTree.nearestNeighbour(new Point(1.1, 1.9, 49)).equals(p1).should.be.true();
        ssTree.nearestNeighbour(new Point(1.1, 1.9, 44)).equals(p5).should.be.true();
        ssTree.nearestNeighbour(new Point(-5, -5, 1)).equals(p2).should.be.true();
        ssTree.nearestNeighbour(new Point(3.01, 2.9999, -1)).equals(p3).should.be.true();
        ssTree.nearestNeighbour(new Point(1.6, 2, 0)).equals(p4).should.be.true();
        ssTree.nearestNeighbour(new Point(160, 2, 40)).equals(p5).should.be.true();
        ssTree.nearestNeighbour(new Point(160, 2, 0.1)).equals(p3).should.be.true();
      });
    });
  });

  describe('pointsWithinDistanceFrom()', () => {
    describe('API', () => {
      var point = new Point2D(1, 2);
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should expect 2 parameters', () => {
        ssTree.pointsWithinDistanceFrom.length.should.eql(2);
      });

      it('should throw if no argument is passed', () => {
        expect(() => [...ssTree.pointsWithinDistanceFrom()]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.pointsWithinDistanceFrom', undefined));
      });

      it('should throw if the first argument is not a valid point', () => {
        expect(() => [...ssTree.pointsWithinDistanceFrom(1)]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.pointsWithinDistanceFrom', 1));
        expect(() => [...ssTree.pointsWithinDistanceFrom(false)]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.pointsWithinDistanceFrom', false));
        expect(() => [...ssTree.pointsWithinDistanceFrom('s')]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.pointsWithinDistanceFrom', 's'));
        expect(() => [...ssTree.pointsWithinDistanceFrom({ '4': 4 })]).to.throw(ERROR_MSG_PARAM_INVALID_POINT('SsTree.pointsWithinDistanceFrom', { '4': 4 }));
      });

      it('should throw if the second argument is not non-negative number', () => {
        expect(() => [...ssTree.pointsWithinDistanceFrom(point, false)]).to.throw(ERROR_MSG_INVALID_DISTANCE('SsTree.pointsWithinDistanceFrom', false));
        expect(() => [...ssTree.pointsWithinDistanceFrom(point, 's')]).to.throw(ERROR_MSG_INVALID_DISTANCE('SsTree.pointsWithinDistanceFrom', 's'));
        expect(() => [...ssTree.pointsWithinDistanceFrom(point, { '4': 4 })]).to.throw(ERROR_MSG_INVALID_DISTANCE('SsTree.pointsWithinDistanceFrom', { '4': 4 }));
        expect(() => [...ssTree.pointsWithinDistanceFrom(point, -1)]).to.throw(ERROR_MSG_INVALID_DISTANCE('SsTree.pointsWithinDistanceFrom', -1));
      });

      it('should accept a point and a valid distance', () => {
        expect(() => [...ssTree.pointsWithinDistanceFrom(point, 0)]).not.to.throw();
        expect(() => [...ssTree.pointsWithinDistanceFrom(point, 2)]).not.to.throw();
        expect(() => [...ssTree.pointsWithinDistanceFrom(point, 0.00001)]).not.to.throw();
      });

      it('should return an iterator Object', () => {
        expect(ssTree.pointsWithinDistanceFrom(point, 0)).to.be.an.instanceof(Object);
      });

    });

    describe('Behaviour', () => {
      var p1 = new Point2D(1, 2);
      var p2 = new Point2D(2, 1);
      var p3 = new Point2D(200, -100);
      var p4 = new Point2D(150, -50);
      var points3D = [new Point(0, 0, 0), new Point(-1, 2, 3.5), new Point(0.55, 30, -10), new Point(1, 1.2, 1.5), new Point(4.25, 0.37, 0)];
      var ssTree;

      beforeEach(() => {
        ssTree = new SsTree();
      });

      it('should return an empty set in an empty tree', () => {
        let result = [...ssTree.pointsWithinDistanceFrom(p1, 100)];
        result.should.be.instanceOf(Array);
        result.length.should.be.eql(0);
      });

      it('should return an empty Set if all the points are not within distance', () => {
        ssTree = new SsTree([p1]);
        let result = [...ssTree.pointsWithinDistanceFrom(p3, 100)];
        result.should.be.instanceOf(Array);
        result.length.should.be.eql(0);

        ssTree = new SsTree([p1, p2]);
        result = [...ssTree.pointsWithinDistanceFrom(p3, 100)];
        result.should.be.instanceOf(Array);
        result.length.should.be.eql(0);
      });

      it('should return the only point in a singleton tree, if within distance', () => {
        ssTree = new SsTree([p1]);

        let result = [...ssTree.pointsWithinDistanceFrom(p2, 10)];
        result.length.should.be.eql(1);
        result.should.be.eql([p1]);

        result = [...ssTree.pointsWithinDistanceFrom(p1, 1)];
        result.length.should.be.eql(1);
        result.should.be.eql([p1]);
      });

      it('should include the points itself, if in the tree (2D)', () => {
        ssTree = new SsTree([p1, p2]);

        let result = new Set(ssTree.pointsWithinDistanceFrom(p2, 1));
        result.has(p2).should.be.true();

        result = new Set(ssTree.pointsWithinDistanceFrom(p2, 0));
        result.has(p2).should.be.true();
      });

      it('should include the points itself, if in the tree (3D)', () => {
        let p = points3D[0];
        ssTree = new SsTree(points3D);

        let result = new Set(ssTree.pointsWithinDistanceFrom(p, 1));
        result.has(p).should.be.true();

        result = new Set(ssTree.pointsWithinDistanceFrom(p, 0));
        result.has(p).should.be.true();
      });

      it('should return all the points within distance (2D)', () => {
        let points = [new Point2D(1, 2), new Point(0, 1), new Point(3, 3), new Point(1.5, 2), new Point(5, -1)];
        let [p1, p2, p3, p4, p5] = points;
        let result;

        ssTree = new SsTree(points);

        result = [...ssTree.pointsWithinDistanceFrom(new Point(1.1, 1.9), 1)];
        result.should.be.eql([p1, p4]);

        result = [...ssTree.pointsWithinDistanceFrom(new Point(1.1, 1.9), 10)];
        result.should.be.eql([p1, p2, p3, p4, p5]);

        result = [...ssTree.pointsWithinDistanceFrom(new Point(-5, -5), 1)];
        result.should.be.eql([]);
        result = [...ssTree.pointsWithinDistanceFrom(new Point(-5, -5), 10)];
        result.should.be.eql([p1, p2, p4]);
        result = [...ssTree.pointsWithinDistanceFrom(new Point(3.01, 2.9999), 0.1)];
        result.should.be.eql([p3]);
        result = [...ssTree.pointsWithinDistanceFrom(new Point(3.01, 2.9999), 2)];
        result.should.be.eql([p3, p4]);
        result = [...ssTree.pointsWithinDistanceFrom(new Point(1.6, 2), 10)];
        result.should.be.eql([p1, p2, p3, p4, p5]);
        result = [...ssTree.pointsWithinDistanceFrom(new Point(160, 2), 160)];
        result.should.be.eql([p1, p2, p3, p4]);
      });
    });
  });

  describe('iterator', () => {
    describe('Behaviour', () => {
      var ssTree;
      var points;

      beforeEach(function () {
        points = range(0, 50).map(_ => Point2D.random());
        ssTree = new SsTree(points);
      });

      it('# should return all the points inserted', () => {
        let result = [];
        let size = points.length;
        for (let p of ssTree) {
          result.push(p);
        }
        result.should.be.an.Array();
        result.length.should.eql(size);
        result.every(p => ssTree.contains(p)).should.be.true();
      });
    });

  });
});