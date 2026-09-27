import React, { useState, useEffect } from 'react';
import {
  Github,
  Key,
  ShieldCheck,
  Lock,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { GitHubUser, PublishConfig } from '../types/github';
import { GitHubClient } from '../services/github/githubClient';
import { ArchivePackage } from '../services/archive/archiveReader';

interface Phase3ConfigureProps {
  pkg: ArchivePackage;
  client: GitHubClient | null;
  user: GitHubUser | null;
  onConnectToken: (token: string) => Promise<void>;
  onDisconnect: () => void;
  onBack: () => void;
  onStartPublish: (config: PublishConfig) => void;
}

export const Phase3_Configure: React.FC<Phase3ConfigureProps> = ({
  pkg,
  client,
  user,
  onConnectToken,
  onDisconnect,
  onBack,
  onStartPublish,
}) => {
  // Auth state
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  // Repo config state
  const initialName = pkg.fileName
    .replace(/\.zip$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '-')
    .replace(/^-+|-+$/g, '') || 'new-repo';

  const [repoName, setRepoName] = useState(initialName);
  const [description, setDescription] = useState(
    `Project exported from ${pkg.fileName} using Pack2Git`
  );
  const [isPrivate, setIsPrivate] = useState(true);

  // Repo availability state
  const [isCheckingRepo, setIsCheckingRepo] = useState(false);
  const [repoExists, setRepoExists] = useState<boolean | null>(null);
  const [repoCheckError, setRepoCheckError] = useState<string | null>(null);

  // Validate token connection
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsValidatingToken(true);
    setAuthError(null);

    try {
      await onConnectToken(tokenInput.trim());
      setTokenInput(''); // Clear plain text input once validated and stored in session memory
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with GitHub. Please check your token and scopes.');
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Check repo existence when user or repoName changes
  useEffect(() => {
    if (!client || !user || !repoName.trim()) {
      setRepoExists(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingRepo(true);
      setRepoCheckError(null);
      try {
        const exists = await client.repoExists(user.login, repoName.trim());
        setRepoExists(exists);
      } catch (err: any) {
        if (err.status !== 404) {
          setRepoCheckError(err.message);
        }
      } finally {
        setIsCheckingRepo(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [client, user, repoName]);

  const handleNameChange = (val: string) => {
    // Sanitize repo name according to GitHub rules (alphanumerics, -, _, .)
    const clean = val.replace(/[^a-zA-Z0-9_.-]/g, '-');
    setRepoName(clean);
  };

  const canPublish =
    Boolean(user && client) &&
    repoName.trim().length > 0 &&
    repoExists === false &&
    !isCheckingRepo;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            GitHub Authentication & Repository Setup
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Connect your account and configure your new repository.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Preview</span>
        </button>
      </div>

      {/* PHASE 5: GITHUB AUTHENTICATION CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
              GitHub Connection
            </h3>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              user
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {user ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {user ? (
          /* Connected State */
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-12 h-12 rounded-full ring-2 ring-emerald-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm sm:text-base">
                    {user.name || user.login}
                  </span>
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    @{user.login}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-400">
                  Public Repos: {user.public_repos}
                  {user.total_private_repos !== undefined &&
                    ` • Private Repos: ${user.total_private_repos}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDisconnect}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          /* Not Connected: Token Form */
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  GitHub Personal Access Token
                </label>
                <button
                  type="button"
                  onClick={() => setShowTokenHelp(!showTokenHelp)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>How to generate?</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_... or github_pat_..."
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                    title={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Helper Guide Drawer */}
            {showTokenHelp && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs space-y-2">
                <div className="font-semibold text-indigo-300">
                  Quick Token Setup (30 seconds):
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>
                    Click the link below to open GitHub token settings.
                  </li>
                  <li>
                    Make sure the <code className="px-1 py-0.5 bg-slate-800 rounded text-indigo-300">repo</code> scope is checked (grants permission to create repositories and commit files).
                  </li>
                  <li>
                    Click <strong>Generate token</strong> at the bottom of GitHub's page.
                  </li>
                  <li>Paste the generated token here.</li>
                </ol>
                <div className="pt-1">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Pack2Git"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-medium text-xs transition-colors"
                  >
                    <span>Open GitHub Token Generator</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Storage Guarantee:</strong> Your token is kept only in volatile browser memory for this active session. It is never stored in localStorage, cookies, telemetry, or server logs.
              </span>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!tokenInput.trim() || isValidatingToken}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isValidatingToken ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Token on GitHub...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>Connect GitHub Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* PHASE 6: REPOSITORY CONFIGURATION CARD */}
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 ${!user ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
            New Repository Configuration
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Pack2Git creates a brand new repository and commits your project files directly to the root. Existing repositories cannot be overwritten.
        </p>

        {/* Repository Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Repository Name <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2.5 rounded-l-xl bg-slate-800 border border-r-0 border-slate-700 text-xs font-mono text-slate-400 select-none">
              {user?.login || 'username'} /
            </span>
            <input
              type="text"
              value={repoName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="my-new-repository"
              className="w-full px-3 py-2.5 rounded-r-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Name availability indicator */}
          <div className="flex items-center gap-2 text-xs pt-1">
            {isCheckingRepo && (
              <span className="text-slate-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" /> Checking availability...
              </span>
            )}
            {!isCheckingRepo && repoExists === true && (
              <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Repository "{user?.login}/{repoName}" already exists on GitHub. Please choose a different name.
              </span>
            )}
            {!isCheckingRepo && repoExists === false && repoName.trim() && (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                "{repoName}" is available!
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Description <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of this repository"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Repository Visibility
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                isPrivate
                  ? 'bg-indigo-600/10 border-indigo-500 text-slate-200 ring-1 ring-indigo-500'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs">Private</div>
                <div className="text-[11px] text-slate-500">Only you can see this repository</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                !isPrivate
                  ? 'bg-indigo-600/10 border-indigo-500 text-slate-200 ring-1 ring-indigo-500'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Globe className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs">Public</div>
                <div className="text-[11px] text-slate-500">Anyone on the internet can see this</div>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!canPublish}
            onClick={() =>
              onStartPublish({
                repoName: repoName.trim(),
                description: description.trim(),
                isPrivate,
                autoInit: false,
              })
            }
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm shadow-lg transition-all ${
              canPublish
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-500/25 cursor-pointer hover:scale-[1.005]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <span>Create Repository & Publish Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
