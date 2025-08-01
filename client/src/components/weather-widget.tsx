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
        className="fixed backdrop-blur-sm rounded-md border flex z-[100] overflow-hidden"
        style={{
          backgroundColor: 'rgba(54, 69, 92, 0.3)',
          borderColor: 'rgba(214, 204, 194, 0.4)',
          height: '8.4vh',
          width: '68.9vw',
          left: '29vw',
          top: '25.7vh',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 text-center flex flex-col justify-between py-2 px-1 min-w-0">
            <div className="animate-pulse space-y-2">
              <div className="h-5 bg-white/20 rounded"></div>
              <div className="h-5 bg-white/20 rounded"></div>
              <div className="h-5 bg-white/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div 
        className="fixed backdrop-blur-sm rounded-md border flex items-center justify-center z-[100] overflow-hidden"
        style={{
          backgroundColor: 'rgba(54, 69, 92, 0.3)',
          borderColor: 'rgba(214, 204, 194, 0.4)',
          height: '8.4vh',
          width: '68.9vw',
          left: '29vw',
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
      className="fixed backdrop-blur-sm rounded-md border flex z-[100] overflow-hidden"
      style={{
        backgroundColor: 'rgba(54, 69, 92, 0.3)',
        borderColor: 'rgba(214, 204, 194, 0.4)',
        height: '8.4vh',
        width: '68.9vw',
        left: '29vw',
        top: '25.7vh',
        fontFamily: 'Montserrat, sans-serif'
      }}
    >
      {/* Today's weather */}
      <div className="flex-1 text-center flex flex-col justify-between py-2 px-1 min-w-0">
        <div className="text-[18px] text-gray-300 truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Aujourd'hui
        </div>
        <div className="text-[18px] font-bold text-yellow-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {Math.round(weather.current.temp)}°C
        </div>
        <div className="text-xl">
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
      </div>

      {/* Next 3 days forecast */}
      {weather.forecast.slice(1, 4).map((day, index) => (
        <div key={index} className="flex-1 text-center flex flex-col justify-between py-2 px-1 border-l border-white/20 min-w-0">
          <div className="text-[18px] text-gray-300 capitalize truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {day.day}
          </div>
          <div className="text-[18px] font-semibold truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span className="text-orange-400">{Math.round(day.high)}°</span>
            <span className="text-blue-300 text-sm ml-1">{Math.round(day.low)}°</span>
          </div>
          <div className="text-xl">
            {getWeatherIcon(day.condition || '', day.icon)}
          </div>
        </div>
      ))}
    </div>
  );
}