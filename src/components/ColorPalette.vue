<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from '../store';
import { hueToColor } from '../utils';

const store = useStore();

// 调色板布局
const paletteRows = 16;
const paletteCols = 16;

// 计算调色板颜色
const paletteColors = computed(() => {
  return store.state.palette.map((color, index) => ({
    index,
    color: hueToColor(color.hue, color.alpha),
    isSelected: index === store.state.currentColorIndex
  }));
});

// 选择颜色
const selectColor = (index: number) => {
  store.setCurrentColor(index);
};
</script>

<template>
  <div class="color-palette">
    <div class="palette-grid">
      <div 
        v-for="color in paletteColors" 
        :key="color.index"
        class="color-cell"
        :class="{ 'selected': color.isSelected }"
        :style="{ backgroundColor: color.color }"
        @click="selectColor(color.index)"
        :title=`索引: ${color.index}`
      ></div>
    </div>
    
    <div class="current-color">
      <div 
        class="color-preview"
        :style="{ backgroundColor: hueToColor(store.currentColor.value.hue, store.currentColor.value.alpha) }"
      ></div>
      <div class="color-info">
        <div>索引: {{ store.state.currentColorIndex }}</div>
        <div>色相: {{ store.currentColor.value.hue }}</div>
        <div>透明度: {{ store.currentColor.value.alpha.toFixed(2) }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.color-palette
  display: flex
  flex-direction: column
  gap: 10px

.palette-grid
  display: grid
  grid-template-columns: repeat(16, 1fr)
  grid-template-rows: repeat(16, 1fr)
  gap: 1px
  background-color: #333
  padding: 1px
  border-radius: 4px

.color-cell
  width: 12px
  height: 12px
  cursor: pointer
  border: 1px solid transparent
  transition: transform 0.1s
  
  &:hover
    transform: scale(1.2)
    z-index: 1
  
  &.selected
    border-color: #fff
    box-shadow: 0 0 0 1px #000

.current-color
  display: flex
  align-items: center
  gap: 10px
  padding: 5px
  background-color: #333
  border-radius: 4px

.color-preview
  width: 30px
  height: 30px
  border: 1px solid #fff

.color-info
  font-size: 12px
  display: flex
  flex-direction: column
  gap: 2px
</style>