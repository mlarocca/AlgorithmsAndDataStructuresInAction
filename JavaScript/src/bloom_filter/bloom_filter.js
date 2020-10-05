import { fnv1Hash32, murmurHash32 } from '../common/hash.js';
import { consistentStringify } from '../common/strings.js';
import { randomInt, range } from '../common/numbers.js';

const _maxSize = new WeakMap();
const _seed = new WeakMap();
const _numBits = new WeakMap();
const _numHashes = new WeakMap();
const _size = new WeakMap();
const _bitsArray = new WeakMap();
const _hashFunctions = new WeakMap();
const _key2Positions = new WeakMap();
const _readBit = new WeakMap();
const _writeBit = new WeakMap();

const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE = val => `Illegal argument for BloomFilter constructor: tolerance = ${val} must be a number t, 0 < t < 1`;
const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE = val => `Illegal argument for BloomFilter constructor: maxSize = ${val} must be a number`;
const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED = val => `Illegal argument for BloomFilter constructor: seed = ${val} must be a safe integer`;
const ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE = () => `Impossible to allocate enough memory for a Bloom filter satisfying requirements`;

const LN_2 = Math.log(2);

/**
 * @name readBit
 * @for BloomFilter
 * @private
 * @description
 * Read a bit from the internal storage.
 *
 * @param {!Uint8Array} bitsArray An array containing all the bits for the filter, broken down by the byte.
 * @param {!Number} index The index of the bit we want to read.
 * @return {Number} 1 or 0, depending on the value set for that bit.
 */
function readBit(bitsArray, index) {
  let [element, bit] = findBitCoordinates(bitsArray, index);
  return (bitsArray[element] & (1 << bit)) >> bit;
}


/**
 * @name writeBit
 * @for BloomFilter
 * @private
 * @description
 * Stores a bit on the internal bits array.
 * We can only store 1s, so there is no need to pass the value to store.
 *
 * @param {!Uint8Array} bitsArray An array containing all the bits for the filter, broken down by the byte.
 * @param {!Number} index The index of the bit we want to write.
 * @return {!boolean} true iff at least one bit was flipped, false otherwise (meaning the key was already stored in the
 *                    filter, or would result in a false positive anyway).
 */
function writeBit(bitsArray, index) {
  let [element, bit] = findBitCoordinates(bitsArray, index);
  let oldValue = bitsArray[element];
  bitsArray[element] = oldValue | (1 << bit);
  return oldValue !== bitsArray[element];
}


/**
 * @name findBitCoordinates
 * @for BloomFilter
 * @private
 * @description
 * Instead of wasting a full byte to store a boolean value, we are packing bits in integer arrays. By using fixed size
 * numerical arrays we also speed up operations.
 * However, we need to extract form an index `i` two coordinates: the element of the array storing the element containing
 * our bit, and the index inside that element of the bit we need to extract.
 *
 * @param {!Uint8Array} bitsArray An array containing all the bits for the filter, broken down by the byte.
 * @param {!number} index The index of the bit we want to write.
 * @returns {[number, number]} The coordinates for bit #index.
 */
function findBitCoordinates(bitsArray, index) {
  let bitsInElement = 8 * bitsArray.BYTES_PER_ELEMENT;
  let bufferIndex = Math.floor(index / bitsInElement);
  let bitIndex = index % bitsInElement;
  return [bufferIndex, bitIndex];
}

/**
 * @name key2Positions
 * @for BloomFilter
 * @private
 * @description
 * Given a set of hash functions, a seed, and a key, returns the indices of the bits that should be used to store the key.
 *
 * @param {!Array<function>} hashFunctions An array with k hash functions, mapping each key to k distinct locations inside
 *        the filter's bits array.
 * @param {!number} seed A seed for the hash functions. This is needed to be able to provide deterministic behaviour
 *                       in different runs, both for testing and serialization/deserialization use cases.
 * @param {!string} key The key to store.
 * @returns {Array<Uint8>} An array with k indices between 0 and _numBits - 1.
 */
function key2Positions(hashFunctions, seed, key) {
  let h1 = murmurHash32(key, seed);
  let h2 = fnv1Hash32(key);
  return hashFunctions.map(h => h(h1, h2));
}

/**
 * @name initHashes
 * @for BloomFilterkey
 * @private
 * @description
 * Initialize the k hash functions needed to map each key (already transformed into a string) into a set of k indices,
 * the bits that will hold the information about the given key.
 *
 * @param {!Number} numHashes The number of hash functions to initialize. Must be >= 1.
 * @returns {Array<function>} An array of hash functions.
 */
function initHashes(numHashes, numBits) {
  return range(0, numHashes).map(i => (h1, h2) => {
    return (h1 + i * h2 + i * i) % numBits;
  });
}

/**
 * @class BloomFilter
 */
class BloomFilter {

  /**
   * @name constructor
   * @for BloomFilter
   * @description
   * Construct a Bloom filter that can hold at most maxSize while guaranteeing an error rate (probability of a false
   * positive) of at most `maxTolerance`
   *
   * @param {!number} maxSize The expected number of elements to be contained by the Bloom filter.
   * @param {?number} maxTolerance The desired maximum error rate for the bloom filter (0 < maxTolerance < 1)
   * @param {?number} seed The seed to be used for the hash functions. Must be a safe integer. Initialized by default to
   *                       a random integer, using a helper function defined in our common package.
   *
   * @throws {TypeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE)} If the maxSize parameter is not valid.
   * @throws {TypeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE)} If the maxTolerance parameter is not valid.
   * @throws {TypeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED)} If the seed parameter is not valid.
   * @throws {TypeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE)} If the number of bits required to satisfy the maximum
   *          tolerance would be too big to allocate an array for it.
   */
  constructor(maxSize, maxTolerance = 0.01, seed = randomInt()) {
    let maxS = parseInt(maxSize, 10); //lgtm [js/superfluous-trailing-arguments]
    let tol = parseFloat(maxTolerance, 10); //lgtm [js/superfluous-trailing-arguments]

    if (Number.isNaN(maxS) || maxSize <= 0) {
      throw new TypeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_MAX_SIZE(maxSize));
    }

