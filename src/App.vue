<script setup lang="ts">
import {ref, onMounted} from 'vue';
import PixelCanvas from './components/PixelCanvas.vue';
import ColorPalette from './components/ColorPalette.vue';
import ActionPanel from './components/ActionPanel.vue';
import FramePanel from './components/FramePanel.vue';
import LayerPanel from './components/LayerPanel.vue';
import {exportProject, importProject} from './utils';
import {useStore} from "./store/useStore.ts";

const store = useStore();
const isExporting = ref(false);
const isImporting = ref(false);

// 导出项目
const handleExport = () => {
  isExporting.value = true;
  try {
    const jsonData = store.serializeProject();
    exportProject(jsonData, `${store.state.name}.json`);
  } catch (error) {
    console.error('导出失败:', error);
  } finally {
    isExporting.value = false;
  }
};

// 导入项目
const handleImport = async () => {
  isImporting.value = true;
  try {
    const jsonData = await importProject();
    const success = store.loadProject(jsonData);
    if (!success) {
      alert('导入失败: 无效的项目文件');
    }
  } catch (error) {
    console.error('导入失败:', error);
  } finally {
    isImporting.value = false;
  }
};

// 创建新项目
const handleNewProject = () => {
  if (confirm('确定要创建新项目吗？当前未保存的更改将丢失。')) {
    // 重新加载页面以重置状态
    window.location.reload();
  }
};

// 调整画布大小
const canvasWidth = ref(store.state.canvasWidth);
const canvasHeight = ref(store.state.canvasHeight);

const handleResizeCanvas = () => {
  const width = parseInt(prompt('输入画布宽度', canvasWidth.value.toString()) || canvasWidth.value.toString());
  const height = parseInt(prompt('输入画布高度', canvasHeight.value.toString()) || canvasHeight.value.toString());

  if (width > 0 && height > 0) {
    store.resizeCanvas(width, height);
    canvasWidth.value = width;
    canvasHeight.value = height;
  }
};
</script>

<template>
  <div class="pixel-editor">
    <header class="editor-header">
      <div class="editor-controls">
        <button @click="handleNewProject">新建项目</button>
        <button @click="handleImport" :disabled="isImporting">导入项目</button>
        <button @click="handleExport" :disabled="isExporting">导出项目</button>
        <button @click="handleResizeCanvas">调整画布大小</button>
      </div>
    </header>

    <main class="editor-main">
      <div class="editor-sidebar">
        <div class="sidebar-section">
          <h2>调色板</h2>
          <ColorPalette/>
        </div>

        <div class="sidebar-section">
          <h2>动作</h2>
          <ActionPanel/>
        </div>

        <div class="sidebar-section">
          <h2>图层</h2>
          <LayerPanel/>
        </div>
      </div>

      <div class="editor-canvas-container">
        <PixelCanvas/>
      </div>

      <div class="editor-bottom">
        <div class="bottom-section">
          <h2>帧</h2>
          <FramePanel/>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="sass">
// 重置样式
*
  margin: 0
  padding: 0
  box-sizing: border-box

body
  font-family: 'Arial', sans-serif
  background-color: #f0f0f0
  color: #333

// 编辑器主容器
.pixel-editor
  display: flex
  flex-direction: column
  height: 100vh
  overflow: hidden

// 编辑器头部
.editor-header
  background-color: #333
  color: white
  padding: 10px 20px
  display: flex
  justify-content: space-between
  align-items: center

  h1
    font-size: 1.5rem
    margin: 0

  .editor-controls
    display: flex
    gap: 10px

    button
      background-color: #555
      color: white
      border: none
      padding: 8px 12px
      border-radius: 4px
      cursor: pointer
      transition: background-color 0.2s

      &:hover
        background-color: #777

      &:disabled
        background-color: #444
        cursor: not-allowed

// 编辑器主体
.editor-main
  display: flex
  flex-direction: column
  gap: 20px
  flex: 1
  overflow: hidden

  .editor-bottom
    padding: 10px
    background-color: #2a2a2a
    border-radius: 5px

    .bottom-section
      h2
        margin-top: 0
        margin-bottom: 10px
        font-size: 16px
        color: #ddd

// 侧边栏
.editor-sidebar
  width: 250px
  background-color: #444
  color: white
  padding: 10px
  overflow-y: auto
  display: flex
  flex-direction: column
  gap: 15px

.editor-main
  display: flex
  flex-flow: row wrap

  .editor-sidebar, .editor-canvas-container
    flex: 0 0 auto

  .editor-bottom
    flex: 0 0 100%

// 侧边栏部分
.sidebar-section
  background-color: #555
  border-radius: 4px
  padding: 10px

  h2
    font-size: 1rem
    margin-bottom: 10px
    border-bottom: 1px solid #777
    padding-bottom: 5px

// 画布容器
.editor-canvas-container
  flex: 1
  padding: 20px
  display: flex
  justify-content: center
  align-items: center
  background-color: #333
  overflow: auto

.editor-canvas-container, .editor-sidebar
  height: 100%

.editor-canvas-container
  flex: 1
  overflow: auto

.editor-bottom
  width: 100%
</style>
