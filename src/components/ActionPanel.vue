<template>
  <div class="action-panel">
    <h2>动作</h2>
    <div class="action-list">
      <div
          v-for="action in store.state.actions"
          :key="action.id"
          class="action-item"
          :class="{ 'selected': action.id === store.state.currentActionId }"
          @click="selectAction(action.id)"
      >
        <div class="action-name">{{ action.name }}</div>
        <div class="action-delete" @click.stop="deleteAction(action.id)" title="删除动作">✖</div>
      </div>
    </div>

    <div class="action-controls">
      <div class="action-inputs">
        <input
            type="text"
            v-model="newActionName"
            placeholder="动作名称"
            class="action-input"
        />
        <input
            type="text"
            v-model="actionVariant"
            placeholder="变体 (如：皮肤、方向)"
            class="action-input"
        />
      </div>
      <button @click="addNewAction" class="add-action-btn">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useStore} from '../store';

const store = useStore();

// 添加新动作
const newActionName = ref('');
const actionVariant = ref('');

const addNewAction = () => {
  let name = newActionName.value.trim();
  if (name) {
    // 如果有变体，添加到名称中
    if (actionVariant.value.trim()) {
      name = `${name} (${actionVariant.value.trim()})`;
    }
    store.addAction(name);
    newActionName.value = '';
    actionVariant.value = '';
  } else {
    store.addAction();
  }
};

// 选择动作
const selectAction = (actionId: string) => {
  store.setCurrentAction(actionId);
};

// 删除动作
const deleteAction = (actionId: string) => {
  if (confirm('确定要删除此动作吗？')) {
    store.deleteAction(actionId);
  }
};
</script>



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
  display: flex
  justify-content: space-between
  align-items: center

  &:hover
    background-color: #555

  &.selected
    background-color: #666
    font-weight: bold

.action-name
  flex: 1

.action-delete
  width: 16px
  height: 16px
  background-color: #f44336
  color: white
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  font-size: 10px
  opacity: 0
  transition: opacity 0.2s

  .action-item:hover &
    opacity: 1

.action-controls
  display: flex
  gap: 5px

.action-inputs
  display: flex
  flex-direction: column
  gap: 5px
  flex: 1

.action-input
  width: 100%
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
  font-size: 16px
  align-self: center

  &:hover
    background-color: #666
</style>