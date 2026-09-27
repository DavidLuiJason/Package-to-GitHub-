import React from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FolderGit2,
  ShieldCheck,
  RefreshCw,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { PublishProgress } from '../types/github';

interface Phase4PublishingProps {
  progress: PublishProgress;
  onCancel: () => void;
}

export const Phase4_Publishing: React.FC<Phase4PublishingProps> = ({
  progress,
  onCancel,
}) => {
  const steps = [
    {
      id: 'auth_and_check',
      label: 'Authenticate & Verify Name',
      isDone: progress.currentStep > 2,
      isActive: progress.phase === 'authenticating' || progress.phase === 'checking_repo',
    },
    {
      id: 'create_repo',
      label: 'Create GitHub Repository',
      isDone: progress.currentStep > 3,
      isActive: progress.phase === 'creating_repo',
    },
    {
      id: 'upload_blobs',
      label: `Upload Project Files (${progress.uploadedFilesCount} / ${progress.totalFilesCount})`,
      isDone: progress.currentStep > 4,
      isActive: progress.phase === 'uploading_blobs',
    },
    {
      id: 'create_commit',
      label: 'Build Git Tree & Commit',
      isDone: progress.currentStep > 5,
      isActive: progress.phase === 'building_tree' || progress.phase === 'creating_commit' || progress.phase === 'updating_ref',
    },
    {
      id: 'verification',
      label: 'Verify Repository Structure',
      isDone: progress.phase === 'completed',
      isActive: progress.phase === 'verifying',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
          <UploadCloud className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Publishing Project to GitHub...
        </h2>
        <p className="text-sm text-slate-400">
          Extracting files and committing directly to the new repository root
        </p>
      </div>

      {/* Main Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              {progress.phaseLabel}
            </span>
            <span className="text-indigo-400 font-mono text-sm">
              {progress.percent}%
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${Math.min(100, Math.max(2, progress.percent))}%` }}
            />
          </div>
        </div>

        {/* Current File Being Uploaded */}
        {progress.currentFile && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center gap-2.5">
            <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="truncate font-mono text-slate-300">
              <span className="text-slate-500">Blob: </span>
              {progress.currentFile}
            </div>
          </div>
        )}

        {/* Pipeline Step List */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pipeline Stages
          </div>
          <div className="space-y-2 font-mono text-xs">
            {steps.map((st) => (
              <div
                key={st.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  st.isDone
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : st.isActive
                    ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {st.isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : st.isActive ? (
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{st.label}</span>
                </div>

                <span className="text-[10px] uppercase font-sans font-semibold">
                  {st.isDone ? 'Completed' : st.isActive ? 'In Progress' : 'Waiting'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Partial State Notice */}
        {progress.createdRepo && (
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Target repo: <strong className="text-slate-100">{progress.createdRepo.full_name}</strong>
              </span>
            </div>
            <a
              href={progress.createdRepo.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Cancellation */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900 transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Publishing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
