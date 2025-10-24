import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL;

const weatherAPI = axios.create({
  baseURL: BASE_URL,
  params: {
    appid: API_KEY,
    units: 'metric',
  },
});

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
  coord: {
    lat: number;
    lon: number;
  };
}

export interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    dt_txt: string;
  }>;
  city: {
    name: string;
  };
}

export const weatherService = {
  getCurrentWeather: async (city: string): Promise<WeatherData> => {
    const response = await weatherAPI.get('/weather', {
      params: { q: city },
    });
    return response.data;
  },

  getWeatherByCoords: async (lat: number, lon: number): Promise<WeatherData> => {
    const response = await weatherAPI.get('/weather', {
      params: { lat, lon },
    });
    return response.data;
  },

  getForecast: async (city: string): Promise<ForecastData> => {
    const response = await weatherAPI.get('/forecast', {
      params: { q: city },
    });
    return response.data;
  },
};