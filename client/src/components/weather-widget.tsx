import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, Thermometer } from "lucide-react";
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
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const getWeatherIcon = (condition: string, iconCode?: string) => {
    // Convert OpenWeatherMap icon codes to proper emojis
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
        className="absolute backdrop-blur-sm rounded-md border flex z-[100] overflow-hidden"
        style={{
          backgroundColor: 'rgba(54, 69, 92, 0.8)',
          borderColor: 'rgba(214, 204, 194, 0.6)',
          height: '8.4vh',
          width: '72vw',
          left: '27vw',
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
        className="absolute backdrop-blur-sm rounded-md border flex items-center justify-center z-[100] overflow-hidden"
        style={{
          backgroundColor: 'rgba(54, 69, 92, 0.3)',
          borderColor: 'rgba(214, 204, 194, 0.4)',
          height: '8.4vh',
          width: '72vw',
          left: '27vw',
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
    if (index === 0) return "Aujourd'hui";
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  return (
    <div 
      style={{
        position: 'absolute',
        backgroundColor: 'rgba(128, 128, 128, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '6px',
        height: '8.4vh',
        width: '72vw',
        left: '27vw',
        top: '25.7vh',
        fontFamily: 'Montserrat, sans-serif',
        display: 'flex',
        zIndex: 100,
        overflow: 'hidden'
      }}
    >
      {/* Today's weather */}
      <div style={{ 
        flex: 1, 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: '4px 8px',
        minWidth: 0
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontFamily: 'Montserrat, sans-serif', 
          color: 'white', 
          fontWeight: '500',
          lineHeight: '1'
        }}>
          Aujourd'hui
        </div>
        <div style={{ 
          fontSize: '16px', 
          fontFamily: 'Montserrat, sans-serif', 
          color: '#fbbf24', 
          fontWeight: 'bold',
          lineHeight: '1'
        }}>
          {Math.round(weather.current.temp)}°C
        </div>
        <div style={{ fontSize: '20px', lineHeight: '1' }}>
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
      </div>

      {/* Next 3 days forecast */}
      {weather.forecast.slice(1, 4).map((day, index) => (
        <div key={index} style={{
          flex: 1,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '4px 8px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
          minWidth: 0
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontFamily: 'Montserrat, sans-serif', 
            color: 'white', 
            fontWeight: '500',
            textTransform: 'capitalize',
            lineHeight: '1'
          }}>
            {day.day}
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontFamily: 'Montserrat, sans-serif', 
            fontWeight: '600',
            lineHeight: '1'
          }}>
            <span style={{ color: '#fb923c' }}>{Math.round(day.high)}°</span>
            <span style={{ color: '#93c5fd', fontSize: '14px', marginLeft: '4px' }}>{Math.round(day.low)}°</span>
          </div>
          <div style={{ fontSize: '20px', lineHeight: '1' }}>
            {getWeatherIcon(day.condition || '', day.icon)}
          </div>
        </div>
      ))}
    </div>
  );
}