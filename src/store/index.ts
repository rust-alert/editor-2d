// 状态管理
import {reactive, computed, watch} from 'vue';
import type {Project, Palette, Action, Frame, Layer, Pixel, PaletteColor, SerializedProject} from '../types';
import {generateId} from '../utils';

// 创建默认的256色调色板
const createDefaultPalette = (): Palette => {
    const palette: Palette = [];

    // 创建256种颜色，包括不同的色相和透明度
    for (let i = 0; i < 256; i++) {
        // 色相范围 0-360
        const hue = Math.floor((i % 64) * (360 / 64));
        // 透明度范围 0-1，但第一个颜色（索引0）设为完全透明作为"擦除"颜色
        const alpha = i === 0 ? 0 : 0.25 + Math.floor(i / 64) * 0.25;

        palette.push({hue, alpha});
    }

    return palette;
};

// 创建默认项目
const createDefaultProject = (): Project => {
    const defaultPalette = createDefaultPalette();
    const defaultLayerId = generateId();
    const defaultFrameId = generateId();
    const defaultActionId = generateId();

    return {
        name: '新项目',
        canvasWidth: 32,
        canvasHeight: 32,
        palette: defaultPalette,
        actions: [
            {
                id: defaultActionId,
                name: '默认动作',
                frames: [
                    {
                        id: defaultFrameId,
                        x: 0,
                        y: 0,
                        width: 32,
                        height: 32,
                        layers: [
                            {
                                id: defaultLayerId,
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
            }
        ],
        currentActionId: defaultActionId,
        currentFrameId: defaultFrameId,
        currentLayerId: defaultLayerId,
        currentColorIndex: 1 // 默认选择第一个非透明颜色
    };
};

// 创建状态存储
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
        drawPixel,
        erasePixel,
        resizeCanvas,
        serializeProject,
        loadProject
    };
};