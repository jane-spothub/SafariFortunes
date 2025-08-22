export type PaylineResult = {
    lineIndex: number;
    symbol: string;
    payout: number;
    count: number;
    positions: [number, number][]; // Coordinates [col, row] of matched symbols
};
