import {useRef, useEffect, type FC, type Dispatch, type SetStateAction} from "react";
import {reelsCount, symbols, symbolsPerReel, symbolAssets} from "../Hooks/symbolsImages.ts";
import {usePreloadedSymbols} from "../Hooks/symbols loader.ts";
import {useCanvasDrawing} from "../Hooks/useCanvasDrawing.ts";

interface SlotProps {
    spinTrigger: boolean;
    resultPopUp: boolean;
    noWinning: boolean;
    betAmount: number;
    OnSetAmountWon: Dispatch<SetStateAction<number>>;
}

export const SlotsCanvas: FC<SlotProps> = ({
                                               spinTrigger,
                                               resultPopUp,
                                               noWinning,
                                               betAmount,
                                               OnSetAmountWon
                                           }) => {
    const slotRef = useRef<HTMLCanvasElement | null>(null);
    const canvasWidth = 700;
    const canvasHeight = 700;
    const MAX_FORWARD_SPEED = 50;
    const loadedSymbolImages = usePreloadedSymbols(symbolAssets);
    const symbolKeys = Object.keys(symbols);
    const getRandomSymbol = () =>
        symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
    const {
        ctxRef,
        spinReels,
        drawSymbol,
        drawColumnSeparators,
        drawCanvasBorder,
        drawGradientBackground
    } = useCanvasDrawing({
        canvasWidth,
        canvasHeight,
        loadedSymbolImages,
        MAX_FORWARD_SPEED,
        getRandomSymbol,
        spinTrigger,
        betAmount,
        OnSetAmountWon,

    });

    const symbolsRef = useRef<{
        symbol: string, x: number, y: number, targetY: number, speed: number
    }[][]>([]);

    useEffect(() => {
        const canvas = slotRef.current;
        if (!canvas || resultPopUp) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;

        const symbolWidth = canvasWidth / reelsCount;
        const symbolHeight = canvasHeight / symbolsPerReel;

        // 🔑 Only regenerate symbols if it's a spin AND it's not noWinning
        if (!spinTrigger && !noWinning) {
            symbolsRef.current = Array.from({ length: reelsCount }, (_, r) =>
                Array.from({ length: symbolsPerReel }, (_, s) => ({
                    symbol: getRandomSymbol(),
                    x: r * symbolWidth + symbolWidth / 2,
                    targetY: s * symbolHeight + symbolHeight / 2,
                    y: -symbolHeight,
                    speed: 10 + Math.random() * 5,
                }))
            );
        }

        const animatedSymbols = symbolsRef.current;

        let animationFrameId: number;
        function animateDrop() {
            if (!ctx || resultPopUp) return;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawGradientBackground(ctx);
            drawCanvasBorder(ctx);
            drawColumnSeparators(ctx);

            let allSettled = true;

            for (let r = 0; r < reelsCount; r++) {
                for (let s = 0; s < symbolsPerReel; s++) {
                    const item = animatedSymbols[r][s];

                    if (item.y < item.targetY) {
                        item.y += item.speed;
                        if (item.y > item.targetY) item.y = item.targetY;
                        allSettled = false;
                    }

                    drawSymbol(item.symbol, item.x, item.y, loadedSymbolImages, false, 1);
                }
            }

            if (allSettled && !noWinning) {
                ctx.save();
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.fillStyle = "#fff";
                ctx.font = "bold 40px Arial";
                ctx.textAlign = "center";
                ctx.fillText("No Win", canvasWidth / 2, canvasHeight / 2);
                ctx.restore();
            }

            if (!allSettled) {
                animationFrameId = requestAnimationFrame(animateDrop);
            }
        }

        animateDrop();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [
        ctxRef,
        drawCanvasBorder,
        drawColumnSeparators,
        drawGradientBackground,
        drawSymbol,
        getRandomSymbol,
        loadedSymbolImages,
        noWinning,
        resultPopUp,
        spinTrigger,
    ]);

    useEffect(() => {
        if (spinTrigger) {
            spinReels();
        }
    }, [spinReels, spinTrigger])

    return (
        <canvas
            ref={slotRef}
            className="slots-canvas"
            width={canvasWidth}
            height={canvasHeight}
        />
    );
};
