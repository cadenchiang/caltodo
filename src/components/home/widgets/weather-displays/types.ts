/**
 * Shared props interface for all weather display components.
 * Each display receives weather data and display preferences.
 */

/** Current weather conditions. */
export interface CurrentWeather {
  temp: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

/** Single day forecast entry. */
export interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

/**
 * Props passed to every weather display component.
 *
 * @param current - Current weather conditions (null while loading)
 * @param forecast - 7-day forecast array
 * @param locationName - Reverse-geocoded city name
 * @param formatTemp - Converts Celsius to display string with unit
 * @param compact - Whether widget is in compact/small mode
 * @param viewMode - "today" or "week" data toggle
 * @param config - Full widget config record
 * @param editMode - Whether widget is in edit mode (disables click)
 * @param onDetailOpen - Callback to open the detail modal
 */
export interface WeatherDisplayProps {
  current: CurrentWeather;
  forecast: DayForecast[];
  locationName: string;
  formatTemp: (celsius: number) => string;
  compact: boolean;
  viewMode: "today" | "week";
  config?: Record<string, string>;
  editMode?: boolean;
  onDetailOpen: () => void;
}
