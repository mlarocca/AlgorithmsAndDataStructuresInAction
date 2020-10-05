import Point from '../geometric/point.js';
import Cube from '../geometric/cube.js';
import { median } from '../common/sort.js';
import { isNumber } from '../common/numbers.js';
import { ERROR_MSG_INVALID_DIMENSION_INDEX, ERROR_MSG_INVALID_DISTANCE } from '../common/errors.js';

const _root = new WeakMap();
const _depth = new WeakMap();
const _point = new WeakMap();
const _size = new WeakMap();
const _left = new WeakMap();
const _right = new WeakMap();
const _K = new WeakMap();

/**
 * @class KdTree
 * Models a KdTree API
 */
class KdTree {

  /**
   * @constructor
   * @for KdTree
   * @description
   * Creates a KdTree, with an initial set of points. Unless the set of points is empty, the dimensionality for the tree
   * is set to the dimensionality of the points in the argument. (Obviously they must all have the same dimensionality).
   * Construction requires O(n log(n)) time, if n points are passed (O(n) for each of the log(n) levels)
   * It's possible to add or delete points afterwards, but the tree won't be rebalanced after those changes.
   * On construction, instead, the tree is created in such a way that every search requires O(log(n)) comparisons.
   *
   * @param {?Array<Point>} points The initial set of points stored in the tree.
   */
  constructor(points = []) {
    Point.validatePointArray(points, undefined, 'KdTree');
    if (points.length > 0) {
      _K.set(this, points[0].dimensionality);
      _root.set(this, new Node(points, _K.get(this)));
    } else {
      _root.set(this, Node.Empty(0, 0));
    }
  }

  /**
   * @name contains
   * @for KdTree
   * @description
   * Check whether the point is stored in the tree.
   *
   * @param {!Point} point The point to check.
   * @returns {boolean} True iff the argument belongs to the tree.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  contains(point) {
    Point.validatePoint(point, this.dimensionality, 'KdTree.contains');
    return _root.get(this).contains(point);
  }

  /**
   * @name add
   * @for KdTree
   * @description
   * Add a point to the tree, if it doesn't already contain a point with the same coordinates.
   *
   * @param {!Point} point The point to add to the tree.
   * @returns {boolean} True iff the point wasn't already in the tree.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  add(point) {
    Point.validatePoint(point, this.dimensionality, 'KdTree.add');
    let added;
    if (_root.get(this).isEmpty()) {
      _K.set(this, point.dimensionality);
      _root.set(this, new Node([point], point.dimensionality));
      added = true;
    } else {
      added = _root.get(this).add(point);
    }
    return added;
  }

  /**
   * @name delete
   * @for KdTree
   * @description
   * Delete a point from the tree.
   *
   * @param {!Point} point The point to delete from the tree.
   * @returns {boolean} True iff the point was indeed in the tree and has been deleted.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  delete(point) {
    Point.validatePoint(point, this.dimensionality, 'KdTree.delete');
    return _root.get(this).delete(point);
  }

  /**
   * @name dimensionality
   * @for KdTree
   * @description
   * Return the number of dimensions of the (hyper)space whose points are hosted in the KdTree.
   *
   * @returns {number|undefined} The result is undefined iff no point has been added to the tree since creation,
   *                              otherwise it returns the correct dimensionality.
   */
  get dimensionality() {
    return _K.get(this);
  }

  /**
   * @name size
   * @for KdTree
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
   * @for KdTree
   * @desciption
   * The number of points currently hosted in the tree.
   *
   * @returns {number} The height of the tree.
   */
  get height() {
    return _root.get(this).height;
  }

  /**
   * @name isEmpty
   * @for KdTree
   * @description
   * Check if at least one point is stored in the tree.
   *
   * @returns {boolean} True iff there is at least one point stored in the tree.
   */
  isEmpty() {
    return _root.get(this).isEmpty();
  }

