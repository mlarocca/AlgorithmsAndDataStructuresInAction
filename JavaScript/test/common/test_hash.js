import { fnv1Hash32, murmurHash32 } from '../../src/common/hash.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

const ERROR_MSG_HASH_KEY_TYPE = (fname, val) => `Illegal parameter for ${fname}: key = ${val} must be a String`;
const ERROR_MSG_HASH_KEY_EMPTY = fname => `Illegal parameter for ${fname}: key must be a non empty string`;
const ERROR_MSG_HASH_SEED = (fname, val) => `Illegal parameter for ${fname}: seed = ${val} must be a SafeInteger`;

describe('Murmur Hashing', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(murmurHash32).to.be.a('function');
      murmurHash32.should.have.length(1);
    });

    it('# should fail if mandatory arguments aren\'t provided', () => {
      expect(() => murmurHash32()).to.throw(ERROR_MSG_HASH_KEY_TYPE('murmurHash32'));
    });

    it('# should accept only ASCII strings as first parameter', () => {
      expect(() => murmurHash32(null)).to.throw(ERROR_MSG_HASH_KEY_TYPE('murmurHash32', null));
      expect(() => murmurHash32(1)).to.throw(ERROR_MSG_HASH_KEY_TYPE('murmurHash32', 1));
      expect(() => murmurHash32(['s'])).to.throw(ERROR_MSG_HASH_KEY_TYPE('murmurHash32', ['s']));
      expect(() => murmurHash32({ 's': 't' })).to.throw(ERROR_MSG_HASH_KEY_TYPE('murmurHash32', { 's': 't' }));
      expect(() => murmurHash32(() => 's')).to.throw(ERROR_MSG_HASH_KEY_TYPE('murmurHash32', () => 's'));
    });

    it('# should NOT accept empty strings for `key`', () => {
      expect(() => murmurHash32('')).to.throw(ERROR_MSG_HASH_KEY_EMPTY('murmurHash32'));
    });

    it('# should accept only integers as second parameter', () => {
      expect(() => murmurHash32('xyz', 0.14)).to.throw(ERROR_MSG_HASH_SEED('murmurHash32', 0.14));
      expect(() => murmurHash32('xyz', Number.MIN_SAFE_INTEGER - 1)).to.throw(ERROR_MSG_HASH_SEED('murmurHash32', Number.MIN_SAFE_INTEGER - 1));
      expect(() => murmurHash32('xyz', Number.MAX_SAFE_INTEGER + 1)).to.throw(ERROR_MSG_HASH_SEED('murmurHash32', Number.MAX_SAFE_INTEGER + 1));
      expect(() => murmurHash32('xyz', '5')).to.throw(ERROR_MSG_HASH_SEED('murmurHash32', '5'));
      expect(() => murmurHash32('xyz', [5])).to.throw(ERROR_MSG_HASH_SEED('murmurHash32', [5]));
      expect(() => murmurHash32('xyz', { 's': 't' })).to.throw(ERROR_MSG_HASH_SEED('murmurHash32', { 's': 't' }));
      expect(() => murmurHash32('xyz', { 's': 't' })).to.throw(ERROR_MSG_HASH_SEED('murmurHash32', { 's': 't' }));
    });

    it('# should not throw with valid parametrs', () => {
      expect(() => murmurHash32('x', 5)).not.to.throw();
      expect(() => murmurHash32(' ', 0)).not.to.throw();
      expect(() => murmurHash32(' ', -10)).not.to.throw();
    });
  });

  describe('seed', () => {
    it('# if seed is provided, hash shoulkd change with it', function () {
      let key = Array.from({ length: 1 + Math.trunc(Math.random() * 20) }, () => 'X').join('');
      let seed = 1 + Math.trunc(100 * Math.random());
      expect(murmurHash32(key, seed)).to.be.not.eql(murmurHash32(key, seed + 1));
    });

    it('# if seed is not provided, it\'s set to 0 as default', function () {
      let key = Array.from({ length: 1 + Math.trunc(Math.random() * 20) }, () => 'X').join('');
      expect(murmurHash32(key)).to.be.eql(murmurHash32(key, 0));
    });
  });

  describe('hashing', () => {
    it('# should compute the correct value for default seed', function () {
      let tests = [
        { key: 'a', expectedHash: 1009084850 },
        { key: 'b', expectedHash: 2514386435 },
        { key: 'ab', expectedHash: 2613040991 },
        { key: 'test', expectedHash: 3127628307 },
        { key: 'test1', expectedHash: 374203662 },
        { key: 'test12', expectedHash: 3034137806 },
        { key: 'test123', expectedHash: 2983061069 },
        { key: 'test1234', expectedHash: 3694832822 },
        { key: 'Aa;&1-\\@*Z', expectedHash: 2175417831 }
      ];
      tests.forEach(({ key, expectedHash }) => {
        expect(murmurHash32(key)).to.be.eql(expectedHash);
      });
    });

    it('# should compute the correct value for any seed', function () {
      let tests = [
        { key: 'test', expectedHash: 2579507938, seed: 1 },
        { key: 'test', expectedHash: 1462151947, seed: 2 },
        { key: 'test1', expectedHash: 2099827562, seed: 1 },
        { key: 'test1234Aa;&1-\\@*Z', expectedHash: 3730314204, seed: -1 },
        { key: 'test1234Aa;&1-\\@*Z', expectedHash: 3766982419, seed: Number.MIN_SAFE_INTEGER }
      ];
      tests.forEach(({ key, expectedHash, seed }) => {
        expect(murmurHash32(key, seed)).to.be.eql(expectedHash);
      });
    });
  });
});


