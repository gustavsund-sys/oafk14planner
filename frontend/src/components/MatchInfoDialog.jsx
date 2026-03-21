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
  const [location, setLocation] = useState(matchInfo.location || '');
  const [homeScore, setHomeScore] = useState(matchInfo.homeScore ?? '');
  const [awayScore, setAwayScore] = useState(matchInfo.awayScore ?? '');

  const handleSave = () => {
    setMatchInfo({ 
      opponent, 
      date, 
      time, 
      location,
      homeScore: homeScore !== '' ? parseInt(homeScore) : null,
      awayScore: awayScore !== '' ? parseInt(awayScore) : null
    });
    setOpen(false);
  };

  const handleClear = () => {
    setOpponent('');
    setDate('');
    setTime('');
    setLocation('');
    setHomeScore('');
    setAwayScore('');
    setMatchInfo({ opponent: '', date: '', time: '', location: '', homeScore: null, awayScore: null });
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
          <div>
            <label className="text-sm text-white/70 mb-2 block">
              Plats
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ange arena/plats..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
              data-testid="location-input"
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
          
          {/* Resultat */}
          <div className="pt-2 border-t border-white/10">
            <label className="text-sm text-white/70 mb-2 block">
              Resultat (efter match)
            </label>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="text-xs text-white/50 mb-1">Östra Almby</div>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="-"
                  className="w-16 h-14 text-center text-2xl font-bold bg-green-500/20 border-2 border-green-500/50 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-green-500"
                  data-testid="home-score-input"
                />
              </div>
              <span className="text-2xl font-bold text-white/50">-</span>
              <div className="text-center">
                <div className="text-xs text-white/50 mb-1">{opponent || 'Motståndare'}</div>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="-"
                  className="w-16 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-green-500"
                  data-testid="away-score-input"
                />
              </div>
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
