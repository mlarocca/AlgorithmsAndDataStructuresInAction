import { isIterable, isUndefined } from '../../common/basic.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';

const ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT = (val) => `Illegal argument for UnionFindTrees constructor: ${val}`;
const ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT = (val) => `Duplicate element in initial set for UnionFindTrees constructor: ${val}`;
const ERROR_MSG_FIND_NOT_IN_SET = (val) => `Argument ${val} for method find does not belong to this set`;

const _parentsMap = new WeakMap();

/** @class UnionFindTrees
 *
 * A UnionFind (aka Disjoint-set) data structure is a data structure that keeps track of a set of elements partitioned into a number of disjoint (nonoverlapping) subsets.
 * It usually supports two useful operations:
 *
 * - Find: Determine which subset a particular element is in. Find typically returns an item from this set that serves as its "representative"; by comparing the result of two Find operations, one can determine whether two elements are in the same subset.
 * - Union: Join two subsets into a single subset.
 *
 * This class also support queries to find if two elements are in the same subset, through the disjoint method.
 * In addition a few utility methods to check the number of elements in the "universe" and to add new elements (as singleton subsets) are provided.
 *
 */
class UnionFindTrees {
  /**
   * @constructor
   * @for DisjointSetTrees
   *
   * Creates and initialize a DisjointSetTrees object.
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

    let parents = new Map();
    _parentsMap.set(this, parents);

    for (let elem of initialSet) {
      if (isUndefined(elem) || elem === null) {
        throw new TypeError(ERROR_MSG_UNION_FIND_CONSTRUCTOR_ILLEGAL_ARGUMENT(elem));
      }

      if (parents.has(elem)) {
        //We have a duplicated element
        throw new TypeError(ERROR_MSG_UNION_FIND_CONSTRUCTOR_DUPLICATE_ELEMENT(elem));
      }
      //else
      parents.set(elem, elem);
    }
  }

  /**
   * @name size
   * @for DisjointSetTrees
   * @getter
   * @description
   *
   * Return the number of elements in the "universe" set associated with the data structure.
   *
   * @return {Number}  The cardinality of the set of all the (unique) elements added to the data structure.
   */
  get size() {
    return _parentsMap.get(this).size;
  }

  /**
   * @name add
   * @for DisjointSetTrees
   *
   * Add a new element to the data structure, provided that this element is not already in it.
   * The new element will be added in a singleton subset, disjoint from any other subset.
   *
   * @param {Number|String|Boolean|Object} elem  The element to be added to the data structure.
   *
   * @return {Boolean}   true <=> The 'elem' parameter is well defined and the element passed is not already stored.
   *                     false <=> otherwise.
   *
   * @throws {TypeError(ERROR_MSG_INVALID_ARGUMENT)}   If elem is null or it hasn't been passed.
   */
  add(elem) {
    if (isUndefined(elem) || elem === null) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('add', 'elem', elem));
    }
    //else
    if (_parentsMap.get(this).has(elem)) {
      return false;
    }
    //else
    _parentsMap.get(this).set(elem, elem);
    return true;
  }


  /**
   * @name findPartition
   * @for DisjointSetTrees
   *
   * Find the subset to which the element passed as parameter belongs.
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

    if (!(_parentsMap.get(this).has(elem))) {
      throw new TypeError(ERROR_MSG_FIND_NOT_IN_SET(elem));
    }

    let parent = _parentsMap.get(this).get(elem);
    if (parent !== elem) {
      parent = this.findPartition(parent);
    }
    return parent;
  }


  /**
   * @name merge
   * @for DisjointSetTrees
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
    let p1 = this.findPartition(elem1);  // this validates the input and might throw
    let p2 = this.findPartition(elem2);  // this validates the input and might throw

    if (p1 === p2) {
      return false; // Not merged
    }
    //else
    let parent = _parentsMap.get(this);
    parent.set(p2, p1);

    return true;  // Merged
  }

  /**
   * @name areDisjoint
   * @for DisjointSetTrees
   *
   * Checks if two elements are disjoint, i.e. they belong to two different subsets, or if they are connected, i.e. belongs to the same subset.
   *
   * @param {Number|String|Boolean|Object} elem1  The first element to check.
   * @param {Number|String|Boolean|Object} elem2  The second element to check.
   *
   * @return {Boolean}  true <=> the elements are disjoint <=> they belonged to two different subsets.
   *                    false <=> the two elements are in the same subset.
   *
   * @throws {TypeError(ERROR_MSG_FIND_ILLEGAL_ARGUMENT)}   If anyone of the parameters hasn't been passed or if it can't be found.
   */
  areDisjoint(elem1, elem2) {
    let p1 = this.findPartition(elem1);  // this validates the input and might throw
    let p2 = this.findPartition(elem2);  // this validates the input and might throw

    return p1 !== p2;
  }
}

export default UnionFindTrees;
