import React, { useRef, useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PlayerCard } from './Player';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

export const Bench = ({ players }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bench',
  });
  const scrollRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Check if there are more than 12 players (2 rows)
    setShowMore(players.length > 12);
  }, [players]);

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: 80,
        behavior: 'smooth'
      });
    }
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: -80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`bench-container ${isOver ? 'bg-white/5' : ''}`}
      data-testid="player-bench"
    >
      <div 
        ref={scrollRef}
        className="bench-grid-wrapper"
      >
        <div className="bench-grid">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
          {players.length === 0 && (
            <div className="col-span-full flex items-center justify-center text-white/40 text-sm py-4">
              Alla spelare är på planen
            </div>
          )}
        </div>
      </div>
      
      {showMore && (
        <div className="scroll-arrows">
          <button onClick={scrollUp} className="scroll-arrow" data-testid="scroll-up">
            <CaretUp size={20} weight="bold" />
          </button>
          <button onClick={scrollDown} className="scroll-arrow" data-testid="scroll-down">
            <CaretDown size={20} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
};
