import { useRef } from 'react';

export default function Window({ win, active, onFocus, onClose, onMin, onMax, onMove, onResize, children }) {
  const drag = useRef(null);

  const startDrag = (e) => {
    if (win.maximized || e.target.closest('.wbtn')) return;
    onFocus();
    drag.current = { sx: e.clientX, sy: e.clientY, x: win.x, y: win.y, moved: false };
    const move = (ev) => {
      if (!drag.current) return;
      const dx = ev.clientX - drag.current.sx;
      const dy = ev.clientY - drag.current.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      onMove(win.id, drag.current.x + dx, drag.current.y + dy);
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const startResize = (e) => {
    e.stopPropagation();
    onFocus();
    const s = { sx: e.clientX, sy: e.clientY, w: win.w, h: win.h };
    const move = (ev) => onResize(win.id, Math.max(300, s.w + ev.clientX - s.sx), Math.max(220, s.h + ev.clientY - s.sy));
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (win.minimized) return null;

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <div
      className={`win${active ? ' focused' : ''}${win.maximized ? ' maxed' : ''}`}
      style={style}
      onMouseDown={onFocus}
    >
      <div className="titlebar" onMouseDown={startDrag} onDoubleClick={() => onMax(win.id)}>
        <span style={{ fontSize: 15 }}>{win.icon}</span>
        <div className="t">{win.title} <span>— abhiOS</span></div>
        <button className="wbtn" onClick={() => onMin(win.id)} title="Minimize">─</button>
        <button className="wbtn" onClick={() => onMax(win.id)} title="Maximize">{win.maximized ? '❐' : '□'}</button>
        <button className="wbtn close" onClick={() => onClose(win.id)} title="Close">✕</button>
      </div>
      <div className="win-body">{children}</div>
      {!win.maximized && <div className="resize-handle" onMouseDown={startResize} />}
    </div>
  );
}
