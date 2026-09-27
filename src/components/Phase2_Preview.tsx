import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Folder,
  File,
  Search,
  ArrowRight,
  ArrowLeft,
  Sliders,
  ShieldCheck,
  FolderTree,
  FileCode,
  Info,
  Layers,
  XCircle,
} from 'lucide-react';
import { ArchivePackage } from '../services/archive/archiveReader';
import { ArchiveEntry } from '../types/archive';

interface Phase2PreviewProps {
  pkg: ArchivePackage;
  onUpdateRootStripping: (strip: boolean) => void;
  onBack: () => void;
  onProceed: () => void;
}

export const Phase2_Preview: React.FC<Phase2PreviewProps> = ({
  pkg,
  onUpdateRootStripping,
  onBack,
  onProceed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllFiles, setShowAllFiles] = useState(false);

  const { inspection } = pkg;
  const { rootInfo, validation, useRootStripping } = inspection;
  const { stats, checks, issues, canPublish } = validation;

  const filteredFiles = inspection.filesOnly.filter((entry) => {
    const q = searchQuery.toLowerCase();
    return (
      entry.repoPath.toLowerCase().includes(q) ||
      entry.path.toLowerCase().includes(q)
    );
  });

  const displayedFiles = showAllFiles
    ? filteredFiles
    : filteredFiles.slice(0, 50);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>Project Package Preview</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {validation.detectedProjectType}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Archive: <strong className="text-slate-200">{pkg.fileName}</strong> ({formatBytes(pkg.fileSizeBytes)})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs sm:text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Archive</span>
          </button>

          <button
            type="button"
            disabled={!canPublish}
            onClick={onProceed}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg ${
              canPublish
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-indigo-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <span>Continue to GitHub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PHASE 2: ROOT DETECTION CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
              Repository Root Detection
            </h3>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              rootInfo.hasWrapperFolder
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {rootInfo.hasWrapperFolder ? 'Outer Wrapper Folder Detected' : 'Flat Root Layout'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {rootInfo.reason}
        </p>

        {rootInfo.hasWrapperFolder && (
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-200 block">
                  Strip outer wrapper folder "{rootInfo.detectedRoot}"?
                </label>
                <span className="text-[11px] text-slate-400">
                  Recommended: Places project files directly at the repository root rather than inside a subfolder.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateRootStripping(!useRootStripping)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  useRootStripping ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useRootStripping ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Path mapping preview */}
            <div className="pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium block mb-1">
                Repository path transformation example:
              </span>
              <div className="bg-slate-900 rounded-lg p-2.5 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">
                  Original in ZIP:{' '}
                  <span className="text-slate-300">
                    {rootInfo.detectedRoot}src/App.tsx
                  </span>
                </div>
                <div className="text-indigo-400 font-semibold">
                  GitHub Repo Root:{' '}
                  <span className="text-indigo-300">
                    {useRootStripping ? 'src/App.tsx' : `${rootInfo.detectedRoot}src/App.tsx`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PHASE 3: VALIDATION CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
              Archive Validation & Safety Checklist
            </h3>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              validation.isValid
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {validation.isValid ? 'Validation Passed' : 'Validation Failed'}
          </span>
        </div>

        {/* Checks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {checks.map((check) => (
            <div
              key={check.name}
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                check.passed
                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                  : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
              }`}
            >
              {check.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-slate-200 block">
                  {check.name}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {check.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Issues list (if any) */}
        {issues.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-300">
              Notices & Warnings ({issues.length})
            </div>
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs border flex items-start gap-2.5 ${
                  issue.type === 'error'
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    : issue.type === 'warning'
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    issue.type === 'error'
                      ? 'text-rose-400'
                      : issue.type === 'warning'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                  }`}
                />
                <div>
                  <span className="font-semibold block">{issue.message}</span>
                  {issue.details && (
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {issue.details}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PHASE 4: REPOSITORY CONTENTS EXPLORER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
                Repository Contents Preview
              </h3>
              <p className="text-[11px] text-slate-400">
                {stats.totalFiles} files • {stats.totalFolders} folders • {formatBytes(stats.totalUncompressedBytes)} uncompressed
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter repository files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* File List */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
          <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex justify-between">
            <span>Destination Path in GitHub Repository</span>
            <span>Size</span>
          </div>

          <div className="divide-y divide-slate-850 max-h-80 overflow-y-auto font-mono text-xs">
            {displayedFiles.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No matching files found.
              </div>
            ) : (
              displayedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 flex items-center justify-between hover:bg-slate-850/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-4">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-300 truncate" title={file.repoPath}>
                      {file.repoPath}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] shrink-0 font-sans">
                    {formatBytes(file.size)}
                  </span>
                </div>
              ))
            )}
          </div>

          {filteredFiles.length > 50 && !showAllFiles && (
            <div className="p-2 text-center bg-slate-900 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAllFiles(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 px-3 rounded cursor-pointer"
              >
                Show all {filteredFiles.length} files...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Publish Confirmation notice */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            The GitHub repository will <strong>not</strong> be created yet. In the next step, you will authenticate and choose your repository name and visibility.
          </span>
        </div>

        <button
          type="button"
          disabled={!canPublish}
          onClick={onProceed}
          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-md transition-all ${
            canPublish
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Continue to GitHub</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
