<template>
  <div class="layer-panel">
    <h2>图层</h2>
    <div class="layer-list" v-if="store.currentFrame.value">
      <div
          v-for="layer in store.currentFrame.value.layers"
          :key="layer.id"
          class="layer-item"
          :class="{ 'selected': layer.id === store.state.currentLayerId }"
          @click="selectLayer(layer.id)"
      >
        <div class="layer-visibility" @click.stop="toggleLayerVisibility(layer.id, $event)">
          <span v-if="layer.visible" class="visibility-icon visible">👁️</span>
          <span v-else class="visibility-icon hidden">👁️‍🗨️</span>
        </div>
        <div class="layer-name">{{ layer.name }}</div>
        <div class="layer-delete" @click.stop="deleteLayer(layer.id)" title="删除图层">✖</div>
      </div>
    </div>

    <div class="layer-controls">
      <input
          type="text"
          v-model="newLayerName"
          placeholder="图层名称"
          class="layer-input"
      />
      <button @click="addNewLayer" class="add-layer-btn">+</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref} from 'vue';

import {useStore} from "../store/useStore.ts";

const store = useStore();

// 添加新图层
const newLayerName = ref('');

const addNewLayer = () => {
  if (newLayerName.value.trim()) {
    store.addLayer(newLayerName.value.trim());
    newLayerName.value = '';
  } else {
    store.addLayer();
  }
};

// 选择图层
const selectLayer = (layerId: string) => {
  store.setCurrentLayer(layerId);
};

// 切换图层可见性
const toggleLayerVisibility = (layerId: string, event: Event) => {
  event.stopPropagation();

  if (store.currentFrame.value) {
    const layer = store.currentFrame.value.layers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }
};

// 删除图层
const deleteLayer = (layerId: string) => {
  if (confirm('确定要删除此图层吗？')) {
    store.deleteLayer(layerId);
  }
};
</script>
<style lang="sass" scoped>
.layer-panel
  display: flex
  flex-direction: column
  gap: 10px

.layer-list
  display: flex
  flex-direction: column
  gap: 4px
  max-height: 150px
  overflow-y: auto

.layer-item
  padding: 6px 10px
  background-color: #444
  border-radius: 3px
  cursor: pointer
  transition: background-color 0.2s
  display: flex
  align-items: center
  gap: 8px

  &:hover
    background-color: #555

  &.selected
    background-color: #666
    font-weight: bold

.layer-visibility
  cursor: pointer
  font-size: 14px

  .visibility-icon
    opacity: 0.7

    &.visible
      opacity: 1

    &.hidden
      opacity: 0.4

.layer-name
  flex: 1

.layer-controls
  display: flex
  gap: 5px

.layer-input
  flex: 1
  padding: 5px
  background-color: #333
  border: 1px solid #555
  border-radius: 3px
  color: white

  &:focus
    outline: none
    border-color: #777

.add-layer-btn
  padding: 5px 10px
  background-color: #555
  border: none
  border-radius: 3px
  color: white
  cursor: pointer

  &:hover
    background-color: #666
</style>