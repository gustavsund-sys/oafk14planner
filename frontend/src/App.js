import React, { useState, useRef, useCallback } from 'react';
import { DndContext, DragOverlay, pointerWithin, useSensor, useSensors, TouchSensor, MouseSensor } from '@dnd-kit/core';
import "@/App.css";
import { Pitch } from './components/Pitch';
import { Bench } from './components/Bench';
import { Player } from './components/Player';
import { SettingsDialog } from './components/SettingsDialog';
import { players as allPlayers } from './data/players';
import { SoccerBall } from '@phosphor-icons/react';

function App() {
  const [playersOnPitch, setPlayersOnPitch] = useState([]);
  const [targetPlayers, setTargetPlayers] = useState(11);
  const [activePlayer, setActivePlayer] = useState(null);
  const pitchRef = useRef(null);

  // Players not on pitch (on bench)
  const playersOnBench = allPlayers.filter(
    (player) => !playersOnPitch.some((p) => p.player.id === player.id)
  );

  // Configure sensors for touch and mouse
  const sensors = useSensors(
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

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over) return;

    const playerId = active.id;
    const playerData = active.data.current?.player;
    const wasOnPitch = active.data.current?.isOnPitch;

    // Dropped on pitch
    if (over.id === 'pitch') {
      // Get the pitch element to calculate relative position
      const pitchElement = document.querySelector('[data-testid="football-pitch"]');
      if (!pitchElement || !playerData) return;

      const pitchRect = pitchElement.getBoundingClientRect();
      
      // Get the pointer position from the drag event
      const pointerX = event.activatorEvent?.clientX || 0;
      const pointerY = event.activatorEvent?.clientY || 0;
      
      // Calculate position with the delta from drag
      const finalX = pointerX + (event.delta?.x || 0);
      const finalY = pointerY + (event.delta?.y || 0);
      
      // Convert to percentage relative to pitch
      let xPercent = ((finalX - pitchRect.left) / pitchRect.width) * 100;
      let yPercent = ((finalY - pitchRect.top) / pitchRect.height) * 100;

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
      onDragEnd={handleDragEnd}
    >
      <div className="app-container" data-testid="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="flex items-center gap-3">
            <SoccerBall size={28} weight="fill" className="text-green-500" />
            <h1 className="font-display text-xl font-bold tracking-tight">
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
        <Pitch playersOnPitch={playersOnPitch} ref={pitchRef} />

        {/* Bench */}
        <Bench players={playersOnBench} />

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
