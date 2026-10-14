(function (root) {
  "use strict";

  // Move the decimal point with a decimal exponent, then round once.
  // Multiplying a binary float by 100 can turn 1.005 into 100.49999999999999,
  // so Math.round would send that value to 1.00 instead of 1.01.
  function roundToCents(amount) {
    var text = amount.toExponential();
    var match = /^(-?)(\d+(?:\.\d+)?)e([+-]?\d+)$/.exec(text);
    if (!match) {
      throw new TypeError("amount cannot be rounded");
    }

    var sign = match[1];
    var digits = match[2];
    var exponent = Number(match[3]) + 2;
    var scaled = Number(sign + digits + "e" + exponent);
    var rounded = Number(Math.round(scaled) + "e-2");
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  function requireFiniteNumber(value, label) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(label + " must be a finite number");
    }
  }

  function splitBill(bill, tipPercent, people) {
    requireFiniteNumber(bill, "bill");
    requireFiniteNumber(tipPercent, "tipPercent");
    requireFiniteNumber(people, "people");

    if (bill < 0) {
      throw new RangeError("bill cannot be negative");
    }
    if (tipPercent < 0) {
      throw new RangeError("tipPercent cannot be negative");
    }
    if (!Number.isInteger(people) || people < 1) {
      throw new RangeError("people must be a positive integer");
    }

    // Keep every intermediate value at full precision. Rounding the tip
    // before adding it, or the total before dividing, drops fractional
    // cents that can still change the next amount.
    var tip = bill * (tipPercent / 100);
    var total = bill + tip;
    var perPerson = total / people;

    if (!Number.isFinite(tip) || !Number.isFinite(total) || !Number.isFinite(perPerson)) {
      throw new RangeError("result is not a finite amount");
    }

    return {
      total: roundToCents(total),
      tip: roundToCents(tip),
      perPerson: roundToCents(perPerson),
    };
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { splitBill: splitBill };
  }

  root.splitBill = splitBill;
})(typeof globalThis !== "undefined" ? globalThis : this);
