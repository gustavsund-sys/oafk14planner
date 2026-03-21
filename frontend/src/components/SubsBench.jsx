import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const SubPlayer = ({ player }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { player, isOnSubs: true },
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    scale: isDragging ? '1.1' : '1',
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const firstName = player.name.split(' ')[0];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="sub-player draggable-player"
      style={dragStyle}
      data-testid={`sub-player-${player.number}`}
    >
      <img
        src={player.image}
        alt={player.name}
        className="sub-avatar"
        draggable={false}
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=171717&color=fff&size=64`;
        }}
      />
      <div className="sub-number font-display">{player.number}</div>
      <div className="sub-name">{firstName}</div>
    </div>
  );
};

export const SubsBench = ({ players }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'subs',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`subs-bench ${isOver ? 'subs-bench-hover' : ''}`}
      data-testid="subs-bench"
    >
      <div className="subs-label">AVBYTARE</div>
      <div className="subs-list">
        {players.map((player) => (
          <SubPlayer key={player.id} player={player} />
        ))}
        {players.length === 0 && (
          <div className="subs-empty">
            Dra hit avbytare
          </div>
        )}
      </div>
    </div>
  );
};
