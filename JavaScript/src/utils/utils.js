const ASCII_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\ \t\n';
const ASCII_ALPHABET_LENGTH = ASCII_ALPHABET.length;

const ERROR_MSG_RANDOM_STRING_LENGTH = val => `Illegal argument for randomString: length = ${val} must be a non-negative SafeInteger`;
const ERROR_MSG_RANDOM_STRING_TOO_LARGE = val => `Illegal argument for randomString: length ${val} is too large to be allocated`;
const ERROR_MSG_RANGE_LOWER = (fname, val) => `Illegal argument for ${fname}: a = ${val} must be a SafeInteger`;
const ERROR_MSG_RANGE_UPPER = (fname, val) => `Illegal argument for ${fname}: b = ${val} must be a SafeInteger`;
const ERROR_MSG_RANGE_STEP = (fname, val) => `Illegal argument for ${fname}: step = ${val} must be a positive SafeInteger`;
const ERROR_MSG_RANGE_BOUNDARIES = (fname, a, b) => `Illegal argument for ${fname}: must be a <[=] b, but ${a} >[=] ${b}`;
const ERROR_MSG_RANGE_TOO_LARGE = (fname, a, b) => `Illegal argument for ${fname}: range [${a}, ${b}] is too large to be allocated`;

//COMMON ERROR MESSAGES
export const ERROR_MSG_METHOD_UNIMPLEMENTED = (fname) => `Method ${fname} is yet to be implemented`;
export const ERROR_MSG_PARAM_TYPE = (fname, pname, val, type) => `Illegal argument for ${fname}: ${pname} = ${val} must be a ${type}`;
export const ERROR_MSG_PARAM_UNDEFINED = (fname, pname) => `Illegal argument for ${fname}: ${pname} must be defined`;
export const ERROR_MSG_PARAM_EMPTY_ARRAY = (fname, pname) => `Illegal argument for ${fname}: array ${pname} is empty`;
export const ERROR_MSG_TOO_FEW_ARGUMENTS = (fname, expected, actual) => `Not enough arguments for ${fname}: received ${actual} instead of ${expected}`;
export const ERROR_MSG_INDEX_OUT_OF_BOUNDARIES = (fname, pname, i) => `Index out of boudaries in ${fname} for ${pname}: ${i}`;
export const ERROR_MSG_POSITION_OUT_OF_BOUNDARIES = (fname, pname, i) => `Position out of boudaries in ${fname} for ${pname}: ${i}`;
export const ERROR_MSG_INVALID_DISTANCE = (fname, val, pname = 'distance') => `Illegal argument for ${fname}: ${pname} = ${val} must be a valid distance (a non-negative number)`;
export const ERROR_MSG_INVALID_DIMENSION_INDEX = (fname, val, dimensionality = 1) =>
  `Illegal argument for ${fname}: the dimension index must be an integer between 0 and ${dimensionality - 1}, instead ${val} was passed`;


/**
 * Identity function.
 * @param {*} _ Anything.
 * @return {*} The function's argument.
 */
export const identity = _ => _;

/**
 * @name consistentStringify
 * @description
 * To allow storing any object as a key, we need to standardize the way we treat and hash keys.
 * Strings are the preferred input for hash functions, so we stringify each string.
 * Unfortunately JSON.stringify on objects is non deterministic, as fields in the object can be saved in any order.
 * We therefore use an ad-hoc deterministic version, to solve this problem.
 * Object's fields are here sorted lexicographically,
 * so that {1:1, 2:2} and {2:2, 1:1} will always be translated to the same string.
 *
 * @param {*} key The key to be stringified.
 * @return {string} The stringified key.
 */
export function consistentStringify(key) {
  if (typeof key === 'object' && key !== null && !Array.isArray(key)) {
    return `{${Object.keys(key).sort().map((k) => `${consistentStringify(k)}:${consistentStringify(key[k])}`).join(',')}}`;
  } else {
    return JSON.stringify(key);
  }
}

/**
 * @name range
 * @description
 * Return an array of integers between a (included) and b (excluded).
 *
 * @param {!number} a The lower boundary for the range. Must be a safe integer.
 * @param {!number} b The upper boundary for the range. Must be a safe integer greater than or equal to `a`.
 * @param {?number} step The increment for elements in the range.
 * @returns {Array} An array with integers in the range [a, b[ (a included, b excluded) spaced by step.
 * @throws {TypeError(ERROR_MSG_RANGE_LOWER)} If a is not a SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_UPPER)} If b is not a SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_STEP)} If step is not a positive SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_BOUNDARIES)} If a < b.
 * @throws {RangeError(ERROR_MSG_RANGE_TOO_LARGE)} If the array [a ... b-1] is too big to be allocated.
 */