describe('FNV1a Hashing', () => {

  describe('API', () => {
    it('# should provide a function with 1 mandatory argument', function () {
      expect(fnv1Hash32).to.be.a('function');
      fnv1Hash32.should.have.length(1);
    });

    it('# should fail if mandatory arguments aren\'t provided', () => {
      expect(() => fnv1Hash32()).to.throw(ERROR_MSG_HASH_KEY_TYPE('fnv1Hash32'));
    });

    it('# should accept only ASCII strings as first parameter', () => {
      expect(() => fnv1Hash32(null)).to.throw(ERROR_MSG_HASH_KEY_TYPE('fnv1Hash32', null));
      expect(() => fnv1Hash32(1)).to.throw(ERROR_MSG_HASH_KEY_TYPE('fnv1Hash32', 1));
      expect(() => fnv1Hash32(['s'])).to.throw(ERROR_MSG_HASH_KEY_TYPE('fnv1Hash32', ['s']));
      expect(() => fnv1Hash32({ 's': 't' })).to.throw(ERROR_MSG_HASH_KEY_TYPE('fnv1Hash32', { 's': 't' }));
      expect(() => fnv1Hash32(() => 's')).to.throw(ERROR_MSG_HASH_KEY_TYPE('fnv1Hash32', () => 's'));
    });

    it('# should NOT accept empty strings for `key`', () => {
      expect(() => fnv1Hash32('')).to.throw(ERROR_MSG_HASH_KEY_EMPTY('fnv1Hash32'));
    });

    it('# should not throw with valid parametrs', () => {
      expect(() => fnv1Hash32('x')).not.to.throw();
      expect(() => fnv1Hash32(' ')).not.to.throw();
    });
  });

  describe('hashing', () => {
    it('# should compute the correct value for default seed', function () {
      let tests = [
        { key: 'a', expectedHash: 3826002220 },
        { key: 'b', expectedHash: 3876335077 },
        { key: 'ab', expectedHash: 1294271946 },
        { key: 'test', expectedHash: 2949673445 },
        { key: 'test1', expectedHash: 2569220284 },
        { key: 'test12', expectedHash: 2691002250 },
        { key: 'test123', expectedHash: 950984763 },
        { key: 'test1234', expectedHash: 1246410653 },
        { key: 'Aa;&1-\\@*Z', expectedHash: 3884774144 }
      ];
      tests.forEach(({ key, expectedHash }) => {
        expect(fnv1Hash32(key)).to.be.eql(expectedHash);
      });
    });
  });
});