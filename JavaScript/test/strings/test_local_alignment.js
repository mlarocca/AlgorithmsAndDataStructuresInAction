import LocalAlignment from '../../src/strings/local_alignment.js';
import { identity } from '../../src/common/basic.js';
import { ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.js';
import { testAPI } from '../utils/test_common.js';

import 'mjs-mocha';
import chai from "chai";
import should from "should";
const expect = chai.expect;

describe('LocalAlignment API', () => {

  it('# should have a constructor method', function () {
    LocalAlignment.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let nw = new LocalAlignment(identity, 1);

    let methods = ['constructor', 'alignment'];
    let attributes = [];
    testAPI(nw, attributes, methods);
  });
});

describe('LocalAlignment Creation', () => {
  describe('# Parameters', () => {
    it('should throw when no costMatch is passed', () => {
      expect(() => new LocalAlignment()).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costMatch', undefined, 'function'));
    });

    it('should throw when costMatch is not a valid function', () => {
      expect(() => new LocalAlignment(null)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costMatch', null, 'function'));
      expect(() => new LocalAlignment('a')).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costMatch', 'a', 'function'));
      expect(() => new LocalAlignment([])).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costMatch', [], 'function'));
      expect(() => new LocalAlignment({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costMatch', { '4': 4 }, 'function'));
    });

    it('should throw when no costGap is passed', () => {
      expect(() => new LocalAlignment(identity)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costGap', undefined, 'number'));
    });

    it('should throw when costGap is not a valid number', () => {
      expect(() => new LocalAlignment(identity, null)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costGap', null, 'number'));
      expect(() => new LocalAlignment(identity, 'a')).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costGap', 'a', 'number'));
      expect(() => new LocalAlignment(identity, [])).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costGap', [], 'number'));
      expect(() => new LocalAlignment(identity, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'costGap', { '4': 4 }, 'number'));
    });

    it('should throw when placeholder is passed but it is not a string of length 1', () => {
      expect(() => new LocalAlignment(identity, 0, null)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'placeholder', null, 'string[1]'));
      expect(() => new LocalAlignment(identity, 0, [])).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'placeholder', [], 'string[1]'));
      expect(() => new LocalAlignment(identity, 0, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'placeholder', { '4': 4 }, 'string[1]'));
      expect(() => new LocalAlignment(identity, 0, 'ab')).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'placeholder', 'ab', 'string[1]'));
      expect(() => new LocalAlignment(identity, 0, '')).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.constructor', 'placeholder', '', 'string[1]'));
    });

    it('should not throw with valid parameters', () => {
      expect(() => new LocalAlignment(identity, 0)).not.to.throw();
      expect(() => new LocalAlignment(identity, 1e45, '8')).not.to.throw();
    });

    it('should not throw with valid parameters', () => {
      expect(() => new LocalAlignment(identity, 0)).not.to.throw();
    });
  });
});

describe('Methods', () => {
  describe('alignment()', () => {
    const substitutionMatrix = {
      'A': {
        'A': 3,
        'T': -1,
        'C': -3,
        'G': -3
      },
      'C': {
        'A': -3,
        'T': -3,
        'C': 3,
        'G': -1
      },
      'G': {
        'A': -3,
        'T': -3,
        'C': -1,
        'G': 3
      },
      'T': {
        'A': -1,
        'T': 3,
        'C': -3,
        'G': -3
      }
    };

    const costSub = (a, b) => {
      if (a > b) {
        [a, b] = [b, a];
      }
      return substitutionMatrix[a][b];
    };

    let sw;

    describe('API', () => {
      beforeEach(() => {
        sw = new LocalAlignment(costSub, -2);
      });

      it('should expect 2 mandatory arguments', () => {
        sw.alignment.length.should.eql(2);
      });

      it('should throw if the first argument is not a valid string', () => {
        expect(() => sw.alignment([])).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'pattern', [], 'string'));
        expect(() => sw.alignment(false)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'pattern', false, 'string'));
        expect(() => sw.alignment(55)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'pattern', 55, 'string'));
        expect(() => sw.alignment({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'pattern', { '4': 4 }, 'string'));
      });

      it('should throw if the second argument is not a valid string', () => {
        expect(() => sw.alignment('', [])).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'text', [], 'string'));
        expect(() => sw.alignment('', false)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'text', false, 'string'));
        expect(() => sw.alignment('', 55)).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'text', 55, 'string'));
        expect(() => sw.alignment('', { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('LocalAlignment.alignment', 'text', { '4': 4 }, 'string'));
      });

      it('should accept proper values for the arguments', () => {
        expect(() => sw.alignment('', '')).not.to.throw();
        expect(() => sw.alignment('', '123')).not.to.throw();
        expect(() => sw.alignment('ABC', '')).not.to.throw();
        expect(() => sw.alignment('A', 'T')).not.to.throw();
        expect(() => sw.alignment('AT', 'T')).not.to.throw();
      });
    });

    describe('Behaviour', () => {
      beforeEach(() => {
        sw = new LocalAlignment(costSub, -2);
      });

      const makeAlignmentResult = (pattern, text, similarity) => ({
        pattern: pattern,
        text: text,
        similarity: similarity
      });

      it('should return the actual alignment', () => {
        let smithWat = new LocalAlignment((a, b) => a === b ? 2 : 1, -1);

        smithWat.alignment('', 'ab').should.be.eql(makeAlignmentResult('', '', 0));
        smithWat.alignment('abcd', '').should.be.eql(makeAlignmentResult('', '', 0));
        smithWat.alignment('abcd', 'aacd').should.be.eql(makeAlignmentResult('abcd', 'aacd', 7));
        smithWat.alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('abbc', 'acef', 5));

        // This model rewards substitution over gap
        smithWat.alignment('ATTGGC', 'TATGA').should.be.eql(makeAlignmentResult('ATTGG', 'TATGA', 7));
        // This model instead penalizes gap less than substitution
        sw.alignment('ATTGGC', 'TATGA').should.be.eql(makeAlignmentResult('T-TG', 'TATG', 7));

        // This model penalizes substitution more than gap
        smithWat = new LocalAlignment((a, b) => a === b ? 2 : -1, -0.6);

        smithWat.alignment('', 'ab').should.be.eql(makeAlignmentResult('', '', 0));
        smithWat.alignment('abcd', '').should.be.eql(makeAlignmentResult('', '', 0));
        smithWat.alignment('abcd', 'aacd').should.be.eql(makeAlignmentResult('abcd', 'a-cd', 5.4)); //Here the 'a' in the second alignment is the second one in text
        smithWat.alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('abbc', 'a--c', 2.8));
        smithWat.alignment('ATTGGC', 'TATGA').should.be.eql(makeAlignmentResult('T-TG', 'TATG', 5.4));

        // This model penalizes gap more than it rewards match
        smithWat = new LocalAlignment((a, b) => a === b ? 0.4 : -1, -0.6);

        smithWat.alignment('', 'ab').should.be.eql(makeAlignmentResult('', '', 0));
        smithWat.alignment('abcd', '').should.be.eql(makeAlignmentResult('', '', 0));
        smithWat.alignment('abcd', 'aacd').should.be.eql(makeAlignmentResult('cd', 'cd', 0.8)); //Here the 'a' in the second alignment is the second one in text
        smithWat.alignment('0abbcd', 'acef').should.be.eql(makeAlignmentResult('a', 'a', 0.4));
        smithWat.alignment('ATTGGC', 'TATGA').should.be.eql(makeAlignmentResult('AT', 'AT', 0.8));
      });
    });
  });
});