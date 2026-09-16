import { useEffect, useState } from 'react';

export function TopBar({ onLauncher }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const date = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="topbar">
      <div className="brand"><span className="dot" /> abhiOS</div>
      <button className="activities" onClick={onLauncher}>◉ Activities</button>
      <div className="spacer" />
      <div className="tray"><span>Sound</span><span>WiFi</span><span>Battery 92%</span></div>
      <div className="clock">{date} &nbsp;{time}</div>
    </div>
  );
}

export function Dock({ apps, windows, activeId, onOpen }) {
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
          placeholder="Search applications"
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
              <span className="g">{a.icon}</span>
              {a.title}
              <small>{a.desc}</small>
            </button>
          ))}
        </div>
        {list.length === 0 && <div className="dim" style={{ marginTop: 16, textAlign: 'center' }}>No apps match “{query}”</div>}
      </div>
    </div>
  );
}

export function WidgetClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="widget-clock">
      <div className="time">{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
      <div className="date">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
    </div>
  );
}
