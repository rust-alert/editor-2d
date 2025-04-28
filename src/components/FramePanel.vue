<template>
  <div class="frame-panel">
    <div class="frame-timeline" v-if="store.currentAction.value">
      <div class="timeline-controls">
        <button @click="togglePlayback" class="control-btn">
          <span v-if="isPlaying">⏸</span>
          <span v-else>▶</span>
        </button>
        <div class="fps-control">
          <span>{{ fps }}帧/秒</span>
          <input type="range" min="1" max="60" v-model.number="fps" class="fps-slider"/>
        </div>
      </div>

      <div class="frame-list">
        <div
            v-for="frame in store.currentAction.value.frames"
            :key="frame.id"
            class="frame-item"
            :class="{ 'selected': frame.id === store.state.currentFrameId, 'current-playback': isPlaying && frame.id === currentPlaybackFrameId }"
            @click="selectFrame(frame.id)"
        >
          <div class="frame-number">{{ store.currentAction.value.frames.indexOf(frame) + 1 }}</div>
          <div class="frame-delete" @click.stop="deleteFrame(frame.id)" title="删除帧">✖</div>
        </div>
      </div>
    </div>

    <div class="frame-controls">
      <button @click="addNewFrame" class="add-frame-btn">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onUnmounted, watch} from 'vue';
import {useStore} from '../store';

const store = useStore();

// 添加新帧
const addNewFrame = () => {
  store.addFrame();
};

// 选择帧
const selectFrame = (frameId: string) => {
  store.setCurrentFrame(frameId);
};

// 删除帧
const deleteFrame = (frameId: string) => {
  if (confirm('确定要删除此帧吗？')) {
    store.deleteFrame(frameId);
  }
};

// 播放控制
const isPlaying = ref(false);
const fps = ref(24); // 默认24帧每秒
const currentPlaybackFrameId = ref('');
let playbackInterval: number | null = null;

// 切换播放/暂停
const togglePlayback = () => {
  isPlaying.value = !isPlaying.value;

  if (isPlaying.value) {
    startPlayback();
  } else {
    stopPlayback();
  }
};

// 开始播放
const startPlayback = () => {
  if (!store.currentAction.value || store.currentAction.value.frames.length === 0) return;

  // 如果没有选中帧，默认从第一帧开始
  if (!currentPlaybackFrameId.value) {
    currentPlaybackFrameId.value = store.currentAction.value.frames[0].id;
  }

  // 设置播放间隔
  const intervalTime = 1000 / fps.value;
  playbackInterval = window.setInterval(() => {
    if (!store.currentAction.value) return;

    // 获取当前播放帧的索引
    const currentIndex = store.currentAction.value.frames.findIndex(
        frame => frame.id === currentPlaybackFrameId.value
    );

    // 计算下一帧索引
    const nextIndex = (currentIndex + 1) % store.currentAction.value.frames.length;

    // 设置下一帧
    currentPlaybackFrameId.value = store.currentAction.value.frames[nextIndex].id;
    store.setCurrentFrame(currentPlaybackFrameId.value);
  }, intervalTime);
};

// 停止播放
const stopPlayback = () => {
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
};

// 监听帧率变化
watch(fps, () => {
  if (isPlaying.value) {
    stopPlayback();
    startPlayback();
  }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  stopPlayback();
});
</script>

<style lang="sass" scoped>
.frame-panel
  display: flex
  flex-direction: column
  gap: 10px
  width: 100%

.frame-timeline
  display: flex
  flex-direction: column
  gap: 8px

.timeline-controls
  display: flex
  align-items: center
  gap: 10px

.control-btn
  padding: 5px 10px
  background-color: #555
  border: none
  border-radius: 3px
  color: white
  cursor: pointer
  font-size: 14px
  display: flex
  align-items: center
  justify-content: center

  &:hover
    background-color: #666

.fps-control
  display: flex
  align-items: center
  gap: 8px
  font-size: 12px

.fps-slider
  width: 80px

.frame-list
  display: flex
  overflow-x: auto
  gap: 5px
  padding: 5px 0

.frame-item
  padding: 6px
  background-color: #444
  border-radius: 3px
  cursor: pointer
  transition: background-color 0.2s
  min-width: 40px
  height: 40px
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  position: relative

  &:hover
    background-color: #555

  &.selected
    background-color: #666
    font-weight: bold

  &.current-playback
    border: 2px solid #4CAF50

.frame-number
  font-size: 12px

.frame-delete
  position: absolute
  top: -5px
  right: -5px
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

  .frame-item:hover &
    opacity: 1

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
  font-size: 16px

  &:hover
    background-color: #666
</style>