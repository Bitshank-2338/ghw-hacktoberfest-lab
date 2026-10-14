(() => {
  "use strict";

  const baseReadings = [
    { timestamp: "10:42 AM", device: "DP-1042", location: "Greenhouse A", temperature: 23.8, humidity: 52.4, status: "Online" },
    { timestamp: "10:38 AM", device: "DP-2088", location: "Server Room", temperature: 21.6, humidity: 47.8, status: "Online" },
    { timestamp: "10:35 AM", device: "DP-3104", location: "Warehouse", temperature: 19.2, humidity: 58.1, status: "Warning" },
    { timestamp: "10:31 AM", device: "DP-1041", location: "Greenhouse B", temperature: 24.4, humidity: 55.7, status: "Online" },
    { timestamp: "10:27 AM", device: "DP-2090", location: "Office Floor 2", temperature: 22.1, humidity: 43.9, status: "Online" },
    { timestamp: "10:22 AM", device: "DP-3110", location: "Loading Bay", temperature: 18.7, humidity: 61.3, status: "Online" },
    { timestamp: "10:18 AM", device: "DP-1040", location: "Greenhouse A", temperature: 23.6, humidity: 53.2, status: "Online" },
    { timestamp: "10:13 AM", device: "DP-2087", location: "Server Room", temperature: 21.3, humidity: 48.6, status: "Online" },
    { timestamp: "10:08 AM", device: "DP-3103", location: "Warehouse", temperature: 19.5, humidity: 57.4, status: "Warning" },
    { timestamp: "10:02 AM", device: "DP-1043", location: "Greenhouse B", temperature: 24.1, humidity: 54.8, status: "Online" },
    { timestamp: "09:56 AM", device: "DP-2089", location: "Office Floor 2", temperature: 22.4, humidity: 44.2, status: "Online" },
    { timestamp: "09:49 AM", device: "DP-3111", location: "Loading Bay", temperature: 18.9, humidity: 60.8, status: "Online" }
  ];
  const chartValues = [19.2, 19.8, 19.6, 20.7, 21.5, 22.4, 23.1, 23.8, 24.2, 24.8, 24.1, 23.6, 22.7, 21.9, 21.4, 20.8, 21.5, 22.4, 23.1, 24.1, 23.6, 23.2, 23.8, 23.8];
  let readings = [...baseReadings];
  let currentPage = 1;
  const pageSize = 6;
  const chartRanges = ["Last 24 hours", "Last 7 days", "Last 30 days"];
  let chartRangeIndex = 0;
  const $ = (selector) => document.querySelector(selector);

  function populateFilters() {
    const devices = [...new Set(readings.map((reading) => reading.device))];
    const locations = [...new Set(readings.map((reading) => reading.location))];
    $("#deviceFilter").innerHTML = '<option value="all">All devices</option>' + devices.map((device) => `<option value="${device}">${device}</option>`).join("");
    $("#locationFilter").innerHTML = '<option value="all">All locations</option>' + locations.map((location) => `<option value="${location}">${location}</option>`).join("");
  }

  function renderTable() {
    const device = $("#deviceFilter").value;
    const location = $("#locationFilter").value;
    const filtered = readings.filter((reading) => (device === "all" || reading.device === device) && (location === "all" || reading.location === location));
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    const start = (currentPage - 1) * pageSize;
    $("#readingsBody").innerHTML = filtered.slice(start, start + pageSize).map((reading) => `<tr><td>${reading.timestamp}</td><td><strong>${reading.device}</strong></td><td>${reading.location}</td><td><strong>${reading.temperature.toFixed(1)} °C</strong></td><td>${reading.humidity.toFixed(1)}%</td><td><span class="reading-status ${reading.status === "Warning" ? "warning" : ""}">${reading.status}</span></td></tr>`).join("");
    $("#emptyState").hidden = filtered.length !== 0;
    $("#errorState").hidden = true;
    $("#readingCount").textContent = filtered.length ? `Showing ${start + 1}-${Math.min(start + pageSize, filtered.length)} of ${filtered.length} readings` : "No readings to display";
    $("#pageNumber").textContent = currentPage;
    $("#previousPage").disabled = currentPage === 1;
    $("#nextPage").disabled = currentPage >= pageCount;
  }

  function updateSummary() {
    const latest = readings[0];
    const averageHumidity = readings.reduce((total, reading) => total + reading.humidity, 0) / readings.length;
    $("#latestTemperature").textContent = latest.temperature.toFixed(1);
    $("#averageHumidity").textContent = averageHumidity.toFixed(1);
    $("#activeDevices").textContent = new Set(readings.map((reading) => reading.device)).size;
  }

  function drawChart() {
    const canvas = $("#temperatureChart");
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(rect.width, 300) * ratio;
    canvas.height = Math.max(rect.height, 160) * ratio;
    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);
    const width = Math.max(rect.width, 300);
    const height = Math.max(rect.height, 160);
    const pad = { top: 13, right: 10, bottom: 28, left: 32 };
    const plotWidth = width - pad.left - pad.right;
    const plotHeight = height - pad.top - pad.bottom;
    const min = 17;
    const max = 27;
    const x = (index) => pad.left + (index / (chartValues.length - 1)) * plotWidth;
    const y = (value) => pad.top + ((max - value) / (max - min)) * plotHeight;
    context.clearRect(0, 0, width, height);
    context.font = "10px system-ui";
    context.fillStyle = "#a4adba";
    [17, 19, 21, 23, 25, 27].forEach((value) => {
      const yPosition = y(value);
      context.strokeStyle = "#edf0f4";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(pad.left, yPosition);
      context.lineTo(width - pad.right, yPosition);
      context.stroke();
      context.fillText(`${value}°`, 0, yPosition + 3);
    });
    ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "Now"].forEach((label, index, labels) => {
      context.fillText(label, pad.left + (index / (labels.length - 1)) * plotWidth - (index === labels.length - 1 ? 19 : 9), height - 7);
    });
    const points = chartValues.map((value, index) => [x(index), y(value)]);
    context.beginPath();
    points.forEach(([xPosition, yPosition], index) => index ? context.lineTo(xPosition, yPosition) : context.moveTo(xPosition, yPosition));
    context.lineTo(x(chartValues.length - 1), height - pad.bottom);
    context.lineTo(x(0), height - pad.bottom);
    context.closePath();
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(242,125,109,.22)");
    gradient.addColorStop(1, "rgba(242,125,109,0)");
    context.fillStyle = gradient;
    context.fill();
    context.beginPath();
    points.forEach(([xPosition, yPosition], index) => index ? context.lineTo(xPosition, yPosition) : context.moveTo(xPosition, yPosition));
    context.strokeStyle = "#f27d6d";
    context.lineWidth = 2.2;
    context.stroke();
    const last = points[points.length - 1];
    context.beginPath();
    context.arc(last[0], last[1], 4, 0, Math.PI * 2);
    context.fillStyle = "#fff";
    context.fill();
    context.strokeStyle = "#f27d6d";
    context.lineWidth = 2;
    context.stroke();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 3000);
  }

  function generateData() {
    readings = baseReadings.map((reading, index) => ({ ...reading, temperature: +(reading.temperature + (Math.random() * 1.4 - .7)).toFixed(1), humidity: +(reading.humidity + (Math.random() * 3 - 1.5)).toFixed(1), timestamp: index === 0 ? "Just now" : reading.timestamp }));
    currentPage = 1;
    populateFilters();
    renderTable();
    updateSummary();
    $("#lastSync").textContent = "Last updated just now";
    showToast("Demo sensor samples regenerated");
  }

  $("#deviceFilter").addEventListener("change", () => { currentPage = 1; renderTable(); });
  $("#locationFilter").addEventListener("change", () => { currentPage = 1; renderTable(); });
  $("#clearFilters").addEventListener("click", () => { $("#deviceFilter").value = "all"; $("#locationFilter").value = "all"; currentPage = 1; renderTable(); showToast("Filters cleared"); });
  $("#generateButton").addEventListener("click", generateData);
  $("#resetButton").addEventListener("click", () => { readings = [...baseReadings]; currentPage = 1; populateFilters(); renderTable(); updateSummary(); showToast("Dashboard reset to defaults"); });
  $("#exportButton").addEventListener("click", () => {
    const header = "Timestamp,Device,Location,Temperature,Humidity,Status\n";
    const csv = header + readings.map((reading) => Object.values(reading).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "datapulse-readings.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("CSV export downloaded");
  });
  $("#helpButton").addEventListener("click", () => showToast("Tip: use filters to focus on a location or device"));
  $("#notificationButton").addEventListener("click", () => showToast("No new notifications"));
  $("#previousPage").addEventListener("click", () => { currentPage -= 1; renderTable(); });
  $("#nextPage").addEventListener("click", () => { currentPage += 1; renderTable(); });
  $("#rangeButton").addEventListener("click", () => { chartRangeIndex = (chartRangeIndex + 1) % chartRanges.length; $("#rangeButton").innerHTML = `${chartRanges[chartRangeIndex]} <span aria-hidden="true">⌄</span>`; $("#temperatureChart").setAttribute("aria-label", `Line chart showing temperature for the ${chartRanges[chartRangeIndex].toLowerCase()}`); showToast(`Chart range: ${chartRanges[chartRangeIndex]}`); });
  $("#healthDetailsButton").addEventListener("click", () => showToast("10 online, 2 devices need attention, 0 offline"));
  document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => { document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active")); item.classList.add("active"); }));

  const loginModal = $("#loginModal");
  const profileMenu = $("#profileMenu");
  const openLogin = () => { loginModal.hidden = false; $("#loginEmail").focus(); };
  const closeLogin = () => { loginModal.hidden = true; $("#loginMessage").textContent = ""; };
  $("#profileButton").addEventListener("click", () => { const open = profileMenu.hidden; profileMenu.hidden = !open; $("#profileButton").setAttribute("aria-expanded", String(open)); });
  $("#accountButton").addEventListener("click", () => { profileMenu.hidden = true; showToast("Account settings are available in the demo profile"); });
  $("#logoutButton").addEventListener("click", () => { profileMenu.hidden = true; openLogin(); });
  $("#closeLoginButton").addEventListener("click", closeLogin);
  loginModal.addEventListener("click", (event) => { if (event.target === loginModal) closeLogin(); });
  $("#forgotPassword").addEventListener("click", () => { $("#loginMessage").textContent = "For this local demo, enter any valid email and a 4+ character password."; });
  $("#loginForm").addEventListener("submit", (event) => { event.preventDefault(); const form = event.currentTarget; if (!form.checkValidity()) { $("#loginMessage").textContent = "Enter a valid email and a password with at least 4 characters."; form.reportValidity(); return; } closeLogin(); showToast(`Signed in as ${$("#loginEmail").value}`); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { profileMenu.hidden = true; if (!loginModal.hidden) closeLogin(); } });
  document.addEventListener("click", (event) => { if (!profileMenu.hidden && !profileMenu.contains(event.target) && event.target !== $("#profileButton")) { profileMenu.hidden = true; $("#profileButton").setAttribute("aria-expanded", "false"); } });
  window.addEventListener("resize", drawChart);
  populateFilters();
  renderTable();
  updateSummary();
  window.requestAnimationFrame(drawChart);
})();
