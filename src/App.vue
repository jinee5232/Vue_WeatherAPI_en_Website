<template>
  <div id="app" :class="weather.main && weather.main.temp > 16 ? 'warm' : ''">
    <div class="container">
      <!-- search bar -->
      <div class="search-box">
        <input
          type="text"
          placeholder="Search...."
          class="search-bar"
          v-model="query"
          @keyup.enter="fetchWeather"
        />
      </div>

      <div class="weather-wrapper">
        <!-- location & date info -->
        <div class="weather-wrap" v-if="weather.main">
          <div class="location-box">
            <div class="location">{{ weather.name }}</div>
            <!-- <div class="date">Octorber 8th 2020</div> -->
            <!-- 加上自視應時間 -->
            <div class="date">{{ currentDate }}</div>
          </div>
          <div class="weather-box">
            <div class="temperature">{{ Math.round(weather.main.temp) }}°C</div>
            <div class="weather">{{ weather.weather[0].main }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);
export default {
  name: "App",
  data() {
    return {
      api_key: import.meta.env.VITE_WEATHER_KEY,
      base_url: "https://api.openweathermap.org/data/2.5/",
      query: "Taichung",
      weather: {},
      date: "",
    };
  },
  computed: {
    currentDate() {
      return dayjs().format(`MMMM Do YYYY`);
    },
  },
  methods: {
    async fetchWeather() {
      const response = await fetch(
        `${this.base_url}weather?q=${this.query}&units=metric&APPID=${this.api_key}`
      );
      const data = await response.json();
      this.weather = data;
      console.log(data);
    },
  },
  created() {
    this.fetchWeather();
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  background-image: url("./assets/cold-bg.jpg");
  background-size: cover;
  background-position: 0%;
  transition: 0.5s;
  width: 100vw;
  height: 100vh;
}

#app.warm {
  background-image: url("./assets/warm-bg.jpg");
}

.container {
  height: 100vh;
  padding: 25px;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25),
    rgba(0, 0, 0, 0.75)
  );
}
.search-box {
  width: 100%;
  margin-bottom: 35px;
}

.search-box .search-bar {
  display: block;
  width: 100%;
  padding: 15px;
  transition: all 0.4s ease-in;
  border-radius: 0 16px 0 16px;
  font-size: 20px;
  border: none;
  outline: none;
  background: none;
  background-color: hsla(0, 0%, 100%, 0.5);
}
.search-box .search-bar:focus {
  background-color: rgba(255, 255, 255, 0.75);
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.25);
  border-radius: 16px 0px 16px 0px;
}
.location-box .location {
  color: #fff;
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  text-shadow: 1px 3px rgba(0, 0, 0, 0.25);
}

.location-box .date {
  color: #fff;
  font-size: 20px;
  font-weight: 300;
  text-align: center;
  font-style: italic;
}
.weather-box {
  text-align: center;
  margin-top: 15px;
}
.weather-box .temperature {
  display: inline-block;
  padding: 10px 25px;
  color: #fff;
  font-size: 102px;
  font-weight: 900;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 3px 6px rgba(0, 0, 0, 0.25);
}
.weather-box .weather {
  font-size: 48px;
  color: #fff;
  font-weight: 700;
  font-style: italic;
  text-shadow: 3px 6px rgba(0, 0, 0, 0.25);
}
</style>
