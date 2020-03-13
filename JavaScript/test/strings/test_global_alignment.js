import GlobalAlignment from '../../src/strings/global_alignment.js';
import { ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';
import { testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

describe('GlobalAlignment API', () => {

  it('# should have a constructor method', function () {
    GlobalAlignment.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let nw = new GlobalAlignment(0, 1, 2);

    let methods = ['constructor', 'distance', 'alignment'];
    let attributes = [];
    testAPI(nw, attributes, methods);
  });
});

describe('GlobalAlignment Creation', () => {
  describe('# Parameters', () => {
    it('should throw when no costSubstitute is passed', () => {
      expect(() => new GlobalAlignment()).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costSubstitute', undefined, 'number'));
    });

    it('should throw when costSubstitute is not a valid number', () => {
      expect(() => new GlobalAlignment(null)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costSubstitute', null, 'number'));
      expect(() => new GlobalAlignment('a')).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costSubstitute', 'a', 'number'));
      expect(() => new GlobalAlignment([])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costSubstitute', [], 'number'));
      expect(() => new GlobalAlignment({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costSubstitute', { '4': 4 }, 'number'));
    });

    it('should throw when no costInsert is passed', () => {
      expect(() => new GlobalAlignment(0)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costInsert', undefined, 'number'));
    });

    it('should throw when costInsert is not a valid number', () => {
      expect(() => new GlobalAlignment(0, null)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costInsert', null, 'number'));
      expect(() => new GlobalAlignment(0, 'a')).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costInsert', 'a', 'number'));
      expect(() => new GlobalAlignment(0, [])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costInsert', [], 'number'));
      expect(() => new GlobalAlignment(0, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costInsert', { '4': 4 }, 'number'));
    });

    it('should throw when no costDelete is passed', () => {
      expect(() => new GlobalAlignment(0, 0)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costDelete', undefined, 'number'));
    });

    it('should throw when costDelete is not a valid number', () => {
      expect(() => new GlobalAlignment(0, 0, null)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costDelete', null, 'number'));
      expect(() => new GlobalAlignment(0, 0, 'a')).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costDelete', 'a', 'number'));
      expect(() => new GlobalAlignment(0, 0, [])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costDelete', [], 'number'));
      expect(() => new GlobalAlignment(0, 0, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'costDelete', { '4': 4 }, 'number'));
    });

    it('should throw when placeholder is passed but it is not a string of length 1', () => {
      expect(() => new GlobalAlignment(0, 0, 0, null)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'placeholder', null, 'string[1]'));
      expect(() => new GlobalAlignment(0, 0, 0, [])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'placeholder', [], 'string[1]'));
      expect(() => new GlobalAlignment(0, 0, 0, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'placeholder', { '4': 4 }, 'string[1]'));
      expect(() => new GlobalAlignment(0, 0, 0, 'ab')).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'placeholder', 'ab', 'string[1]'));
      expect(() => new GlobalAlignment(0, 0, 0, '')).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.constructor', 'placeholder', '', 'string[1]'));
    });

    it('should not throw with valid parameters', () => {
      expect(() => new GlobalAlignment(-1, 0, 1.1)).not.to.throw();
      expect(() => new GlobalAlignment(-0.123, 1e45, 0, '8')).not.to.throw();
    });

    it('should not throw with valid parameters', () => {
      expect(() => new GlobalAlignment(-1, 0, 1.1)).not.to.throw();
    });
  });
});

describe('Methods', () => {
  describe('distance()', () => {
    let nw;

    describe('API', () => {
      beforeEach(() => {
        nw = new GlobalAlignment(0, 1, 2);
      });

      it('should expect 2 mandatory arguments', () => {
        nw.distance.length.should.eql(2);
      });

      it('should throw if the first argument is not a valid string', () => {
        expect(() => nw.distance([])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'pattern', [], 'string'));
        expect(() => nw.distance(false)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'pattern', false, 'string'));
        expect(() => nw.distance(55)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'pattern', 55, 'string'));
        expect(() => nw.distance({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'pattern', { '4': 4 }, 'string'));
      });

      it('should throw if the second argument is not a valid string', () => {
        expect(() => nw.distance('', [])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'text', [], 'string'));
        expect(() => nw.distance('', false)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'text', false, 'string'));
        expect(() => nw.distance('', 55)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'text', 55, 'string'));
        expect(() => nw.distance('', { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.distance', 'text', { '4': 4 }, 'string'));
      });

      it('should accept proper values for the arguments', () => {
        expect(() => nw.distance('', '')).not.to.throw();
        expect(() => nw.distance('', '123')).not.to.throw();
        expect(() => nw.distance('ABC', '')).not.to.throw();
        expect(() => nw.distance('a', 'b')).not.to.throw();
        expect(() => nw.distance('ab', 'b')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      beforeEach(() => {
        nw = new GlobalAlignment(0, 1, 2);
      });

      it('should return the actual distance', () => {
        const needWun = new GlobalAlignment(3, 5, 7);

        needWun.distance('', 'ab').should.be.eql(10);
        needWun.distance('abcd', '').should.be.eql(28);
        needWun.distance('abcd', 'aacd').should.be.eql(3);
        needWun.distance('0abbcd', 'acef').should.be.eql(23);
        nw.distance('0abbcd', 'acef').should.be.eql(4);
      });
    });
  });

  describe('alignment()', () => {
    let nw;

    describe('API', () => {
      beforeEach(() => {
        nw = new GlobalAlignment(0, 1, 2);
      });

      it('should expect 2 mandatory arguments', () => {
        nw.alignment.length.should.eql(2);
      });

      it('should throw if the first argument is not a valid string', () => {
        expect(() => nw.alignment([])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'pattern', [], 'string'));
        expect(() => nw.alignment(false)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'pattern', false, 'string'));
        expect(() => nw.alignment(55)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'pattern', 55, 'string'));
        expect(() => nw.alignment({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'pattern', { '4': 4 }, 'string'));
      });

      it('should throw if the second argument is not a valid string', () => {
        expect(() => nw.alignment('', [])).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'text', [], 'string'));
        expect(() => nw.alignment('', false)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'text', false, 'string'));
        expect(() => nw.alignment('', 55)).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'text', 55, 'string'));
        expect(() => nw.alignment('', { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('GlobalAlignment.alignment', 'text', { '4': 4 }, 'string'));
      });

      it('should accept proper values for the arguments', () => {
        expect(() => nw.alignment('', '')).not.to.throw();
        expect(() => nw.alignment('', '123')).not.to.throw();
        expect(() => nw.alignment('ABC', '')).not.to.throw();
        expect(() => nw.alignment('a', 'b')).not.to.throw();
        expect(() => nw.alignment('ab', 'b')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      beforeEach(() => {
        nw = new GlobalAlignment(0, 1, 2);
      });

      const makeAlignmentResult = (pattern, text) => ({
        pattern: pattern,
        text: text
      });

      it('should return the actual alignment', () => {
        const needWun = new GlobalAlignment(3, 5, 7);

        needWun.alignment('', 'ab').should.be.eql(makeAlignmentResult('--', 'ab'));
        needWun.alignment('abcd', '').should.be.eql(makeAlignmentResult('abcd', '----'));
        needWun.alignment('abcd', 'aacd').should.be.eql(makeAlignmentResult('abcd', 'aacd'));
        needWun.alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('0abbcd', '-a-cef'));
        nw.alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('0abbcd', '--acef'));
        new GlobalAlignment(3, 7, 5).alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('0abbcd', '-a-cef'));
        new GlobalAlignment(43, 7, 5).alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('0abbcd--', '-a--c-ef'));
        new GlobalAlignment(1, 1, 1).alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('0abbcd', '-a-cef'));
        new GlobalAlignment(1, 1, 1, '@').alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('0abbcd', '@a@cef'));
      });
    });
  });
});