import { isObject } from './basic';
import { ERROR_MSG_RANDOM_STRING_LENGTH, ERROR_MSG_RANDOM_STRING_TOO_LARGE } from './errors.js';

const ASCII_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\ \t\n';
const ASCII_ALPHABET_LENGTH = ASCII_ALPHABET.length;


const respondsToToJson = (obj) => {
  return isObject(obj)
    && obj.hasOwnProperty('toJson')
    && isFunction(obj.toJson)
    && obj.toJson.length === 0;
};

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
  if (!isObject(key)) {
    return JSON.stringify(key);
  } else if (Array.isArray(key)) {
    return JSON.stringify(key.map(consistentStringify));
  } else if (respondsToToJson(key)) {
    return key.toJson();
  } else if (key instanceof Set) {
    return `Set(${consistentStringify([...key].sort())})`;
  } else if (key instanceof Map) {
    return `Map(${consistentStringify([...key.entries()].sort())})`;
  } else {
    // WeakMap and WeakSet are not iterable -_-
    return `{${Object.keys(key).sort().map((k) => `${consistentStringify(k)}:${consistentStringify(key[k])}`).join(',')}}`;
  }
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