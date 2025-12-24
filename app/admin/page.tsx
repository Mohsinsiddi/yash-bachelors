'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import { Player, Question, GameConfig, GameSession } from '@/types';

interface Stats {
  game: { title: string; isActive: boolean; currentQuestion: number };
  counts: {
    totalVotes: number;
    totalQuestions: number;
    activeQuestions: number;
    totalPlayers: number;
    activePlayers: number;
    uniqueVoters: number;
    uniqueSessions: number;
  };
  votesPerQuestion: Record<number, number>;
  votesReceived: Record<number, number>;
}

interface CollectionStats {
  collections: Record<string, { count: number; name: string }>;
  total: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [session, setSession] = useState<GameSession & { remainingSeconds: number } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [collections, setCollections] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'session' | 'overview' | 'config' | 'players' | 'questions' | 'votes' | 'database'>('session');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [newPlayer, setNewPlayer] = useState({ name: '', emoji: '😀' });
  const [editingConfig, setEditingConfig] = useState<Partial<GameConfig>>({});
  const [votingDuration, setVotingDuration] = useState(180);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchAll();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchSession();
        fetchCollections();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (adminPassword === 'yash2025') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      fetchAll();
    } else {
      showMessage('error', 'Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  async function fetchSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      setSession(data);
      setVotingDuration(data.votingDurationSeconds || 180);
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  }

  async function fetchCollections() {
    try {
      const res = await fetch('/api/admin/collections');
      const data = await res.json();
      setCollections(data);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  }

  async function fetchAll() {
    try {
      const [playersRes, questionsRes, configRes, statsRes] = await Promise.all([
        fetch('/api/players?all=true'),
        fetch('/api/questions?all=true'),
        fetch('/api/config'),
        fetch('/api/admin/stats'),
      ]);
      
      setPlayers(await playersRes.json());
      setQuestions(await questionsRes.json());
      const configData = await configRes.json();
      setConfig(configData);
      setEditingConfig(configData);
      setStats(await statsRes.json());
      await fetchSession();
      await fetchCollections();
    } catch (error) {
      console.error('Failed to fetch:', error);
      showMessage('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: string, text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }

  // Session Actions
  async function handleSessionAction(action: string, data?: any) {
    setActionLoading(true);
    try {
      await fetch('/api/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      showMessage('success', `Action "${action}" completed`);
      fetchSession();
    } catch (error) {
      showMessage('error', 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleNewGame() {
    if (!confirm('Start a new game? This will reset progress but keep votes.')) return;
    setActionLoading(true);
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votingDurationSeconds: votingDuration }),
      });
      showMessage('success', 'New game started!');
      fetchSession();
    } catch (error) {
      showMessage('error', 'Failed to start new game');
    } finally {
      setActionLoading(false);
    }
  }

  // Config Actions
  async function handleUpdateConfig() {
    setActionLoading(true);
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingConfig),
      });
      showMessage('success', 'Config updated!');
      fetchAll();
    } catch (error) {
      showMessage('error', 'Failed to update config');
    } finally {
      setActionLoading(false);
    }
  }

  // Player Actions
  async function handleAddPlayer() {
    if (!newPlayer.name) return showMessage('error', 'Player name required');
    setActionLoading(true);
    try {
      await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      });
      setNewPlayer({ name: '', emoji: '😀' });
      showMessage('success', 'Player added!');
      fetchAll();
    } catch (error) {
      showMessage('error', 'Failed to add player');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTogglePlayer(id: number, isActive: boolean) {
    try {
      await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchAll();
    } catch (error) {
      showMessage('error', 'Failed');
    }
  }

  async function handleDeletePlayer(id: number) {
    if (!confirm('PERMANENTLY delete?')) return;
    try {
      await fetch(`/api/players?id=${id}&hard=true`, { method: 'DELETE' });
      showMessage('success', 'Deleted');
      fetchAll();
    } catch (error) {
      showMessage('error', 'Failed');
    }
  }

  // Question Actions
  async function handleToggleQuestion(id: number, isActive: boolean) {
    try {
      await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchAll();
    } catch (error) {
      showMessage('error', 'Failed');
    }
  }

  async function handleDeleteQuestion(id: number) {
    if (!confirm('PERMANENTLY delete?')) return;
    try {
      await fetch(`/api/questions?id=${id}&hard=true`, { method: 'DELETE' });
      showMessage('success', 'Deleted');
      fetchAll();
    } catch (error) {
      showMessage('error', 'Failed');
    }
  }

  // Vote Actions
  async function handleDeleteQuestionVotes(questionId: number) {
    if (!confirm(`Delete votes for Q${questionId}?`)) return;
    setActionLoading(true);
    try {
      await fetch(`/api/votes?questionId=${questionId}`, { method: 'DELETE' });
      showMessage('success', 'Votes deleted');
      fetchAll();
    } catch (error) {
      showMessage('error', 'Failed');
    } finally {
      setActionLoading(false);
    }
  }

  // Collection Actions
  async function handleDeleteCollection(collection: string) {
    const confirmMsg = collection === 'all' 
      ? '⚠️ DELETE ALL COLLECTIONS? This will wipe the entire database!'
      : `Delete all data from "${collection}"?`;
    if (!confirm(confirmMsg)) return;
    if (collection === 'all' && !confirm('Are you REALLY sure? This cannot be undone!')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/collections?collection=${collection}&password=yash2025`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', data.message);
        fetchAll();
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete collection');
    } finally {
      setActionLoading(false);
    }
  }

  // 🌱 SEED DATABASE
  async function handleSeedDatabase() {
    if (!confirm('🌱 Seed database with default data?\n\nThis will:\n• Clear all existing data\n• Add 11 players\n• Add 10 questions\n• Reset game session')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'yash2025', clearFirst: true }),
      });
      const data = await res.json();
      
      if (data.success) {
        showMessage('success', '🌱 Database seeded! 11 players, 10 questions ready.');
        fetchAll();
      } else {
        showMessage('error', data.error || 'Failed to seed');
      }
    } catch (error) {
      showMessage('error', 'Failed to seed database');
    } finally {
      setActionLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0F]">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="font-display text-2xl gradient-text mb-6">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-dark-elevated rounded-xl border border-white/10 focus:border-yellow-500 outline-none mb-4"
          />
          <button onClick={handleLogin} className="btn-gold w-full px-6 py-3 rounded-xl">
            Login
          </button>
          {message.text && (
            <p className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )}
          <p className="text-zinc-500 text-sm mt-4">Default: yash2025</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-8 px-3 sm:px-4 bg-[#0A0A0F]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl gradient-text">🛡️ Admin</h1>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/5">
              Logout
            </button>
          </div>
          
          {/* Message Toast */}
          {message.text && (
            <div className={`fixed top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto px-6 py-3 rounded-xl z-50 text-center text-sm font-medium ${
              message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Tabs */}
          <div className="flex gap-1.5 sm:gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
            {(['session', 'overview', 'config', 'players', 'questions', 'votes', 'database'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-yellow-500 text-black'
                    : 'bg-dark-card hover:bg-dark-elevated'
                }`}
              >
                {tab === 'session' ? '🎮 Game' : 
                 tab === 'database' ? '🗄️ DB' : 
                 tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          {/* ============ SESSION TAB ============ */}
          {activeTab === 'session' && session && (
            <div className="space-y-4 sm:space-y-6">
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-4 text-base sm:text-lg">🎮 Game Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-3 sm:p-4 bg-dark-elevated rounded-xl">
                    <p className="text-2xl sm:text-3xl font-display gradient-text">{session.currentQuestionIndex + 1}</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">Current Q</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-dark-elevated rounded-xl">
                    <p className="text-2xl sm:text-3xl font-display text-purple-400">{formatTime(session.remainingSeconds || 0)}</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">Time Left</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-dark-elevated rounded-xl">
                    <p className={`text-lg sm:text-xl font-semibold ${
                      session.status === 'voting' ? 'text-green-400' : 
                      session.status === 'results' ? 'text-purple-400' : 'text-zinc-400'
                    }`}>{session.status?.toUpperCase()}</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">Status</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-dark-elevated rounded-xl">
                    <p className="text-2xl sm:text-3xl font-display text-cyan-400">{session.votingDurationSeconds}s</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">Duration</p>
                  </div>
                </div>
                
                {questions[session.currentQuestionIndex] && (
                  <div className="p-3 sm:p-4 bg-dark-elevated rounded-xl">
                    <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Current Question</p>
                    <p className="font-medium text-sm sm:text-base">{questions[session.currentQuestionIndex].question}</p>
                  </div>
                )}
              </div>
              
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">🕹️ Controls</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button onClick={() => handleSessionAction('previous_question')} disabled={actionLoading} className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-zinc-500/20 text-zinc-300 hover:bg-zinc-500/30 disabled:opacity-50 text-sm">⏮️ Prev</button>
                  <button onClick={() => handleSessionAction('restart_timer')} disabled={actionLoading} className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-sm">🔄 Restart</button>
                  <button onClick={() => handleSessionAction('reveal_twist')} disabled={actionLoading} className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm">⚡ Reveal</button>
                  <button onClick={() => handleSessionAction('next_question')} disabled={actionLoading} className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm">⏭️ Next</button>
                </div>
              </div>
              
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">🎯 Jump to Question</h3>
                <div className="flex flex-wrap gap-2">
                  {questions.filter(q => q.isActive).map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => handleSessionAction('go_to_question', { questionIndex: i })}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-display text-base sm:text-lg ${
                        i === session.currentQuestionIndex ? 'bg-yellow-500 text-black' : 'bg-dark-elevated hover:bg-purple-500/30'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">⏱️ Timer</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                  <input
                    type="number"
                    value={votingDuration}
                    onChange={(e) => setVotingDuration(parseInt(e.target.value) || 60)}
                    className="w-20 sm:w-24 px-3 py-2.5 bg-dark-elevated rounded-xl border border-white/10 outline-none text-sm"
                  />
                  <span className="text-zinc-400 text-sm">sec</span>
                  <button onClick={() => handleSessionAction('set_duration', { seconds: votingDuration })} className="px-3 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm">Set</button>
                  <button onClick={() => handleSessionAction('extend_time', { seconds: 60 })} className="px-3 py-2.5 rounded-xl bg-green-500/20 text-green-400 text-sm">+1m</button>
                </div>
              </div>
              
              <div className="card p-4 sm:p-6 border-yellow-500/30">
                <h3 className="font-semibold mb-3 text-yellow-400 text-sm sm:text-base">🆕 New Game</h3>
                <button onClick={handleNewGame} disabled={actionLoading} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm">Start New Game</button>
              </div>
            </div>
          )}
          
          {/* ============ DATABASE TAB ============ */}
          {activeTab === 'database' && collections && (
            <div className="space-y-4 sm:space-y-6">
              {/* Collection Stats */}
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">📊 Collections</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                  {Object.entries(collections.collections).map(([key, val]) => (
                    <div key={key} className="text-center p-2 sm:p-4 bg-dark-elevated rounded-xl">
                      <p className="text-xl sm:text-3xl font-display gradient-text">{val.count}</p>
                      <p className="text-[9px] sm:text-xs text-zinc-500 uppercase truncate">{val.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 🌱 SEED DATABASE - NEW! */}
              <div className="card p-4 sm:p-6 border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
                <h3 className="font-semibold mb-2 text-green-400 text-base sm:text-lg">🌱 Seed Database</h3>
                <p className="text-zinc-400 text-xs sm:text-sm mb-4">Populate database with default data (11 players, 10 questions)</p>
                <button 
                  onClick={handleSeedDatabase} 
                  disabled={actionLoading}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 font-semibold text-sm sm:text-base disabled:opacity-50"
                >
                  {actionLoading ? '⏳ Seeding...' : '🌱 Seed Default Data'}
                </button>
              </div>
              
              {/* Delete Collections */}
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">🗑️ Delete Collections</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <button onClick={() => handleDeleteCollection('votes')} disabled={actionLoading} className="px-3 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-xs sm:text-sm">🗑️ Votes</button>
                  <button onClick={() => handleDeleteCollection('gamesessions')} disabled={actionLoading} className="px-3 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-xs sm:text-sm">🗑️ Sessions</button>
                  <button onClick={() => handleDeleteCollection('players')} disabled={actionLoading} className="px-3 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs sm:text-sm">🗑️ Players</button>
                  <button onClick={() => handleDeleteCollection('questions')} disabled={actionLoading} className="px-3 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs sm:text-sm">🗑️ Questions</button>
                  <button onClick={() => handleDeleteCollection('gameconfigs')} disabled={actionLoading} className="px-3 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs sm:text-sm">🗑️ Config</button>
                </div>
              </div>
              
              {/* Nuclear Option */}
              <div className="card p-4 sm:p-6 border-red-500/50">
                <h3 className="font-semibold mb-2 text-red-400 text-base sm:text-lg">☢️ Danger Zone</h3>
                <p className="text-zinc-500 text-xs sm:text-sm mb-4">Delete ALL data. Use "Seed Database" after to restore.</p>
                <button 
                  onClick={() => handleDeleteCollection('all')} 
                  disabled={actionLoading}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-red-500/30 text-red-400 hover:bg-red-500/40 font-semibold text-sm"
                >
                  💣 Delete All Data
                </button>
              </div>
            </div>
          )}
          
          {/* ============ OTHER TABS ============ */}
          {activeTab === 'overview' && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-display gradient-text">{stats.counts.totalVotes}</p><p className="text-[10px] sm:text-xs text-zinc-500">Votes</p></div>
              <div className="card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-display gradient-text">{stats.counts.uniqueVoters}</p><p className="text-[10px] sm:text-xs text-zinc-500">Voters</p></div>
              <div className="card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-display gradient-text">{stats.counts.activeQuestions}</p><p className="text-[10px] sm:text-xs text-zinc-500">Questions</p></div>
              <div className="card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-display gradient-text">{stats.counts.activePlayers}</p><p className="text-[10px] sm:text-xs text-zinc-500">Players</p></div>
            </div>
          )}
          
          {activeTab === 'config' && (
            <div className="card p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div><label className="block text-xs sm:text-sm text-zinc-400 mb-1">Title</label><input type="text" value={editingConfig.title || ''} onChange={(e) => setEditingConfig({ ...editingConfig, title: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-elevated rounded-xl border border-white/10 outline-none text-sm" /></div>
              <div><label className="block text-xs sm:text-sm text-zinc-400 mb-1">Subtitle</label><input type="text" value={editingConfig.subtitle || ''} onChange={(e) => setEditingConfig({ ...editingConfig, subtitle: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-elevated rounded-xl border border-white/10 outline-none text-sm" /></div>
              <div><label className="block text-xs sm:text-sm text-zinc-400 mb-1">Date</label><input type="text" value={editingConfig.date || ''} onChange={(e) => setEditingConfig({ ...editingConfig, date: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-elevated rounded-xl border border-white/10 outline-none text-sm" /></div>
              <div><label className="block text-xs sm:text-sm text-zinc-400 mb-1">Welcome Message</label><textarea value={editingConfig.welcomeMessage || ''} onChange={(e) => setEditingConfig({ ...editingConfig, welcomeMessage: e.target.value })} rows={3} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-dark-elevated rounded-xl border border-white/10 outline-none resize-none text-sm" /></div>
              <button onClick={handleUpdateConfig} disabled={actionLoading} className="btn-gold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm">Save</button>
            </div>
          )}
          
          {activeTab === 'players' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="card p-3 sm:p-4 flex gap-2 sm:gap-3">
                <input type="text" placeholder="Name" value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} className="flex-1 px-3 sm:px-4 py-2.5 bg-dark-elevated rounded-xl border border-white/10 outline-none text-sm" />
                <input type="text" placeholder="😀" value={newPlayer.emoji} onChange={(e) => setNewPlayer({ ...newPlayer, emoji: e.target.value })} className="w-12 sm:w-16 px-2 py-2.5 bg-dark-elevated rounded-xl border border-white/10 outline-none text-center text-lg" />
                <button onClick={handleAddPlayer} className="btn-gold px-3 sm:px-6 py-2.5 rounded-xl text-sm">Add</button>
              </div>
              {players.map((player) => (
                <div key={player.id} className={`card p-3 sm:p-4 flex items-center justify-between ${!player.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2 sm:gap-3"><span className="text-xl sm:text-2xl">{player.emoji}</span><span className="text-sm sm:text-base">{player.name}</span></div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button onClick={() => handleTogglePlayer(player.id, player.isActive)} className={`px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs ${player.isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>{player.isActive ? 'Hide' : 'Show'}</button>
                    <button onClick={() => handleDeletePlayer(player.id)} className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs bg-red-500/20 text-red-400">Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'questions' && (
            <div className="space-y-2 sm:space-y-3">
              {questions.map((q) => (
                <div key={q.id} className={`card p-3 sm:p-4 ${!q.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between gap-2 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="font-display text-zinc-500 text-xs sm:text-sm">Q{q.order}</span>
                        <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${q.type === 'TWIST' ? 'bg-red-500/20 text-red-400' : q.type === 'DIRECT' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{q.type}</span>
                      </div>
                      <p className="font-medium text-xs sm:text-sm truncate">{q.question}</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                      <button onClick={() => handleToggleQuestion(q.id, q.isActive)} className={`px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs ${q.isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>{q.isActive ? 'Hide' : 'Show'}</button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs bg-red-500/20 text-red-400">Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'votes' && stats && (
            <div className="card p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Votes per Question</h3>
              <div className="space-y-2">
                {questions.filter(q => q.isActive).map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 sm:p-3 bg-dark-elevated rounded-lg">
                    <span className="text-xs sm:text-sm truncate flex-1 mr-2">Q{q.order}: {q.question.substring(0, 25)}...</span>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="font-display text-lg sm:text-xl text-yellow-400">{stats.votesPerQuestion[q.id] || 0}</span>
                      {(stats.votesPerQuestion[q.id] || 0) > 0 && (
                        <button onClick={() => handleDeleteQuestionVotes(q.id)} className="px-2 py-1 rounded text-[10px] sm:text-xs bg-red-500/20 text-red-400">Clear</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
