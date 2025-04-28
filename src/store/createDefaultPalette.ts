// 创建默认的256色调色板
import type {Palette} from "../types";

export const createDefaultPalette = (): Palette => {
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