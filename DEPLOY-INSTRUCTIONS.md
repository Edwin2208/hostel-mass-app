# 🚀 Deploy HostelMass to GitHub Pages

Your app is 100% ready to deploy! Follow these steps:

---

## Option A: Manual Deployment (Recommended)

### Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Fill in:
   - **Repository name:** `hostel-mass-app` (or any name you prefer)
   - **Description:** "Hostel Referral & Mass Reading Web Application"
   - **Visibility:** ✅ **Public** (required for GitHub Pages)
3. **Do NOT** initialize with README, .gitignore, or license
4. Click **Create repository**

### Step 2: Push Your Code

Open a terminal in this folder and run:

```bash
# Add your GitHub repo as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/hostel-mass-app.git

# Push to GitHub
git push -u origin main
```

If you get an authentication prompt, use your GitHub username and a **Personal Access Token** (not password).

**To create a token:**
- Go to https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Select scope: `repo`
- Copy the token and use it as password when pushing

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under **Source**, select **"GitHub Actions"**
4. The deployment workflow will trigger automatically
5. Wait 1-2 minutes — your app will be live at:
   ```
   https://YOUR_USERNAME.github.io/hostel-mass-app/
   ```

---

## Option B: Using GitHub Desktop (GUI)

1. Download **GitHub Desktop**: https://desktop.github.com
2. Open GitHub Desktop → **File** → **Add Local Repository**
3. Select this folder: `C:\Users\eambu\Desktop\HOSTEL REF&MASS READING APP`
4. Click **Publish repository**
5. Make sure **Keep code private** is **UNCHECKED** (must be public for Pages)
6. Follow **Step 3** from Option A above

---

## ✅ Verify Deployment

After pushing, check:

1. **Actions tab** on GitHub — workflow should show green ✅
2. **Settings → Pages** — URL should appear
3. Visit your live app — all features work immediately:
   - ✨ Animated splash screen
   - 🌌 Particle background
   - 📊 Dashboard with charts
   - 🏨 Hostel listings
   - 📖 Mass readings
   - 📝 Student registration

---

## 🔧 Local Development

To run locally (optional):
```bash
# Simple HTTP server
npx serve .

# Or Python
python -m http.server 8000

# Or open index.html directly in browser
```

---

## 📝 Git Commands Quick Reference

```bash
# Check status
git status

# View commit history
git log --oneline

# View remote
git remote -v

# Force push (if needed)
git push -f origin main
```

---

## ⚠️ Troubleshooting

**"Authentication failed"**
- Use a Personal Access Token instead of password
- Generate at: https://github.com/settings/tokens

**"Repository already exists"**
- Use a different name OR delete the existing repo first

**"Pages not deploying"**
- Check **Actions** tab for errors
- Ensure repo is **Public**
- Ensure **Source** is set to **GitHub Actions**

**"App not loading"**
- Check browser console (F12) for errors
- Ensure all files pushed: `git ls-files`
- Clear browser cache

---

Your app is production-ready with:
- ✅ 6 fully functional pages
- ✅ Animated UI with canvas graphics
- ✅ Dark/Light theme toggle
- ✅ LocalStorage data persistence
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Zero dependencies — pure HTML/CSS/JS

**Need help?** Open an issue on GitHub or check the README.md file.
