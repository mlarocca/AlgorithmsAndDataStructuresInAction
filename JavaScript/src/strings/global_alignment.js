import { isString } from '../common/strings.js'
import { isNumber } from '../common/numbers.js'
import { ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';

const _costSubstitute = new WeakMap();
const _costInsert = new WeakMap();
const _costDelete = new WeakMap();
const _placeHolder = new WeakMap();

/**
 * @name reconstructAlignment
 * @for GlobalAlignment
 * @private
 * @description
 * Starting from the class parameters and the computed Cost Matrix, reconstructs (one of) the global alignment(s)
 * with minimal edit distance.
 *
 * @param {string} pattern The first string to align.
 * @param {string} text The text to which the pattern needs to be aligned.
 * @param {number[][]} costMatrix The cost matrix computed using Needleman-Wunsch algorithm.
 * @param {number} costSubstitute The cost of replacing two mismatching characters.
 * @param {number} costInsert The cost of inserting a character from text into pattern.
 * @param {number} costDelete The cost of deleting one character from pattern.
 * @param {string} placeholder The placeholder character to be used in the alignments. Must have length 1.
 * @returns {{pattern: string, text: string}} A pair of strings to represent the alignment, wrapped in an POJO.
 */
function reconstructAlignment(pattern, text, costMatrix, costSubstitute, costInsert, costDelete, placeholder) {
  'use strict';
  let alignedPattern = [];
  let alignedText = [];

  let i = pattern.length;
  let j = text.length;

  while (i > 0 && j > 0) {
    const costWithMatch = costMatrix[i - 1][j - 1] + (pattern[i - 1] === text[j - 1] ? 0 : costSubstitute);
    const costWithDelete = costMatrix[i - 1][j] + costDelete;
    const costWithInsert = costMatrix[i][j - 1] + costInsert;

    if (costWithMatch <= costWithInsert && costWithMatch <= costWithDelete) {
      alignedPattern.push(pattern[--i]);
      alignedText.push(text[--j]);
    } else if (costWithDelete < costWithInsert) {
      alignedPattern.push(pattern[--i]);
      alignedText.push(placeholder);
    } else {
      alignedPattern.push(placeholder);
      alignedText.push(text[--j]);
    }
  }

  while (i > 0) {
    // Delete prefix from pattern
    alignedText.push(placeholder);
    alignedPattern.push(pattern[--i]);
  }

  while (j > 0) {
    //Insert prefix from text
    alignedPattern.push(placeholder);
    alignedText.push(text[--j]);
  }

  return {
    pattern: alignedPattern.reverse().join(''),
    text: alignedText.reverse().join('')
  };
}

/**
 * @class GlobalAlignment
 * Implements the Needleman-Wunsch algorithm for global string alignment.
 */
class GlobalAlignment {
  /**
   * @constructor
   * @for GlobalAlignment
   * @description
   * Create an instance of the Needleman-Wunsch algorithm with given parameters.
   *
   * @param {number} costSubstitute The cost of replacing two mismatching characters.
   * @param {number} costInsert The cost of inserting a character from text into pattern.
   * @param {number} costDelete The cost of deleting one character from pattern.
   * @param {?string} placeholder The placeholder character to be used in the alignments. Must have length 1.
   *                              The default value is '-'.
   */
  constructor(costSubstitute, costInsert, costDelete, placeholder = '-') {
    if (!isNumber(costSubstitute)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costSubstitute', costSubstitute, 'number'));
    }
    if (!isNumber(costInsert)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costInsert', costInsert, 'number'));
    }
    if (!isNumber(costDelete)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costDelete', costDelete, 'number'));
    }

    if (!isString(placeholder) || placeholder.length !== 1) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'placeholder', placeholder, 'string[1]'));
    }

    _costSubstitute.set(this, costSubstitute);
    _costInsert.set(this, costInsert);
    _costDelete.set(this, costDelete);
    _placeHolder.set(this, placeholder);
  }

  /**
   * @name distance
   * @for GlobalAlignment
   * @description
   * Computes the edit distance between the two strings, using the Needleman-Wunsch algorithm with linear memory usage.
   *
   * @param {string} pattern The first string to align.
   * @param {string} text The text to which the pattern needs to be aligned.
   * @returns {number} The edit distance between the two strings.
   */
  distance(pattern, text) {
    if (!isString(pattern)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'pattern', pattern, 'string'));
    }
    if (!isString(text)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'text', text, 'string'));
    }

    const costSubstitute = _costSubstitute.get(this);
    const costInsert = _costInsert.get(this);
    const costDelete = _costDelete.get(this);

    const n = pattern.length + 1;
    const m = text.length + 1;
    let prevCol;
    let currentCol = new Array(n);

    for (let i = 0; i < n; i++) {
      currentCol[i] = i * costDelete;
    }

    for (let j = 1; j < m; j++) {
      prevCol = currentCol;
      currentCol = new Array(n);
      currentCol[0] = j * costInsert;
      for (let i = 1; i < n; i++) {
        const costWithSub = prevCol[i - 1] + (text[j - 1] === pattern[i - 1] ? 0 : costSubstitute);
        const costWithIns = prevCol[i] + costInsert;
        const costWithDel = currentCol[i - 1] + costDelete;
        currentCol[i] = Math.min(costWithSub, costWithIns, costWithDel);
      }
    }
    return currentCol[n - 1];
  }

  /**
   * @name alignment
   * @for GlobalAlignment
   * @description
   * Computes the alignment between the two strings, using the Needleman-Wunsch algorithm with quadratic memory usage.
   *
   * @param {string} pattern The first string to align.
   * @param {string} text The text to which the pattern needs to be aligned.
   * @returns {{pattern: string, text: string}}
   */
  alignment(pattern, text) {
    if (!isString(pattern)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'pattern', pattern, 'string'));
    }
    if (!isString(text)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'text', text, 'string'));
    }

    const costSubstitute = _costSubstitute.get(this);
    const costInsert = _costInsert.get(this);
    const costDelete = _costDelete.get(this);

    const n = pattern.length + 1;
    const m = text.length + 1;
    const costMatrix = new Array(n);

    for (let i = 0; i < n; i++) {
      costMatrix[i] = new Array(m);
      costMatrix[i][0] = i * costDelete;
    }

    for (let j = 0; j < m; j++) {
      costMatrix[0][j] = j * costInsert;
    }

    for (let i = 1; i < n; i++) {
      for (let j = 1; j < m; j++) {
        const costWithSub = costMatrix[i - 1][j - 1] + (text[j - 1] === pattern[i - 1] ? 0 : costSubstitute);
        const costWithIns = costMatrix[i][j - 1] + costInsert;
        const costWithDel = costMatrix[i - 1][j] + costDelete;
        costMatrix[i][j] = Math.min(costWithSub, costWithIns, costWithDel);
      }
    }

    return reconstructAlignment(pattern, text, costMatrix, costSubstitute, costInsert, costDelete, _placeHolder.get(this));
  }
}

export default GlobalAlignment;