  /**
   * @name findMin
   * @for KdTree
   * @description
   * Find the point in the tree that has the lowest value for a particular coordinate.
   *
   * @param {!number} searchDim The dimension that will be used to compare the points. For a 2dTree, for example,
   *                            0 will compare points by their x coordinate, while 1 will use y coordinates.
   * @returns {Point|undefined} Undefined for an empty tree, otherwise the point in the tree for which coordinate(searchDim)
   *                            is minimal.
   * @throws TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX) if the argument not a valid dimension for this tree, i.e. an
   *                                                      integer between 0 and dimensionality-1.
   */
  findMin(searchDim) {
    if (!Number.isSafeInteger(searchDim) || searchDim < 0 || searchDim >= this.dimensionality) {
      throw new TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMin', searchDim, this.dimensionality));
    }
    let node = _root.get(this).findMinNode(searchDim);
    return node && node.point;
  }

  /**
   * @name findMax
   * @for KdTree
   * @description
   * Find the point in the tree that has the highest value for a particular coordinate.
   *
   * @param {!number} searchDim The dimension that will be used to compare the points. For a 2dTree, for example,
   *                            0 will compare points by their x coordinate, while 1 will use y coordinates.
   * @returns {Point|undefined} Undefined for an empty tree, otherwise the point in the tree for which coordinate(searchDim)
   *                            is maximal.
   * @throws TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX) if the argument not a valid dimension for this tree, i.e. an
   *                                                      integer between 0 and dimensionality-1.
   */
  findMax(searchDim) {
    if (!Number.isSafeInteger(searchDim) || searchDim < 0 || searchDim >= this.dimensionality) {
      throw new TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX('KdTree.findMax', searchDim, this.dimensionality));
    }
    let node = _root.get(this).findMaxNode(searchDim);
    return node && node.point;
  }

  /**
   * @name nearestNeighbour
   * @for KdTree
   * @description
   *
   * @param {!Point} point The target point.
   * @returns {Point|undefined} Undefined if the tree is empty, else the point in the tree that is closest to the argument.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   */
  nearestNeighbour(point) {
    Point.validatePoint(point, this.dimensionality, 'KdTree.nearestNeighbour');
    let [nn, _] = _root.get(this).nearestNeighbour(point);
    return nn;
  }

  /**
   * @name pointsWithinDistanceFrom
   * @for KdTree
   * @description
   * Selects all the points in the tree that lie inside a hypersphere. The hypersphere is passed by providing its
   * center and radius.
   *
   * @param {!Point} point The center of the desired hypersphere.
   * @param {!number} distance The radius of the hypersphere.
   * @returns {Generator<Point>} Will yield all the points within the selected region of (hyper)space.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the hypersphere center is not a valid point.
   * @throws TypeError(ERROR_MSG_INVALID_DISTANCE) if the radius of the hypersphere is not a valid distance (i.e. a non-negative number).
   */
  *pointsWithinDistanceFrom(point, distance) {
    Point.validatePoint(point, this.dimensionality, 'KdTree.pointsWithinDistanceFrom');
    if (!isNumber(distance) || distance < 0) {
      throw new TypeError(ERROR_MSG_INVALID_DISTANCE('KdTree.pointsWithinDistanceFrom', distance));
    }
    yield* _root.get(this).pointsWithinDistanceFrom(point, distance);
  }

  /**
   * @name pointsInRegion
   * @for KdTree
   * @description
   * Selects all the points in the tree that lie inside a hypercube aligned with Cartesian versors.
   * The hypercube is described by providing two of its opposite corners, and in particular the one with all the
   * smallest coordinates, and the one with all the largest ones.
   * For example, in the 2D space, if (x1,y1) and (x2,y2) are those cornes, it MUST hold x1 < x2 && y1 < y2.
   * The space considered is always the cartesian space, so for 2D picture the bottom corner as the bottom-left one, and the
   * top corner as the top-right one.
   *
   * @param {!Cube} targetRegion An hypercube defining the region of space where we should look for points.
   * @returns {Generator<Point>} The points within the selected region of (hyper)space.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_CUBE) if the input is not a valid hypercube.
   */
  *pointsInRegion(targetRegion) {
    Cube.validateCube(targetRegion, this.dimensionality, 'KdTree.pointsInRegion');
    yield* _root.get(this).pointsInRegion(targetRegion, Cube.R(this.dimensionality));
  }

  /**
   * @iterator
   * @for KdTree
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
 * Models the internal representation of KdTree's node.
 */
