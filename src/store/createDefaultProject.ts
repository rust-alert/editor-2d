// 创建默认项目
import type {Project} from "../types";
import {createDefaultPalette} from "./createDefaultPalette.ts";
import {generateId} from "../utils";

export const createDefaultProject = (): Project => {
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