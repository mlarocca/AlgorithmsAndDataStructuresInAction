import { isString, isNonEmptyString } from '../common/strings.js';
import { isUndefined } from '../common/basic.js';
import { ERROR_MSG_PARAM_TYPE } from '../common/errors.js';

const _root = new WeakMap();
const _size = new WeakMap();
const _value = new WeakMap();

const ERROR_MSG_PARAM_KEY_NON_EMPTY_STRING = (fname, val, pname = 'key') => `Illegal argument for ${fname}: ${pname} = ${val} must be a non-empty string`;

/**
 * @class RadixTree
 *
 * External API for a trie.
 * Strings can be stored and optionally associated with values.
 */
class RadixTree {
  constructor() {
    _root.set(this, new RadixTreeNode());
  }

  /**
   * @name put
   * @for RadixTree
   * @description
   * Store a key-value pair into the trie.
   *
   * @param {!string} key A non empty-string.
   * @param {?*} val Optionally, a value can be associated with the key. Can be any value but `undefined`.
   *                 By default, `null` is used.
   * @returns {RadixTree} The trie itself, to allow method chaining.
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
   * @for RadixTree
   * @description
   * Return the value associated with the key passed, if it is stored in the trie. Otherwise, on miss, it returns `undefined`.
   *
   * @param {!string} key A non empty-string.
   * @returns {RadixTree} The value associated with the key, or undefined, if the key it's not stored on the trie.
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
   * @for RadixTree
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
   * @for RadixTree
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
   * @for RadixTree
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
   * @for RadixTree
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
   * @for RadixTree
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
   * @for RadixTree
   * @description
   * Search the tree for all the keys for which s is a valid prefix.
   *
   * @param {!string} s A string, possibly empty.
   * @returns {Generator<string>} all the keys having s as a prefix
   * @throws {TypeError(ERROR_MSG_PARAM_TYPE)} If the argumentis not a string.
   */
  *keysWithPrefix(s) {
    if (!isString(s)) {
      throw new TypeError(ERROR_MSG_PARAM_TYPE('keysWithPrefix', 's', s, 'string'));
    }

    let [prefixNode, path] = _root.get(this).getNodeForPrefix(s);
    if (!isUndefined(prefixNode)) {
      yield* prefixNode.keys(path);
    }
  }

  /**
   * @name keys
   * @for RadixTree
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
   * @for RadixTree
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

function longestCommonPrefix(key, keyIndex, link) {
  let i = 0;
  let n = Math.min(key.length - keyIndex, link.length);
  while (i < n && key[keyIndex + i] === link[i]) {
    i += 1;
  }
  return link.substr(0, i);
}

/**
 * @class RadixTreeNode
 * @private
 *
 * Internal representation of a RadixTree.
 * Each node is in practice the root of its sub-tree.
 * It provides protected methods to search the tree and add new key-value pairs.
 * The difference with tries is that links' key can be strings instead of characters.
 * The links of a node are fully disjoint set, meaning that no link share a prefix with any other link in the same node.
 * When a new key is inserted. it might have a prefix in common with at most one single link in a node: in that case
 * the longest common prefix is extracted, a new link with that prefix will be added pointing to a new bridge node,
 * whose children will point to the original node, and to the newly created one (for the rest of the new key not matched
 * by the common prefix, if any).
 *
 * For most operations, along with a string for the key to be searched/deleted/inserted, an index is passed, to mark the
 * next character in the key that should be acted upon, rather than passing a substring with the first character removed.
 * For example, get('ab' will make a recursive call to get('ab', 1), instead that a call to get('b').
 * This is an optimization that allows keeping the asymptotic time required for each operation linear in the length of key.
 * Otherwise, as strings are immutable, creating a substring with just one less character than the original one is a linear
 * operation in the number of character copied, and a successful search would require n-1 + n-2 + n-3 + ... + 1 characters
 * copied, for a total of n*(n-1)/2 - hence, the running time would be quadratic in the length of the string.
 */
class RadixTreeNode {

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
    //We index key by their first char to optimize search, since no link can share a prefix with another key.
    this.linksByFirstChar = {};
    if (keyIndex === key.length) {
      this.size = 0;
      this.value = value;
    } else {
      let subKey = key.subStr(keyIndex);
      this.size = 1;
      this.linksByFirstChar[key[keyIndex]] = subKey;
      this.links[subKey] = new RadixTreeNode('', value);
    }
  }

