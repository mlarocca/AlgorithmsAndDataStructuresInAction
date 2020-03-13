import Point from '../geometric/point.js';
import { arrayMax, variance } from '../common/array.js';
import { isUndefined } from '../common/basic.js';
import { isNumber, range } from '../common/numbers.js';
import { ERROR_MSG_INVALID_DISTANCE, ERROR_MSG_METHOD_UNIMPLEMENTED } from '../common/errors.js';

const _root = new WeakMap();
const _points = new WeakMap();
const _size = new WeakMap();
const _children = new WeakMap();
const _centroid = new WeakMap();
const _radius = new WeakMap();
const _variance = new WeakMap();
const _T = new WeakMap();
const _K = new WeakMap();

const _DEFAULT_MAX_POINTS_PER_NODE = 2;
const _DEBUG = true;

/**
 * @class SsTree
 * Models a SsTree API
 */
class SsTree {

  /**
   * @constructor
   * @for SsTree
   * @description
   * Creates a SsTree, with an initial set of points. Unless the set of points is empty, the dimensionality for the tree
   * is set to the dimensionality of the points in the argument. (Obviously they must all have the same dimensionality).
   * Construction requires O(n log(n)) time, if n points are passed (O(n) for each of the log(n) levels)
   * It's possible to add or delete points afterwards, but the tree won't be rebalanced after those changes.
   * On construction, instead, the tree is created in such a way that every search requires O(log(n)) comparisons.
   *
   * @param {?Point[]} points The initial set of points stored in the tree.
   * @param {?number} maxPointsPerNode The maximum number of points that each cluster can hold, before being split.
   */
  constructor(points = [], maxPointsPerNode = _DEFAULT_MAX_POINTS_PER_NODE) {
    Point.validatePointArray(points, undefined, 'SsTree');
    if (points.length > 0) {
      _K.set(this, points[0].dimensionality);
      _root.set(this, new Node(points, _K.get(this), maxPointsPerNode));
    } else {
      _root.set(this, new Node([], 0, maxPointsPerNode));
    }
  }

  /**
   * @name contains
   * @for SsTree
   * @description
   * Check whether the point is stored in the tree.
   *
   * @param {Point} point The point to check.
   * @returns {boolean} True iff the argument belongs to the tree.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  contains(point) {
    Point.validatePoint(point, this.dimensionality, 'SsTree.contains');
    return _root.get(this).contains(point);
  }

  /**
   * @name add
   * @for SsTree
   * @description
   * Add a point to the tree, if it doesn't already contain a point with the same coordinates.
   *
   * @param {Point} point The point to add to the tree.
   * @returns {boolean} True iff the point wasn't already in the tree.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  add(point) {
    var added = false;
    let root = _root.get(this);
    if (root.size === 0) {
      Point.validatePoint(point, undefined, 'SsTree.add');
      _K.set(this, point.dimensionality);
      root.add(point, true);
      added = true;
    } else {
      Point.validatePoint(point, this.dimensionality, 'SsTree.add');
      if (!root.contains(point)) {
        root.add(point, true);
        added = true;
      }
    }
    return added;
  }

  /**
   * @name delete
   * @for SsTree
   * @description
   * Delete a point from the tree.
   *
   * @param {Point} point The point to delete from the tree.
   * @returns {boolean} True iff the point was indeed in the tree and has been deleted.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  delete(point) {
    Point.validatePoint(point, this.dimensionality, 'SsTree.delete');
    throw new TypeError(ERROR_MSG_METHOD_UNIMPLEMENTED('SsTree.delete'));
  }

  /**
   * @name dimensionality
   * @for SsTree
   * @description
   * Return the number of dimensions of the (hyper)space whose points are hosted in the SsTree.
   *
   * @returns {|number|undefined} The result is undefined iff no point has been added to the tree since creation,
   *                              otherwise it returns the correct dimensionality.
   */
  get dimensionality() {
    return _K.get(this);
  }

  /**
   * @name size
   * @for SsTree
   * @desciption
   * The number of points currently hosted in the tree.
   *
   * @returns {number} The size of the tree.
   */
  get size() {
    return _root.get(this).size;
  }

  /**
   * @name height
   * @for SsTree
   * @desciption
   * The number of levels in the tree. Leaves have height 1, by convention.
   *
   * @returns {number} The height of the tree.
   */
  get height() {
    return _root.get(this).height;
  }

