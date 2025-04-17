'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
type BuildingType =
  | 'house'
  | 'office'
  | 'shop'
  | 'park'
  | 'factory'
  | 'skyscraper'
  | 'school'
  | 'hospital'
  | 'stadium'
  | 'library';

const BUILDINGS: { type: BuildingType; emoji: string; score: number }[] = [
  { type: 'house',      emoji: '🏠', score: 3 },
  { type: 'office',     emoji: '🏢', score: 2 },
  { type: 'shop',       emoji: '🛒', score: 2 },
  { type: 'park',       emoji: '🌳', score: 5 },
  { type: 'factory',    emoji: '🏭', score: 4 },
  { type: 'skyscraper', emoji: '🏙️', score: 5 },
  { type: 'school',     emoji: '🏫', score: 3 },
  { type: 'hospital',   emoji: '🏥', score: 4 },
  { type: 'stadium',    emoji: '🏟️', score: 4 },
  { type: 'library',    emoji: '📚', score: 3 },
];

function ScoringGuide() {
  return (
    <div className="max-w-md mx-auto text-left text-sm  p-4 rounded-md my-4">
      <h2 className="font-semibold mb-2">採点基準</h2>
      <ul className="list-disc pl-5 space-y-1">
        {BUILDINGS.map((b) => (
          <li key={b.type}>
            {b.emoji} {b.type}: {b.score}点
          </li>
        ))}
        <li>同じ建物が隣接：1組ごとに +2点</li>
        <li>🛒 shop と 🏢 office が隣接：+1点</li>
        <li>🌳 park が3つ以上：+5点</li>
      </ul>
    </div>
  );
}
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
    <>
      <Button type="button" variant="destructive" size="lg" onClick={startGame} className="btn-primary">
        Start 10 sec Build!
      </Button>
      {/* 採点基準を表示 */}
      <ScoringGuide />
    </>
  )}

      {phase === 'running' && (
        <>
          <p className="mb-2 text-lg">Time left: {timeLeft}s</p>
          <Tray selected={selected} onSelect={setSelected} />
          <Grid grid={grid} onCellClick={placeBuilding} />
          <ScoringGuide />
        </>
      )}

      {phase === 'finished' && (
        <>
          <p className="text-xl font-semibold mb-2">Your city score: {score}</p>
          <Grid grid={grid} />
          <Button type="button" variant="destructive" size="lg" onClick={startGame} className="btn-primary mt-4">Play Again</Button>
        </>
      )}
    </div>
  );
}

interface TrayProps {
  selected: BuildingType | null;
  onSelect: (b: BuildingType) => void;
}

function Tray({ selected, onSelect }: TrayProps) {
  return (
<div className="grid grid-cols-4 gap-2 my-4 max-w-xs mx-auto">
      {BUILDINGS.map((b) => (
        <button
          key={b.type}
          onClick={() => onSelect(b.type)}
          className={`
            text-3xl 
            aspect-square       /* 正方形を強制 */
            rounded-md 
            border 
            ${selected === b.type ? 'border-blue-600' : 'border-gray-300'}
          `}
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

function Grid({ grid, onCellClick }: GridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 justify-center aspect-square">{/* ← gap-2 → gap-1 */}
      {grid.map((cell, idx) => (
        <button
          key={idx}
          onClick={() => onCellClick?.(idx)}
          className="
            w-14               /* 必要に応じて調整 */
            aspect-square      /* 正方形を強制 */
            bg-white 
            rounded-md 
            border border-gray-400 
            flex items-center justify-center 
            text-3xl
          "
        >
          {cell ? BUILDINGS.find((b) => b.type === cell)?.emoji : ''}
        </button>
      ))}
    </div>
  );
}

function calculateScore(cells: (BuildingType | null)[]): number {
  let score = 0;

  // 1. 基本スコア合計
  for (const cell of cells) {
    if (!cell) continue;
    const b = BUILDINGS.find((b) => b.type === cell);
    score += b?.score ?? 0;
  }

  // 2. 隣接ボーナス & 3. shop-office シナジー
  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx];
    if (!cell) continue;

    const row = Math.floor(idx / 3);
    const col = idx % 3;

    // 右隣チェック
    if (col < 2 && cells[idx + 1] === cell) {
      score += 2;
    }
    // 下隣チェック
    if (row < 2 && cells[idx + 3] === cell) {
      score += 2;
    }
    // shop-office シナジー
    if (cell === 'shop') {
      if (
        (col < 2 && cells[idx + 1] === 'office') ||
        (row < 2 && cells[idx + 3] === 'office')
      ) {
        score += 1;
      }
    }
  }

  // 4. park 数ボーナス
  const parkCount = cells.filter((c) => c === 'park').length;
  if (parkCount >= 3) {
    score += 5;
  }

  return score;
}