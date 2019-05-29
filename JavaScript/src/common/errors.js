/**
 * COMMON ERROR MESSAGES
 */
export const ERROR_MSG_INVALID_ARGUMENT = (methodName, argName, argValue) => `Invalid argument ${argName} = ${argValue} for ${methodName}`;
export const ERROR_MSG_ARGUMENT_TYPE = (fname, pname, val, type) => `Illegal argument for ${fname}: ${pname} = ${val} must be a ${type}`;
export const ERROR_MSG_METHOD_UNIMPLEMENTED = (fname) => `Method ${fname} is yet to be implemented`;
export const ERROR_MSG_PARAM_UNDEFINED = (fname, pname) => `Illegal argument for ${fname}: ${pname} must be defined`;
export const ERROR_MSG_PARAM_EMPTY_ARRAY = (fname, pname) => `Illegal argument for ${fname}: array ${pname} is empty`;
export const ERROR_MSG_TOO_FEW_ARGUMENTS = (fname, expected, actual) => `Not enough arguments for ${fname}: received ${actual} instead of ${expected}`;
export const ERROR_MSG_INDEX_OUT_OF_BOUNDARIES = (fname, pname, i) => `Index out of boudaries in ${fname} for ${pname}: ${i}`;
export const ERROR_MSG_POSITION_OUT_OF_BOUNDARIES = (fname, pname, i) => `Position out of boudaries in ${fname} for ${pname}: ${i}`;
export const ERROR_MSG_INVALID_DISTANCE = (fname, val, pname = 'distance') => `Illegal argument for ${fname}: ${pname} = ${val} must be a valid distance (a non-negative number)`;
export const ERROR_MSG_INVALID_DIMENSION_INDEX = (fname, val, dimensionality = 1) =>
  `Illegal argument for ${fname}: the dimension index must be an integer between 0 and ${dimensionality - 1}, instead ${val} was passed`;
export const ERROR_MSG_PARAM_TYPE = (fname, pname, val, type) => `Illegal argument for ${fname}: ${pname} = ${val} must be a ${type}`;
//numbers
export const ERROR_MSG_RANGE_LOWER = (fname, val) => `Illegal argument for ${fname}: a = ${val} must be a SafeInteger`;
export const ERROR_MSG_RANGE_UPPER = (fname, val) => `Illegal argument for ${fname}: b = ${val} must be a SafeInteger`;
export const ERROR_MSG_RANGE_STEP = (fname, val) => `Illegal argument for ${fname}: step = ${val} must be a positive SafeInteger`;
export const ERROR_MSG_RANGE_BOUNDARIES = (fname, a, b) => `Illegal argument for ${fname}: must be a <[=] b, but ${a} >[=] ${b}`;
export const ERROR_MSG_RANGE_TOO_LARGE = (fname, a, b) => `Illegal argument for ${fname}: range [${a}, ${b}] is too large to be allocated`;
//strings
export const ERROR_MSG_RANDOM_STRING_LENGTH = val => `Illegal argument for randomString: length = ${val} must be a non-negative SafeInteger`;
export const ERROR_MSG_RANDOM_STRING_TOO_LARGE = val => `Illegal argument for randomString: length ${val} is too large to be allocated`;