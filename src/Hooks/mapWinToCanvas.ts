import type { SymbolName} from "../Types/types";
import {paylines} from "./paylines.ts";
// A resolved winning line with actual grid positions
export interface PaylineResult {
    symbol: SymbolName;
    payout: number;
    linesHit: number;
    lineIds: number[]; // which payline indices hit
    positions: [number, number][]; // (col, row) coordinates for drawing
}


export function getPaylinePositions(lineId: number): [number, number][] {
    const line = paylines[lineId - 1];
    if (!line) return []; // <--- prevent undefined.map
    return line.map((row, col) => [col, row] as [number, number]);
}

export function mapServerWinsToResults(
    wins: { symbol: SymbolName; linesHit: number; payout: number; lines?: number[] }[]
): PaylineResult[] {
    return wins.flatMap(win =>
        (win.lines ?? []).flatMap(lineId => {
            const payline = paylines[lineId - 1];
            if (!payline) return []; // skip invalid lineIds
            const positions: [number, number][] = payline.map((rowIndex, colIndex) => [colIndex, rowIndex]);
            return {
                symbol: win.symbol,
                payout: win.payout,
                linesHit: win.linesHit,
                lineIds: win.lines ?? [],
                positions
            };
        })
    );
}