  /**
   * @name isEmpty
   * @for SsTree
   * @description
   * Check if at least one point is stored in the tree.
   *
   * @returns {boolean} True iff there is at least one point stored in the tree.
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * @name nearestNeighbour
   * @for SsTree
   * @description
   *
   * @param {Point} point The target point.
   * @returns {Point|undefined} Undefined if the tree is empty, else the point in the tree that is closest to the argument.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  nearestNeighbour(point) {
    Point.validatePoint(point, this.dimensionality, 'SsTree.nearestNeighbour');
    let [nn, _] = _root.get(this).nearestNeighbour(point);
    return nn;
  }

  /**
   * @name pointsWithinDistanceFrom
   * @for SsTree
   * @description
   * Selects all the points in the tree that lie inside a hypersphere. The hypersphere is passed by providing its
   * center and radius.
   *
   * @param {Point} point The center of the desired hypersphere.
   * @param {number} distance The radius of the hypersphere.
   * @returns {Generator<Point>} Will yield all the points within the selected region of (hyper)space.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the hypersphere center is not a valid point.
   * @throws TypeError(ERROR_MSG_INVALID_DISTANCE) if the radius of the hypersphere is not a valid distance (i.e. a non-negative number).
   */
  *pointsWithinDistanceFrom(point, distance) {
    Point.validatePoint(point, this.dimensionality, 'SsTree.pointsWithinDistanceFrom');
    if (!isNumber(distance) || distance < 0) {
      throw new TypeError(ERROR_MSG_INVALID_DISTANCE('SsTree.pointsWithinDistanceFrom', distance));
    }
    yield* _root.get(this).pointsWithinDistanceFrom(point, distance);
  }

  /**
   * @iterator
   * @for SsTree
   * @description
   *
   * Iterates through all the points currently stored in the tree.
   * Points are returned in preorder, with respect to how they are stored in the tree. This means that NO particular
   * order can be guaranteed for the points (they won't be sorted with respect to any coordinate or combination of coordinates)
   */
  *[Symbol.iterator]() {
    yield* _root.get(this);
  }
}

/**
 * @class Node
 * @private
 *
 * Models the internal representation of SsTree's node.
 */
class Node {

  /**
   * @constructor
   * @for Node
   * @description
   * Constructs a subTree of the SsTree.
   * Performs a balanced construction:
   * - Choose a coordinate (according to node depth) and use it for all the comparisons below
   * - Looks for the median, and assign it to this newly created node.
   * - Partition the remaining points so that on the left are all the ones smaller than the median, and the remaining on the right.
   * - Recursively build left and right branches.
   *
   * @param {Array<Point>} points The points to be added to this subtree.
   * @param {number} dimensionality The number of dimensions of the space containing the points.
   * @param {number} maxPointsPerNode The max number of points that can be hosted by a node.
   */
  constructor(points, dimensionality, maxPointsPerNode) {
    let n = points.length;
    _T.set(this, maxPointsPerNode);
    _K.set(this, dimensionality);
    _size.set(this, n);

    if (n > maxPointsPerNode) {
      let [children, variances] = Node._splitPoints(points, dimensionality, maxPointsPerNode);
      _children.set(this, children);

      this._updatePointsStats(variances);
    } else if (n > 0) {
      //create a leaf
      _children.set(this, undefined);
      _points.set(this, points.slice());
      this._updatePointsStats();
    } else {
      _children.set(this, undefined);
      _points.set(this, []);
      this._updatePointsStats();
    }
    /* jshint ignore:start */
    _DEBUG && this._check();
    /* jshint ignore:end */
  }

  /**
   * @name keyByDim
   * @static
   * @for Node
   * @description
   * Create a function that, given a point, returns the key to be used in comparisons for the point: in this case the ith
   * coordinate for the point.
   *
   * @param {number} dim The index of the coordinate to be extracted from the point.
   * @returns {function} A function that can be used for extracting keys from points (Will be passed to partitioning and sorting methods).
   */
  static keyByDim(dim) {
    return p => p.coordinate(dim);
  }

