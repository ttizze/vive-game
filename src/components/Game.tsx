'use client';

import { useEffect, useState } from 'react';

type BuildingType = 'house' | 'office' | 'shop' | 'park';

const BUILDINGS: { type: BuildingType; emoji: string; score: number }[] = [
  { type: 'house', emoji: '🏠', score: 3 },
  { type: 'office', emoji: '🏢', score: 2 },
  { type: 'shop', emoji: '🛒', score: 2 },
  { type: 'park', emoji: '🌳', score: 5 },
];

// Grid cell may contain a building or be empty (null)
export default function Game() {
  const [grid, setGrid] = useState<(BuildingType | null)[]>(Array(9).fill(null));
  const [selected, setSelected] = useState<BuildingType | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);

  // Countdown effect
  useEffect(() => {
    if (phase !== 'running') return;
    if (timeLeft === 0) {
      setScore(calculateScore(grid));
      setPhase('finished');
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, grid]);

  function startGame(): void {
    setGrid(Array(9).fill(null));
    setSelected(null);
    setScore(0);
    setTimeLeft(10);
    setPhase('running');
  }

  function placeBuilding(idx: number): void {
    if (phase !== 'running' || selected === null) return;
    setGrid((prev) => {
      if (prev[idx] !== null) return prev; // occupied
      const next = [...prev];
      next[idx] = selected;
      return next;
    });
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">10‑Second City</h1>

      {phase === 'idle' && (
        <button onClick={startGame} className="btn-primary">Start 10 sec Build!</button>
      )}

      {phase === 'running' && (
        <>
          <p className="mb-2 text-lg">Time left: {timeLeft}s</p>
          <Tray selected={selected} onSelect={setSelected} />
          <Grid grid={grid} onCellClick={placeBuilding} />
        </>
      )}

      {phase === 'finished' && (
        <>
          <p className="text-xl font-semibold mb-2">Your city score: {score}</p>
          <Grid grid={grid} />
          <button onClick={startGame} className="btn-primary mt-4">Play Again</button>
        </>
      )}
    </div>
  );
}

interface TrayProps {
  selected: BuildingType | null;
  onSelect: (b: BuildingType) => void;
}

function Tray({ selected, onSelect }: TrayProps): React.ReactNode {
  return (
    <div className="flex justify-center gap-4 my-4">
      {BUILDINGS.map((b) => (
        <button
          key={b.type}
          onClick={() => onSelect(b.type)}
          className={`text-3xl w-14 h-14 rounded-md border ${selected === b.type ? 'border-blue-600' : 'border-gray-300'
            }`}
        >
          {b.emoji}
        </button>
      ))}
    </div>
  );
}

interface GridProps {
  grid: (BuildingType | null)[];
  onCellClick?: (idx: number) => void;
}

function Grid({ grid, onCellClick }: GridProps): React.ReactNode {
  return (
    <div className="grid grid-cols-3 gap-2 justify-center">
      {grid.map((cell, idx) => (
        <button
          key={idx}
          onClick={() => onCellClick?.(idx)}
          className="w-16 h-16 bg-white rounded-md border border-gray-400 flex items-center justify-center text-3xl"
        >
          {cell ? BUILDINGS.find((b) => b.type === cell)?.emoji : ''}
        </button>
      ))}
    </div>
  );
}

function calculateScore(cells: (BuildingType | null)[]): number {
  return cells.reduce((sum, cell) => {
    const bonus = BUILDINGS.find((b) => b.type === cell)?.score ?? 0;
    return sum + bonus;
  }, 0);
}