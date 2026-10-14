# Cursor model benchmark: Grok 4.6 High Fast and Grok 4.7 High Fast

Performed in the actual Cursor desktop app on 14 October 2026. Both models received this exact prompt in a new chat:

> Write a dependency-free JavaScript function splitBill(bill, tipPercent, people). Return total, tip and perPerson, rounded to two decimal places. Reject nonnumeric or nonfinite values, a negative bill/tip, and people values that are zero, negative or not integers. Include executable tests for (100,10,2), (100,0,2), (99.99,12.5,3), zero people, negative bill and NaN. Explain how you avoid rounding too early. Do not modify external services.

## Method and limits

The participant ran Grok 4.6 first in an empty folder. Codex ran the identical prompt with Grok 4.7 in a fresh chat in the existing 4.7 calculator workspace; 4.7 inspected that page and also integrated its new standalone function into it. Folder context therefore differs. This is a same-prompt practical comparison, not a controlled speed test or general model ranking. The earlier full-page 4.7 prompt was different and is excluded from this benchmark.

Generated functions and tests were preserved without correcting their math. The 4.6 function is in `grok46-app/splitBill.js`; the new 4.7 output is in `benchmark-grok47/split-bill.js`. Codex added CommonJS package metadata only to make the copied files executable within this repository, ran the tests and wrote this comparison. No external services were modified.

## Results and pros/cons

| Observation | Grok 4.6 High Fast | Grok 4.7 High Fast |
|---|---|---|
| Required normal cases | All three correct | All three correct |
| Required invalid cases | Rejects zero people, negative bill and NaN | Same |
| Generated tests | Six executable assertions, passing | Fourteen executable assertions, passing |
| Rounding | Adds fixed Number.EPSILON before multiplying by 100 | Shifts decimal exponent before rounding |
| Strength | Concise reusable function with clear validation and explanation | Broader tests, including premature-rounding regression; guards nonfinite intermediate results |
| Weakness | Fixed epsilon misses some decimal ties; arithmetic overflow unguarded | More complicated helper; exponent-shift overflow remains possible for huge finite amounts |

Independent common inputs: `(100,10,2)` gives total 110, tip 10, perPerson 55; `(100,0,2)` gives 100, 0, 50; `(99.99,12.5,3)` gives 112.49, 12.5, 37.5. Both keep intermediate tip/total unrounded before dividing.

The additional `(10.075,0,1)` case returns 10.07 in 4.6 and 10.08 in 4.7. For `(1e308,1e308,1)`, 4.6 returns Infinity while 4.7 throws `result is not a finite amount`. However, `(1e307,0,1)` returns Infinity in both because scaling for cent-rounding itself overflows. These are prototype limitations, not silently repaired outputs.

For this task, 4.7 supplied stronger regression coverage and handled the tested decimal tie better; 4.6 supplied a simpler function. One attempt per model and different folder context cannot establish a universal winner.

## Run the preserved tests

```
node cursor/grok46-app/splitBill.test.js
node cursor/benchmark-grok47/split-bill.test.js
```

References: [Cursor documentation](https://cursor.com/docs), [MDN Number.EPSILON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON), [VAT Engine: Why Money Calculations Should Not Use Floating Point](https://dev.to/vat-engine/why-money-calculations-should-not-use-floating-point-3fha).
