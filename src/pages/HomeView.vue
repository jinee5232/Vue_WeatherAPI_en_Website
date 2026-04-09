<template>
  <div id="home-view" :class="[bgClass, 'min-h-screen w-full overflow-hidden transition-all duration-700 bg-cover bg-center']">
    <div class="min-h-screen w-full p-4 md:p-8 bg-black/30 flex flex-col">
      
      <!-- Top Bar -->
      <header class="flex justify-center items-center w-full mb-8 relative">
        <SearchBar 
          v-if="viewMode === 'map' || isDesktop"
          :query="query" 
          :lang="lang" 
          :apiSource="apiSource"
          @search="handleSearch"
          @toggle-lang="toggleLanguage"
        />
        
        <div v-if="isDesktop" class="absolute right-0">
           <button class="px-5 py-2.5 text-white rounded-2xl flex items-center gap-2 text-sm glass-btn hover:bg-white/20 transition-all font-medium" @click="switchApiSource">
             <span class="material-symbols-rounded text-[20px]">{{ apiSource === 'global' ? 'map' : 'public' }}</span>
             {{ apiSource === 'global' 
                ? (lang === 'zh_tw' ? '切換台灣' : 'Switch Taiwan') 
                : (lang === 'zh_tw' ? '切換全球' : 'Switch Global') 
             }}
           </button>
        </div>
      </header>

      <main class="flex-1 w-full flex flex-col overflow-hidden">
        
        <!-- Taiwan Dashboard Structure (3 Columns Balanced) -->
        <template v-if="apiSource === 'taiwan' && isDesktop && viewMode === 'details' && weather">
          <div class="flex flex-row items-center justify-center gap-12 h-full px-8 animate-fade-in">
            <!-- Column 1: Map (Lighter weight) -->
            <div class="flex-[1] flex items-center justify-center h-full">
              <TaiwanMap 
                :activeCounty="selectedCounty"
                :availableCounties="availableCounties"
                :countyTemps="countyTemps"
                @select="handleCountySelect"
              />
            </div>

            <!-- Consolidated Info Group (Wider & More Space) -->
            <div class="flex-[1.5] flex flex-row items-center gap-12 rounded-[56px] backdrop-blur-3xl shadow-3xl px-20">
              <!-- Column 2: Hero Square Card -->
              <div class="flex-shrink-0">
                <WeatherCard 
                  :data="weather" 
                  :currentDate="currentDate" 
                  :lang="lang" 
                  :loading="loading"
                  class="w-[550px] h-[550px] !rounded-[3rem] shadow-2xl"
                />
              </div>

              <!-- Column 3: Stats Group & Selector -->
              <!-- Column 3: Stats Group & Selector (Expanded) -->
              <div class="flex-1 flex flex-col gap-10">
                <!-- Enhanced Town Selector -->
                <div v-if="availableTowns.length > 0" class="p-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center gap-4 text-white shadow-xl">
                  <label class="text-sm font-bold uppercase tracking-wider opacity-60 pl-2">{{ lang === 'zh_tw' ? '區域' : 'Town' }}</label>
                  <select v-model="selectedTown" @change="handleTownChange" class="flex-1 bg-white/10 border border-white/10 p-3 rounded-xl text-white outline-none cursor-pointer hover:bg-white/20 transition-all font-medium text-lg">
                    <option v-for="town in availableTowns" :key="town" :value="town" class="bg-slate-900 text-white">
                      {{ town }}
                    </option>
                  </select>
                </div>

                <!-- Detail Grid -->
                <WeatherDetails 
                  :data="weather" 
                  :lang="lang" 
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Global Mode or Mobile View -->
        <template v-else>
          <div class="flex-1 flex flex-col items-center justify-center w-full overflow-hidden custom-scrollbar">
            
            <!-- Full Map View (Restored & Centered) -->
            <div v-if="apiSource === 'taiwan' && viewMode === 'map'" class="w-full max-w-4xl aspect-square flex items-center justify-center animate-fade-in p-8">
               <TaiwanMap 
                :activeCounty="selectedCounty"
                :availableCounties="availableCounties"
                :countyTemps="countyTemps"
                @select="handleCountySelect"
              />
            </div>

            <!-- Global Detail Card with Compact Layout (Centered) -->
            <div v-if="weather && weather.main && (viewMode === 'details' || apiSource === 'global')" 
                 class="w-full max-w-[850px] flex flex-col items-center justify-center gap-8 animate-fade-in py-10">
              
              <button 
                v-if="!isDesktop && apiSource === 'taiwan' && viewMode === 'details'" 
                class="self-start mb-2 px-5 py-2 bg-white/10 rounded-full text-white flex items-center gap-2 hover:bg-white/20 border border-white/10 transition-all text-sm"
                @click="goBackToMap"
              >
                <span class="material-symbols-rounded text-[18px]">arrow_back</span>
                {{ lang === 'zh_tw' ? '回地圖' : 'Back to Map' }}
              </button>

              <WeatherCard 
                :data="weather" 
                :currentDate="currentDate" 
                :lang="lang" 
                :loading="loading"
                class="w-full !rounded-[2.5rem] shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
              />

              <WeatherDetails 
                :data="weather" 
                :lang="lang" 
                class="w-full"
              />

              <!-- Mobile Town Selector (Compact) -->
              <div v-if="!isDesktop && apiSource === 'taiwan' && availableTowns.length > 0" 
                   class="w-full p-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[20px] flex items-center gap-4 text-white">
                <label class="text-xs font-bold opacity-60 pl-2 whitespace-nowrap">{{ lang === 'zh_tw' ? '區域' : 'Town' }}</label>
                <select v-model="selectedTown" @change="handleTownChange" class="flex-1 bg-white/10 border border-white/10 p-2 rounded-xl text-white outline-none text-sm">
                  <option v-for="town in availableTowns" :key="town" :value="town" class="bg-gray-900">
                    {{ town }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </template>

        <!-- Loading / Error Tracking -->
        <div v-if="!weather && (loading || (error && viewMode === 'details'))" class="flex-1 flex items-center justify-center animate-fade-in">
          <div v-if="loading" class="flex flex-col items-center gap-6">
            <div class="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p class="text-white text-xl font-light tracking-[0.2em] pt-2">{{ lang === 'zh_tw' ? '讀取中...' : 'LOADING...' }}</p>
          </div>
          <div v-else-if="error" class="text-center group">
            <span class="material-symbols-rounded text-7xl text-white/30 group-hover:text-red-400 transition-colors mb-4">error</span>
            <p class="text-white text-xl mb-6 opacity-60">{{ lang === 'zh_tw' ? '找不到該城市或地區' : 'Location Not Found' }}</p>
            <button v-if="apiSource === 'taiwan'" @click="goBackToMap" class="px-8 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all border border-white/10">
               {{ lang === 'zh_tw' ? '返回地圖' : 'Back to Map' }}
            </button>
          </div>
        </div>

      </main>

      <!-- Mobile Footer Switcher -->
      <ApiToggleButton 
        v-if="!isDesktop"
        :apiSource="apiSource" 
        :lang="lang"
        @switch="switchApiSource"
      />
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import SearchBar from "../components/SearchBar.vue";
import WeatherCard from "../components/WeatherCard.vue";
import WeatherDetails from "../components/WeatherDetails.vue";
import ApiToggleButton from "../components/ApiToggleButton.vue";
import TaiwanMap from "../components/TaiwanMap.vue";
import { fetchGlobalWeather, fetchTaiwanWeather, fetchTaiwanCountySummary, getNearestCounty, fetchAstroFallback } from "../services/weatherService";

export default {
  name: 'HomeView',
  components: {
    SearchBar,
    WeatherCard,
    WeatherDetails,
    ApiToggleButton,
    TaiwanMap
  },
  data() {
    return {
      query: "台北市",
      weather: null,
      lang: "zh_tw",
      apiSource: "taiwan",
      loading: false,
      error: false,
      globalKey: import.meta.env.VITE_WEATHER_KEY,
      cwaKey: import.meta.env.VITE_CWA_KEY,
      viewMode: 'map', 
      selectedCounty: '',
      selectedTown: '',
      isDesktop: window.innerWidth > 1024,
      countySummary: {},
      gpsLocation: null,
    };
  },
  computed: {
    currentDate() {
      return dayjs().locale(this.lang === 'zh_tw' ? 'zh-tw' : 'en').format(`MMMM Do YYYY`);
    },
    bgClass() {
      if (!this.weather || !this.weather.main) return 'bg-slate-900';
      const temp = this.weather.main.temp;
      const condition = this.weather.weather[0].main.toLowerCase();
      if (condition.includes('rain')) return 'bg-rainy';
      if (condition.includes('cloud')) return temp > 16 ? 'bg-warm-cloudy' : 'bg-cold-cloudy';
      return temp > 16 ? 'bg-warm' : 'bg-cold';
    },
    availableCounties() {
      return Object.keys(this.countySummary);
    },
    countyTemps() {
      const temps = {};
      Object.keys(this.countySummary).forEach(k => {
        temps[k] = this.countySummary[k].temp;
      });
      return temps;
    },
    availableTowns() {
      if (!this.selectedCounty || !this.countySummary[this.selectedCounty]) return [];
      return this.countySummary[this.selectedCounty].towns;
    }
  },
  methods: {
    async handleSearch(newQuery) {
      if (!newQuery) return;
      this.query = newQuery;
      this.viewMode = 'details';
      this.executeFetch();
    },
    async executeFetch() {
      this.loading = true;
      this.error = false;
      try {
        if (this.apiSource === 'global') {
          this.weather = await fetchGlobalWeather(this.query, this.lang, this.globalKey);
        } else {
          this.weather = await fetchTaiwanWeather(this.query, this.lang, this.cwaKey);
          if (this.weather.name) {
            const parts = this.weather.name.split(' ');
            this.selectedCounty = parts[0];
            this.selectedTown = parts[1];
          }
          if ((!this.weather.sys.sunrise_text || this.weather.sys.sunrise_text === '--:--') && this.weather.coord) {
            const astro = await fetchAstroFallback(this.weather.coord.lat, this.weather.coord.lon, this.globalKey);
            if (astro) {
              this.weather.sys.sunrise_text = astro.sunrise;
              this.weather.sys.sunset_text = astro.sunset;
            }
          }
        }
      } catch (err) {
        console.error(err);
        this.error = true;
        this.weather = null;
      } finally {
        this.loading = false;
      }
    },
    async initLocation(autoSwitch = true) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const county = getNearestCounty(latitude, longitude);
          this.gpsLocation = county;
          if (autoSwitch || this.apiSource === 'taiwan') {
            this.selectedCounty = county;
            this.query = county;
            this.viewMode = 'details';
            await this.executeFetch();
          }
        }, () => {
          this.gpsLocation = "台北市";
          if (autoSwitch || this.apiSource === 'taiwan') {
            this.query = "台北市";
            this.executeFetch();
          }
        });
      }
    },
    async handleCountySelect(county) {
      this.selectedCounty = county;
      this.query = county;
      this.viewMode = 'details';
      await this.executeFetch();
    },
    async handleTownChange() {
      if (this.selectedTown) {
        this.query = this.selectedTown;
        await this.executeFetch();
      }
    },
    goBackToMap() {
      this.viewMode = 'map';
      this.weather = null;
      this.query = '';
    },
    async switchApiSource() {
      this.apiSource = this.apiSource === 'global' ? 'taiwan' : 'global';
      this.viewMode = 'map';
      if (this.apiSource === 'taiwan') {
        this.query = this.gpsLocation || "台北市";
        this.selectedCounty = this.query;
        this.viewMode = 'details';
        await this.executeFetch();
      } else {
        this.query = "Taipei";
        this.executeFetch();
      }
    },
    async loadTaiwanSummary() {
      this.countySummary = await fetchTaiwanCountySummary(this.cwaKey);
    },
    toggleLanguage() {
      this.lang = this.lang === "zh_tw" ? "en" : "zh_tw";
      if (this.weather) {
        this.executeFetch();
      }
    },
    handleResize() {
      this.isDesktop = window.innerWidth > 1024;
    }
  },
  async created() {
    window.addEventListener('resize', this.handleResize);
    this.loadTaiwanSummary();
    this.initLocation(false); 
    if (this.apiSource === 'global') {
      this.executeFetch();
    } else {
      await this.initLocation(true);
    }
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style>
/* Base Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* Scrollbar Styling */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }

/* Dynamic Gradients */
.bg-warm { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.bg-cold { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
.bg-cold-cloudy { background: linear-gradient(135deg, #606c88 0%, #3f4c6b 100%); }
.bg-warm-cloudy { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); }
.bg-rainy { background: linear-gradient(135deg, #203a43 0%, #2c5364 100%); }
.bg-taiwan { background: linear-gradient(135deg, #2c3e50 0%, #000000 100%); }

.glass-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.7s ease-out forwards; }
</style>
