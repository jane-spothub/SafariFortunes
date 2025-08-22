import type {Dispatch, FC, SetStateAction} from "react";

interface ControlProps {
    spinTrigger: boolean;
    onBetAmount: Dispatch<SetStateAction<number>>;
    betAmount: number;
    amountWon: number;
    handleSpin: () => void;
}

export const MainControls: FC<ControlProps> = ({spinTrigger, onBetAmount, betAmount,handleSpin,amountWon}) => {

    return (
        <div className="MainSlots-controls">
            <div className="bet-amount-container">
               <div className="win-amount-container">
                   <div className="top-bet-bar">Amount</div>
                   <div className={`${!amountWon ? "bet-win":""}`}>
                       {amountWon &&(
                           <div className="top-bet-win">
                               Amount Won
                               <div className ={`${!amountWon ?"display-amount":"--"}`}>
                                   {amountWon}
                               </div>

                           </div>
                       )}
                   </div>

               </div>


                <div className="bet-short-input">
                    <div className="top-controls">
                        <div className="bet-shortcuts" onClick={e => e.stopPropagation()}>
                            {[10, 20, 30, 40, 50].map(amount => (
                                <div
                                    key={amount}
                                    className="shortcut-btns"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!spinTrigger) {
                                            onBetAmount(amount);
                                        }
                                    }}
                                >
                                    {amount}
                                </div>
                            ))}
                        </div>


                        <div className="bet-input">
                            <div
                                className="plus-minus"
                                onClick={e => {
                                    e.stopPropagation();
                                    onBetAmount(prev => Math.max(prev - 10, 10));
                                }}
                            >
                                -
                            </div>
                            <input
                                className="bet-amount-input"
                                type="number"
                                value={betAmount}
                                onChange={e => {
                                    e.stopPropagation();
                                    onBetAmount(Math.min(Math.max(Number(e.target.value), 10), 100));
                                }}
                                // onChange={handleInputChange}
                            />
                            <div
                                className="plus-minus"
                                onClick={e => {
                                    e.stopPropagation();
                                    onBetAmount(prev => Math.min(prev + 10, 100));
                                }}
                            >
                                +
                            </div>
                        </div>
                    </div>

                    <div className="MainSlots-controls-content">
                        <div className="button-controls" onClick={handleSpin}>
                            {!spinTrigger ? "Spin" : "..."}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}