class Node {

  /**
   * @constructor
   * @for Node
   * @description
   * Constructs a subTree of the KdTree.
   * Performs a balanced construction:
   * - Choose a coordinate (according to node depth) and use it for all the comparisons below
   * - Looks for the median, and assign it to this newly created node.
   * - Partition the remaining points so that on the left are all the ones smaller than the median, and the remaining on the right.
   * - Recursively build left and right branches.
   *
   * @param {!Array<Point>} points The points to be added to this subtree.
   * @param {!number} dimensionality The number of dimensions of the space containing the points.
   * @param {?number} depth The depth of the current node (root is at depth 0).
   */
  constructor(points, dimensionality, depth = 0) {
    _depth.set(this, depth);
    _K.set(this, dimensionality);

    switch (points.length) {
      case 0:
        _point.set(this, undefined);
        _size.set(this, 0);
        _left.set(this, undefined);
        _right.set(this, undefined);
        break;
      case 1:
        _point.set(this, points[0]);
        _size.set(this, 1);
        //Children are leaves
        _left.set(this, Node.Empty(dimensionality, depth + 1));
        _right.set(this, Node.Empty(dimensionality, depth + 1));
        break;
      default:
        let [med, left, right] = median(points, Node.keyByDim(this.dim));
        _point.set(this, med);
        _left.set(this, new Node(left, dimensionality, depth + 1));
        _right.set(this, new Node(right, dimensionality, depth + 1));
        _size.set(this, 1 + _left.get(this).size + _right.get(this).size);
        break;
    }
  }

  /**
   * @name Empty
   * @static
   * @for Node
   * @description
   * Static method shortcut to create an empty node (i.e. a "leaf marker" for the tree).
   *
   * @param {!number} dimensionality The number of dimensions of the space containing the points.
   * @param {?number} depth The depth of the current node (root is at depth 0).
   * @returns {Node} The new node created.
   */
  static Empty(dimensionality, depth) {
    return new Node([], dimensionality, depth);
  }

  /**
   * @name Leaf
   * @static
   * @for Node
   * @description
   * Static method shortcut to create a leaf node (i.e. a node hosting a point and with no left and right branches).
   *
   * @param {!Point} point The point that this leaf will hold.
   * @param {!number} dimensionality The number of dimensions of the space containing the points.
   * @param {?number} depth The depth of the current node (root is at depth 0).
   * @returns {Node} The new node created.
   */
  static Leaf(point, dimensionality, depth) {
    return new Node([point], dimensionality, depth);
  }

  /**
   * @name keyByDim
   * @static
   * @for Node
   * @description
   * Create a function that, given a point, returns the key to be used in comparisons for the point: in this case the ith
   * coordinate for the point.
   *
   * @param {!number} dim The index of the coordinate to be extracted from the point.
   * @returns {function} A function that can be used for extracting keys from points (Will be passed to partitioning and sorting methods).
   */
  static keyByDim(dim) {
    return p => p.coordinate(dim);
  }

  /**
   * @name point
   * @getter
   * @for Node
   *
   * @returns {Point|undefined} Returns the point stored in the node, or undefined if none is.
   */
  get point() {
    return _point.get(this);
  }

