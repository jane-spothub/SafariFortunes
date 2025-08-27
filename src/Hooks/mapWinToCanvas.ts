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
    // lineId is 1-based (Line 1 = top row), so adjust:
    const line = paylines[lineId - 1];
    return line.map((row, col) => [col, row] as [number, number]);
}

export function mapServerWinsToResults(
    wins: {
        symbol: SymbolName;
        linesHit: number;
        payout: number;
        lines: number[];
    }[]
): PaylineResult[] {
    return wins.flatMap(win =>
        win.lines.map(lineId => {
            const payline = paylines[lineId - 1]; // backend lines are 1-based
            const positions: [number, number][] = payline.map(
                (rowIndex, colIndex) => [colIndex, rowIndex]
            );

            return {
                symbol: win.symbol,
                payout: win.payout,
                linesHit: win.linesHit,
                lineIds: win.lines,
                positions
            };
        })
    );
}
