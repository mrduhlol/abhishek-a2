import { useRef, useState } from 'react';

export function Terminal({ onOpen }) {
  const [lines, setLines] = useState([
    { t: 'abhiOS — zsh lite. type `help` to start.', c: '#7dd3fc' },
  ]);
  const [val, setVal] = useState('');
  const boxRef = useRef(null);

  const print = (t, c) => setLines((l) => [...l, { t, c }]);

  const run = (raw) => {
    const cmd = raw.trim();
    print(`➜ ~ ${cmd}`, '#34d399');
    if (!cmd) return;
    const [c, ...rest] = cmd.split(' ');
    const arg = rest.join(' ');
    switch (c.toLowerCase()) {
      case 'help':
        print('commands: help • about • neofetch • ls • open <about|gallery|mines|2048> • clear');
        break;
      case 'about':
        print('Abhishek — creative developer. Open the About app for more.');
        break;
      case 'neofetch':
        print('abhiOS 1.0 "aurora" • shell: zsh-lite • de: custom • games: minesweeper, 2048', '#c4b5fd');
        break;
      case 'ls':
        print('Desktop/  about.me  gallery/  minesweeper  2048  wallpaper.live');
        break;
      case 'open':
        if (onOpen(arg)) print(`opening ${arg}...`);
        else print(`unknown app: ${arg || '(empty)'} — try: about, gallery, mines, 2048`, '#f87171');
        break;
      case 'clear':
        setLines([]);
        break;
      case 'sudo':
        print('[sudo] nice try 😄 — you already have root vibes here.', '#fbbf24');
        break;
      default:
        print(`command not found: ${c} — try 'help'`, '#f87171');
    }
    requestAnimationFrame(() => { boxRef.current?.scrollTo(0, 99999); });
  };

  return (
    <div className="terminal" ref={boxRef} onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      <div className="out">
        {lines.map((l, i) => <div key={i} style={l.c ? { color: l.c } : undefined}>{l.t}</div>)}
      </div>
      <div className="in-row">
        <span className="prompt">➜ ~</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { run(val); setVal(''); } }}
          placeholder="type help…"
        />
      </div>
    </div>
  );
}