export function range(a, b, step = 1) {
  if (!Number.isSafeInteger(a)) {
    throw new TypeError(ERROR_MSG_RANGE_LOWER('range', a));
  }

  if (!Number.isSafeInteger(b)) {
    throw new TypeError(ERROR_MSG_RANGE_UPPER('range', b));
  }

  if (!Number.isSafeInteger(step) || step <= 0) {
    throw new TypeError(ERROR_MSG_RANGE_STEP('range', step));
  }

  if (a > b) {
    throw new TypeError(ERROR_MSG_RANGE_BOUNDARIES('range', a, b));
  }

  let len = 1 + Math.floor((b - a - 1) / step);
  try {
    return Array.from({ length: len }, (_, i) => a + i * step);
  } catch (e) {
    if (e instanceof RangeError) {
      throw new RangeError(ERROR_MSG_RANGE_TOO_LARGE('range', a, b));
    } else {
      throw e;
    }
  }
}

/**
 * @name xrange
 * @description
 * Generates all the integers between a (included) and b (excluded).
 *
 * @param {?number} a The lower boundary for the range. Must be a safe integer.
 * @param {?number} b The lower boundary for the range. Must be a safe integer greater than or equal to `a`.
 * @param {?number} step The increment for elements in the range.
 * @returns {generator} An array with integers in the range [æ, b[ (a included, b exclueded).
 * @throws {TypeError(ERROR_MSG_RANGE_LOWER)} If a is not a SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_UPPER)} If b is not a SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_STEP)} If step is not a positive SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_BOUNDARIES)} If a < b.
 * @throws {TypeError(ERROR_MSG_RANGE_TOO_LARGE)} If the array [a ... b-1] is too big to be allocated.
 */
export function* xrange(a, b, step = 1) {
  if (!Number.isSafeInteger(a)) {
    throw new TypeError(ERROR_MSG_RANGE_LOWER('xrange', a));
  }

  if (!Number.isSafeInteger(b)) {
    throw new TypeError(ERROR_MSG_RANGE_UPPER('xrange', b));
  }

  if (a > b) {
    throw new TypeError(ERROR_MSG_RANGE_BOUNDARIES('xrange', a, b));
  }

  if (!Number.isSafeInteger(step) || step <= 0) {
    throw new TypeError(ERROR_MSG_RANGE_STEP('xrange', step));
  }

  for (; a < b; a += step) {
    yield a;
  }
}

/**
 *
 * @param {?number} a The lower boundary for the range of possible values (by default, the min negative safe integer).
 * @param {?number} b The upper boundary for the range of possible values (by default, the max positive safe integer).
 * @returns {number} A random int between a (included) and b (excluded).
 * @throws {TypeError(ERROR_MSG_RANGE_LOWER)} If a is not a SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_UPPER)} If b is not a SafeInteger.
 * @throws {TypeError(ERROR_MSG_RANGE_BOUNDARIES)} If a < b.
 */
export function randomInt(a = Number.MIN_SAFE_INTEGER, b = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(a)) {
    throw new TypeError(ERROR_MSG_RANGE_LOWER('randomInt', a));
  }

  if (!Number.isSafeInteger(b)) {
    throw new TypeError(ERROR_MSG_RANGE_UPPER('randomInt', b));
  }

  if (a >= b) {
    throw new TypeError(ERROR_MSG_RANGE_BOUNDARIES('randomInt', a, b));
  }

  return a + Math.floor(Math.random() * (b - a));
}

/**
 * @name randomString
 * @description
 * Return a random string of `length` randomly chosen ASCII characters.
 * @param {!number} length The desired length: must be a non negative safe integer.
 * @returns {string} A random string.
 * @throws {TypeError(ERROR_MSG_RANDOM_STRING_LENGTH)} If length is not a non-neagative safe integer.
 * @throws {RangeError(ERROR_MSG_RANDOM_STRING_TOO_LARGE)} If length is not a non-neagative safe integer.
 */
export function randomString(length) {
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new TypeError(ERROR_MSG_RANDOM_STRING_LENGTH(length));
  }
  try {
    return Array.from({ length: length }, () => ASCII_ALPHABET[Math.floor(Math.random() * ASCII_ALPHABET_LENGTH)])
      .join('');
  } catch (e) {
    if (e instanceof RangeError) {
      throw new RangeError(ERROR_MSG_RANDOM_STRING_TOO_LARGE(length));
    } else {
      throw e;
    }
  }
}

/**
 * @name isNumber
 * @description
 * Check if the input is a valid number.
 *
 * @param {!*} maybeNumber The value to check.
 * @returns {boolean} true iff `maybeNumber` is a number.
 */
export function isNumber(maybeNumber) {
  return !Number.isNaN(parseFloat(maybeNumber));
}

