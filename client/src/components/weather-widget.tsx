import { useQuery } from "@tanstack/react-query";
import { Thermometer } from "lucide-react";
import { type WeatherData } from "@shared/schema";

interface WeatherWidgetProps {
  location: string;
}

export function WeatherWidget({ location }: WeatherWidgetProps) {
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
    // Convert OpenWeatherMap icon codes to proper emojis with TV-optimized styling
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
        gap: '8px',
        zIndex: 30
      }}
    >
      {/* Current weather */}
      <div style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '8px',
        width: '200px',
        height: '110px',
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px',
        gap: '12px'
      }}>
        <div style={{ 
          fontSize: '60px', 
          fontFamily: 'Montserrat, sans-serif', 
          color: 'white', 
          fontWeight: 'bold',
          lineHeight: '1'
        }}>
          {Math.round(weather.current.temp)}°
        </div>
        <div style={{ 
          fontSize: '48px', 
          lineHeight: '1',
          fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, EmojiSymbols, EmojiOne, Twemoji Mozilla, system-ui, sans-serif',
          textRendering: 'optimizeQuality',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}>
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
      </div>

      {/* Authentic forecast data only */}
      {authentiForecast.map((day, index) => (
        <div key={index} style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '8px',
          width: '120px',
          height: '110px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 8px'
        }}>
          <div style={{ 
            fontSize: getDayName(day.date, index).includes('AUJOURD') || getDayName(day.date, index).includes('DEMAIN') ? '12px' : '14px', 
            fontFamily: 'Montserrat, sans-serif', 
            color: 'white', 
            fontWeight: '500',
            lineHeight: '1',
            marginBottom: '8px'
          }}>
            {getDayName(day.date, index)}
          </div>
          <div style={{ 
            fontSize: '32px', 
            lineHeight: '1',
            marginBottom: '8px',
            fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, EmojiSymbols, EmojiOne, Twemoji Mozilla, system-ui, sans-serif',
            textRendering: 'optimizeQuality',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}>
            {getWeatherIcon(day.condition || '', day.icon)}
          </div>
          <div style={{ 
            fontSize: '13px', 
            fontFamily: 'Montserrat, sans-serif', 
            color: 'white',
            fontWeight: '500',
            lineHeight: '1.2'
          }}>
            <div style={{ marginBottom: '2px' }}>{Math.round(day.high)}°</div>
            <div style={{ color: '#93c5fd' }}>{Math.round(day.low)}°</div>
          </div>
        </div>
      ))}
    </div>
  );
}