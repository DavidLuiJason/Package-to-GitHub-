import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Trash2,
  ArrowLeft,
  ExternalLink,
  FolderGit2,
  ShieldAlert,
} from 'lucide-react';
import { PublishProgress } from '../types/github';
import { GitHubClient } from '../services/github/githubClient';

interface FailureViewProps {
  progress: PublishProgress;
  client: GitHubClient | null;
  onRetry: () => void;
  onBackToConfig: () => void;
  onReset: () => void;
}

export const FailureView: React.FC<FailureViewProps> = ({
  progress,
  client,
  onRetry,
  onBackToConfig,
  onReset,
}) => {
  const [isDeletingRepo, setIsDeletingRepo] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const hasPartialRepo = Boolean(progress.createdRepo);

  const handleDeletePartialRepo = async () => {
    if (!client || !progress.createdRepo) return;

    if (
      !window.confirm(
        `Are you sure you want to delete the incomplete repository "${progress.createdRepo.full_name}" from GitHub?`
      )
    ) {
      return;
    }

    setIsDeletingRepo(true);
    setDeleteMessage(null);

    try {
      await client.deleteRepository(
        progress.createdRepo.owner.login,
        progress.createdRepo.name
      );
      setDeleteMessage(`Repository "${progress.createdRepo.full_name}" was successfully deleted.`);
    } catch (err: any) {
      setDeleteMessage(`Failed to delete repository: ${err.message}. You can delete it manually on GitHub.`);
    } finally {
      setIsDeletingRepo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      {/* Failure Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Publishing Interrupted
        </h2>
        <p className="text-sm text-slate-400">
          The operation could not be completed. Below is the exact state of your project and GitHub account.
        </p>
      </div>

      {/* Main Error Details Card */}
      <div className="bg-slate-900 border border-rose-800/60 rounded-2xl p-6 space-y-5 shadow-xl">
        {/* Error message */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            1. What Failed
          </span>
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs sm:text-sm font-mono leading-relaxed break-words">
            {progress.errorMessage || 'An unknown error occurred during publication.'}
          </div>
        </div>

        {/* State Report */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            2. What Has Already Happened
          </span>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span>GitHub Authentication:</span>
              <span className="text-emerald-400 font-semibold">Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <span>GitHub Repository Creation:</span>
              <span className={hasPartialRepo ? 'text-amber-400 font-semibold' : 'text-slate-500 font-semibold'}>
                {hasPartialRepo ? 'Created' : 'Not created'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Files Uploaded:</span>
              <span className="text-slate-300 font-mono">
                {progress.uploadedFilesCount} of {progress.totalFilesCount} files
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Git Commit & Verification:</span>
              <span className="text-rose-400 font-semibold">Not Completed</span>
            </div>
          </div>
        </div>

        {/* Partial Repo Notice */}
        {hasPartialRepo && (
          <div className="space-y-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Partial State Notice</span>
            </div>
            <p className="leading-relaxed">
              The empty repository <strong>{progress.createdRepo?.full_name}</strong> was created on GitHub before the failure occurred. You can safely retry or clean up below.
            </p>
            {progress.createdRepo?.html_url && (
              <a
                href={progress.createdRepo.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:underline pt-1"
              >
                <span>View incomplete repository on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {deleteMessage && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            {deleteMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Publishing</span>
          </button>

          {hasPartialRepo && !deleteMessage && (
            <button
              type="button"
              disabled={isDeletingRepo}
              onClick={handleDeletePartialRepo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeletingRepo ? 'Deleting...' : 'Delete Incomplete Repo'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToConfig}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Configure</span>
          </button>
        </div>
      </div>
    </div>
  );
};
