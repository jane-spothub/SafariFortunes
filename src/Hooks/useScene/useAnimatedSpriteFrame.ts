import { useEffect, useState } from "react";

interface UseAnimatedSpriteFrameOptions {
    totalFrames: number;
    fps?: number;
    isPlaying?: boolean;
}

export function useAnimatedSpriteFrame({
                                           totalFrames,
                                           fps = 12,
                                           isPlaying = true,
                                       }: UseAnimatedSpriteFrameOptions) {
    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setFrameIndex((prev) => (prev + 1) % totalFrames);
        }, 1000 / fps);

        return () => clearInterval(interval);
    }, [fps, totalFrames, isPlaying]);

    return frameIndex;
}
