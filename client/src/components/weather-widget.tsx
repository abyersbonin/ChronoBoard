import { useQuery } from "@tanstack/react-query";
import { Thermometer } from "lucide-react";
import { type WeatherData } from "@shared/schema";
import { useLanguage } from "@/hooks/useLanguage";
import { useDeviceDetection } from "@/utils/deviceDetection";

interface WeatherWidgetProps {
  location: string;
  language?: 'fr' | 'en';
}

export function WeatherWidget({ location, language = 'fr' }: WeatherWidgetProps) {
  const { t } = useLanguage();
  const deviceInfo = useDeviceDetection();
  
  // Extract device-specific layout preferences
  const { isMobile, isTablet, deviceType, brand, layoutPreferences } = deviceInfo;
  const { weatherLayout, fontScale, spacingScale } = layoutPreferences;

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
            {t('weather.unavailable')}
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
    
    if (dayDiff === 0) return t('events.today');
    if (dayDiff === 1) return t('events.tomorrow');
    
    // For any other day, return the day name in the appropriate language
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return forecastDate.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase();
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
      className={isMobile ? 'mobile-weather-widget' : ''}
      style={{
        fontFamily: 'Montserrat, sans-serif',
        display: 'flex',
        flexDirection: isMobile ? 'column' : weatherLayout === 'vertical' ? 'column' : 'row',
        gap: `${isMobile ? 12 : 8 * spacingScale}px`,
        zIndex: 30,
        width: isMobile ? '100%' : '100%',
        maxWidth: isMobile ? '100%' : 'none',
        padding: isMobile ? '8px' : '0',
        overflow: isMobile ? 'visible' : 'initial'
      }}
    >
      {/* Current weather - mobile optimized */}
      <div style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '8px',
        width: isMobile ? '100%' : 
               weatherLayout === 'vertical' ? '100%' : 
               weatherLayout === 'compact' ? '180px' : '200px',
        height: isMobile ? '60px' : 
               isTablet ? '75px' : 
               `${(weatherLayout === 'vertical' ? 80 : 110) * spacingScale}px`,
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: isMobile ? '8px 12px' : `${12 * spacingScale}px`,
        gap: isMobile ? '12px' : `${10 * spacingScale}px`,
        minWidth: isMobile ? 'auto' : brand === 'Samsung' ? '280px' : 'auto'
      }}>
        <div style={{ 
          fontSize: `${(weatherLayout === 'vertical' ? 36 : 60) * fontScale}px`, 
          fontFamily: 'Montserrat, sans-serif', 
          color: 'white', 
          fontWeight: 'bold',
          lineHeight: '1',
          letterSpacing: `${(weatherLayout === 'vertical' ? 2 : 4) * fontScale}px`
        }}>
          {Math.round(weather.current.temp)}°
        </div>
        <div style={{ 
          fontSize: `${(weatherLayout === 'vertical' ? 28 : 48) * fontScale}px`, 
          lineHeight: '1',
          color: 'white',
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif',
          fontVariantEmoji: 'unicode',
          textRendering: 'optimizeQuality',
          WebkitFontSmoothing: 'antialiased',
          transform: `translateY(${-(weatherLayout === 'vertical' ? 1 : 2) * fontScale}px)`
        } as any}>
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
      </div>

      {/* Forecast - mobile optimized layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: isMobile ? '8px' : `${4 * spacingScale}px`,
        flexWrap: 'nowrap',
        overflowX: isMobile ? 'auto' : weatherLayout === 'vertical' ? 'auto' : 'visible',
        width: '100%',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }} className={isMobile || weatherLayout === 'vertical' ? 'scrollbar-hide' : ''}>
        {authentiForecast.slice(0, 4).map((day, index) => (
          <div key={index} style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '8px',
            width: isMobile ? '90px' : 
                   weatherLayout === 'vertical' ? `${70 * fontScale}px` : 
                   weatherLayout === 'compact' ? `${90 * fontScale}px` : '120px',
            height: isMobile ? '70px' : 
                   isTablet ? '85px' : 
                   `${(weatherLayout === 'vertical' ? 90 : 110) * spacingScale}px`,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '8px 6px' : `${6 * spacingScale}px ${3 * spacingScale}px`,
            flexShrink: 0,
            minWidth: isMobile ? '90px' : 'auto'
          }}>
            <div style={{ 
              fontSize: isMobile ? '12px' : `${(weatherLayout === 'vertical' ? 9 : 
                           getDayName(day.date, index).includes('AUJOURD') || 
                           getDayName(day.date, index).includes('DEMAIN') ? 12 : 14) * fontScale}px`, 
              fontFamily: 'Montserrat, sans-serif', 
              color: 'white', 
              fontWeight: '600',
              lineHeight: '1.1',
              marginBottom: isMobile ? '4px' : `${4 * spacingScale}px`
            }}>
              {getDayName(day.date, index)}
            </div>
            <div style={{ 
              fontSize: isMobile ? '24px' : `${(weatherLayout === 'vertical' ? 20 : 32) * fontScale}px`, 
              lineHeight: '1',
              color: 'white',
              marginBottom: isMobile ? '4px' : `${4 * spacingScale}px`,
              fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif',
              fontVariantEmoji: 'unicode',
              textRendering: 'optimizeQuality',
              WebkitFontSmoothing: 'antialiased'
            } as any}>
              {getWeatherIcon(day.condition || '', day.icon)}
            </div>
            <div style={{ 
              fontSize: isMobile ? '11px' : `${(weatherLayout === 'vertical' ? 10 : 13) * fontScale}px`, 
              fontFamily: 'Montserrat, sans-serif', 
              color: 'white',
              fontWeight: '500',
              lineHeight: '1.2'
            }}>
              <div style={{ marginBottom: isMobile ? '1px' : `${1 * spacingScale}px` }}>{Math.round(day.high)}°</div>
              <div style={{ color: '#93c5fd' }}>{Math.round(day.low)}°</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}