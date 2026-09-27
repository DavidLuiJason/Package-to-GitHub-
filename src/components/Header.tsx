import React from 'react';
import { Package, Github, LogOut, CheckCircle2 } from 'lucide-react';
import { GitHubUser } from '../types/github';

interface HeaderProps {
  user: GitHubUser | null;
  onDisconnect: () => void;
  onReset: () => void;
  rateLimitRemaining?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onDisconnect,
  onReset,
  rateLimitRemaining,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-lg tracking-tight">
                Package to GitHub
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Pack2Git
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Turn a project package into a real GitHub repository
            </p>
          </div>
        </div>

        {/* Auth / Account status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 rounded-full pl-2 pr-3 py-1.5 shadow-sm">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-6 h-6 rounded-full ring-2 ring-emerald-500/50"
              />
              <div className="text-left text-xs leading-tight">
                <span className="font-medium text-slate-200 block">
                  {user.name || user.login}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  @{user.login}
                  {rateLimitRemaining !== undefined && (
                    <span className="ml-1 text-slate-500">
                      • {rateLimitRemaining} reqs
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={onDisconnect}
                title="Disconnect GitHub Token"
                className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors ml-1"
                aria-label="Disconnect GitHub"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-1.5">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">GitHub:</span>
              <span className="text-amber-400 font-medium">Not Connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
