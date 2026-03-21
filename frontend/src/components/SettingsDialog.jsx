import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { GearSix } from '@phosphor-icons/react';

export const SettingsDialog = ({ targetPlayers, setTargetPlayers }) => {
  const options = [5, 7, 9, 11];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="settings-button"
        >
          <GearSix size={22} weight="bold" className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#171717] border-white/10 text-white max-w-[320px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Inställningar</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm text-white/70 mb-3 block">
            Antal spelare på planen
          </label>
          <div className="grid grid-cols-4 gap-2">
            {options.map((num) => (
              <button
                key={num}
                onClick={() => setTargetPlayers(num)}
                className={`
                  h-12 rounded-lg font-display text-xl font-bold transition-all
                  ${targetPlayers === num
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }
                `}
                data-testid={`target-players-${num}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
