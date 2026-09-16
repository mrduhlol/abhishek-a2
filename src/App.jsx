import { useCallback, useMemo, useState } from 'react';
import Wallpaper from './os/Wallpaper.jsx';
import BootScreen from './os/BootScreen.jsx';
import Window from './os/Window.jsx';
import { TopBar, Dock, Launcher, WidgetClock } from './os/chrome.jsx';
import { AboutMe } from './os/apps/AboutMe.jsx';
import { Gallery } from './os/apps/Gallery.jsx';
import { Terminal } from './os/apps/Terminal.jsx';
import { Minesweeper } from './os/apps/Minesweeper.jsx';
import { Game2048 } from './os/apps/Game2048.jsx';

const APPS = [
  { id: 'about', title: 'About Me', desc: 'Profile and background', icon: 'A', color: 'linear-gradient(135deg,#3b4a6b,#222c44)', w: 480, h: 520 },
  { id: 'gallery', title: 'Gallery', desc: 'Photo collection', icon: 'G', color: 'linear-gradient(135deg,#3b4a6b,#222c44)', w: 560, h: 480 },
  { id: 'mines', title: 'Minesweeper', desc: 'Logic game', icon: 'M', color: 'linear-gradient(135deg,#3b4a6b,#222c44)', w: 460, h: 560 },
  { id: 'g2048', title: '2048', desc: 'Number puzzle', icon: '2', color: 'linear-gradient(135deg,#3b4a6b,#222c44)', w: 440, h: 600 },
  { id: 'terminal', title: 'Terminal', desc: 'Command line', icon: 'T', color: 'linear-gradient(135deg,#1a2133,#0d1220)', w: 560, h: 400 },
];

let zid = 10;
let winSeq = 1;

export default function App() {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [launcher, setLauncher] = useState(false);
  const [query, setQuery] = useState('');

  const openApp = useCallback((appId) => {
    const app = APPS.find((a) => a.id === appId);
    if (!app) return false;
    setLauncher(false); setQuery('');
    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId);
      if (existing) {
        zid += 1;
        setActiveId(existing.id);
        return prev.map((w) => (w.id === existing.id ? { ...w, minimized: false, z: zid } : w));
      }
      zid += 1;
      const off = (prev.length % 5) * 34;
      const vw = Math.min(window.innerWidth, 1200);
      const ww = Math.min(app.w, vw - 40);
      const wh = Math.min(app.h, window.innerHeight - 120);
      const id = winSeq++;
      const win = {
        id, appId, title: app.title, icon: app.icon,
        x: Math.max(90, (vw - ww) / 2 + off), y: Math.max(10, 60 + off),
        w: ww, h: wh, z: zid, minimized: false, maximized: window.innerWidth < 720,
      };
      setActiveId(id);
      return [...prev, win];
    });
    return true;
  }, []);

  const closeWin = (id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveId((a) => (a === id ? null : a));
  };
  const minWin = (id) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  const maxWin = (id) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  const focusWin = (id) => {
    zid += 1;
    setActiveId(id);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z: zid } : w)));
  };
  const moveWin = (id, x, y) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x: Math.max(-w.w + 120, Math.min(x, window.innerWidth - 120)), y: Math.max(0, Math.min(y, window.innerHeight - 120)) } : w)));
  const resizeWin = (id, w, h) =>
    setWindows((prev) => prev.map((x) => (x.id === id ? { ...x, w, h } : x)));

  const renderApp = (appId) => {
    switch (appId) {
      case 'about': return <AboutMe />;
      case 'gallery': return <Gallery />;
      case 'mines': return <Minesweeper />;
      case 'g2048': return <Game2048 />;
      case 'terminal': return <Terminal onOpen={openApp} />;
      default: return null;
    }
  };

  const sorted = useMemo(() => [...windows].sort((a, b) => a.z - b.z), [windows]);

  if (!booted) return <BootScreen onDone={() => { setBooted(true); setTimeout(() => openApp('about'), 400); }} />;

  return (
    <div className="os">
      <Wallpaper />
      <TopBar onLauncher={() => setLauncher((v) => !v)} />
      <div className="desktop">
        <div className="desktop-icons">
          {APPS.slice(0, 4).map((a) => (
            <button key={a.id} className="dicon" onDoubleClick={() => openApp(a.id)} onClick={() => openApp(a.id)}>
              <span className="glyph" style={{ background: a.color }}>{a.icon}</span>
              {a.title}
              <small>double-click</small>
            </button>
          ))}
        </div>

        <WidgetClock />
        <div className="hint">abhiOS 1.0 — drag windows to move, double-click icons to open</div>

        {sorted.map((w) => (
          <Window
            key={w.id}
            win={w}
            active={w.id === activeId}
            onFocus={() => focusWin(w.id)}
            onClose={closeWin}
            onMin={minWin}
            onMax={maxWin}
            onMove={moveWin}
            onResize={resizeWin}
          >
            {renderApp(w.appId)}
          </Window>
        ))}

        <Dock apps={APPS} windows={windows} activeId={activeId} onOpen={openApp} />
        {launcher && <Launcher apps={APPS} onOpen={openApp} onClose={() => { setLauncher(false); setQuery(''); }} query={query} setQuery={setQuery} />}
      </div>
    </div>
  );
}
