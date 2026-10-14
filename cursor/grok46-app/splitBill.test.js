const assert = require("assert");
const { splitBill } = require("./splitBill");

function expectThrow(fn, ErrorType, label) {
  assert.throws(fn, ErrorType, label);
}

// Happy path: 10% tip on 100, split two ways.
assert.deepStrictEqual(splitBill(100, 10, 2), {
  total: 110,
  tip: 10,
  perPerson: 55,
});

// Zero tip is allowed; the bill is unchanged.
assert.deepStrictEqual(splitBill(100, 0, 2), {
  total: 100,
  tip: 0,
  perPerson: 50,
});

// Full-precision math before rounding:
//   tip      = 99.99 * 12.5 / 100 = 12.49875  → 12.50
//   total    = 99.99 + 12.49875   = 112.48875 → 112.49
//   perPerson= 112.48875 / 3      = 37.49625  → 37.50
assert.deepStrictEqual(splitBill(99.99, 12.5, 3), {
  total: 112.49,
  tip: 12.5,
  perPerson: 37.5,
});

expectThrow(() => splitBill(100, 10, 0), RangeError, "zero people");
expectThrow(() => splitBill(-1, 10, 2), RangeError, "negative bill");
expectThrow(() => splitBill(NaN, 10, 2), TypeError, "NaN bill");

console.log("All splitBill tests passed.");
