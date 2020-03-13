import { isNumber, range } from '../common/numbers.js';
import { mean } from '../common/array.js';
import { isUndefined } from '../common/basic.js';
import { ERROR_MSG_INVALID_DIMENSION_INDEX, ERROR_MSG_PARAM_EMPTY_ARRAY, ERROR_MSG_PARAM_TYPE } from '../common/errors.js';

const _coordinates = new WeakMap();
const _K = new WeakMap();

/**
 * @name validateCoordinates
 * @private
 * @description
 * Validates a sequence of coordinates, and throws an error if the validation fails.
 *
 * @param {?string} fname The name of the caller function, for logging purposes.
 * @param {*number} A list of K coordinates.
 * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the coordinates aren't valid.
 */
/* jshint ignore:start */
function validateCoordinates(fname = 'validateCoordinates', ...coordinates) {

  let valid = coordinates.length > 0 && coordinates.every(_ => isNumber(_));
  if (!valid) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE(fname, 'coordinates', coordinates, 'sequence of numbers'));
  }
}
/* jshint ignore:end */

const ERROR_MSG_PARAM_INVALID_POINT = (fname, val, dimension, pname = 'point') =>
  `Illegal argument for ${fname}: ${pname} = ${val} must be of class Point${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;

/**
 * @class Point
 * @description
 * Models a Point in the K-dimensional Cartesian space.
 */
class Point {
  /**
   * @constructor
   * @for Point
   * @description
   * Build a Point from its coordinates.
   * If coordinates are not numbers, or none is passed, it throws a TypeError.
   *
   * @param {*number} coordinates The list of coordinates for the point.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if no coordinate is passed or any of the coordinates isn't valid.
   */
  constructor(...coordinates) {
    validateCoordinates('constructor', ...coordinates);
    _K.set(this, coordinates.length);
    _coordinates.set(this, coordinates.slice());
  }

  /**
   * @name validatePoint
   * @static
   * @for Point
   * @description
   * Validates a point, and throws an error if the validation fails.
   *
   * @param {Point} maybePoint The point to validate.
   * @param {?number} dimensionality The dimensionality of the space the point should belong to. By default it's assumed to be the
   *                                 input point's own dimensionality, but can be explicitly demanded.
   * @param {?string} fname The name of the caller function, for logging purposes.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the coordinates aren't valid.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the dimensionality parameter isn't a positive safe integer.
   */
  static validatePoint(maybePoint, dimensionality = maybePoint ? maybePoint.dimensionality : undefined, fname = 'validatePoint') {
    let invalid = true;
    if (maybePoint instanceof Point) {
      if (Number.isSafeInteger(dimensionality) && dimensionality > 0) {
        if (dimensionality === maybePoint.dimensionality) {
          validateCoordinates(fname, ...maybePoint.coordinates());
          invalid = false;
        }
      } else {
        throw new TypeError(ERROR_MSG_PARAM_TYPE(fname, 'dimensionality', dimensionality, 'positive integer'));
      }
    }

    if (invalid) {
      throw new TypeError(ERROR_MSG_PARAM_INVALID_POINT(fname, maybePoint, dimensionality));
    }
  }

  /**
   * @name validatePointArray
   * @static
   * @for Point
   * @description
   * Validates a points array, and throws an error if the validation fails.
   *
   * @param {Array<Point>} maybePointsArray The array of points to validate.
   * @param {?number} dimensionality Optionally, it is possible to specify what is the expected dimensionality for the points.
   *                                 All the points need to have the same dimensionality, so by default it is used
   *                                 the dimensionality of the first point.
   * @param {?string} fname The name of the caller function, for logging purposes.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the argument is not an array, or any point contains invalid coordiantes.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if one of the array entries is not a valid point.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the dimensionality parameter isn't a positive safe integer.
   */
  static validatePointArray(maybePointsArray, dimensionality, fname = 'validatePointArray') {
    if (Array.isArray(maybePointsArray)) {
      if (isUndefined(dimensionality)) {
        try {
          dimensionality = maybePointsArray[0].dimensionality;
        } catch (_) {
          //Nothing to do, array might be empty, otherwise validation will fail for the first point.
        }
      } else if (!Number.isSafeInteger(dimensionality) || dimensionality <= 0) {
        throw new TypeError(ERROR_MSG_PARAM_TYPE(fname, 'dimensionality', dimensionality, 'positive integer'));
      }
      maybePointsArray.forEach(_ => Point.validatePoint(_, dimensionality, fname));
    } else {
      throw new TypeError(ERROR_MSG_PARAM_TYPE(fname, 'maybePointsArray', maybePointsArray, 'array'));
    }
  }

  /**
   * @name centroid
   * @static
   * @for Point
   * @description
   * Validates a points array, and throws an error if the validation fails.
   *
   * @param {Array<Point>} pointsArray The array of points to validate.

   * @param {?string} fname The name of the caller function, for logging purposes.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the argument is not an array, or any point contains invalid coordiantes.
   * @throws TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY) if the argument is an empty array.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if any of the array entries is not a valid point.
   */
  static centroid(pointsArray, fname = 'centroid') {
    Point.validatePointArray(pointsArray, undefined, fname);
    if (pointsArray.length === 0) {
      throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY(fname, 'pointsArray'));
    }
    let cs = range(0, pointsArray[0].dimensionality).map(d => mean(pointsArray.map(p => p.coordinate(d))));
    return new Point(...cs);
  }

  /**
   * @name random
   * @static
   * @for Point
   * @description
   * Create a random point with the given number of coordinates. The values for the coordinates are independent random
   * real numbers between Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER;
   *
   * @param {number} dimensionality The expected dimensionality for the points.
   * @param {?string} fname The name of the caller function, for logging purposes.
   * @return {Point} A new random point.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the dimensionality parameter isn't a positive safe integer.
   */
  static random(dimensionality, fname = 'random') {
    if (!Number.isSafeInteger(dimensionality) || dimensionality <= 0) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE(fname, 'dimensionality', dimensionality, 'positive integer'));
    }
    let cs = range(0, dimensionality).map(_ => (Math.random() - 0.5) * 2 * Number.MAX_SAFE_INTEGER);
    return new Point(...cs);
  }

  /**
   * @name zero
   * @static
   * @for Point
   * @description
   * Create a point representing the origin of an hyperspace with k dimensions;
   *
   * @param {number} dimensionality The expected dimensionality for the points.
   * @param {?string} fname The name of the caller function, for logging purposes.
   * @return {Point} The origin for R^k.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the dimensionality parameter isn't a positive safe integer.
   */
  static zero(dimensionality, fname = 'zero') {
    if (!Number.isSafeInteger(dimensionality) || dimensionality <= 0) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE(fname, 'dimensionality', dimensionality, 'positive integer'));
    }
    let cs = range(0, dimensionality).map(_ => 0);
    return new Point(...cs);
  }

  /**
   * @name coordinates
   * @for Point
   * @description
   * Returns all coordinates for the point.
   *
   * @returns {Array<number>} A shallow copy of the coordinates array.
   */
  coordinates() {
    return _coordinates.get(this).slice();
  }

  /**
   * @name coordinate
   * @for Point
   * @description
   * Returns the ith coordinate for the point.
   *
   * @param {number} dim Which coordinate should be selected.
   * @returns {[number, number]} A shallow copy of the coordinates array.
   * @throws TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX) if the argument not a valid dimension for this point, i.e. an
   *                                                      integer between 0 and dimensionality-1.
   */
  coordinate(dim) {
    if (!Number.isSafeInteger(dim) || dim < 0 || dim >= this.dimensionality) {
      throw new TypeError(ERROR_MSG_INVALID_DIMENSION_INDEX('coordinate', dim, this.dimensionality));
    }

    return this.coordinates()[dim];
  }

  /**
   * @name dimensionality
   * @for Point
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
   * @name distanceTo
   * @for Point
   * @description
   * Compute the distance between this point and another point in the same (hyper)space.
   * The metric used is the Euclidean distance in a K-dimensional space.
   *
   * @param {Point} other The point whose distance should be computed.
   * @returns {number} The value of the Euclidean distance between the two points.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point of the same dimensionality of
   *                                                  of the current one.
   */
  distanceTo(other) {
    Point.validatePoint(other, this.dimensionality, 'distanceTo');
    let c1 = this.coordinates();
    let c2 = other.coordinates();
    let deltas = c1.map((c, index) => {
      let d = c - c2[index];
      return d * d;
    });

    return Math.sqrt(deltas.reduce((tot, x) => tot + x));
  }

  /**
   * @name maxDistance
   * @for Point
   * @description
   * Check an array of Points to find the one with the bigger distance.
   *
   * @param {Array<Point>} pointsArray The list of points to check.
   * @returns {[Point, number]} A tuple with 2 elements:
   *                            - The furthest point in input, with respect to the current one;
   *                            - The distance of the furthest point above.
   */
  maxDistance(pointsArray) {
    Point.validatePointArray(pointsArray, this.dimensionality, 'maxDistance');
    if (pointsArray.length === 0) {
      throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('maxDistance', 'pointsArray'));
    }
    return pointsArray.reduce(([maxPoint, maxDist], p) => {
      let d = this.distanceTo(p);
      if (d > maxDist) {
        maxDist = d;
        maxPoint = p;
      }
      return [maxPoint, maxDist];
    }, [null, -1]);
  }

  /**
   * @name minDistance
   * @for Point
   * @description
   * Check an array of Points to find the one with the smaller distance.
   *
   * @param {Array<Point>} pointsArray The list of points to check.
   * @returns {[Point, number]} A tuple with 2 elements:
   *                            - The closest point in input, with respect to the current one;
   *                            - The distance of the closest point above.
   */
  minDistance(pointsArray) {
    Point.validatePointArray(pointsArray, this.dimensionality, 'minDistance');
    if (pointsArray.length === 0) {
      throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('minDistance', 'pointsArray'));
    }
    return pointsArray.reduce(([maxPoint, maxDist], p) => {
      let d = this.distanceTo(p);
      if (d < maxDist) {
        maxDist = d;
        maxPoint = p;
      }
      return [maxPoint, maxDist];
    }, [null, Number.POSITIVE_INFINITY]);
  }

  /**
   * @name equals
   * @for Point
   * @description
   * Check if a second point is equal to the current one. Two points are considered equals if they have the same
   * dimensionality and, for each coordinate, their coordinates values match.
   *
   * @param {Point} other The point to be compared to this one.
   * @returns {boolean} True iff the points are equals, false otherwise.
   */
  equals(other) {
    let eq = false;
    if (other instanceof Point && other.dimensionality === this.dimensionality) {
      let c1 = this.coordinates();
      let c2 = other.coordinates();
      eq = c1.every((c, index) => c === c2[index]);
    }
    return eq;
  }

  /**
   * @name toString
   * @for Point
   * @override
   * @description
   * Provide a string representation of the point.
   *
   * @returns {string} A proper, human readable string representation of the point.
   */
  toString() {
    return `(${this.coordinates().map(_ => _.toString()).join(',')})`;
  }
}

export default Point;