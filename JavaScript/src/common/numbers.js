import {
    ERROR_MSG_RANGE_LOWER,
    ERROR_MSG_RANGE_UPPER,
    ERROR_MSG_RANGE_STEP,
    ERROR_MSG_RANGE_BOUNDARIES,
    ERROR_MSG_RANGE_TOO_LARGE
} from './errors.js';

/**
 * @name isNumber
 * @description
 * Check if the input is a valid number representation.
 *
 * @param {!*} maybeNumber The value to check.
 * @returns {boolean} true iff `maybeNumber` is a number.
 */
export function isNumber(maybeNumber) {
    return !Number.isNaN(parseFloat(maybeNumber));
}

/**
 * @name toNumber
 * @description
 * Check if the input is a valid number representation, and if so converts it to float.
 *
 * @param {!*} maybeNumber The value to convert.
 * @returns {number|null} null iff `maybeNumber` is NOT a number, its float value otherwise.
 */
export function toNumber(maybeNumber) {
    return isNumber(maybeNumber) ? parseFloat(maybeNumber) : null;
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