import { useCallback, useEffect, useState } from 'react';

const SIZE = 4;
const TILE_BG = {
  0: 'rgba(255,255,255,0.06)', 2: '#3b3f5e', 4: '#4a4f7e', 8: '#7c5cff',
  16: '#6d4de0', 32: '#f59e0b', 64: '#ef4444', 128: '#22d3ee',
  256: '#0ea5e9', 512: '#34d399', 1024: '#f472b6', 2048: '#facc15',
};

function emptyGrid() { return Array.from({ length: SIZE * SIZE }, () => 0); }
function addRandom(grid) {
  const e = grid.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
  if (!e.length) return grid;
  const g = [...grid];
  g[e[Math.floor(Math.random() * e.length)]] = Math.random() < 0.9 ? 2 : 4;
  return g;
}
function slide(row) {
  const a = row.filter((v) => v !== 0);
  let score = 0;
  for (let i = 0; i < a.length - 1; i++) {
    if (a[i] === a[i + 1]) { a[i] *= 2; score += a[i]; a.splice(i + 1, 1); }
  }
  while (a.length < SIZE) a.push(0);
  return { row: a, score };
}
function move(grid, dir) {
  let g = [...grid], total = 0, changed = false;
  const get = (r, c) => g[r * SIZE + c];
  const set = (r, c, v) => { g[r * SIZE + c] = v; };
  for (let i = 0; i < SIZE; i++) {
    let line = [];
    for (let j = 0; j < SIZE; j++) {
      if (dir === 'left') line.push(get(i, j));
      if (dir === 'right') line.push(get(i, SIZE - 1 - j));
      if (dir === 'up') line.push(get(j, i));
      if (dir === 'down') line.push(get(SIZE - 1 - j, i));
    }
    const before = line.join(',');
    const { row: after, score } = slide(line);
    total += score;
    if (before !== after.join(',')) changed = true;
    for (let j = 0; j < SIZE; j++) {
      if (dir === 'left') set(i, j, after[j]);
      if (dir === 'right') set(i, SIZE - 1 - j, after[j]);
      if (dir === 'up') set(j, i, after[j]);
      if (dir === 'down') set(SIZE - 1 - j, i, after[j]);
    }
  }
  return { grid: g, score: total, changed };
}
const canMove = (g) => g.includes(0) || ['left', 'right', 'up', 'down'].some((d) => move(g, d).changed);

export function Game2048() {
  const [grid, setGrid] = useState(() => addRandom(addRandom(emptyGrid())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('abhi2048best') || 0));
  const [status, setStatus] = useState('playing'); // playing | won | over
  const [touch, setTouch] = useState(null);

  const doMove = useCallback((dir) => {
    setGrid((prev) => {
      const { grid: g, score: s, changed } = move(prev, dir);
      if (!changed) return prev;
      setScore((sc) => {
        const ns = sc + s;
        if (ns > best) { setBest(ns); localStorage.setItem('abhi2048best', ns); }
        return ns;
      });
      const ng = addRandom(g);
      if (ng.includes(2048)) setStatus((st) => (st === 'playing' ? 'won' : st));
      else if (!canMove(ng)) setStatus('over');
      return ng;
    });
  }, [best]);

  useEffect(() => {
    const h = (e) => {
      const k = e.key.toLowerCase();
      if (k.startsWith('arrow') || ['w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault();
        if (k.includes('up') || k === 'w') doMove('up');
        if (k.includes('down') || k === 's') doMove('down');
        if (k.includes('left') || k === 'a') doMove('left');
        if (k.includes('right') || k === 'd') doMove('right');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [doMove]);

  const reset = () => {
    setGrid(addRandom(addRandom(emptyGrid())));
    setScore(0); setStatus('playing');
  };

  return (
    <div className="app">
      <h2>2048</h2>
      <p className="dim">Arrow keys, WASD, swipe, or buttons. Merge tiles to reach 2048.</p>
      <div className="g2048-score">
        <div className="card"><small className="dim">SCORE</small><b>{score}</b></div>
        <div className="card"><small className="dim">BEST</small><b>{best}</b></div>
        <div className="card"><small className="dim">STATUS</small><b style={{ fontSize: 14 }}>{status === 'playing' ? 'Playing' : status === 'won' ? 'Won' : 'Game over'}</b></div>
      </div>
      <div
        className="g2048-board"
        onTouchStart={(e) => setTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          if (!touch) return;
          const dx = e.changedTouches[0].clientX - touch.x;
          const dy = e.changedTouches[0].clientY - touch.y;
          if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
          doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
          setTouch(null);
        }}
      >
        {grid.map((v, i) => (
          <div
            key={i}
            className="tile"
            style={{
              background: TILE_BG[v] || '#facc15',
              color: v === 0 ? 'rgba(255,255,255,0.2)' : v <= 4 ? '#e8ecf8' : '#0b0e1a',
              fontSize: v >= 1024 ? 17 : v >= 128 ? 19 : 22,
            }}
          >
            {v !== 0 ? v : '·'}
          </div>
        ))}
      </div>
      <div className="g2048-ctrl">
        <span /><button onClick={() => doMove('up')}>▲</button><span />
        <button onClick={() => doMove('left')}>◀</button>
        <button onClick={() => doMove('down')}>▼</button>
        <button onClick={() => doMove('right')}>▶</button>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={reset}>New game</button>
        {status !== 'playing' && <button className="btn ghost" onClick={() => setStatus('playing')}>Continue</button>}
      </div>
    </div>
  );
}
