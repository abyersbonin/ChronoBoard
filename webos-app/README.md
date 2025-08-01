# Spa Eastman Dashboard - WebOS TV App

This is a webOS TV application for the LG StanbyME that displays the Spa Eastman calendar dashboard with real-time weather information.

## Installation on LG StanbyME

### Method 1: Developer Mode (Recommended)

1. **Enable Developer Mode on your LG StanbyME:**
   - Press Home button on remote
   - Go to Settings → General → Developer Mode Settings
   - Turn ON "Developer Mode"
   - Note down the TV's IP address

2. **Install LG webOS TV SDK:**
   - Download from: http://webostv.developer.lge.com/sdk/download/
   - Install on your computer

3. **Deploy the App:**
   ```bash
   # Connect to your TV
   ares-setup-device --search
   ares-setup-device --add spa-tv --host YOUR_TV_IP_ADDRESS
   
   # Package and install the app
   ares-package ./webos-app
   ares-install com.spaeastman.dashboard_1.0.0_all.ipk --device spa-tv
   
   # Launch the app
   ares-launch com.spaeastman.dashboard --device spa-tv
   ```

### Method 2: USB Installation

1. **Prepare USB Drive:**
   - Format USB drive as FAT32
   - Copy the entire `webos-app` folder to USB root
   - Rename folder to `spa-eastman-dashboard`

2. **Install on TV:**
   - Insert USB into LG StanbyME
   - Go to Home → Apps → My Apps
   - Select "Install from USB"
   - Choose the spa-eastman-dashboard folder

## Configuration

### Setting up the API Connection

The app needs to connect to your Spa Eastman dashboard API. Update the configuration in `index.html`:

```javascript
window.SPA_EASTMAN_CONFIG = {
  isTV: true,
  apiBaseUrl: 'https://your-replit-deployment.replit.dev/api', // Update this URL
  autoRefreshInterval: 30000, // 30 seconds
  tvMode: true
};
```

### Weather API Configuration

To display weather information, you'll need to configure the weather API key. The app will look for the environment variable or you can set it directly in the configuration.

## Features

- **Full-screen Calendar Display:** Shows upcoming events for the next 3 days
- **Real-time Weather:** Bottom-right weather widget for Eastman, Quebec
- **Automatic Refresh:** Updates every 30 seconds
- **TV Remote Control:** Navigate with LG remote
- **French Interface:** Optimized for Quebec French locale
- **Spa Eastman Branding:** Official header image and styling

## TV Remote Controls

- **Back/Exit:** Return to TV home screen
- **OK/Enter:** Select or interact with elements
- **Arrow Keys:** Navigate (if needed for future features)

## Technical Requirements

- **LG webOS TV 3.0+** (StanbyME compatible)
- **Internet Connection** for API and weather data
- **Network Access** to your deployed Spa Eastman dashboard API

## File Structure

```
webos-app/
├── appinfo.json          # WebOS app configuration
├── index.html           # Main app HTML with TV optimizations
├── webOSTV.js          # TV-specific JavaScript functionality
├── icon.svg            # App icon for TV interface
├── assets/             # Built JavaScript and CSS files
│   ├── index-*.js      # React application bundle
│   └── index-*.css     # Compiled styles
└── README.md           # This file
```

## Troubleshooting

### App won't install:
- Ensure Developer Mode is enabled
- Check TV IP address is correct
- Verify USB drive is FAT32 formatted

### No data displaying:
- Check internet connection on TV
- Verify API URL in configuration
- Ensure your dashboard API is accessible from TV's network

### Weather not showing:
- Verify weather API key is configured
- Check network connectivity for external API calls

## Support

For technical support or issues with the Spa Eastman dashboard, please contact your system administrator.

## Version

- **Version:** 1.0.0
- **Compatible:** LG webOS 3.0+, LG StanbyME
- **Language:** French (Canadian)
- **Last Updated:** August 2025