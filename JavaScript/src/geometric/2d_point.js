import Point from './point.js';

const _x = new WeakMap();
const _y = new WeakMap();

/**
 * @class Point2D
 * @description
 * Models a 2D Point in the Cartesian plane.
 */
class Point2D extends Point {
  /**
   * @constructor
   * @for Point2D
   * @description
   * Build a 2D Point from x and y coordinates.
   * If coordinates are not numbers, throws a TypeError.
   *
   * @param {number} x The x coordinate.
   * @param {number} y The y coordinate.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if either coordinate isn't valid.
   */
  constructor(x, y) {
    super(x, y);
    _x.set(this, x);
    _y.set(this, y);
  }

  /**
   * @name validatePoint
   * @for Point2D
   * @description
   * Validates a point (2D), and throws an error if the validation fails.
   *
   * @param {Point2D} maybePoint The point to validate.
   * @param {?string} fname The name of the caller function, for logging purposes.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the coordinates aren't valid.
   */
  static validatePoint(maybePoint, fname = 'validatePoint') {
    super.validatePoint(maybePoint, 2, fname);
  }

  /**
   * @name random
   * @static
   * @for Point2D
   * @description
   * Create a random Point2D.
   * The values for the coordinates are independent random real numbers between Number.MIN_SAFE_INTEGER
   * and Number.MAX_SAFE_INTEGER;
   *
   * @return {Point} A new random point.
   */
  static random() {
    return new Point2D(...Point.random(2).coordinates());
  }

  /**
   * @name x
   * @for Point2D
   * @description
   * Getter for the x coordinate.
   *
   * @returns {number} The value of the x coordinate for the point.
   */
  get x() {
    return _x.get(this);
  }

  /**
   * @name y
   * @for Point2D
   * @description
   * Getter for the y coordinate.
   *
   * @returns {number} The value of the y coordinate for the point.
   */
  get y() {
    return _y.get(this);
  }
}

export default Point2D;