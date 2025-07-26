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

  return (
    <div className="backdrop-blur-sm rounded-xl p-4 border" style={{ 
      backgroundColor: 'rgba(54, 69, 92, 0.25)', 
      borderColor: 'rgba(214, 204, 194, 0.3)' 
    }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/70 text-sm">{weather.location}</div>
          <div className="text-white text-lg font-semibold">
            {Math.round(weather.current.temp)}°C
          </div>
          <div className="text-white/60 text-xs">{weather.current.condition}</div>
        </div>
        <div className="text-white/80">
          {getWeatherIcon(weather.current.condition)}
        </div>
      </div>
      
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {weather.forecast.slice(0, 3).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-white/60 text-xs">{day.day}</div>
              <div className="text-white/80 text-xs">
                {Math.round(day.high)}°/{Math.round(day.low)}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}