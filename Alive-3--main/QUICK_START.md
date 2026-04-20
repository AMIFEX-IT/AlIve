# Alive App - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test the App

1. **Login Screen:**
   - Enter any phone number (e.g., `1234567890`)
   - Click "Send OTP"
   - **Check your browser console** - the OTP code will be displayed there
   - Enter the 6-digit OTP from the console
   - Click "Verify OTP"

2. **Dashboard:**
   - View your medical history timeline
   - See sample medical records with dates, hospitals, and descriptions
   - Navigate using the bottom navigation (mobile) or header (desktop)

## 📱 Features Implemented

✅ OTP-based authentication  
✅ Medical history timeline  
✅ Responsive design (mobile & desktop)  
✅ Alive branding (colors, typography, components)  
✅ Accessible UI (WCAG compliant)  
✅ Patient empowerment focus  

## 🎨 Branding

The app uses the official Alive brand colors:
- Primary: #1E90FF (Dodger Blue)
- Text: #333333
- Success: #28A745
- Error: #FF4C4C

## 📝 Demo Credentials

For testing:
- **Phone:** Any 10-digit number
- **OTP:** Check browser console after clicking "Send OTP"

## 🔧 Development

- **Port:** http://localhost:3000
- **Hot Reload:** Enabled
- **Build:** `npm run build`
- **Preview:** `npm run preview`

## 📂 Key Files

- `src/pages/Login.jsx` - Login and OTP verification
- `src/pages/Dashboard.jsx` - Medical records timeline
- `src/index.css` - Global styles and CSS variables
- `Alive_Branding_Guidelines.md` - Complete branding documentation

Enjoy building with Alive! 🏥✨

