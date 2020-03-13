import { isString, isNonEmptyString } from '../common/strings.js';
import { isUndefined } from '../common/basic.js';
import { ERROR_MSG_PARAM_TYPE } from '../common/errors.js';

const _root = new WeakMap();
const _size = new WeakMap();
const _value = new WeakMap();

const ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING = (fname, val, pname = 'key') => `Illegal argument for ${fname}: ${pname} = ${val} must be a non-empty string`;

/**
 * @class Trie
 *
 * External API for a trie.
 * Strings can be stored and optionally associated with values.
 */
class Trie {
  constructor() {
    _root.set(this, new TrieNode());
  }

  /**
   * @name put
   * @for Trie
   * @description
   * Store a key-value pair into the trie.
   *
   * @param {!string} key A non empty-string.
   * @param {?*} val Optionally, a value can be associated with the key. Can be any value but `undefined`.
   *                 By default, `null` is used.
   * @returns {Trie} The trie itself, to allow method chaining.
   * @throws {TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING)} If the argument is not a non-empty string.
   */
  put(key, val = null) {
    if (!isNonEmptyString(key)) {
      throw new TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('put', key));
    }
    _root.get(this).put(key, val);

    return this;
  }

  /**
   * @name get
   * @for Trie
   * @description
   * Return the value associated with the key passed, if it is stored in the trie. Otherwise, on miss, it returns `undefined`.
   *
   * @param {!string} key A non empty-string.
   * @returns {Trie} The value associated with the key, or undefined, if the key it's not stored on the trie.
   * @throws {TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING)} If the argument is not a non-empty string.
   */
  get(key) {
    if (!isNonEmptyString(key)) {
      throw new TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('get', key));
    }

    return _root.get(this).get(key);
  }

  /**
   * @name delete
   * @for Trie
   * @description
   * Remove the key (and its value) from the trie.
   *
   * @param {!string} key A non empty-string.
   * @returns {boolean} true iff the key was successfully deleted from the tree, false if it wan't found or an error happened.
   * @throws {TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING)} If the argument is not a non-empty string.
   */
  delete(key) {
    if (!isNonEmptyString(key)) {
      throw new TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('delete', key));
    }

    return _root.get(this).delete(key)[0];
  }

  /**
   * @name contains
   * @for Trie
   * @description
   * Check if the given key is stored in the trie.
   *
   * @param {!string} key A non empty-string.
   * @returns {boolean} true iff the key is currently stored in the trie.
   * @throws {TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING)} If the argument is not a non-empty string.
   */
  contains(key) {
    if (!isNonEmptyString(key)) {
      throw new TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('contains', key));
    }
    return _root.get(this).contains(key);
  }

  /**
   * @name isEmpty
   * @for Trie
   * @description
   * Check if the trie is empty.
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * @name size
   * @for Trie
   * @getter
   * @description
   * The number of keys currently stored in the trie.
   *
   * @returns {number}
   */
  get size() {
    return _root.get(this).size;
  }

  /**
   * @name longestPrefixOf
   * @for Trie
   * @description
   * Search the trie for the longest key that is a prefix of s.
   *
   * @param {!string} s A non empty-string.
   * @returns {string} The (possibly empty) longest prefix of key stored in the trie.
   * @throws {TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING)} If the argument is not a non-empty string.
   */
  longestPrefixOf(s) {
    if (!isNonEmptyString(s)) {
      throw new TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING('longestPrefixOf', s, 's'));
    }

    return _root.get(this).longestPrefixOf(s) || '';
  }

  /**
   * @name keysWithPrefix
   * @for Trie
   * @description
   * Search the trie for all the keys for which the s is a valid prefix.
   *
   * @param {!string} s A string, possibly empty.
   * @returns {Generator<string>} all the keys having s as a prefix
   * @throws {TypeError(ERROR_MSG_PARAM_TYPE)} If the argumentis not a string.
   */
  *keysWithPrefix(s) {
    if (!isString(s)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', s, 'string'));
    }

    let prefixNode = _root.get(this).getNode(s);
    if (!isUndefined(prefixNode)) {
      yield* prefixNode.keys([s]);
    }
  }

  /**
   * @name keys
   * @for Trie
   * @description
   * Iterates through all the keys in the trie.
   *
   * @returns {Generator<string>} all the keys in the trie.
   */
  *keys() {
    yield* _root.get(this).keys();
  }

  /**
   * @name items
   * @for Trie
   * @description
   * Iterates through all the keys in the trie, returning for each one of them the pair [key, value].
   * Note: you should use array destructuring to retrieve them.
   *
   * @returns {Generator<string, *>} all the (key, value) pairs in the trie.
   */
  *items() {
    yield* _root.get(this).items();
  }

  /**
   * Iterator - so trie can be used in for... of loops.
   */
  *[Symbol.iterator]() {
    yield* this.items();
  }
}

