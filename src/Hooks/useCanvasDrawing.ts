// import {type Dispatch, type SetStateAction, useRef} from "react";
import {lineColors, reelsCount, symbols, symbolsPerReel} from "./symbolsImages.ts";
import {checkPaylines, evaluateSpin} from "./usePaylineChecker.ts";
import {type Dispatch, type SetStateAction, useRef} from "react";
import type {PaylineResult} from "../Types/types.ts";
export function useCanvasDrawing({
                                     canvasWidth,
                                     canvasHeight,
                                     loadedSymbolImages,
                                     MAX_FORWARD_SPEED,
                                     getRandomSymbol,
                                     spinTrigger,
                                     betAmount,
                                     OnSetAmountWon
                                 }: {
    canvasWidth: number;
    spinTrigger: boolean;
    canvasHeight: number;
    loadedSymbolImages: Record<string, HTMLImageElement>;
    MAX_FORWARD_SPEED: number;
    getRandomSymbol: () => string;
    betAmount: number;
    OnSetAmountWon: Dispatch<SetStateAction<number>>;
}) {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const SLOT_AREA_HEIGHT = canvasHeight
    const neonOffsetRef = useRef(0);
    const goldStops = [
        "#67ff00",
        "#183802",
        "#67ff00",
        "#3f8d0b",
        "#204904"
    ];


    const updateNeonOffset = () => {
        neonOffsetRef.current += 2;
        if (neonOffsetRef.current > 1000) neonOffsetRef.current = 0;
    };




    const drawCanvasBorder = (
        ctx: CanvasRenderingContext2D,
        glowOpacity: number = 0.8,
        showGlowHoles: boolean = false
    ) => {
        ctx.save();
        const borderThickness = 4;
        const radius = 15;
        const cornerRadius = 10;
        ctx.lineWidth = borderThickness;

        if (spinTrigger) {

            ctx.lineJoin = "round";
            ctx.shadowColor = `rgba(0, 198, 255, ${glowOpacity})`;
            ctx.shadowBlur = 5;
            const shimmerSpeed = 0.5;
            const offsetY = canvasHeight - ((Date.now() * shimmerSpeed) % canvasHeight);
            const gradient = ctx.createLinearGradient(0, offsetY + 150, 0, offsetY);

            goldStops.forEach((color, i) => {
                gradient.addColorStop(i / (goldStops.length - 1), color);
            });
            ctx.strokeStyle = gradient;

        } else {
            ctx.strokeStyle = "#2c6505";
        }


        const inset = borderThickness / 2;
        const slotAreaBottom = SLOT_AREA_HEIGHT;

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

        const holePositions: [number, number][] = [
            [canvasWidth / 2, inset],
            [canvasWidth / 2, slotAreaBottom],
            [inset, slotAreaBottom / 2],
            [canvasWidth - inset, slotAreaBottom / 2]
        ];

        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        holePositions.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        if (showGlowHoles) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.shadowColor = `rgba(210, 141, 13, 0)`;
            ctx.shadowBlur = 35;
            ctx.fillStyle = `#d28d0d)`;
            holePositions.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }
        ctx.restore();
    };

    const drawColumnSeparators = (
        ctx: CanvasRenderingContext2D,
        glow: boolean = false
    ) => {
        const symbolWidth = canvasWidth / reelsCount;
        ctx.save();
        ctx.lineWidth = 1;

        const shimmerSpeed = 0.5;
        const offsetY = canvasHeight - ((Date.now() * shimmerSpeed) % canvasHeight);
        const gradient = ctx.createLinearGradient(0, offsetY + 150, 0, offsetY);

        goldStops.forEach((color, i) => {
            gradient.addColorStop(i / (goldStops.length - 1), color);
        });
        if (spinTrigger) {
            ctx.strokeStyle = gradient;

            if (glow) {
                ctx.shadowColor = `#67ff00`;
                ctx.shadowBlur = 15;
            }
            for (let i = 1; i < reelsCount; i++) {
                const x = i * symbolWidth;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, SLOT_AREA_HEIGHT);
                ctx.stroke();
            }

        } else {
            ctx.strokeStyle = "#153103";
            for (let i = 1; i < reelsCount; i++) {
                const x = i * symbolWidth;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, SLOT_AREA_HEIGHT);
                ctx.stroke();
            }
        }
        ctx.restore();
    };
    const drawGradientBackground = (ctx: CanvasRenderingContext2D) => {
        const radius = 20;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#010002');
        gradient.addColorStop(0.5, 'rgba(36,82,7,0.84)');
        gradient.addColorStop(1, '#010002');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
    };

    const drawSymbol = (
        symbol: string,
        x: number,
        y: number,
        loadedImages: Record<string, HTMLImageElement>,
        highlight: boolean = false,
        scale: number = 1,
        flashFrame: number = 0
    ) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const image = loadedImages[symbol];
        if (!image || !image.complete || image.naturalWidth === 0) return;

        ctx.save();
        const adjustedScale = highlight
            ? scale + 0.1 * Math.sin(flashFrame * 0.2)
            : scale;
        const symbolSize = 100 * adjustedScale;

        const drawX = x - symbolSize / 2;
        const drawY = y - symbolSize / 2;

        ctx.drawImage(image, drawX, drawY, symbolSize, symbolSize);

        if (highlight) {
            const borderPadding = 3;
            const borderX = drawX - borderPadding / 2;
            const borderY = drawY - borderPadding / 2;
            const borderSize = symbolSize + borderPadding;

            ctx.save();
            const HighScores = ["Lion", "Tigre"];
            const MediumScores = ["Leopard", "Elephant"];
            const LowScores = ["Hippo", "Rhino"];

            let strokeColor = "#ffcc00";      // default: gold
            let shadowColor = "#ffcc00";
            const shadowBlur = 30;

            if (HighScores.includes(symbol)) {
                strokeColor = "#00FFFF";      // neon blue
                shadowColor = "#00FFFF";
                ctx.shadowBlur = 30 + 10 * Math.abs(Math.sin(flashFrame * 0.3));
            } else if (MediumScores.includes(symbol)) {
                strokeColor = "#bf00ff";      // neon green
                shadowColor = "#bf00ff";
                ctx.shadowBlur = 30 + 10 * Math.abs(Math.sin(flashFrame * 0.3));

            } else if (LowScores.includes(symbol)) {
                strokeColor = "#00bbff";      // neon orange
                shadowColor = "#00bbff";
                ctx.shadowBlur = 30 + 10 * Math.abs(Math.sin(flashFrame * 0.3));
            }

            ctx.lineWidth = 4;
            ctx.strokeStyle = strokeColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.strokeRect(borderX, borderY, borderSize, borderSize);

            ctx.restore();
        }
        ctx.restore();
    };

      function getBounceEffect(frame: number): { bounceOffset: number; scale: number } {
        return {
            bounceOffset: Math.sin(frame * 0.3) * 20,
            scale: 1.1 + 0.25 * Math.abs(Math.sin(frame * 0.3))
        };
    }

    function drawAnimatedPayline(ctx: CanvasRenderingContext2D, positions: [number, number][], progress: number, color: string) {
        if (positions.length < 2) return;

        const symbolHeight = SLOT_AREA_HEIGHT / symbolsPerReel;
        const symbolWidth = canvasWidth / reelsCount;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.shadowColor = color;
        ctx.shadowBlur = 0;
        ctx.beginPath();

        // Get the first point (start of line)
        const [startCol, startRow] = positions[0];
        const startX = startCol * symbolWidth + symbolWidth / 2;
        const startY = startRow * symbolHeight + symbolHeight / 2;
        ctx.moveTo(startX, startY);

        // Track how far along we are
        const totalSegments = positions.length - 1;
        const totalProgress = progress * totalSegments;
        const fullSegments = Math.floor(totalProgress);
        const segmentProgress = totalProgress - fullSegments;

        // Draw full completed segments
        for (let i = 0; i < fullSegments; i++) {
            const [col, row] = positions[i + 1];
            const x = col * symbolWidth + symbolWidth / 2;
            const y = row * symbolHeight + symbolHeight / 2;
            ctx.lineTo(x, y);
        }

        // Draw partial segment
        if (fullSegments < totalSegments) {
            const [currCol, currRow] = positions[fullSegments];
            const [nextCol, nextRow] = positions[fullSegments + 1];
            const currX = currCol * symbolWidth + symbolWidth / 2;
            const currY = currRow * symbolHeight + symbolHeight / 2;
            const nextX = nextCol * symbolWidth + symbolWidth / 2;
            const nextY = nextRow * symbolHeight + symbolHeight / 2;

            const partialX = currX + (nextX - currX) * segmentProgress;
            const partialY = currY + (nextY - currY) * segmentProgress;
            ctx.lineTo(partialX, partialY);
        }

        ctx.stroke();
        ctx.restore();
    }

    const drawFinalResult = (reels: string[][], results: PaylineResult[]) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const symbolHeight = SLOT_AREA_HEIGHT / symbolsPerReel;
        const symbolWidth = canvasWidth / reelsCount;
        let flashCount = 0;

        const flashAnimation = () => {
            flashCount++;

            ctx.clearRect(0, 0, canvasWidth, SLOT_AREA_HEIGHT);
            drawGradientBackground(ctx);

            // Draw non-winning symbols first
            for (let r = 0; r < reelsCount; r++) {
                for (let s = 0; s < symbolsPerReel; s++) {
                    const x = r * symbolWidth + symbolWidth / 2;
                    const y = s * symbolHeight + symbolHeight / 2;
                    const isWinning = results.some(res =>
                        res.positions.some(([col, row]) => col === r && row === s)
                    );
                    if (!isWinning) {
                        drawSymbol(reels[r][s], x, y, loadedSymbolImages, false, 1);

                    }
                }
            }

            // Draw animated winning symbols
            results.forEach((result, i) => {
                const lineColor = lineColors[i % lineColors.length];
                result.positions.forEach(([col, row]) => {
                    const x = col * symbolWidth + symbolWidth / 2;

                    const {bounceOffset, scale} = getBounceEffect(flashCount);
                    const y = row * symbolHeight + symbolHeight / 2 + bounceOffset;
                    drawSymbol(result.symbol, x, y, loadedSymbolImages, true, scale, flashCount);
                });
                const lineDrawSpeed = 0.05; // adjust speed
                const lineProgress = Math.min(1, flashCount * lineDrawSpeed);

                results.forEach((result, i) => {
                    const lineColor = lineColors[i % lineColors.length];
                    drawAnimatedPayline(ctx, result.positions, lineProgress, lineColor);
                });

                ctx.save();
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 0.5;
                ctx.shadowColor = lineColor;
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.restore();
            });

            if (flashCount < 20) {
                updateNeonOffset();
                animationFrameRef.current = requestAnimationFrame(flashAnimation);
            }

            drawColumnSeparators(ctx);
            drawCanvasBorder(ctx);
        };


        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        flashAnimation();

    };

    const spinReels = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let frame = 0;
        const SPIN_DURATION_BASE = 60;
        const SPIN_DELAY_BETWEEN_REELS = 25;
        const symbolHeight = SLOT_AREA_HEIGHT / symbolsPerReel;
        const symbolWidth = canvasWidth / reelsCount;
        const currentOffsets = Array(reelsCount).fill(0);
        const reelStopFrames = Array.from({length: reelsCount}, (_, i) =>
            SPIN_DURATION_BASE + i * SPIN_DELAY_BETWEEN_REELS
        );

        const reelFinalSymbols: string[][] = [];
        for (let r = 0; r < reelsCount; r++) {
            const final: string[] = [];
            for (let s = 0; s < symbolsPerReel; s++) {
                final.push(getRandomSymbol());
            }
            reelFinalSymbols.push(final);
        }

        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, canvasWidth, SLOT_AREA_HEIGHT);
            ctx.clip();

            drawGradientBackground(ctx);

            for (let r = 0; r < reelsCount; r++) {
                const isSpinning = frame < reelStopFrames[r];
                if (isSpinning) {
                    currentOffsets[r] += MAX_FORWARD_SPEED;
                    if (currentOffsets[r] >= symbolHeight) currentOffsets[r] = 0;
                } else {
                    currentOffsets[r] = 0;
                }

                for (let s = -1; s < symbolsPerReel + 1; s++) {
                    const y =
                        ((s * symbolHeight + currentOffsets[r]) % SLOT_AREA_HEIGHT) +
                        symbolHeight / 2;
                    const x = r * symbolWidth + symbolWidth / 2;

                    let symbol: string;

                    if (isSpinning) {
                        symbol = getRandomSymbol();
                        drawSymbol(symbol, x, y, loadedSymbolImages, false, 1);

                    } else {
                        const rowIndex = (s + symbolsPerReel) % symbolsPerReel;
                        symbol = reelFinalSymbols[r][rowIndex];

                        drawSymbol(symbol, x, y, loadedSymbolImages, false, 1);

                    }
                }
            }

            // const glowBreathPhase = Math.sin(frame * 0.2);
            // const glowOpacity = 0.3 + 0.3 * glowBreathPhase;
            drawColumnSeparators(ctx, true);
            drawCanvasBorder(ctx);
            const paylineResults = checkPaylines(reelFinalSymbols, symbols);

            const allStopped = reelStopFrames.every(stopFrame => frame >= stopFrame);
            if (!allStopped) {
                animationFrameRef.current = requestAnimationFrame(animate);

            } else {
                const result = evaluateSpin(reelFinalSymbols, symbols, betAmount);
                console.log("Total payout:", result.totalPayout);
                OnSetAmountWon(result.totalPayout);
                drawFinalResult(reelFinalSymbols, paylineResults);

            }

            ctx.restore();
        };


        animate();
    };

    return {
        ctxRef,
        animationFrameRef,
        drawCanvasBorder,
        drawColumnSeparators,
        drawSymbol,
        spinReels,
        drawGradientBackground,
    };
}