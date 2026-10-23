import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { PROJECTS } from './data/projects.js';
import Icon from './world/Icon.jsx';
import AdventureHero, { unlockAdventureAudio, stopAdventureAudio } from './world/AdventureHero.jsx';
import Town from './world/Town.jsx';
const TerrainScene = lazy(() => import('./world/TerrainScene.jsx'));

const BASE = import.meta.env.BASE_URL;
const TERRAIN_NOTES = ['The view is worth the climb.', 'A little signal in the wilderness.', 'Plant something. Watch it grow.', 'Leave a little room for ideas.', 'Go where the words take you.', 'Good things hide in unexpected places.', 'One more hand before we head home.'];

function useChapter() {
  const [chapter, setChapter] = useState('top');
  useEffect(() => {
    const elements = [...document.querySelectorAll('[data-chapter]')];
    let queued = false;
    const update = () => {
      queued = false;
      const line = window.innerHeight * .45;
      let found = elements[0];
      for (const el of elements) if (el.getBoundingClientRect().top <= line) found = el;
      if (found) setChapter(found.id);
    };
    const scroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', scroll, {passive:true});
    update();
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  return chapter;
}

function Header({soundEnabled,onSoundToggle,chapter}) {
  const [open,setOpen] = useState(false);
  const panel = useRef(null);
  const toggle = useRef(null);
  useEffect(() => {
    if (!open) return;
    const key = e => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    const outside = e => { if (!panel.current?.contains(e.target) && !toggle.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown',key);
    document.addEventListener('pointerdown',outside);
    return () => { document.removeEventListener('keydown',key); document.removeEventListener('pointerdown',outside); };
  }, [open]);
  return <header className="site-header">
    <a href="#top" className="wordmark" aria-label="Abhishek, back to the beginning">a<span>.</span></a>
    <a className="header-note" href="#projects">A small world. Seven projects.</a>
    <nav aria-label="Main navigation" className="header-actions">
      <a href="#contact" className="contact-nav">Say hello <Icon name="northeast" size={16}/></a>
      <button onClick={onSoundToggle} aria-pressed={soundEnabled} className="sound-toggle"><Icon name={soundEnabled?'sound':'mute'} size={17}/><span>Sound {soundEnabled?'on':'off'}</span></button>
      <button ref={toggle} className="map-toggle" aria-expanded={open} aria-controls="world-map" onClick={()=>setOpen(!open)}><Icon name={open?'close':'map'} size={17}/><span>Map</span></button>
    </nav>
    {open && <nav ref={panel} id="world-map" className="world-map" aria-label="World map">
      <div className="map-title"><span>Choose your next stop</span><span className="handwritten">you are here ↓</span></div>
      <a href="#top" onClick={()=>setOpen(false)} aria-current={chapter==='top'?'location':undefined}><span>Start</span><strong>Meet the maker</strong><Icon name="home" size={16}/></a>
      {PROJECTS.map((p,i)=><a key={p.id} href={`#project-${p.id}`} onClick={()=>setOpen(false)} aria-current={chapter===`project-${p.id}`?'location':undefined}><span>0{i+1}</span><strong>{p.name}</strong><small>{p.terrainLabel}</small></a>)}
      <a href="#contact" onClick={()=>setOpen(false)} aria-current={chapter==='contact'?'location':undefined}><span>End</span><strong>Contact & the little town</strong><Icon name="arrow" size={16}/></a>
    </nav>}
  </header>;
}

function Opening() {
  return <section id="top" data-chapter className="opening" aria-labelledby="hero-name">
    <div className="opening-margin opening-margin--left"><span className="small-label">A portfolio by</span><span className="handwritten">a curious human.</span><div className="margin-line"/><p>Things I make.<br/>Places they take me.</p></div>
    <div className="portrait-stage">
      <img src={`${BASE}abhishek-cutout.webp`} alt="Abhishek wearing glasses and a white shirt" width="1254" height="1254" fetchPriority="high" className="portrait-photo"/>
      <h1 id="hero-name">ABHISHEK A.</h1>
    </div>
    <div className="opening-margin opening-margin--right"><span className="handwritten">That's me.<br/>The little guy?<br/>Your tour guide.</span><svg viewBox="0 0 110 90" aria-hidden="true"><path d="M99 4C99 58 62 69 12 62m0 0 17-13M12 62l20 8"/></svg></div>
    <div className="opening-bottom"><span className="small-label">Made of curiosity<br/>and a few late nights.</span><a href="#projects" className="begin-link"><span>Let's take the scenic route</span><Icon name="down" size={25}/></a><span className="handwritten opening-footnote">Scroll a little.<br/>See what happens.</span></div>
    <pre className="opening-ascii" aria-hidden="true">{'       .       *             .\n   ~                 .            ~'}</pre>
  </section>;
}

function DeferredTerrain({type}) {
  const element=useRef(null);
  const [nearby,setNearby]=useState(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>setNearby(entry.isIntersecting),{rootMargin:'500px'});
    observer.observe(element.current);
    return ()=>observer.disconnect();
  },[]);
  return <div ref={element} className="terrain-mount">{nearby&&<Suspense fallback={null}><TerrainScene type={type}/></Suspense>}</div>;
}

function ProjectStop({project:p,index}) {
  const reverse=index%2===1;
  return <section id={`project-${p.id}`} data-chapter data-terrain={p.terrain} className={`project-stop project-stop--${p.terrain} ${reverse?'project-stop--reverse':''}`} style={{'--terrain-accent':p.accent}} aria-labelledby={`title-${p.id}`}>
    <div className="terrain-word" aria-hidden="true">{['HIGH LANDS','WILD WOODS','OPEN FIELDS','INK DUNES','DEEP BLUE','HIDDEN GEMS','LAST HAND'][index]}</div>
    <div className="project-copy">
      <div className="chapter-marker"><span className="chapter-number">0{index+1}</span><span>{p.terrainLabel}</span><i/></div>
      <h2 id={`title-${p.id}`} className={p.id==='github-widgets'?'long-project-name':''}>{p.id==='github-widgets'?<>github-<br/>widgets</>:p.name}</h2>
      <p className="project-tagline">{p.tagline}</p>
      <p className="project-description">{p.description}</p>
      <ul className="project-tech" aria-label="Built with">{p.tech.map(t=><li key={t}>{t}</li>)}</ul>
      <div className="project-links">
        {p.live && <a className="project-explore" href={p.live} target="_blank" rel="noopener noreferrer">Explore project <Icon name="northeast"/></a>}
        <a className="source-link" href={p.github} target="_blank" rel="noopener noreferrer">{p.live?'Source code':'Explore the source'}<Icon name="northeast" size={17}/></a>
      </div>
    </div>
    <div className="terrain-art"><DeferredTerrain type={p.terrain}/><span className="terrain-caption handwritten">{TERRAIN_NOTES[index]}</span></div>
    <span className="terrain-coordinate small-label" aria-hidden="true">{String(index+1).padStart(2,'0')} / 07 · {p.terrain.toUpperCase()}</span>
  </section>;
}

function Contact() {
  const [copied,setCopied]=useState(false);
  const timer=useRef();
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const copy=async()=>{try {await navigator.clipboard.writeText('abhishek.a2534@gmail.com');setCopied(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setCopied(false),2500);}catch {window.location.href='mailto:abhishek.a2534@gmail.com';}};
  return <section id="contact" data-chapter className="contact-section" aria-labelledby="contact-title">
    <span className="handwritten contact-note">You made it. Glad you stayed.</span>
    <h2 id="contact-title">GOOD THINGS<br/>START WITH <em>HELLO.</em></h2>
    <div className="contact-row"><a className="email-link" href="mailto:abhishek.a2534@gmail.com">abhishek.a2534@gmail.com<Icon name="northeast" size={24}/></a><button onClick={copy} className="copy-email">{copied?'Copied!':'Copy email'}</button></div>
    <nav aria-label="Social links" className="social-links"><a href="https://github.com/mrduhlol" target="_blank" rel="noopener noreferrer">GitHub<Icon name="northeast" size={15}/></a><a href="https://www.linkedin.com/in/duhlol" target="_blank" rel="noopener noreferrer">LinkedIn<Icon name="northeast" size={15}/></a></nav>
    <span className="sr-only" role="status">{copied?'Email address copied to clipboard':''}</span>
    <div className="town-invitation"><span className="handwritten">Not quite the end.<br/>There's a whole little life down here.</span><Icon name="down" size={28}/></div>
  </section>;
}

export default function App() {
  const [soundEnabled,setSoundEnabled]=useState(false);
  const [soundBlocked,setSoundBlocked]=useState(false);
  const [heroArrived,setHeroArrived]=useState(false);
  const chapter=useChapter();
  useEffect(()=>{
    const id=decodeURIComponent(window.location.hash.slice(1));
    if(id) document.getElementById(id)?.scrollIntoView({behavior:'instant'});
  },[]);
  const soundToggle=()=>{setSoundBlocked(false);if(soundEnabled){stopAdventureAudio();setSoundEnabled(false);}else{unlockAdventureAudio().catch(()=>{setSoundBlocked(true);setSoundEnabled(false);});setSoundEnabled(true);}};
  const index=PROJECTS.findIndex(p=>`project-${p.id}`===chapter);
  return <>
    <a href="#projects" className="skip-link">Skip to projects</a>
    <Header soundEnabled={soundEnabled} onSoundToggle={soundToggle} chapter={chapter}/>
    <main>
      <Opening/>
      <div id="projects" className="expedition-intro"><span className="handwritten">A few things I've made along the way</span><p>SEVEN PROJECTS.<br/><span>ONE WINDING PATH.</span></p><div className="trail-start"><span/><Icon name="down"/></div></div>
      <div className="expedition">{PROJECTS.map((p,i)=><ProjectStop project={p} index={i} key={p.id}/>)}</div>
      <Contact/>
      <Town heroArrived={heroArrived}/>
    </main>
    <footer className="site-footer"><a href="#top" className="wordmark" aria-label="Back to top">a<span>.</span></a><p>© {new Date().getFullYear()} Abhishek A.<span>Built with a little wander.</span></p><a href="#top">Back to the beginning<Icon name="arrow" size={17}/></a></footer>
    <AdventureHero soundEnabled={soundEnabled} onSoundBlocked={()=>{setSoundBlocked(true);setSoundEnabled(false);}} onTownArrival={setHeroArrived}/>
    {soundBlocked&&<div className="sound-notice" role="status">Tap Sound to enable audio.<button onClick={()=>setSoundBlocked(false)} aria-label="Dismiss audio notice"><Icon name="close" size={14}/></button></div>}
    {index>=0&&<aside className="journey-position" aria-label={`Project ${index+1} of 7`}><span>{String(index+1).padStart(2,'0')}</span><i/><span>07</span></aside>}
  </>;
}
