import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { FloppyDisk, Folder, Trash, Share, Download, Copy } from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

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
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedSquads();
  }, [open]);

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

  const handleShare = async (squad) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/squads/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: squad.name,
          playersOnPitch: squad.playersOnPitch,
          playersOnSubs: squad.playersOnSubs,
          matchInfo: squad.matchInfo
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setShareCode(data.code);
        navigator.clipboard.writeText(data.code).then(() => {
          setShareMessage(`Kod kopierad: ${data.code}`);
        }).catch(() => {
          setShareMessage(`Dela koden: ${data.code}`);
        });
        setTimeout(() => setShareMessage(''), 5000);
      } else {
        setShareMessage('Kunde inte dela. Försök igen.');
        setTimeout(() => setShareMessage(''), 3000);
      }
    } catch (e) {
      console.error('Share error:', e);
      setShareMessage('Kunde inte dela. Försök igen.');
      setTimeout(() => setShareMessage(''), 3000);
    }
    setIsLoading(false);
  };

  const handleImport = async () => {
    if (!importCode.trim()) return;
    
    setIsLoading(true);
    try {
      // Clean up the code
      let code = importCode.trim().toUpperCase();
      if (!code.startsWith('OSTRA-')) {
        code = `OSTRA-${code}`;
      }
      
      const response = await fetch(`${API_URL}/api/squads/${encodeURIComponent(code)}`);
      
      if (response.ok) {
        const data = await response.json();
        onLoadSquad(data);
        setImportCode('');
        setShareMessage('Squad importerad!');
        setTimeout(() => {
          setShareMessage('');
          setOpen(false);
        }, 1500);
      } else {
        setShareMessage('Hittade ingen squad med den koden.');
        setTimeout(() => setShareMessage(''), 3000);
      }
    } catch (e) {
      console.error('Import error:', e);
      setShareMessage('Kunde inte importera. Kontrollera koden.');
      setTimeout(() => setShareMessage(''), 3000);
    }
    setIsLoading(false);
  };

  const copyCode = () => {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
      setShareMessage('Kod kopierad!');
      setTimeout(() => setShareMessage(''), 2000);
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

        {shareMessage && (
          <div className={`text-center text-sm py-2 px-3 rounded-lg mb-3 ${
            shareMessage.includes('Kod') || shareMessage.includes('importerad') || shareMessage.includes('kopierad')
              ? 'text-green-400 bg-green-500/10' 
              : 'text-red-400 bg-red-500/10'
          }`}>
            {shareMessage}
            {shareCode && shareMessage.includes('Dela') && (
              <button onClick={copyCode} className="ml-2 p-1 hover:bg-white/10 rounded">
                <Copy size={16} />
              </button>
            )}
          </div>
        )}

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
                    disabled={isLoading}
                    className="p-1.5 text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/10 rounded disabled:opacity-50"
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
                Ange delningskod
              </label>
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                placeholder="T.ex. OSTRA-A7K2"
                className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 text-center text-lg font-mono tracking-wider"
                data-testid="import-code-input"
              />
            </div>
            <button
              onClick={handleImport}
              disabled={!importCode.trim() || isLoading}
              className="w-full py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="import-squad-button"
            >
              <Download size={18} weight="bold" />
              {isLoading ? 'Laddar...' : 'Importera squad'}
            </button>
            <p className="text-xs text-white/40 text-center">
              Be någon dela sin squad så får du en kort kod
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
