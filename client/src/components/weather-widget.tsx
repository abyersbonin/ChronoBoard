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
        className="absolute backdrop-blur-sm rounded-xl border flex"
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
          <div key={i} className="flex-1 text-center flex flex-col justify-center px-2">
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
      <div 
        className="absolute backdrop-blur-sm rounded-xl border flex items-center justify-center"
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
          <Thermometer className="w-4 h-4 mr-2" />
          <span className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
      className="absolute backdrop-blur-sm rounded-xl border flex"
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
      <div className="flex-1 text-center flex flex-col justify-center px-2">
        <div className="text-xs text-gray-300 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Aujourd'hui
        </div>
        <div className="text-lg font-bold text-yellow-400 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {Math.round(weather.current.temp)}°C
        </div>
        <div className="text-base mb-1">
          {getWeatherIcon(weather.current.condition, weather.current.icon)}
        </div>
        <div className="text-[9px] text-gray-400 capitalize leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {weather.current.condition}
        </div>
      </div>

      {/* Next 3 days forecast */}
      {weather.forecast.slice(1, 4).map((day, index) => (
        <div key={index} className="flex-1 text-center flex flex-col justify-center px-2 border-l border-white/20">
          <div className="text-xs text-gray-300 mb-1 capitalize" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {day.day}
          </div>
          <div className="text-sm font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span className="text-orange-400">{Math.round(day.high)}°C</span>
            <span className="text-blue-300 text-xs ml-1">{Math.round(day.low)}°C</span>
          </div>
          <div className="text-sm mb-1">
            {getWeatherIcon(day.condition || '', day.icon)}
          </div>
          <div className="text-[9px] text-gray-400 capitalize leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {day.condition}
          </div>
        </div>
      ))}
    </div>
  );
}