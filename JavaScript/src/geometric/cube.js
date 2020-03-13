import Point from './point.js';
import { isUndefined } from '../common/basic.js';
import { range } from '../common/numbers.js';
import { ERROR_MSG_INVALID_DIMENSION_INDEX, ERROR_MSG_PARAM_TYPE } from '../common/errors.js';

const _bottom = new WeakMap();
const _top = new WeakMap();
const _K = new WeakMap();

const ERROR_MSG_PARAM_INVALID_VERTICES = (fname, v1, v2) =>
  `Illegal argument for ${fname}: vertex ${v1.toString()} is not stricly lower than vertex ${v2.toString()}`;

const ERROR_MSG_PARAM_INVALID_CUBE = (fname, val, dimension, pname = 'cube') =>
  `Illegal argument for ${fname}: ${pname} = ${val} must be of class Cube${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;

function validateVertices(bottomVertex, topVertex, fname = 'validateVertices') {
  Point.validatePoint(bottomVertex, undefined, fname);
  Point.validatePoint(topVertex, bottomVertex.dimensionality, fname);
  let bottomCs = bottomVertex.coordinates();
  let topCs = topVertex.coordinates();
  if (!bottomCs.every((bottomCVal, index) => bottomCVal < topCs[index])) {
    throw new TypeError(ERROR_MSG_PARAM_INVALID_VERTICES(fname, bottomVertex, topVertex));
  }
}

/**
 * @class Cube
 * @description
 * Models a KD Point in the Cartesian plane.
 */
class Cube {
  /**
   * @constructor
   * @for Cube
   * @description
   * Build a hypercube whose hyperplanes are parallel to the space versors.
   * Because its orientation is restricted, we just need 2 of its opposite vertices to describe it, in particular the one
   * with all the smallest coordinates, and the une with all the largest ones.
   * F.i. for a square in 2D Cartesian plane: we can just use bottom-left and top-right corners.
   *
   * @param {!Point} bottomVertex.
   * @param {!Point} topVertex.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the Vertices are not valid points.
   */
  constructor(bottomVertex, topVertex) {
    validateVertices(bottomVertex, topVertex, 'Cube.constructor');
    _K.set(this, bottomVertex.dimensionality);
    _bottom.set(this, bottomVertex);
    _top.set(this, topVertex);
  }

  /**
   * @name validateCube
   * @static
   * @for Cube
   * @description
   * Validates a point, and throws an error if the validation fails.
   *
   * @param {!Cube} maybeCube The cube to validate.
   * @param {?number} dimensionality The dimensionality of the space the cube should belong to. By default it's assumed to be the
   *                                 input point's own dimensionality, but can be explicitly demanded.
   * @param {?string} fname The name of the caller function, for logging purposes.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_CUBE) if the first argument is not a valid cube.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if dimensionality is passed but it's not a positive integer.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if either of the extremes of the cube isn't a valid point or if they have
   *                                                  different dimensionality.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_VERTICES) if each one of the bottom vertex's coordinates aren't lower
   *                                                     than each one of the corresponding top vertex coordinate.
   */
  static validateCube(maybeCube, dimensionality = maybeCube && maybeCube.dimensionality, fname = 'validateCube') {
    let invalid = true;
    if (maybeCube instanceof Cube) {
      if (Number.isSafeInteger(dimensionality) && dimensionality > 0) {
        if (dimensionality === maybeCube.dimensionality) {
          validateVertices(maybeCube.bottom, maybeCube.top, fname);
          invalid = false;
        }
      } else {
        throw new TypeError(ERROR_MSG_PARAM_TYPE(fname, 'dimensionality', dimensionality, 'positive integer'));
      }
    }

    if (invalid) {
      throw new TypeError(ERROR_MSG_PARAM_INVALID_CUBE(fname, maybeCube, dimensionality));
    }
  }

  /**
   * @name R
   * @for Cube
   * @description
   * Create a cube for R^k, the whole set of points in the Real space of dimension k.
   *
   * @param {!number} dimensionality The dimension of the space that will be created.
   * @returns {Cube} The cube representing R^k.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if dimensionality isn't a positive integer.
   */
  static R(dimensionality) {
    if (Number.isSafeInteger(dimensionality) && dimensionality > 0) {
      let bottom = new Point(...range(0, dimensionality).map(_ => Number.NEGATIVE_INFINITY));
      let top = new Point(...range(0, dimensionality).map(_ => Number.POSITIVE_INFINITY));
      return new Cube(bottom, top);
    } else {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('R', 'dimensionality', dimensionality, 'positive integer'));
    }
  }

  /**
   * @name intersectWithTopBound
   * @for Cube
   * @description
   * Set an upper bound for the kth coordinate value on the top vertex.
   * For example, in 2D, if c = [(0,0) -> (4,4)], and we set the bound for the first coordinate to 2, the new point
   * returned will be c' = [(0,0) -> (2,4)].
   * Cubes are immutable, so a new cube will be created and returned, while current one won't be changed.
   *
   * @param {!Point} point A point, describing the upper bound for the given dimension.
   * @param {!number} dim Which coordinate we should use.
   * @returns {Cube} A new Cube with the new coordinates.
   * @throws TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX) if dim is not an integer between 0 and K-1, where K is the
   *                                                      dimensionality of the current Cube.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if either of the extremes of the cube isn't a valid point or if they have
   *                                                  different dimensionality.
   */
  intersectWithTopBound(point, dim) {
    Point.validatePoint(point, this.dimensionality, 'Cube.intersectWithTopBound');

    if (!Number.isSafeInteger(dim) || dim < 0 || dim >= this.dimensionality) {
      throw new TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithTopBound', dim, this.dimensionality));
    }

    let topCs = this.top.coordinates();
    //Invariant: coordinates return a shallow copy of the coordinates array for a point
    topCs[dim] = Math.min(topCs[dim], point.coordinate(dim));
    return new Cube(this.bottom, new Point(...topCs));
  }


  /**
   * @name intersectWithBottomBound
   * @for Cube
   * @description
   * Set a lower bound for the kth coordinate value on the bottom vertex.
   * For example, in 2D, if c = [(0,0) -> (4,4)], and we set the bound for the first coordinate to 2, the new point
   * returned will be c' = [(2,0) -> (4,4)].
   * Cubes are immutable, so a new cube will be created and returned, while current one won't be changed.
   *
   * @param {!Point} point A point, describing the lower bound for the given dimension.
   * @param {!number} dim Which coordinate we should use.
   * @returns {Cube} A new Cube with the new coordinates.
   * @throws TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX) if dim is not an integer between 0 and K-1, where K is the
   *                                                      dimensionality of the current Cube.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if either of the extremes of the cube isn't a valid point or if they have
   *                                                  different dimensionality.
   */
  intersectWithBottomBound(point, dim) {
    Point.validatePoint(point, this.dimensionality, 'Cube.intersectWithBottomBound');

    if (!Number.isSafeInteger(dim) || dim < 0 || dim >= this.dimensionality) {
      throw new TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX('Cube.intersectWithBottomBound', dim, this.dimensionality));
    }

    let bottomCs = this.bottom.coordinates();
    //Invariant: coordinates return a shallow copy of the coordinates array for a point
    bottomCs[dim] = Math.max(bottomCs[dim], point.coordinate(dim));
    return new Cube(new Point(...bottomCs), this.top);
  }

  get bottom() {
    return _bottom.get(this);
  }

  get top() {
    return _top.get(this);
  }

  /**
   * @name dimensionality
   * @for Cube
   * @getter
   * @description
   * Returns the dimensionality of this point, i.e. the number of dimensions of the (hyper)space the point
   * belongs to (f.i. 2 for 2D space, and so on).
   *
   * @returns {number} The dimensionality of this point.
   */
  get dimensionality() {
    return _K.get(this);
  }

  /**
   * @name equals
   * @for Cube
   * @description
   * Check if a second cube is equal to the current one. Two cubes are considered equals if they have the same dimensionality
   * and their vertices are equals.
   *
   * @param {!Cube} other The cube to be compared to this one.
   * @returns {boolean} True iff the cubes are equals, false otherwise.
   */
  equals(other) {
    let eq = false;
    if (other instanceof Cube && other.dimensionality === this.dimensionality) {
      eq = this.bottom.equals(other.bottom) && this.top.equals(other.top);
    }
    return eq;
  }

  /**
   * @name contains
   * @for Cube
   * @description
   * Check if this cube entirely contains another cube, i.e. every point belonging to the second cube (including its
   * edges and vertices) belongs to this cube as well.
   *
   * @param {!Cube} other The other cube to check.
   * @returns {boolean} true iff other is entirely contained in this.
   */
  contains(other) {
    Cube.validateCube(other, this.dimensionality, 'contains');
    return this.containsPoint(other.bottom) && this.containsPoint(other.top);
  }

  /**
   * @name intersects
   * @for Cube
   * @description
   * Check if this cube intersects another cube, i.e. at least one point belonging to the second cube belongs to
   * this cube as well.
   * This relation between cubes is reflexive, i.e. if a intersects b then b intersects a.
   *
   * @param {!Cube} other The other cube to check.
   * @returns {boolean} true iff other intersects this.
   */
  intersects(other) {
    Cube.validateCube(other, this.dimensionality, 'intersects');
    return range(0, this.dimensionality).every(d => {
      let bottomC = this.bottom.coordinate(d);
      let topC = this.top.coordinate(d);
      let otherBottomC = other.bottom.coordinate(d);
      let otherTopC = other.top.coordinate(d);
      return (bottomC <= otherBottomC && otherBottomC <= topC) || (bottomC <= otherTopC && otherTopC <= topC) ||
        (otherBottomC <= bottomC && bottomC <= otherTopC) || (otherBottomC <= topC && topC <= otherTopC);
    });
  }

  /**
   * @name containsPoint
   * @for Cube
   * @description
   * Check if this cube contains a single given point.
   *
   * @param {!Point} point The point to check.
   * @returns {boolean} true iff point belongs to this cube.
   */
  containsPoint(point) {
    Point.validatePoint(point, this.dimensionality, 'containsPoint');
    let eq = false;
    if (point instanceof Point && point.dimensionality === this.dimensionality) {
      let bottomCs = this.bottom.coordinates();
      let topCs = this.top.coordinates();
      let pointCS = point.coordinates();
      eq = bottomCs.every((c, i) => c <= pointCS[i]) && topCs.every((c, i) => c >= pointCS[i]);
    }
    return eq;
  }

  /**
   * @name toString
   * @for Cube
   * @override
   * @description
   * Provide a string representation of the cube.
   *
   * @returns {string} A proper, human readable string representation of the cube.
   */
  toString() {
    return `[${this.bottom.toString()} -> ${this.top.toString()}]`;
  }
}

export default Cube;