    if (Number.isNaN(tol) || tol <= 0 || tol >= 1) {
      throw new TypeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_TOLERANCE(maxTolerance));
    }

    if (!Number.isSafeInteger(seed)) {
      throw new TypeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SEED(seed));
    }

    //Initially no elements is stored
    _size.set(this, 0);

    _maxSize.set(this, maxS);

    _seed.set(this, seed);

    //Optimal number of bits: m = - n * ln(p) / (ln(2))^2
    _numBits.set(this, -Math.ceil(maxS * Math.log(maxTolerance) / LN_2 / LN_2));

    let numBits = _numBits.get(this);
    if (numBits > Number.MAX_SAFE_INTEGER) {
      throw new RangeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE());
    }

    //Optimal number of hashes: k = m/n * ln(2)
    _numHashes.set(this, -Math.ceil(Math.log(maxTolerance) / LN_2));

    //Number of bytes needed to store all the filter's bits
    let numElements = Math.ceil(numBits / Uint8Array.BYTES_PER_ELEMENT);
    try {
      _bitsArray.set(this, new Uint8Array(numElements));
    } catch (e) {
      throw new RangeError(ERROR_MSG_BLOOM_FILTER_CONSTRUCTOR_SIZE());
    }

    let buffer = _bitsArray.get(this);
    _hashFunctions.set(this, initHashes(_numHashes.get(this), numBits));
    _key2Positions.set(this, key2Positions.bind(this, _hashFunctions.get(this), _seed.get(this)));
    _readBit.set(this, readBit.bind(this, buffer));
    _writeBit.set(this, writeBit.bind(this, buffer));
  }

  /**
   * @name contains
   * @for BloomFilter
   * @description
   * Check if a value contains been stored into the Bloom filter.
   *
   * @param {!string} value The value to be checked for.
   * @return {boolean} false only if the value contains never been added to the Bloom filter, true if it contains, or for false positives.
   */
  contains(value) {
    let positions = _key2Positions.get(this)(consistentStringify(value));
    let readBitLambda = _readBit.get(this);
    return positions.every(i => readBitLambda(i) !== 0);
  }

  /**
   * @name add
   * @for BloomFilter
   * @description
   * Stores a new value into the filter.
   * If the value is unique with the respect to the one already stored, also increments the size of the filter.
   * NOTE: false positives are treated as duplicate keys.
   *
   * @param {!string} value The value to be added to the Bloom filter.
   * @return {BloomFilter} The object itself (method chaining)
   */
  add(value) {
    let positions = _key2Positions.get(this)(consistentStringify(value));
    let writeBitLambda = _writeBit.get(this);
    if (positions.map(writeBitLambda).some(b => b)) {
      _size.set(this, this.size + 1);
    }
    return this;
  }

  /**
   * @name size
   * @for BloomFilter
   * @getter
   * @description
   * The number of elements added so far to the Bloom filter. More precisely, the number of times the `add` method contains
   * been called, as we don't keep track of duplicates.
   *
   * @return {number} The number of unique keys stored.
   */
  get size() {
    return _size.get(this);
  }

  /**
   * @name confidence
   * @for BloomFilter
   * @description
   * How confident we are about the result we provide. Depends on the number of elements inserted in the Bloom filter,
   * and on the initialization parameters. It is a pessimistic estimate, as we only keep track of the number of elements
   * added, instead of the unique number of elements.
   * By definition it's equal to 1 - falsePositiveProbability.
   *
   * @return {number} current confidence, as a double between 0 and 1..
   */
  confidence() {
    return 1 - this.falsePositiveProbability();
  }

  /**
   * @name falsePositiveProbability
   * @for BloomFilter
   * @description
   * Actual estimated value for the maximum error rate (the probability of a false positive), given the elements currently
   * added to the Bloom filter, and the construction parameters.
   * The false positive probability (the probability that the Bloom filter erroneously claims that an element x is
   * in the set when x is not) is roughly p = (1 - e^(-numHashes * size / width)) ^ numHashes
   *
   * However, the true set cardinality may not be known. From empirical evidence, though.
   * Here we make a pessimistic assumption, i.e. that out of n insertions, all n keys were distinct.
   *
   * @return {number} Current probability of a false positive, as a double between 0 and 1.
   */
  falsePositiveProbability() {
    return Math.pow((1 - Math.pow(Math.E, -_numHashes.get(this) * this.size / _numBits.get(this))), _numHashes.get(this));
  }

  /**
   * @name maxRemainingCapacity
   * @for BloomFilter
   * @getter
   * @description
   * The maximum number of elements that can be added to the Bloom filter while guaranteeing the initial requirements for
   * the probability of false positives.
   *
   * @return {number} residual capacity.
   */
  get maxRemainingCapacity() {
    return Math.max(0, _maxSize.get(this) - this.size);
  }
}

export default BloomFilter;