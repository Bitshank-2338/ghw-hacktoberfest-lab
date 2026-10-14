# Cursor: Grok 4.6 High Fast versus Grok 4.7 High Fast

Inspected on 14 October 2026. These are the participant's actual Cursor builds, not code recreated by Codex. Model names were visible in the original desktop chats. Source copies preserve the generated calculation and interface logic.

## Original prompts and limits

Grok 4.7 received: “Build a single-page tip calculator using only HTML, CSS and vanilla JavaScript. Create index.html, style.css, app.js and README.md. Inputs: bill amount, tip percentage and number of people. Display total bill, total tip and amount per person. Validate blank, negative and nonnumeric values; people must be a positive integer. Use accessible labels and a responsive layout. No backend, account or external dependencies. Run it locally and check a bill of 100, tip 10%, people 2 gives 55 per person. Do not publish or provision anything”. It then received “add a working dark and light-mode switch”.

Grok 4.6 received: “Write a dependency-free JavaScript function splitBill(bill, tipPercent, people). Return total, tip and perPerson, rounded to two decimal places. Reject nonnumeric or nonfinite values, a negative bill/tip, and people values that are zero, negative or not integers. Include executable tests for (100,10,2), (100,0,2), (99.99,12.5,3), zero people, negative bill and NaN. Explain how you avoid rounding too early. Do not modify external services.” It then received “add a toggle switch for dark mode and light mode”, and generated a UI around its function.

The original prompts are different. These observations compare two implementations of the same bill-splitting problem; they do not establish a controlled model-performance ranking or satisfy a same-prompt benchmark by themselves. One run per model cannot establish a general winner. Times shown in Cursor include tool/browser work and are not comparable generation-speed measurements.

## Observed implementation differences

| Area | Grok 4.7 High Fast | Grok 4.6 High Fast |
|---|---|---|
| Structure | Four static files including README; calculation inside the page's IIFE | Reusable splitBill function, independent executable tests, and separate UI adapter |
| Validation | Detailed field-specific messages, aria-invalid state and focus on first invalid input | Typed TypeError/RangeError checks; friendly summary error in UI |
| Money display | Intl.NumberFormat for USD, calculation kept unrounded until display | Math.round((value + Number.EPSILON) * 100) / 100, then UI toFixed(2) |
| Theme | Accessible switch, saved preference and system preference handling | Accessible light/dark switch and saved preference; system preference listener |
| Strength observed | Complete usable page and helpful local README | Easier-to-test pure calculation function and six executable checks |
| Limitation observed | No standalone calculation tests in original output; no guard for arithmetic overflow | Fixed epsilon does not handle every decimal rounding boundary; no guard for arithmetic overflow |

## Independent verification

Both original pages were tested in a browser at their actual local servers, not just inspected as code. Both returned the correct normal results and rejected zero people and a negative bill. Grok 4.7's theme selection persisted after reload. Grok 4.6's provided six assertions passed; seven further invalid-number/type cases were rejected correctly.

| Input bill/tip/people | Grok 4.7 page | Grok 4.6 page/function |
|---|---|---|
| 100 / 10 / 2 | Total 110.00, tip 10.00, each 55.00 | Same |
| 100 / 0 / 2 | Total 100.00, tip 0.00, each 50.00 | Same |
| 99.99 / 12.5 / 3 | Total 112.49, tip 12.50, each 37.50 | Same |
| 100 / 10 / 0 | Positive-whole-number error | Positive-whole-number error |
| -1 / 10 / 2 | Negative-bill error | Negative-bill error |
| 10.075 / 0 / 1 | Displays 10.08 | Returns/displays 10.07 |

The decimal tie case illustrates why adding a constant Number.EPSILON is not a general financial-rounding strategy. This is a demo comparison, not payment/accounting software certification. Extremely large but finite operands also overflow: the 4.6 function returns Infinity, and 4.7's corresponding display calculation formats infinity. Preserve these observations rather than silently repairing the generated output before comparison.

## Submission-ready mini-app description

I built a single-page tip calculator in Cursor using Grok 4.7 High Fast. Cursor generated the HTML, CSS, JavaScript and README, then added an accessible dark/light switch with saved preferences; I checked the normal bill split, zero-tip calculation and invalid inputs in the running app.

## References

* [Number.EPSILON — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON)
* [Intl.NumberFormat — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
* [Why Money Calculations Should Not Use Floating Point — VAT Engine](https://dev.to/vat-engine/why-money-calculations-should-not-use-floating-point-3fha)

Codex inspected, tested and wrote this analysis. Cursor/Grok generated the two original applications. No timing winner or same-prompt claim is made for the original runs.
