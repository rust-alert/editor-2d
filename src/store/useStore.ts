// 创建状态存储
import {computed, reactive} from "vue";
import type {Action, Frame, Layer, Project, SerializedProject} from "../types";
import {generateId} from "../utils";
import {createDefaultProject} from "./createDefaultProject.ts";

export const useStore = () => {
    // 项目状态
    const state = reactive<Project>(createDefaultProject());

    // 计算属性
    const currentAction = computed(() => {
        return state.actions.find(action => action.id === state.currentActionId) || null;
    });

    const currentFrame = computed(() => {
        if (!currentAction.value) return null;
        return currentAction.value.frames.find(frame => frame.id === state.currentFrameId) || null;
    });

    const currentLayer = computed(() => {
        if (!currentFrame.value) return null;
        return currentFrame.value.layers.find(layer => layer.id === state.currentLayerId) || null;
    });

    const currentColor = computed(() => {
        return state.palette[state.currentColorIndex];
    });



    // 方法
    // 设置当前选中的颜色
    const setCurrentColor = (index: number) => {
        if (index >= 0 && index < state.palette.length) {
            state.currentColorIndex = index;
        }
    };

    // 设置当前动作
    const setCurrentAction = (actionId: string) => {
        const action = state.actions.find(a => a.id === actionId);
        if (action) {
            state.currentActionId = actionId;
            // 默认选择第一帧和第一图层
            if (action.frames.length > 0) {
                state.currentFrameId = action.frames[0].id;
                if (action.frames[0].layers.length > 0) {
                    state.currentLayerId = action.frames[0].layers[0].id;
                }
            }
        }
    };

    // 设置当前帧
    const setCurrentFrame = (frameId: string) => {
        if (!currentAction.value) return;

        const frame = currentAction.value.frames.find(f => f.id === frameId);
        if (frame) {
            state.currentFrameId = frameId;
            // 默认选择第一图层
            if (frame.layers.length > 0) {
                state.currentLayerId = frame.layers[0].id;
            }
        }
    };

    // 设置当前图层
    const setCurrentLayer = (layerId: string) => {
        if (!currentFrame.value) return;

        const layer = currentFrame.value.layers.find(l => l.id === layerId);
        if (layer) {
            state.currentLayerId = layerId;
        }
    };

    // 添加新动作
    const addAction = (name: string = '新动作') => {
        const actionId = generateId();
        const frameId = generateId();
        const layerId = generateId();

        const newAction: Action = {
            id: actionId,
            name,
            frames: [
                {
                    id: frameId,
                    x: 0,
                    y: 0,
                    width: state.canvasWidth,
                    height: state.canvasHeight,
                    layers: [
                        {
                            id: layerId,
                            name: '主图层',
                            visible: true,
                            pixels: []
                        },
                        {
                            id: generateId(),
                            name: '阴影图层',
                            visible: true,
                            pixels: []
                        }
                    ]
                }
            ]
        };

        state.actions.push(newAction);
        setCurrentAction(actionId);

        return actionId;
    };

    // 添加新帧
    const addFrame = () => {
        if (!currentAction.value) return null;

        const frameId = generateId();
        const layerId = generateId();

        const newFrame: Frame = {
            id: frameId,
            x: 0,
            y: 0,
            width: state.canvasWidth,
            height: state.canvasHeight,
            layers: [
                {
                    id: layerId,
                    name: '主图层',
                    visible: true,
                    pixels: []
                },
                {
                    id: generateId(),
                    name: '阴影图层',
                    visible: true,
                    pixels: []
                }
            ]
        };

        currentAction.value.frames.push(newFrame);
        setCurrentFrame(frameId);

        return frameId;
    };

    // 添加新图层
    const addLayer = (name: string = '新图层') => {
        if (!currentFrame.value) return null;

        const layerId = generateId();

        const newLayer: Layer = {
            id: layerId,
            name,
            visible: true,
            pixels: []
        };

        currentFrame.value.layers.push(newLayer);
        setCurrentLayer(layerId);

        return layerId;
    };

    // 绘制像素
    const drawPixel = (x: number, y: number) => {
        if (!currentLayer.value) return;

        // 检查是否已存在该位置的像素
        const existingPixelIndex = currentLayer.value.pixels.findIndex(
            p => p.x === x && p.y === y
        );

        if (existingPixelIndex !== -1) {
            // 如果已存在，则更新颜色
            currentLayer.value.pixels[existingPixelIndex].colorIndex = state.currentColorIndex;
        } else {
            // 如果不存在，则添加新像素
            currentLayer.value.pixels.push({
                x,
                y,
                colorIndex: state.currentColorIndex
            });
        }
    };

    // 擦除像素
    const erasePixel = (x: number, y: number) => {
        if (!currentLayer.value) return;

        // 移除该位置的像素
        currentLayer.value.pixels = currentLayer.value.pixels.filter(
            p => !(p.x === x && p.y === y)
        );
    };

    // 调整画布大小
    const resizeCanvas = (width: number, height: number) => {
        state.canvasWidth = width;
        state.canvasHeight = height;
    };

    // 序列化项目为JSON
    const serializeProject = (): string => {
        const serialized: SerializedProject = {
            name: state.name,
            canvasWidth: state.canvasWidth,
            canvasHeight: state.canvasHeight,
            palette: state.palette,
            actions: state.actions
        };

        return JSON.stringify(serialized);
    };

    // 从JSON加载项目
    const loadProject = (jsonData: string) => {
        try {
            const parsed: SerializedProject = JSON.parse(jsonData);

            // 更新项目数据
            state.name = parsed.name;
            state.canvasWidth = parsed.canvasWidth;
            state.canvasHeight = parsed.canvasHeight;
            state.palette = parsed.palette;
            state.actions = parsed.actions;

            // 设置默认选择
            if (state.actions.length > 0) {
                state.currentActionId = state.actions[0].id;
                if (state.actions[0].frames.length > 0) {
                    state.currentFrameId = state.actions[0].frames[0].id;
                    if (state.actions[0].frames[0].layers.length > 0) {
                        state.currentLayerId = state.actions[0].frames[0].layers[0].id;
                    }
                }
            } else {
                state.currentActionId = null;
                state.currentFrameId = null;
                state.currentLayerId = null;
            }

            return true;
        } catch (error) {
            console.error('加载项目失败:', error);
            return false;
        }
    };

    // 删除图层
    const deleteLayer = (layerId: string) => {
        if (!currentFrame.value || currentFrame.value.layers.length <= 1) return false;

        const layerIndex = currentFrame.value.layers.findIndex(l => l.id === layerId);
        if (layerIndex === -1) return false;

        // 删除图层
        currentFrame.value.layers.splice(layerIndex, 1);

        // 如果删除的是当前选中的图层，则选择另一个图层
        if (state.currentLayerId === layerId) {
            state.currentLayerId = currentFrame.value.layers[0].id;
        }

        return true;
    };

    // 删除帧
    const deleteFrame = (frameId: string) => {
        if (!currentAction.value || currentAction.value.frames.length <= 1) return false;

        const frameIndex = currentAction.value.frames.findIndex(f => f.id === frameId);
        if (frameIndex === -1) return false;

        // 删除帧
        currentAction.value.frames.splice(frameIndex, 1);

        // 如果删除的是当前选中的帧，则选择另一个帧
        if (state.currentFrameId === frameId) {
            state.currentFrameId = currentAction.value.frames[0].id;
        }

        return true;
    };

    // 删除动作
    const deleteAction = (actionId: string) => {
        if (state.actions.length <= 1) return false;

        const actionIndex = state.actions.findIndex(a => a.id === actionId);
        if (actionIndex === -1) return false;

        // 删除动作
        state.actions.splice(actionIndex, 1);

        // 如果删除的是当前选中的动作，则选择另一个动作
        if (state.currentActionId === actionId) {
            state.currentActionId = state.actions[0].id;
            if (state.actions[0].frames.length > 0) {
                state.currentFrameId = state.actions[0].frames[0].id;
                if (state.actions[0].frames[0].layers.length > 0) {
                    state.currentLayerId = state.actions[0].frames[0].layers[0].id;
                }
            }
        }

        return true;
    };

    return {
        // 状态
        state,
        // 计算属性
        currentAction,
        currentFrame,
        currentLayer,
        currentColor,
        // 方法
        setCurrentColor,
        setCurrentAction,
        setCurrentFrame,
        setCurrentLayer,
        addAction,
        addFrame,
        addLayer,
        deleteLayer,
        deleteFrame,
        deleteAction,
        drawPixel,
        erasePixel,
        resizeCanvas,
        serializeProject,
        loadProject
    };
};