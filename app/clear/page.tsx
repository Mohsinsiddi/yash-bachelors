'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Clear all localStorage
    localStorage.removeItem('votedQuestions');
    localStorage.removeItem('voterId');
    localStorage.removeItem('odcId');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('playerScores');
    localStorage.removeItem('adminAuth');
    
    // Mark as cleared
    setCleared(true);
    
    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/game');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0F]">
      <div className="text-center">
        {cleared ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-400 mb-2">Data Cleared!</h1>
            <p className="text-zinc-400 mb-4">Your voting history has been reset.</p>
            <p className="text-zinc-500">Redirecting to game in {countdown}...</p>
            <button 
              onClick={() => router.push('/game')}
              className="mt-4 px-6 py-3 bg-yellow-500 text-black rounded-full font-semibold"
            >
              Go Now →
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-spin">🧹</div>
            <h1 className="text-2xl font-bold text-white">Clearing data...</h1>
          </>
        )}
      </div>
    </div>
  );
}
