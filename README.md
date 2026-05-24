# 🚀 Viral Post Generator

> Enter a niche → AI scans Reddit for trending content → Get 10 beautiful, ready-to-post Facebook graphics powered by Claude AI.

**Live demo:** `https://<your-username>.github.io/viral-post-gen/`

---

## ✨ Features

- 🔍 **Reddit Trend Research** — automatically scans top posts from the past month (no API key needed)
- 🤖 **Claude AI Writing** — generates 10 unique, engagement-optimized posts
- 🎨 **10 Distinct Gradient Cards** — each post has a unique color design ready to screenshot
- 📋 **Copy / Save / Expand** — copy text, download as .txt, or expand to read the full post
- 🔑 **API key stored locally** — never leaves your browser except to Anthropic

---

## 🚀 Deploy in 5 Steps

### 1. Fork / Create repo on GitHub

```bash
# Clone or create a new repo named viral-post-gen
git init viral-post-gen
cd viral-post-gen
```

### 2. Copy these files into the repo

Upload all project files to your GitHub repository.

### 3. Update the repo name in `vite.config.js`

```js
const REPO_NAME = 'viral-post-gen'  // ← change to your actual GitHub repo name
```

### 4. Enable GitHub Pages

Go to your repo on GitHub → **Settings** → **Pages** → **Source**: set to **GitHub Actions**

### 5. Push to main — auto-deploys!

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

GitHub Actions will build and deploy automatically. Your app will be live at:
`https://<username>.github.io/<repo-name>/`

---

## 🔑 Getting Your Free Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up (free tier available)
3. Go to **API Keys** → **Create Key**
4. Paste it into the app when prompted

Your key is saved in your browser's `localStorage` — it's never sent to any server except Anthropic's official API.

---

## 🛠 Local Development

```bash
npm install
npm run dev
# Open http://localhost:5173/viral-post-gen/
```

---

## 📱 How to Use

1. Open the app and add your Anthropic API key
2. Type your niche (e.g. `fitness`, `crypto`, `parenting`, `motivation`)
3. Hit **Generate 10 Posts**
4. For each card:
   - 📋 **Copy Text** — copies post body to clipboard
   - ▽ **Full Post** — expands to show the complete post
   - ↓ **Save** — downloads as a .txt file
5. Screenshot the card + paste the text to post on Facebook!

---

## 🛠 Tech Stack

| Tool | Purpose | Cost |
|------|---------|------|
| React + Vite | Frontend framework | Free |
| GitHub Actions | CI/CD pipeline | Free |
| GitHub Pages | Hosting | Free |
| Reddit JSON API | Trend research | Free |
| Anthropic Claude | Post generation | Pay per use (~$0.002/run) |

---

## 📁 Project Structure

```
viral-post-gen/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy on push
├── src/
│   ├── App.jsx                 # Main app + all logic
│   ├── main.jsx                # React entry point
│   └── components/
│       └── PostCard.jsx        # Beautiful gradient card
├── index.html                  # Entry HTML
├── vite.config.js              # Build config (set REPO_NAME here)
└── package.json
```
