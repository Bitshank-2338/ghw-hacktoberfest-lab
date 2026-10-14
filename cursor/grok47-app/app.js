(function () {
  var themeKey = "tip-calculator-theme";
  var themeSwitch = document.getElementById("theme-switch");
  var themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
  var form = document.getElementById("tip-form");
  var billInput = document.getElementById("bill");
  var tipInput = document.getElementById("tip");
  var peopleInput = document.getElementById("people");
  var status = document.getElementById("results-status");
  var figures = document.querySelector(".figures");
  var totalBill = document.getElementById("total-bill");
  var totalTip = document.getElementById("total-tip");
  var perPerson = document.getElementById("per-person");

  var currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  var fields = [
    {
      input: billInput,
      error: document.getElementById("bill-error"),
      integer: false,
      messages: {
        blank: "Enter a bill amount.",
        nonnumeric: "Enter the bill amount using numbers only.",
        negative: "Bill amount cannot be negative.",
      },
    },
    {
      input: tipInput,
      error: document.getElementById("tip-error"),
      integer: false,
      messages: {
        blank: "Enter a tip percentage.",
        nonnumeric: "Enter the tip percentage using numbers only.",
        negative: "Tip percentage cannot be negative.",
      },
    },
    {
      input: peopleInput,
      error: document.getElementById("people-error"),
      integer: true,
      messages: {
        blank: "Enter the number of people.",
        nonnumeric: "Enter the number of people using numbers only.",
        negative: "Number of people cannot be negative.",
        integer: "Number of people must be a positive whole number.",
      },
    },
  ];

  function storedTheme() {
    try {
      return localStorage.getItem(themeKey);
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return themeMedia.matches ? "dark" : "light";
  }

  function activeTheme() {
    var chosen = document.documentElement.getAttribute("data-theme");
    if (chosen === "light" || chosen === "dark") {
      return chosen;
    }
    return systemTheme();
  }

  function syncThemeSwitch() {
    var dark = activeTheme() === "dark";
    themeSwitch.setAttribute("aria-checked", dark ? "true" : "false");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    syncThemeSwitch();
  }

  syncThemeSwitch();

  themeSwitch.addEventListener("click", function () {
    var next = activeTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(themeKey, next);
    } catch (error) {
      /* The switch still changes the page for this visit. */
    }
  });

  themeMedia.addEventListener("change", function () {
    var saved = storedTheme();
    if (saved === "light" || saved === "dark") {
      return;
    }
    document.documentElement.removeAttribute("data-theme");
    syncThemeSwitch();
  });

  function classify(raw, integer) {
    var value = raw.trim();
    if (value === "") {
      return { ok: false, reason: "blank" };
    }

    var negative = value.charAt(0) === "-";
    var unsigned = negative ? value.slice(1).trim() : value;
    var numeric = /^(?:\d+\.?\d*|\.\d+)$/.test(unsigned);

    if (!numeric) {
      return { ok: false, reason: "nonnumeric" };
    }

    if (negative) {
      return { ok: false, reason: "negative" };
    }

    var number = Number(unsigned);
    if (!Number.isFinite(number)) {
      return { ok: false, reason: "nonnumeric" };
    }

    if (integer && (!Number.isInteger(number) || number < 1)) {
      return { ok: false, reason: "integer" };
    }

    return { ok: true, number: number };
  }

  function setError(field, message) {
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearResults() {
    figures.hidden = true;
    status.hidden = false;
    status.textContent = "Fix the highlighted fields to see the split.";
  }

  function showResults(bill, tipPercent, people) {
    var tipAmount = bill * (tipPercent / 100);
    var billTotal = bill + tipAmount;
    var share = billTotal / people;

    totalTip.textContent = currency.format(tipAmount);
    totalBill.textContent = currency.format(billTotal);
    perPerson.textContent = currency.format(share);

    status.hidden = true;
    figures.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstInvalid = null;
    var parsed = [];
    var valid = true;

    fields.forEach(function (field) {
      var result = classify(field.input.value, field.integer);
      if (!result.ok) {
        valid = false;
        setError(field, field.messages[result.reason]);
        if (!firstInvalid) {
          firstInvalid = field.input;
        }
      } else {
        setError(field, "");
        parsed.push(result.number);
      }
    });

    if (!valid) {
      clearResults();
      firstInvalid.focus();
      return;
    }

    showResults(parsed[0], parsed[1], parsed[2]);
  });
})();
