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
      <div className="flex space-x-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="backdrop-blur-sm rounded-xl p-3 border text-center min-w-[80px]" style={{ 
            backgroundColor: 'rgba(54, 69, 92, 0.3)', 
            borderColor: 'rgba(214, 204, 194, 0.4)' 
          }}>
            <div className="animate-pulse">
              <div className="h-3 bg-white/20 rounded mb-2"></div>
              <div className="h-5 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="backdrop-blur-sm rounded-xl p-3 border text-center" style={{ 
        backgroundColor: 'rgba(54, 69, 92, 0.3)', 
        borderColor: 'rgba(214, 204, 194, 0.4)' 
      }}>
        <div className="flex items-center justify-center text-white/70">
          <Thermometer className="w-4 h-4 mr-2" />
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
    <div className="flex space-x-3">
      {/* Today's weather */}
      <div className="backdrop-blur-sm rounded-xl p-3 border text-center min-w-[80px]" style={{ 
        backgroundColor: 'rgba(54, 69, 92, 0.3)', 
        borderColor: 'rgba(214, 204, 194, 0.4)' 
      }}>
        <div className="text-xs text-gray-300 mb-1">Aujourd'hui</div>
        <div className="text-lg font-bold text-yellow-400 mb-1">
          {Math.round(weather.current.temp)}°
        </div>
        <div className="text-base mb-1">
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
        <div className="text-[9px] text-gray-400 capitalize leading-tight">
          {weather.current.condition}
        </div>
      </div>

      {/* Next 3 days forecast */}
      {weather.forecast.slice(1, 4).map((day, index) => (
        <div key={index} className="backdrop-blur-sm rounded-xl p-3 border text-center min-w-[80px]" style={{ 
          backgroundColor: 'rgba(54, 69, 92, 0.3)', 
          borderColor: 'rgba(214, 204, 194, 0.4)' 
        }}>
          <div className="text-xs text-gray-300 mb-1 capitalize">{day.day}</div>
          <div className="text-sm font-semibold mb-1">
            <span className="text-orange-400">{Math.round(day.high)}°</span>
            <span className="text-blue-300 text-xs ml-1">{Math.round(day.low)}°</span>
          </div>
          <div className="text-sm mb-1">
            {getWeatherIcon(day.condition || '', day.icon)}
          </div>
          <div className="text-[9px] text-gray-400 capitalize leading-tight">
            {day.condition}
          </div>
        </div>
      ))}
    </div>
  );
}