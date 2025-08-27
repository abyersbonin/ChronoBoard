// Enhanced device detection utility for optimal layout adaptation
import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isTV: boolean;
  deviceType: 'phone' | 'tablet' | 'tv' | 'desktop';
  brand: string;
  model: string;
  layoutPreferences: {
    weatherLayout: 'vertical' | 'horizontal' | 'compact';
    modalSize: 'small' | 'medium' | 'large';
    fontScale: number;
    spacingScale: number;
  };
}

export function detectDevice(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Exclude TV browsers first
  const isTVBrowser = /webos|tizen|smart-tv|smarttv|roku|chromecast/.test(userAgent);
  
  if (isTVBrowser) {
    return {
      isMobile: false,
      isTablet: false,
      isTV: true,
      deviceType: 'tv',
      brand: 'TV',
      model: 'Smart TV',
      layoutPreferences: {
        weatherLayout: 'horizontal',
        modalSize: 'large',
        fontScale: 1.2,
        spacingScale: 1.5
      }
    };
  }

  // Device brand detection
  let brand = 'Unknown';
  let model = 'Unknown';
  
  if (/samsung/i.test(userAgent)) {
    brand = 'Samsung';
    if (/sm-g/i.test(userAgent)) model = 'Galaxy S Series';
    else if (/sm-n/i.test(userAgent)) model = 'Galaxy Note';
    else if (/sm-a/i.test(userAgent)) model = 'Galaxy A Series';
    else if (/sm-t/i.test(userAgent)) model = 'Galaxy Tab';
  } else if (/iphone/i.test(userAgent)) {
    brand = 'Apple';
    model = 'iPhone';
  } else if (/ipad/i.test(userAgent)) {
    brand = 'Apple';
    model = 'iPad';
  } else if (/pixel/i.test(userAgent)) {
    brand = 'Google';
    model = 'Pixel';
  } else if (/oneplus/i.test(userAgent)) {
    brand = 'OnePlus';
    model = 'OnePlus';
  } else if (/xiaomi|mi /i.test(userAgent)) {
    brand = 'Xiaomi';
    model = 'Mi/Redmi';
  } else if (/huawei/i.test(userAgent)) {
    brand = 'Huawei';
    model = 'Huawei';
  }

  // Mobile viewport detection (refined ranges)
  const isMobileViewport = (
    // Portrait phones: narrow to wide range
    (width >= 280 && width <= 430 && height >= 640) ||
    // Landscape phones: typical landscape orientations  
    (width >= 568 && width <= 932 && height >= 320 && height <= 430) ||
    // Foldable devices and edge cases
    (width >= 280 && width <= 360 && height >= 653)
  ) && width < 600; // Exclude small tablets

  // Tablet detection
  const isTabletViewport = (
    width >= 600 && width <= 1024 && 
    height >= 600 && height <= 1366
  ) && isTouchDevice;

  const isMobile = isMobileViewport && isTouchDevice;
  const isTablet = isTabletViewport && !isMobile;

  // Device-specific layout preferences
  let layoutPreferences;
  
  if (isMobile) {
    // Samsung devices often have narrower screens - use vertical layout
    if (brand === 'Samsung' || width <= 360) {
      layoutPreferences = {
        weatherLayout: 'vertical' as const,
        modalSize: 'small' as const,
        fontScale: 0.9,
        spacingScale: 0.8
      };
    } else {
      // iPhone and wider Android phones
      layoutPreferences = {
        weatherLayout: 'compact' as const,
        modalSize: 'medium' as const,
        fontScale: 1.0,
        spacingScale: 1.0
      };
    }
  } else if (isTablet) {
    layoutPreferences = {
      weatherLayout: 'horizontal' as const,
      modalSize: 'medium' as const,
      fontScale: 1.1,
      spacingScale: 1.2
    };
  } else {
    // Desktop
    layoutPreferences = {
      weatherLayout: 'horizontal' as const,
      modalSize: 'large' as const,
      fontScale: 1.0,
      spacingScale: 1.0
    };
  }

  return {
    isMobile,
    isTablet,
    isTV: false,
    deviceType: isMobile ? 'phone' : isTablet ? 'tablet' : 'desktop',
    brand,
    model,
    layoutPreferences
  };
}

// Hook for React components
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());
  
  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return deviceInfo;
}

// For non-React contexts
let cachedDeviceInfo: DeviceInfo | null = null;

export function getDeviceInfo(): DeviceInfo {
  if (!cachedDeviceInfo) {
    cachedDeviceInfo = detectDevice();
    
    // Update cache on resize
    window.addEventListener('resize', () => {
      cachedDeviceInfo = detectDevice();
    });
  }
  
  return cachedDeviceInfo;
}