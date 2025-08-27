import {useCallback, useEffect, useMemo} from "react";
import RollSndSrc from "./SafariSlotSonds/rollin-snd.mp3";
import NiceOneSndSrc from "./SafariSlotSonds/nice-one-snd.mp3";
import AwinSndSrc from "./SafariSlotSonds/a-win-is-a-win.mp3";
import ReelStopSndSrc from "./SafariSlotSonds/reel_stop.mp3";
import ThatsMassiveSndSrc from "./SafariSlotSonds/a-win-is-a-win.mp3";
import SafariBackgroundSound from "./SafariSlotSonds/background-music.mp3";

export const useSafariFortuneSnd = (isMuted: boolean, loop: boolean) => {
    const SafariAudioInstances = useMemo(() => {
        return {
            RollSnd: new Audio(RollSndSrc),
            NiceOneSnd: new Audio(NiceOneSndSrc),
            AwinSnd: new Audio(AwinSndSrc),
            ReelStop: new Audio(ReelStopSndSrc),
            ThatsMassiveSnd: new Audio(ThatsMassiveSndSrc),
        };
    }, []);

    const safariBackgroundSound = useMemo(() => {
        const bgSound = new Audio(SafariBackgroundSound);
        bgSound.loop = loop;
        return bgSound;
    }, [loop]);

    useEffect(() => {
        safariBackgroundSound.volume = isMuted ? 0 : 1;
        safariBackgroundSound.play().catch((err) => {
            if (err.name === "NotAllowedError") {
                console.warn("Waiting for user interaction to start background music.");
                const resume = () => {
                    safariBackgroundSound.play().then(() => {
                        safariBackgroundSound.volume = isMuted ? 0 : 0.5;
                    });
                    document.removeEventListener("click", resume);
                    document.removeEventListener("keydown", resume);
                };
                document.addEventListener("click", resume);
                document.addEventListener("keydown", resume);
            }
        });

        return () => {
            safariBackgroundSound.pause();
            safariBackgroundSound.currentTime = 0;
        };
    }, [safariBackgroundSound, isMuted]);

    const playSafariLoop = useCallback(() => {
        if (isMuted) return;

        const shuffleSound = SafariAudioInstances.RollSnd;
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
    }, [SafariAudioInstances.RollSnd, isMuted]);

    const playSafariSnd = useCallback(
        (soundKey: keyof typeof SafariAudioInstances) => {
            if (isMuted) return;

            const sound = SafariAudioInstances[soundKey];
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
        [SafariAudioInstances, isMuted]
    );
    return {playSafariSnd,playSafariLoop};
};