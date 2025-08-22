// import bg from '../assets/img/new/bg2.jpg';

type Fish = {
    img: HTMLImageElement;
    x: number;
    y: number;
    scale: number;
    direction: number;
    speed: number;
    turnSpeed: number;
    wigglePhase: number;
};
type Bubble = {
    x: number;
    y: number;
    radius: number;
    speed: number;
    wigglePhase: number;
};


const waterOverlayURL = 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png';

const imageSources = {
    // background: bg,
    // background: 'https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg',
    fish1: 'https://pixijs.com/assets/tutorials/fish-pond/fish1.png',
    fish2: 'https://pixijs.com/assets/tutorials/fish-pond/fish2.png',
    fish3: 'https://pixijs.com/assets/tutorials/fish-pond/fish3.png',
    fish4: 'https://pixijs.com/assets/tutorials/fish-pond/fish4.png',
    fish5: 'https://pixijs.com/assets/tutorials/fish-pond/fish5.png',
};

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}

// 🆙 Moved outside animate() scope
let overlayImage: HTMLImageElement;
function loadWaterOverlay(): Promise<HTMLImageElement> {
    return loadImage(waterOverlayURL);
}

export const initFishScene = async (canvas: HTMLCanvasElement): Promise<void> => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images = await Promise.all(Object.values(imageSources).map(loadImage));
    // const [background] = images;
    const [ ...fishes] = images;
    const fishList: Fish[] = [];

    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    const canvasWidth = 1000;
    const canvasHeight = 900;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    overlayImage = await loadWaterOverlay();
    let overlayOffsetX = 0;
    let overlayOffsetY = 0;
    const bubbleList: Bubble[] = [];

    for (let i = 0; i < 50; i++) {
        bubbleList.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 5 + Math.random() * 10,
            speed: 0.5 + Math.random() * 1,
            wigglePhase: Math.random() * Math.PI * 2,
        });
    }

    for (let i = 0; i < 20; i++) {
        const img = fishes[i % fishes.length];
        fishList.push({
            img,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            scale: 0.2 + Math.random() * 0.1,
            direction: Math.random() * Math.PI * 2,
            speed: 2 + Math.random() * 2,
            turnSpeed: Math.random() - 0.8,
            wigglePhase: Math.random() * Math.PI * 2,
        });


    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ⬅️ This clips the entire canvas into a rounded rectangle
        ctx.save();
        ctx.beginPath();
        const borderRadius = 15;
        ctx.moveTo(borderRadius, 0);
        ctx.lineTo(canvas.width - borderRadius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, borderRadius);
        ctx.lineTo(canvas.width, canvas.height - borderRadius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - borderRadius, canvas.height);
        ctx.lineTo(borderRadius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - borderRadius);
        ctx.lineTo(0, borderRadius);
        ctx.quadraticCurveTo(0, 0, borderRadius, 0);
        ctx.closePath();
        ctx.clip();  // ⬅️ Important: limits drawing to this path

        // ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        for (const fish of fishList) {
            fish.direction += fish.turnSpeed * 0.01;
            fish.x += Math.sin(fish.direction) * fish.speed;
            fish.y += Math.cos(fish.direction) * fish.speed;

            if (fish.x < -100) fish.x += canvas.width + 200;
            if (fish.x > canvas.width + 100) fish.x -= canvas.width + 200;
            if (fish.y < -100) fish.y += canvas.height + 200;
            if (fish.y > canvas.height + 100) fish.y -= canvas.height + 200;

            ctx.save();
            ctx.translate(fish.x, fish.y);
            fish.wigglePhase += 0.3;
            const wiggleAngle = Math.sin(fish.wigglePhase) * 0.2;
            ctx.rotate(-fish.direction - Math.PI / 2 + wiggleAngle);
            ctx.scale(fish.scale, fish.scale);
            ctx.drawImage(fish.img, -fish.img.width / 2, -fish.img.height / 2);
            ctx.restore();
        }

        for (const bubble of bubbleList) {
            bubble.y -= bubble.speed;
            bubble.wigglePhase += 0.1;
            bubble.x += Math.sin(bubble.wigglePhase) * 0.3;

            // Reset bubble to bottom when it floats up
            if (bubble.y + bubble.radius < 0) {
                bubble.y = canvas.height + bubble.radius;
                bubble.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.stroke();
        }

        // ✅ Animate and draw water overlay
        overlayOffsetX -= 0.3;
        overlayOffsetY -= 0.2;

        ctx.save();
        ctx.globalAlpha = 0.3;
        const pattern = ctx.createPattern(overlayImage, "repeat");
        if (pattern) {
            ctx.fillStyle = pattern;
            ctx.translate(overlayOffsetX, overlayOffsetY);
            ctx.fillRect(-overlayOffsetX, -overlayOffsetY, canvas.width, canvas.height);
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        requestAnimationFrame(animate);
    };

    animate();
};
