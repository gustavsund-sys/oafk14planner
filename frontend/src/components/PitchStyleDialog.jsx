import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { PaintBucket } from '@phosphor-icons/react';

const pitchStyles = [
  {
    id: 'classic',
    name: 'Klassisk',
    description: 'Traditionell grön med ränder',
    background: '#2d5a27',
    stripes: 'repeating-linear-gradient(180deg, transparent 0px, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)',
    lineColor: 'rgba(255, 255, 255, 0.9)',
    shadow: '0 0 0 3px rgba(255,255,255,0.3)',
  },
  {
    id: 'premier',
    name: 'Premier League',
    description: 'Ljusgrön med tydliga ränder',
    background: '#3a8f3a',
    stripes: 'repeating-linear-gradient(180deg, rgba(50,120,50,1) 0px, rgba(50,120,50,1) 22px, rgba(60,140,60,1) 22px, rgba(60,140,60,1) 44px)',
    lineColor: 'rgba(255, 255, 255, 1)',
    shadow: '0 0 0 4px #1a4a1a',
  },
  {
    id: 'natural',
    name: 'Naturlig gräsmatta',
    description: 'Realistisk med textur',
    background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #2e7d32 100%)',
    stripes: `
      repeating-linear-gradient(180deg, transparent 0px, transparent 18px, rgba(0,0,0,0.08) 18px, rgba(0,0,0,0.08) 36px),
      repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)
    `,
    lineColor: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 0 0 3px #1b5e20, 0 10px 40px rgba(0,0,0,0.4)',
  },
  {
    id: 'evening',
    name: 'Kvällsmatch',
    description: 'Mörk med strålkastarljus',
    background: 'linear-gradient(180deg, #1a472a 0%, #1e5631 50%, #1a472a 100%)',
    stripes: `
      repeating-linear-gradient(180deg, transparent 0px, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 40px),
      radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)
    `,
    lineColor: 'rgba(255, 255, 255, 0.85)',
    shadow: '0 0 0 3px rgba(255,255,255,0.15), 0 0 60px rgba(0,0,0,0.6)',
  },
  {
    id: 'retro',
    name: 'Retro 90-tal',
    description: 'Klassisk look från 90-talet',
    background: '#2a6e2a',
    stripes: 'repeating-linear-gradient(180deg, #2a6e2a 0px, #2a6e2a 24px, #256025 24px, #256025 48px)',
    lineColor: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 0 0 5px #1a4a1a, 0 0 0 8px #0d2d0d',
  },
  {
    id: 'modern',
    name: 'Modern Arena',
    description: 'Ren och skarp design',
    background: 'linear-gradient(180deg, #28a745 0%, #218838 100%)',
    stripes: 'none',
    lineColor: 'rgba(255, 255, 255, 1)',
    shadow: '0 0 0 2px rgba(255,255,255,0.5), 0 20px 50px rgba(0,0,0,0.3)',
  },
];

export const PitchStyleDialog = ({ currentStyle, onStyleChange }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (style) => {
    onStyleChange(style);
    localStorage.setItem('pitchStyle', style.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="pitch-style-button"
          title="Byt plandesign"
        >
          <PaintBucket size={20} weight="bold" className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#171717] border-white/10 text-white max-w-[340px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Välj plandesign</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 py-2 max-h-[60vh] overflow-y-auto">
          {pitchStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleSelect(style)}
              className={`p-2 rounded-xl border-2 transition-all ${
                currentStyle?.id === style.id 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {/* Mini pitch preview */}
              <div 
                className="w-full aspect-[68/70] rounded-lg mb-2 relative overflow-hidden"
                style={{
                  background: style.background,
                  boxShadow: style.shadow,
                }}
              >
                {/* Stripes overlay */}
                <div 
                  className="absolute inset-0"
                  style={{ background: style.stripes }}
                />
                {/* Mini pitch lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ borderColor: style.lineColor, borderWidth: '1px' }}
                  />
                </div>
                <div 
                  className="absolute left-2 right-2 top-1/2 h-px"
                  style={{ backgroundColor: style.lineColor }}
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{style.name}</div>
                <div className="text-xs text-white/50">{style.description}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { pitchStyles };
