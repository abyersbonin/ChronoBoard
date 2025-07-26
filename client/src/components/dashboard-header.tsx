import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getWeatherData, getWeatherIconClass } from "@/lib/weather";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  title: string;
  backgroundImageUrl?: string;
  location: string;
  use24Hour: boolean;
  onImageUpload: (imageUrl: string) => void;
}

export function DashboardHeader({ title, backgroundImageUrl, location, use24Hour, onImageUpload }: DashboardHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-header-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response.json();
      onImageUpload(imageUrl);
      toast({
        title: "Image uploaded successfully",
        description: "Your header background has been updated.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour
    });
  };

  return (
    <header className="relative h-40 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
      {backgroundImageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-6 h-full">
        {/* Top row with title and upload button */}
        <div className="flex items-start justify-between pt-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-lg text-gray-200 mt-1">
              {getCurrentDate()}
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border-0 text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Change Background'}
            </Button>
          </div>
        </div>

        {/* Bottom row with time and weather */}
        <div className="flex items-end justify-between">
          {/* Large Clock */}
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-20">
            <div className="text-5xl font-bold text-blue-400">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Weather Strip */}
          <div className="flex space-x-3">
            {weatherLoading ? (
              // Weather loading skeletons
              [...Array(4)].map((_, i) => (
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

                {/* Next 3 days forecast */}
                {weather.forecast.slice(1, 4).map((day, index) => (
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
