# 🏠 HostelMass – Hostel Referral & Mass Reading App

A fully animated web application for managing hostel referrals and tracking daily Catholic Mass readings. Built with pure HTML, CSS, and JavaScript — no frameworks needed.

## ✨ Features

- **Dashboard** – Animated stats, bar chart, today's Mass reading preview
- **Hostel Listings** – Search, filter, view details, and add new hostels
- **Referral Tracker** – Submit referrals, track status, donut chart breakdown
- **Mass Reading** – Daily liturgical readings with 30-day streak tracker
- **Student Registration** – Floating label form with validation
- **Notifications** – Real-time notification system with badges
- **Dark / Light Mode** – Toggle with one click
- **Animated Particles** – Canvas-based background animation
- **Splash Screen** – Animated loader on first visit
- **Local Storage** – All data persists in the browser

## 🚀 Run Locally

Just open `index.html` in any modern browser. No build step required.

```bash
# Or use a simple local server (optional)
npx serve .
```

## 🌐 Deploy to GitHub Pages

### Step 1 – Create a GitHub repository

1. Go to [github.com](https://github.com) and create a **new repository**
2. Name it anything, e.g. `hostel-mass-app`
3. Set it to **Public**

### Step 2 – Push this project

```bash
git init
git add .
git commit -m "Initial commit: HostelMass App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hostel-mass-app.git
git push -u origin main
```

### Step 3 – Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow in `.github/workflows/deploy.yml` will auto-deploy on every push to `main`

### Step 4 – Access your live app

Your app will be live at:
```
https://YOUR_USERNAME.github.io/hostel-mass-app/
```

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── css/
│   └── style.css           # All styles + animations
├── js/
│   ├── data.js             # Seed data & Mass readings
│   └── app.js              # Application logic + canvas charts
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages auto-deploy
└── README.md
```

## 🛠️ Technologies

- **HTML5** – Semantic markup
- **CSS3** – Custom properties, animations, gradients, glassmorphism
- **JavaScript (ES6+)** – Canvas API, LocalStorage, DOM manipulation
- **Google Fonts** – Inter + Playfair Display
- **GitHub Actions** – CI/CD for GitHub Pages deployment

## 📱 Responsive

Works on mobile, tablet, and desktop. Sidebar collapses on small screens.