/**
 * @name isString
 * @description
 * Check if the input is a valid string.
 *
 * @param {!*} maybeString The value to check.
 * @returns {boolean} true iff `maybeString` is a string.
 */
export function isString(maybeString) {
  return typeof maybeString === 'string';
}

/**
 * @name isNonEmptyString
 * @description
 * Check if the input is a valid non-empty string.

 * @param maybeString The value to check.
 * @returns {boolean} true iff `maybeString` is a string, and `maybeString` isn't the empty string.
 */
export function isNonEmptyString(maybeString) {
  return isString(maybeString) && maybeString.length > 0;
}

let checkArgumentsLength = (args, expectedArgsLength, fname) => {
  if (args.length >= expectedArgsLength) {
    return true;
  } else {
    throw new TypeError(ERROR_MSG_TOO_FEW_ARGUMENTS(fname, expectedArgsLength, args.length));
  }
};

/**
 * @name isUndefined
 * @description
 * Check if the input is undefined.

 * @param maybeUndefined The value to check.
 * @returns {boolean} true iff `maybeUndefined` is undefined.
 * @throws {TypeError(ERROR_MSG_TOO_FEW_ARGUMENTS)} if no argument is passed
 *
 */
export function isUndefined(maybeUndefined) {
  return maybeUndefined === void (0) && checkArgumentsLength(arguments, 1, 'isUndefined');
}

/**
 *
 * @name inPlaceInsertionSort
 * @description
 * Sort a portion of the input array in place using insertion sort.
 * WARNING: the input array will be modified.
 *
 * @param {!Array} array The array to sort.
 * @param {?function} key A function that takes as input any element of the array and returns a key
 *                        to be used for comparison.
 *                        By default the identity function is used (i.e. comparing elements directly).
 * @param {?number} left The index of the first element of the array to include in the portion to be sorted.
 * @param {?number} right The index of the last element of the array to include in the portion to be sorted.
 * @returns {Array} A reference to the input array.
 */
function inPlaceInsertionSort(array, key = identity, left = 0, right = array.length - 1) {
  for (let i = left + 1; i <= right; i++) {
    let current = array[i];
    let currentKey = key(current);
    let j;

    for (j = i - 1; j >= left && key(array[j]) > currentKey; j--) {
      array[j + 1] = array[j];
    }
    array[j + 1] = current;
  }
  return array;
}

/**
 * @name insertionSort
 * @description
 * Sort the input array in place using insertion sort.
 * WARNING: the input array will be modified.
 *
 * @param {!Array} array The array to sort.
 * @param {?function} key A function that takes as input any element of the array and returns a key
 *                        to be used for comparison.
 *                        By default the identity function is used (i.e. comparing elements directly).
 * @returns {Array} A reference to the input array.
 */
export function insertionSort(array, key = identity) {
  if (!Array.isArray(array)) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('insertionSort', 'array', array, 'Array'));
  }
  if (!(key instanceof Function)) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('insertionSort', 'key', key, 'Function'));
  }
  return inPlaceInsertionSort(array, key);
}

/**
 * @name partition
 * @description
 * Partition a portion of the input array, after selecting a random pivot.
 * Uses 3-way partitioning, grouping together all the elements equals to the pivot in the middle of the array.
 *
 * @param {!Array} array The array to partition.
 * @param {!number} left The index of the first element of the array to be included in the portion to partition.
 * @param {!number } right The index of the last element of the array to be included in the portion to partition.
 * @param {!function} key A function that takes as input any element of the array and returns a key
 *                        to be used for comparison.
 *                        By default the identity function is used (i.e. comparing elements directly).
 * @returns {[number, number]} The indices of the first and last occurrences of the pivot in the array.
 */
function partition(array, left, right, key) {
  if (right === left) {
    return [left, left];
  }
  let i = randomInt(left, right + 1);
  if (i !== left) {
    [array[i], array[left]] = [array[left], array[i]];
  }
  let lt = left;
  let gt = right;
  i = left + 1;

  let pivot = array[left];
  let pivotKey = key(pivot);

  while (i <= gt) {
    if (key(array[i]) < pivotKey) {
      [array[i], array[lt]] = [array[lt], array[i]];
      i += 1;
      lt += 1;
    } else if (key(array[i]) > pivotKey) {
      [array[i], array[gt]] = [array[gt], array[i]];
      gt -= 1;
    } else {
      i++;
    }
  }
  // Now array[left..lt-1] < pivot = array[lt..gt] < array[gt+1..right].
  partition(array, left, Math.max(left, lt - 1), key);
  partition(array, Math.min(gt + 1, right), right, key);
  return [lt, gt];
}

