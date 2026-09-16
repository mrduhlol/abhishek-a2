import { useEffect, useState } from 'react';

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
