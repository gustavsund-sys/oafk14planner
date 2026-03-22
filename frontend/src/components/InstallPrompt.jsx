import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { DownloadSimple, ShareNetwork, Plus } from '@phosphor-icons/react';

export const InstallPrompt = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt (Chrome/Android)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if we should show the prompt (not shown in last 7 days)
    const lastPrompt = localStorage.getItem('installPromptShown');
    if (!isStandalone && !lastPrompt) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptShown', Date.now().toString());
  };

  // Don't show if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Floating prompt that appears after 3 seconds */}
      {showPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-4 shadow-xl shadow-green-500/20">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <img src="/logo.png" alt="Östra Squad" className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm">Installera Östra Squad</h3>
                <p className="text-white/80 text-xs mt-0.5">
                  Lägg till på hemskärmen för helskärmsläge
                </p>
              </div>
              <button 
                onClick={dismissPrompt}
                className="text-white/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={dismissPrompt}
                className="flex-1 py-2 px-3 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30"
              >
                Senare
              </button>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex-1 py-2 px-3 bg-white text-green-600 text-sm font-bold rounded-lg hover:bg-white/90">
                    Visa hur
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#171717] border-white/10 text-white max-w-[340px]">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-center">
                      Installera appen
                    </DialogTitle>
                  </DialogHeader>
                  <InstallInstructions isIOS={isIOS} onInstall={handleInstallClick} deferredPrompt={deferredPrompt} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}

      {/* Manual install button in header */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
            data-testid="install-app-button"
            title="Installera appen"
          >
            <DownloadSimple size={18} weight="bold" className="text-white" />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-[#171717] border-white/10 text-white max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">
              Installera appen
            </DialogTitle>
          </DialogHeader>
          <InstallInstructions isIOS={isIOS} onInstall={handleInstallClick} deferredPrompt={deferredPrompt} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const InstallInstructions = ({ isIOS, onInstall, deferredPrompt }) => {
  // If we have a deferred prompt (Chrome/Android), show direct install button
  if (deferredPrompt) {
    return (
      <div className="py-4 space-y-4">
        <p className="text-white/70 text-center text-sm">
          Installera appen för snabbare åtkomst och helskärmsläge.
        </p>
        <button
          onClick={onInstall}
          className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
        >
          <Plus size={20} weight="bold" />
          Installera nu
        </button>
      </div>
    );
  }

  // iOS instructions
  if (isIOS) {
    return (
      <div className="py-4 space-y-6">
        <p className="text-white/70 text-center text-sm">
          Följ dessa steg för att lägga till appen på din hemskärm:
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <div className="flex-1 pt-2">
              <p className="text-white text-sm">
                Tryck på <ShareNetwork size={18} weight="fill" className="inline text-blue-400 mx-1" /> <strong>Dela-knappen</strong> i Safari
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">2</span>
            </div>
            <div className="flex-1 pt-2">
              <p className="text-white text-sm">
                Scrolla ner och välj <strong>"Lägg till på hemskärmen"</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 font-bold">3</span>
            </div>
            <div className="flex-1 pt-2">
              <p className="text-white text-sm">
                Tryck <strong>"Lägg till"</strong> - klart!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#171717] rounded-xl flex items-center justify-center border border-white/10">
            <img src="/logo.png" alt="Östra Squad" className="w-8 h-8" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Östra Squad</p>
            <p className="text-white/50 text-xs">Visas på din hemskärm</p>
          </div>
        </div>
      </div>
    );
  }

  // Generic instructions (Android Chrome, etc.)
  return (
    <div className="py-4 space-y-6">
      <p className="text-white/70 text-center text-sm">
        Lägg till appen på din hemskärm för helskärmsläge:
      </p>
      
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 font-bold">1</span>
          </div>
          <div className="flex-1 pt-2">
            <p className="text-white text-sm">
              Öppna webbläsarens <strong>meny</strong> (⋮)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 font-bold">2</span>
          </div>
          <div className="flex-1 pt-2">
            <p className="text-white text-sm">
              Välj <strong>"Installera app"</strong> eller <strong>"Lägg till på hemskärmen"</strong>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 font-bold">3</span>
          </div>
          <div className="flex-1 pt-2">
            <p className="text-white text-sm">
              Bekräfta installationen - klart!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
        <div className="w-12 h-12 bg-[#171717] rounded-xl flex items-center justify-center border border-white/10">
          <img src="/logo.png" alt="Östra Squad" className="w-8 h-8" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">Östra Squad</p>
          <p className="text-white/50 text-xs">Körs i helskärmsläge</p>
        </div>
      </div>
    </div>
  );
};
