import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeather } from '@/hooks/useWeather';
import axios from 'axios';

function App() {
  const [city, setCity] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { weather, forecast, loading, error, fetchWeather, fetchWeatherByCoords } = useWeather();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
      if (!searchHistory.includes(city.trim())) {
        setSearchHistory(prev => [city.trim(), ...prev].slice(0, 5));
      }
      setCity('');
    }
  };

  const handleHistoryClick = (historicalCity: string) => {
    fetchWeather(historicalCity);
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          alert('Tidak dapat mengakses lokasi Anda');
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser Anda');
    }
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getUniqueDays = () => {
    if (!forecast) return [];
    
    const dailyForecasts = [];
    const seenDates = new Set();

    for (const item of forecast.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seenDates.has(date)) {
        seenDates.add(date);
        dailyForecasts.push(item);
      }
    }
    return dailyForecasts;
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-black">Weather App</h1>
          <p className="text-gray-600">Cek cuaca di kota manapun</p>
        </div>

        {/* Search Card */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Masukkan nama kota..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border-2 border-black focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                >
                  {loading ? 'Loading...' : 'Cari'}
                </Button>
              </div>
              
              <Button
                type="button"
                onClick={handleGeolocation}
                disabled={loading}
                variant="outline"
                className="w-full border-2 border-black hover:bg-gray-100"
              >
                📍 Gunakan Lokasi Saya
              </Button>
            </form>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600">Riwayat Pencarian:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer border-2 border-black hover:bg-gray-100"
                      onClick={() => handleHistoryClick(item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="border-2 border-black bg-red-50">
            <AlertDescription className="text-red-800 font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-8 w-1/3 bg-gray-300" />
              <Skeleton className="h-16 w-1/2 bg-gray-300" />
              <Skeleton className="h-4 w-2/3 bg-gray-300" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 bg-gray-300" />
                <Skeleton className="h-12 bg-gray-300" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Data */}
        {weather && !loading && (
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full border-2 border-black bg-white">
              <TabsTrigger 
                value="current"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Cuaca Sekarang
              </TabsTrigger>
              <TabsTrigger 
                value="forecast"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Prakiraan 5 Hari
              </TabsTrigger>
            </TabsList>

            {/* Current Weather */}
            <TabsContent value="current">
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="text-3xl">
                    {weather.name}, {weather.sys.country}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
                    <div>
                      <p className="text-6xl font-bold">{Math.round(weather.main.temp)}°C</p>
                      <p className="text-xl text-gray-600 capitalize mt-2">
                        {weather.weather[0].description}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Terasa seperti {Math.round(weather.main.feels_like)}°C
                      </p>
                    </div>
                    <img 
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                      alt="weather icon"
                      className="w-32 h-32"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-black">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Kelembaban</p>
                      <p className="text-2xl font-bold">{weather.main.humidity}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Angin</p>
                      <p className="text-2xl font-bold">{weather.wind.speed} m/s</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Tekanan</p>
                      <p className="text-2xl font-bold">{weather.main.pressure} hPa</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Suhu</p>
                      <p className="text-2xl font-bold">
                        {Math.round(weather.main.temp)}°C
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forecast */}
            <TabsContent value="forecast">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {getUniqueDays().map((day, index) => (
                  <Card 
                    key={index}
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <CardContent className="pt-6 text-center space-y-3">
                      <p className="font-bold text-sm">
                        {getDayName(day.dt_txt)}
                      </p>
                      <img 
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt="weather icon"
                        className="w-16 h-16 mx-auto"
                      />
                      <p className="text-2xl font-bold">
                        {Math.round(day.main.temp)}°C
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {day.weather[0].description}
                      </p>
                      <p className="text-xs text-gray-500">
                        💧 {day.main.humidity}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default App;
