import { isDefined, isIterable, isUndefined } from '../common/basic.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../common/errors.js';

const ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT = (val) => `Illegal argument for DisjointSet constructor: ${val}`;
const ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT = (val) => `Duplicate element in initial set for DisjointSet constructor: ${val}`;
const ERROR_MSG_FIND_NOT_IN_SET = (val) => `Argument ${val} for method find does not belong to this set`;

const _elements = new WeakMap();

/** @class DisjointSet
 *
 * A DisjointSet (aka Disjoint-set) data structure is a data structure that keeps track of a set of elements partitioned into a number of disjoint (nonoverlapping) subsets.
 * It usually supports two useful operations:
 *
 * - Find: Determine which subset a particular element is in. Find typically returns an item from this set that serves as its "representative"; by comparing the result of two Find operations, one can determine whether two elements are in the same subset.
 * - Union: Join two subsets into a single subset.
 *
 * This class also support queries to find if two elements are in the same subset, through the disjoint method.
 * In addition a few utility methods to check the number of elements in the "universe" and to add new elements (as singleton subsets) are provided.
 *
 */
class DisjointSet {
  /**
   * @constructor
   * @for DisjointSet
   *
   * Creates and initialize a DisjointSet object.
   *
   * @param {Array}  initialSet  The array containing a (disjoint) set of elements with
   *                             whom the data structure should be initialized.
   *
   * @return {Object} An instance of the data structure.
   * @throws {TypeError(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT)}   If initialSet is not an array, or any element is undefined or null.
   * @throws {TypeError(ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT)}   If initialSet contains duplicates.
   */
  constructor(initialSet = []) {
    if (!isIterable(initialSet)) {
      throw new TypeError(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT(initialSet));
    }

    let elements = new Map();
    _elements.set(this, elements);

    for (let elem of initialSet) {
      if (!isDefined(elem)) {
        throw new TypeError(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT(elem));
      }

      if (elements.has(elem)) {
        //We have a duplicated element
        throw new TypeError(ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT(elem));
      }
      //else
      elements.set(elem, new Info(elem));
    }
  }

  /**
   * @name size
   * @for DisjointSet
   * @getter
   * @description
   *
   * Return the number of elements in the "universe" set associated with the data structure.
   *
   * @return {Number}  The cardinality of the set of all the (unique) elements added to the data structure.
   */
  get size() {
    return _elements.get(this).size;
  }

  /**
   * @name add
   * @for DisjointSet
   *
   * Add a new element to the data structure, provided that this element is not already in it.
   * The new element will be added in a singleton partition, disjoint from any other subset.
   *
   * @param {Number|String|Boolean|Object} elem  The element to be added to the data structure.
   *
   * @return {Boolean}   true <=> The 'elem' parameter is well defined and the element passed is not already stored.
   *                     false <=> otherwise.
   *
   * @throws {TypeError(ERROR_MSG_INVALID_ARGUMENT)}   If elem is null or it hasn't been passed.
   */
  add(elem) {
    if (!isDefined(elem)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('add', 'elem', elem));
    }
    //else
    if (_elements.get(this).has(elem)) {
      return false;
    }
    //else
    _elements.get(this).set(elem, new Info(elem));
    return true;
  }


  /**
   * @name findPartition
   * @for DisjointSet
   *
   * Find the partition to which the element passed as parameter belongs.
   *
   * @param {Number|String|Boolean|Object} elem  The element to be queried.
   *
   * @return {Number|String|Boolean|Object}   The root element of the subset containing elem.
   *
   * @throws {TypeError(ERROR_MSG_INVALID_ARGUMENT)}   If no argument has been passed.
   * @throws {TypeError(ERROR_MSG_FIND_NOT_IN_SET)}   If the argument does not belong to this set.
   */
  findPartition(elem) {
    if (isUndefined(elem)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('findPartition', 'elem', elem));
    }

    if (!(_elements.get(this).has(elem))) {
      throw new TypeError(ERROR_MSG_FIND_NOT_IN_SET(elem));
    }

    let info = _elements.get(this).get(elem);

    if (info.root === elem) {
      return elem;
    } else {
      info.root = this.findPartition(info.root);
      return info.root;
    }
  }


  /**
   * @name merge
   * @for DisjointSet
   *
   * Merge the subsets containing the two elements passed.
   *
   * @param {Number|String|Boolean|Object} elem1  The first element involved in the merge operation.
   * @param {Number|String|Boolean|Object} elem2  The second element involved in the merge operation.
   *
   * @return {Boolean}  true <=> the elements belonged to two different subsets, and these subsets are correctly merged.
   *                    false <=> the two elements were already in the same subset.
   *
   * @throws {TypeError(ERROR_MSG_INVALID_ARGUMENT)}   If anyone of the parameters hasn't been passed or if it can't be found.
   */
  merge(elem1, elem2) {
    let r1 = this.findPartition(elem1);  // this validates the input and might throw
    let r2 = this.findPartition(elem2);  // this validates the input and might throw

    if (r1 === r2) {
      return false; // Not merged
    }
    // else
    let info1 = _elements.get(this).get(r1);
    let info2 = _elements.get(this).get(r2);

    if (info1.rank >= info2.rank) {
      info2.root = info1.root;
      info1.rank += info2.rank;
    } else {  // r1 < r2
      info1.root = info2.root;
      info2.rank += info1.rank;
    }

    return true;  // Merged
  }

  /**
   * @name areDisjoint
   * @for DisjointSet
   *
   * Checks if two elements are disjoint, i.e. they belong to two different partitions, or if they are connected,
   * i.e. belongs to the same partition.
   *
   * @param {Number|String|Boolean|Object} elem1  The first element to check.
   * @param {Number|String|Boolean|Object} elem2  The second element to check.
   *
   * @return {Boolean}  true <=> the elements belong to the same partition.
   *                    false <=> the two elements are disjoint, i.e. they belong to a different partition.
   *
   * @throws {TypeError(ERROR_MSG_FIND_ILLEGAL_ARGUMENT)}   If anyone of the parameters hasn't been passed or if it can't be found.
   */
  areDisjoint(elem1, elem2) {
    let p1 = this.findPartition(elem1);  // this validates the input and might throw
    let p2 = this.findPartition(elem2);  // this validates the input and might throw

    return p1 !== p2;
  }
}

/**
 * @class Info
 * @for DisjointSet
 * @private
 *
 * Describe the info associated with an element: it contains a pointer to its root, and the element's rank, i.e. the
 * size of the tree containing it.
 */
class Info {
  /**
   * @constructor
   *
   * Creates a named pair with root and rank, modeling the properties of a single element in the disjoint-set.
   * NOTE: we use public properties because (1) this class is private and thus only used locally, and (2) there is no way
   * to declare them private and properly encapsulated, not accessible by DisjointSet.
   *
   * @param elem The element to store.
   */
  constructor(elem) {
    if (!isDefined(elem)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('constructor', 'elem', elem));
    }
    this._root = elem;
    this._rank = 1;
  }

  get rank() {
    return this._rank;
  }

  set rank(newRank) {
    this._rank = newRank;
  }

  get root() {
    return this._root;
  }

  set root(newRoot) {
    if (!isDefined(newRoot)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('set root', 'newRoot', newRoot));
    }

    this._root = newRoot;
  }
}

export default DisjointSet;
