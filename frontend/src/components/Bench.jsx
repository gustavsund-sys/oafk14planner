import React, { useRef, useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PlayerCard } from './Player';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export const Bench = ({ players }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bench',
  });
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    // Check after images load
    const timer = setTimeout(checkScroll, 500);
    return () => clearTimeout(timer);
  }, [players]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -120 : 120,
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
      <div className="bench-wrapper">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="scroll-btn scroll-btn-left"
            data-testid="scroll-left"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
        )}
        
        <div 
          ref={scrollRef}
          className="bench-scroll"
          onScroll={checkScroll}
        >
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
          {players.length === 0 && (
            <div className="flex items-center justify-center w-full text-white/40 text-sm">
              Alla spelare är på planen
            </div>
          )}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="scroll-btn scroll-btn-right"
            data-testid="scroll-right"
          >
            <CaretRight size={20} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
};
