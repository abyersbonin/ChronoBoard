import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWeatherData, getWeatherIconClass } from "@/lib/weather";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  title: string;
  location: string;
  use24Hour: boolean;
}

export function DashboardHeader({ title, location, use24Hour }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  const { data: weather, isLoading: weatherLoading, error: weatherError } = useQuery({
    queryKey: ['weather', location],
    queryFn: () => getWeatherData(location),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });


  const getCurrentDate = () => {
    // Format as "DIMANCHE, AOÛT 3"
    const weekday = currentTime.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase();
    const month = currentTime.toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase();
    const day = currentTime.getDate();
    return `${weekday}, ${month} ${day}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour
    });
  };

  return (
    <header className="relative h-48 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
      {/* YouTube Video Background */}
      <iframe
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        src="https://www.youtube.com/embed/erwoxqrS3rk?autoplay=1&mute=1&loop=1&playlist=erwoxqrS3rk&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&start=0"
        title="Background Video"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-6 h-full">
        {/* Top row with title */}
        <div className="flex items-start justify-between pt-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h1>
            <p className="text-lg text-gray-200 mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {getCurrentDate()}
            </p>
          </div>
        </div>

        {/* Bottom row with time and weather */}
        <div className="flex items-end justify-between">
          {/* Large Clock */}
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-20">
            <div className="text-5xl font-bold text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Weather Strip */}
          <div className="flex space-x-3">
            {weatherLoading ? (
              // Weather loading skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20 text-center min-w-[80px]">
                  <Skeleton className="h-3 w-12 mx-auto mb-2" />
                  <Skeleton className="h-6 w-8 mx-auto mb-2" />
                  <Skeleton className="h-6 w-6 mx-auto mb-1" />
                  <Skeleton className="h-2 w-16 mx-auto" />
                </div>
              ))
            ) : weatherError || !weather ? (
              // Weather error state
              <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20 text-center">
                <p className="text-red-400 text-sm">Weather Error</p>
              </div>
            ) : (
              <>
                {/* Today's weather */}
                <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20 text-center min-w-[80px]">
                  <div className="text-xs text-gray-300 mb-1">Aujourd'hui</div>
                  <div className="text-xl font-bold text-yellow-400 mb-1">
                    {weather.current.temp}°
                  </div>
                  <i className={`${getWeatherIconClass(weather.current.icon)} text-lg mb-1`} />
                  <div className="text-[10px] text-gray-400 capitalize leading-tight">
                    {weather.current.condition}
                  </div>
                </div>

                {/* Next 5 days forecast */}
                {weather.forecast.slice(1, 6).map((day, index) => (
                  <div key={index} className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20 text-center min-w-[80px]">
                    <div className="text-xs text-gray-300 mb-1 capitalize">{day.day}</div>
                    <div className="text-lg font-semibold mb-1">
                      <span className="text-orange-400">{day.high}°</span>
                      <span className="text-blue-300 text-xs ml-1">{day.low}°</span>
                    </div>
                    <i className={`${getWeatherIconClass(day.icon)} text-base mb-1`} />
                    <div className="text-[10px] text-gray-400 capitalize leading-tight">
                      {day.condition}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
