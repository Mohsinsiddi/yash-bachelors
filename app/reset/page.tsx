'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'clearing' | 'cleared' | 'redirecting'>('clearing');
  const [countdown, setCountdown] = useState(3);
  const [clearedItems, setClearedItems] = useState<string[]>([]);

  useEffect(() => {
    // List of items to clear
    const items = [
      'votedQuestions',
      'voterId', 
      'odcId',
      'currentQuestion',
      'playerScores',
      'adminAuth'
    ];
    
    // Clear each item and track what was cleared
    const cleared: string[] = [];
    items.forEach(item => {
      if (localStorage.getItem(item)) {
        cleared.push(item);
      }
      localStorage.removeItem(item);
    });
    
    setClearedItems(cleared);
    setStatus('cleared');
    
    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('redirecting');
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0F]">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A25] border border-white/10 rounded-2xl p-8 text-center">
          {status === 'clearing' && (
            <>
              <div className="text-6xl mb-4 animate-pulse">🔄</div>
              <h1 className="text-2xl font-bold text-white">Clearing data...</h1>
            </>
          )}
          
          {status === 'cleared' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-green-400 mb-2">All Clear!</h1>
              <p className="text-zinc-400 mb-4">Your local data has been reset.</p>
              
              {clearedItems.length > 0 && (
                <div className="text-left bg-black/30 rounded-xl p-4 mb-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Cleared:</p>
                  {clearedItems.map(item => (
                    <p key={item} className="text-sm text-green-400">✓ {item}</p>
                  ))}
                </div>
              )}
              
              <p className="text-zinc-500 mb-4">Redirecting in {countdown}...</p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-zinc-700 text-white rounded-full font-semibold hover:bg-zinc-600"
                >
                  🏠 Home
                </button>
                <button 
                  onClick={() => router.push('/game')}
                  className="px-6 py-3 bg-yellow-500 text-black rounded-full font-semibold hover:bg-yellow-400"
                >
                  🎮 Play
                </button>
              </div>
            </>
          )}
          
          {status === 'redirecting' && (
            <>
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="text-2xl font-bold text-white">Redirecting...</h1>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
