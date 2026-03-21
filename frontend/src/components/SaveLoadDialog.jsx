import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { FloppyDisk, Folder, Trash, Share, Download } from '@phosphor-icons/react';

export const SaveLoadDialog = ({ 
  currentSquad, 
  onLoadSquad,
  playersOnPitch,
  playersOnSubs,
  matchInfo
}) => {
  const [open, setOpen] = useState(false);
  const [squadName, setSquadName] = useState('');
  const [savedSquads, setSavedSquads] = useState([]);
  const [activeTab, setActiveTab] = useState('save');
  const [importCode, setImportCode] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    loadSavedSquads();
    // Check if there's a shared squad in URL
    checkUrlForSharedSquad();
  }, []);

  useEffect(() => {
    loadSavedSquads();
  }, [open]);

  const checkUrlForSharedSquad = () => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('squad');
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData));
        onLoadSquad(decoded);
        // Clear URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Failed to load shared squad');
      }
    }
  };

  const loadSavedSquads = () => {
    const saved = localStorage.getItem('ostraSquads');
    if (saved) {
      setSavedSquads(JSON.parse(saved));
    }
  };

  const handleSave = () => {
    if (!squadName.trim()) return;

    const newSquad = {
      id: Date.now(),
      name: squadName.trim(),
      playersOnPitch,
      playersOnSubs,
      matchInfo,
      savedAt: new Date().toISOString()
    };

    const updated = [...savedSquads, newSquad];
    localStorage.setItem('ostraSquads', JSON.stringify(updated));
    setSavedSquads(updated);
    setSquadName('');
    setActiveTab('load');
  };

  const handleLoad = (squad) => {
    onLoadSquad(squad);
    setOpen(false);
  };

  const handleDelete = (squadId) => {
    const updated = savedSquads.filter(s => s.id !== squadId);
    localStorage.setItem('ostraSquads', JSON.stringify(updated));
    setSavedSquads(updated);
  };

  const handleShare = (squad) => {
    const shareData = {
      name: squad.name,
      playersOnPitch: squad.playersOnPitch,
      playersOnSubs: squad.playersOnSubs,
      matchInfo: squad.matchInfo
    };
    const encoded = btoa(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?squad=${encoded}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareMessage('Länk kopierad!');
      setTimeout(() => setShareMessage(''), 2000);
    });
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    
    try {
      // Try to parse as URL first
      let data;
      if (importCode.includes('?squad=')) {
        const url = new URL(importCode);
        const squadParam = url.searchParams.get('squad');
        data = JSON.parse(atob(squadParam));
      } else {
        // Try direct base64
        data = JSON.parse(atob(importCode));
      }
      
      onLoadSquad(data);
      setImportCode('');
      setOpen(false);
    } catch (e) {
      alert('Kunde inte importera squad. Kontrollera länken/koden.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="save-load-button"
        >
          <Folder size={22} weight="bold" className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#171717] border-white/10 text-white max-w-[340px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Sparade Squads</DialogTitle>
        </DialogHeader>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setActiveTab('save')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'save' 
                ? 'bg-green-500 text-white' 
                : 'bg-white/10 text-white/70'
            }`}
          >
            Spara
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'load' 
                ? 'bg-green-500 text-white' 
                : 'bg-white/10 text-white/70'
            }`}
          >
            Ladda ({savedSquads.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'import' 
                ? 'bg-green-500 text-white' 
                : 'bg-white/10 text-white/70'
            }`}
          >
            Importera
          </button>
        </div>

        {activeTab === 'save' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Namn på squad
              </label>
              <input
                type="text"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                placeholder="T.ex. Match mot AIK..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                data-testid="squad-name-input"
              />
            </div>
            <div className="text-xs text-white/50">
              Sparar: {playersOnPitch.length} på plan, {playersOnSubs.length} avbytare
              {matchInfo?.opponent && `, vs ${matchInfo.opponent}`}
            </div>
            <button
              onClick={handleSave}
              disabled={!squadName.trim()}
              className="w-full py-2.5 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="save-squad-button"
            >
              <FloppyDisk size={18} weight="bold" />
              Spara squad
            </button>
          </div>
        )}

        {activeTab === 'load' && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {shareMessage && (
              <div className="text-center text-green-400 text-sm py-2 bg-green-500/10 rounded-lg">
                {shareMessage}
              </div>
            )}
            {savedSquads.length === 0 ? (
              <div className="text-center text-white/40 py-8">
                Inga sparade squads ännu
              </div>
            ) : (
              savedSquads.map((squad) => (
                <div
                  key={squad.id}
                  className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{squad.name}</div>
                    <div className="text-xs text-white/50">
                      {squad.playersOnPitch?.length || 0} spelare • {formatDate(squad.savedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleShare(squad)}
                    className="p-1.5 text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                    title="Dela"
                  >
                    <Share size={18} />
                  </button>
                  <button
                    onClick={() => handleLoad(squad)}
                    className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium hover:bg-green-500/30"
                    data-testid={`load-squad-${squad.id}`}
                  >
                    Ladda
                  </button>
                  <button
                    onClick={() => handleDelete(squad.id)}
                    className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded"
                    data-testid={`delete-squad-${squad.id}`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Klistra in delad länk
              </label>
              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Klistra in länk från någon som delat en squad..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 h-24 resize-none text-sm"
                data-testid="import-code-input"
              />
            </div>
            <button
              onClick={handleImport}
              disabled={!importCode.trim()}
              className="w-full py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="import-squad-button"
            >
              <Download size={18} weight="bold" />
              Importera squad
            </button>
            <p className="text-xs text-white/40 text-center">
              Be någon dela sin squad och klistra in länken här
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
