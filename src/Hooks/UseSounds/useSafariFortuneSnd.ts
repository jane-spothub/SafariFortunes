import {useCallback, useEffect, useMemo} from "react";
import RollSndSrc from "./SafariSlotSonds/rollin-snd.mp3";
import NiceOneSndSrc from "./SafariSlotSonds/nice-one-snd.mp3";
import AwinSndSrc from "./SafariSlotSonds/a-win-is-a-win.mp3";
import ThatsMassiveSndSrc from "./SafariSlotSonds/a-win-is-a-win.mp3";
import DiceBackgroundSound from "./SafariSlotSonds/backgroun-snd.mp3";

export const useSafariFortuneSnd = (isMuted: boolean, loop: boolean) => {
    const DiceAudioInstances = useMemo(() => {
        return {
            RollSnd: new Audio(RollSndSrc),
            NiceOneSnd: new Audio(NiceOneSndSrc),
            AwinSnd: new Audio(AwinSndSrc),
            ThatsMassiveSnd: new Audio(ThatsMassiveSndSrc),
        };
    }, []);

    const diceBackgroundSound = useMemo(() => {
        const bgSound = new Audio(DiceBackgroundSound);
        bgSound.loop = loop;
        // bgSound.volume = 0.2;
        return bgSound;
    }, [loop]);

    useEffect(() => {
        if (!isMuted) {
            diceBackgroundSound.play().catch((err) => {
                if (err.name === 'NotAllowedError') {
                    console.warn('User interaction required for audio playback.');
                } else {
                    // console.error('Audio playback error:', err);
                }
            });
        }

        return () => {
            diceBackgroundSound.pause();
            diceBackgroundSound.currentTime = 0;
        };
    }, [diceBackgroundSound, isMuted]);

    const playSafariLoop = useCallback(() => {
        if (isMuted) return;

        const shuffleSound = DiceAudioInstances.RollSnd;
        shuffleSound.currentTime = 0;
        // shuffleSound.volume= 10;
        shuffleSound.play();

        const interval = setInterval(() => {
            shuffleSound.currentTime = 0;
            shuffleSound.volume = 0.8;
            shuffleSound.play();
        }, shuffleSound.duration * 1000);

        setTimeout(() => {
            clearInterval(interval);
            shuffleSound.pause();
            shuffleSound.currentTime = 0;
        }, 2500);
    }, [DiceAudioInstances.RollSnd, isMuted]);

    const playSafariSnd = useCallback(
        (soundKey: keyof typeof DiceAudioInstances) => {
            if (isMuted) return;

            const sound = DiceAudioInstances[soundKey];
            if (!sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
            sound.play().catch((err) => {
                if (err.name === 'NotAllowedError') {
                    // console.warn('User interaction required for audio playback.');
                } else {
                    // console.error('Audio playback error:', err);
                }
            });
        },
        [DiceAudioInstances, isMuted]
    );
    return {playSafariSnd,playSafariLoop};
};