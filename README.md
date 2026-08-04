# Don Bosco Skill Mission Center, Bengaluru
## Hostel Management Web Application

> **DBSM Mariam Manne Hostel** — Refectory Seating & Holy Mass Reading Roster System

---

## 🌐 Live App

**[https://edwin2208.github.io/hostel-mass-app/](https://edwin2208.github.io/hostel-mass-app/)**

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin@dbsm2026` |
| **Trainee** | `trainee001` | `pass1234` |

---

## ✨ Features

### Admin Module
- **Trainee Management** — Add/edit/delete trainees, bulk CSV upload, export
- **Refectory Seating** — Auto-generate seat assignments mixing mother tongues, seat swap, publish
- **Mass Reading Roster** — Auto-assign daily readers (Catholics compulsory, others voluntary)
- **Announcements** — Post/pin notices visible to all trainees
- **Settings** — Cycle frequency (Monthly / 15-Day), IP restriction config

### Trainee Module
- **My Seat** — View assigned table + seat number + neighbors
- **My Readings** — View assigned Bible Reading / Psalm dates
- **Announcements** — Read all admin posts
- **Profile** — View personal details

---

## 🏗️ Project Structure

```
dbsm-app/           ← Main Next.js application
├── app/
│   ├── login/      ← Login page (role-based)
│   ├── admin/      ← Admin pages
│   └── trainee/    ← Trainee dashboard
├── components/
│   └── layout/     ← Sidebar, Header
├── lib/
│   ├── algorithms/ ← Seating & reading algorithms
│   ├── store.ts    ← localStorage data store
│   └── types.ts    ← TypeScript types
└── public/images/  ← Don Bosco brand assets
```

---

## 🚀 Local Development

```bash
cd dbsm-app
npm install
node node_modules/next/dist/bin/next dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router, Static Export)
- **Styling:** Tailwind CSS v4 + Custom CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Data:** localStorage (browser-based, no server needed)
- **Deployment:** GitHub Pages via GitHub Actions

---

## 🔧 Seating Algorithm

1. Split trainees into Boys/Girls pools
2. Group each pool by Mother Tongue
3. Round-robin fill seats across language groups
4. Validation pass — check adjacent seats for same language
5. Randomize each cycle for variety
6. Admin can manually swap seats before publishing

---

## 📖 Mass Reading Rules

- Catholics: compulsory participants
- Non-Catholics: only if they opted in (willing_to_read = Yes)
- Same Domain/Batch for all readers on a given day
- Sundays/Feasts: 2 Readings + 1 Psalm; Weekdays: 1 Reading + 1 Psalm
- Fair rotation — everyone gets their turn across the cycle

---

*Powered by Don Bosco Tech — Skilling India*
