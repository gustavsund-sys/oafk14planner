import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Player } from './Player';

export const Pitch = ({ playersOnPitch }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'pitch',
  });

  return (
    <div className="pitch-container">
      <div
        ref={setNodeRef}
        className={`football-pitch ${isOver ? 'ring-2 ring-green-400' : ''}`}
        data-testid="football-pitch"
      >
        {/* Pitch markings */}
        <div className="pitch-markings">
          {/* Center line */}
          <div className="center-line" />
          
          {/* Center circle */}
          <div className="center-circle" />
          <div className="center-dot" />
          
          {/* Top penalty area */}
          <div className="penalty-area penalty-area-top" />
          <div className="goal-area goal-area-top" />
          <div className="goal goal-top" />
          <div className="penalty-arc penalty-arc-top" />
          
          {/* Bottom penalty area */}
          <div className="penalty-area penalty-area-bottom" />
          <div className="goal-area goal-area-bottom" />
          <div className="goal goal-bottom" />
          <div className="penalty-arc penalty-arc-bottom" />
          
          {/* Corner arcs */}
          <div className="corner-arc corner-top-left" />
          <div className="corner-arc corner-top-right" />
          <div className="corner-arc corner-bottom-left" />
          <div className="corner-arc corner-bottom-right" />
        </div>

        {/* Players on pitch */}
        <div className="players-zone">
          {playersOnPitch.map((playerData) => (
            <div
              key={playerData.player.id}
              className="player-on-pitch-wrapper"
              style={{
                left: `${playerData.x}%`,
                top: `${playerData.y}%`,
              }}
            >
              <Player player={playerData.player} isOnPitch={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
