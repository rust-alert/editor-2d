// 工具函数

// 生成唯一ID
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 将色相和透明度转换为CSS颜色
export const hueToColor = (hue: number, alpha: number): string => {
    return `hsla(${hue}, 100%, 50%, ${alpha})`;
};

// 计算两点之间的距离
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// 在两点之间插值生成像素点（用于绘制线条）
export const interpolatePoints = (x1: number, y1: number, x2: number, y2: number): { x: number, y: number }[] => {
    const points: { x: number, y: number }[] = [];
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
        points.push({x, y});

        if (x === x2 && y === y2) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }

    return points;
};

// 导出项目
export const exportProject = (jsonData: string, fileName: string = 'pixel-animation.json') => {
    const blob = new Blob([jsonData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
};

// 导入项目
export const importProject = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) {
                reject(new Error('未选择文件'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = () => {
                reject(new Error('读取文件失败'));
            };
            reader.readAsText(file);
        };

        input.click();
    });
};