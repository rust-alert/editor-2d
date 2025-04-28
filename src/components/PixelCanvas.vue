<template>
  <div class="pixel-canvas-container" ref="canvasContainer">
    <canvas ref="canvasRef" class="pixel-canvas"></canvas>
    <div class="canvas-info">
      <div>缩放: {{ zoom }}x</div>
      <div>画布大小: {{ store.state.canvasWidth }}x{{ store.state.canvasHeight }}</div>
      <div>当前颜色:
        <span
            class="current-color-preview"
            :style="{ backgroundColor: hueToColor(store.currentColor.value.hue, store.currentColor.value.alpha) }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from '../store';
import { hueToColor, interpolatePoints } from '../utils';

const store = useStore();

// 画布引用
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);

// 缩放级别
const zoom = ref(10); // 每个像素的大小
const minZoom = 1;
const maxZoom = 32;

// 鼠标状态
const isDrawing = ref(false);
const lastPosition = ref({ x: -1, y: -1 });

// 计算画布尺寸
const canvasWidth = computed(() => store.state.canvasWidth * zoom.value);
const canvasHeight = computed(() => store.state.canvasHeight * zoom.value);

// 绘制网格和像素
const redrawCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制背景
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制网格
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  
  // 水平线
  for (let y = 0; y <= store.state.canvasHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * zoom.value);
    ctx.lineTo(canvas.width, y * zoom.value);
    ctx.stroke();
  }
  
  // 垂直线
  for (let x = 0; x <= store.state.canvasWidth; x++) {
    ctx.beginPath();
    ctx.moveTo(x * zoom.value, 0);
    ctx.lineTo(x * zoom.value, canvas.height);
    ctx.stroke();
  }
  
  // 绘制所有可见图层的像素
  if (store.currentFrame.value) {
    // 从底层到顶层绘制
    [...store.currentFrame.value.layers].reverse().forEach(layer => {
      if (!layer.visible) return;
      
      layer.pixels.forEach(pixel => {
        const color = store.state.palette[pixel.colorIndex];
        ctx.fillStyle = hueToColor(color.hue, color.alpha);
        ctx.fillRect(
          pixel.x * zoom.value + 1, 
          pixel.y * zoom.value + 1, 
          zoom.value - 1, 
          zoom.value - 1
        );
      });
    });
  }
};

// 处理鼠标事件
const handleMouseDown = (e: MouseEvent) => {
  if (!canvasRef.value || !store.currentLayer.value) return;
  
  isDrawing.value = true;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / zoom.value);
  const y = Math.floor((e.clientY - rect.top) / zoom.value);
  
  // 检查是否在画布范围内
  if (x >= 0 && x < store.state.canvasWidth && y >= 0 && y < store.state.canvasHeight) {
    // 右键擦除，左键绘制
    if (e.button === 2) { // 右键
      store.erasePixel(x, y);
    } else { // 左键
      store.drawPixel(x, y);
    }
    
    lastPosition.value = { x, y };
    redrawCanvas();
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDrawing.value || !canvasRef.value || !store.currentLayer.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / zoom.value);
  const y = Math.floor((e.clientY - rect.top) / zoom.value);
  
  // 检查是否在画布范围内
  if (x >= 0 && x < store.state.canvasWidth && y >= 0 && y < store.state.canvasHeight) {
    // 如果位置变化了，则绘制
    if (x !== lastPosition.value.x || y !== lastPosition.value.y) {
      // 在两点之间插值，以确保连续的线条
      const points = interpolatePoints(lastPosition.value.x, lastPosition.value.y, x, y);
      
      points.forEach(point => {
        // 右键擦除，左键绘制
        if (e.buttons === 2) { // 右键
          store.erasePixel(point.x, point.y);
        } else { // 左键
          store.drawPixel(point.x, point.y);
        }
      });
      
      lastPosition.value = { x, y };
      redrawCanvas();
    }
  }
};

const handleMouseUp = () => {
  isDrawing.value = false;
};

// 缩放控制
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  
  if (e.deltaY < 0) {
    // 放大
    zoom.value = Math.min(zoom.value + 1, maxZoom);
  } else {
    // 缩小
    zoom.value = Math.max(zoom.value - 1, minZoom);
  }
  
  redrawCanvas();
};

// 阻止右键菜单
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
};

// 监听画布大小变化
watch(
  () => [store.state.canvasWidth, store.state.canvasHeight],
  () => {
    if (canvasRef.value) {
      canvasRef.value.width = store.state.canvasWidth * zoom.value;
      canvasRef.value.height = store.state.canvasHeight * zoom.value;
      redrawCanvas();
    }
  }
);

// 监听当前帧或图层变化
watch(
  () => [store.currentFrame.value, store.currentLayer.value],
  () => {
    redrawCanvas();
  },
  { deep: true }
);

// 监听缩放变化
watch(
  () => [zoom.value],
  () => {
    if (canvasRef.value) {
      canvasRef.value.width = store.state.canvasWidth * zoom.value;
      canvasRef.value.height = store.state.canvasHeight * zoom.value;
      redrawCanvas();
    }
  }
);

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = store.state.canvasWidth * zoom.value;
    canvasRef.value.height = store.state.canvasHeight * zoom.value;
    redrawCanvas();
    
    // 添加事件监听
    canvasRef.value.addEventListener('mousedown', handleMouseDown);
    canvasRef.value.addEventListener('mousemove', handleMouseMove);
    canvasRef.value.addEventListener('mouseup', handleMouseUp);
    canvasRef.value.addEventListener('mouseleave', handleMouseUp);
    canvasRef.value.addEventListener('wheel', handleWheel);
    canvasRef.value.addEventListener('contextmenu', handleContextMenu);
  }
});
</script>



<style lang="sass" scoped>
.pixel-canvas-container
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 10px

.pixel-canvas
  background-color: #222
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5)
  image-rendering: pixelated
  image-rendering: crisp-edges
  cursor: crosshair

.canvas-info
  position: absolute
  bottom: 10px
  left: 10px
  background-color: rgba(0, 0, 0, 0.7)
  color: white
  padding: 8px
  border-radius: 4px
  font-size: 12px
  display: flex
  flex-direction: column
  gap: 4px

.current-color-preview
  display: inline-block
  width: 16px
  height: 16px
  border: 1px solid #fff
  vertical-align: middle
  margin-left: 5px
</style>