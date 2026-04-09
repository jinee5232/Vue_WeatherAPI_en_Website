<template>
  <div v-if="data" class="relative flex flex-col justify-between items-center p-8 md:p-12 text-center text-white bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] animate-fade-in">
    
    <!-- Location & Date -->
    <div class="z-10 w-full mb-2">
      <h1 class="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">
        {{ data.name }}{{ data.sys && data.sys.country ? ', ' + data.sys.country : '' }}
      </h1>
      <p class="text-sm md:text-base font-medium opacity-50 mt-0.5 tracking-wide">
        {{ currentDate }}
      </p>
    </div>
    
    <!-- Main Weather Info (Compacted) -->
    <div class="z-10 flex flex-col items-center flex-1 justify-center my-2">
      <div class="flex items-start mb-0 group">
        <span class="text-7xl md:text-8xl font-black leading-none tracking-tighter drop-shadow-xl transition-transform group-hover:scale-105 duration-300">
          {{ Math.round(data.main.temp) }}°
        </span>
        <span class="text-2xl md:text-3xl font-bold opacity-30 mt-3 ml-1">C</span>
      </div>
      
      <div class="flex flex-col items-center mt-[-0.5rem]">
        <img 
          :src="weatherIconUrl" 
          :alt="data.weather[0].description"
          class="w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_8px_12px_rgba(0,0,0,0.3)] animate-pulse-slow"
        />
        <p class="text-xl md:text-2xl font-bold tracking-wide capitalize mt-[-1rem] opacity-80">
          {{ data.weather[0].description }}
        </p>
      </div>
    </div>

    <!-- Details Info Footer (Slimmer) -->
    <div class="z-10 flex items-center gap-2 px-5 py-2 bg-black/10 rounded-full border border-white/5 backdrop-blur-md opacity-70">
       <span class="material-symbols-rounded text-xs opacity-50">thermostat</span>
       <span class="text-xs font-bold tracking-[0.2em] text-white/70">
         {{ lang === 'zh_tw' ? '體感溫度' : 'FEELS LIKE' }} {{ Math.round(data.main.feels_like) }}°C
       </span>
    </div>

    <!-- Local Loading Overlay -->
    <div v-if="loading" class="absolute inset-0 z-20 bg-black/20 backdrop-blur-md flex items-center justify-center animate-fade-in">
      <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeatherCard',
  props: {
    data: Object,
    currentDate: String,
    lang: String,
    loading: Boolean
  },
  computed: {
    weatherIconUrl() {
      const icon = this.data.weather[0].icon;
      if (icon.startsWith('http')) return icon;
      return `https://openweathermap.org/img/wn/${icon}@4x.png`;
    }
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
