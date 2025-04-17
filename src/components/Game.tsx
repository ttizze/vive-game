'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
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

const SYNERGY: Record<BuildingType, Partial<Record<BuildingType, number>>> = {
  house: { park: 2 },
  park: { house: 2, factory: -3 },
  office: { skyscraper: 2 },
  skyscraper: { office: 2 },
  shop: { stadium: 2 },
  stadium: { shop: 2 },
  hospital: { school: 1 },
  school: { hospital: 1 },
  factory: { park: -3 },
  library: {},
};



const BUILDINGS: { type: BuildingType; emoji: string; score: number }[] = [
  { type: 'house', emoji: '🏠', score: 3 },
  { type: 'office', emoji: '🏢', score: 2 },
  { type: 'shop', emoji: '🛒', score: 2 },
  { type: 'park', emoji: '🌳', score: 5 },
  { type: 'factory', emoji: '🏭', score: 4 },
  { type: 'skyscraper', emoji: '🏙️', score: 5 },
  { type: 'school', emoji: '🏫', score: 3 },
  { type: 'hospital', emoji: '🏥', score: 4 },
  { type: 'stadium', emoji: '🏟️', score: 4 },
  { type: 'library', emoji: '📚', score: 3 },
];

function ScoringGuide() {
  return (
    <div className="max-w-md mx-auto text-left text-sm p-4 rounded-md my-4">
      <h2 className="font-semibold mb-2">採点基準</h2>

      {/* 基礎得点 */}
      <ul className="list-disc pl-5 space-y-1 mb-2">
        {BUILDINGS.map((b) => (
          <li key={b.type}>
            {b.emoji} {b.type}: {b.score}点
          </li>
        ))}
      </ul>

      {/* ボーナス & ペナルティ */}
      <ul className="list-disc pl-5 space-y-1">
        <li>同じ建物が隣接：+2 / ペア</li>
        <li>🏠 house ＋ 🌳 park：+2</li>
        <li>🏢 office ＋ 🏙️ skyscraper：+2</li>
        <li>🛒 shop ＋ 🏟️ stadium：+2</li>
        <li>🏥 hospital ＋ 🏫 school：+1</li>
        <li>🏭 factory ＋ 🌳 park：<span className="text-red-500">−3</span></li>
        <li>同種 3 連 (行 or 列)：+5</li>
        <li>異なる建物 6 種以上：+5</li>
        <li>🌳 park 2/3/4+ 個：+2 / +5 / +8</li>
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
          >
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={startGame}
              className="btn-primary"
            >
              Start 10 sec Build!
            </Button>
          </motion.div>
          {/* 採点基準を表示 */}
          <ScoringGuide />
        </>
      )}

      {phase === 'running' && (
        <>
          <p>Time left:</p><motion.p
            key={timeLeft}                        // ※ key に timeLeft を入れて一秒毎に再アニメ
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mb-2 text-4xl"
          >
            {timeLeft}s
          </motion.p>

          <Tray selected={selected} onSelect={setSelected} />
          <Grid grid={grid} onCellClick={placeBuilding} />
          <ScoringGuide />
        </>
      )}

      {phase === 'finished' && (
        <>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-xl font-semibold mb-2 text-red-500"
          >
            Your city score: {score}
          </motion.p>
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
        <motion.button
          key={b.type}
          onClick={() => onSelect(b.type)}
          className={`
        text-3xl aspect-square rounded-md border
        ${selected === b.type ? 'border-blue-600' : 'border-gray-300'}
      `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={selected === b.type ? { rotate: [0, -5, 5, -5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {b.emoji}
        </motion.button>
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
        <motion.button
          key={idx}
          onClick={() => onCellClick?.(idx)}
          className="
            w-14 aspect-square bg-white rounded-md border border-gray-400
            flex items-center justify-center text-3xl select-none
          "
          whileTap={{ scale: cell ? 1 : 0.9 }}
        >
          {cell ? (
            // ★ 建物はポップイン
            <motion.span
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              {BUILDINGS.find(b => b.type === cell)!.emoji}
            </motion.span>
          ) : null}
        </motion.button>
      ))}
    </div>
  );
}

/**
 * スコア計算：
 * 1. 各セルの基本スコア加算
 * 2. 同じ建物が隣接（左右・上下）していたら +2 ボーナス
 * 3. shop と office の隣接シナジー +1
 * 4. park が 3つ以上 で +5 ボーナス
 */
function calculateScore(cells: (BuildingType | null)[]): number {
  let score = 0;

  // 1) 基礎得点
  cells.forEach(c => {
    if (c) score += BUILDINGS.find(b => b.type === c)!.score;
  });

  // 2) 隣接シナジー & ペナルティ
  for (let i = 0; i < cells.length; i++) {
    const a = cells[i];
    if (!a) continue;

    const row = Math.floor(i / 3);
    const col = i % 3;

    const checkPair = (j: number) => {
      const b = cells[j];
      if (!b) return;
      score += SYNERGY[a][b] ?? 0;   // なければ 0
    };

    if (col < 2) checkPair(i + 1);   // 右
    if (row < 2) checkPair(i + 3);   // 下
  }

  // 3) ラインボーナス
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  ];
  for (const [a, b, c] of lines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      score += 5;
    }
  }

  // 4) 多様性ボーナス
  const distinct = new Set(cells.filter(Boolean));
  if (distinct.size >= 6) score += 5;

  // 5) 公園段階制
  const parks = cells.filter(c => c === 'park').length;
  if (parks >= 4) score += 8;
  else if (parks === 3) score += 5;
  else if (parks === 2) score += 2;

  return score;
}