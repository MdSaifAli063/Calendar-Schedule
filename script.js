/**
 * Calendar + Schedule App
 * - 7 columns, 6 rows grid with fixed auto-rows (CSS) to avoid overlap
 * - Month navigation, date selection
 * - Add/Delete events
 * - Async 'API' using localStorage (swap to real REST API later by setting API_BASE_URL)
 */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Set to your backend to use a real API: e.g. "https://your-api.example.com"
  const API_BASE_URL = null;

  // Utilities
  const pad2 = (n) => String(n).padStart(2, "0");
  const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const fromISO = (iso) => {
    const [y, m, day] = iso.split("-").map(Number);
    return new Date(y, m - 1, day);
  };
  const fmtLongDate = (d) => d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const monthLabel = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Async Events API (localStorage by default)
  const EventsAPI = (() => {
    const STORAGE_KEY = "events_v1";
    const delay = (v) => new Promise((res) => setTimeout(() => res(v), 80));
    const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const read = () => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
      catch { return []; }
    };
    const write = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

    if (API_BASE_URL) {
      return {
        async list(dateISO) {
          const res = await fetch(`${API_BASE_URL}/events?date=${encodeURIComponent(dateISO)}`);
          if (!res.ok) throw new Error("Failed to fetch events");
          return res.json();
        },
        async create({ date, time, title }) {
          const res = await fetch(`${API_BASE_URL}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, time, title }),
          });
          if (!res.ok) throw new Error("Failed to create event");
          return res.json();
        },
        async remove(id) {
          const res = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(id)}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete event");
          return true;
        },
      };
    }

    return {
      async list(dateISO) {
        const all = read();
        const items = all.filter((e) => e.date === dateISO).sort((a, b) => a.time.localeCompare(b.time));
        return delay(items);
      },
      async create({ date, time, title }) {
        const all = read();
        const item = { id: uid(), date, time, title: title.trim() };
        all.push(item);
        write(all);
        return delay(item);
      },
      async remove(id) {
        const all = read();
        const next = all.filter((e) => e.id !== id);
        write(next);
        return delay(true);
      },
      async statsByMonth(year, monthIdx) {
        const all = read();
        const start = new Date(year, monthIdx, 1);
        const end = new Date(year, monthIdx + 1, 0);
        const map = {};
        all.forEach((e) => {
          const d = fromISO(e.date);
          if (d >= start && d <= end) {
            map[e.date] = (map[e.date] || 0) + 1;
          }
        });
        return delay(map);
      },
    };
  })();

  // State
  const today = new Date();
  const state = {
    currentMonth: new Date(today.getFullYear(), today.getMonth(), 1),
    selectedDate: today,
  };

  // Elements
  const monthLabelEl = $("#monthLabel");
  const daysGridEl = $("#daysGrid");
  const selectedDateLabelEl = $("#selectedDateLabel");
  const eventsListEl = $("#eventsList");
  const eventFormEl = $("#eventForm");
  const timeInputEl = $("#eventTime");
  const titleInputEl = $("#eventTitle");

  // Render
  async function render() {
    await Promise.all([renderCalendar(), renderSchedule()]);
  }

  async function renderCalendar() {
    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const firstDayIdx = monthStart.getDay(); // 0=Sun..6=Sat
    const daysInMonth = monthEnd.getDate();

    monthLabelEl.textContent = monthLabel(state.currentMonth);

    const cells = [];
    const totalCells = 42; // 7 days x 6 weeks
    const prevMonthEnd = new Date(year, month, 0).getDate();

    // Preceding days (previous month)
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      const dayNum = prevMonthEnd - i;
      const d = new Date(year, month - 1, dayNum);
      cells.push({ date: d, outside: true });
    }
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({ date: d, outside: false });
    }
    // Trailing days (next month) to fill 42 cells
    while (cells.length < totalCells) {
      const idx = cells.length - (firstDayIdx + daysInMonth);
      const d = new Date(year, month + 1, idx + 1);
      cells.push({ date: d, outside: true });
    }

    // Dots for days with events
    const dotMap = await (EventsAPI.statsByMonth
      ? EventsAPI.statsByMonth(year, month)
      : Promise.resolve({}));

    daysGridEl.innerHTML = "";

    for (const { date, outside } of cells) {
      const iso = toISODate(date);
      const isToday = iso === toISODate(today);
      const isSelected = iso === toISODate(state.selectedDate);

      const cell = document.createElement("button");
      cell.className = "day" + (outside ? " is-outside" : "") + (isToday ? " is-today" : "") + (isSelected ? " is-selected" : "");
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", date.toDateString());
      cell.dataset.date = iso;

      const num = document.createElement("div");
      num.className = "day__num";
      num.textContent = String(date.getDate());

      const dotsWrap = document.createElement("div");
      dotsWrap.className = "day__events";
      const count = (await dotMap)[iso] || 0;
      for (let i = 0; i < Math.min(count, 3); i++) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dotsWrap.appendChild(dot);
      }

      cell.appendChild(num);
      cell.appendChild(dotsWrap);

      cell.addEventListener("click", () => {
        state.selectedDate = date;
        selectedDateLabelEl.textContent = fmtLongDate(state.selectedDate);
        render(); // re-render both calendar and schedule
      });

      daysGridEl.appendChild(cell);
    }
  }

  async function renderSchedule() {
    const iso = toISODate(state.selectedDate);
    selectedDateLabelEl.textContent = fmtLongDate(state.selectedDate);

    const events = await EventsAPI.list(iso);
    eventsListEl.innerHTML = "";

    if (!events.length) {
      const li = document.createElement("li");
      li.style.opacity = "0.75";
      li.textContent = "No events for this day.";
      eventsListEl.appendChild(li);
      return;
    }

    for (const ev of events) {
      const li = document.createElement("li");
      li.className = "event";

      const time = document.createElement("div");
      time.className = "event__time";
      time.textContent = ev.time;

      const title = document.createElement("p");
      title.className = "event__title";
      title.textContent = ev.title;

      const actions = document.createElement("div");
      actions.className = "event__actions";

      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn icon-btn--small";
      delBtn.title = "Delete";
      delBtn.innerHTML = '<span class="material-icons">delete</span>';
      delBtn.addEventListener("click", async () => {
        await EventsAPI.remove(ev.id);
        await render();
      });

      actions.appendChild(delBtn);

      li.appendChild(time);
      li.appendChild(title);
      li.appendChild(actions);

      eventsListEl.appendChild(li);
    }
  }

  // Controls
  $("#prevMonthBtn").addEventListener("click", () => {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1, 1);
    render();
  });
  $("#nextMonthBtn").addEventListener("click", () => {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 1);
    render();
  });

  $("#todayBtn").addEventListener("click", () => {
    const t = new Date();
    state.currentMonth = new Date(t.getFullYear(), t.getMonth(), 1);
    state.selectedDate = t;
    render();
  });

  $("#clearAllBtn").addEventListener("click", () => {
    if (confirm("Clear ALL saved events? This cannot be undone.")) {
      localStorage.removeItem("events_v1");
      render();
    }
  });

  // Add event
  eventFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const time = timeInputEl.value.trim();
    const title = titleInputEl.value.trim();
    if (!time || !title) return;

    await EventsAPI.create({
      date: toISODate(state.selectedDate),
      time,
      title,
    });

    titleInputEl.value = "";
    await render();
  });

  // Init
  (async function init() {
    const now = new Date();
    const rounded = new Date(now);
    rounded.setMinutes(now.getMinutes() + (15 - (now.getMinutes() % 15)) % 15, 0, 0);
    const h = pad2(rounded.getHours());
    const m = pad2(rounded.getMinutes());
    if (!timeInputEl.value) timeInputEl.value = `${h}:${m}`;

    await render();
  })();
})();