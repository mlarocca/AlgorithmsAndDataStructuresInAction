const _branchFactor = new WeakMap();
const _elements = new WeakMap();
const _positions = new WeakMap();
const _compare = new WeakMap();
const _bubbleUp = new WeakMap();
const _pushDown = new WeakMap();
const _setElementToPosition = new WeakMap();
const _removeElementFromPosition = new WeakMap();
const _getElementPositions = new WeakMap();
//DEBUG   const _check = new WeakMap();

function defaultCompare(x, y) {
  if (x < y) {
    return -1;
  } else if (x > y) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * @name validateElem
 * @for DWayHeap
 * @private
 * @description
 *
 * Validate an element.
 *
 * @param {*} value
 * @returns {boolean} True iff it is possible to store this value in the heap
 */
function validateElem(value) {
  return typeof value !== 'undefined' && typeof value !== 'function' && value !== null;
}

/**
 * @name setElementToPosition
 * @for DWayHeap
 * @private
 * @description
 *
 * Set an element position in the heap, updating its location, if necessary.
 * (We must keep track of the location of each element to speed up the updatePriority method,
 *   which is heavily used in Prim and Dijkstra algorithms).
 *
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!*} elem  The element to be stored in the heap.
 * @param {!Number} index   The index of the new position of elem in the heap array.
 * @param {?Number} oldIndex  Optional parameter: The old index of elem inside the array.
 *
 * @return {undefined}
 * @throws {TypeError(ERROR_MSG_DWAYHEAP_SET_ELEMENT)} If the index parameter is not valid.
 */
function setElementToPosition(elements, positions, elem, index, oldIndex) {
  //TODO remove and check in the callers

  if (!positions.has(elem)) {
    positions.set(elem, [index]);
  } else {
    oldIndex = parseInt(oldIndex, 10);
    if (!Number.isNaN(oldIndex)) {
      //We have to remove exactly one occurrence of the previous position
      let i = positions.get(elem).indexOf(oldIndex);
      if (i >= 0) {
        //The position was actually present, so we have to remove the element at that index
        positions.get(elem).splice(i, 1);
      }
    }
    positions.get(elem).push(index);
  }

  elements[index] = elem;
}

/**
 * @name removeElementFromPosition
 * @for DWayHeap
 * @private
 * @description
 *
 * Remove an element at a certain position in the heap, updating its location, if necessary.
 * (We must keep track of the location of each element to speed up the updatePriority method,
 * which is heavily used in Prim and Dijkstra algorithms).
 *
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!Number} index   The index of the new position of elem in the heap array.
 * @param {?Boolean} splice   Optional parameter: flag to state if the element must also be esponged from the array.
 *
 * @return {*} The element stored at index.
 * @throws {TypeError(ERROR_MSG_DWAYHEAP_REMOVE_ELEMENT)} If the index parameter is not valid.
 */
function removeElementFromPosition(elements, positions, index, splice) {
  const elem = elements[index];

  //we have to remove exactly one occurrence of the previous position
  const i = positions.get(elem).indexOf(index);
  if (i >= 0) {
    //The position was actually present, so we have to remove the element at that index
    positions.get(elem).splice(i, 1);
  }
  if (splice) {
    //Actually splice the element from the array
    elements.splice(index, 1);  //assert === elem
  }
  return elem;
}

/**
 * @name getElementPositions
 * @for DWayHeap
 * @private
 *
 * @description
 *
 * Get the position of the passed element in the heap.
 * (We must keep track of the location of each element to speed up the updatePriority method,
 * which is heavily used in Prim and Dijkstra algorithms).
 *
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!*} elem  The element whose position is to be retrieved.
 *
 * @return {Number}  The position of the element in the heap elements array. If the same element appears
 *                   in more than one positions, the first one in the list is returned (not necessarily
 *                   the smallest one).
 *                   If the element is not contained in the heap, returns -1.
 */
function getElementPositions(positions, elem) {
  if (positions.has(elem) && positions.get(elem).length > 0) {
    return positions.get(elem);
  } else {
    return null;
  }
}

/**
 * @name bubbleUp
 * @for DWayHeap
 * @private
 * @description
 *
 * Reinstate the properties of the heap by bubbling an element up to the root
 *
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!Number} branchFactor The branching factor of the heap.
 * @param {!Function} compare A comparator for heap's elements.
 * @param {!Number} index The index of the element to move towards the root of the heap.
 *
 * @return {Number} The new position for the element.
 */
function bubbleUp(elements, positions, branchFactor, compare, index) {
  const elem = elements[index];
  let i = index;
  while (i > 0) {
    let parentIndex = Math.floor((i - 1) / branchFactor);
    if (compare(elem, elements[parentIndex]) < 0) {
      //elem must keep bubbling up: sets elements[i] = elements[parentIndex];
      setElementToPosition(elements, positions, elements[parentIndex], i, parentIndex);
      i = parentIndex;
    } else {
      //we found the right place for elem: position i
      break;
    }
  }
  if (i !== index) {
    //Sets elements[i] = elem;
    setElementToPosition(elements, positions, elem, i, index);
  }
  return i;
}

/**
 * @name pushDown
 * @for DWayHeap
 * @private
 * @description
 *
 * Reinstate the properties of the heap by pushing down an element towards the leaves
 *
 * @param {!Array} elements The array of elements in the heap.
 * @param {!Map} positions A map for each (unique) elem in the to the positions in which it is stored.
 * @param {!Number} branchFactor The branching factor of the heap.
 * @param {!Function} compare A comparator for heap's elements.
 * @param {Number} index The index of the element to push down the heap.
 *
 * @return {Number} The new position for the element.
 */
function pushDown(elements, positions, branchFactor, compare, index) {
  const elem = elements[index];
  const n = elements.length;
  let parentIndex = index;
  let smallestChildIndex = index * branchFactor + 1;
  //Iteratively go down the subtree
  while (smallestChildIndex < n) {
    let smallestChild = elements[smallestChildIndex];
    let m = Math.min(n, smallestChildIndex + branchFactor);
    //Look for the smallest child
    for (let i = smallestChildIndex + 1; i < m; i++) {
      if (compare(elements[i], smallestChild) < 0) {
        smallestChildIndex = i;
        smallestChild = elements[i];
      }
    }
    //Check if the smallest of the children is smaller than elem
    if (compare(smallestChild, elem) < 0) {
      //we need to push the parent down
      setElementToPosition(elements, positions, smallestChild, parentIndex, smallestChildIndex);
      //Iteratively go down the subtree
      parentIndex = smallestChildIndex;
      smallestChildIndex = parentIndex * branchFactor + 1;
    } else {
      //We don't need to go down this subtree
      break;
    }
  }
  if (index !== parentIndex) {
    setElementToPosition(elements, positions, elem, parentIndex, index);
  }

  return parentIndex;
}

/**
 * @name heapify
 * @for DWayHeap
 * @private
 * @description
 *
 * Initialize a heap with a set of elements.
 * INVARIANT: elements contains been checked before being passed to heapify,
 *            and MUST be a valid non-empty array.
 *
 * @param {Array} intialElements The initial set of elements to be added to the heap.
 * @return {undefined}
 */
function heapify(elements, positions, branchFactor, compare, intialElements) {

  const n = intialElements.length;

  for (let i = 0; i < n; i++) {
    setElementToPosition(elements, positions, intialElements[i], i);
  }
  let lastInnerNode = Math.floor((n - 1) / branchFactor);
  for (let i = lastInnerNode; i >= 0; i--) {
    pushDown(elements, positions, branchFactor, compare, i);
  }

  //TODO: ~remove~
  check(elements, branchFactor, compare);
}

function check(elements, branchFactor, compare) {
  const n = elements.length;

  for (let parentIndex = 0; parentIndex < n; parentIndex++) {
    let parent = elements[parentIndex];
    let childIndex = parentIndex * branchFactor + 1;
    let m = Math.min(n, childIndex + branchFactor);
    for (; childIndex < m; childIndex++) {
      if (compare(elements[childIndex], parent) < 0) {
        throw new Error(ERROR_MSG_DWAYHEAP_CHECK());
      }
    }
  }
  return true;
}

const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM = (val) => `Illegal argument for DWayHeap constructor: branchFactor ${val}`;
const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_SND_PARAM = (val) => `Illegal argument for DWayHeap constructor: elements ${val}`;
const ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM = (val) => `Illegal argument for DWayHeap constructor: compare ${val}`;
const ERROR_MSG_DWAYHEAP_PUSH = (val) => `Illegal argument for push: ${val}`;
const ERROR_MSG_DWAYHEAP_EMPTY_HEAP = () => `Invalid Status: Empty Heap`;
const ERROR_MSG_DWAYHEAP_CHECK = () => `Heap Properties Violated`;
const ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY = (val) => `Out of range argument: element ${val} not stored in the heap`;
const ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API = (val) => `Illegal argument for updatePriority: ${val}`;
const ERROR_MSG_DWAYHEAP_ELEMENT_POSITION = (val) => `Error: can't find position for elem:  ${val}`;

/**
 * @class DWayHeap
 *
 * A d-way heap (aka d-ary heap or d-heap) is a priority queue data structure, a generalization of the binary
 * heap in which the nodes have d children instead of 2. Thus, a binary heap is a 2-heap.
 * D-way heaps are pretty useful in practice in the implementation of Dijkstra and Prim algorithms
 * for graphs, among many other things.
 * While Fibonacci's heaps would be theoretically faster, no simple and fast implementation of such data structures is known.
 * In practice, a 4-way heap is the best solution for the priority queues in these algorithms.
 *
 * This implementation uses a Map to store keys positions inside the heap.
 * This has 3 important consequences:
 * 1. You can store both literals and objects in the heap.
 * 2. If you store an object, to retrieve it you need to pass to .get() the same object. Different objects, even if
 *    containing the same fields, are not considered equal. This is due to a limitation of Maps
 *    (see http://www.2ality.com/2015/01/es6-maps-sets.html).
 * 3. References to the objects stored are held until they are removed from the heap. If we used a WeakMap instead,
 *    references would have been held weakly, allowing garbage collector to dispose those objects if not used elsewhere.
 *    So, for example:
 *
 *      const map = new Map();
 *      let x = [], y = [];
 *      map.set(x, 1);
 *      console.log(map.has(x)); // Will print false
 *
 *    WeekMaps, however, doesn't allow primitive values, so heap keys would have had to be objects.
 */
class DWayHeap {
  constructor(branchFactor = 2, elements = [], compare = defaultCompare) {
    //Force casting to Number and takes the integer part
    const bF = parseInt(branchFactor, 10);
    if (Number.isNaN(bF) || bF < 2) {
      throw new TypeError(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_FST_PARAM(branchFactor));
    }

    if (elements === undefined || elements === null || !Array.isArray(elements)) {
      throw new TypeError(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_SND_PARAM(elements));
    }

    if (typeof compare !== 'undefined' && (typeof compare !== 'function' || compare.length !== 2)) {
      throw new TypeError(ERROR_MSG_DWAYHEAP_CONSTRUCTOR_TRD_PARAM(compare));
    }

    _branchFactor.set(this, bF);
    _compare.set(this, compare);
    _positions.set(this, new Map());
    _elements.set(this, []);

    _bubbleUp.set(this, bubbleUp.bind(this, _elements.get(this), _positions.get(this), bF, _compare.get(this)));
    _pushDown.set(this, pushDown.bind(this, _elements.get(this), _positions.get(this), bF, _compare.get(this)));
    _setElementToPosition.set(this, setElementToPosition.bind(this, _elements.get(this), _positions.get(this)));
    _removeElementFromPosition.set(this, removeElementFromPosition.bind(this, _elements.get(this), _positions.get(this)));
    _getElementPositions.set(this, getElementPositions.bind(this, _positions.get(this)));
    //DEBUG    _check.set(this, check.bind(this, _elements.get(this), bF, _compare.get(this)));

    heapify(_elements.get(this), _positions.get(this), bF, _compare.get(this), elements);
    //DEBUG    _check.get(this)();
  }

  /**
   * @name size
   * @for DWayHeap
   * @getter
   * @description
   *
   * Return the number of elements stored in the heap.
   *
   * @return {Number} The number of elements in the heap.
   */
  get size() {
    return _elements.get(this).length;
  }

  /**
   * @name isEmpty
   * @for DWayHeap
   * @description
   *
   * Check if the heap is empty.
   *
   * @return {Boolean} True <=> the heap is empty, false otherwise.
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * @name branchFactor
   * @for DWayHeap
   * @getter
   * @description
   * Return the branch factor of current heap.
   *
   * @returns {number} The branch factor for this heap.
   */
  get branchFactor() {
    return _branchFactor.get(this);
  }


  /**
   * @name contains
   * @for DWayHeap
   *
   * Returns true if the element is stored in the heap, false otherwise
   *
   * @param {!*} elem  The element to look for.
   *
   * @return {Boolean}   true <=> The element is stored in the heap.
   */
  contains(elem) {
    let ps = _getElementPositions.get(this)(elem);
    return ps !== null && ps.length > 0;
  }


  /**
   * @name push
   * @for DWayHeap
   *
   * Add an element to the heap, taking care of reinstating heap's properties.
   *
   * @param {*} elem   The element to add to the heap. Must be a comparable element.
   *
   * @return {Object} The heap itself, to comply with the chaining pattern.
   * @throws {TypeError(ERROR_MSG_DWAYHEAP_PUSH)}  Throws an error if the first parameter is undefined or null.
   */
  push(elem) {
    const n = this.size;

    if (!validateElem(elem)) {
      //The only three types that can't be accepted
      throw new TypeError(ERROR_MSG_DWAYHEAP_PUSH(elem));
    }

    //Add one element to the array
    _setElementToPosition.get(this)(elem, n);
    //Then bubble it up
    _bubbleUp.get(this)(n);

    //DEBUG    _check.get(this)();

    return this;
  }

  /**
   * @name peek
   * @for DWayHeap
   *
   * If the heap is not empty, return a reference to the first element in the heap.
   *
   * @return {*} A deep copy of the top element in the heap
   * @throws {Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP)}  Throws an error if the heap is empty.
   */
  peek() {
    if (this.isEmpty()) {
      throw new Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP());
    }
    //deep copy
    return JSON.parse(JSON.stringify(_elements.get(this)[0]));
  }

  /**
   * @name top
   * @for DWayHeap
   *
   * If the heap is not empty, return the first element in the heap, after removing it from the data structure;
   * The heap properties are then reinstated.
   *
   * @return {*} A reference to the top element in the heap
   * @throws {Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP)}  Throws an error if the heap is empty.
   */
  top() {
    const n = this.size;

    switch (n) {
      case 0:
        throw new Error(ERROR_MSG_DWAYHEAP_EMPTY_HEAP());
      case 1:
        return _removeElementFromPosition.get(this)(0, true);
      default:
        //We MUST not change the position of subsequent array elements
        let topElem = _removeElementFromPosition.get(this)(0, false);
        //The last element, instead, needs to be removed
        let elem = _removeElementFromPosition.get(this)(n - 1, true);
        _setElementToPosition.get(this)(elem, 0, n - 1);
        _pushDown.get(this)(0);

        //DEBUG      _check.get(this)();

        return topElem;
    }
  }

  /**
   * @name updatePriority
   * @for DWayHeap
   *
   * Updates all the element stored in the heap matching oldValue, possibly changing its priority;
   * then it takes care of reinstating heap's properties.
   * If the new priority is greater (i.e. newValue < oldValue) the new element will be pushed toward the root,
   * if it's smaller (i.e. newValue > oldValue) it will be pushed towards the leaves.
   * **WARNING** Be advised that all the occurrences of the old value will be replaced with the instance of the new value passed.
   *             In case `newValue` is an object, the same reference will replace all the occurrences of oldValue.
   *
   * @param {*} oldValue   The element to be updated. MUST be in the heap.
   * @param {*} newValue   The new value for the element.
   *
   * @return {Object} The heap itself, to comply with the chaining pattern.
   * @throws {RangeError(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY)}  Throws an error if the first parameter is undefined or null.
   * @throws {RangeError(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION)}  Throws an error if the first parameter is undefined or null.
   */
  updatePriority(oldValue, newValue) {
    const compareResult = _compare.get(this)(newValue, oldValue);
    const n = this.size;
    if (!this.contains(oldValue)) {
      //TODO
      throw new RangeError(ERROR_MSG_DWAYHEAP_ELEMENT_POSITION(oldValue));
    }

    let indices = _getElementPositions.get(this)(oldValue);

    if (!validateElem(newValue)) {
      //The only three types that can't be accepted
      throw new TypeError(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY_API(newValue));
    }
    //First update all the elements
    for (let i of indices) {
      if (i < 0 || i > n) {
        throw new RangeError(ERROR_MSG_DWAYHEAP_UPDATE_PRIORITY(newValue));
      }
      //else
      _setElementToPosition.get(this)(newValue, i);
    }
    //Then we need to restore priority constraints. The order in which we process the elements depends on the operation we need to perform
    if (compareResult < 0) {
      //Priority decreases so the element will have to move up to the root. We have to start from smaller indices.
      indices = indices.sort((x, y) => x - y);
      for (let i of indices) {
        _bubbleUp.get(this)(i);
      }
    } else if (compareResult > 0) {
      //Priority decreases so the element will have to move down to leaves. We have to start from larger indices.
      indices = indices.sort((x, y) => y - x);
      for (let i of indices) {
        _pushDown.get(this)(i);
      }
    }
    //else: nothing to do, priority is the same as before

    //DEBUG    _check.get(this)();

    return this;
  }

  /**
   * @name sorted
   * @for DWayHeap
   *
   * Return a sorted array with all the elements in the heap.
   * WARNING: all the elements will be removed from the heap!
   *
   * @return  {Array} The sorted array with all elements (possibility empty).
   */
  sorted() {
    let res = [];
    while (this.size > 0) {
      res.push(this.top());
    }

    return res;
  }

  /**
   * @name iterator
   * @for DWayHeap
   *
   * Return an iterator that will go through all the elements in the heap, in sorted order
   * **WARNING**: elements will be removed from the heap!
   *
   * @return  {Array} The sorted array with all elements (possibility empty).
   */
  *[Symbol.iterator]() {
    while (this.size > 0) {
      yield this.top();
    }
  }
}

export default DWayHeap;