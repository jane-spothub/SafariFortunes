import type {Dispatch, FC, SetStateAction} from "react";
import CloseHelp from "../assets/img/new/cancel.png";

interface howToProps {
    OnSetHelp: Dispatch<SetStateAction<boolean>>;

}

export const HowToPlay: FC<howToProps> = ({OnSetHelp}) => {
    return (
        <div className="how-to-play-overlay">

            <div className="how-to-play-container">
                <img
                    src={CloseHelp} className=""
                    onClick={() => OnSetHelp(false)} alt="help-btn"/>

                <h1 className="title">🎰 How to Play Safari Fortune</h1>

                <h2 className="subtitle">🎯 Objective</h2>
                <p className="objective">
                    Spin the reels, match symbols along paylines,
                    and win payouts based on your bet amount and the paytable.
                </p>
                <div className="how-to-play-main">
                    <h2 className="section-title">📝 Game Rules</h2>

                    <div className="rule-block">
                        <h3>🐾 Symbols & Paytable</h3>
                        <ul>
                            <li>Each animal symbol has its own payout value.</li>
                            <li>Higher rarity animals (🦁 Lion, 🐅 Tigre) pay more.</li>
                            <li>Medium symbols (🐆 Leopard, 🐘 Elephant) give decent rewards.</li>
                            <li>Lower symbols (🦛 Hippo, 🦏 Rhino) appear often and pay smaller amounts.</li>
                        </ul>
                    </div>

                    <div className="rule-block">
                        <h3>📏 Paylines</h3>
                        <ul>
                            <li>Win when 3+ identical symbols appear in a row on an active payline.</li>
                            <li>Winning lines glow and animate with effects.</li>
                        </ul>
                    </div>

                    <div className="rule-block">
                        <h3>💰 Betting</h3>
                        <ul>
                            <li>Select your bet amount before spinning.</li>
                            <li>Bigger bets = bigger payouts (payout × bet).</li>
                        </ul>
                    </div>

                    <div className="rule-block">
                        <h3>🎡 Spinning</h3>
                        <ul>
                            <li>Press <b>Spin</b> to start.</li>
                            <li>Reels stop one after another for suspense.</li>
                            <li>During spins, neon lights shimmer across the reels.</li>
                        </ul>
                    </div>

                    <div className="rule-block">
                        <h3>🏆 Winning</h3>
                        <ul>
                            <li>Winning symbols flash with neon glow.</li>
                            <li>A popup shows your total win.</li>
                            <li>Sound effects depend on win size:
                                <ul>
                                    <li>🎵 A Win → small win</li>
                                    <li>🎵 Nice One → medium win</li>
                                    <li>🎵 That’s Massive! → huge win 🎉</li>
                                </ul>
                            </li>
                            <li>No wins? The game continues — try again!</li>
                        </ul>
                    </div>

                    <div className="rule-block">
                        <h3>🔊 Sounds</h3>
                        <ul>
                            <li>Immersive African jungle loop while spinning.</li>
                            <li>Special win sounds make wins feel rewarding.</li>
                            <li>Mute/unmute via the ⚙️ Settings menu.</li>
                        </ul>
                    </div>

                    <div className="rule-block">
                        <h3>⚙️ Controls</h3>
                        <ul>
                            <li><b>Spin</b> → Start a spin</li>
                            <li><b>Bet +/-</b> → Adjust bet amount</li>
                            <li><b>⚙️ Settings</b> → Mute sounds & view help</li>
                            <li><b>Balance</b> → Shows your credits</li>
                        </ul>
                    </div>

                    <div className="rule-block">
                        <h3>🌟 Tips</h3>
                        <ul>
                            <li>Bigger bets = Bigger payouts 💰</li>
                            <li>Watch glowing paylines to spot wins.</li>
                            <li>Lion 🦁 & Tigre 🐅 pay the most — go wild!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
