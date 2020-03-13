import { identity } from './basic.js';
import { isNumber, randomInt } from './numbers.js';
import { setDifference } from './set.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_ARGUMENT_TYPE, ERROR_MSG_PARAM_EMPTY_ARRAY } from './errors.js';
import { consistentStringify } from './strings.js';

/**
 * @name mean
 * @description
 * Computes the mean of an array of numbers.
 *
 * @param {!Array<number>} values A non-empty array of numbers.
 * @returns {number} The mean of the input.
 */
export function mean(values) {
  if (!Array.isArray(values) || !values.every(v => isNumber(v))) {
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('mean', 'values', values, 'Array<number>'));
  }
  let n = values.length;
  if (n === 0) {
    throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('mean', 'values'));
  }
  return values.reduce((tot, v) => tot + v) / n;
}

/**
 * @name variance
 * @description
 * Computes the variance for an array of numbers.
 *
 * @param {!Array<number>} values A non-empty array of numbers.
 * @returns {number} The variance of the input.
 */
export function variance(values) {
  if (!Array.isArray(values) || !values.every(v => isNumber(v))) {
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('variance', 'values', values, 'Array<number>'));
  }
  let n = values.length;
  if (n === 0) {
    throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('variance', 'values'));
  }
  let m = mean(values);
  return 1 / n * values.reduce((tot, v) => {
    let d = v - m;
    return tot + d * d;
  }, 0);
}

/**
 * @name arrayMin
 * @description
 * Finds the min value in a numeric array.
 *
 * @param {Array} values A non-empty array of numbers.
 * @param {function?} key A function mapping elements to keys.
 * @returns {value: number, index: number} A pair with the min value in the array and its index.
 */
export function arrayMin(values, { key = identity } = {}) {
  if (!Array.isArray(values) || !values.every(v => isNumber(key(v)))) {
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('arrayMin', '[values, key]', [values, key], '[Array<T>, Function<T, number>]'));
  }
  let n = values.length;
  if (n === 0) {
    throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('arrayMin', 'values'));
  }

  let [min, index] = values.reduce(([min, index], v, i) => {
    if (key(v) < min) {
      index = i;
      min = key(v);
    }
    return [min, index];
  }, [Number.MAX_VALUE, 0]);

  return {
    value: values[index],
    index: index
  };
}

/**
 * @name arrayMax
 * @description
 * Finds the max value in a numeric array.
 *
 * @param {Array} values A non-empty array of numbers.
 * @param {function?} key A function mapping elements to keys.
 * @returns {value: number, index: number} A pair with the max value in the array and its index.
 */
export function arrayMax(values, { key = identity } = {}) {
  if (!Array.isArray(values) || !values.every(v => isNumber(key(v)))) {
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('arrayMax', '[values, key]', [values, key], '[Array<T>, Function<T, number>]'));
  }
  let n = values.length;
  if (n === 0) {
    throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('arrayMax', 'values'));
  }

  let [max, index] = values.reduce(([max, index], v, i) => {
    if (key(v) > max) {
      index = i;
      max = key(v);
    }
    return [max, index];
  }, [Number.MIN_VALUE, 0]);

  return {
    value: values[index],
    index: index
  };
}

/**
 * Returns a random element chosen from an array passed as argument.
 *
 * @param {?number} b The upper boundary for the range of possible values (by default, the max positive safe integer).
 * @returns {*} A random element of the array
 * @throws {TypeError(ERROR_MSG_INVALID_ARGUMENT)} If values is not an array, or if it is empty.
 */
export function choose(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('choose', 'values', values));
  }
  return values[randomInt(0, values.length)];
}

/**
 *
 * @param {T[]} a1
 * @param {R[]} a2
 * @returns {[T, R][]}
 */
export function zip(a1, a2) {
  if (!Array.isArray(a1)) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('zip', 'a1', a1));
  }
  if (!Array.isArray(a2)) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('zip', 'a2', a2));
  }
  if (a1.length !== a2.length) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('zip', '(a1,a2)', `(${a1},${a2})`));
  }
  return a1.map((x, i) => [x, a2[i]]);
}

export function compareAsSets(array1, array2, key = consistentStringify) {
  if (!Array.isArray(array1)) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('compareAsSets', 'array1', array1));
  }
  if (!Array.isArray(array2)) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('compareAsSets', 'array2', array2));
  }
  let set1 = new Set(array1.map(key));
  let set2 = new Set(array2.map(key));
  return setDifference(set1, set2).size === 0 && setDifference(set2, set1).size === 0;
}

export function compareAsLists(array1, array2, key = consistentStringify) {
  if (!Array.isArray(array1)) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('compareAsLists', 'array1', array1));
  }
  if (!Array.isArray(array2)) {
    throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('compareAsLists', 'array2', array2));
  }
  if (array1.length !== array2.length) {
    return false;
  }
  array1 = array1.map(key);
  array2 = array2.map(key);
  return zip(array1, array2).every((a, b) => a === b);
}