  /**
   * @name InternalNode
   * @for Node
   * @static
   * @private
   * @description
   * Shortcut to create an empty (point-wise) internal node and set its children.
   *
   * @param {Array<Node>} children An array with Node items that will be assigned to the node.
   * @invariant children.length < maxPointsPerNode
   * @param {number} dimensionality The number of dimensions of the space containing the points.
   * @param {number} maxPointsPerNode The max number of points that can be hosted by a node.
   */
  static InternalNode(children, dimensionality, maxPointsPerNode) {
    let node = new Node([], dimensionality, maxPointsPerNode);
    if (children.length > maxPointsPerNode) {
      //Error => fail spectacularly
      return null;
    }
    _children.set(node, children);
    node._updatePointsStats();
    return node;
  }

  /**
   * @name points
   * @for Node
   * Yield all the points in the subtree rooted at this node. If the node is a leaf, this means that it stores the points
   * directly, and they can all be returned.
   * Otherwise, an intermediate node by definition holds all the points held by its children.
   *
   * @returns {Generator<Point>} Returns the point stored in the node, or undefined if none is.
   */
  *points() {
    if (this.isLeaf()) {
      yield* _points.get(this);
    } else {
      for (let child of this.children) {
        yield* child.points();
      }
    }
  }

  /**
   * @name size
   * @for Node
   * @getter
   *
   * @returns {number} The number of points stored in the subtree rooted at this node.
   */
  get size() {
    return _size.get(this);
  }

  /**
   * @name height
   * @for Node
   * @getter
   *
   * @returns {number} The height of the subtree rooted at this node.
   */
  get height() {
    var height;
    if (this.isLeaf()) {
      height = this.size > 0 ? 1 : 0;
    } else {
      height = 1 + this.children.reduce((max, c) => Math.max(max, c.height), 0);
    }
    return height;
  }

  /**
   * @name dimensionality
   * @for Node
   * @description
   * Return the number of dimensions of the (hyper)space whose points are hosted in the Node.
   *
   * @returns {number|undefined} The result is undefined iff no point has been added to the tree since creation,
   *                              otherwise it returns the correct dimensionality.
   */
  get dimensionality() {
    return _K.get(this);
  }

  /**
   * @name isLeaf
   * @for Node
   * @description
   * Check if this node is a leaf.
   *
   * @returns {number} Returns true if this node is a leaf, which means:
   *                    - Its size is exactly 1.
   *                    - Its left and right branches are empty nodes.
   */
  isLeaf() {
    return isUndefined(this.children);
  }

  /**
   * @name T
   * @for Node
   * @getter
   * @description
   * Getter for the max number of points per node.
   *
   * @returns {number} The  maximum number of points allowed per node.
   */
  get T() {
    return _T.get(this);
  }

  /**
   * @name T
   * @for Node
   * @setter
   * @description
   * Set the maximum number of points per node.
   *
   * @param {number} t The new value.
   */
  set T(t) {
    _T.set(this, t);
  }

  /**
   * @name centroid
   * @for Node
   * @getter
   *
   * @returns {Point} Current node's centroid.
   */
  get centroid() {
    return _centroid.get(this);
  }

  /**
   * @name radius
   * @for Node
   * @getter
   *
   * @returns {Point} Current node's radius.
   */
  get radius() {
    return _radius.get(this);
  }

  /**
   * @name children
   * @for Node
   * @getter
   *
   * @returns {Array<Node>} Returns the array of children for the current node.
   */
  get children() {
    return _children.get(this);
  }

  /**
   * @name child
   * @for Node
   * @param {number} index The index of the children to retrieve (between 0 and _T-1).
   *
   * @returns {Node|undefined} Returns the i-th child of current node, if present, or otherwise `undefined`.
   */
  child(index) {
    return this.children[index];
  }

  /**
   * @name contains
   * @for Node
   * @description
   * Check whether the point is stored in the subtree rooted at this node.
   *
   * @param {Point} point The point to check.
   * @returns {boolean} True iff the argument belongs to the tree.
   */
  contains(point) {
    let found = false;
    if (this.isLeaf()) {
      for (let p of this.points()) {
        if (p.equals(point)) {
          found = true;
          break;
        }
      }
    } else {
      return this.children.some(child => {
        if (point.distanceTo(child.centroid) <= child.radius) {
          return child.contains(point);
        } else {
          return false;
        }
      });
    }
    return found;
  }

