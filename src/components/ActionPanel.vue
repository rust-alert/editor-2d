<script setup lang="ts">
import {ref} from 'vue';
import {useStore} from '../store';

const store = useStore();

// 添加新动作
const newActionName = ref('');

const addNewAction = () => {
  if (newActionName.value.trim()) {
    store.addAction(newActionName.value.trim());
    newActionName.value = '';
  } else {
    store.addAction();
  }
};

// 选择动作
const selectAction = (actionId: string) => {
  store.setCurrentAction(actionId);
};
</script>

<template>
  <div class="action-panel">
    <div class="action-list">
      <div
          v-for="action in store.state.actions"
          :key="action.id"
          class="action-item"
          :class="{ 'selected': action.id === store.state.currentActionId }"
          @click="selectAction(action.id)"
      >
        {{ action.name }}
      </div>
    </div>

    <div class="action-controls">
      <input
          type="text"
          v-model="newActionName"
          placeholder="动作名称"
          class="action-input"
      />
      <button @click="addNewAction" class="add-action-btn">添加动作</button>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.action-panel
  display: flex
  flex-direction: column
  gap: 10px

.action-list
  display: flex
  flex-direction: column
  gap: 4px
  max-height: 150px
  overflow-y: auto

.action-item
  padding: 6px 10px
  background-color: #444
  border-radius: 3px
  cursor: pointer
  transition: background-color 0.2s

  &:hover
    background-color: #555

  &.selected
    background-color: #666
    font-weight: bold

.action-controls
  display: flex
  gap: 5px

.action-input
  flex: 1
  padding: 5px
  background-color: #333
  border: 1px solid #555
  border-radius: 3px
  color: white

  &:focus
    outline: none
    border-color: #777

.add-action-btn
  padding: 5px 10px
  background-color: #555
  border: none
  border-radius: 3px
  color: white
  cursor: pointer

  &:hover
    background-color: #666
</style>