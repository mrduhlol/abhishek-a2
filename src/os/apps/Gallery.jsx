import { useState } from 'react';

// Placeholder gallery — swap `src` with your own photos in /public later
const PHOTOS = [
  { src: 'https://picsum.photos/seed/abhi1/800/800', cap: 'Portrait 01' },
  { src: 'https://picsum.photos/seed/abhi2/800/800', cap: 'Portrait 02' },
  { src: 'https://picsum.photos/seed/abhi3/800/800', cap: 'Portrait 03' },
  { src: 'https://picsum.photos/seed/abhi4/800/800', cap: 'Workspace' },
  { src: 'https://picsum.photos/seed/abhi5/800/800', cap: 'Travel' },
  { src: 'https://picsum.photos/seed/abhi6/800/800', cap: 'Collection' },
];

export function Gallery() {
  const [idx, setIdx] = useState(null);
  const sel = idx !== null ? PHOTOS[idx] : null;
  const prev = () => setIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
  const next = () => setIdx((i) => (i + 1) % PHOTOS.length);

  return (
    <div className="app">
      <div className="app-head">
        <div>
          <h2>Gallery</h2>
          <p className="dim">{PHOTOS.length} photos</p>
        </div>
      </div>
      <div className="g-grid">
        {PHOTOS.map((p, i) => (
          <button key={i} className="g-item" onClick={() => setIdx(i)}>
            <img src={p.src} alt={p.cap} loading="lazy" />
            <span className="cap">{p.cap}</span>
          </button>
        ))}
      </div>
      <p className="dim" style={{ fontSize: 12, marginTop: 10 }}>
        To use real photos, drop files into public/photos/ and update PHOTOS to /photos/you1.jpg etc.
      </p>
      {sel && (
        <div className="lightbox" onClick={() => setIdx(null)}>
          <div className="viewer-top">
            <span>{sel.cap}</span>
            <span className="dim">{idx + 1} / {PHOTOS.length}</span>
            <button className="btn ghost" onClick={() => setIdx(null)}>Close</button>
          </div>
          <div className="viewer-main" onClick={(e) => e.stopPropagation()}>
            <button className="vnav" onClick={prev} title="Previous">‹</button>
            <img src={sel.src} alt={sel.cap} />
            <button className="vnav" onClick={next} title="Next">›</button>
          </div>
        </div>
      )}
    </div>
  );
}
