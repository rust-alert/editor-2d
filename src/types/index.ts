// 定义像素帧动画编辑器的核心类型

// 调色板颜色定义
export interface PaletteColor {
    hue: number;      // 色相 (0-360)
    alpha: number;    // 透明度 (0-1)
}

// 256色调色板
export type Palette = PaletteColor[];

// 像素点定义
export interface Pixel {
    x: number;
    y: number;
    colorIndex: number; // 调色板索引
}

// 图层定义
export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    pixels: Pixel[];
}

// 帧定义
export interface Frame {
    id: string;
    x: number;        // 起始点 x 坐标
    y: number;        // 起始点 y 坐标
    width: number;    // 帧宽度
    height: number;   // 帧高度
    layers: Layer[];  // 图层列表
}

// 动作定义
export interface Action {
    id: string;
    name: string;
    frames: Frame[];  // 帧列表
}

// 项目定义
export interface Project {
    name: string;
    canvasWidth: number;
    canvasHeight: number;
    palette: Palette;
    actions: Action[];
    currentActionId: string | null;
    currentFrameId: string | null;
    currentLayerId: string | null;
    currentColorIndex: number;
}

// 序列化格式
export interface SerializedProject {
    name: string;
    canvasWidth: number;
    canvasHeight: number;
    palette: Palette;
    actions: Action[];
}