  /**
   * @name size
   * @getter
   * @description
   * Getter for the size of the tree.
   *
   * @returns {number} The size of this subtree.
   */
  get size() {
    return _size.get(this);
  }

  /**
   * @name size
   * @getter
   * @description
   * Setter for the size of the tree.
   * 
   * @param {number} size The new value for size.
   */
  set size(size) {
    _size.set(this, size);
  }

  /**
   * @name value
   * @for Node
   * @getter
   * @description
   * Getter for the vaòue of the tree.
   *
   * @returns {*} The value stored in this node.
   */
  get value() {
    return _value.get(this);
  }


  /**
   * @name value
   * @for Node
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
   * @for RadixTreeNode
   * @description
   * Store a key-value pair into the tree.
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
      if (this.linksByFirstChar.hasOwnProperty(next)) {
        let link = this.linksByFirstChar[next];
        let commonPrefix = longestCommonPrefix(key, keyIndex, link);

        if (link === commonPrefix) {
          isNewKey = this.links[link].put(key, value, keyIndex + commonPrefix.length);
        } else {
          isNewKey = true;
          let bridgeNode = this.links[link]._createBridge(link.substr(commonPrefix.length));
          delete this.links[link];
          this.links[commonPrefix] = bridgeNode;
          this.linksByFirstChar[next] = commonPrefix;
          bridgeNode.put(key, value, keyIndex + commonPrefix.length);
        }
        if (isNewKey) {
          this.size += 1;
        }
      } else {
        let subKey = key.substr(keyIndex);
        this.size += 1;
        this.linksByFirstChar[next] = subKey;
        this.links[subKey] = new RadixTreeNode('', value);
        isNewKey = true;
      }
    }
    return isNewKey;
  }

  /**
   * @name _createBridge
   * @for RadixTreeNode
   * @pseudoprivate
   * @description
   * Create a bridge node for current node. A bridge node is an intermediate node that will "bridge the gap" between
   * current one and its parent; current node will be linked from the bridge node trough subKey.
   * @invariant subKey.length > 0
   *
   * @param {!string} subKey The key that will identify the path from the new bridge node to this one.
   * @returns {RadixTreeNode} The newly created node.
   */
  _createBridge(subKey) {
    let bridgeNode = new RadixTreeNode('');
    bridgeNode._initBridgeLinks(subKey, this);
    //The insertion is certainly a new key
    bridgeNode.size = 1 + this.size;
    return bridgeNode;
  }

  /**
   * @name _initBridgeLinks
   * @for RadixTreeNode
   * @pseudoprivate
   * @description
   * Add a link to an existing node, and
   *
   * @invariant: key.length > 0
   *
   * @param {!string} key The link between the two nodes.
   * @param {!RadixTreeNode} node The child node.
   */
  _initBridgeLinks(key, node) {
    this.links = {};
    this.linksByFirstChar = {};
    this.linksByFirstChar[key[0]] = key;
    this.links[key] = node;
  }

  /**
   * @name get
   * @for RadixTreeNode
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
   * @for RadixTreeNode
   * @description
   * Return the node associated with the key passed, if it is stored in the subtrie. Otherwise, on miss, it returns `undefined`.
   * @invariant key.length >= 0 && keyIndex <= key.length
   *
   * @param {?string} key The (possibly empty) string to be loooked for in the trie.
   * @param {?number} keyIndex The index at which starts the substring of key to be looked for in this subtrie.
   * @return {RadixTreeNode|undefined} The value associated with the key, or undefined in the key isn't stored on the trie.
   */
  getNode(key, keyIndex = 0) {
    let result;
    if (keyIndex === key.length) {
      result = this;
    } else {
      let next = key[keyIndex];
      if (this.linksByFirstChar.hasOwnProperty(next)) {
        let link = this.linksByFirstChar[next];
        let commonPrefix = longestCommonPrefix(key, keyIndex, link);
        if (commonPrefix === link) {
          result = this.links[link].getNode(key, keyIndex + link.length);
        }
      }
    }
    return result;
  }