  /**
   * @name add
   * @for Node
   * @description
   * Add a point to the subtree rooted at this node, if it doesn't already contain a point with the same coordinates.
   * @invariant Node.contains(point) === false. Knowing we will actually add the point makes easier dealing with node
   *            splitting, and avoids performance bottlenecks.
   *
   * @param {Point} point The point to add to the tree.
   * @returns {Array<Node>} True iff the point wasn't already in the tree.
   */
  add(point, isRoot = false) {
    var newNodes;

    if (this.isLeaf()) {
      let points = _points.get(this);
      points.push(point);
      if (points.length > this.T) {

        if (isRoot) {

          //Can't split root into 2 leaves, must add 2 children
          let [children, variances] = Node._splitPoints(points, this.dimensionality, this.T);

          _children.set(this, children);
          _points.delete(this);
          this._updatePointsStats(variances);
          newNodes = null;
        } else {
          //Just return 2 leaves, each with half the points
          newNodes = Node._splitPoints(points, this.dimensionality, this.T)[0];
        }
      } else {
        _K.set(this, point.dimensionality);
        _points.set(this, points);
        _size.set(this, points.length);
        newNodes = null;
        this._updatePointsStats();
      }
    } else {
      let children = this.children;
      let closestChildIndex = this._closestChildrenIndex(point);
      let closestChild = children[closestChildIndex];
      let resultingNodes = closestChild.add(point);
      if (resultingNodes !== null) {
        //If adding the point resulted in a split of the child, we have to remove it and replace it with the new nodes
        children.splice(closestChildIndex, 1);
        children = children.concat(resultingNodes);

        if (children.length <= this.T) {
          //If the total number of children is still within the contraints, just add the new nodes
          _children.set(this, children);
          this._updatePointsStats();
          newNodes = null;
        } else {
          //If, however, the number of children becomes greater than the max number of children per node...
          //Split the children array in two parts, and creates two internal nodes holding each half
          let [dimensionality, maxPointsPerNode] = [this.dimensionality, this.T];
          newNodes = Node._splitChildren(children, dimensionality, maxPointsPerNode);

          if (isRoot) {
            //If it's the root being split, we just have to update it
            _children.set(this, newNodes);
            this._updatePointsStats();
            newNodes = null;  //Doesn't really matter
          }
        }
      } else {
        newNodes = null;
        this._updatePointsStats();
      }
    }

    /* jshint ignore:start */
    _DEBUG && (newNodes === null) && this._check();
    /* jshint ignore:end */

    return newNodes;
  }

  /**
   * @name delete
   * @for Node
   * @deprecated Not implemented
   * @description
   * Delete a point from the subtree rooted at this node.
   *
   * @param {Point} point The point to delete from the tree.
   * @returns {boolean} True iff the point was indeed in the tree and has been deleted.
   */
  delete(point) {
    throw new TypeError(ERROR_MSG_METHOD_UNIMPLEMENTED('delete'));
  }

  /**
   * @name nearestNeighbour
   * @for Node
   * @description
   * Find the nearest neightbour for the point in input, among the points stored in the subtree rooted at this node.
   *
   * @param {Point} target The point whose nearest neighbour we need to find.
   * @param {?Point} nn The closest point found so far.
   * @param {?number} nnDist The distance of the best point found so far.
   * @returns {[Point, number]} A tuple with the closest point found in this subtree and its distance.
   */
  nearestNeighbour(target, nn = undefined, nnDist = Number.POSITIVE_INFINITY) {
    if (this.isLeaf()) {
      let points = _points.get(this);
      if (points.length > 0) {
        let [p, d] = target.minDistance(points);
        if (d < nnDist) {
          [nn, nnDist] = [p, d];
        }
      }
    } else if (this.children.length > 0) {
      let closestChild = this.child(this._closestChildrenIndex(target));

      [nn, nnDist] = closestChild.nearestNeighbour(target, nn, nnDist);

      for (let child of this.children) {
        //Check other children, if the distance to the cluster border is lower than min dist found so far, then we need to search that branch
        if (child !== closestChild && (target.distanceTo(_centroid.get(child)) - _radius.get(child)) < nnDist) {
          let [p, d] = child.nearestNeighbour(target, nn, nnDist);
          if (d < nnDist) {
            [nn, nnDist] = [p, d];
          }
        }
      }
    }
    return [nn, nnDist];
  }

