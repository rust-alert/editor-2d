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
          @dblclick="editColor(color.index)"
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
        <button class="edit-btn" @click="editColor(store.state.currentColorIndex)">编辑</button>
      </div>
    </div>
    
    <!-- 颜色编辑模式 -->
    <div v-if="isEditing" class="color-editor">
      <div class="editor-header">
        <h3>编辑颜色</h3>
        <button class="close-btn" @click="isEditing = false">×</button>
      </div>
      <div class="editor-controls">
        <div class="control-group">
          <label>色相 (H)</label>
          <input type="range" v-model.number="editingColor.hue" min="0" max="360" step="1" />
          <input type="number" v-model.number="editingColor.hue" min="0" max="360" />
        </div>
        <div class="control-group">
          <label>饱和度 (S)</label>
          <input type="range" v-model.number="editingColor.saturation" min="0" max="100" step="1" />
          <input type="number" v-model.number="editingColor.saturation" min="0" max="100" />
        </div>
        <div class="control-group">
          <label>亮度 (B)</label>
          <input type="range" v-model.number="editingColor.brightness" min="0" max="100" step="1" />
          <input type="number" v-model.number="editingColor.brightness" min="0" max="100" />
        </div>
        <div class="control-group">
          <label>透明度 (A)</label>
          <input type="range" v-model.number="editingColor.alpha" min="0" max="1" step="0.01" />
          <input type="number" v-model.number="editingColor.alpha" min="0" max="1" step="0.01" />
        </div>
        <div class="color-preview-large" :style="{ backgroundColor: previewColor }"></div>
        <div class="editor-actions">
          <button @click="saveEditedColor">保存</button>
          <button @click="isEditing = false">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 阵营色选择器 -->
    <div class="faction-color">
      <h3>阵营色</h3>
      <div class="faction-controls">
        <input type="range" v-model.number="factionHue" min="0" max="360" step="1" class="faction-slider" />
        <div class="faction-preview" :style="{ backgroundColor: `hsl(${factionHue}, 100%, 50%)` }"></div>
        <div>色相值: {{ factionHue }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {hueToColor} from '../utils';
import {useStore} from "../store/useStore.ts";

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