  /**
   * @name size
   * @getter
   * @for Node
   *
   * @returns {number} Returns the number of points stored in the subtree rooted at this node.
   */
  get size() {
    return _size.get(this);
  }

  /**
   * @name height
   * @getter
   * @for Node
   *
   * @returns {number} Returns the number of levels in the subtree rooted at this node. Leaves have height 1 by definition.
   */
  get height() {
    var height;

    if (this.isEmpty()) {
      height = 0;
    } else if (this.isLeaf()) {
      height = 1;
    } else {
      height = 1 + Math.max(this.left.height, this.right.height);
    }
    return height;
  }

  /**
   * @name depth
   * @getter
   * @for Node
   *
   * @returns {number} Returns the depth of this node.
   */
  get depth() {
    return _depth.get(this);
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
    return this.size === 1;
  }

  /**
   * @name isEmpty
   * @for Node
   * @description
   * Check if this node is empty.
   *
   * @returns {number} Returns true if this node is empty, which means:
   *                    - Its size is exactly 0.
   *                    - Its left and right branches are undefined.
   *                    - It hosts no point (this.point === undefined).
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * @name left
   * @getter
   * @for Node
   *
   * @returns {Node|undefined} Returns the root of the left subtree.
   */
  get left() {
    return _left.get(this);
  }

  /**
   * @name right
   * @getter
   * @for Node
   *
   * @returns {Node|undefined} Returns the root of the right subtree.
   */
  get right() {
    return _right.get(this);
  }

  /**
   * @name dim
   * @getter
   * @for Node
   *
   * @returns {number} Returns the index of the coordinate that should be used to compare any point to the one stored in
   *                   this node (this value being dependent on the depth of the node).
   */
  get dim() {
    return this.depth % _K.get(this);
  }

  /**
   * @name contains
   * @for Node
   * @description
   * Check whether the point is stored in the subtree rooted at this node.
   *
   * @param {!Point} point The point to check.
   * @returns {boolean} True iff the argument belongs to the tree.
   */
  contains(point) {
    let found = false;
    if (!this.isEmpty()) {
      if (this.point.equals(point)) {
        found = true;
      } else {
        let key = Node.keyByDim(this.dim);
        let branch = key(point) <= key(this.point) ? _left.get(this) : _right.get(this);
        found = branch.contains(point);
      }
    }
    return found;
  }

  /**
   * @name add
   * @for Node
   * @description
   * Add a point to the subtree rooted at this node, if it doesn't already contain a point with the same coordinates.
   *
   * @param {!Point} point The point to add to the tree.
   * @returns {boolean} True iff the point wasn't already in the tree.
   */
  add(point) {
    let added = false;
    if (this.isEmpty()) {
      _point.set(this, point);
      _left.set(this, Node.Empty(point.dimensionality, this.depth + 1));
      _right.set(this, Node.Empty(point.dimensionality, this.depth + 1));
      _size.set(this, 1);
      added = true;
    } else if (!this.point.equals(point)) {
      let key = Node.keyByDim(this.dim);
      if (key(point) <= key(this.point)) {
        added = _left.get(this).add(point);
      } else {
        added = _right.get(this).add(point);
      }
      if (added) {
        _size.set(this, this.size + 1);
      }
    }
    return added;
  }

  /**
   * @name delete
   * @for Node
   * @description
   * Delete a point from the subtree rooted at this node.
   *
   * @param {!Point} point The point to delete from the tree.
   * @returns {boolean} True iff the point was indeed in the tree and has been deleted.
   */
  delete(point) {
    let deleted = false;
    if (!this.isEmpty()) {
      let dimIndex = this.dim;
      if (this.point.equals(point)) {
        deleted = true;

        if (this.isLeaf()) {
          this._eraseLeaf();
        } else if (this.right.isEmpty()) {
          let minNode = this.left.findMinNode(dimIndex);
          _point.set(this, minNode.point);
          _size.set(this, this.size - 1);
          _right.set(this, _left.get(this));
          this.right.delete(minNode.point);
        } else {
          let minNode = this.right.findMinNode(dimIndex);
          _point.set(this, minNode.point);
          _size.set(this, this.size - 1);
          this.right.delete(minNode.point);
        }
      } else {
        let key = Node.keyByDim(dimIndex);
        let branch = key(point) <= key(this.point) ? _left.get(this) : _right.get(this);
        deleted = branch.delete(point);
        if (deleted) {
          _size.set(this, this.size - 1);
        }
      }
    }
    return deleted;
  }

