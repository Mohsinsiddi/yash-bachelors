'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Gamepad2 } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "YASH'S BACHELOR", subtitle = "Brutal Awards 2025" }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const showPlayButton = pathname !== '/game';
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 safe-area-top">
        <div className="glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg shadow-lg flex-shrink-0">
                👑
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-base sm:text-lg gradient-text leading-none">{title}</h1>
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">{subtitle}</p>
              </div>
            </Link>
            
            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
              {[
                { href: '/', label: 'Home' },
                { href: '/game', label: 'Play' },
                { href: '/leaderboard', label: 'Leaderboard' },
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`text-sm font-medium transition-colors py-2 ${
                    pathname === item.href 
                      ? 'text-yellow-400' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Right Side */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Play Button - Desktop */}
              {showPlayButton && (
                <Link 
                  href="/game"
                  className="hidden md:flex btn-gold px-4 py-2 rounded-full text-sm font-semibold items-center gap-2"
                >
                  <Gamepad2 size={16} />
                  Play Now
                </Link>
              )}
              
              {/* Play Button - Mobile (icon only) */}
              {showPlayButton && (
                <Link 
                  href="/game"
                  className="md:hidden w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black"
                >
                  <Gamepad2 size={18} />
                </Link>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <nav className="absolute top-16 right-3 left-3 bg-dark-card border border-white/10 rounded-2xl p-3 space-y-1 shadow-2xl">
            {[
              { href: '/', label: '🏠 Home', desc: 'Back to start' },
              { href: '/game', label: '🎮 Play Game', desc: 'Vote now' },
              { href: '/leaderboard', label: '📊 Leaderboard', desc: 'See all results' },
              { href: '/clear', label: '🧹 Reset My Votes', desc: 'Start fresh' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === item.href 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'text-zinc-300 hover:bg-white/5 active:bg-white/10'
                }`}
              >
                <span className="text-xl">{item.label.split(' ')[0]}</span>
                <div>
                  <p className="font-medium text-sm">{item.label.split(' ').slice(1).join(' ')}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
