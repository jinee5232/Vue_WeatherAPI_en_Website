import dayjs from "dayjs";

const GLOBAL_BASE_URL = "https://api.openweathermap.org/data/2.5/";
const CWA_BASE_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/";

export const fetchGlobalWeather = async (query, lang, key) => {
  const response = await fetch(
    `${GLOBAL_BASE_URL}weather?q=${query}&units=metric&lang=${lang}&APPID=${key}`
  );
  if (!response.ok) throw new Error('City not found');
  const data = await response.json();
  
  return {
    ...data,
    sys: {
      ...data.sys,
      sunrise_text: dayjs(data.sys.sunrise * 1000).format('HH:mm'),
      sunset_text: dayjs(data.sys.sunset * 1000).format('HH:mm')
    }
  };
};

export const fetchTaiwanWeather = async (query, lang, key) => {
  // 1. Fetch Observation Data (O-A0003-001)
  const obsResponse = await fetch(
    `${CWA_BASE_URL}O-A0003-001?Authorization=${key}&format=JSON`
  );
  if (!obsResponse.ok) throw new Error('CWA API Error');
  const obsData = await obsResponse.json();
  
  // 2. Find matching station (Fuzzy match Town then County)
  const stations = obsData.records.Station;
  const normalize = (str) => (str || '').replace(/臺/g, '台');
  const searchTerm = normalize(query);
  
  let match = stations.find(s => 
    normalize(s.GeoInfo.TownName).includes(searchTerm) || 
    normalize(s.GeoInfo.TownName) === searchTerm ||
    normalize(s.StationName).includes(searchTerm)
  );
  
  if (!match) {
    match = stations.find(s => normalize(s.GeoInfo.CountyName).includes(searchTerm));
  }
  
  if (!match) throw new Error('Taiwan city/district not found');

  // 3. Astronomical Data Fallback Logic (Moved to HomeView using coordinates)
  const sunrise = '--:--';
  const sunset = '--:--';

  // 4. Normalize to structure expected by UI
  return {
    name: `${match.GeoInfo.CountyName} ${match.GeoInfo.TownName}`,
    main: {
      temp: parseFloat(match.WeatherElement.AirTemperature),
      feels_like: parseFloat(match.WeatherElement.AirTemperature), // CWA observation doesn't have feels_like directly
      humidity: parseInt(match.WeatherElement.RelativeHumidity),
      pressure: parseFloat(match.WeatherElement.AirPressure)
    },
    weather: [{
      description: match.WeatherElement.Weather,
      main: mapCwaWeatherToMain(match.WeatherElement.Weather),
      icon: mapCwaWeatherToIcon(match.WeatherElement.Weather)
    }],
    wind: {
      speed: parseFloat(match.WeatherElement.WindSpeed)
    },
    visibility: match.WeatherElement.VisibilityDescription === '-99' ? 'N/A' : match.WeatherElement.VisibilityDescription,
    sys: {
      country: 'TW',
      sunrise_text: sunrise,
      sunset_text: sunset
    },
    coord: {
      lat: parseFloat(match.GeoInfo.Coordinates.find(c => c.CoordinateName === 'WGS84')?.StationLatitude || 0),
      lon: parseFloat(match.GeoInfo.Coordinates.find(c => c.CoordinateName === 'WGS84')?.StationLongitude || 0)
    }
  };
};

/**
 * Fallback to fetch astronomical data from OpenWeatherMap using coordinates
 * when CWA astronomical data is missing or incomplete.
 */
export const fetchAstroFallback = async (lat, lon, key) => {
  try {
    const response = await fetch(
      `${GLOBAL_BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${key}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      sunrise: dayjs(data.sys.sunrise * 1000).format('HH:mm'),
      sunset: dayjs(data.sys.sunset * 1000).format('HH:mm')
    };
  } catch (err) {
    return null;
  }
};

function mapCwaWeatherToMain(desc) {
  if (desc.includes('晴')) return 'Clear';
  if (desc.includes('雨')) return 'Rain';
  if (desc.includes('雲')) return 'Clouds';
  return 'Clear';
}

function mapCwaWeatherToIcon(desc) {
  // Mapping CWA descriptions to OpenWeatherMap icon codes
  if (desc.includes('晴') && desc.includes('雲')) return '02d';
  if (desc.includes('晴')) return '01d';
  if (desc.includes('陰') || desc.includes('多雲')) return '04d';
  if (desc.includes('雨')) return '09d';
  if (desc.includes('雷')) return '11d';
  return '50d';
}

export const fetchTaiwanCountySummary = async (key) => {
  const response = await fetch(`${CWA_BASE_URL}O-A0003-001?Authorization=${key}&format=JSON`);
  if (!response.ok) return {};
  const data = await response.json();
  const stations = data.records.Station;
  
  const summary = {};
  stations.forEach(s => {
    const county = s.GeoInfo.CountyName;
    const temp = parseFloat(s.WeatherElement.AirTemperature);
    if (temp > -90) { // Filter invalid data
      if (!summary[county]) {
        summary[county] = {
          temp: temp,
          count: 1,
          towns: new Set([s.GeoInfo.TownName])
        };
      } else {
        summary[county].temp += temp;
        summary[county].count += 1;
        summary[county].towns.add(s.GeoInfo.TownName);
      }
    }
  });

  // Calculate averages and convert Sets to Arrays
  Object.keys(summary).forEach(key => {
    summary[key].temp = summary[key].temp / summary[key].count;
    summary[key].towns = Array.from(summary[key].towns).sort();
  });

  return summary;
};

export const getNearestCounty = (lat, lon) => {
  // Approximate centroids of Taiwan counties
  const centroids = [
    { name: '臺北市', lat: 25.0330, lon: 121.5654 },
    { name: '新北市', lat: 25.0125, lon: 121.4657 },
    { name: '桃園市', lat: 24.9936, lon: 121.3010 },
    { name: '臺中市', lat: 24.1477, lon: 120.6736 },
    { name: '臺南市', lat: 22.9997, lon: 120.2270 },
    { name: '高雄市', lat: 22.6273, lon: 120.3014 },
    { name: '基隆市', lat: 25.1283, lon: 121.7419 },
    { name: '新竹市', lat: 24.8138, lon: 120.9675 },
    { name: '新竹縣', lat: 24.8252, lon: 121.0142 },
    { name: '苗栗縣', lat: 24.5601, lon: 120.8217 },
    { name: '彰化縣', lat: 24.0817, lon: 120.5385 },
    { name: '南投縣', lat: 23.9100, lon: 120.6865 },
    { name: '雲林縣', lat: 23.7092, lon: 120.4313 },
    { name: '嘉義市', lat: 23.4818, lon: 120.4537 },
    { name: '嘉義縣', lat: 23.4518, lon: 120.2559 },
    { name: '屏東縣', lat: 22.6761, lon: 120.4885 },
    { name: '宜蘭縣', lat: 24.7570, lon: 121.7530 },
    { name: '花蓮縣', lat: 23.9769, lon: 121.6044 },
    { name: '臺東縣', lat: 22.7554, lon: 121.1505 },
    { name: '澎湖縣', lat: 23.5711, lon: 119.5793 },
    { name: '金門縣', lat: 24.4361, lon: 118.3186 },
    { name: '連江縣', lat: 26.1558, lon: 119.9515 }
  ];

  let nearest = centroids[0];
  let minDist = Infinity;

  centroids.forEach(c => {
    const d = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lon - lon, 2));
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  });

  return nearest.name;
};