  /**
   * @name _eraseLeaf
   * @for Node
   * @private
   * @description
   * Utility function that transform current node from a Leaf to an Empty node. If current node is not a leaf, throws an error.
   */
  _eraseLeaf() {
    if (this.isLeaf()) {
      _point.set(this, undefined);
      _size.set(this, 0);
      _left.set(this, undefined);
      _right.set(this, undefined);
    } else {
      throw new Error('Internal representation error');
    }
  }

  /**
   * @name findMinNode
   * @for Node
   * @description
   * Return the min point in the subTree rooted at the current node, according to the dimensionality searchDim.
   *
   * @param {!number} searchDim The index of the dimensionality that should be used for comparisons.
   * @returns {*|undefined} The min node found, or undefined if the current node is a leaf marker.
   */
  findMinNode(searchDim) {
    let result;

    if (this.isEmpty()) {
      result = undefined;
    } else if (this.isLeaf()) {
      result = this;
    } else if (this.dim === searchDim) {
      result = this.left.findMinNode(searchDim) || this;
    } else {
      let key = Node.keyByDim(searchDim);
      result = this;

      let leftMinNode = this.left.findMinNode(searchDim);
      if (leftMinNode && key(leftMinNode.point) < key(this.point)) {
        result = leftMinNode;
      }

      let rightMinNode = this.right.findMinNode(searchDim);
      if (rightMinNode && key(rightMinNode.point) < key(result.point)) {
        result = rightMinNode;
      }
    }
    return result;
  }

  /**
   * @name findMaxNode
   * @for Node
   * @description
   * Return the max point in the subTree rooted at the current node, according to the dimensionality searchDim.
   *
   * @param {!number} searchDim The index of the dimensionality that should be used for comparisons.
   * @returns {*|undefined} The max node found, or undefined if the current node is a leaf marker.
   */
  findMaxNode(searchDim) {
    let result;

    if (this.isEmpty()) {
      result = undefined;
    } else if (this.isLeaf()) {
      result = this;
    } else if (this.dim === searchDim) {
      result = this.right.findMaxNode(searchDim) || this;
    } else {
      let key = Node.keyByDim(searchDim);
      result = this;

      let rightMaxNode = this.right.findMaxNode(searchDim);
      if (rightMaxNode && key(rightMaxNode.point) > key(this.point)) {
        result = rightMaxNode;
      }

      let leftMaxNode = this.left.findMaxNode(searchDim);
      if (leftMaxNode && key(leftMaxNode.point) > key(result.point)) {
        result = leftMaxNode;
      }
    }
    return result;
  }

