<template>
  <div class="faction-color">
    <h3>阵营色</h3>
    <div class="faction-controls">
      <input 
        type="range" 
        v-model.number="hue" 
        min="0" 
        max="360" 
        step="1" 
        class="faction-slider"
      />
      <div 
        class="faction-preview" 
        :style="{ backgroundColor: `hsl(${hue}, 100%, 50%)` }"
      ></div>
      <div>色相值: {{ hue }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const hue = ref(0);
</script>

<style lang="sass" scoped>
.faction-color {
  background-color: #333;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: white;
  }

  .faction-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .faction-slider {
      width: 100%;
    }

    .faction-preview {
      width: 100%;
      height: 20px;
      border-radius: 3px;
      border: 1px solid #555;
    }
  }
}
</style>