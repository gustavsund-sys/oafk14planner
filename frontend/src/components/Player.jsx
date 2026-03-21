import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const Player = ({ player, isOnPitch = false, style = {} }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { player, isOnPitch },
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    scale: isDragging ? '1.15' : '1',
    zIndex: isDragging ? 100 : (isOnPitch ? 20 : 1),
    transition: isDragging ? 'scale 0.1s' : 'transform 0.15s ease, scale 0.1s',
    opacity: isDragging ? 0.9 : 1,
  };

  // Get first name only for display on pitch
  const firstName = player.name.split(' ')[0];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`draggable-player relative ${isDragging ? 'player-dragging' : ''}`}
      style={{ ...style, ...dragStyle }}
      data-testid={`player-${player.number}`}
    >
      <div className={`relative ${isOnPitch ? 'player-on-pitch-avatar' : ''}`}>
        <img
          src={player.image}
          alt={player.name}
          className={isOnPitch ? 'player-avatar-large' : 'player-avatar'}
          draggable={false}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=171717&color=fff&size=96`;
          }}
        />
        <div className={isOnPitch ? 'player-number-large font-display' : 'player-number font-display'}>{player.number}</div>
      </div>
      {isOnPitch && (
        <div className="player-pitch-name">{firstName}</div>
      )}
    </div>
  );
};

export const PlayerCard = ({ player }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { player, isOnPitch: false },
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    scale: isDragging ? '1.15' : '1',
    zIndex: isDragging ? 100 : 1,
    transition: isDragging ? 'scale 0.1s' : 'transform 0.15s ease, scale 0.1s',
    opacity: isDragging ? 0.8 : 1,
  };

  // Get first name only for display
  const firstName = player.name.split(' ')[0];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`player-card draggable-player ${isDragging ? 'dragging' : ''}`}
      style={dragStyle}
      data-testid={`bench-player-${player.number}`}
    >
      <div className="relative">
        <img
          src={player.image}
          alt={player.name}
          className="player-avatar"
          draggable={false}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=171717&color=fff&size=96`;
          }}
        />
        <div className="player-number font-display">{player.number}</div>
      </div>
      <span className="player-name">{firstName}</span>
    </div>
  );
};
