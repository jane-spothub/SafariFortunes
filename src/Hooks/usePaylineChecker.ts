import type {PaylineResult} from "../../../InfinitySlots/src/Utils/types.ts";
import {paylines} from "./paylines.ts";

export const checkPaylines = (
    reels: string[][],
    paytable: Record<string,[number,number,number]>
): PaylineResult[] => {
    const results: PaylineResult[] = [];

    paylines.forEach((line, lineIndex) => {
        const lineSymbols = line.map((row, col) => {
            const r = row;
            const c = col;
            // protect against out-of-bounds (e.g., -1 row)
            return reels[c] && reels[c][r >= 0 ? r : reels[c].length + r];
        });

        for (let start = 0; start <= lineSymbols.length - 3; start++) {
            const baseSymbol = lineSymbols[start];
            if (!baseSymbol || !paytable[baseSymbol]) continue;

            let count = 1;
            for (let i = start + 1; i < lineSymbols.length; i++) {
                if (lineSymbols[i] === baseSymbol) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >=3) {
                const positions: [number, number][] = [];
                for (let i = 0; i < count; i++) {
                    const col = start + i;
                    const row = line[col];
                    const rowSafe = row >= 0 ? row : reels[col].length + row;
                    positions.push([col, rowSafe]);
                }

                const payout =
                    count >= 12
                        ? paytable[baseSymbol][2]
                        : count >= 10
                            ? paytable[baseSymbol][1]
                            : paytable[baseSymbol][0];

                results.push({
                    lineIndex,
                    symbol: baseSymbol,
                    count,
                    payout,
                    positions
                });

                start += count - 1;
            }

        }
    });

    return results;
};

// ✅ Add here, just below checkPaylines
export interface SpinResult {
    paylines: PaylineResult[];
    totalPayout: number;
}

export const evaluateSpin = (
    reels: string[][],
    paytable: Record<string, [number, number, number]>,
    betAmount: number
): SpinResult => {
    const paylinesWon = checkPaylines(reels, paytable);

    // Multiply each payout from paytable by bet amount
    const totalPayout = paylinesWon.reduce(
        (sum, p) => sum + (p.payout * betAmount),
        0
    );

    return { paylines: paylinesWon, totalPayout };
};