/**
 * @name _randomizedSelect
 * @description
 * Select the kth element of array, using the randomized selection algorithm derived from Quicksort.
 * @private
 * @invariant left >= 0
 * @invariant left <= right < array.length
 * @invariant left <= k <= right
 *
 * @param {!Array} array The array from which the elment should be selected.
 * @param {!number} k The index of the element we need to find.
 * @param {!number} left The index of the first element of the array to be included in the portion in which the kth element lies.
 * @param {!number } right The index of the last element of the array to be included in the portion in which the kth element lies.
 * @param {!function} key A function that takes as input any element of the array and returns a key
 *                        to be used for comparison.
 * @returns {*} The kth element in array.
 */
function _randomizedSelect(array, k, left, right, key) {
  var result;

  if (left === right) {
    result = array[left];
  } else {
    let [firstPivotIndex, lastPivotIndex] = partition(array, left, right, key);

    if (k < firstPivotIndex) {
      result = _randomizedSelect(array, k, left, firstPivotIndex - 1, key);
    } else if (k > lastPivotIndex) {
      result = _randomizedSelect(array, k, lastPivotIndex + 1, right, key);
    } else {
      result = array[k];
    }
  }
  return result;
}

/**
 * @name randomizedSelect
 * @description
 * Select the kth element of the input array, using the randomized selection algorithm derived from Quicksort.
 *
 * @param {!Array} array The array from which the elment should be selected.
 * @param {!number} i The position of the element we want to retrieve. Positions starts at 1, so the 1st element is at index 0.
 * @param {?function} key A function that takes as input any element of the array and returns a key
 *                        to be used for comparison.
 *                        By default the identity function is used (i.e. comparing elements directly).
 * @returns {*} The kth element in array.
 */
export function randomizedSelect(array, i, key = identity) {
  if (!Array.isArray(array)) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('randomizedSelect', 'array', array, 'Array'));
  }
  let [k, n] = [i - 1, array.length];
  if (!Number.isSafeInteger(i) || i <= 0 || i > n) {
    throw new TypeError(ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', i));
  }
  if (!(key instanceof Function)) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('randomizedSelect', 'key', key, 'Function'));
  }

  return _randomizedSelect(array, k, 0, n - 1, key);
}

/**
 * @name median
 * @description
 * Find the median of the array and split the array itself around that median.
 *
 * @param {!Array} array The array to split.
 * @param {?function} key A function that extracts the key for the elements in the array (by default it's the identity function).
 * @returns {[*, Array ,Array]} Structured return type: three elements are returned:
 *                                - The median.
 *                                - The elements smaller than the median.
 *                                - The elements larger than the median.
 */
export function median(array, key = identity) {
  if (!Array.isArray(array)) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('median', 'array', array, 'Array'));
  }
  if (!(key instanceof Function)) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('median', 'key', key, 'Function'));
  }

  let copy = Array.from(array);
  let n = copy.length;
  let m = Math.floor((n - 1) / 2) + 1;
  let median = randomizedSelect(copy, m, key);
  let left = copy.splice(0, m); //Remove all the elements till the median (included) from copy
  left.pop(); //Remove median from left

  return [median, left, copy];
}

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
    throw new TypeError(ERROR_MSG_PARAM_TYPE('mean', 'values', values, 'Array<number>'));
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
    throw new TypeError(ERROR_MSG_PARAM_TYPE('variance', 'values', values, 'Array<number>'));
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
 * @name minIndex
 * @description
 * Finds the index of the min value in a numeric array.
 *
 * @param {!number} values A non-empty array of numbers.
 * @returns {number} The index of the min value in the array.
 */
export function minIndex(values) {
  if (!Array.isArray(values) || !values.every(v => isNumber(v))) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('minIndex', 'values', values, 'Array<number>'));
  }
  let n = values.length;
  if (n === 0) {
    throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('minIndex', 'values'));
  }

  let [min, index] = values.reduce(([min, index], v, i) => {
    if (v < min) {
      index = i;
      min = v;
    }
    return [min, index];
  }, [Number.MAX_VALUE, 0]);
  return index;
}

/**
 * @name maxIndex
 * @description
 * Finds the index of the max value in a numeric array.
 *
 * @param {!number} values A non-empty array of numbers.
 * @returns {number} The index of the max value in the array.
 */
export function maxIndex(values) {
  if (!Array.isArray(values) || !values.every(v => isNumber(v))) {
    throw new TypeError(ERROR_MSG_PARAM_TYPE('maxIndex', 'values', values, 'Array<number>'));
  }
  let n = values.length;
  if (n === 0) {
    throw new TypeError(ERROR_MSG_PARAM_EMPTY_ARRAY('maxIndex', 'values'));
  }

  let [max, index] = values.reduce(([max, index], v, i) => {
    if (v > max) {
      index = i;
      max = v;
    }
    return [max, index];
  }, [Number.MIN_VALUE, 0]);
  return index;
}