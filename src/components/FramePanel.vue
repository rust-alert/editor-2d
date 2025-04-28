<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '../store';

const store = useStore();

// 添加新帧
const addNewFrame = () => {
  store.addFrame();
};

// 选择帧
const selectFrame = (frameId: string) => {
  store.setCurrentFrame(frameId);
};
</script>

<template>
  <div class="frame-panel">
    <div class="frame-list" v-if="store.currentAction.value">
      <div 
        v-for="frame in store.currentAction.value.frames" 
        :key="frame.id"
        class="frame-item"
        :class="{ 'selected': frame.id === store.state.currentFrameId }"
        @click="selectFrame(frame.id)"
      >
        帧 {{ store.currentAction.value.frames.indexOf(frame) + 1 }}
        <div class="frame-info">
          {{ frame.width }}x{{ frame.height }}
        </div>
      </div>
    </div>
    
    <div class="frame-controls">
      <button @click="addNewFrame" class="add-frame-btn">添加帧</button>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.frame-panel
  display: flex
  flex-direction: column
  gap: 10px

.frame-list
  display: flex
  flex-wrap: wrap
  gap: 5px
  max-height: 150px
  overflow-y: auto

.frame-item
  padding: 6px
  background-color: #444
  border-radius: 3px
  cursor: pointer
  transition: background-color 0.2s
  width: 60px
  height: 60px
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  font-size: 12px
  
  &:hover
    background-color: #555
  
  &.selected
    background-color: #666
    font-weight: bold

.frame-info
  font-size: 10px
  margin-top: 4px
  opacity: 0.7

.frame-controls
  display: flex
  justify-content: center

.add-frame-btn
  padding: 5px 10px
  background-color: #555
  border: none
  border-radius: 3px
  color: white
  cursor: pointer
  
  &:hover
    background-color: #666
</style>