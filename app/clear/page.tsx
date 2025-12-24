'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    // Get current player name before clearing
    const name = localStorage.getItem('currentPlayerName');
    setPlayerName(name);
    
    // Clear player registration (this is the only localStorage we use now)
    localStorage.removeItem('currentPlayerId');
    localStorage.removeItem('currentPlayerName');
    localStorage.removeItem('currentPlayerEmoji');
    
    // Also clear any legacy data
    localStorage.removeItem('votedQuestions');
    localStorage.removeItem('voterId');
    localStorage.removeItem('odcId');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('playerScores');
    
    setCleared(true);
    
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
            <h1 className="text-2xl font-bold text-green-400 mb-2">Session Cleared!</h1>
            {playerName && (
              <p className="text-zinc-400 mb-2">Goodbye, {playerName}!</p>
            )}
            <p className="text-zinc-500 mb-4">You can now register as a different player.</p>
            <p className="text-zinc-600">Redirecting in {countdown}...</p>
            <button 
              onClick={() => router.push('/game')}
              className="mt-4 px-6 py-3 bg-yellow-500 text-black rounded-full font-semibold"
            >
              Register Now →
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-spin">🧹</div>
            <h1 className="text-2xl font-bold text-white">Clearing session...</h1>
          </>
        )}
      </div>
    </div>
  );
}
