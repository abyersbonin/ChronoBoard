# 🏨 Spa Eastman Dashboard - LG StanbyME Installation Guide

## 📦 What You Have

Your Spa Eastman Dashboard is now packaged as a webOS TV app ready for the LG StanbyME. The package includes:

- **Full dashboard interface** with spa branding
- **Real-time weather** for Eastman, Quebec
- **3-day calendar view** with automatic updates
- **TV remote control** support
- **French localization** optimized for Quebec

## 🚀 Quick Installation (2 Methods)

### Method 1: USB Installation (Easiest)

1. **Get the files:**
   - Download `spa-eastman-dashboard-webos.tar.gz` from this folder
   - Extract to get the `spa-eastman-tv-app` folder

2. **Prepare USB:**
   - Format USB drive as FAT32
   - Copy the `spa-eastman-tv-app` folder to USB root

3. **Install on StanbyME:**
   - Insert USB into LG StanbyME
   - Navigate: Home → Settings → Apps → Install from USB
   - Select the spa-eastman-tv-app folder
   - Confirm installation

### Method 2: Developer Mode (Advanced)

1. **Enable Developer Mode:**
   - Home → Settings → General → Developer Mode Settings
   - Turn ON "Developer Mode"
   - Note the TV's IP address

2. **Install LG SDK on computer:**
   - Download from: http://webostv.developer.lge.com/sdk/
   - Install the SDK

3. **Deploy via SDK:**
   ```bash
   ares-setup-device --add spa-tv --host YOUR_TV_IP
   ares-package spa-eastman-tv-app
   ares-install com.spaeastman.dashboard_1.0.0_all.ipk --device spa-tv
   ares-launch com.spaeastman.dashboard --device spa-tv
   ```

## ⚙️ Configuration Required

**IMPORTANT:** You must update the API connection before the app will work on your TV.

### Step 1: Deploy Your Dashboard API

First, deploy your dashboard to a publicly accessible URL (like Replit Deployments).

### Step 2: Update TV App Configuration

Edit the `index.html` file in your TV app and update this line:

```javascript
apiBaseUrl: 'https://your-actual-deployment-url.replit.dev/api'
```

Replace `your-actual-deployment-url` with your real deployment URL.

### Step 3: Weather API Key

The app uses your existing weather API key. No additional configuration needed if your backend is properly deployed.

## 📱 Using the App on TV

### Remote Control

- **Back/Exit:** Return to TV home screen
- **OK/Enter:** Interact with elements (future use)
- **Arrow keys:** Navigate (if needed)

### Features

- **Auto-refresh:** Updates every 30 seconds
- **Full-screen:** Optimized for TV display
- **No cursor:** Clean TV interface
- **French interface:** Quebec French locale

## 🔧 Troubleshooting

### "No data displayed"
- Check your API deployment URL is correct and accessible
- Verify internet connection on TV
- Ensure your backend is running and deployed

### "App won't install"
- Verify USB is FAT32 formatted
- Ensure folder structure is correct
- Try Developer Mode if USB method fails

### "Weather not showing"
- Verify your backend has the weather API key configured
- Check network connectivity

## 📋 File Structure

```
spa-eastman-tv-app/
├── appinfo.json          # webOS app configuration
├── index.html           # Main TV-optimized interface
├── webOSTV.js          # TV remote and auto-refresh logic
├── icon.svg            # App icon for TV
└── assets/             # Compiled dashboard files
    ├── index-*.js      # React app bundle
    ├── index-*.css     # Styles
    └── *.jpg          # Spa header image
```

## ✅ Success Checklist

- [ ] TV app package downloaded and extracted
- [ ] API deployment URL updated in index.html
- [ ] USB drive formatted as FAT32 (if using USB method)
- [ ] App installed on LG StanbyME
- [ ] Internet connection verified on TV
- [ ] Dashboard displays events and weather

## 📞 Next Steps

Once installed, your LG StanbyME will display:
- Today's spa events
- Tomorrow's schedule  
- Day after tomorrow's events
- Real-time Eastman weather
- Beautiful spa background
- Auto-updating every 30 seconds

The app runs independently on your TV and connects to your deployed dashboard API for live data.