/**
 * @class TrieNode
 * @private
 *
 * Internal representation of a Trie.
 * Each node is in practice the root of its sub-trie.
 * It provides protected methods to search the trie and add new key-value pairs.
 * For most operations, along with a string for the key to be searched/deleted/inserted, an index is passed, to mark the
 * next character in the key that should be acted upon, rather than passing a substring with the first character removed.
 * For example, get('ab' will make a recursive call to get('ab', 1), instead that a call to get('b').
 * This is an optimization that allows keeping the asymptotic time required for each operation linear in the length of key.
 * Otherwise, as strings are immutable, creating a substring with just one less character than the original one is a linear
 * operation in the number of character copied, and a successful search would require n-1 + n-2 + n-3 + ... + 1 characters
 * copied, for a total of n*(n-1)/2 - hence, the running time would be quadratic in the length of the string.
 */
class TrieNode {

  /**
   * @constructor
   * @invariant key.length >= 0 && keyIndex <= key.length
   *
   * @param {?string} key The (possibly empty) string to be stored in the trie. Defaults to ''.
   * @param {!*} value The value to be associated with the key. Defaults to undefined.
   * @param {?number} keyIndex The index at which starts the substring of key to be stored in this subtrie.
   */
  constructor(key = '', value = undefined, keyIndex = 0) {
    this.links = {};
    if (keyIndex === key.length) {
      _size.set(this, 0);
      this.value = value;
    } else {
      _size.set(this, 1);
      this.links[key[keyIndex]] = new TrieNode(key, value, keyIndex + 1);
    }
  }

  /**
   * @name size
   * @getter
   * @description
   * Getter for the size of the trie.
   *
   * @returns {number} The size of this subtrie.
   */
  get size() {
    return _size.get(this);
  }

  /**
   * @name value
   * @getter
   * @description
   * Getter for the value of the trie.
   *
   * @returns {*} The value stored in this node.
   */
  get value() {
    return _value.get(this);
  }

  /**
   * @name value
   * @setter
   * @description
   * Setter for the value of the trie.
   *
   * @param {!*} val The value to store in the node.
   */
  set value(val) {
    _value.set(this, val);
  }

  /**
   * @name put
   * @for TrieNode
   * @description
   * Store a key-value pair into the trie.
   * @invariant key.length >= 0 && keyIndex <= key.length
   *
   * @param {!string} key A non empty-string.
   * @param {?*} value Can be any value but `undefined`.
   * @param {?number} keyIndex The index at which starts the substring of key to be stored in this subtrie.
   * @returns {boolean} true unless the key was already in the trie and got updated.
   * @throws {TypeError(ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING)} If the argument is not a non-empty string.
   */
  put(key, value, keyIndex = 0) {
    let isNewKey;

    if (keyIndex === key.length) {
      isNewKey = isUndefined(this.value);
      this.value = value;
    } else {
      let next = key[keyIndex];
      if (this.links.hasOwnProperty(next)) {
        isNewKey = this.links[next].put(key, value, keyIndex + 1);
        if (isNewKey) {
          _size.set(this, this.size + 1);
        }
      } else {
        _size.set(this, this.size + 1);
        this.links[next] = new TrieNode(key, value, keyIndex + 1);
        isNewKey = true;
      }
    }
    return isNewKey;
  }

  /**
   * @name get
   * @for TrieNode
   * @description
   * Return the value associated with the key passed, if it is stored in the subtrie. Otherwise, on miss, it returns `undefined`.
   * @invariant key.length >= 0 && keyIndex <= key.length
   *
   * @param {?string} key The (possibly empty) string to be looked for in the trie.
   * @param {?number} keyIndex The index at which starts the substring of key to be looked for in this subtrie.
   * @return {*} The value associated with the key, or undefined in the key isn't stored on the trie.
   */
  get(key, keyIndex = 0) {
    let node = this.getNode(key, keyIndex);
    return node && node.value;
  }

