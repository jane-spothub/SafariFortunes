import { useEffect, useState } from "react";

export const usePreloadedSymbols = (symbolAssets: Record<string, string>) => {
    const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

    useEffect(() => {
        const loaded: Record<string, HTMLImageElement> = {};
        const assetKeys = Object.keys(symbolAssets);
        let loadedCount = 0;

        assetKeys.forEach((key) => {
            const img = new Image();
            img.src = symbolAssets[key];

            img.onload = () => {
                const normalizedKey = key.toString(); // ensure it's a raw string
                loaded[normalizedKey] = img;
                loadedCount++;
                if (loadedCount === assetKeys.length) {
                    setImages({ ...loaded });
                }
            };
        });

    }, [symbolAssets]);

    return images;
};
