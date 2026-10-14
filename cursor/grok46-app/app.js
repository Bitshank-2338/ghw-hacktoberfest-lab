(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const form = document.getElementById("split-form");
  const empty = document.getElementById("result-empty");
  const error = document.getElementById("result-error");
  const figures = document.getElementById("result-figures");

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    toggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (ignored) {
      // Private mode can block storage. The toggle still works for this visit.
    }
  }

  applyTheme(currentTheme());

  toggle.addEventListener("click", function () {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    persistTheme(next);
  });

  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (event) {
      if (localStorage.getItem("theme")) {
        return;
      }
      applyTheme(event.matches ? "dark" : "light");
    });
  } catch (ignored) {
    // matchMedia is unavailable in some embedded browsers.
  }

  function readNumber(input) {
    const raw = input.value.trim();
    if (raw === "") {
      return NaN;
    }
    return Number(raw);
  }

  function money(value) {
    return "$" + value.toFixed(2);
  }

  function showEmpty() {
    empty.hidden = false;
    error.hidden = true;
    figures.hidden = true;
  }

  function showError(message) {
    empty.hidden = true;
    figures.hidden = true;
    error.hidden = false;
    error.textContent = message;
  }

  function showResult(split) {
    empty.hidden = true;
    error.hidden = true;
    figures.hidden = false;
    document.getElementById("out-total").textContent = money(split.total);
    document.getElementById("out-tip").textContent = money(split.tip);
    document.getElementById("out-each").textContent = money(split.perPerson);
  }

  function friendlyError(err) {
    if (err instanceof TypeError) {
      return "Use regular numbers only. Blank fields do not work.";
    }
    if (/bill/.test(err.message)) {
      return "Bill cannot be negative.";
    }
    if (/tip/.test(err.message)) {
      return "Tip cannot be negative.";
    }
    if (/people/.test(err.message)) {
      return "People must be a whole number of at least 1.";
    }
    return err.message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    try {
      const split = splitBill(
        readNumber(form.bill),
        readNumber(form.tip),
        readNumber(form.people)
      );
      showResult(split);
    } catch (err) {
      showError(friendlyError(err));
    }
  });

  showEmpty();
})();
