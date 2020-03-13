import { ERROR_MSG_ARGUMENT_TYPE, ERROR_MSG_POSITION_OUT_OF_BOUNDARIES } from './errors.js';
import { randomInt } from './numbers.js';
import { identity } from './basic.js';

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
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('insertionSort', 'array', array, 'Array'));
  }
  if (!(key instanceof Function)) {
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('insertionSort', 'key', key, 'Function'));
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
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('randomizedSelect', 'array', array, 'Array'));
  }
  let [k, n] = [i - 1, array.length];
  if (!Number.isSafeInteger(i) || i <= 0 || i > n) {
    throw new TypeError(ERROR_MSG_POSITION_OUT_OF_BOUNDARIES('randomizedSelect', 'array', i));
  }
  if (!(key instanceof Function)) {
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('randomizedSelect', 'key', key, 'Function'));
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
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('median', 'array', array, 'Array'));
  }
  if (!(key instanceof Function)) {
    throw new TypeError(ERROR_MSG_ARGUMENT_TYPE('median', 'key', key, 'Function'));
  }

  let copy = Array.from(array);
  let n = copy.length;
  let m = Math.floor((n - 1) / 2) + 1;
  let median = randomizedSelect(copy, m, key);
  let left = copy.splice(0, m); //Remove all the elements till the median (included) from copy
  left.pop(); //Remove median from left

  return [median, left, copy];
}