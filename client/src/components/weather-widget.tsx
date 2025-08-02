import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Thermometer } from "lucide-react";
import { type WeatherData } from "@shared/schema";

interface WeatherWidgetProps {
  location: string;
}

export function WeatherWidget({ location }: WeatherWidgetProps) {
  // Mobile device detection (excluding TV browsers)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      // Exclude TV browsers (webOS, Tizen, etc.)
      const isTVBrowser = /webos|tizen|smart-tv|smarttv/.test(userAgent);
      
      // Check for mobile user agents
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      
      // Mobile if: (touch device AND small screen AND mobile UA) AND NOT TV browser
      const mobile = (isTouchDevice && isSmallScreen && isMobileUA) && !isTVBrowser;
      
      setIsMobile(mobile);
    };
    
    detectMobile();
    window.addEventListener('resize', detectMobile);
    
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['/api/weather', location],
    queryFn: async () => {
      const response = await fetch(`/api/weather/${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }
      return response.json() as Promise<WeatherData>;
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds to see changes
  });

  const getWeatherIcon = (condition: string, iconCode?: string) => {
    // Convert OpenWeatherMap icon codes to emoji with TV-optimized rendering
    if (iconCode) {
      const iconMap: { [key: string]: string } = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
      };
      return iconMap[iconCode] || '☀️';
    }
    
    // Fallback based on condition text
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
      return '🌧️';
    } else if (lowerCondition.includes('cloud')) {
      return '☁️';
    } else if (lowerCondition.includes('snow')) {
      return '❄️';
    } else if (lowerCondition.includes('thunder')) {
      return '⛈️';
    } else {
      return '☀️';
    }
  };

  if (isLoading) {
    return (
      <div 
        className="absolute rounded-md border flex z-[100] overflow-hidden"
        style={{
          backgroundColor: 'rgba(54, 69, 92, 0.8)',
          borderColor: 'rgba(214, 204, 194, 0.6)',
          height: '8.4vh',
          width: '65vw',
          left: '30vw',
          top: '25.7vh',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 text-center flex flex-col justify-between py-2 px-2 min-w-0">
            <div className="animate-pulse space-y-2">
              <div className="h-5 bg-white/40 rounded"></div>
              <div className="h-5 bg-white/40 rounded"></div>
              <div className="h-6 bg-white/40 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div 
        className="absolute rounded-md border flex items-center justify-center z-[100] overflow-hidden"
        style={{
          backgroundColor: 'rgba(54, 69, 92, 0.3)',
          borderColor: 'rgba(214, 204, 194, 0.4)',
          height: '8.4vh',
          width: '65vw',
          left: '30vw',
          top: '25.7vh',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        <div className="flex items-center justify-center text-white/70">
          <Thermometer className="w-3 h-3 mr-2" />
          <span className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Météo indisponible
          </span>
        </div>
      </div>
    );
  }

  const getDayName = (dateStr: string, index: number) => {
    const days = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
    const today = new Date();
    const forecastDate = new Date(dateStr);
    
    // Compare dates (ignore time)
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const forecastDateOnly = new Date(forecastDate.getFullYear(), forecastDate.getMonth(), forecastDate.getDate());
    
    const dayDiff = Math.round((forecastDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 0) return "AUJOURD'HUI";
    if (dayDiff === 1) return "DEMAIN";
    
    // For any other day, return the day name
    return days[forecastDate.getDay()];
  };

  // Use only authentic weather forecast data
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Check if today's forecast exists in the data
  const todayExists = weather.forecast.some(day => day.date === todayStr);
  
  // Filter forecast to include today and future days only
  const authentiForecast = weather.forecast.filter(day => {
    const forecastDate = new Date(day.date);
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const forecastDateOnly = new Date(forecastDate.getFullYear(), forecastDate.getMonth(), forecastDate.getDate());
    return forecastDateOnly >= todayDateOnly;
  });
  
  // Forecast logging removed for TV performance

  return (
    <div 
      style={{
        fontFamily: 'Montserrat, sans-serif',
        display: 'flex',
        flexDirection: 'row',
        gap: isMobile ? '4px' : '8px',
        zIndex: 30
      }}
    >
      {/* Current weather */}
      <div style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '8px',
        width: isMobile ? '150px' : '200px',
        height: isMobile ? '100px' : '110px',
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: isMobile ? '8px' : '20px',
        gap: isMobile ? '6px' : '12px'
      }}>
        <div style={{ 
          fontSize: isMobile ? '36px' : '60px', 
          fontFamily: 'Montserrat, sans-serif', 
          color: 'white', 
          fontWeight: 'bold',
          lineHeight: '1',
          letterSpacing: isMobile ? '2px' : '4px'
        }}>
          {Math.round(weather.current.temp)}°
        </div>
        <div style={{ 
          fontSize: isMobile ? '28px' : '48px', 
          lineHeight: '1',
          color: 'white',
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif',
          fontVariantEmoji: 'unicode',
          textRendering: 'optimizeQuality',
          WebkitFontSmoothing: 'antialiased',
          transform: isMobile ? 'translateY(-1px)' : 'translateY(-2px)'
        } as any}>
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
      </div>

      {/* Authentic forecast data only - show fewer items on mobile */}
      {authentiForecast.slice(0, isMobile ? 3 : authentiForecast.length).map((day, index) => (
        <div key={index} style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '8px',
          width: isMobile ? '85px' : '120px',
          height: isMobile ? '95px' : '110px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? '6px 4px' : '12px 8px'
        }}>
          <div style={{ 
            fontSize: isMobile ? '10px' : (getDayName(day.date, index).includes('AUJOURD') || getDayName(day.date, index).includes('DEMAIN') ? '12px' : '14px'), 
            fontFamily: 'Montserrat, sans-serif', 
            color: 'white', 
            fontWeight: '500',
            lineHeight: '1',
            marginBottom: isMobile ? '5px' : '8px'
          }}>
            {getDayName(day.date, index)}
          </div>
          <div style={{ 
            fontSize: isMobile ? '24px' : '32px', 
            lineHeight: '1',
            color: 'white',
            marginBottom: isMobile ? '5px' : '8px',
            fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif',
            fontVariantEmoji: 'unicode',
            textRendering: 'optimizeQuality',
            WebkitFontSmoothing: 'antialiased'
          } as any}>
            {getWeatherIcon(day.condition || '', day.icon)}
          </div>
          <div style={{ 
            fontSize: isMobile ? '11px' : '13px', 
            fontFamily: 'Montserrat, sans-serif', 
            color: 'white',
            fontWeight: '500',
            lineHeight: '1.2'
          }}>
            <div style={{ marginBottom: isMobile ? '1px' : '2px' }}>{Math.round(day.high)}°</div>
            <div style={{ color: '#93c5fd' }}>{Math.round(day.low)}°</div>
          </div>
        </div>
      ))}
    </div>
  );
}