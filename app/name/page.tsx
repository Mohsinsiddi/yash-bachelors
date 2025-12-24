'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Loading from '@/components/Loading';
import { GameConfig } from '@/types';

export default function NamePage() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setConfig(data);
      } catch (error) {
        console.error('Failed to fetch config:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Header title={config?.title} subtitle={config?.subtitle} />
      
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="text-7xl sm:text-8xl mb-6 animate-float">👑</div>
          
          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl gradient-text mb-4">
            {config?.title}
          </h1>
          <p className="font-marker text-xl sm:text-2xl text-purple-400 mb-8">
            {config?.subtitle}
          </p>
          
          {/* Welcome Message Card */}
          <div className="card p-6 sm:p-10 mb-8">
            <p className="text-lg sm:text-xl lg:text-2xl text-zinc-300 leading-relaxed">
              {config?.welcomeMessage}
            </p>
          </div>
          
          {/* Date */}
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-dark-card border border-yellow-500/20 rounded-full mb-8">
            <span className="text-2xl">📅</span>
            <span className="text-yellow-400 font-semibold text-lg">{config?.date}</span>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/game"
              className="btn-gold px-8 py-4 rounded-full text-lg font-semibold w-full sm:w-auto"
            >
              🎮 Let's Play!
            </Link>
            <Link
              href="/"
              className="px-8 py-4 rounded-full text-lg font-semibold bg-dark-card border border-white/10 hover:border-purple-500/50 transition-all w-full sm:w-auto"
            >
              ← Back Home
            </Link>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}
