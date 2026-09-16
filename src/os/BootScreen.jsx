import { useEffect, useState } from 'react';

const LINES = [
  '[ OK ] mounted /dev/abhi0',
  '[ OK ] started aurora-compositor.service',
  '[ OK ] loaded minesweeper.ko + 2048.ko',
  '[ OK ] gallery daemon ready (6 photos)',
  '[ OK ] reached target graphical-interface',
  'starting abhiOS login manager...',
];

export default function BootScreen({ onDone }) {
  const [logCount, setLogCount] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const li = setInterval(() => setLogCount((c) => Math.min(c + 1, LINES.length)), 380);
    const pi = setInterval(() => setPct((p) => Math.min(p + Math.random() * 16 + 6, 100)), 220);
    const done = setTimeout(onDone, 3000);
    return () => { clearInterval(li); clearInterval(pi); clearTimeout(done); };
  }, [onDone]);

  return (
    <div className="boot">
      <div className="boot-logo">abhiOS</div>
      <div className="boot-log">
        {LINES.slice(0, logCount).map((l, i) => (
          <div key={i}>{l.startsWith('[ OK') ? <><span className="ok">[ OK ]</span>{l.slice(6)}</> : l}</div>
        ))}
        <div style={{ color: '#7c5cff' }}>▊</div>
      </div>
      <div className="boot-bar"><div style={{ width: `${pct}%` }} /></div>
      <div style={{ fontSize: 12, color: '#9aa4c3', fontFamily: 'monospace' }}>custom linux style • about-me edition</div>
    </div>
  );
}
