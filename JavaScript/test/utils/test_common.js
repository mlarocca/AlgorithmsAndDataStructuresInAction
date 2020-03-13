import chai from "chai";
const expect = chai.expect;

const setDifference = (set1, set2) => new Set([...set1].filter(_ => !set2.has(_)));

export function testAPI(obj, expectedAttributes = [], expectedMethods = [], prototypeMethods = []) {
  expectedMethods.forEach(method => expect(obj).to.respondTo(method));

  let allExpectedProperties = new Set(expectedAttributes.concat(expectedMethods));
  let allProperties = new Set(Object.getOwnPropertyNames(Reflect.getPrototypeOf(obj)));

  expect([...setDifference(allProperties, allExpectedProperties)]).to.be.eql([]);
  expect([...setDifference(allExpectedProperties, allProperties)]).to.be.eql([]);

  if (prototypeMethods.length > 0) {
    let expectedPrototypeMethods = new Set(setDifference(
      new Set(Object.getOwnPropertyNames(Reflect.getPrototypeOf(Reflect.getPrototypeOf((obj))))),
      new Set(expectedMethods.concat(expectedAttributes))));

    prototypeMethods = new Set(prototypeMethods);
    expect([...setDifference(prototypeMethods, expectedPrototypeMethods)]).to.be.eql([]);
    expect([...setDifference(expectedPrototypeMethods, prototypeMethods)]).to.be.eql([]);
  }
}

export function expectSetEquality(collection1, collection2) {
  expect([...setDifference(new Set(collection1), new Set(collection2))]).to.be.eql([]);
}
