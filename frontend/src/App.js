import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndContext, DragOverlay, pointerWithin, useSensor, useSensors, TouchSensor, MouseSensor, PointerSensor } from '@dnd-kit/core';
import "@/App.css";
import { Pitch } from './components/Pitch';
import { Bench } from './components/Bench';
import { SubsBench } from './components/SubsBench';
import { Player } from './components/Player';
import { SettingsDialog } from './components/SettingsDialog';
import { MatchInfoDialog } from './components/MatchInfoDialog';
import { SaveLoadDialog } from './components/SaveLoadDialog';
import { PlayerEditorDialog } from './components/PlayerEditorDialog';
import { InstallPrompt } from './components/InstallPrompt';
import { ExportButton } from './components/ExportButton';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playersOnPitch, setPlayersOnPitch] = useState([]);
  const [playersOnSubs, setPlayersOnSubs] = useState([]);
  const [targetPlayers, setTargetPlayers] = useState(11);
  const [activePlayer, setActivePlayer] = useState(null);
  const [benchCollapsed, setBenchCollapsed] = useState(false);
  const [matchInfo, setMatchInfo] = useState({ opponent: '', date: '', time: '', location: '', homeScore: null, awayScore: null });
  const [urlSquadLoaded, setUrlSquadLoaded] = useState(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });

  // Load squad from URL parameter
  const loadSquadFromUrl = useCallback(async (code) => {
    try {
      const response = await fetch(`${API_URL}/api/squads/${encodeURIComponent(code)}`);
      if (response.ok) {
        const data = await response.json();
        setPlayersOnPitch(data.playersOnPitch || []);
        setPlayersOnSubs(data.playersOnSubs || []);
        setMatchInfo(data.matchInfo || { opponent: '', date: '', time: '', location: '', homeScore: null, awayScore: null });
        // Clear URL parameter after loading
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Error loading squad from URL:', error);
    }
  }, []);

  // Check URL for squad code on mount
  useEffect(() => {
    if (urlSquadLoaded) return;
    
    const params = new URLSearchParams(window.location.search);
    const squadCode = params.get('squad') || params.get('code');
    
    if (squadCode) {
      setUrlSquadLoaded(true);
      loadSquadFromUrl(squadCode);
    }
  }, [loadSquadFromUrl, urlSquadLoaded]);

  // Fetch players from API
  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/players`);
      if (response.ok) {
        const data = await response.json();
        setAllPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, []);

  // Load players on mount
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Players not on pitch or subs (available in main bench) - sorted by number
  const playersOnBench = allPlayers
    .filter(
      (player) => !playersOnPitch.some((p) => p.player.id === player.id) &&
                  !playersOnSubs.some((p) => p.id === player.id)
    )
    .sort((a, b) => a.number - b.number);
  
  // Update players on pitch/subs when allPlayers changes (e.g., player edited)
  useEffect(() => {
    // Update playersOnPitch with new player data
    setPlayersOnPitch(prev => prev.map(p => {
      const updated = allPlayers.find(ap => ap.id === p.player.id);
      return updated ? { ...p, player: updated } : p;
    }).filter(p => allPlayers.some(ap => ap.id === p.player.id)));
    
    // Update playersOnSubs with new player data
    setPlayersOnSubs(prev => prev.map(p => {
      const updated = allPlayers.find(ap => ap.id === p.id);
      return updated || p;
    }).filter(p => allPlayers.some(ap => ap.id === p.id)));
  }, [allPlayers]);

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
    const wasOnSubs = active.data.current?.isOnSubs;

    // Remove from previous location
    const removeFromPitch = () => {
      setPlayersOnPitch((prev) => prev.filter((p) => p.player.id !== playerId));
    };
    const removeFromSubs = () => {
      setPlayersOnSubs((prev) => prev.filter((p) => p.id !== playerId));
    };

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

      // Clamp to pitch bounds - keep players fully visible inside pitch
      // Player avatar is ~54px wide, pitch is ~320px wide
      // 54px / 320px = ~17%, so need 8.5% margin on each side
      // Use 10% to be safe and keep name visible too
      xPercent = Math.max(10, Math.min(82, xPercent));  // Tighter right margin
      yPercent = Math.max(8, Math.min(88, yPercent));

      if (wasOnSubs) removeFromSubs();

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

    // Dropped on subs bench
    if (over.id === 'subs') {
      // If player was on pitch and dropped very close to pitch edge, snap back
      if (wasOnPitch) {
        const pitchElement = document.querySelector('[data-testid="football-pitch"]');
        if (pitchElement) {
          const pitchRect = pitchElement.getBoundingClientRect();
          const pointerX = lastPointerPosition.current.x;
          const pointerY = lastPointerPosition.current.y;
          
          // Only snap back if pointer is barely outside pitch (within 15px)
          if (pointerX <= pitchRect.right + 15) {
            let yPercent = ((pointerY - pitchRect.top) / pitchRect.height) * 100;
            yPercent = Math.max(8, Math.min(88, yPercent));
            
            setPlayersOnPitch((prev) =>
              prev.map((p) =>
                p.player.id === playerId
                  ? { ...p, x: 82, y: yPercent }
                  : p
              )
            );
            return;
          }
        }
        removeFromPitch();
      }
      if (!wasOnSubs && playerData) {
        setPlayersOnSubs((prev) => [...prev, playerData]);
      }
    }

    // Dropped on main bench - remove from pitch/subs
    if (over.id === 'bench') {
      if (wasOnPitch) removeFromPitch();
      if (wasOnSubs) removeFromSubs();
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
            <img src="/app-icon-180.png" alt="Östra Almby FK" className="h-9 w-9 rounded-lg" />
            <h1 className="font-display text-sm font-bold tracking-tight">
              ÖSTRA<br/>SQUAD
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Player Editor */}
            <PlayerEditorDialog
              players={allPlayers}
              setPlayers={setAllPlayers}
              refreshPlayers={fetchPlayers}
            />

            {/* Save/Load */}
            <SaveLoadDialog
              playersOnPitch={playersOnPitch}
              playersOnSubs={playersOnSubs}
              matchInfo={matchInfo}
              onLoadSquad={(squad) => {
                setPlayersOnPitch(squad.playersOnPitch || []);
                setPlayersOnSubs(squad.playersOnSubs || []);
                setMatchInfo(squad.matchInfo || { opponent: '', date: '', time: '', location: '' });
              }}
            />

            {/* Export as Image */}
            <ExportButton />

            {/* Match Info */}
            <MatchInfoDialog
              matchInfo={matchInfo}
              setMatchInfo={setMatchInfo}
            />

            {/* Player counter */}
            <div
              className={`
                px-2 py-1 rounded-full font-display text-xs font-bold whitespace-nowrap
                ${isOverTarget ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70'}
              `}
              data-testid="player-counter"
            >
              {currentCount}/{targetPlayers}
            </div>

            {/* Settings */}
            <SettingsDialog
              targetPlayers={targetPlayers}
              setTargetPlayers={setTargetPlayers}
            />

            {/* Install App */}
            <InstallPrompt />
          </div>
        </header>

        {/* Pitch Area with Subs Bench */}
        <div className="pitch-area">
          <Pitch 
            playersOnPitch={playersOnPitch} 
            matchInfo={matchInfo} 
            onPitchClick={() => setBenchCollapsed(!benchCollapsed)}
          />
          <SubsBench players={playersOnSubs} />
        </div>

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
