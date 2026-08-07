export interface WeatherForecast {
  date: string;
  weather: string;
  temperatureMin: number;
  temperatureMax: number;
  rainProbability: number;
  rainVolume: number;
  isSimulated: true;
}

export const mockWeatherForecast: WeatherForecast[] = [
  {
    date: '2026-08-06',
    weather: 'Chuvas fortes com tempestades',
    temperatureMin: 18,
    temperatureMax: 24,
    rainProbability: 95,
    rainVolume: 80,
    isSimulated: true,
  },
  {
    date: '2026-08-07',
    weather: 'Chuvas moderadas',
    temperatureMin: 17,
    temperatureMax: 23,
    rainProbability: 70,
    rainVolume: 40,
    isSimulated: true,
  },
  {
    date: '2026-08-08',
    weather: 'Nublado com pancadas isoladas',
    temperatureMin: 16,
    temperatureMax: 22,
    rainProbability: 45,
    rainVolume: 15,
    isSimulated: true,
  },
  {
    date: '2026-08-09',
    weather: 'Parcialmente nublado',
    temperatureMin: 15,
    temperatureMax: 25,
    rainProbability: 20,
    rainVolume: 5,
    isSimulated: true,
  },
  {
    date: '2026-08-10',
    weather: 'Ensolarado com nuvens dispersas',
    temperatureMin: 14,
    temperatureMax: 27,
    rainProbability: 10,
    rainVolume: 0,
    isSimulated: true,
  },
];
