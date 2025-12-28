# 📅 Calendar & Schedule

A clean, responsive calendar with a day schedule panel. Navigate months, select dates, add and delete events — all with a polished white/blue UI and a subtle background. Data is saved locally (localStorage) and the API layer can be switched to a real backend later.

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-%23e44d26?logo=html5&logoColor=white" alt="HTML5 Badge">
  <img src="https://img.shields.io/badge/CSS3-%231572B6?logo=css3&logoColor=white" alt="CSS3 Badge">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-f7df1e?logo=javascript&logoColor=black" alt="JS Badge">
  <img src="https://img.shields.io/badge/Responsive-%F0%9F%93%B1-blue" alt="Responsive Badge">
</p>

![image](https://github.com/MdSaifAli063/Calendar-Schedule/blob/be916a18e7ec6d7d124279321ac0e11d9220c3d9/Screenshot%202025-09-20%20015438.png)

---

## ✨ Features

- 🗓️ Month navigation (previous/next)
- 📍 Date selection with a 7×6 week grid (no overlap)
- ➕ Add events with time and title
- 🗑️ Delete events
- ✅ “Today” button to jump back to the current date
- 🧼 Clear all events (localStorage)
- 🔵 Event indicators (dots) on calendar days
- 🟢 Today is highlighted in green
- 🎨 White/blue glassy UI with optional hero background image
- ♿ Accessible labels and focus states

---

## 📂 Project Structure

. ├─ index.html # Page markup ├─ style.css # Styles (white/blue theme + glass effect + green today) ├─ script.js # Calendar logic + LocalStorage API adapter └─ assets/ # (Optional) images like a hero background (e.g., /assets/hero.jpg)

---

## 🚀 Quick Start

Option A — Just open the file:
- Double-click index.html

Option B — Serve locally (recommended for consistent assets)
- Python 3: python -m http.server 5173
- Node (http-server): npx http-server -p 5173
- VS Code: Use “Live Server” extension
- Open http://localhost:5173

No build step required.

---

## 🧭 Usage

- ◀️ ▶️ Use the arrows to switch months.
- 🔘 Click any date cell to select it.
- ✍️ Add an event:
  - Pick a time
  - Enter a title
  - Click “Add Event”
- 🗑️ Delete an event using the trash icon.
- 📅 Click “Today” to jump to the current date.
- 🧽 “Clear All Events” removes all saved events (localStorage key: events_v1).

---

## 🛠️ Configuration & Customization

- Background image:
  - In style.css, set the CSS variable --hero-image to your image:
    - Example: --hero-image: url('/assets/hero.jpg');
    - Or set to none to rely on gradients only.
- Colors:
  - Edit palette in :root within style.css (blue shades + green highlight).
- Today highlight (green):
  - Controlled by .day.is-today rules in style.css.
- Weekend styling:
  - Subtle highlight via nth-child selectors in the calendar grid.

---

## 🔌 API Mode (Optional)

By default, events are stored in localStorage through an async wrapper. To use a real API:

1. Open script.js
2. Set API_BASE_URL to your backend base URL (e.g., https://your-api.example.com)
3. Implement endpoints:
   - GET /events?date=YYYY-MM-DD → returns [{ id, date, time, title }]
   - POST /events → body { date, time, title } → returns created event
   - DELETE /events/:id → returns 200/204

The UI will work the same; only storage changes.

---

## 🧪 Tips & Troubleshooting

- Dates overlapping?
  - Ensure the calendar grid rules exist in style.css:
    - .calendar__days { grid-template-columns: repeat(7, minmax(0, 1fr)); grid-auto-rows: minmax(90px, auto); }
- Material icons not showing?
  - Check this line in index.html head:
    - <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
- Time input odd on iOS/Safari?
  - That’s the native time control; it’s expected. You can swap to a custom time picker if needed.

---

## 🔮 Roadmap (Nice-to-haves)

- ✏️ Edit events
- 🔁 Recurring events
- 📤 Export to .ics
- 🖱️ Drag to create events on the calendar
- 🔎 Search and filters
- 🌓 Light/Dark theme toggle

---

## 📸 Icon Suggestion

You can keep the emoji in the title, or use Material Icons.


## 📝 License

MIT — free to use, modify, and share.


## 🙌 Credits

Google Material Icons
Modern CSS techniques (CSS Grid, backdrop-filter)
You, for building something awesome! 💙
