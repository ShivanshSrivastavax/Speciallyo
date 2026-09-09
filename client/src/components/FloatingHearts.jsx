import React, { useMemo } from 'react';

const FloatingHearts = () => {
  const hearts = useMemo(() => {
    const emojis = ['💖', '💕', '✨', '🌸', '💘', '🌹', '💌', '🧸', '🍓'];
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: Math.random() * 96 + '%',
      size: Math.random() * 20 + 16 + 'px',
      duration: Math.random() * 12 + 10 + 's',
      delay: Math.random() * 8 + 's',
      opacity: Math.random() * 0.45 + 0.2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute select-none animate-float-heart"
          style={{
            left: h.left,
            bottom: '-40px',
            fontSize: h.size,
            opacity: h.opacity,
            animation: `floatUpward ${h.duration} linear infinite`,
            animationDelay: h.delay,
          }}
        >
          {h.emoji}
        </span>
      ))}
      <style>{`
        @keyframes floatUpward {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity, 0.4);
          }
          90% {
            opacity: var(--opacity, 0.4);
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingHearts;
