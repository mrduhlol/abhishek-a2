import { useEffect, useRef, useState } from 'react';
import Character from './Character.jsx';
import './town.css';

const RESIDENTS = [
  { id: 'walker', label: 'Say hello to the walker', job: 'walking', x: 19, y: 72, name: 'The neighbour', lines: ['Oh, hey! Long journey?', 'Make yourself at home.', 'Still here? Nice. So am I.'] },
  { id: 'gardener', label: 'Talk to the gardener', job: 'gardening', x: 37, y: 65, name: 'The gardener', lines: ['Careful! Those are my seedlings.', 'You could pick up a watering can, you know.', 'The plants are better listeners.'] },
  { id: 'shopkeeper', label: 'Talk to the shopkeeper carrying boxes', job: 'carrying', x: 72, y: 67, name: 'The shopkeeper', lines: ['A little busy here. Mind the boxes!', 'Unless you’re helping, give me a minute.', 'This box is not going to carry itself.'] },
  { id: 'sweeper', label: 'Talk to the person sweeping', job: 'sweeping', x: 87, y: 80, name: 'The sweeper', lines: ['I JUST swept that bit.', 'Feet off the clean patch, please.', 'Here. You want the broom?'] },
];

function Window({ x, y, w = 34, h = 47 }) {
  return <g><rect x={x} y={y} width={w} height={h} rx="1" fill="#e6e3cc" /><path d={`M${x + w / 2} ${y}v${h} M${x} ${y + h * .5}h${w}`} /><path d={`M${x - 4} ${y + h + 4}h${w + 8}`} /></g>;
}

