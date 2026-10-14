# Tip calculator

A single-page calculator for splitting a bill and tip. It uses HTML, CSS, and vanilla JavaScript only. There is no account, backend, or external dependency.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8765
```

Then visit `http://127.0.0.1:8765`.

## Inputs

- **Bill amount:** a number that is zero or greater, such as `100` or `42.50`
- **Tip percentage:** a number that is zero or greater, such as `10` for 10 percent
- **Number of people:** a positive whole number, such as `2`

Blank, negative, and nonnumeric values are rejected. Decimals and zero are rejected for the number of people.

## Appearance

The Dark mode switch chooses light or dark for this page. The choice is saved in the browser. Before a choice is saved, the page follows the system setting.

## Results

The page shows:

- **Total tip** = bill × (tip percentage / 100)
- **Total bill** = bill + total tip
- **Amount per person** = total bill / number of people

Example: a bill of `100`, a tip of `10`, and `2` people.

- Total tip: $10.00
- Total bill: $110.00
- Amount per person: $55.00
