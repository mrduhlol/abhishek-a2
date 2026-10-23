import { useEffect, useRef, useState } from 'react';
import Character from './Character.jsx';
import './hero.css';

const INTRO = 'Ah shit, here we go again.';
const SESSION_KEY = 'abhishek-adventure-intro';
let sharedAudio;
function getAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio(`${import.meta.env.BASE_URL}audio/here-we-go-again.mp3`);
    sharedAudio.preload = 'none';
    sharedAudio.volume = 0.7;
  }
  return sharedAudio;
}

// Called inside the explicit Sound button gesture, before a later scroll.
// Priming is silent: the spoken line only plays when the adventure begins.
// oxlint-disable-next-line react/only-export-components -- Header gesture and scroll share one audio instance.
export async function unlockAdventureAudio() {
  const audio = getAudio();
  audio.muted = true;
  try {
    await audio.play();
  } finally {
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
  }
}

// oxlint-disable-next-line react/only-export-components -- Header mute must stop the shared clip immediately.
export function stopAdventureAudio() {
  sharedAudio?.pause();
}
const LINES = {
  mountain: 'Quite a view from up here. Orbit is just over that ridge.',
  forest: 'Hear that? There’s something worth talking about in these woods.',
  grassland: 'A little fresh air. A little open source. Not a bad afternoon.',
  desert: 'I packed a notebook. Forgot the water, though.',
  ocean: 'Hold your breath. We’re taking the scenic route.',
  cave: 'Stay close. I’m fairly sure that crystal just winked at me.',
  volcano: 'Is it getting warm, or is that just my terrible luck?',
};
const POSES = { mountain: 'climb', forest: 'swing', grassland: 'walk', desert: 'slide', ocean: 'swim', cave: 'climb', volcano: 'jump' };
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export default function AdventureHero({ soundEnabled = false, onSoundBlocked, onTownArrival }) {
  const actorRef = useRef(null);
  const dialogRef = useRef(null);
  const audioRef = useRef(null);
  const optionsRef = useRef({ soundEnabled, onSoundBlocked, onTownArrival });
  useEffect(() => {
    optionsRef.current = { soundEnabled, onSoundBlocked, onTownArrival };
  }, [soundEnabled, onSoundBlocked, onTownArrival]);
  const [pose, setPose] = useState('sit');
  const [terrain, setTerrain] = useState('');
  const [arrived, setArrived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const latest = useRef({ pose: 'sit', terrain: '', arrived: false });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduced(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    const audio = getAudio();
    audioRef.current = audio;
    return () => {
      media.removeEventListener('change', updatePreference);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!soundEnabled) audioRef.current?.pause();
  }, [soundEnabled]);

  useEffect(() => {
    let raf = 0;
    let introTimer;
    let jumpStarted = 0;
    let hasScrolled = window.scrollY > 35;
    let localIntroPlayed = false;
    let destroyed = false;
    const updateState = (next) => {
      const before = latest.current;
      if (before.pose !== next.pose) setPose(next.pose);
      if (before.terrain !== next.terrain) setTerrain(next.terrain);
      if (before.arrived !== next.arrived) {
        setArrived(next.arrived);
        optionsRef.current.onTownArrival?.(next.arrived);
        if (next.arrived) setDialogOpen(false);
      }
      latest.current = next;
    };
    const update = (now) => {
      raf = 0;
      const actor = actorRef.current;
      const name = document.getElementById('hero-name');
      if (!actor || !name || destroyed) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 720;
      const nameBox = name.getBoundingClientRect();
      const startX = clamp(nameBox.left + nameBox.width * 0.69 - 34, 12, width - 80);
      const startY = nameBox.top - 61;
      const town = document.getElementById('town');
      const arrivedNow = Boolean(town && town.getBoundingClientRect().top < height * 0.62);
      let activeTerrain = '';
      let activeIndex = 0;
      let progress = 0;
      const sections = document.querySelectorAll('[data-terrain]');
      sections.forEach((section, index) => {
        const box = section.getBoundingClientRect();
        if (box.top < height * 0.72 && box.bottom > height * 0.2) {
          activeTerrain = section.dataset.terrain;
          activeIndex = index;
          progress = clamp((height * 0.72 - box.top) / Math.max(box.height, 1), 0, 1);
        }
      });
      let x = startX;
      let y = startY;
      let currentPose = 'sit';
      const travel = nameBox.top < height * 0.25;
      if (hasScrolled && window.scrollY > 35) {
        x += mobile ? -20 : 55;
        y += 130;
        currentPose = 'idle';
      }
      if (hasScrolled && window.scrollY > 35 && travel) {
        const arc = reduced ? 0 : Math.sin(progress * Math.PI * 2);
        x = mobile ? width - 73 : width * (activeIndex % 2 === 0 ? 0.72 : 0.27) + arc * 36;
        y = height * (mobile ? 0.72 : 0.56) + arc * 24;
        currentPose = reduced ? 'idle' : POSES[activeTerrain] || 'jump';
      }
      if (jumpStarted && !reduced) {
        const t = clamp((now - jumpStarted) / 1100, 0, 1);
        const arc = Math.sin(t * Math.PI);
        x = startX + (x - startX) * t + arc * 38;
        y = startY + (y - startY) * t - arc * 100;
        currentPose = 'jump';
        if (t < 1) raf = requestAnimationFrame(update);
        else jumpStarted = 0;
      }
      actor.style.transform = `translate3d(${Math.round(clamp(x, 4, width - 76))}px, ${Math.round(y)}px, 0)`;
      actor.style.setProperty('--hero-facing', activeIndex % 2 === 0 ? '1' : '-1');
      actor.style.opacity = arrivedNow || y < -130 || y > height ? '0' : '1';
      actor.style.visibility = arrivedNow || y < -130 || y > height ? 'hidden' : 'visible';
      if (dialogRef.current) {
        dialogRef.current.style.left = `${clamp(x - 100, 16, Math.max(16, width - 296))}px`;
        dialogRef.current.style.top = `${clamp(y - 170, 72, Math.max(72, height - 235))}px`;
      }
      updateState({ pose: currentPose, terrain: activeTerrain, arrived: arrivedNow });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onScroll = () => {
      if (!hasScrolled && window.scrollY > 35) {
        hasScrolled = true;
        jumpStarted = performance.now();
        let alreadyPlayed = localIntroPlayed;
        try { alreadyPlayed ||= sessionStorage.getItem(SESSION_KEY) === '1'; } catch { /* Storage can be disabled. */ }
        if (!alreadyPlayed) {
          localIntroPlayed = true;
          try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* Keep the in-memory fallback. */ }
          setIntroVisible(true);
          introTimer = window.setTimeout(() => setIntroVisible(false), 3600);
          if (optionsRef.current.soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
              if (!destroyed) optionsRef.current.onSoundBlocked?.();
            });
          }
        }
      }
      schedule();
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(introTimer);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
    };
  }, [reduced]);

  useEffect(() => {
    if (!dialogOpen) return;
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && (actorRef.current?.contains(event.target) || dialogRef.current?.contains(event.target))) return;
      setDialogOpen(false);
      if (event.type === 'keydown') actorRef.current?.querySelector('button')?.focus();
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [dialogOpen]);

  const goTo = (id) => {
    setDialogOpen(false);
    const destination = document.getElementById(id);
    destination?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    if (destination) {
      const heading = destination.querySelector('h1, h2') || destination;
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  };

  return (
    <div className="adventure-hero-layer" data-reduced-motion={reduced || undefined}>
      <div ref={actorRef} className="adventure-hero" data-pose={pose} data-arrived={arrived || undefined}>
        {(pose === 'climb' || pose === 'swing') && <svg className="hero-rope" viewBox="0 0 80 220" aria-hidden="true"><path d="M46 -10C3 45 73 88 43 160L40 220" /></svg>}
        {introVisible && !arrived && <div className="hero-intro-bubble" role="status">{INTRO}</div>}
        <button className="hero-person-button" type="button" aria-label="Talk to your adventure guide" aria-expanded={dialogOpen} aria-controls="guide-dialog" onClick={() => { setIntroVisible(false); setDialogOpen((value) => !value); }}>
          <Character pose={pose} />
        </button>
      </div>
      <div ref={dialogRef} id="guide-dialog" className="hero-dialog" role="dialog" aria-label="Your adventure guide" hidden={!dialogOpen || arrived}>
        <div className="hero-dialog-heading"><span>Your little guide</span><button type="button" aria-label="Close guide conversation" onClick={() => setDialogOpen(false)}>×</button></div>
        <p>{LINES[terrain] || 'Hey, I’m coming along for the ride. Click me whenever you need a little direction.'}</p>
        <button type="button" onClick={() => goTo('projects')}>Show me the projects <span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => goTo('top')}>Meet Abhishek <span aria-hidden="true">↗</span></button>
      </div>
    </div>
  );
}