  /**
   * @name getNode
   * @for TrieNode
   * @description
   * Return the node associated with the key passed, if it is stored in the subtrie. Otherwise, on miss, it returns `undefined`.
   * @invariant key.length >= 0 && keyIndex <= key.length
   *
   * @param {?string} key The (possibly empty) string to be looked for in the trie.
   * @param {?number} keyIndex The index at which starts the substring of key to be looked for in this subtrie.
   * @return {TrieNode|undefined} The value associated with the key, or undefined in the key isn't stored on the trie.
   */
  getNode(key, keyIndex = 0) {
    let result;
    if (keyIndex === key.length) {
      result = this;
    } else {
      let next = key[keyIndex];
      if (this.links.hasOwnProperty(next)) {
        result = this.links[next].getNode(key, keyIndex + 1);
      }
    }
    return result;
  }

  /**
   * @name contains
   * @for TrieNode
   * @description
   * Check if the given key is stored in the trie.
   *
   * @param {?string} key The (possibly empty) string to be looked for in the subtrie.
   * @returns {boolean} true iff the key is currently stored in the trie.
   */
  contains(key) {
    return !isUndefined(this.get(key));
  }

  /**
   * @name delete
   * @for TrieNode
   * @description
   * Remove the key (and its value) from the subtrie.
   * if all the links in the deleted node are null, we need to remove the node from the data structure. If doing so
   * leaves all the links null in its parent, we need to remove that node, and so forth.
   *
   * @param {!string} key A non empty-string.
   * @param {?number} keyIndex The index at which starts the substring of key contained in this subtrie.
   * @returns {[boolean, boolean]} The first boolean is true iff the key was successfully deleted from the tree,
   *                               false if it wan't found or an error happened.
   *                               The second one is true iff the node doesn't have any child anymore.
   */
  delete(key, keyIndex = 0) {
    let [deleted, empty] = [false, false];

    if (keyIndex === key.length) {
      deleted = !isUndefined(this.value);

      if (deleted) {
        this.value = undefined;
        if (this.size === 0) {
          empty = true;
        }
      }
    } else {
      let next = key[keyIndex];
      if (this.links.hasOwnProperty(next)) {
        [deleted, empty] = this.links[next].delete(key, keyIndex + 1);
        if (deleted) {
          _size.set(this, this.size - 1);
        }
        if (empty) {
          delete this.links[next];
          empty = this.size === 0 && isUndefined(this.value);
        }
      }
    }

    return [deleted, empty];
  }

  /**
   * @name longestPrefixOf
   * @for TrieNode
   * @description
   * Return the longest prefix of the input s associated with the key passed, if it is stored in the subtrie. Otherwise, on miss, it returns `undefined`.
   * @invariant s.length >= 0 && sIndex <= s.length
   *
   * @param {?string} s The (possibly empty) prefix to be looked for in the trie.
   * @param {?number} sIndex The index at which starts the substring of string to be looked for in this subtrie.
   * @return {*} The value associated with the key, or undefined in the key isn't stored on the trie.
   */
  longestPrefixOf(s, sIndex = 0) {
    let result;
    if (sIndex === s.length) {
      if (!isUndefined(this.value)) {
        result = s;
      }
    } else {
      let next = s[sIndex];
      if (this.links.hasOwnProperty(next)) {
        result = this.links[next].longestPrefixOf(s, sIndex + 1);
        if (isUndefined(result) && !isUndefined(this.value)) {
          result = s.substr(0, sIndex);
        }
      }
    }
    return result;
  }

  /**
   * @name items
   * @for TrieNode
   * @description
   * Iterate through all the key-value pairs stored in the trie.
   *
   * @param {?Array<string>} path The array of characters found in a path from the root of the trie to this node.
   *                         Merging the array will give the key for current node.
   * @returns {Generator<string, *>} all the (key, value) pairs in the subtrie.
   */
  *items(path = []) {
    if (!isUndefined(this.value)) {
      yield {
        key: path.join(''),
        value: this.value
      };
    }
    for (let c of Object.keys(this.links).sort()) {
      path.push(c);
      yield* this.links[c].items(path);
      path.pop();
    }
  }

  /**
   * @name keys
   * @for TrieNode
   * @description
   * Iterate through all the keys pairs stored in the trie.
   *
   * @param {?Array<string>} path The array of characters found in a path from the root of the trie to this node.
   *                         Merging the array will give the key for current node.
   * @returns {Generator<string>} all the keys in this subtrie.
   */
  *keys(path = []) {
    for (let { key, _ } of this.items(path)) {
      yield key;
    }
  }
}

export default Trie;