import React, { useEffect, useRef } from 'react';

const ConfettiFx = ({ trigger = true, duration = 6000 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#e11d48', '#ffedd5', '#fef08a', '#c084fc'];
    const heartSymbols = ['❤️', '💖', '✨', '🌸', '🎉', '💕', '🥰'];

    const confettiCount = 140;
    const particles = [];

    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 22,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        symbol: Math.random() > 0.6 ? heartSymbols[Math.floor(Math.random() * heartSymbols.length)] : null,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        drag: 0.96,
        opacity: 1,
      });
    }

    let animationFrameId;
    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      particles.forEach((p) => {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (elapsed > duration * 0.6) {
          p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
        }

        if (p.opacity > 0 && p.y < height + 50) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);

          if (p.symbol) {
            ctx.font = `${p.size * 1.5}px serif`;
            ctx.fillText(p.symbol, -p.size / 2, p.size / 2);
          } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          }

          ctx.restore();
        }
      });

      if (alive && elapsed < duration) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trigger, duration]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

export default ConfettiFx;
