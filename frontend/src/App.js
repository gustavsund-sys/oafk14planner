import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndContext, DragOverlay, pointerWithin, useSensor, useSensors, TouchSensor, MouseSensor, PointerSensor } from '@dnd-kit/core';
import "@/App.css";
import { Pitch } from './components/Pitch';
import { Bench } from './components/Bench';
import { Player } from './components/Player';
import { SettingsDialog } from './components/SettingsDialog';
import { players as allPlayers } from './data/players';

function App() {
  const [playersOnPitch, setPlayersOnPitch] = useState([]);
  const [targetPlayers, setTargetPlayers] = useState(11);
  const [activePlayer, setActivePlayer] = useState(null);
  const [benchCollapsed, setBenchCollapsed] = useState(true);
  const lastPointerPosition = useRef({ x: 0, y: 0 });

  // Players not on pitch (on bench)
  const playersOnBench = allPlayers.filter(
    (player) => !playersOnPitch.some((p) => p.player.id === player.id)
  );

  // Disable iOS bounce/scroll when dragging
  useEffect(() => {
    const preventDefault = (e) => {
      if (activePlayer) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, [activePlayer]);

  // Configure sensors for touch and mouse - optimized for iOS
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const playerData = active.data.current?.player;
    if (playerData) {
      setActivePlayer(playerData);
    }
  }, []);

  const handleDragMove = useCallback((event) => {
    // Track the pointer position during drag
    if (event.activatorEvent) {
      const touch = event.activatorEvent.touches?.[0];
      if (touch) {
        lastPointerPosition.current = {
          x: touch.clientX + (event.delta?.x || 0),
          y: touch.clientY + (event.delta?.y || 0),
        };
      } else {
        lastPointerPosition.current = {
          x: event.activatorEvent.clientX + (event.delta?.x || 0),
          y: event.activatorEvent.clientY + (event.delta?.y || 0),
        };
      }
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over) return;

    const playerId = active.id;
    const playerData = active.data.current?.player;
    const wasOnPitch = active.data.current?.isOnPitch;

    // Dropped on pitch
    if (over.id === 'pitch') {
      const pitchElement = document.querySelector('[data-testid="football-pitch"]');
      if (!pitchElement || !playerData) return;

      const pitchRect = pitchElement.getBoundingClientRect();
      
      // Use tracked pointer position
      const pointerX = lastPointerPosition.current.x;
      const pointerY = lastPointerPosition.current.y;
      
      // Convert to percentage relative to pitch
      let xPercent = ((pointerX - pitchRect.left) / pitchRect.width) * 100;
      let yPercent = ((pointerY - pitchRect.top) / pitchRect.height) * 100;

      // Clamp to pitch bounds with padding
      xPercent = Math.max(8, Math.min(92, xPercent));
      yPercent = Math.max(5, Math.min(95, yPercent));

      if (wasOnPitch) {
        // Update position of existing player on pitch
        setPlayersOnPitch((prev) =>
          prev.map((p) =>
            p.player.id === playerId
              ? { ...p, x: xPercent, y: yPercent }
              : p
          )
        );
      } else {
        // Add new player to pitch
        setPlayersOnPitch((prev) => [
          ...prev,
          { player: playerData, x: xPercent, y: yPercent },
        ]);
      }
    }

    // Dropped on bench - remove from pitch
    if (over.id === 'bench' && wasOnPitch) {
      setPlayersOnPitch((prev) =>
        prev.filter((p) => p.player.id !== playerId)
      );
    }
  }, []);

  const currentCount = playersOnPitch.length;
  const isOverTarget = currentCount > targetPlayers;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="app-container" data-testid="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Östra Almby FK" className="h-10 w-auto" />
            <h1 className="font-display text-lg font-bold tracking-tight">
              ÖSTRA SQUAD
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Player counter */}
            <div
              className={`
                px-3 py-1.5 rounded-full font-display text-sm font-bold
                ${isOverTarget ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70'}
              `}
              data-testid="player-counter"
            >
              {currentCount} / {targetPlayers}
            </div>

            {/* Settings */}
            <SettingsDialog
              targetPlayers={targetPlayers}
              setTargetPlayers={setTargetPlayers}
            />
          </div>
        </header>

        {/* Pitch */}
        <Pitch playersOnPitch={playersOnPitch} />

        {/* Bench */}
        <Bench 
          players={playersOnBench} 
          isCollapsed={benchCollapsed}
          onToggleCollapse={() => setBenchCollapsed(!benchCollapsed)}
        />

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activePlayer ? (
            <div className="opacity-80">
              <Player player={activePlayer} isOnPitch={false} />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App;
