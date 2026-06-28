import React from 'react';
import { LogIn, LogOut, PlusCircle, User, ShieldAlert, Coins } from 'lucide-react';
import { Profile } from '../types.ts';

interface HeaderProps {
  currentAgent: Profile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenBuyCoins: () => void;
  onLogout: () => void;
}

export default function Header({
  currentAgent,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenBuyCoins,
  onLogout
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-2xl px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0"
          id="logo-container"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-base sm:text-lg tracking-tighter shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-105">SK</div>
          <h1 className="text-sm sm:text-xl font-black tracking-widest text-white transition-colors group-hover:text-amber-400">SKOCHA</h1>
          <span className="hidden md:inline-block px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] uppercase font-bold rounded tracking-widest">
            Premium Hub
          </span>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          
          {currentAgent ? (
            <>
              {/* Account / Dashboard Tab Toggle */}
              <button
                id="btn-account-tab"
                onClick={() => setActiveTab('my-ads')}
                className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'my-ads'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-amber-500/5 shadow-md'
                    : 'border-slate-800 text-slate-300 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">My Profile</span>
              </button>

              {/* Coin Balance Badge & Purchase Trigger */}
              <div 
                onClick={onOpenBuyCoins}
                className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-all text-amber-400 shadow-sm shrink-0"
                title={`Click to buy coin packages. Balance: ${currentAgent.coinBalance} Coins`}
                id="header-coin-badge"
              >
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <span className="hidden sm:inline-block text-xs font-mono font-bold">{currentAgent.coinBalance}<span className="hidden md:inline"> Coins</span></span>
                <span className="hidden sm:inline-block text-[9px] sm:text-[10px] bg-amber-500 text-slate-950 px-1 sm:px-1.5 py-0.5 rounded font-bold font-sans">BUY</span>
              </div>

              {/* Developer Admin Dashboard Toggle */}
              {currentAgent.isDeveloper && (
                <button
                  id="btn-admin-tab"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                      : 'border-red-950/40 text-red-400 hover:border-amber-500/30 hover:bg-amber-500/5'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Post Ad Button */}
              <button
                id="btn-post-ad-tab"
                onClick={() => setActiveTab('post-ad')}
                className={`flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shrink-0 ${
                  activeTab === 'post-ad'
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/10 hover:bg-amber-600'
                    : 'bg-transparent border border-amber-500 text-amber-400 hover:bg-amber-500/10'
                }`}
                title="Post a new ad listing"
              >
                <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">POST AD</span>
              </button>

              {/* Logout Button */}
              <button
                id="btn-logout"
                onClick={onLogout}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Guest View Action */}
              <button
                id="btn-login-open"
                onClick={onOpenLogin}
                className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shadow-amber-500/5"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">LOGIN / REGISTER</span>
                <span className="sm:hidden">LOGIN</span>
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}
