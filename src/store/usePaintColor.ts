import { computed } from "vue";
import { useStore } from "./useStore";

export const usePaintColor = () => {
    const store = useStore();
    
    const currentColor = computed(() => {
        return store.state.palette[store.state.currentColorIndex];
    });

    const setColor = (index: number) => {
        if (index >= 0 && index < store.state.palette.length) {
            store.state.currentColorIndex = index;
        }
    };

    return {
        currentColor,
        setColor
    };
};