  /**
   * @name pointsWithinDistanceFrom
   * @for Node
   * @description
   * Selects all the points in the tree that lie inside a hypersphere. The hypersphere is passed by providing its
   * center and radius.
   *
   * @param {Point} center The center of the desired hypersphere.
   * @param {number} radius The radius of the hypersphere.
   * @returns {Generator<Point>}  Will yield the points in the tree that are inside the hypersphere centered at center and with given radius.
   */
  *pointsWithinDistanceFrom(center, radius) {
    if (this.isLeaf()) {
      for (let p of this.points()) {
        if (center.distanceTo(p) <= radius) {
          yield p;
        }
      }
    } else {
      for (let child of this.children) {
        if (center.distanceTo(_centroid.get(child)) - _radius.get(child) <= radius) {
          yield* child.pointsWithinDistanceFrom(center, radius);
        }
      }
    }
  }

  /**
   * @iterator
   * @for Node
   * @description
   *
   * Iterates through all the points currently stored in the tree, using preorder.
   */
  *[Symbol.iterator]() {
    yield* this.points();
  }

  /**
   * @name _updatePointsStats
   * @for Node
   * @private
   * @description
   * Updates all the stats for the current node.
   * It's possible to pass some or all the stats, as an optimization, in case they have been computed
   *
   * @param {?Array<number>} variances An array with the variances for the points in the node.
   * @param {?Point} centroid The centroid for the node.
   * @param {?number} radius The radius for the node's cluster.
   */
  _updatePointsStats(variances = null, centroid = null, radius = null) {
    let points = [...this.points()];
    let n = points.length;
    let newVariances;
    let newCentroid;
    let newRadius;
    if (n > 0) {
      newVariances = variances || range(0, this.dimensionality).map(d => variance(points.map(p => p.coordinate(d))));
      newCentroid = centroid || Point.centroid(points);
      newRadius = radius || newCentroid.maxDistance(points)[1];
    } else {
      newVariances = range(0, this.dimensionality).map(_ => 0);
      newCentroid = undefined;
      newRadius = 0;
    }
    _centroid.set(this, newCentroid);
    _radius.set(this, newRadius);
    _variance.set(this, newVariances);
    _size.set(this, n);
  }

  /**
   * @name _closestChildrenIndex
   * @for Node
   * @private
   * @description
   * Finds the index of the closest children to the point in input.
   *
   * @param {Point} point Any point.
   * @returns {number|undefined} The index of the closest child.
   */
  _closestChildrenIndex(point) {
    let centroids = this.children.map(c => c.centroid);
    let [closest, _] = point.minDistance(centroids);
    return centroids.indexOf(closest);
  }

  /**
   * @name _splitPoints
   * @for Node
   * @private
   * @static
   * @description
   * Takes an array of points, split them in at most maxPointsPerNode chunks, and for each of them, creates a new
   * subtree (possibly a Leaf) holding them.
   * The split happens along the dimension with the highest variance, so to have a better clustering, and that points
   * are more clearly separated.
   *
   * @param {Array<Point>} points An array of points that will be split in chunks with no more than T elements.
   * @invariant points.length > 0
   * @param {number} dimensionality The number of dimensions of the space containing the points.
   * @param {number} maxPointsPerNode The max number of points that can be hosted by a node.
   * @returns {[Array<Node>, Array<number>]} Two elements:
   *           - An array of the Nodes created to host the points;
   *           - An array of the variances, among the points array, for each one of the dimensions.
   */
  static _splitPoints(points, dimensionality, maxPointsPerNode) {
    let n = points.length;
    //Compute the variance for each of the dimensions
    let variances = range(0, dimensionality).map(d => variance(points.map(p => p.coordinate(d))));
    //Find the dimension with the highest variance, and split points over that dimension
    let dim = arrayMax(variances).index;
    let key = Node.keyByDim(dim);
    points.sort(key);

    let k = Math.ceil(n / maxPointsPerNode);

    let children = range(0, n, k)
      .map(startIndex => points.slice(startIndex, startIndex + k))
      .map(ps => new Node(ps, dimensionality, maxPointsPerNode));
    return [children, variances];
  }

