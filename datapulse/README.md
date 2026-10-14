# DataPulse Sensor Dashboard

DataPulse is a polished, responsive static dashboard for exploring realistic IoT temperature and humidity readings. It is built with plain HTML, CSS, and vanilla JavaScript; there is no backend, build step, framework, or external dependency.

## Run locally

Open `index.html` directly in a modern browser, or serve the folder with any local static server:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Features

- Responsive dashboard layout with summary cards for temperature, humidity, device activity, and system status.
- Canvas temperature trend chart that redraws for high-density screens and responsive widths.
- Filterable sensor readings table by device and location.
- Generate randomized sample data, reset the dashboard, and export readings to CSV.
- Working local login dialog, profile menu, sign-out flow, notification/help feedback, chart range control, health details, and table pagination.
- Accessible form labels, table caption, status announcements, semantic navigation, keyboard-friendly buttons, and mobile layouts.
- Empty-state messaging when filters match no readings, plus an error-state surface ready for failed data loading.

## How GitHub Copilot helped

GitHub Copilot helped create the initial dashboard structure, visual system, realistic sample data model, canvas chart rendering, filtering/export interactions, responsive CSS, and this documentation. The implementation was then reviewed as a static app to keep the code dependency-free and to verify that local asset links and browser-side behavior are self-contained.