  /**
   * @name getNodeForPrefix
   * @for RadixTreeNode
   * @description
   * If s is the prefix of any string stored in the tree, it returns the node where s would have
   * been stored. All children nodes of the one returned will contain suffixes of s.
   * Otherwise, on miss, it returns `undefined`.
   * @invariant key.length >= 0 && keyIndex <= key.length
   *
   * @param {?string} s The (possibly empty) string to be stored in the trie. Defaults to ''.
   * @param {?number} sIndex The index at which starts the substring of key to be looked for in this subtrie.
   * @return {[RadixTreeNode|undefined, Array[string]]} An array with 2 elements:
   *          - The node associated with the prefix, or undefined if the key isn't stored on the tree.
   *          - The path from the root to the node above.
   */
  getNodeForPrefix(s, sIndex = 0, path = []) {
    let node;
    let lenS = s.length;
    if (sIndex === lenS) {
      node = this;
    } else {
      let next = s[sIndex];
      if (this.linksByFirstChar.hasOwnProperty(next)) {
        let link = this.linksByFirstChar[next];
        let commonPrefix = longestCommonPrefix(s, sIndex, link);
        if (commonPrefix === link) {
          path.push(link);
          [node, path] = this.links[link].getNodeForPrefix(s, sIndex + link.length, path);
        } else if (sIndex + commonPrefix.length === lenS) {
          //In this case, even if there is no perfect match, `key` is a prefix of some string stored down the tree.
          path.push(link);
          node = this.links[link];
        }
      }
    }
    return [node, path];
  }

  /**
   * @name contains
   * @for RadixTreeNode
   * @description
   * Check if the given key is stored in the trie.
   *
   * @param {?string} key The (possibly empty) string to be looked for in the subtrie.
   * @returns {boolean} true iff the key is currently stored in the trie.
   */
  contains(key) {
    return !isUndefined(this.getNode(key));
  }

  /**
   * @name delete
   * @for RadixTreeNode
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
      if (this.linksByFirstChar.hasOwnProperty(next)) {
        let link = this.linksByFirstChar[next];
        let commonPrefix = longestCommonPrefix(key, keyIndex, link);
        if (link === commonPrefix) {
          [deleted, empty] = this.links[link].delete(key, keyIndex + commonPrefix.length);

          if (deleted) {
            this.size -= 1;
          }

          if (empty) {
            delete this.links[link];
            delete this.linksByFirstChar[next];
            empty = this.size === 0 && isUndefined(this.value);
          }
        }
      }
    }
    return [deleted, empty];
  }

  /**
   * @name longestPrefixOf
   * @for RadixTreeNode
   * @description
   * Return the longest prefix of the input s[sIndex:] stored in the subtree. Otherwise,
   * on miss, it returns `undefined`.
   * @invariant s.length >= 0 && sIndex <= s.length
   *
   * @param {?string} s The (possibly empty) string to be stored in the trie. Defaults to ''.
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
      if (this.linksByFirstChar.hasOwnProperty(next)) {
        let link = this.linksByFirstChar[next];
        let commonPrefix = longestCommonPrefix(s, sIndex, link);
        if (commonPrefix === link) {
          result = this.links[link].longestPrefixOf(s, sIndex + link.length);
        }
      }
      if (isUndefined(result) && !isUndefined(this.value)) {
        result = s.substr(0, sIndex);
      }
    }
    return result;
  }

  /**
   * @name items
   * @for RadixTreeNode
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
   * @for RadixTreeNode
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


export default RadixTree;