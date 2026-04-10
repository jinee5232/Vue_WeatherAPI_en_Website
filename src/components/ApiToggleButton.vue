<template>
  <button class="fab-btn glass" @click="$emit('switch')" :title="lang === 'zh_tw' ? '切換氣象來源' : 'Switch API Source'">
    <span class="material-symbols-rounded">{{ apiSource === 'global' ? 'public' : 'location_on' }}</span>
    <div class="fab-label">
      {{ label }}
    </div>
  </button>
</template>

<script>
export default {
  name: 'ApiToggleButton',
  props: {
    apiSource: String,
    lang: String
  },
  computed: {
    label() {
      if (this.apiSource === 'global') {
        return this.lang === 'zh_tw' ? '全球' : 'Global';
      }
      return this.lang === 'zh_tw' ? '台灣' : 'Taiwan';
    }
  }
}
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.fab-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.8rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  z-index: 100;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fab-btn:hover {
  transform: scale(1.1) translateY(-5px);
  background: rgba(255, 255, 255, 0.3);
}

.fab-btn span {
  font-size: 2rem;
}

.fab-label {
  font-weight: 600;
  font-size: 1rem;
}
</style>
