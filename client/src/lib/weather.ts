import { type WeatherData } from "@shared/schema";

export const getWeatherData = async (location: string): Promise<WeatherData> => {
  const response = await fetch(`/api/weather/${encodeURIComponent(location)}`);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }
  
  return response.json();
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const getWeatherIconClass = (iconCode: string): string => {
  const iconMap: Record<string, string> = {
    '01d': 'fas fa-sun text-yellow-500',
    '01n': 'fas fa-moon text-blue-300',
    '02d': 'fas fa-cloud-sun text-yellow-400',
    '02n': 'fas fa-cloud-moon text-blue-300',
    '03d': 'fas fa-cloud text-gray-400',
    '03n': 'fas fa-cloud text-gray-400',
    '04d': 'fas fa-cloud text-gray-500',
    '04n': 'fas fa-cloud text-gray-500',
    '09d': 'fas fa-cloud-rain text-blue-400',
    '09n': 'fas fa-cloud-rain text-blue-400',
    '10d': 'fas fa-cloud-sun-rain text-blue-400',
    '10n': 'fas fa-cloud-moon-rain text-blue-400',
    '11d': 'fas fa-bolt text-yellow-600',
    '11n': 'fas fa-bolt text-yellow-600',
    '13d': 'fas fa-snowflake text-blue-200',
    '13n': 'fas fa-snowflake text-blue-200',
    '50d': 'fas fa-smog text-gray-400',
    '50n': 'fas fa-smog text-gray-400',
  };
  
  return iconMap[iconCode] || 'fas fa-cloud text-gray-400';
};
