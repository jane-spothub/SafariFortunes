export type sendData={
    msisdn:string,
    amount:string,
    action:string
}

// one symbol cell on the grid
export type SymbolName = "Leopard" | "Tigre" | "Hippo" | "Lion" | "Rhino" | "Elephant";
// Types/types.ts

// One row = exactly 5 symbols
export type Row = [SymbolName, SymbolName, SymbolName, SymbolName, SymbolName];

// ReelMatrix = exactly 4 rows (4 x 5)
export type ReelMatrix = [Row, Row, Row, Row];

// insufficient bal
export interface ServerResponse {
    message: string;         // e.g., "Insufficient Account Balance"
    msisdn: string;          // user id
    Balance: number;         // numeric balance
}


// backend spin result
export interface SpinResponse {
    message: string;
    Balance: string;
    winnings: string;
    msisdn: string;
    winningPaylines: {
        totalPayout: number;
        reels: ReelMatrix; // the final 4x5 grid from backend
        wins: {
            symbol: SymbolName;
            payout: number;
            line: number;           // payline index (e.g. 20)
            matchCount: number;     // how many consecutive symbols matched
            pattern: SymbolName[];  // full line pattern returned by backend
            linesHit: number;

        }[];
    };
}
// Each payline has exactly 5 positions (one per reel column)
export type Payline = [RowIndex, RowIndex, RowIndex, RowIndex, RowIndex];

// RowIndex must be one of the 4 possible rows
export type RowIndex = 0 | 1 | 2 | 3;

// The full collection of paylines
export type Paylines = Payline[];
