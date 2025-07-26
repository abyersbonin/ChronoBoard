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
      <div className="backdrop-blur-sm rounded-xl p-4 border" style={{ 
        backgroundColor: 'rgba(54, 69, 92, 0.25)', 
        borderColor: 'rgba(214, 204, 194, 0.3)' 
      }}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-6 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="backdrop-blur-sm rounded-xl p-4 border" style={{ 
        backgroundColor: 'rgba(54, 69, 92, 0.25)', 
        borderColor: 'rgba(214, 204, 194, 0.3)' 
      }}>
        <div className="flex items-center text-white/70">
          <Thermometer className="w-5 h-5 mr-2" />
          <span className="text-sm">Météo indisponible</span>
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
    <div className="backdrop-blur-sm rounded-lg p-4 border flex items-center space-x-6" style={{ 
      backgroundColor: 'rgba(54, 69, 92, 0.4)', 
      borderColor: 'rgba(214, 204, 194, 0.3)',
      minWidth: '400px'
    }}>
      {/* Left side - Current temperature and weather icon */}
      <div className="flex items-center space-x-3">
        <div className="text-white text-5xl font-bold">{Math.round(weather.current.temp)}°</div>
        <div className="text-4xl">
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
      </div>
      
      {/* Right side - 4-day forecast in horizontal layout */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="flex space-x-6 flex-1">
          {weather.forecast.slice(0, 4).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-white text-sm font-medium mb-1">
                {getDayName(day.date, index)}
              </div>
              <div className="text-2xl mb-1">
                {getWeatherIcon(day.condition || '', day.icon)}
              </div>
              <div className="space-y-0">
                <div className="text-white font-semibold">{Math.round(day.high)}°</div>
                <div className="text-white/70 text-sm">{Math.round(day.low)}°</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}