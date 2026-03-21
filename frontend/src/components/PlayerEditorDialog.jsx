import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Users, Pencil, Trash, Plus, Camera } from '@phosphor-icons/react';

export const PlayerEditorDialog = ({ players, setPlayers }) => {
  const [open, setOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setName(player.name);
    setNumber(player.number.toString());
    setImageUrl(player.image || '');
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setEditingPlayer(null);
    setName('');
    setNumber('');
    setImageUrl('');
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (!name.trim() || !number) return;

    if (editingPlayer) {
      // Update existing player
      setPlayers(prev => prev.map(p => 
        p.id === editingPlayer.id 
          ? { ...p, name: name.trim(), number: parseInt(number), image: imageUrl || p.image }
          : p
      ));
    } else {
      // Add new player
      const newPlayer = {
        id: Date.now(),
        name: name.trim(),
        number: parseInt(number),
        image: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=171717&color=fff&size=96`
      };
      setPlayers(prev => [...prev, newPlayer]);
    }

    setEditingPlayer(null);
    setShowAddForm(false);
    setName('');
    setNumber('');
    setImageUrl('');
  };

  const handleDelete = (playerId) => {
    if (window.confirm('Vill du ta bort denna spelare?')) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
    setShowAddForm(false);
    setName('');
    setNumber('');
    setImageUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="player-editor-button"
        >
          <Users size={22} weight="bold" className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#171717] border-white/10 text-white max-w-[340px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Hantera spelare</DialogTitle>
        </DialogHeader>
        
        {(editingPlayer || showAddForm) ? (
          <div className="space-y-4 py-2">
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-green-500 transition-colors">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <Camera size={28} className="text-white/40" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                  <Pencil size={14} className="text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Namn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Spelarens namn..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Nummer</label>
              <input
                type="number"
                min="1"
                max="99"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Tröjnummer..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Bild-URL (valfritt)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelEdit}
                className="flex-1 py-2 px-4 bg-white/10 text-white/70 rounded-lg font-medium hover:bg-white/20"
              >
                Avbryt
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || !number}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
              >
                {editingPlayer ? 'Spara' : 'Lägg till'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleAdd}
              className="w-full py-2.5 px-4 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 flex items-center justify-center gap-2 mb-3"
            >
              <Plus size={18} weight="bold" />
              Lägg till spelare
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                >
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=171717&color=fff&size=96`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{player.name}</div>
                    <div className="text-xs text-white/50">#{player.number}</div>
                  </div>
                  <button
                    onClick={() => handleEdit(player)}
                    className="p-2 text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(player.id)}
                    className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-white/40 text-center pt-2">
              {players.length} spelare totalt
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
