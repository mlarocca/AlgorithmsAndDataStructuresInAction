const MURMUR_C1 = 0xcc9e2d51;
const MURMUR_C2 = 0x1b873593;

// 32 bit FNV_Prime = 2**24 + 2**8 + 0x93
const FNV1_PRIME_MUL = hash => (hash << 24) + (hash << 8) + (hash << 7) + (hash << 4) + (hash << 1);
const FNV1_OFFSET_BASIS = 0x811c9dc5;

const ERROR_MSG_HASH_KEY_TYPE = (fname, val) => `Illegal parameter for ${fname}: key = ${val} must be a String`;
const ERROR_MSG_HASH_KEY_EMPTY = fname => `Illegal parameter for ${fname}: key must be a non empty string`;
const ERROR_MSG_HASH_SEED = (fname, val) => `Illegal parameter for ${fname}: seed = ${val} must be a SafeInteger`;

/**
 * @name murmurHash32
 * @description
 * Computes the Murur hash (32 bits) of an ASCII string key.
 *
 * @param {!String} key An ASCII string whose hash needs to be computed
 * @param {?Number} seed Optionally, a seed can be passed. It can be any positive or negative integer, within the range
 *        of safe integers
 * @returns {Number} The murmur hash for `key`, given `seed`.
 * @throws {TypeError(ERROR_MSG_HASH_KEY_TYPE)} If key is not a string.
 * @throws {TypeError(ERROR_MSG_HASH_KEY_EMPTY)} If key is empty.
 * @throws {TypeError(ERROR_MSG_HASH_SEED)} If seed is not a Number.
 */
export function murmurHash32(key, seed = 0) {

  if (typeof key !== 'string') {
    throw new TypeError(ERROR_MSG_HASH_KEY_TYPE('murmurHash32', key));
  }

  if (key.length === 0) {
    throw new TypeError(ERROR_MSG_HASH_KEY_EMPTY('murmurHash32'));
  }

  if (!Number.isSafeInteger(seed)) {
    throw new TypeError(ERROR_MSG_HASH_SEED('murmurHash32', seed));
  }

  let n = key.length;
  let remainder = n & 0b11; // n % 4
  let h1 = seed;

  for (let i = 0; i < n - remainder; i += 4) {
    let k1 = ((key.charCodeAt(i) & 0xff)) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);

    k1 = ((((k1 & 0xffff) * MURMUR_C1) + ((((k1 >>> 16) * MURMUR_C1) & 0xffff) << 16))) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((((k1 & 0xffff) * MURMUR_C2) + ((((k1 >>> 16) * MURMUR_C2) & 0xffff) << 16))) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    let h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
    h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
  }

  if (remainder !== 0) {
    let k1 = 0;
    for (let i = remainder; i > 0; i--) {
      //i can be in the range 1..3
      k1 ^= (key.charCodeAt(n - 1 - (remainder - i)) & 0xff) << (8 * (i - 1));
    }

    k1 = (((k1 & 0xffff) * MURMUR_C1) + ((((k1 >>> 16) * MURMUR_C1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = (((k1 & 0xffff) * MURMUR_C2) + ((((k1 >>> 16) * MURMUR_C2) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= k1;
  }

  h1 ^= n;

  h1 ^= h1 >>> 16;
  h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

/**
 *
 * @param key
 * @returns {number}
 */
export function fnv1Hash32(key) {

  if (typeof key !== 'string') {
    throw new TypeError(ERROR_MSG_HASH_KEY_TYPE('fnv1Hash32', key));
  }

  if (key.length === 0) {
    throw new TypeError(ERROR_MSG_HASH_KEY_EMPTY('fnv1Hash32'));
  }

  let hash = FNV1_OFFSET_BASIS;
  let n = key.length;

  for (let i = 0; i < n; i++) {
    hash ^= key.charCodeAt(i);
    hash += FNV1_PRIME_MUL(hash);
  }

  return hash >>> 0;
}