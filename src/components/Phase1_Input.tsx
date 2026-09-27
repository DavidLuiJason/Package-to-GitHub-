import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileArchive,
  Sparkles,
  AlertTriangle,
  FolderTree,
  FileCode,
  ArrowRight,
  Layers,
  HardDrive,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { ArchivePackage } from '../services/archive/archiveReader';
import { SAMPLE_PROJECTS, generateSampleArchive } from '../services/archive/sampleProjects';

interface Phase1InputProps {
  onArchiveLoaded: (pkg: ArchivePackage) => void;
  currentPackage: ArchivePackage | null;
  onProceed: () => void;
}

export const Phase1_Input: React.FC<Phase1InputProps> = ({
  onArchiveLoaded,
  currentPackage,
  onProceed,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage('Please select a valid .zip archive file.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const pkg = await ArchivePackage.fromFile(file);
      onArchiveLoaded(pkg);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read ZIP archive. The file may be corrupt or encrypted.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleLoadSample = async (sampleId: string) => {
    setLoadingSampleId(sampleId);
    setErrorMessage(null);
    try {
      const pkg = await generateSampleArchive(sampleId);
      onArchiveLoaded(pkg);
    } catch (err: any) {
      setErrorMessage(`Failed to load sample project: ${err.message}`);
    } finally {
      setLoadingSampleId(null);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Hero Headline */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Package to GitHub
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Turn your project package ZIP into a real, clean GitHub repository with all files directly extracted to the root.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,application/zip"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-transform">
            {isLoading ? (
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-semibold text-slate-200">
              {isLoading
                ? 'Inspecting ZIP archive...'
                : 'Drop your project ZIP file here'}
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              or click to browse from your device
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FileArchive className="w-3.5 h-3.5" /> .zip archives supported
            </span>
            <span>•</span>
            <span>Files extracted to repository root</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Archive Error:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Sample Projects for Quick Testing */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Instant Test Packages
          </div>
          <span className="text-[11px] text-slate-500">
            Click to load a ready-made project ZIP
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PROJECTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isLoading || loadingSampleId !== null}
              onClick={() => handleLoadSample(sample.id)}
              className="text-left p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300">
                    {sample.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {sample.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                <span>{loadingSampleId === sample.id ? 'Loading...' : 'Load Package'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Package Overview Card */}
      {currentPackage && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileArchive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                  {currentPackage.fileName}
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Inspected
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Archive Size: {formatBytes(currentPackage.fileSizeBytes)} • Detected Type:{' '}
                  <span className="font-medium text-slate-300">
                    {currentPackage.inspection.validation.detectedProjectType}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceed}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <span>Inspect Package</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <FileCode className="w-3.5 h-3.5" />
                Files
              </div>
              <div className="text-xl font-bold text-slate-100">
                {currentPackage.inspection.filesOnly.length}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <FolderTree className="w-3.5 h-3.5" />
                Folders
              </div>
              <div className="text-xl font-bold text-slate-100">
                {currentPackage.inspection.validation.stats.totalFolders}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <HardDrive className="w-3.5 h-3.5" />
                Extracted Size
              </div>
              <div className="text-xl font-bold text-slate-100">
                {formatBytes(currentPackage.inspection.validation.stats.totalUncompressedBytes)}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Layers className="w-3.5 h-3.5" />
                Detected Root
              </div>
              <div className="text-sm font-bold text-slate-100 truncate" title={currentPackage.inspection.rootInfo.detectedRoot || '(Root)'}>
                {currentPackage.inspection.rootInfo.detectedRoot || 'Direct Root'}
              </div>
            </div>
          </div>

          {/* Detected outer wrapper notice */}
          {currentPackage.inspection.rootInfo.hasWrapperFolder && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Outer wrapper folder <strong className="font-mono text-amber-300">{currentPackage.inspection.rootInfo.detectedRoot}</strong> detected. Pack2Git can automatically strip it to place files at the repository root.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
