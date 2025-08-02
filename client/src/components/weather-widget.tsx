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

  const getWeatherIcon = (condition: string, iconCode?: string, size: number = 48) => {
    // Convert OpenWeatherMap icon codes to colorful SVG icons for TV compatibility
    const getSvgIcon = (type: string) => {
      const svgStyle = { width: size, height: size, display: 'block', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' };
      
      switch (type) {
        case 'sun':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
              <g stroke="#FFD700" strokeWidth="3" strokeLinecap="round">
                <line x1="50" y1="10" x2="50" y2="20"/>
                <line x1="50" y1="80" x2="50" y2="90"/>
                <line x1="10" y1="50" x2="20" y2="50"/>
                <line x1="80" y1="50" x2="90" y2="50"/>
                <line x1="21.72" y1="21.72" x2="28.28" y2="28.28"/>
                <line x1="71.72" y1="71.72" x2="78.28" y2="78.28"/>
                <line x1="21.72" y1="78.28" x2="28.28" y2="71.72"/>
                <line x1="71.72" y1="28.28" x2="78.28" y2="21.72"/>
              </g>
            </svg>
          );
        case 'moon':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 C65 15, 75 30, 75 50 C75 70, 65 85, 50 90 C70 85, 85 70, 85 50 C85 30, 70 15, 50 10 Z" fill="#FFE135" stroke="#FFC107" strokeWidth="1"/>
            </svg>
          );
        case 'cloud':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 65 C15 65, 10 55, 15 45 C20 35, 35 35, 45 40 C50 25, 70 25, 75 40 C85 40, 90 50, 85 60 C80 70, 65 65, 60 65 Z" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="1"/>
            </svg>
          );
        case 'partlycloud':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="35" cy="35" r="15" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
              <g stroke="#FFD700" strokeWidth="2" strokeLinecap="round">
                <line x1="35" y1="10" x2="35" y2="15"/>
                <line x1="10" y1="35" x2="15" y2="35"/>
                <line x1="18" y1="18" x2="22" y2="22"/>
                <line x1="48" y1="22" x2="52" y2="18"/>
              </g>
              <path d="M35 55 C25 55, 20 50, 25 40 C30 35, 40 40, 50 45 C55 30, 75 35, 80 50 C85 50, 85 60, 80 65 C75 70, 65 65, 60 65 Z" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="1"/>
            </svg>
          );
        case 'rain':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 50 C15 50, 10 40, 15 30 C20 20, 35 20, 45 25 C50 10, 70 10, 75 25 C85 25, 90 35, 85 45 C80 55, 65 50, 60 50 Z" fill="#9E9E9E" stroke="#757575" strokeWidth="1"/>
              <g stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round">
                <line x1="30" y1="55" x2="25" y2="75"/>
                <line x1="45" y1="55" x2="40" y2="75"/>
                <line x1="60" y1="55" x2="55" y2="75"/>
                <line x1="38" y1="60" x2="33" y2="80"/>
                <line x1="53" y1="60" x2="48" y2="80"/>
              </g>
            </svg>
          );
        case 'thunder':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 50 C15 50, 10 40, 15 30 C20 20, 35 20, 45 25 C50 10, 70 10, 75 25 C85 25, 90 35, 85 45 C80 55, 65 50, 60 50 Z" fill="#616161" stroke="#424242" strokeWidth="1"/>
              <path d="M45 55 L40 70 L50 70 L35 85 L55 70 L45 70 Z" fill="#FFEB3B" stroke="#FBC02D" strokeWidth="1"/>
            </svg>
          );
        case 'snow':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 50 C15 50, 10 40, 15 30 C20 20, 35 20, 45 25 C50 10, 70 10, 75 25 C85 25, 90 35, 85 45 C80 55, 65 50, 60 50 Z" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="1"/>
              <g fill="#FFFFFF" stroke="#E1F5FE" strokeWidth="0.5">
                <circle cx="30" cy="60" r="3"/>
                <circle cx="45" cy="65" r="3"/>
                <circle cx="60" cy="60" r="3"/>
                <circle cx="38" cy="70" r="2"/>
                <circle cx="53" cy="72" r="2"/>
              </g>
            </svg>
          );
        case 'fog':
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round" opacity="0.7">
                <line x1="20" y1="40" x2="80" y2="40"/>
                <line x1="15" y1="50" x2="85" y2="50"/>
                <line x1="25" y1="60" x2="75" y2="60"/>
                <line x1="20" y1="70" x2="80" y2="70"/>
              </g>
            </svg>
          );
        default:
          return (
            <svg style={svgStyle} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
              <g stroke="#FFD700" strokeWidth="3" strokeLinecap="round">
                <line x1="50" y1="10" x2="50" y2="20"/>
                <line x1="50" y1="80" x2="50" y2="90"/>
                <line x1="10" y1="50" x2="20" y2="50"/>
                <line x1="80" y1="50" x2="90" y2="50"/>
                <line x1="21.72" y1="21.72" x2="28.28" y2="28.28"/>
                <line x1="71.72" y1="71.72" x2="78.28" y2="78.28"/>
                <line x1="21.72" y1="78.28" x2="28.28" y2="71.72"/>
                <line x1="71.72" y1="28.28" x2="78.28" y2="21.72"/>
              </g>
            </svg>
          );
      }
    };

    if (iconCode) {
      const iconMap: { [key: string]: string } = {
        '01d': 'sun', '01n': 'moon',
        '02d': 'partlycloud', '02n': 'cloud',
        '03d': 'cloud', '03n': 'cloud',
        '04d': 'cloud', '04n': 'cloud',
        '09d': 'rain', '09n': 'rain',
        '10d': 'rain', '10n': 'rain',
        '11d': 'thunder', '11n': 'thunder',
        '13d': 'snow', '13n': 'snow',
        '50d': 'fog', '50n': 'fog'
      };
      return getSvgIcon(iconMap[iconCode] || 'sun');
    }
    
    // Fallback based on condition text
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
      return getSvgIcon('rain');
    } else if (lowerCondition.includes('cloud')) {
      return getSvgIcon('cloud');
    } else if (lowerCondition.includes('snow')) {
      return getSvgIcon('snow');
    } else if (lowerCondition.includes('thunder')) {
      return getSvgIcon('thunder');
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return getSvgIcon('fog');
    } else {
      return getSvgIcon('sun');
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getWeatherIcon(weather.current.condition, weather.current.icon, 48)}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            {getWeatherIcon(day.condition || '', day.icon, 32)}
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