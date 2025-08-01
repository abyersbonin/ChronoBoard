#!/bin/bash

# Spa Eastman Dashboard - WebOS TV App Packaging Script
# This script prepares the app for deployment to LG StanbyME

echo "🏨 Packaging Spa Eastman Dashboard for webOS TV..."

# Create deployment directory
mkdir -p spa-eastman-tv-app

# Copy all necessary files
cp -r appinfo.json index.html webOSTV.js icon.svg assets/ spa-eastman-tv-app/

# Create IPK package (if ares-package is available)
if command -v ares-package &> /dev/null; then
    echo "📦 Creating IPK package..."
    ares-package spa-eastman-tv-app
    echo "✅ IPK package created: com.spaeastman.dashboard_1.0.0_all.ipk"
else
    echo "⚠️  ares-package not found. Manual installation required."
    echo "📁 App files prepared in: spa-eastman-tv-app/"
fi

# Create ZIP for USB installation
zip -r spa-eastman-dashboard-webos.zip spa-eastman-tv-app/
echo "📦 USB installation package created: spa-eastman-dashboard-webos.zip"

echo ""
echo "🎯 Installation Options:"
echo "1. Developer Mode: Use the .ipk file with ares-install"
echo "2. USB Method: Extract the ZIP file to USB drive"
echo ""
echo "📖 See README.md for detailed installation instructions"