  /**
   * @name nearestNeighbour
   * @for Node
   * @description
   * Find the nearest neightbour for the point in input, among the points stored in the subtree rooted at this node.
   *
   * @param {!Point} target The point whose nearest neighbour we need to find.
   * @param {?Point} nn The closest point found so far.
   * @param {?number} nnDist The distance of the best point found so far.
   * @returns {[Point, number]} A tuple with the closest point found in this subtree and its distance.
   */
  nearestNeighbour(target, nn = undefined, nnDist = Number.POSITIVE_INFINITY) {
    if (!this.isEmpty()) {
      let key = Node.keyByDim(this.dim);

      let d = this.point.distanceTo(target);
      let closestBranch, furtherBranch;

      if (d < nnDist) {
        nnDist = d;
        nn = this.point;
      }

      if (key(target) <= key(this.point)) {
        closestBranch = this.left;
        furtherBranch = this.right;
      } else {
        closestBranch = this.right;
        furtherBranch = this.left;
      }

      [nn, nnDist] = closestBranch.nearestNeighbour(target, nn, nnDist);

      if (Math.abs(key(target) - key(this.point)) < nnDist) {
        [nn, nnDist] = furtherBranch.nearestNeighbour(target, nn, nnDist);
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
   * @param {!Point} center The center of the desired hypersphere.
   * @param {!number} radius The radius of the hypersphere.
   * @returns {Generator<Point>}  Will yield the points in the tree that are inside the hypersphere centered at center and with given radius.
   */
  *pointsWithinDistanceFrom(center, radius) {
    if (!this.isEmpty()) {
      let key = Node.keyByDim(this.dim);

      let d = this.point.distanceTo(center);
      let closestBranch, furtherBranch;

      if (d <= radius) {
        yield this.point;
      }

      if (key(center) <= key(this.point)) {
        closestBranch = this.left;
        furtherBranch = this.right;
      } else {
        closestBranch = this.right;
        furtherBranch = this.left;
      }

      yield* closestBranch.pointsWithinDistanceFrom(center, radius);

      if (Math.abs(key(center) - key(this.point)) <= radius) {
        yield* furtherBranch.pointsWithinDistanceFrom(center, radius);
      }
    }
  }

  /**
   * @name pointsInRegion
   * @for KdTree
   * @description
   * Selects all the points in the tree that lie inside a hypercube aligned with Cartesian versors.
   * The hypercube is described by providing two of its opposite corners, and in particular the one with all the
   * smallest coordinates, and the one with all the largest ones.
   * For example, in the 2D space, if (x1,y1) and (x2,y2) are those cornes, it MUST hold x1 < x2 && y1 < y2.
   * The space considered is always the cartesian space, so for 2D picture the bottom corner as the bottom-left one, and the
   * top corner as the top-right one.
   *
   * @param {!Cube} targetRegion An hypercube defining the region of space where we should look for points.
   * @param {!Cube} subTreeRegion The hypercube defining the region of space covered by the subtree rooted at this node.
   * @returns {Generator<Point>} The points within the selected region of (hyper)space.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_CUBE) if the input is not a valid hypercube.
   */
  *pointsInRegion(targetRegion, subTreeRegion) {
    if (!this.isEmpty()) {
      if (targetRegion.contains(subTreeRegion)) {
        yield* this;
      } else if (targetRegion.intersects(subTreeRegion)) {
        let dim = this.dim;
        let key = Node.keyByDim(dim);
        if (key(this.point) < key(targetRegion.bottom)) {
          //We only need to check to the right of this node
          let rightRegion = subTreeRegion.intersectWithBottomBound(this.point, dim);
          yield* this.right.pointsInRegion(targetRegion, rightRegion);
        } else if (key(this.point) > key(targetRegion.top)) {
          //We only need to check to the left of this node
          let leftRegion = subTreeRegion.intersectWithTopBound(this.point, dim);
          yield* this.left.pointsInRegion(targetRegion, leftRegion);
        } else {
          //This point is inside the projection of the target region on the dim-th axes, so must check both sides
          let leftRegion = subTreeRegion.intersectWithTopBound(this.point, dim);
          yield* this.left.pointsInRegion(targetRegion, leftRegion);
          if (targetRegion.containsPoint(this.point)) {
            yield this.point;
          }
          let rightRegion = subTreeRegion.intersectWithBottomBound(this.point, dim);
          yield* this.right.pointsInRegion(targetRegion, rightRegion);
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
    if (!this.isEmpty()) {
      yield* this.left;
      yield this.point;
      yield* this.right;
    }
  }
}

export default KdTree;