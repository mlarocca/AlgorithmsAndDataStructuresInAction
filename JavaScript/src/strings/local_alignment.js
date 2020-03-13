import { isString } from '../common/strings.js'
import { isFunction } from '../common/basic.js'
import { isNumber } from '../common/numbers.js'
import { ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';

const _costMatch = new WeakMap();
const _costGap = new WeakMap();
const _placeHolder = new WeakMap();

/**
 *
 * @param {string} pattern The first string to align.
 * @param {string} text The text to which the pattern needs to be aligned.
 * @param {number[][]} similarityMatrix The cost matrix computed using Needleman-Wunsch algorithm.
 * @param {function<string, string, number>} costMatch A function taking as input two characters and returning a number.
 *      For matching character it is expected to return a non-negative values, while a non-positive value should be
 *      returned for mismatches.
 * @param {number} costGap The cost of inserting a gap. It's supposed to be negative.
 * @param initialRow The row index of the starting cell, i.e. the cell with the max similarity.
 * @param initialCol The col index of the starting cell.
 * @param {string} placeholder The placeholder character to be used in the alignments. Must have length 1.
 * @returns {{pattern: string, text: string}} A pair of strings to represent the best local alignment, wrapped in an POJO.
 */
function reconstructAlignment(pattern, text, similarityMatrix, costMatch, costGap, initialRow, initialCol, placeholder) {
  'use strict';
  let alignedPattern = [];
  let alignedText = [];

  while (similarityMatrix[initialRow][initialCol] > 0) {
    // simMatrix[0][j] and simMatrix[i][0] are set to 0 at initialization simMatrix[i][j] > 0 => i > 0 && j > 0
    const costWithMatch = similarityMatrix[initialRow - 1][initialCol - 1] + costMatch(pattern[initialRow - 1], text[initialCol - 1]);
    const costWithDelete = similarityMatrix[initialRow - 1][initialCol] + costGap;
    const costWithInsert = similarityMatrix[initialRow][initialCol - 1] + costGap;

    if (costWithMatch >= costWithInsert && costWithMatch >= costWithDelete) {
      alignedPattern.push(pattern[--initialRow]);
      alignedText.push(text[--initialCol]);
    } else if (costWithDelete > costWithInsert) {
      alignedPattern.push(pattern[--initialRow]);
      alignedText.push(placeholder);
    } else {
      alignedPattern.push(placeholder);
      alignedText.push(text[--initialCol]);
    }
  }

  return {
    pattern: alignedPattern.reverse().join(''),
    text: alignedText.reverse().join('')
  };
}

/**
 * @class LocalAlignment
 * Implements the Smith-Waterman algorithm for global string alignment.
 */
class LocalAlignment {
  /**
   * @constructor
   * @for LocalAlignment
   * @description
   * Create an instance of the Smith-Waterson algorithm with given parameters.
   *
   * @param {function<string, string, number>} costMatch A function taking as input two characters and returning a number.
   *      For matching character it is expected to return a non-negative values, while a non-positive value should be
   *      returned for mismatches.
   * @param {number} costGap The cost of inserting a gap. It's supposed to be negative.
   * @param {?string} placeholder The placeholder character to be used in the alignments. Must have length 1.
   *                              The default value is '-'.
   */
  constructor(costMatch, costGap, placeholder = '-') {
    if (!isFunction(costMatch)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costMatch', costMatch, 'function'));
    }
    if (!isNumber(costGap)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costGap', costGap, 'number'));
    }

    if (!isString(placeholder) || placeholder.length !== 1) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'placeholder', placeholder, 'string[1]'));
    }

    _costMatch.set(this, costMatch);
    _costGap.set(this, costGap);
    _placeHolder.set(this, placeholder);
  }

  /**
   * @name alignment
   * @for LocalAlignment
   * @description
   * Computes the alignment between the two strings, using the Needleman-Wunsch algorithm with quadratic memory usage.
   *
   * @param {string} pattern The first string to align.
   * @param {string} text The text to which the pattern needs to be aligned.
   * @returns {{pattern: string, text: string, similarity: number}}
   */
  alignment(pattern, text) {
    if (!isString(pattern)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'pattern', pattern, 'string'));
    }
    if (!isString(text)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'text', text, 'string'));
    }

    const costMatch = _costMatch.get(this);
    const costGap = _costGap.get(this);

    const n = pattern.length + 1;
    const m = text.length + 1;
    const similarityMatrix = new Array(n);

    let maxSimilarity = 0;
    let maxSimRow = 0;
    let maxSimCol = 0;

    for (let i = 0; i < n; i++) {
      similarityMatrix[i] = new Array(m);
      similarityMatrix[i][0] = 0;
    }

    for (let j = 0; j < m; j++) {
      similarityMatrix[0][j] = 0;
    }

    for (let i = 1; i < n; i++) {
      for (let j = 1; j < m; j++) {
        const costWithSub = similarityMatrix[i - 1][j - 1] + costMatch(pattern[i - 1], text[j - 1]);
        const costWithIns = similarityMatrix[i][j - 1] + costGap;
        const costWithDel = similarityMatrix[i - 1][j] + costGap;
        const val = similarityMatrix[i][j] = Math.max(costWithSub, costWithIns, costWithDel, 0);
        if (val > maxSimilarity) {
          maxSimCol = j;
          maxSimRow = i;
          maxSimilarity = val;
        }
      }
    }

    const alignment = reconstructAlignment(
      pattern,
      text,
      similarityMatrix,
      costMatch,
      costGap,
      maxSimRow,
      maxSimCol,
      _placeHolder.get(this));

    alignment.similarity = maxSimilarity;

    return alignment;
  }
}

export default LocalAlignment;