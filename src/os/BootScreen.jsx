import { useEffect, useState } from 'react';

const LINES = [
  '[ OK ] mounted /dev/abhi0',
  '[ OK ] started session manager',
  '[ OK ] loaded minesweeper and 2048 modules',
  '[ OK ] gallery service ready',
  '[ OK ] reached graphical target',
];

export default function BootScreen({ onDone }) {
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    const li = setInterval(() => setLogCount((c) => Math.min(c + 1, LINES.length)), 420);
    const done = setTimeout(onDone, 3000);
    return () => { clearInterval(li); clearTimeout(done); };
  }, [onDone]);

  return (
    <div className="boot">
      <div className="boot-logo"><b>abhi</b>OS<span className="o">.</span></div>
      <div className="boot-dots"><span /><span /><span /><span /><span /></div>
      <div className="boot-log">
        {LINES.slice(0, logCount).map((l, i) => (
          <div key={i}><span className="ok">[ OK ]</span>{l.slice(6)}</div>
        ))}
      </div>
    </div>
  );
}
