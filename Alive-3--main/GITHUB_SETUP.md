# GitHub Upload Instructions

## Option 1: Using Git Command Line (if installed)

### Prerequisites
1. Install Git if not already installed: https://git-scm.com/download/win
2. Create a GitHub account: https://github.com
3. Create a new repository on GitHub (don't initialize with README)

### Steps

```bash
# Navigate to the project directory
cd C:\Users\HP\Documents\Hackathon\alive-app

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Alive healthcare app with patient and doctor dashboards, OCR scanning, and complete feature set"

# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/alive-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Option 2: Using GitHub Desktop (Recommended for Windows)

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Sign in** with your GitHub account
3. **Create a new repository**:
   - Click "File" → "New Repository"
   - Name: `alive-app`
   - Local path: `C:\Users\HP\Documents\Hackathon\alive-app`
   - Description: "Alive - Patient Health Records Portal with OCR"
   - **Don't** initialize with README
   - Click "Create Repository"
4. **Commit and push**:
   - You'll see all files listed as changes
   - Add commit message: "Initial commit: Alive healthcare app"
   - Click "Commit to main"
   - Click "Publish repository" or "Push origin"

---

## Option 3: Using GitHub Web Interface

1. Go to https://github.com/new
2. Create a new repository named `alive-app`
3. **Don't** initialize with README, .gitignore, or license
4. After creating, GitHub will show you commands to run, or:
5. Use GitHub Desktop (see Option 2) to connect your local folder

---

## After Uploading

Once your code is on GitHub, you can:
- Share the repository link
- Deploy to platforms like Vercel, Netlify, or GitHub Pages
- Collaborate with others
- Track issues and features

### Quick Deploy Options

**Vercel** (Recommended for React apps):
1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy automatically

**Netlify**:
1. Go to https://www.netlify.com
2. Drag and drop your `dist` folder (after running `npm run build`)

**GitHub Pages**:
1. In repository settings → Pages
2. Select source branch: `main` and folder: `/root`
3. Use a GitHub Actions workflow to build and deploy

---

## Repository Structure

```
alive-app/
├── src/
│   ├── components/       # Reusable components (OCR, AccessLogs, etc.)
│   ├── pages/           # Page components (Login, Dashboards, Settings)
│   ├── App.jsx          # Main app component
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── README.md            # Project documentation
└── .gitignore          # Git ignore rules
```

---

## Important Notes

- Make sure `node_modules` is in `.gitignore` (it already is)
- Never commit sensitive data (API keys, passwords, etc.)
- The `.gitignore` file is already configured properly

---

## Need Help?

If you encounter issues:
1. Check Git is installed: `git --version`
2. Verify GitHub connection: `git remote -v`
3. Make sure you're authenticated with GitHub (use GitHub Desktop for easiest auth)

