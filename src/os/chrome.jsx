import { useEffect, useState } from 'react';

// GNOME-style application icons (inline SVG, no emoji)
export function AppIcon({ app, size = 44 }) {
  const s = { width: size, height: size, viewBox: '0 0 48 48' };
  switch (app.id) {
    case 'about':
      return (
        <svg {...s}>
          <rect x="2" y="2" width="44" height="44" rx="10" fill="#3584e4" />
          <circle cx="24" cy="17" r="7" fill="#fff" opacity="0.95" />
          <path d="M10 39c2.5-8.5 8-12.5 14-12.5s11.5 4 14 12.5" fill="#fff" opacity="0.95" />
        </svg>
      );
    case 'gallery':
      return (
        <svg {...s}>
          <defs>
            <linearGradient id="galg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#33d17a" />
              <stop offset="1" stopColor="#1a7a4c" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#galg)" />
          <circle cx="33" cy="15" r="5" fill="#fff3c4" />
          <polygon points="6,38 19,20 28,32 33,25 42,38" fill="#0d4d33" />
        </svg>
      );
    case 'mines':
      return (
        <svg {...s}>
          <rect x="2" y="2" width="44" height="44" rx="10" fill="#e5a50a" />
          <g stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round">
            <line x1="24" y1="9" x2="24" y2="15" />
            <line x1="24" y1="33" x2="24" y2="39" />
            <line x1="9" y1="24" x2="15" y2="24" />
            <line x1="33" y1="24" x2="39" y2="24" />
            <line x1="13.4" y1="13.4" x2="17.6" y2="17.6" />
            <line x1="30.4" y1="30.4" x2="34.6" y2="34.6" />
            <line x1="34.6" y1="13.4" x2="30.4" y2="17.6" />
            <line x1="17.6" y1="30.4" x2="13.4" y2="34.6" />
          </g>
          <circle cx="24" cy="24" r="8" fill="#2b2b2b" />
          <circle cx="21.5" cy="21.5" r="2" fill="#fff" opacity="0.7" />
        </svg>
      );
    case 'g2048':
      return (
        <svg {...s}>
          <rect x="2" y="2" width="44" height="44" rx="10" fill="#e95420" />
          <text x="24" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="inherit">2048</text>
        </svg>
      );
    default:
      return (
        <svg {...s}>
          <rect x="2" y="2" width="44" height="44" rx="10" fill="#2d2d2d" stroke="#55534f" />
          <text x="11" y="30" fontSize="15" fontWeight="700" fill="#fff" fontFamily="monospace">&gt;_</text>
          <rect x="29" y="22" width="8" height="3" fill="#33d17a" />
        </svg>
      );
  }
}

export function TopBar({ onLauncher }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const text = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    + '  ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="topbar">
      <button className="activities" onClick={onLauncher}>Activities</button>
      <div className="clock" onClick={onLauncher}>{text}</div>
      <div className="spacer" />
      <div className="tray"><span>▂▄▆</span><span>♪</span><span>92%</span><span>⏻</span></div>
    </div>
  );
}

export function Dock({ apps, windows, activeId, onOpen, onLauncher }) {
  return (
    <div className="dock">
      {apps.map((a) => {
        const running = windows.some((w) => w.appId === a.id);
        const isActive = windows.some((w) => w.appId === a.id && w.id === activeId && !w.minimized);
        return (
          <button
            key={a.id}
            className={`dock-btn${isActive ? ' active' : ''}`}
            style={{ background: a.color }}
            onClick={() => onOpen(a.id)}
            title={a.title}
          >
            {a.icon}
            {running && <span className="run-dot" />}
            <span className="tip">{a.title}</span>
          </button>
        );
      })}
      <div className="dock-sep" />
      <button className="dock-btn show-apps" style={{ background: '#3a3733' }} onClick={onLauncher} title="Show Applications">
        <span className="grid9"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
        <span className="tip">Show Applications</span>
      </button>
    </div>
  );
}

export function Launcher({ apps, onOpen, onClose, query, setQuery }) {
  const q = query.toLowerCase();
  const list = apps.filter((a) => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
  return (
    <div className="launcher" onClick={onClose}>
      <div className="launcher-box" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="launcher-search"
          placeholder="Type to search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && list[0]) { onOpen(list[0].id); }
          }}
        />
        <div className="launcher-grid">
          {list.map((a) => (
            <button key={a.id} className="launch-app" onClick={() => onOpen(a.id)}>
              <span className="g" style={{ background: a.color }}>{a.icon}</span>
              {a.title}
            </button>
          ))}
        </div>
        {list.length === 0 && <div className="dim" style={{ marginTop: 16 }}>No results for “{query}”</div>}
      </div>
    </div>
  );
}
