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
    spinResponse: SpinResponse | undefined;
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
    const initialReelsRef = useRef<string[][]>(generateRandomReels());

    // -------------------- Helpers --------------------
    function normalizeReels(backendReels: string[][]) {
        const rows = backendReels.length;
        const cols = backendReels[0]?.length ?? 0;
        return Array.from({length: cols}, (_, c) =>
            Array.from({length: rows}, (_, r) => backendReels[r][c])
        );
    }

    const normalized = reels.length ? normalizeReels(reels) : [];
    const activeReels = (normalized.length === reelsCount &&
        normalized.every(col => col.length === symbolsPerReel))
        ? normalized
        : initialReelsRef.current;

    const goldStops = ["#67ff00","#183802","#67ff00","#3f8d0b","#204904"];


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

    const drawCanvasBorder = useCallback(
        (ctx: CanvasRenderingContext2D, glowOpacity = 0.8) => {
            ctx.save();
            const borderThickness = 4;
            const cornerRadius = 10;
            ctx.lineWidth = borderThickness;

            if (spinTrigger) {
                ctx.lineJoin = "round";
                ctx.shadowColor = `rgba(0, 198, 255, ${glowOpacity})`;
                ctx.shadowBlur = 6;
                const shimmerSpeed = 0.5;
                const offsetY = canvasHeight - ((Date.now() * shimmerSpeed) % canvasHeight);
                const gradient = ctx.createLinearGradient(0, offsetY + 150, 0, offsetY);
                goldStops.forEach((color, i) => gradient.addColorStop(i / (goldStops.length - 1), color));
                ctx.strokeStyle = gradient;
            } else {
                ctx.strokeStyle = "#2c6505";
                ctx.shadowBlur = 0;
            }

            const inset = borderThickness / 2;
            ctx.beginPath();
            ctx.moveTo(inset + cornerRadius, inset);
            ctx.lineTo(canvasWidth - inset - cornerRadius, inset);
            ctx.quadraticCurveTo(canvasWidth - inset, inset, canvasWidth - inset, inset + cornerRadius);
            ctx.lineTo(canvasWidth - inset, canvasHeight - cornerRadius);
            ctx.quadraticCurveTo(canvasWidth - inset, canvasHeight, canvasWidth - inset - cornerRadius, canvasHeight);
            ctx.lineTo(inset + cornerRadius, canvasHeight);
            ctx.quadraticCurveTo(inset, canvasHeight, inset, canvasHeight - cornerRadius);
            ctx.lineTo(inset, inset + cornerRadius);
            ctx.quadraticCurveTo(inset, inset, inset + cornerRadius, inset);
            ctx.stroke();
            ctx.restore();
        },
        [spinTrigger, canvasWidth, canvasHeight, goldStops]
    );


    const drawColumnSeparators = useCallback(
        (ctx: CanvasRenderingContext2D, glow = false) => {
            ctx.save();
            ctx.lineWidth = 1;
            if (spinTrigger && glow) {
                ctx.strokeStyle = "#67ff00";
                ctx.shadowColor = "#67ff00";
                ctx.shadowBlur = 10;
            } else {
                ctx.strokeStyle = "rgb(50,121,2)";
                ctx.shadowBlur = 0;
            }
            const w = canvasWidth / reelsCount;
            for (let i = 1; i < reelsCount; i++) {
                const x = i * w;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasHeight);
                ctx.stroke();
            }
            ctx.restore();
        },
        [canvasWidth, canvasHeight, spinTrigger]
    );

    function getBreathingScale(intensity = 0.1, speed = 0.02) {
        return 1 + intensity * Math.sin(pulseFrameRef.current * speed);
    }

    // function getBounceEffect(frame: number) {
    //     return {
    //         bounceOffset: Math.sin(frame * 0.3) * 20,
    //         scale: 1.1 + 0.25 * Math.abs(Math.sin(frame * 0.3))
    //     };
    // }

    const drawSymbol = useCallback(
        (symbol: string, x: number, y: number, scale = 1, highlight = false, flashFrame = 0) => {
            const ctx = ctxRef.current;
            if (!ctx) return;
            const img = loadedSymbolImages[symbol];
            if (!img) return;

            const baseW = symbolWidth * 0.7 * scale;
            const baseH = symbolHeight * 0.7 * scale;
            const drawX = x - baseW / 2;
            const drawY = y - baseH / 2;

            if (highlight) {
                const HighScores = ["Lion", "Tigre"];
                const MediumScores = ["Leopard", "Elephant"];
                const LowScores = ["Hippo", "Rhino"];

                let strokeColor = "#ffcc00";
                let shadowColor = "#ffcc00";
                let shadowBlur = 30;

                if (HighScores.includes(symbol)) {
                    strokeColor = "#00FFFF";
                    shadowColor = "#00FFFF";
                    shadowBlur = 30 + 10 * Math.abs(Math.sin(flashFrame * 0.3));
                } else if (MediumScores.includes(symbol)) {
                    strokeColor = "#bf00ff";
                    shadowColor = "#bf00ff";
                    shadowBlur = 30 + 10 * Math.abs(Math.sin(flashFrame * 0.3));
                } else if (LowScores.includes(symbol)) {
                    strokeColor = "#00bbff";
                    shadowColor = "#00bbff";
                    shadowBlur = 30 + 10 * Math.abs(Math.sin(flashFrame * 0.3));
                }

                ctx.save();
                const breathing = getBreathingScale(0.1, 2.1);

                // apply breathing to both symbol + border
                ctx.translate(drawX + baseW / 2, drawY + baseH / 2);
                ctx.scale(breathing, breathing);
                ctx.translate(-(drawX + baseW / 2), -(drawY + baseH / 2));

                // draw symbol
                ctx.drawImage(img, drawX, drawY, baseW, baseH);

                // draw glowing border
                ctx.lineWidth = 3;
                ctx.strokeStyle = strokeColor;
                ctx.shadowColor = shadowColor;
                ctx.shadowBlur = shadowBlur;
                ctx.strokeRect(drawX, drawY, baseW, baseH);

                ctx.restore();
            } else {
                // normal (non-highlighted) symbol
                ctx.drawImage(img, drawX, drawY, baseW, baseH);
            }
        },
        [loadedSymbolImages, symbolWidth, symbolHeight]
    );


    const drawFinalResult = useCallback(
        (reels: string[][]) => {
            const ctx = ctxRef.current;
            if (!ctx || !spinResponse) return;

            const symbolHeight = canvasHeight / symbolsPerReel;
            const symbolWidth = canvasWidth / reelsCount;
            let flashCount = 0;

            const results = spinResponse.winningPaylines.wins.map((win) => {
                const linePositions = getPaylinePositions(win.line); // full [ [col,row], ... ]

                const matchedPositions: [number, number][] = [];
                linePositions.forEach(([col, row], idx) => {
                    if (win.pattern[idx] === win.symbol) {
                        matchedPositions.push([col, row]);
                    }
                });

                return {
                    symbol: win.symbol,
                    positions: matchedPositions,     // only glowing symbols
                    fullLine: linePositions,         // full payline path
                };
            });



            const flashAnimation = () => {
                flashCount++;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                drawGradientBackground(ctx);
                for (let c = 0; c < reelsCount; c++) {
                    for (let r = 0; r < symbolsPerReel; r++) {
                        const x = c * symbolWidth + symbolWidth / 2;
                        const y = r * symbolHeight + symbolHeight / 2;

                        const isWinning = results.some((res) =>
                            res.positions.some(([col, row]) => col === c && row === r)
                        );
                        if (!isWinning) {
                            drawSymbol(reels[c][r], x, y, 1);
                        }
                    }
                }

                results.forEach((result, i) => {
                    const lineColor = lineColors[i % lineColors.length];
                    result.positions.forEach(([col, row]) => {
                        const x = col * symbolWidth + symbolWidth / 2;
                        const y = row * symbolHeight + symbolHeight / 2;
                        const scale = 1.1 + 0.2 * Math.sin(flashCount * 0.3);
                        drawSymbol(result.symbol, x, y, scale, true, flashCount);
                    });

                    // find the rightmost winning symbol's column
                    const lastWinningCol = Math.max(...result.positions.map(([col]) => col));

// filter fullLine to only include positions up to that column
                    const trimmedLine = result.fullLine.filter(([col]) => col <= lastWinningCol);

                    ctx.save();
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 2;
                    // ctx.shadowColor = lineColor;
                    // ctx.shadowBlur = 0;

                    ctx.beginPath();
                    trimmedLine.forEach(([col, row], idx) => {
                        const x = col * symbolWidth + symbolWidth / 2;
                        const y = row * symbolHeight + symbolHeight / 2;

                        if (idx === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    });
                    ctx.stroke();
                    ctx.restore();

                });



                if (flashCount < 40) {
                    animationFrameRef.current = requestAnimationFrame(flashAnimation);
                }

                drawColumnSeparators(ctx);
                drawCanvasBorder(ctx);
            };

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            flashAnimation();
        },
        [
            spinResponse,
            canvasWidth,
            canvasHeight,
            drawGradientBackground,
            drawColumnSeparators,
            drawCanvasBorder,
            drawSymbol,
        ]
    );


    // -------------------- Spin Reels Animation --------------------
    const spinReels = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        let frame = 0;
        const SPIN_DURATION = 60;
        const reelStopFrames = Array.from({length: reelsCount}, (_, i) => SPIN_DURATION + i * 25);
        const currentOffsets = Array(reelsCount).fill(0);

        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawGradientBackground(ctx);

            for (let c = 0; c < reelsCount; c++) {
                const isSpinning = frame < reelStopFrames[c];
                if (isSpinning) {
                    currentOffsets[c] += 24;
                    if (currentOffsets[c] >= symbolHeight) currentOffsets[c] = 0;
                    for (let r = -1; r < symbolsPerReel + 1; r++) {
                        const x = c * symbolWidth + symbolWidth / 2;
                        const y = ((r * symbolHeight + currentOffsets[c]) % canvasHeight) + symbolHeight / 2;
                        const symbols = Object.keys(loadedSymbolImages);
                        const randomSym = symbols[Math.floor(Math.random() * symbols.length)];
                        drawSymbol(randomSym, x, y, 1);
                    }
                } else {
                    for (let r = 0; r < symbolsPerReel; r++) {
                        const x = c * symbolWidth + symbolWidth / 2;
                        const y = r * symbolHeight + symbolHeight / 2;
                        drawSymbol(activeReels[c][r], x, y, 1);
                    }
                }
            }

            drawColumnSeparators(ctx, true);
            drawCanvasBorder(ctx);

            if (reelStopFrames.every(stop => frame >= stop)) {
                // start final result flashing animation
                const flashAnimation = () => {

                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                    drawFinalResult(activeReels);
                    pulseFrameRef.current += 0.05;
                    animationFrameRef.current = requestAnimationFrame(flashAnimation);
                };
                flashAnimation();
            } else {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animate();
    }, [
        canvasWidth,
        canvasHeight,
        drawGradientBackground,
        drawColumnSeparators,
        drawCanvasBorder,
        symbolWidth,
        symbolHeight,
        loadedSymbolImages,
        drawSymbol,
        activeReels,
        drawFinalResult
    ]);

    const drawGrid = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawGradientBackground(ctx);

        for (let c = 0; c < reelsCount; c++) {
            for (let r = 0; r < symbolsPerReel; r++) {
                const x = c * symbolWidth + symbolWidth / 2;
                const y = r * symbolHeight + symbolHeight / 2;
                drawSymbol(activeReels[c][r], x, y, 1);
            }
        }

        drawColumnSeparators(ctx);
        drawCanvasBorder(ctx);
    }, [canvasWidth, canvasHeight, drawGradientBackground, drawColumnSeparators, drawCanvasBorder, symbolWidth, symbolHeight, drawSymbol, activeReels]);

    return {ctxRef, animationFrameRef, drawGrid, spinReels};
}
