<template>
  <div class="pixel-editor">
    <header class="editor-header">
      <div class="mode-switcher">
        <button
            @click="switchMode('edit')"
            :class="{ active: currentMode === 'edit' }">
          编辑模式
        </button>
        <button
            @click="switchMode('preview')"
            :class="{ active: currentMode === 'preview' }">
          预览模式
        </button>
      </div>

      <div class="editor-menu">
        <button @click="handleNewProject">文件</button>
        <button @click="handleImport" :disabled="isImporting">导入</button>
        <button @click="handleExport" :disabled="isExporting">导出</button>
        <button @click="handleResizeCanvas">画布</button>
      </div>
    </header>

    <main class="editor-main">
      <div class="editor-sidebar">
        <palette-color/>
        <action-panel/>
        <layer-panel/>
      </div>

      <div class="editor-canvas-container">
        <PixelCanvas/>
      </div>

      <div class="editor-bottom">
        <div class="bottom-section">
          <h2>动画帧</h2>
          <FramePanel/>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import PixelCanvas from './components/PixelCanvas.vue';
import PaletteColor from './components/sidebar/PaletteColor.vue';
import ActionPanel from './components/sidebar/ActionPanel.vue';
import FramePanel from './components/sidebar/FramePanel.vue';
import LayerPanel from './components/sidebar/LayerPanel.vue';
import {exportProject, importProject} from './utils';
import {useStore} from "./store";

const store = useStore();
const isExporting = ref(false);
const isImporting = ref(false);
const currentMode = ref('edit');

// 切换模式
const switchMode = (mode: string) => {
  currentMode.value = mode;
  // 在这里可以添加模式切换后的逻辑
};

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


<style lang="scss">
// 编辑器主容器
.pixel-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

// 编辑器头部
.editor-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: #333;
  border-bottom: 1px solid #444;
}

.mode-switcher {
  display: flex;
  gap: 10px;
}

.mode-switcher button {
  padding: 5px 15px;
  background-color: #555;
  border: none;
  border-radius: 3px;
  color: white;
  cursor: pointer;
}

.mode-switcher button.active {
  background-color: #0078d7;
}

.editor-menu {
  display: flex;
  gap: 10px;
}

.editor-menu button {
  padding: 5px 15px;
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.editor-menu button:hover {
  background-color: #444;
}

.editor-header {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 1.5rem;
    margin: 0;
  }

  .editor-controls {
    display: flex;
    gap: 10px;

    button {
      background-color: #555;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #777;
      }

      &:disabled {
        background-color: #444;
        cursor: not-allowed;
      }

      // 编辑器主体
    }
  }
}

.editor-main {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  overflow: hidden;

  .editor-bottom {
    padding: 10px;
    background-color: #2a2a2a;
    border-radius: 5px;

    .bottom-section {
      h2 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 16px;
        color: #ddd;
      }

      // 侧边栏
    }
  }
}

.editor-sidebar {
  width: 250px;
  background-color: #444;
  color: white;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: sticky;
  top: 60px;
  height: calc(100vh - 110px);
  flex-shrink: 0;
}

.editor-main {
  display: flex;
  flex-flow: row wrap;

  .editor-sidebar,
  .editor-canvas-container {
    flex: 0 0 auto;
  }

  .editor-bottom {
    flex: 0 0 100%;
  }

  // 侧边栏部分
}

.sidebar-section {
  background-color: #555;
  border-radius: 4px;
  padding: 10px;

  h2 {
    font-size: 1rem;
    margin-bottom: 10px;
    border-bottom: 1px solid #777;
    padding-bottom: 5px;
  }

  // 画布容器
}

.editor-canvas-container {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  overflow: auto;
  height: 100%;
}

.editor-canvas-container,
.editor-sidebar {
  height: 100%;
}

.editor-canvas-container {
  flex: 1;
  overflow: auto;
}

.editor-bottom {
  position: sticky;
  bottom: 0;
  width: 100%;
  flex-shrink: 0;
}
</style>
