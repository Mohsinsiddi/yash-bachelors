'use client';

import { useEffect } from 'react';

export default function Confetti() {
  useEffect(() => {
    const colors = ['#FFD700', '#8B5CF6', '#EC4899', '#10B981', '#EF4444', '#06B6D4'];
    const container = document.body;
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -20px;
        z-index: 1000;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      container.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 4000);
    }
  }, []);
  
  return (
    <style jsx global>{`
      @keyframes confettiFall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `}</style>
  );
}
