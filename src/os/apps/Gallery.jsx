import { useState } from 'react';

// Placeholder gallery — swap `src` with your own photos in /public later
const PHOTOS = [
  { src: 'https://picsum.photos/seed/abhi1/600/600', cap: 'me • 01' },
  { src: 'https://picsum.photos/seed/abhi2/600/600', cap: 'me • 02' },
  { src: 'https://picsum.photos/seed/abhi3/600/600', cap: 'me • 03' },
  { src: 'https://picsum.photos/seed/abhi4/600/600', cap: ' setup vibes' },
  { src: 'https://picsum.photos/seed/abhi5/600/600', cap: 'trip dump' },
  { src: 'https://picsum.photos/seed/abhi6/600/600', cap: 'random fav' },
];

export function Gallery() {
  const [sel, setSel] = useState(null);
  return (
    <div className="app">
      <h2>Gallery</h2>
      <p className="dim">A few placeholder shots — replace with your own photos.</p>
      <div className="g-grid">
        {PHOTOS.map((p, i) => (
          <button key={i} className="g-item" onClick={() => setSel(p)}>
            <img src={p.src} alt={p.cap} loading="lazy" />
            <span className="cap">{p.cap}</span>
          </button>
        ))}
      </div>
      <p className="dim" style={{ fontSize: 12, marginTop: 10 }}>
        To use real photos: drop files into <code style={{ fontFamily: 'monospace' }}>public/photos/</code> and update PHOTOS src to <code style={{ fontFamily: 'monospace' }}>/photos/you1.jpg</code>.
      </p>
      {sel && (
        <div className="lightbox" onClick={() => setSel(null)}>
          <img src={sel.src} alt={sel.cap} />
          <div>{sel.cap}</div>
          <button className="btn ghost" onClick={() => setSel(null)}>Close ✕</button>
        </div>
      )}
    </div>
  );
}
