import './App.css'
import {MainSlots} from "./Components/MainSlots.tsx";
import {useEffect, useState} from "react";
import SafariLoaderImg from "./assets/img/new/safari-fortunes-loader.png";
import gtLogo from "./assets/img/new/greatech_logo.png";
function App() {
    const [safariFortunesProgress, setSafariFortunesProgress] = useState<number>(0);
    const [safariFortunesLoading, setSafariFortunesLoading] = useState<boolean>(true);

    useEffect(() => {
        const minesImageModules = import.meta.glob('./assets/img/*.png', {eager: true, import: 'default'});
        const safariFortunesAssets = Object.values(minesImageModules) as string[];
        let loadedAssets = 0;

        const loadSafariFortunesAssets = (src: string) => {
            return new Promise<void>((resolve) => {
                const safariFortunesImage = new Image();
                safariFortunesImage.src = src;
                safariFortunesImage.onload = () => {
                    loadedAssets++;
                    setSafariFortunesProgress(Math.floor((loadedAssets / safariFortunesAssets.length) * 100));
                    resolve();
                };
            })
        };

        Promise.all(safariFortunesAssets.map(loadSafariFortunesAssets)).then(() => {
            setTimeout(() => {
                setSafariFortunesLoading(false);
            }, 2000);
        });
    }, []);

    return (
        <>
            {safariFortunesLoading ? (
                <div className="loading-screen">
                    <img src={SafariLoaderImg} alt="safari-poster" className="safari-poster"/>
                    <div className="loading-container">
                        <img src={gtLogo} alt="Logo" className="gt-logo"/>
                        <div className="progress-bar">
                            <div className="progress-content" style={{width: `${safariFortunesProgress}%`}}></div>
                        </div>
                        <p>Loading... {Math.round(safariFortunesProgress)}</p>
                    </div>
                </div>
            ) : (
                <div>
                    <MainSlots/>

                </div>
            )}
        </>
    )
}

export default App
