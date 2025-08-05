# webOS TV Development Setup Guide
# Spa Eastman Dashboard for LG webOS TV

This guide will help you set up, open, and simulate your Spa Eastman Dashboard app on VS Code with webOS Studio extension and webOS_TV_24_Simulator v1.4.1.

## 🚀 Quick Start Summary

1. **Install Prerequisites** → 2. **Install webOS Studio** → 3. **Setup Simulator** → 4. **Run Your App**

---

## 📋 Prerequisites Installation

### 1. Install Node.js and Python
```bash
# Install Node.js (v14.15.1 or higher recommended)
# Download from: https://nodejs.org/

# Install Python (3.6 or higher)
# Download from: https://python.org/downloads/

# Verify installations
node --version
python --version
```

### 2. Install webOS CLI (Required First!)
```bash
# Install webOS CLI globally
npm install -g @webos-tools/cli @enact/cli patch-package

# Verify installation
webos --version
```

---

## 🔧 VS Code webOS Studio Setup

### 1. Install webOS Studio Extension
- Open VS Code → **View > Extensions** (Ctrl+Shift+X)
- Search for **"webOS Studio"**
- Click **Install** on the official webOS Studio extension by webOSSDK

### 2. Initial Extension Setup
Open Command Palette (Ctrl+Shift+P) and run:
```
webOS: Install Global Packages
webOS: Set Device Profile
```
- Select **webOS TV** as your target device profile

---

## 📱 webOS TV Simulator Setup

### 1. Download webOS TV Simulator
- Visit: https://webostv.developer.lge.com/develop/tools/simulator-installation
- Download **webOS_TV_24_Simulator v1.4.1** for your operating system
- Install the simulator following the provided instructions

### 2. Alternative: Install via webOS Studio
- Open VS Code Command Palette (Ctrl+Shift+P)
- Run: `webOS: Package Manager`
- Install webOS TV Simulator from the package manager

---

## 🚀 Running Your Spa Eastman Dashboard

### Method 1: Using webOS Studio (Recommended)
1. **Open Project in VS Code**
   ```bash
   cd your-project-directory
   code webos-tv/
   ```

2. **Run on Simulator**
   - Right-click on the `webos-tv` folder in VS Code Explorer
   - Select **"Run App on Simulator"**
   - OR use Command Palette: `webOS: Run on Simulator`

### Method 2: Using CLI Commands
```bash
cd webos-tv/

# Package the app
ares-package .

# Install on simulator
ares-install -d simulator spa-eastman-dashboard-webos_1.0.0_all.ipk

# Launch the app
ares-launch -d simulator com.spaeastman.dashboard
```

### Method 3: Using npm Scripts (Easy!)
```bash
cd webos-tv/
npm run deploy
```

---

## 🎮 TV Remote Control Guide

Once your app is running in the simulator, you can use these controls:

### Keyboard Shortcuts in Simulator:
- **Enter/Space**: Refresh dashboard (OK button)
- **Escape/Backspace**: Back/Exit
- **F1 (Red)**: Toggle auto-refresh on/off
- **F2 (Green)**: Manual refresh
- **F3 (Yellow)**: Toggle fullscreen
- **F4 (Blue)**: Force reload app

### Simulator Features:
- **Auto-refresh**: Dashboard updates every 30 seconds automatically
- **Touch Mode**: Click to simulate TV remote navigation
- **Web Inspector**: Automatically opens for debugging
- **Portrait Mode**: Test different orientations

---

## 📁 Project Structure

Your webOS app files are located in the `webos-tv/` directory:

```
webos-tv/
├── appinfo.json      # App configuration and metadata
├── index.html        # Main app entry point
├── icon.png          # App icon (80x80px)
├── package.json      # Build scripts and dependencies
└── README.md         # This setup guide
```

### Key Configuration Files:

**appinfo.json**: App metadata
- App ID: `com.spaeastman.dashboard`
- Resolution: 1920x1080 (Full HD TV)
- Permissions: Time access for live updates

**index.html**: TV-optimized wrapper
- Loads your Replit dashboard: `https://chrono-board-tarnrsps.replit.app/`
- Handles TV remote controls
- Auto-refreshes every 30 seconds
- Fullscreen TV interface with no cursor

---

## 🔧 Troubleshooting

### Common Issues:

#### 1. "webOS commands not found"
```bash
# Reinstall webOS CLI
npm uninstall -g @webos-tools/cli
npm install -g @webos-tools/cli
```

#### 2. Simulator not launching
- Ensure you have webOS_TV_24_Simulator v1.4.1 installed
- Check that Node.js and Python are properly installed
- Restart VS Code after installing webOS Studio

#### 3. App not loading in simulator
- Verify your internet connection (app loads from Replit)
- Check that Replit URL is accessible: https://chrono-board-tarnrsps.replit.app/
- Look at simulator console for error messages

#### 4. Extension not working
- Uninstall any old webOS TV extensions
- Run `webOS: Install Global Packages` command
- Restart VS Code

### Debug Mode:
The app includes comprehensive logging. Check the simulator's Web Inspector console for debug information.

---

## 🚀 Deployment to Real TV

Once testing is complete, you can deploy to actual LG webOS TVs:

1. **Enable Developer Mode** on your LG TV
2. **Connect TV** to webOS Studio:
   ```bash
   ares-setup-device
   ```
3. **Deploy to TV**:
   ```bash
   ares-install -d your-TV-name spa-eastman-dashboard-webos_1.0.0_all.ipk
   ares-launch -d your-TV-name com.spaeastman.dashboard
   ```

---

## 📞 Support

### webOS Resources:
- **webOS Studio Documentation**: https://webostv.developer.lge.com/develop/tools/webos-studio-installation
- **Simulator Guide**: https://webostv.developer.lge.com/develop/tools/simulator-introduction
- **webOS CLI Reference**: https://webostv.developer.lge.com/develop/tools/cli-installation

### App-Specific Support:
- The dashboard loads from: `https://chrono-board-tarnrsps.replit.app/`
- Auto-refresh: Every 30 seconds for live data
- Remote control: Full TV remote support implemented
- Resolution: Optimized for 1920x1080 HD TVs

---

## ✅ Quick Verification Checklist

- [ ] Node.js installed (v14.15.1+)
- [ ] Python installed (3.6+)
- [ ] webOS CLI installed (`webos --version` works)
- [ ] VS Code with webOS Studio extension installed
- [ ] webOS TV Simulator v1.4.1 installed
- [ ] Project opened in VS Code (`code webos-tv/`)
- [ ] App running in simulator (`webOS: Run on Simulator`)
- [ ] Dashboard loading correctly with live data
- [ ] TV remote controls working (Enter to refresh)

**Your Spa Eastman Dashboard is now ready for webOS TV! 🎉**