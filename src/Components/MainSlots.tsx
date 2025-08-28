import "../assets/mainslot.css";
import {useEffect, useState} from "react";
import settings from "../assets/img/new/settings.png";
import CloseBtn from "../assets/img/new/close-btn.png";
import slotLogo from "../assets/img/new/safari-logo.png";
import {MainControls} from "./Main-Controls.tsx";
import {useSafariFortuneSnd} from "../Hooks/UseSounds/useSafariFortuneSnd.ts";
import {SafariFortuneDialog} from "./SafariFortuneDialog.tsx";
import {HowToPlay} from "./HowToPlay.tsx";
import type {sendData, SpinResponse} from "../Types/types.ts";
import {useWs} from "../safariSockets/SafariSockets.ts";
import {SlotCanvas} from "./SlotCanvas.tsx";
import {mapServerWinsToResults, type PaylineResult} from "../Hooks/mapWinToCanvas.ts";

export const MainSlots = () => {
    const [betAmount, setBetAmount] = useState<number>(1);
    const [balance, setBalance] = useState<string>("---");
    const [spinTrigger, setSpinTrigger] = useState<boolean>(false);
    const [amountWon, setAmountWon] = useState<number>(0)
    const [resultPopUp, setResultPopUp] = useState<boolean>(false)
    const [isFading, setIsFading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
    const {playSafariSnd, playSafariLoop} = useSafariFortuneSnd(isMuted, true)
    const {connectSocket, sendData, getSocket} = useWs();
    const [spinResponse, setSpinResponse] = useState<SpinResponse | undefined>()
    const [serverReels, setServerReels] = useState<string[][]>([]);
    const [paylineResults, setPaylineResults] = useState<PaylineResult[]>([]);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000); // hide after 3s
    };

    useEffect(() => {
        connectSocket();
        const socket = getSocket();
        if (!socket) return;

        socket.onmessage = (event: MessageEvent<string>) => {
            try {
                const data: SpinResponse = JSON.parse(event.data);
                console.log("Game response:", data);
                setSpinResponse(data);
                setTimeout(()=>{
                    setBalance(data.Balance);
                    setAmountWon(parseFloat(data.winnings));
                },2500)

                // If backend says insufficient balance, show toast
                if (data.message === "Insufficient Account Balance") {
                    showToast(data.message);
                }

                if (data.winningPaylines) {
                    const serverReels = data.winningPaylines.reels;
                    setServerReels(serverReels);

                    const results = mapServerWinsToResults(
                        data.winningPaylines.wins || []
                    );
                    setPaylineResults(results);
                }
            } catch (err) {
                console.error("Error parsing server message:", err);
            }
        };
    }, [connectSocket, getSocket]);

    const handleSpin = () => {
        if (spinTrigger) return;
        // if (balance <= 0) return;
        if (resultPopUp) return;
        const numericBalance = parseFloat(balance.toString().replace(/,/g, ""));
        if (!isNaN(numericBalance) && numericBalance === 0) {
            showToast("Your balance is empty!");

        }
        setSpinTrigger(true);
        const spinRequest: sendData = {
            msisdn: "254791847766", // or dynamically from user
            action: "spin",
            amount: `${betAmount}`
        };
        sendData(spinRequest);
        playSafariLoop();
        setTimeout(() => {
            setSpinTrigger(false);
            playSafariSnd("ReelStop");
        }, 2500);
    };

    useEffect(() => {
        if (amountWon > 0) {
            setResultPopUp(true);
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
        }
    }, [amountWon, playSafariSnd]);

    return (
        <div className="MainSlots">
            <div className="main-slots-container background">
                <div className="top-bar">
                    <div className="balance">Bal:
                        <div className="balance-amount">
                            {balance}
                        </div>
                    </div>

                    <img className="logo" src={slotLogo} alt="logo"/>

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

                <SlotCanvas
                    spinTrigger={spinTrigger}
                    reels={serverReels}
                    paylines={paylineResults}
                    spinResponse={spinResponse}
                />

                <MainControls spinTrigger={spinTrigger}
                              onBetAmount={setBetAmount}
                              betAmount={betAmount}
                              handleSpin={handleSpin}
                              amountWon={amountWon}
                />

                {isHelpOpen && (
                    <HowToPlay
                        OnSetHelp={setIsHelpOpen}
                    />
                )}

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
                                    Ksh{amountWon.toFixed(2)}
                                </h2>

                            </div>
                        </div>
                    </div>
                )}

                {toastMsg && (
                    <div className="custom-toast">
                        {toastMsg}
                    </div>
                )}

            </div>
        </div>
    );
};