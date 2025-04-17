'use client';

import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti'; // 必要なパッケージをインストールしてください

// 建物タイプにさらに hospital, stadium, library を追加
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
  { type: 'library',    emoji: '��', score: 3 },
];

export default function Game() {
  const [grid, setGrid] = useState<(BuildingType | null)[]>(Array(9).fill(null));
  const [selected, setSelected] = useState<BuildingType | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'calculating' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  
  // スコア計算アニメーション用のref
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // カウントダウン効果
  useEffect(() => {
    if (phase !== 'running') return;
    if (timeLeft === 0) {
      // 計算フェーズに移行
      setPhase('calculating');
      const finalScore = calculateScore(grid);
      
      // スコアを徐々に増やすアニメーション
      let currentDisplay = 0;
      scoreIntervalRef.current = setInterval(() => {
        currentDisplay += Math.ceil(finalScore / 20); // 約20ステップでアニメーション
        if (currentDisplay >= finalScore) {
          currentDisplay = finalScore;
          clearInterval(scoreIntervalRef.current as NodeJS.Timeout);
          
          // スコア計算完了後、少し待ってから花火を表示
          setTimeout(() => {
            setPhase('finished');
            // 花火エフェクト
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 500);
        }
        setDisplayScore(currentDisplay);
      }, 50);
      
      setScore(finalScore);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, grid]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }
    };
  }, []);

  function startGame(): void {
    setGrid(Array(9).fill(null));
    setSelected(null);
    setScore(0);
    setDisplayScore(0);
    setTimeLeft(10);
    setLastPlaced(null);
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
    setLastPlaced(idx); // 最後に配置したセルを記録
    
    // 配置効果音を再生（オプション）
    // playPlaceSound();
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">10‑Second City</h1>

      {phase === 'idle' && (
        <>
          <button 
            onClick={startGame} 
            className="btn-primary hover:scale-105 transition-transform"
          >
            Start 10 sec Build!
          </button>
          {/* 採点基準を表示 */}
          <ScoringGuide />
        </>
      )}

      {phase === 'running' && (
        <>
          <div className="mb-2">
            <TimeBar timeLeft={timeLeft} totalTime={10} />
          </div>
          <Tray selected={selected} onSelect={setSelected} />
          <Grid 
            grid={grid} 
            onCellClick={placeBuilding} 
            lastPlaced={lastPlaced}
          />
        </>
      )}

      {phase === 'calculating' && (
        <>
          <p className="text-xl font-semibold mb-2 animate-pulse">
            計算中... <span className="text-2xl">{displayScore}</span>
          </p>
          <Grid grid={grid} />
        </>
      )}

      {phase === 'finished' && (
        <>
          <p className="text-2xl font-bold mb-2">
            最終スコア: <span className="text-3xl text-green-600">{score}</span>
          </p>
          <Grid grid={grid} />
          <button 
            onClick={startGame} 
            className="btn-primary mt-4 hover:scale-105 transition-transform"
          >
            Play Again
          </button>
        </>
      )}
    </div>
  );
}

// タイムバーコンポーネント
function TimeBar({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const percentage = (timeLeft / totalTime) * 100;
  const barColor = 
    timeLeft > 5 ? 'bg-green-500' : 
    timeLeft > 2 ? 'bg-yellow-500' : 
    'bg-red-500';
  
  return (
    <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-4 overflow-hidden">
      <div 
        className={`h-full ${barColor} transition-all duration-1000 ease-linear`}
        style={{ width: `${percentage}%` }}
      />
      <p className="mt-1 font-medium">{timeLeft}秒</p>
    </div>
  );
}

interface TrayProps {
  selected: BuildingType | null;
  onSelect: (b: BuildingType) => void;
}

function Tray({ selected, onSelect }: TrayProps) {
  return (
    <div className="grid grid-cols-5 gap-2 my-4 max-w-xs mx-auto">
      {BUILDINGS.map((b) => (
        <button
          key={b.type}
          onClick={() => onSelect(b.type)}
          className={`
            text-3xl 
            aspect-square
            rounded-md 
            border 
            transition-all
            hover:scale-110
            ${selected === b.type 
              ? 'border-blue-600 bg-blue-50 scale-110 shadow-md' 
              : 'border-gray-300 hover:border-blue-300'}
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
  lastPlaced?: number | null;
}

function Grid({ grid, onCellClick, lastPlaced }: GridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 justify-center max-w-xs mx-auto">
      {grid.map((cell, idx) => (
        <button
          key={idx}
          onClick={() => onCellClick?.(idx)}
          className={`
            w-14
            aspect-square
            bg-white 
            rounded-md 
            border border-gray-400 
            flex items-center justify-center 
            text-3xl
            transition-all
            ${!cell && onCellClick ? 'hover:bg-blue-50 hover:border-blue-300' : ''}
            ${lastPlaced === idx ? 'animate-bounce-once' : ''}
          `}
        >
          {cell ? BUILDINGS.find((b) => b.type === cell)?.emoji : ''}
        </button>
      ))}
    </div>
  );
}

/**
 * 採点基準を画面に表示するコンポーネント
 */
function ScoringGuide() {
  return (
    <div className="max-w-md mx-auto text-left text-sm bg-gray-50 p-4 rounded-md my-4">
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

// calculateScore 関数は既存のまま 