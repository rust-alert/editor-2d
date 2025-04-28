<template>
  <div class="color-palette">
    <h2>调色板</h2>
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
          <input type="range" v-model.number="editingColor.hue" min="0" max="360" step="1"/>
          <input type="number" v-model.number="editingColor.hue" min="0" max="360"/>
        </div>
        <div class="control-group">
          <label>饱和度 (S)</label>
          <input type="range" v-model.number="editingColor.saturation" min="0" max="100" step="1"/>
          <input type="number" v-model.number="editingColor.saturation" min="0" max="100"/>
        </div>
        <div class="control-group">
          <label>亮度 (B)</label>
          <input type="range" v-model.number="editingColor.brightness" min="0" max="100" step="1"/>
          <input type="number" v-model.number="editingColor.brightness" min="0" max="100"/>
        </div>
        <div class="control-group">
          <label>透明度 (A)</label>
          <input type="range" v-model.number="editingColor.alpha" min="0" max="1" step="0.01"/>
          <input type="number" v-model.number="editingColor.alpha" min="0" max="1" step="0.01"/>
        </div>
        <div class="color-preview-large" :style="{ backgroundColor: previewColor }"></div>
        <div class="editor-actions">
          <button @click="saveEditedColor">保存</button>
          <button @click="isEditing = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {hueToColor} from '../../utils';
import {useStore} from "../../store/useStore.ts";

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
  store.state.currentColorIndex = index;
};

// 颜色编辑模式
const isEditing = ref(false);
const editingIndex = ref(0);
const editingColor = ref({
  hue: 0,
  saturation: 100,
  brightness: 50,
  alpha: 1
});

// 编辑颜色
const editColor = (index: number) => {
  editingIndex.value = index;
  const color = store.state.palette[index];
  editingColor.value = {
    hue: color.hue,
    saturation: 100, // HSL中饱和度固定为100%
    brightness: 50,  // HSL中亮度固定为50%
    alpha: color.alpha
  };
  isEditing.value = true;
};

// 预览编辑中的颜色
const previewColor = computed(() => {
  return `hsla(${editingColor.value.hue}, ${editingColor.value.saturation}%, ${editingColor.value.brightness}%, ${editingColor.value.alpha})`;
});

// 保存编辑的颜色
const saveEditedColor = () => {
  if (editingIndex.value >= 0 && editingIndex.value < store.state.palette.length) {
    store.state.palette[editingIndex.value] = {
      hue: editingColor.value.hue,
      alpha: editingColor.value.alpha
    };
    isEditing.value = false;
  }
};

// 编辑模式
const isEditMode = ref(false);
const groupedPalette = computed(() => {
  const groups = [];
  for (let i = 0; i < paletteColors.value.length; i += 16) {
    groups.push(paletteColors.value.slice(i, i + 16));
  }
  return groups;
});

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};
</script>


<style lang="sass" scoped>
.color-palette
  display: flex
  flex-direction: column
  gap: 10px
  width: 100%

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
  flex: 1

  .edit-btn
    margin-top: 5px
    background-color: #555
    border: none
    color: white
    padding: 2px 5px
    border-radius: 3px
    cursor: pointer

    &:hover
      background-color: #666

// 颜色编辑器样式
.color-editor
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  background-color: #444
  border-radius: 5px
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5)
  width: 300px
  z-index: 100

  .editor-header
    display: flex
    justify-content: space-between
    align-items: center
    padding: 10px
    background-color: #333
    border-top-left-radius: 5px
    border-top-right-radius: 5px

    h3
      margin: 0
      color: white

    .close-btn
      background: none
      border: none
      color: white
      font-size: 18px
      cursor: pointer

  .editor-controls
    padding: 15px
    display: flex
    flex-direction: column
    gap: 10px

    .control-group
      display: flex
      flex-direction: column
      gap: 5px

      label
        font-size: 14px
        color: white

      input[type="range"]
        width: 100%

      input[type="number"]
        width: 60px
        background-color: #333
        border: 1px solid #555
        color: white
        padding: 3px

    .color-preview-large
      width: 100%
      height: 50px
      border: 1px solid #555
      margin: 10px 0

    .editor-actions
      display: flex
      justify-content: flex-end
      gap: 10px

      button
        background-color: #555
        border: none
        color: white
        padding: 5px 10px
        border-radius: 3px
        cursor: pointer

        &:hover
          background-color: #666

// 阵营色样式
.faction-color
  background-color: #333
  border-radius: 4px
  padding: 10px
  margin-top: 10px

  h3
    margin: 0 0 10px 0
    font-size: 14px
    color: white

  .faction-controls
    display: flex
    flex-direction: column
    gap: 8px

    .faction-slider
      width: 100%

    .faction-preview
      width: 100%
      height: 20px
      border-radius: 3px
      border: 1px solid #555
</style>