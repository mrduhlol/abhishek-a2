import { useEffect, useMemo, useState } from 'react';

const N = 9, MINES = 10;
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const COLORS = { 1: '#60a5fa', 2: '#34d399', 3: '#f87171', 4: '#a78bfa', 5: '#fbbf24', 6: '#22d3ee', 7: '#f472b6', 8: '#e5e7eb' };

function buildBoard(safeIdx = -1) {
  const cells = Array.from({ length: N * N }, (_, i) => ({ mine: false, open: false, flag: false, n: 0 }));
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * N * N);
    if (i === safeIdx || cells[i].mine) continue;
    cells[i].mine = true;
    placed++;
  }
  cells.forEach((c, i) => {
    if (c.mine) return;
    const r = Math.floor(i / N), col = i % N;
    let n = 0;
    DIRS.forEach(([dr, dc]) => {
      const rr = r + dr, cc = col + dc;
      if (rr >= 0 && rr < N && cc >= 0 && cc < N && cells[rr * N + cc].mine) n++;
    });
    c.n = n;
  });
  return cells;
}

export function Minesweeper() {
  const [cells, setCells] = useState(() => buildBoard());
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(null); // 'win' | 'boom' | null
  const [secs, setSecs] = useState(0);
  const [diff, setDiff] = useState('easy');

  const flags = useMemo(() => cells.filter((c) => c.flag).length, [cells]);
  const opened = useMemo(() => cells.filter((c) => c.open).length, [cells]);

  useEffect(() => {
    if (!started || over) return;
    const i = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [started, over]);

  const reset = (d = diff) => {
    setDiff(d);
    const mines = d === 'easy' ? 10 : d === 'medium' ? 18 : 28;
    // rebuild with correct mine count
    const fresh = (() => {
      const cs = Array.from({ length: N * N }, () => ({ mine: false, open: false, flag: false, n: 0 }));
      let p = 0;
      while (p < mines) {
        const i = Math.floor(Math.random() * N * N);
        if (cs[i].mine) continue;
        cs[i].mine = true; p++;
      }
      cs.forEach((c, i) => {
        if (c.mine) return;
        const r = Math.floor(i / N), col = i % N;
        let n = 0;
        DIRS.forEach(([dr, dc]) => {
          const rr = r + dr, cc = col + dc;
          if (rr >= 0 && rr < N && cc >= 0 && cc < N && cs[rr * N + cc].mine) n++;
        });
        c.n = n;
      });
      return cs;
    })();
    setCells(fresh);
    setStarted(false); setOver(null); setSecs(0);
  };

  const flood = (board, idx) => {
    const stack = [idx];
    while (stack.length) {
      const i = stack.pop();
      const c = board[i];
      if (c.open || c.flag) continue;
      c.open = true;
      if (c.n === 0 && !c.mine) {
        const r = Math.floor(i / N), col = i % N;
        DIRS.forEach(([dr, dc]) => {
          const rr = r + dr, cc = col + dc;
          if (rr >= 0 && rr < N && cc >= 0 && cc < N) {
            const ni = rr * N + cc;
            if (!board[ni].open) stack.push(ni);
          }
        });
      }
    }
  };

  const reveal = (idx) => {
    if (over) return;
    let board = cells.map((c) => ({ ...c }));
    if (!started) {
      // ensure first click is safe
      if (board[idx].mine || board[idx].n !== 0) {
        board = buildBoard(idx);
        if (diff !== 'easy') reset(diff);
      }
      setStarted(true);
    }
    const c = board[idx];
    if (c.open || c.flag) return;
    if (c.mine) {
      board.forEach((x) => { if (x.mine) x.open = true; });
      setCells(board);
      setOver('boom');
      return;
    }
    flood(board, idx);
    setCells(board);
    const totalSafe = N * N - board.filter((x) => x.mine).length;
    const openCount = board.filter((x) => x.open).length;
    if (openCount >= totalSafe) {
      board.forEach((x) => { if (x.mine) x.flag = true; });
      setCells(board);
      setOver('win');
    }
  };

  const toggleFlag = (e, idx) => {
    e.preventDefault();
    if (over || cells[idx].open) return;
    if (!started) setStarted(true);
    setCells((prev) => prev.map((c, i) => (i === idx ? { ...c, flag: !c.flag } : c)));
  };

  return (
    <div className="app">
      <h2>💣 Minesweeper</h2>
      <p className="dim">Left-click to reveal • right-click to flag • clear all safe cells to win.</p>
      <div className="ms-bar">
        <span className="card" style={{ padding: '6px 12px' }}>⏱ {secs}s</span>
        <span className="card" style={{ padding: '6px 12px' }}>🚩 {MINES - flags}</span>
        <span className="card" style={{ padding: '6px 12px' }}>{over === 'win' ? '🏆 You win!' : over === 'boom' ? '💥 Boom!' : `🟩 ${opened} open`}</span>
        <button className="btn" onClick={() => reset()}>↻ Restart</button>
      </div>
      <div className="row" style={{ marginBottom: 10 }}>
        {['easy', 'medium', 'hard'].map((d) => (
          <button key={d} className={`btn${diff === d ? '' : ' ghost'}`} onClick={() => reset(d)}>{d}</button>
        ))}
      </div>
      <div className="ms-board" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }} onContextMenu={(e) => e.preventDefault()}>
        {cells.map((c, i) => (
          <button
            key={i}
            className={`ms-cell${c.open ? ' open' : ''}${c.open && c.mine ? ' boom' : ''}`}
            onClick={() => reveal(i)}
            onContextMenu={(e) => toggleFlag(e, i)}
          >
            {!c.open ? (c.flag ? '🚩' : '') : c.mine ? '💥' : c.n > 0 ? <span style={{ color: COLORS[c.n] }}>{c.n}</span> : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
