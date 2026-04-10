<template>
  <div v-if="data && data.main" class="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-up">
    <div v-for="(item, index) in details" :key="index" 
      class="flex items-center gap-6 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl hover:bg-white/10 transition-all group shadow-2xl"
    >
      <div class="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 flex-shrink-0">
        <span class="material-symbols-rounded text-white/60 text-[22px]">{{ item.icon }}</span>
      </div>
      <div class="flex flex-col justify-center overflow-hidden">
        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5 leading-none whitespace-nowrap">{{ item.label }}</span>
        <span class="text-[18px] font-bold text-white tracking-tight leading-none whitespace-nowrap">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeatherDetails',
  props: {
    data: Object,
    lang: String
  },
  computed: {
    details() {
      if (!this.data || !this.data.main) return [];
      const labels = {
        zh_tw: ['風速', '濕度', '能見度', '氣壓', '日出', '日落'],
        en: ['Wind', 'Humidity', 'Visibility', 'Pressure', 'Sunrise', 'Sunset']
      };
      const curLabels = this.lang === 'zh_tw' ? labels.zh_tw : labels.en;
      
      return [
        { label: curLabels[0], value: `${this.data.wind.speed} m/s`, icon: 'air' },
        { label: curLabels[1], value: `${this.data.main.humidity}%`, icon: 'humidity_percentage' },
        { label: curLabels[2], value: `${(this.data.visibility / 1000).toFixed(1)} km`, icon: 'visibility' },
        { label: curLabels[3], value: `${this.data.main.pressure} hPa`, icon: 'compress' },
        { label: curLabels[4], value: this.data.sys.sunrise_text || '--:--', icon: 'light_mode' },
        { label: curLabels[5], value: this.data.sys.sunset_text || '--:--', icon: 'dark_mode' }
      ];
    }
  }
}
</script>

<style scoped>
@keyframes fadeInUp { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
