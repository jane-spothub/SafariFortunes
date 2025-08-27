import { type FC, useEffect, useRef} from "react";
import {useNewDrawCanvas} from "../Hooks/NewDrawCanvas.ts";
import {usePreloadedSymbols} from "../Hooks/symbols loader.ts";
import {symbolAssets} from "../Hooks/symbolsImages.ts";
import type {PaylineResult} from "../Hooks/mapWinToCanvas.ts";
import type {SpinResponse} from "../Types/types.ts";


interface SlotProps {
    spinTrigger: boolean;
    reels: string[][];
    paylines: PaylineResult[];
    spinResponse:SpinResponse | undefined;
}

export const SlotCanvas: FC<SlotProps> = ({
                                              spinTrigger,
                                              paylines,
                                              reels,
                                              spinResponse
                                          })=>{
    const slotRef = useRef<HTMLCanvasElement | null>(null);
    const canvasWidth = 700;
    const canvasHeight = 700;
    // const MAX_FORWARD_SPEED = 50;
    const loadedSymbolImages = usePreloadedSymbols(symbolAssets);

    const {
        ctxRef,
        spinReels ,
        drawGrid
    } = useNewDrawCanvas({
        // getRandomSymbol(): string {
        //     return "";
        // },
        reels,
        canvasWidth,
        canvasHeight,
        loadedSymbolImages,
        spinTrigger,
        spinResponse
    });
    useEffect(() => {
        const canvas = slotRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;

        // initial draw (show server reels)
        drawGrid();
    }, [ctxRef, drawGrid]);

    useEffect(() => {
        if (spinTrigger) {
            spinReels();
        }
    }, [spinTrigger, paylines, spinReels]);

    return <canvas
        ref={slotRef}
        className="slots-canvas"
        width={canvasWidth}
        height={canvasHeight}
    />
}