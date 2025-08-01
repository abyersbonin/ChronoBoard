import { useQuery } from "@tanstack/react-query";
import { getWeatherData, getWeatherIconClass } from "@/lib/weather";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherStripProps {
  location: string;
}

export function WeatherStrip({ location }: WeatherStripProps) {
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['weather', location],
    queryFn: () => getWeatherData(location),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-dashboard-card rounded-xl p-4 text-center border border-gray-700">
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="mb-8">
        <div className="bg-dashboard-card rounded-xl p-4 text-center border border-gray-700">
          <p className="text-red-400">Failed to load weather data</p>
          <p className="text-gray-400 text-sm mt-1">Please check your weather API configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-7 gap-3">
        {/* Today's weather */}
        <div className="bg-dashboard-card rounded-xl p-3 text-center border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Aujourd'hui</div>
          <div className="text-xl font-bold text-yellow-400 mb-2">
            {weather.current.temp}°
          </div>
          <i className={`${getWeatherIconClass(weather.current.icon)} text-xl mb-1`} />
          <div className="text-xs text-gray-400 capitalize leading-tight">
            {weather.current.condition}
          </div>
        </div>

        {/* Next 6 days forecast */}
        {weather.forecast.slice(1, 7).map((day, index) => (
          <div key={index} className="bg-dashboard-card rounded-xl p-3 text-center border border-gray-700">
            <div className="text-xs text-gray-400 mb-2 capitalize">{day.day}</div>
            <div className="text-lg font-semibold mb-1">
              <span className="text-orange-400">{day.high}°</span>
              <span className="text-blue-300 text-xs ml-1">{day.low}°</span>
            </div>
            <i className={`${getWeatherIconClass(day.icon)} text-lg mb-1`} />
            <div className="text-xs text-gray-400 capitalize leading-tight">
              {day.condition}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
