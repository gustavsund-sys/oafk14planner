import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Player } from './Player';

export const Pitch = ({ playersOnPitch, matchInfo, onPitchClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'pitch',
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  const handleClick = (e) => {
    // Only trigger if clicking on the pitch itself, not on players
    if (e.target.closest('[data-testid="football-pitch"]') === e.currentTarget) {
      onPitchClick?.();
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`football-pitch ${isOver ? 'ring-2 ring-green-400' : ''}`}
      data-testid="football-pitch"
      onClick={handleClick}
    >
      {/* Opponent info at top of pitch */}
      {matchInfo?.opponent && (
        <div className="opponent-overlay">
          <div className="opponent-name">{matchInfo.opponent}</div>
          {(matchInfo.date || matchInfo.time || matchInfo.location) && (
            <div className="match-datetime">
              {formatDate(matchInfo.date)} {matchInfo.time}
              {matchInfo.location && <span> • {matchInfo.location}</span>}
            </div>
          )}
        </div>
      )}

      {/* Scoreboard */}
      {(matchInfo?.homeScore !== null && matchInfo?.homeScore !== undefined) && (
        <div className="scoreboard">
          <div className="score-team">
            <span className="score-name">ÖA</span>
            <span className="score-value score-home">{matchInfo.homeScore}</span>
          </div>
          <span className="score-separator">-</span>
          <div className="score-team">
            <span className="score-value score-away">{matchInfo.awayScore ?? 0}</span>
            <span className="score-name">{matchInfo.opponent?.substring(0, 3).toUpperCase() || 'MOT'}</span>
          </div>
        </div>
      )}

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
  );
};
