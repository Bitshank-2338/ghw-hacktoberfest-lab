/**
 * Split a bill including tip among an integer number of people.
 *
 * Rounding is applied only to the returned values. The tip is computed
 * from the raw bill, the total is bill + that unrounded tip, and
 * per-person is that unrounded total divided by people. Rounding the tip
 * or total before those later steps would shift the remaining cents.
 *
 * @param {number} bill        Amount before tip. Must be finite and >= 0.
 * @param {number} tipPercent  Tip as a percent. Must be finite and >= 0.
 * @param {number} people      Party size. Must be a finite integer >= 1.
 * @returns {{ total: number, tip: number, perPerson: number }}
 */
function splitBill(bill, tipPercent, people) {
  assertFiniteNumber(bill, "bill");
  assertFiniteNumber(tipPercent, "tipPercent");
  assertFiniteNumber(people, "people");

  if (bill < 0) {
    throw new RangeError("bill must not be negative");
  }
  if (tipPercent < 0) {
    throw new RangeError("tipPercent must not be negative");
  }
  if (!Number.isInteger(people) || people < 1) {
    throw new RangeError("people must be an integer of at least 1");
  }

  const tip = bill * (tipPercent / 100);
  const total = bill + tip;
  const perPerson = total / people;

  return {
    total: roundToCents(total),
    tip: roundToCents(tip),
    perPerson: roundToCents(perPerson),
  };
}

function assertFiniteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function roundToCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { splitBill };
}
