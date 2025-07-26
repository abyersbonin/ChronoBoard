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

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
      return <CloudRain className="w-8 h-8" />;
    } else if (lowerCondition.includes('cloud')) {
      return <Cloud className="w-8 h-8" />;
    } else {
      return <Sun className="w-8 h-8" />;
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
    <div className="backdrop-blur-sm rounded-xl p-4 border" style={{ 
      backgroundColor: 'rgba(54, 69, 92, 0.4)', 
      borderColor: 'rgba(214, 204, 194, 0.3)' 
    }}>
      {/* Current weather - large display */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-white text-4xl font-bold">{Math.round(weather.current.temp)}°</div>
        <div className="text-white text-3xl">
          {weather.current.icon || "☀️"}
        </div>
      </div>
      
      {/* 4-day forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="flex justify-between space-x-2">
          {weather.forecast.slice(0, 4).map((day, index) => (
            <div key={index} className="text-center flex-1">
              <div className="text-white/80 text-xs mb-1 font-medium">
                {getDayName(day.date, index)}
              </div>
              <div className="text-lg mb-1 text-white">
                {day.icon || "☀️"}
              </div>
              <div className="space-y-0">
                <div className="font-semibold text-sm text-white">{Math.round(day.high)}°</div>
                <div className="text-white/70 text-xs">{Math.round(day.low)}°</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}