import Leopard from "../assets/img/SlotItems/slot-new-leopard.png";
import Tigre from "../assets/img/SlotItems/slot-tigre.png";
import Elephant from "../assets/img/SlotItems/slot-new-elephant.png";
import Hippo from "../assets/img/SlotItems/slot-new-hippo.png";
import Lion from "../assets/img/SlotItems/slot-new-lion2.png";
import Rhino from "../assets/img/SlotItems/slot-new-rhino.png";

export const symbolAssets: Record<string, string> = {
    Leopard,
    Tigre,
    Hippo,
    Lion,
    Rhino,
    Elephant,
};

// ✅ Fix: convert object keys into an array first
// const allSymbols = Object.keys(symbolAssets);

export function generateRandomReels(): string[][] {
    const symbols = Object.keys(symbolAssets); // <- get keys as array
    return Array.from({ length: reelsCount }, () =>
        Array.from({ length: symbolsPerReel }, () =>
            symbols[Math.floor(Math.random() * symbols.length)]
        )
    );
}

export const reelsCount = 5;     // columns
export const symbolsPerReel = 4; // rows

export const lineColors = ["#00FFFF", "#bf00ff"];

// Index 0 → for 8–9 matches
// Index 1 → for 10–11 matches
// Index 2 → for 12 or more matches
// export const symbols: Record<string, [number,number,number]> = {
//     "Leopard": [0.25, 0.75, 2],
//     "Tigre": [0.4, 0.9, 4],
//     "Hippo": [0.5, 1, 5],
//     "Lion": [10, 25, 50],
//     "Rhino": [0.8, 1.2, 8],
//     "Elephant":[2, 5, 15]
// };