function TownDrawing() {
  return (
    <svg className="town-drawing" viewBox="0 0 1400 540" aria-hidden="true">
      <defs>
        <pattern id="town-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><path d="M0 0v8" stroke="#29271f" strokeWidth=".65" opacity=".28" /></pattern>
        <pattern id="town-roof" width="18" height="12" patternUnits="userSpaceOnUse"><path d="M0 11h18M9 0v11" fill="none" stroke="#29271f" strokeWidth=".7" opacity=".38" /></pattern>
      </defs>
      <g fill="none" stroke="#8e9077" strokeWidth="1" opacity=".55">
        <path d="M0 323Q125 233 277 293T525 278Q694 204 857 288T1140 264Q1287 225 1400 292" />
        <path d="M0 334Q126 244 276 306T525 290Q694 216 858 300T1142 277Q1287 237 1400 305" />
        <path d="M49 123q23-11 43 0m3 0q23-11 43 0M1110 86q16-12 31 0m3 0q16-12 31 0" />
      </g>
      <g fill="#f4efdf" stroke="#29271f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* West cottage and its garden. */}
        <path d="M114 331V204l102-77 104 78v138" />
        <path d="M94 210l121-99 126 100-17 11-108-80-109 82z" fill="#d7dac4" />
        <path d="M94 210l121-99 126 100-17 11-108-80-109 82z" fill="url(#town-roof)" />
        <path d="M260 143v-43h25v63" />
        <path d="M255 100h35v-8h-35z" />
        <path d="M263 82q-13-22 1-34m11 33q13-20 0-40" stroke="#8e9077" strokeDasharray="3 6" />
        <Window x={141} y={232} /><Window x={257} y={232} />
        <path d="M196 336v-72q20-27 40 0v72" fill="#d6d7bc" />
        <circle cx="227" cy="294" r="1.5" fill="#29271f" />
        <path d="M187 340h60m-65 6h69M128 325h47m-41-7h35M267 310h40m-33 7h29" opacity=".45" />
        <path d="M126 331h57m-59-6h58" />
        <path d="M124 331v-21m13 21v-30m14 30v-24m13 24v-30m14 30v-21" stroke="#6f7952" />
        {/* Atelier, behind the town square. */}
        <path d="M440 330V171h124v161" fill="#eae6d5" />
        <path d="M423 174l78-67 81 67z" fill="#d5c9ae" />
        <path d="M423 174l78-67 81 67z" fill="url(#town-roof)" />
        <Window x={459} y={194} w={27} h={37} /><Window x={521} y={194} w={27} h={37} />
        <path d="M479 331v-71h48v71" fill="#afb693" /><path d="M503 263v65" />
        <path d="M447 246h111m-107 5h103" opacity=".3" />
        <path d="M579 330v-39h81v41m-73-40v-14m65 14v-14" />
        <path d="M575 287h89m-89 8h89" />
        {/* Tiny station clock. */}
        <path d="M654 329V182h31v147" fill="#e6e3cc" /><path d="M649 183l20-28 21 28z" fill="#afb693" />
        <circle cx="670" cy="204" r="11" /><path d="M670 197v8l5 3" />
        {/* The corner store. */}
        <path d="M926 354V191h170v168" />
        <path d="M913 195l97-77 100 77z" fill="#d7dac4" /><path d="M913 195l97-77 100 77z" fill="url(#town-roof)" />
        <Window x={954} y={214} w={33} h={35} /><Window x={1035} y={214} w={33} h={35} />
        <path d="M933 269h156l15 29H918z" fill="#f4efdf" />
        <path d="M943 269l-10 29m36-29-5 29m35-29v29m30-29 5 29m24-29 11 29m-151 0q8 13 16 0 8 13 16 0 8 13 16 0 8 13 16 0 8 13 16 0 8 13 16 0 8 13 16 0 8 13 16 0 8 13 16 0 8 13 16 0" />
        <path d="M950 354v-42h53v42m22 1v-45h45v45" fill="#d4d8bf" /><path d="M976 313v40m-24-22h50M1047 312v42" />
        <rect x="971" y="252" width="78" height="17" fill="#29271f" />
        <text x="1010" y="264" textAnchor="middle" fill="#f4efdf" stroke="none" fontFamily="monospace" fontSize="9" letterSpacing="2">GENERAL</text>
        <path d="M1120 359v-34h33v34m-28-27 22 21m-22 0 22-21M1152 362v-26h27v26m-22-21 17 16m-17 0 17-16" fill="#ded5bc" />
        {/* Far-side houses. */}
        <path d="M1230 347V238h104v117" fill="#eae6d5" /><path d="M1218 241l64-61 65 61z" fill="#d5c9ae" />
        <Window x={1246} y={262} w={24} h={32} /><Window x={1294} y={262} w={24} h={32} />
        <path d="M1276 351v-39h25v40" fill="#afb693" />
        {/* Tree, large enough to give the couple shelter. */}
        <path d="M813 358q-10-60-1-125m7 125q8-62 5-125" fill="#d5c9ae" />
        <path d="M817 282l-27-28m29 7 31-27m-36 11-13-24" />
        <path d="M761 245q-40-17-24-47-22-34 12-53-4-36 33-37 22-38 54-11 41-12 47 27 38 7 31 40 29 35-6 57 1 33-40 35-32 21-58-3-31 17-49-8z" fill="#dbe0c7" />
        <path d="M761 245q-40-17-24-47-22-34 12-53-4-36 33-37 22-38 54-11 41-12 47 27 38 7 31 40 29 35-6 57 1 33-40 35-32 21-58-3-31 17-49-8z" fill="url(#town-hatch)" />
        <path d="M756 181q21-24 43-8m30-31q25-11 36 13m-84 58q27 10 38-11m40-5q22 5 28-12" opacity=".35" />
        {/* Street lamps, garden and bench. */}
        <path d="M361 365V222m-9 143h18m-9-143-10-24h20zM1197 383V241m-8 142h17m-9-142-10-24h20z" />
        <path d="M350 198h22m-11-7v7m826 19h20m-10-8v8" />
        <path d="M720 368h79m-73-6h66m-62-5v32m60-32v32m-60-44h60m-60-8h60m-60-8h60m-60-4v31m60-31v31" />
        <path d="M400 350q37-17 73 0l-8 19h-59z" fill="#d4c7a9" />
        <path d="M420 349v-25m0 15q-15-2-11-15 11-1 11 15m1-6q0-17 13-15 4 13-13 15m25 16v-32m0 17q-16-3-14-15 13-4 14 15m1-7q0-16 12-16 5 12-12 16" stroke="#6f7952" />
      </g>
      <g fill="none" stroke="#29271f" strokeLinecap="round">
        <path d="M0 383q90-26 187-18t185-14 200 25 217 5 200-10 207 35 204 9" strokeWidth="1.4" />
        <path d="M0 434q174-37 294-18t245 30 246-10 263 5 352 19" strokeWidth=".8" opacity=".5" />
        <path d="M289 371l-10 3m53-3 15-2m213 29 13 3m107-14 22 3m176 16 13-3m238 43 24 2M70 394l10-4m7 5 13-3m1186 28 18 4" opacity=".4" />
        <path d="M71 370l-3-18m3 18 9-13m-9 13-10-8M341 380l4-19m-4 19-8-13M887 402l-3-18m3 18 9-13m-9 13-10-8M1268 397l-3-18m3 18 9-13m-9 13-10-8" stroke="#6f7952" />
      </g>
    </svg>
  );
}

