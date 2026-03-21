import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Calendar } from '@phosphor-icons/react';

export const MatchInfoDialog = ({ matchInfo, setMatchInfo }) => {
  const [open, setOpen] = useState(false);
  const [opponent, setOpponent] = useState(matchInfo.opponent || '');
  const [date, setDate] = useState(matchInfo.date || '');
  const [time, setTime] = useState(matchInfo.time || '');

  const handleSave = () => {
    setMatchInfo({ opponent, date, time });
    setOpen(false);
  };

  const handleClear = () => {
    setOpponent('');
    setDate('');
    setTime('');
    setMatchInfo({ opponent: '', date: '', time: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="match-info-button"
        >
          <Calendar size={22} weight="bold" className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#171717] border-white/10 text-white max-w-[320px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Matchinfo</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm text-white/70 mb-2 block">
              Motståndare
            </label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Ange lagnamn..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
              data-testid="opponent-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Datum
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                data-testid="date-input"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Tid
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                data-testid="time-input"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleClear}
              className="flex-1 py-2 px-4 bg-white/10 text-white/70 rounded-lg font-medium hover:bg-white/20"
              data-testid="clear-match-info"
            >
              Rensa
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
              data-testid="save-match-info"
            >
              Spara
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
