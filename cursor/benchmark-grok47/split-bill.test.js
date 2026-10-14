"use strict";

var assert = require("node:assert/strict");
var splitBill = require("./split-bill").splitBill;

function money(bill, tipPercent, people, expected) {
  assert.deepStrictEqual(splitBill(bill, tipPercent, people), expected);
}

function rejects(args, check) {
  assert.throws(function () {
    splitBill(args[0], args[1], args[2]);
  }, check);
}

money(100, 10, 2, { total: 110, tip: 10, perPerson: 55 });
money(100, 0, 2, { total: 100, tip: 0, perPerson: 50 });
money(99.99, 12.5, 3, { total: 112.49, tip: 12.5, perPerson: 37.5 });

// 0.04 * 12.5% is 0.005 exactly at full precision, and the total is 0.045.
// Each share of that unrounded total is 0.0225, which rounds to 0.02.
// Dividing the already rounded total (0.05 / 2 = 0.025) would round to 0.03.
money(0.04, 12.5, 2, { total: 0.05, tip: 0.01, perPerson: 0.02 });

rejects([80, 15, 0], function (error) {
  return error instanceof RangeError && /positive integer/.test(error.message);
});

rejects([-20, 15, 2], function (error) {
  return error instanceof RangeError && /bill cannot be negative/.test(error.message);
});

rejects([NaN, 15, 2], function (error) {
  return error instanceof TypeError && /bill must be a finite number/.test(error.message);
});

rejects([50, -5, 2], function (error) {
  return error instanceof RangeError && /tipPercent cannot be negative/.test(error.message);
});

rejects([50, 10, 2.5], function (error) {
  return error instanceof RangeError && /positive integer/.test(error.message);
});

rejects([50, 10, -3], function (error) {
  return error instanceof RangeError && /positive integer/.test(error.message);
});

rejects([Infinity, 10, 2], function (error) {
  return error instanceof TypeError && /bill must be a finite number/.test(error.message);
});

rejects(["100", 10, 2], function (error) {
  return error instanceof TypeError && /bill must be a finite number/.test(error.message);
});

rejects([100, NaN, 2], function (error) {
  return error instanceof TypeError && /tipPercent must be a finite number/.test(error.message);
});

rejects([100, 10, NaN], function (error) {
  return error instanceof TypeError && /people must be a finite number/.test(error.message);
});

console.log("split-bill tests passed");
