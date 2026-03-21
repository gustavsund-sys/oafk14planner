import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

export const Player = ({ player, isOnPitch = false, style = {} }) => {
  const [showName, setShowName] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { player, isOnPitch },
  });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.15 : 1})`,
        zIndex: isDragging ? 100 : (isOnPitch ? 20 : 1),
        transition: isDragging ? 'none' : 'transform 0.2s ease',
      }
    : {};

  const handleClick = (e) => {
    if (isOnPitch && !isDragging) {
      e.stopPropagation();
      setShowName(prev => !prev);
      setTimeout(() => setShowName(false), 2000);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`draggable-player relative cursor-grab ${isDragging ? 'player-dragging' : ''}`}
      style={{ ...style, ...dragStyle }}
      data-testid={`player-${player.number}`}
      onClick={handleClick}
    >
      <div className={`relative ${isOnPitch ? 'player-on-pitch' : ''}`}>
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
        {showName && isOnPitch && (
          <div className="player-tooltip">
            {player.name}
          </div>
        )}
      </div>
    </div>
  );
};

export const PlayerCard = ({ player }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { player, isOnPitch: false },
  });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.15 : 1})`,
        zIndex: isDragging ? 100 : 1,
        transition: isDragging ? 'none' : 'transform 0.2s ease',
      }
    : {};

  // Get first name only for display
  const firstName = player.name.split(' ')[0];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`player-card draggable-player cursor-grab ${isDragging ? 'opacity-70' : ''}`}
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