  /**
   * @name _splitChildren
   * @for Node
   * @private
   * @static
   * @description
   * Takes an array of Nodes, split them in at most maxPointsPerNode chunks, and for each of them, creates a new
   * subtree holding them.
   * The split happens along the dimension with the highest variance, so to have a better clustering of the children's
   * clusters, whose centroids are more clearly separated.
   *
   * @param {Array<Node>} children An array of Nodes that will be split in chunks with no more than T elements.
   * @invariant children.length > 0
   * @param {number} dimensionality The number of dimensions of the space containing the points.
   * @param {number} maxPointsPerNode The max number of points that can be hosted by a node.
   * @returns {Array} A list of the Nodes created to hold the partitioned children.
   * @private
   */
  static _splitChildren(children, dimensionality, maxPointsPerNode) {
    let n = children.length;
    //get the centroids
    let points = children.map(_ => _.centroid);

    //Compute the variance for each of the dimensions
    let variances = range(0, dimensionality).map(d => variance(points.map(p => p.coordinate(d))));
    //Find the dimension with the highest variance, and split points over that dimension
    let dim = arrayMax(variances).index;
    let key = Node.keyByDim(dim);
    //Make a sorted copy of the original points array (the original array is needed to retrieve the index of the child)
    let sortedPoints = points.slice().sort(key);

    let k = Math.ceil(n / maxPointsPerNode);

    //Now partitions children depending on their centroids (retrieving index of
    let partitions = range(0, n, k)
      .map(startIndex => sortedPoints.slice(startIndex, startIndex + k).map(p => children[points.indexOf(p)]));
    return partitions.map(childrenArray => Node.InternalNode(childrenArray, dimensionality, maxPointsPerNode));
  }

  /**
   * @name _check
   * @for Node
   * @private
   * @description
   *
   * Check the structure of the Tree, validating the following invariant conditions:
   * 1. Every Leaf can hold at most T points, and every internal node can hold at most T children;
   * 2. Every node (leaf or internal) has a centroid and a radius that matches the cluster of points stored in its subtree;
   * 3. A node doesn't have a centroid iff its subtree is empty;
   * 4. Every point in the subtree is contained in the cluster defined by a node's centroid and radius;
   * 5. .size matches the number of points stored in each subTree.
   *
   * @throws {TypeError} if any of the invariants is violated.
   */
  _check() {
    this._checkCentroidAndRadius();
    this._checkPoints();
    if (!this.isLeaf()) {
      if (this.children.length > this.T) {
        throw new TypeError(`Max children per node check failed: ${this.children.length} vs ${this.T}`);
      }
      this.children.forEach(c => c._check());
    }
  }

  /**
   * @name _checkCentroidAndRadius
   * @for Node
   * @private
   * @description
   * Check that centroid and radius are computed correctly for each subtree.
   *
   * @throws {TypeError} if any of the invariants is violated.
   */
  _checkCentroidAndRadius() {
    var centroid;
    var radius;

    let points = [...this.points()];

    if (points.length > 0) {
      centroid = Point.centroid(points);
      radius = centroid.maxDistance(points)[1];

    } else {
      centroid = undefined;
      radius = 0;
    }

    if (isUndefined(centroid) && !isUndefined(this.centroid) || !isUndefined(centroid) && !centroid.equals(this.centroid)) {
      throw new TypeError(`Centroid check failed: ${isUndefined(this.centroid) || this.centroid.toString()} vs ${isUndefined(centroid) || centroid.toString()}`);
    }

    if (radius !== this.radius) {
      throw new TypeError('Radius check failed');
    }
  }

  /**
   * @name _checkPoints
   * @for Node
   * @private
   * @description
   * Check that each point in the subTree belongs to the cluster, and that leaves doesn't have more points than allowed.
   *
   * @throws {TypeError} if any of the invariants is violated.
   */
  _checkPoints() {
    let points = [...this.points()];
    if (this.size !== points.length) {
      throw new TypeError('Size check failed');
    }
    let checkCentroidPosition = points.every(p => p.distanceTo(this.centroid) <= this.radius);

    if (!checkCentroidPosition) {
      throw new TypeError(`Points within cluster check failed: ${points.length} vs ${this.T}`);
    }

    if (this.isLeaf() && _points.get(this).length > this.T) {
      throw new TypeError('Max points per leaf check failed');
    }
  }

}

export default SsTree;