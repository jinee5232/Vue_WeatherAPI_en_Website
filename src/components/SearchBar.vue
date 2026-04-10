<template>
  <div class="w-full max-w-[600px] flex items-center gap-4 animate-fade-in">
    <div class="flex-1 relative group">
      <span class="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-white transition-colors z-10 pointer-events-none">
        search
      </span>
      <input
        type="text"
        :placeholder="placeholder"
        class="w-full py-3.5 pl-12 pr-4 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-lg placeholder:text-white/40 outline-none focus:bg-black/60 focus:border-white/40 focus:ring-4 focus:ring-white/5 transition-all shadow-lg"
        v-model="internalQuery"
        @keyup.enter="$emit('search', internalQuery)"
      />
    </div>
    
    <button @click="$emit('toggle-lang')" 
      class="px-5 py-3.5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white font-semibold flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all shadow-lg"
    >
      <span class="material-symbols-rounded text-[20px]">language</span>
      <span class="min-w-[24px] uppercase">{{ lang === 'zh_tw' ? 'EN' : '中' }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    query: String,
    lang: String,
    apiSource: String
  },
  data() {
    return {
      internalQuery: this.query
    }
  },
  computed: {
    placeholder() {
      if (this.apiSource === 'global') {
        return this.lang === 'zh_tw' ? '搜尋全球城市...' : 'Search global city...';
      }
      return this.lang === 'zh_tw' ? '搜尋台灣城市/區...' : 'Search Taiwan city/district...';
    }
  },
  watch: {
    query(newVal) {
      this.internalQuery = newVal;
    }
  }
}
</script>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
</style>
