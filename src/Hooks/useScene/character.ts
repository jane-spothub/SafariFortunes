export function initDribbleBackground(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const backgroundImg = new Image();
    backgroundImg.src = "https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg";

    type Bubble = {
        x: number;
        y: number;
        radius: number;
        speed: number;
        wigglePhase: number;
    };

    const bubbles: Bubble[] = Array.from({ length: 50 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 2 + Math.random() * 2,
        speed: 0.5 + Math.random() * 1.8,
        wigglePhase: Math.random() * Math.PI * 2,
    }));

    let animationFrameId: number;

    const drawFrame = () => {
        const width = canvas.width = window.innerWidth;
        const scale = width / backgroundImg.width;
        const height = canvas.height = backgroundImg.height * scale;

        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = false;

        // Draw background image
        ctx.drawImage(backgroundImg, 0, 0, width, height);

        // Overlay for depth
        ctx.fillStyle = "rgba(5,5,80,0.5)";
        ctx.fillRect(0, 0, width, height);

        // Draw bubbles
        for (const bubble of bubbles) {
            bubble.y -= bubble.speed;
            bubble.wigglePhase += 0.05;
            bubble.x += Math.sin(bubble.wigglePhase) * 0.4;

            if (bubble.y + bubble.radius < 0) {
                bubble.y = height + bubble.radius;
                bubble.x = Math.random() * width;
            }

            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        animationFrameId = requestAnimationFrame(drawFrame);
    };

    backgroundImg.onload = () => {
        drawFrame();
    };

    const handleResize = () => {
        if (backgroundImg.complete) {
            drawFrame();
        }
    };

    window.addEventListener("resize", handleResize);

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
    };
}
