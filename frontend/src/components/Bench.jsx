import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PlayerCard } from './Player';

export const Bench = ({ players }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bench',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bench-container ${isOver ? 'bg-white/5' : ''}`}
      data-testid="player-bench"
    >
      <div className="bench-scroll">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
        {players.length === 0 && (
          <div className="flex items-center justify-center w-full text-white/40 text-sm">
            Alla spelare är på planen
          </div>
        )}
      </div>
    </div>
  );
};
