import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FolderGit2,
  GitCommit,
  FileCode,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { ProjectManifest } from '../types/archive';
import { RepoVerificationResult } from '../types/github';

interface Phase5VerifiedProps {
  manifest: ProjectManifest;
  verification: RepoVerificationResult;
  onPublishAnother: () => void;
  onViewManifest: () => void;
}

export const Phase5_Verified: React.FC<Phase5VerifiedProps> = ({
  manifest,
  verification,
  onPublishAnother,
  onViewManifest,
}) => {
  const [copiedClone, setCopiedClone] = useState(false);
  const repo = manifest.publication?.repository;
  const git = manifest.publication?.git;

  const cloneCommand = `git clone ${repo?.url || ''}.git`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleDownloadManifest = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pack2git-manifest-${repo?.name || 'repo'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/10 mb-1">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Publish Complete & Verified
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Your project files have been extracted and published directly to your new GitHub repository root.
        </p>
      </div>

      {/* Primary Action Button: Open GitHub Repository */}
      {repo && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
          >
            <span>Open GitHub Repository</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onPublishAnother}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Publish Another Project</span>
          </button>
        </div>
      )}

      {/* PHASE 11: VERIFICATION SUMMARY CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
                Independent Repository Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Verified against GitHub Git Data API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Tree Integrity Match</span>
          </div>
        </div>

        {/* Verification Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 text-xs block mb-1">
              Repository Created
            </span>
            <span className="text-slate-100 font-bold text-sm flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {repo?.fullName}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 text-xs block mb-1">
              Files Tree Match
            </span>
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {verification.expectedFilesCount} expected / {verification.actualFilesCount} found
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 text-xs block mb-1">
              Commit Confirmed
            </span>
            <span className="text-slate-200 font-bold text-sm flex items-center gap-1.5 font-mono truncate" title={git?.commitSha}>
              <GitCommit className="w-4 h-4 text-indigo-400 shrink-0" />
              {git?.commitSha.slice(0, 7)} (main)
            </span>
          </div>
        </div>

        {/* Git Clone Snippet */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="truncate font-mono text-xs text-slate-300">
            <span className="text-indigo-400">$</span> {cloneCommand}
          </div>
          <button
            type="button"
            onClick={handleCopyClone}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
            title="Copy git clone command"
          >
            {copiedClone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PHASE 12: INTERNAL PROJECT MANIFEST CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
                Internal Publishing Manifest
              </h3>
              <p className="text-[11px] text-slate-400">
                Lightweight verification artifact (retained in application session)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewManifest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View JSON</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadManifest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">
              Source ZIP
            </span>
            <span className="text-slate-300 font-semibold truncate block" title={manifest.sourceArchive.fileName}>
              {manifest.sourceArchive.fileName}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">
              Project Type
            </span>
            <span className="text-slate-300 font-semibold block">
              {manifest.projectType}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">
              Root Stripping
            </span>
            <span className="text-slate-300 font-semibold block">
              {manifest.projectRoot.stripped ? 'Stripped' : 'Retained'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">
              Branch & Commits
            </span>
            <span className="text-slate-300 font-semibold block">
              main (1 commit)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