function JobProp({ job }) {
  return <svg className={`town-job-prop town-job-prop--${job}`} viewBox="0 0 80 90" aria-hidden="true">
    {job === 'sweeping' && <g fill="none" stroke="#29271f" strokeWidth="2"><path d="M47 25 21 77" /><path d="m19 72-9 11 21 5 1-13z" fill="#b9a776" /><path d="m19 77-5 7m11-6-4 7m8-6-3 7" /></g>}
    {job === 'carrying' && <g fill="#d9c7a0" stroke="#29271f" strokeWidth="1.6"><path d="M37 35h31v26H37z" /><path d="m39 38 26 20m0-20L39 58" /></g>}
    {job === 'gardening' && <g fill="#aeb58f" stroke="#29271f" strokeWidth="1.6"><path d="M44 47h17v16H44zM61 51l11-5 3 3-14 10" /><path d="M46 47q-4-12 8-12t5 12" fill="none" /><path d="m76 55 1 4m-5-2 1 4m7 0 1 4" fill="none" stroke="#77878b" /></g>}
  </svg>;
}

export default function Town({ heroArrived = false }) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const timerRef = useRef(null);
  const counts = useRef({});
  const [active, setActive] = useState(null);
  const [awake, setAwake] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    if (!heroArrived || !viewportRef.current) return;
    const viewport = viewportRef.current;
    // Bring the guide's ending into view on narrow screens before free exploration.
    viewport.scrollLeft = Math.max(0, viewport.scrollWidth * .58 - viewport.clientWidth / 2);
  }, [heroArrived]);

  useEffect(() => {
    const node = sectionRef.current;
    const observer = new IntersectionObserver(([entry]) => setAwake(entry.isIntersecting), { rootMargin: '100px' });
    observer.observe(node);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    const onEscape = (event) => { if (event.key === 'Escape') setActive(null); };
    const onOutside = (event) => { if (!event.target.closest('.town-person, .town-couple')) setActive(null); };
    document.addEventListener('keydown', onEscape);
    document.addEventListener('pointerdown', onOutside);
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) * .54);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('keydown', onEscape);
      document.removeEventListener('pointerdown', onOutside);
      clearTimeout(timerRef.current);
    };
  }, []);

  const talk = (resident) => {
    clearTimeout(timerRef.current);
    const count = counts.current[resident.id] || 0;
    counts.current[resident.id] = count + 1;
    setActive({ id: resident.id, text: resident.lines[Math.min(count, resident.lines.length - 1)] });
    timerRef.current = setTimeout(() => setActive(null), 3800);
  };
  const stare = () => {
    clearTimeout(timerRef.current);
    setActive({ id: 'couple', text: 'Oh. You’re still here?' });
    timerRef.current = setTimeout(() => setActive(null), 3200);
  };
  const staring = active?.id === 'couple';

  return (
    <section id="town" className="town" ref={sectionRef} aria-labelledby="town-title" data-awake={awake && pageVisible}>
      <header className="town-heading">
        <h2 id="town-title">A little place to land.</h2>
        <p>Everyone has a story. Some are just a little busy.</p>
      </header>
      <p className="town-mobile-hint">Drag across the town. Say hello to someone.</p>
      <div className="town-viewport" ref={viewportRef} tabIndex={0} role="region" aria-label="Interactive village. Scroll horizontally on small screens to meet all residents.">
        <div className="town-stage">
          <TownDrawing />
          {RESIDENTS.map((resident) => (
            <button
              key={resident.id}
              type="button"
              className={`town-person town-person--${resident.job}`}
              style={{ left: `${resident.x}%`, top: `${resident.y}%` }}
              data-speaking={active?.id === resident.id}
              onClick={() => talk(resident)}
              aria-label={resident.label}
            >
              <Character pose={active?.id === resident.id ? 'stare' : resident.job === 'walking' ? 'walk' : 'idle'} facing="right" />
              <JobProp job={resident.job} />
              <span className="town-person__shadow" />
              {active?.id === resident.id && <span className="town-speech" aria-hidden="true">{active.text}</span>}
            </button>
          ))}
          {heroArrived && (
            <div className="town-couple" data-staring={staring}>
              <span className="town-held-hands" aria-hidden="true" />
              <button type="button" className="town-couple__hero" onClick={stare} aria-label="Talk to the hero and his companion">
                <Character pose={staring ? 'stare' : 'hold'} facing="right" />
              </button>
              <button type="button" className="town-couple__girl" onClick={stare} aria-label="Talk to the hero’s companion">
                <Character pose={staring ? 'stare' : 'hold'} facing="left" girl />
              </button>
              <span className="town-hearts" aria-hidden="true">{[0, 1, 2].map((i) => <svg key={i} style={{ '--heart-delay': `${i * .9}s` }} viewBox="0 0 20 20"><path d="M10 17 3 10C-3 3 7-1 10 5 13-1 23 3 17 10Z" /></svg>)}</span>
              {staring && <span className="town-speech town-speech--couple" aria-hidden="true">{active.text}</span>}
            </div>
          )}
          <span className="town-sign" aria-hidden="true">you made it.</span>
        </div>
      </div>
      <p className="town-note">No quests left. Just life happening.</p>
      <span className="town-live" role="status" aria-live="polite">{active?.text || ''}</span>
    </section>
  );
}
