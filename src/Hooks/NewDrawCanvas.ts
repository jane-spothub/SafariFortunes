import {useRef, useCallback} from "react";
import {reelsCount, symbolsPerReel, lineColors, generateRandomReels} from "./symbolsImages";
import {getPaylinePositions} from "./mapWinToCanvas.ts";
import type {SpinResponse} from "../Types/types.ts";

interface UseCanvasDrawingProps {
    canvasWidth: number;
    canvasHeight: number;
    loadedSymbolImages: Record<string, HTMLImageElement>;
    spinTrigger: boolean;
    reels: string[][];
    spinResponse:SpinResponse | undefined;
}

export function useNewDrawCanvas({
                                     canvasWidth,
                                     canvasHeight,
                                     loadedSymbolImages,
                                     spinTrigger,
                                     reels,
                                     spinResponse
                                 }: UseCanvasDrawingProps) {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const pulseFrameRef = useRef<number>(0);
    const symbolWidth = canvasWidth / reelsCount;
    const symbolHeight = canvasHeight / symbolsPerReel;
    function normalizeReels(backendReels: string[][]): string[][] {
        // backend: rows (length 4) × cols (length 5)
        const rows = backendReels.length;
        const cols = backendReels[0]?.length ?? 0;

        // flip it: [col][row]
        return Array.from({ length: cols }, (_, c) =>
            Array.from({ length: rows }, (_, r) => backendReels[r][c])
        );
    }

    const initialReelsRef = useRef<string[][]>(generateRandomReels());
    const normalized = reels.length ? normalizeReels(reels) : [];
    const isValidGrid =
        normalized.length === reelsCount &&
        normalized.every(col => col.length === symbolsPerReel);

    const activeReels = isValidGrid ? normalized : initialReelsRef.current;

    const drawGradientBackground = useCallback((ctx: CanvasRenderingContext2D) => {
        const radius = 20;
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, "#010002");
        gradient.addColorStop(0.5, "rgba(36,82,7,0.84)");
        gradient.addColorStop(1, "#010002");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvasWidth - radius, 0);
        ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius);
        ctx.lineTo(canvasWidth, canvasHeight - radius);
        ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight);
        ctx.lineTo(radius, canvasHeight);
        ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
    }, [canvasWidth, canvasHeight]);
    const goldStops = [
        "#67ff00",
        "#183802",
        "#67ff00",
        "#3f8d0b",
        "#204904"
    ];

    const drawCanvasBorder = (
        ctx: CanvasRenderingContext2D,
        glowOpacity: number = 0.8,
        showGlowHoles: boolean = false
    ) => {
        ctx.save();
        const borderThickness = 4;
        // apply breathing only while spinning or when showing win
        // const breathing = spinTrigger || spinResponse ? getBreathingScale(0.05, 1.5) : 1;
        //
        // ctx.translate(canvasWidth / 2, 700 / 2);  // center on slot area
        // ctx.scale(breathing, breathing);
        // ctx.translate(-canvasWidth / 2, -700 / 2);
        //
        // const borderThickness = 4;
        const cornerRadius = 10;
        const holeRadius = 15;
        ctx.lineWidth = borderThickness;

        // --- Stroke style depending on spinTrigger ---
        if (spinTrigger) {
            ctx.lineJoin = "round";
            ctx.shadowColor = `rgba(0, 198, 255, ${glowOpacity})`;
            ctx.shadowBlur = 6;

            // Moving shimmer effect
            const shimmerSpeed = 0.5;
            const offsetY = canvasHeight - ((Date.now() * shimmerSpeed) % canvasHeight);
            const gradient = ctx.createLinearGradient(0, offsetY + 150, 0, offsetY);
            goldStops.forEach((color, i) => {
                gradient.addColorStop(i / (goldStops.length - 1), color);
            });
            ctx.strokeStyle = gradient;
        } else {
            ctx.strokeStyle = "#2c6505";
            ctx.shadowBlur = 0;
        }

        const inset = borderThickness / 2;
        const slotAreaBottom = 700;

        // --- Border Path ---
        ctx.beginPath();
        ctx.moveTo(inset + cornerRadius, inset);
        ctx.lineTo(canvasWidth - inset - cornerRadius, inset);
        ctx.quadraticCurveTo(canvasWidth - inset, inset, canvasWidth - inset, inset + cornerRadius);
        ctx.lineTo(canvasWidth - inset, slotAreaBottom - cornerRadius);
        ctx.quadraticCurveTo(canvasWidth - inset, slotAreaBottom, canvasWidth - inset - cornerRadius, slotAreaBottom);
        ctx.lineTo(inset + cornerRadius, slotAreaBottom);
        ctx.quadraticCurveTo(inset, slotAreaBottom, inset, slotAreaBottom - cornerRadius);
        ctx.lineTo(inset, inset + cornerRadius);
        ctx.quadraticCurveTo(inset, inset, inset + cornerRadius, inset);
        ctx.stroke();

        // --- Punch Holes ---
        const holePositions: [number, number][] = [
            [canvasWidth / 2, inset],                     // top
            [canvasWidth / 2, slotAreaBottom],            // bottom
            [inset, slotAreaBottom / 2],                  // left
            [canvasWidth - inset, slotAreaBottom / 2]     // right
        ];

        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        holePositions.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // --- Optional Glow Around Holes ---
        if (showGlowHoles && spinTrigger) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.shadowColor = `rgba(210,141,13,0.8)`;
            ctx.shadowBlur = 35;
            ctx.fillStyle = `#d28d0d`;
            holePositions.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }

        ctx.restore();
    };

    // const drawCanvasBorder = useCallback((ctx: CanvasRenderingContext2D) => {
    //     ctx.save();
    //     const borderThickness = 4;
    //     const cornerRadius = 10;
    //     ctx.lineWidth = borderThickness;
    //
    //     if (spinTrigger) {
    //         ctx.strokeStyle = "#67ff00";
    //         ctx.shadowColor = "rgba(0,198,255,0.8)";
    //         ctx.shadowBlur = 10;
    //     } else {
    //         ctx.strokeStyle = "#2c6505";
    //         ctx.shadowBlur = 0;
    //     }
    //
    //     const inset = borderThickness / 2;
    //     ctx.beginPath();
    //     ctx.moveTo(inset + cornerRadius, inset);
    //     ctx.lineTo(canvasWidth - inset - cornerRadius, inset);
    //     ctx.quadraticCurveTo(canvasWidth - inset, inset, canvasWidth - inset, inset + cornerRadius);
    //     ctx.lineTo(canvasWidth - inset, canvasHeight - cornerRadius);
    //     ctx.quadraticCurveTo(canvasWidth - inset, canvasHeight, canvasWidth - inset - cornerRadius, canvasHeight);
    //     ctx.lineTo(inset + cornerRadius, canvasHeight);
    //     ctx.quadraticCurveTo(inset, canvasHeight, inset, canvasHeight - cornerRadius);
    //     ctx.lineTo(inset, inset + cornerRadius);
    //     ctx.quadraticCurveTo(inset, inset, inset + cornerRadius, inset);
    //     ctx.stroke();
    //     ctx.restore();
    // }, [canvasWidth, canvasHeight, spinTrigger]);

    const drawColumnSeparators = useCallback((ctx: CanvasRenderingContext2D, glow = false) => {
        ctx.save();
        ctx.lineWidth = 1;
        const symbolW = canvasWidth / reelsCount;

        if (spinTrigger && glow) {
            ctx.strokeStyle = "#67ff00";
            ctx.shadowColor = "#67ff00";
            ctx.shadowBlur = 10;
        } else {
            ctx.strokeStyle = "rgb(50,121,2)";
            ctx.shadowBlur = 0;
        }

        for (let i = 1; i < reelsCount; i++) {
            const x = i * symbolW;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
        ctx.restore();
    }, [canvasWidth, canvasHeight, spinTrigger]);


    const drawSymbol = useCallback((
        symbol: string,
        x: number,
        y: number,
        scale = 1,
        highlight: boolean = false,
    ) => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        const img = loadedSymbolImages[symbol];
        if (!img) return;

        // const symbolW = (symbolWidth * 0.9) * scale;
        // const symbolH = (symbolHeight * 0.9) * scale;
        // const breathingScale = highlight ? getBreathingScale(0.12, 2.0) : 1;
        const breathingScale = 1; // keep symbol size fixed

        const symbolW = (symbolWidth * 0.9) * scale * breathingScale;
        const symbolH = (symbolHeight * 0.9) * scale * breathingScale;

        const drawX = x - symbolW / 2;
        const drawY = y - symbolH / 2;

        ctx.drawImage(img, drawX, drawY, symbolW, symbolH);

        // 🎯 If symbol is in a winning line → draw border glow
        if (highlight) {
            const HighScores = ["Lion", "Tigre"];
            const MediumScores = ["Leopard", "Elephant"];
            const LowScores = ["Hippo", "Rhino"];

            let strokeColor = "#ffcc00";  // default gold
            let shadowColor = "#ffcc00";
            let shadowBlur = 30;

            if (HighScores.includes(symbol)) {
                strokeColor = "#00FFFF";   // neon blue
                shadowColor = "#00FFFF";
                shadowBlur = 25 + 15 * Math.abs(Math.sin(pulseFrameRef.current * 0.15));
            } else if (MediumScores.includes(symbol)) {
                strokeColor = "#bf00ff";   // neon purple
                shadowColor = "#bf00ff";
                shadowBlur = 25 + 15 * Math.abs(Math.sin(pulseFrameRef.current * 0.15));
            } else if (LowScores.includes(symbol)) {
                strokeColor = "#00bbff";   // neon cyan
                shadowColor = "#00bbff";
                shadowBlur = 25 + 15 * Math.abs(Math.sin(pulseFrameRef.current * 0.15));
            }

            ctx.save();

            // 🎯 breathing transform applied only to the highlight box
            const breathing = getBreathingScale(0.1, 2.0); // intensity & speed
            ctx.translate(drawX + symbolW / 2, drawY + symbolH / 2); // move to symbol center
            ctx.scale(breathing, breathing);
            ctx.translate(-(drawX + symbolW / 2), -(drawY + symbolH / 2)); // back

            ctx.lineWidth = 4;
            ctx.strokeStyle = strokeColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.strokeRect(drawX, drawY, symbolW, symbolH);

            ctx.restore();
        }

    }, [loadedSymbolImages, symbolWidth, symbolHeight]);

    // --------------------------------------------------------------------------
    // Draw final reels + highlights
    const drawFinalResult = useCallback(
        (reelSymbols: string[][]) => {
            const ctx = ctxRef.current;
            if (!ctx) return;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            if(!spinResponse) return;
            const winningLineIds = spinResponse.winningPaylines.wins.flatMap(win => win.lines);
            pulseFrameRef.current += 0.05; // smaller = slower breathing

            drawGradientBackground(ctx);

            // draw all symbols
            for (let c = 0; c < reelsCount; c++) {
                for (let r = 0; r < symbolsPerReel; r++) {
                    const x = c * symbolWidth + symbolWidth / 2;
                    const y = r * symbolHeight + symbolHeight / 2;

                    // ✅ Check if this (col,row) belongs to a winning payline
                    const isWinning = winningLineIds.some(lineId =>
                        getPaylinePositions(lineId).some(([col, row]) => col === c && row === r)
                    );
                    drawSymbol(reelSymbols[c][r], x, y, 1, isWinning);

                }
            }

            // 🎯 draw only winning paylines
            if(!spinResponse) return;

            winningLineIds.forEach((lineId, i) => {
                const positions = getPaylinePositions(lineId);
                const color = lineColors[i % lineColors.length] ?? "#ff0";
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();

                positions.forEach(([col, row], idx) => {
                    const x = col * symbolWidth + symbolWidth / 2;
                    const y = row * symbolHeight + symbolHeight / 2;
                    if (idx === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });

                ctx.stroke();
                ctx.restore();
            });

            drawColumnSeparators(ctx);
            drawCanvasBorder(ctx);
        },
        [canvasWidth, canvasHeight, drawGradientBackground, spinResponse, drawColumnSeparators, drawCanvasBorder, symbolWidth, symbolHeight, drawSymbol]
    );

    function getBreathingScale(intensity = 0.1, speed = 0.05) {
        return 1 + intensity * Math.sin(pulseFrameRef.current * speed);
    }


    const spinReels = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        let frame = 0;
        const SPIN_DURATION = 60;
        const reelStopFrames = Array.from({length: reelsCount}, (_, i) => SPIN_DURATION + i * 25);
        const currentOffsets = Array(reelsCount).fill(0);
        pulseFrameRef.current += 0.05; // smaller = slower breathing

        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawGradientBackground(ctx);

            for (let c = 0; c < reelsCount; c++) {
                const isSpinning = frame < reelStopFrames[c];
                if (isSpinning) {
                    currentOffsets[c] += 24;
                    if (currentOffsets[c] >= symbolHeight) currentOffsets[c] = 0;

                    // draw placeholder symbols while spinning
                    for (let r = -1; r < symbolsPerReel + 1; r++) {
                        const x = c * symbolWidth + symbolWidth / 2;
                        const y = ((r * symbolHeight + currentOffsets[c]) % canvasHeight) + symbolHeight / 2;
                        const symbols = Object.keys(loadedSymbolImages);
                        const randomSym = symbols[Math.floor(Math.random() * symbols.length)];
                        drawSymbol(randomSym, x, y, 1);
                    }
                } else {
                    // stopped: draw server reel symbols
                    for (let r = 0; r < symbolsPerReel; r++) {
                        const x = c * symbolWidth + symbolWidth / 2;
                        const y = r * symbolHeight + symbolHeight / 2;
                        // drawSymbol(reels[c][r], x, y, 1);
                        drawSymbol(activeReels[c][r], x, y, 1); // ✅ use activeReels, not reels

                    }
                }
            }

            drawColumnSeparators(ctx, true);
            drawCanvasBorder(ctx);


            const allStopped = reelStopFrames.every(stop => frame >= stop);
            if (!allStopped) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                const animateWinning = () => {
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                    drawFinalResult(activeReels);
                    pulseFrameRef.current += 0.05;
                    animationFrameRef.current = requestAnimationFrame(animateWinning);
                };
                animateWinning();
            }

        };

        animate();
    }, [canvasWidth, canvasHeight, drawGradientBackground, drawColumnSeparators, drawCanvasBorder, symbolHeight, symbolWidth, loadedSymbolImages, drawSymbol, activeReels, drawFinalResult]);

    const drawGrid = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawGradientBackground(ctx);

        // if we already have server reels, show them
        // if (reels.length) {
        //     for (let c = 0; c < reelsCount; c++) {
        //         for (let r = 0; r < symbolsPerReel; r++) {
        //             const x = c * symbolWidth + symbolWidth / 2;
        //             const y = r * symbolHeight + symbolHeight / 2;
        //             drawSymbol(activeReels[c][r], x, y, 1);
        //         }
        //     }
        //
        // }
        for (let c = 0; c < reelsCount; c++) {
            for (let r = 0; r < symbolsPerReel; r++) {
                const x = c * symbolWidth + symbolWidth / 2;
                const y = r * symbolHeight + symbolHeight / 2;
                const symbol = activeReels[c][r];
                drawSymbol(symbol, x, y, 1);
            }
        }


        drawColumnSeparators(ctx);
        drawCanvasBorder(ctx);
    }, [canvasWidth, canvasHeight, drawGradientBackground, drawColumnSeparators, drawCanvasBorder, symbolWidth, symbolHeight, drawSymbol, activeReels]);

    return {
        ctxRef,
        animationFrameRef,
        drawGrid,
        spinReels,
    };
}
