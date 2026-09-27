import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepIndicator, AppStep } from './components/StepIndicator';
import { Phase1_Input } from './components/Phase1_Input';
import { Phase2_Preview } from './components/Phase2_Preview';
import { Phase3_Configure } from './components/Phase3_Configure';
import { Phase4_Publishing } from './components/Phase4_Publishing';
import { Phase5_Verified } from './components/Phase5_Verified';
import { FailureView } from './components/FailureView';
import { ManifestModal } from './components/ManifestModal';
import { ArchivePackage } from './services/archive/archiveReader';
import { GitHubClient } from './services/github/githubClient';
import { GitHubUser, PublishConfig, PublishProgress } from './types/github';
import { ProjectPublisher } from './services/publisher/publisher';
import { ProjectManifest } from './types/archive';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [archivePackage, setArchivePackage] = useState<ArchivePackage | null>(null);

  // GitHub Auth in-memory state
  const [gitHubClient, setGitHubClient] = useState<GitHubClient | null>(null);
  const [gitHubUser, setGitHubUser] = useState<GitHubUser | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | undefined>(undefined);

  // Publishing & Progress state
  const [publishProgress, setPublishProgress] = useState<PublishProgress | null>(null);
  const [activePublisher, setActivePublisher] = useState<ProjectPublisher | null>(null);
  const [lastConfig, setLastConfig] = useState<PublishConfig | null>(null);
  const [finalManifest, setFinalManifest] = useState<ProjectManifest | null>(null);
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  // Handle Token Connect
  const handleConnectToken = async (token: string) => {
    const client = new GitHubClient(token);
    const user = await client.getAuthenticatedUser();
    const rate = await client.getRateLimit().catch(() => undefined);

    setGitHubClient(client);
    setGitHubUser(user);
    if (rate) setRateLimitRemaining(rate.remaining);
  };

  // Handle Token Disconnect
  const handleDisconnect = () => {
    setGitHubClient(null);
    setGitHubUser(null);
    setRateLimitRemaining(undefined);
  };

  // Handle Archive Selected
  const handleArchiveLoaded = (pkg: ArchivePackage) => {
    setArchivePackage(pkg);
    // Don't auto-jump immediately so user can see inspection overview card in Phase 1
  };

  // Handle Root Stripping toggle
  const handleUpdateRootStripping = (strip: boolean) => {
    if (!archivePackage) return;
    archivePackage.updateRootStripping(strip);
    // Clone instance reference to trigger React re-render
    setArchivePackage(Object.assign(Object.create(Object.getPrototypeOf(archivePackage)), archivePackage));
  };

  // Handle Start Publishing
  const handleStartPublish = async (config: PublishConfig) => {
    if (!gitHubClient || !archivePackage) return;

    setLastConfig(config);
    setCurrentStep('publishing');

    const publisher = new ProjectPublisher(gitHubClient, archivePackage, config);
    setActivePublisher(publisher);

    try {
      const result = await publisher.publish({
        onProgress: (progress) => {
          setPublishProgress(progress);
        },
      });

      setFinalManifest(result.manifest);
      setCurrentStep('verified');
    } catch (err: any) {
      // Progress error state is updated inside publisher onProgress
      console.error('Publish error:', err);
    }
  };

  // Handle Cancel
  const handleCancelPublish = () => {
    if (activePublisher) {
      activePublisher.cancel();
    }
  };

  // Reset entire flow
  const handleReset = () => {
    setArchivePackage(null);
    setPublishProgress(null);
    setActivePublisher(null);
    setLastConfig(null);
    setFinalManifest(null);
    setCurrentStep('input');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        user={gitHubUser}
        onDisconnect={handleDisconnect}
        onReset={handleReset}
        rateLimitRemaining={rateLimitRemaining}
      />

      {/* Workflow Step Breadcrumbs */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        canNavigateToPreview={Boolean(archivePackage)}
        canNavigateToConfigure={Boolean(archivePackage && archivePackage.inspection.validation.canPublish)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Step 1: Input */}
        {currentStep === 'input' && (
          <Phase1_Input
            currentPackage={archivePackage}
            onArchiveLoaded={handleArchiveLoaded}
            onProceed={() => setCurrentStep('preview')}
          />
        )}

        {/* Step 2: Preview & Validation */}
        {currentStep === 'preview' && archivePackage && (
          <Phase2_Preview
            pkg={archivePackage}
            onUpdateRootStripping={handleUpdateRootStripping}
            onBack={() => setCurrentStep('input')}
            onProceed={() => setCurrentStep('configure')}
          />
        )}

        {/* Step 3: Configure GitHub & Repo */}
        {currentStep === 'configure' && archivePackage && (
          <Phase3_Configure
            pkg={archivePackage}
            client={gitHubClient}
            user={gitHubUser}
            onConnectToken={handleConnectToken}
            onDisconnect={handleDisconnect}
            onBack={() => setCurrentStep('preview')}
            onStartPublish={handleStartPublish}
          />
        )}

        {/* Step 4: Publishing Progress OR Failure */}
        {currentStep === 'publishing' && publishProgress && (
          <>
            {publishProgress.phase === 'failed' ? (
              <FailureView
                progress={publishProgress}
                client={gitHubClient}
                onRetry={() => lastConfig && handleStartPublish(lastConfig)}
                onBackToConfig={() => setCurrentStep('configure')}
                onReset={handleReset}
              />
            ) : (
              <Phase4_Publishing
                progress={publishProgress}
                onCancel={handleCancelPublish}
              />
            )}
          </>
        )}

        {/* Step 5: Verified Result */}
        {currentStep === 'verified' && finalManifest && publishProgress?.verification && (
          <Phase5_Verified
            manifest={finalManifest}
            verification={publishProgress.verification}
            onPublishAnother={handleReset}
            onViewManifest={() => setIsManifestOpen(true)}
          />
        )}
      </main>

      {/* Internal Manifest Viewer Modal */}
      <ManifestModal
        manifest={finalManifest}
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Pack2Git</span>
            <span>•</span>
            <span>Package to GitHub Publisher</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">No passwords or tokens stored</span>
            <span>•</span>
            <span className="text-slate-400">Preserves repository root structure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
