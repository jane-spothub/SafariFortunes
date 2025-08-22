import {SlotsCanvas} from "./SlotsCanvas.tsx";
import "../assets/mainslot.css";
import {useEffect, useState} from "react";
import settings from "../assets/img/new/settings.png";
import CloseBtn from "../assets/img/new/close-btn.png";
import slotLogo from "../assets/img/new/safari-logo.png";
import {MainControls} from "./Main-Controls.tsx";
import {useSafariFortuneSnd} from "../Hooks/UseSounds/useSafariFortuneSnd.ts";
import {SafariFortuneDialog} from "./SafariFortuneDialog.tsx";

export const MainSlots = () => {
    const [betAmount, setBetAmount] = useState<number>(100);
    const [balance, setBalance] = useState<number>(50000);
    const [spinTrigger, setSpinTrigger] = useState<boolean>(false);
    const [amountWon, setAmountWon] = useState<number>(0)
    const [resultPopUp, setResultPopUp] = useState<boolean>(false)
    const [isFading, setIsFading] = useState(false);
    const {playSafariSnd, playSafariLoop} = useSafariFortuneSnd(false, true)
    const [noWinning, setNoWinning] = useState<boolean>(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

    const handleSpin = () => {
        if (spinTrigger) return;
        if (balance <= 0) return;
        if (resultPopUp) return;
        setSpinTrigger(true);
        playSafariLoop();
        // if(resultPopUp){
        //     setResultPopUp(false);
        //     setTimeout(()=>{
        //             setAmountWon(0);
        //         },1000)}
        setTimeout(() => {
            setSpinTrigger(false);
        }, 2500);
        setBalance(prev => prev - betAmount);
    };

    useEffect(() => {
        if (amountWon > 1) {
            setResultPopUp(true);
            setNoWinning(false);

            if (amountWon >= 1000) {
                playSafariSnd("ThatsMassiveSnd");
            } else if (amountWon > 500) {
                playSafariSnd("NiceOneSnd");
            } else if (amountWon > 0) {
                playSafariSnd("AwinSnd");
            }


            const fadeTimer = setTimeout(() => {
                setIsFading(true);
            }, 6000);

            const hideTimer = setTimeout(() => {
                setResultPopUp(false);
                setIsFading(false);
                setAmountWon(0);


            }, 6400);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        } else {
            setNoWinning(true);

        }
    }, [amountWon, playSafariSnd]);


    return (
        <div className="MainSlots">
            <div className="main-slots-container background">
                <div className="top-bar">
                    <img className="logo" src={slotLogo} alt="logo"/>
                    <div className="balance">{balance}</div>

                    {!isSettingsOpen ? (
                        <img className="top-settings-icon" src={settings} alt="settings"
                             onClick={() => setIsSettingsOpen(true)}/>
                    ) : (
                        <img className="top-settings-icon" src={CloseBtn} alt="settings"
                             onClick={() => setIsSettingsOpen(false)}/>
                    )}

                    {isSettingsOpen && (
                        <SafariFortuneDialog
                            OnHelpOpen={setIsHelpOpen}
                            isMuted={isMuted}
                            onMuteToggle={setIsMuted}
                            OnSettingsOpen={setIsSettingsOpen}/>
                    )}
                </div>



                <SlotsCanvas
                    spinTrigger={spinTrigger}
                    betAmount={betAmount}
                    OnSetAmountWon={setAmountWon}
                    resultPopUp={resultPopUp}
                    noWinning={noWinning}
                />

                <MainControls spinTrigger={spinTrigger}
                              onBetAmount={setBetAmount}
                              betAmount={betAmount}
                              handleSpin={handleSpin}
                              amountWon={amountWon}
                />

                {resultPopUp && (
                    <div className={`results-overlay ${isFading ? "fade-out" : "pop-in"}`}>
                        <div className="results-container">
                            <div className="container ">
                                <h1 className="glow-name">
                                    {amountWon >= 1000
                                        ? "That’s Massive!"
                                        : amountWon > 500
                                            ? "Nice One!"
                                            : "Congratulations"}
                                </h1>
                                <h2 className="three-d-text">
                                    Ksh{amountWon}
                                </h2>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
