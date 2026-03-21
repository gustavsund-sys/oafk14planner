import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PlayerCard } from './Player';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

export const Bench = ({ players, isCollapsed, onToggleCollapse }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bench',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bench-container ${isOver ? 'bg-white/5' : ''}`}
      data-testid="player-bench"
    >
      {/* Toggle button at top center */}
      <button
        onClick={onToggleCollapse}
        className="bench-toggle-top"
        data-testid="bench-toggle"
      >
        {isCollapsed ? (
          <CaretUp size={24} weight="bold" />
        ) : (
          <CaretDown size={24} weight="bold" />
        )}
      </button>

      <div className={`bench-grid-wrapper ${isCollapsed ? 'bench-grid-collapsed' : ''}`}>
        <div className="bench-grid">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
          {players.length === 0 && (
            <div className="col-span-full flex items-center justify-center text-white/40 text-sm py-2">
              Alla spelare är på planen
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
