import { useState } from 'react';
import { weatherService, type WeatherData, type ForecastData } from '@/services/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (city: string) => {
    try {
      setLoading(true);
      setError(null);
      const [weatherData, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(city),
        weatherService.getForecast(city),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch {
      setError('Kota tidak ditemukan atau terjadi kesalahan');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const weatherData = await weatherService.getWeatherByCoords(lat, lon);
      const forecastData = await weatherService.getForecast(weatherData.name);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch {
      setError('Tidak dapat mengambil data cuaca');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  return { weather, forecast, loading, error, fetchWeather, fetchWeatherByCoords };
};