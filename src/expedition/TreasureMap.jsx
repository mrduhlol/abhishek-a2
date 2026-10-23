import { useEffect, useId, useRef } from "react";
import { chapterAt, projectProgress } from "./route.js";
import "./treasure-map.css";

// x, elevation, depth. The same spatial spline draws the trail and locates the
// traveller. Progress knots use the world's actual project centers, with a
// short approach before the highlands and a final stretch to the ending cave.
const WAYPOINTS = [
  [130, 70, -35],
  [320, 24, 90],
  [510, 38, -95],
  [700, 30, 85],
  [890, 10, -70],
  [1080, 54, 95],
  [1270, 86, -70],
  [1470, 28, 70],
];
const ROUTE_POINTS = [[45, 35, 20], ...WAYPOINTS];
const ROUTE_PROGRESS = [0, ...Array.from({ length: 7 }, (_, index) => projectProgress(index)), 1];
const BIOMES = [
  { name: "Highlands", color: "#a0acaa", edge: "#707c79" },
  { name: "Forest", color: "#9da77e", edge: "#707955" },
  { name: "Meadow", color: "#b5b788", edge: "#85865e" },
  { name: "Desert", color: "#d5b88a", edge: "#a9895d" },
  { name: "Coast", color: "#a1b7b0", edge: "#6d8d86" },
  { name: "Cave", color: "#b1a4b4", edge: "#807287" },
  { name: "Volcano", color: "#bd9d87", edge: "#8c6b59" },
];
const LAND = "M-94-6C-100-27-72-46-40-49C-12-64 20-54 39-46C67-49 90-33 94-13C110 9 86 34 53 39C27 54-8 49-29 44C-61 49-86 31-94 10Z";
const clamp = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const project = ([x, elevation, depth]) => ({ x, y: 310 + depth * 0.62 - elevation });

function routePoint(progress) {
  const position = clamp(progress);
  let index = 0;
  while (index < ROUTE_POINTS.length - 2 && position > ROUTE_PROGRESS[index + 1]) index++;
  const t = (position - ROUTE_PROGRESS[index]) / (ROUTE_PROGRESS[index + 1] - ROUTE_PROGRESS[index]);
  const a = ROUTE_POINTS[Math.max(0, index - 1)];
  const b = ROUTE_POINTS[index];
  const c = ROUTE_POINTS[index + 1];
  const d = ROUTE_POINTS[Math.min(ROUTE_POINTS.length - 1, index + 2)];
  return project(b.map((value, axis) => 0.5 * (
    2 * value + (-a[axis] + c[axis]) * t +
    (2 * a[axis] - 5 * value + 4 * c[axis] - d[axis]) * t * t +
    (-a[axis] + 3 * value - 3 * c[axis] + d[axis]) * t * t * t
  )));
}

function routePath(end = 1) {
  const count = Math.max(1, Math.ceil(end * 224));
  return Array.from({ length: count + 1 }, (_, index) => {
    const { x, y } = routePoint(end * index / count);
    return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

const TRAIL = routePath();

function Tree({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0V-21" stroke="#595d3e" strokeWidth="3" />
      <path d="M0-54-17-24H-10L-22-9H0Z" fill="#60724f" />
      <path d="M0-54 17-24H10L22-9H0Z" fill="#435c42" />
      <path d="M0-45-10-26H-5L-14-15" fill="none" stroke="#b1bd8d" strokeWidth="1.5" />
    </g>
  );
}

function Cave({ end = false }) {
  return (
    <g transform={end ? "translate(0 -8) scale(.8)" : "translate(0 -15)"}>
      <path d="M-58 12-48-31-22-57 10-64 38-42 62 8 38 23-35 26Z" fill="#807384" />
      <path d="M-58 12-48-31-22-57-6-22-25 15Z" fill="#b7a9b8" />
      <path d="M10-64 38-42 62 8 31 8 18-27Z" fill="#665e70" />
      <path d="M-25 22V-8Q-23-37 0-38Q25-36 27-8V22Z" fill="#3d3c40" />
      <path d="M-14 22V-6Q-11-28 4-27Q19-27 19-6V22" fill="#242e2c" />
      <path d="M-46-5-40-19-35-3-40 6Z" fill="#ddd0d7" />
      <path d="M34 0 40-18 46-1 40 8Z" fill="#c5b8ca" />
      {end && <path d="M-10 16Q1 5 14 16" fill="none" stroke="#c5b587" strokeWidth="2" />}
    </g>
  );
}

function Terrain({ index }) {
  switch (index) {
    case 0:
      return <g>
        <path d="M-75 1-41-71 7-3Z" fill="#778b88" />
        <path d="M-41-71 7-3-31-17Z" fill="#566d6a" />
        <path d="M-37 5 7-109 63-8Z" fill="#9dacaa" />
        <path d="M7-109 63-8 10-28Z" fill="#657d7b" />
        <path d="M-6-77 7-109 25-76 12-83 5-73Z" fill="#f4efdf" />
        <path d="M-53-46-41-71-27-49-40-55Z" fill="#e3e3d2" />
        <path d="M42 0 65-52 87 5Z" fill="#859a95" />
        <path d="M65-52 87 5 65-7Z" fill="#5c7470" />
      </g>;
    case 1:
      return <g>
        <path d="M-72 4Q-25-37 14-14T77 4" fill="none" stroke="#c4c69d" strokeWidth="3" />
        {[[-55, -8, .8], [-22, -24, 1.1], [13, -30, .9], [49, -11, 1.15], [-69, 13, .65], [72, 14, .6]].map(([x, y, scale]) =>
          <Tree key={x} x={x} y={y} scale={scale} />)}
        <path d="M-30 21Q0 10 25 21" fill="none" stroke="#727c52" strokeWidth="2" />
      </g>;
    case 2:
      return <g>
        <path d="M-82 3Q-49-60-7-26Q27-75 76-6Q33 15-15 7Z" fill="#97a674" />
        <path d="M-76 3Q-43-21-7-26Q14-15 30-5" fill="none" stroke="#d0d0a5" strokeWidth="2" />
        <path d="M-67 22Q-31-1 0 13T68 20" fill="none" stroke="#d1d1a2" strokeWidth="2" />
        <path d="M37-16V-62M19-45H55M24-59 50-31M50-59 24-31" stroke="#6b7350" strokeWidth="3" />
        <path d="M31-16 35-40H40L45-16Z" fill="#e4dab4" />
        {[[-49, 12], [-29, 28], [58, 12], [7, -8]].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}>
          <path d="M0 0-2-8M0 0 4-7" stroke="#707e50" strokeWidth="1.5" />
          <circle cy="-10" r="2.4" fill="#ede0ac" />
        </g>)}
      </g>;
    case 3:
      return <g>
        <path d="M-82 8Q-68-42-24-38Q-7-69 33-45Q62-38 83 6Z" fill="#c3a06b" />
        <path d="M-82 8Q-42-21-24-38Q-3-13 35-1Q62-9 83 6" fill="#e6cca0" />
        <path d="M-24-38Q-7-69 33-45Q38-26 62-11Q13-31-24-38" fill="#e2c491" />
        <path d="M-65 18Q-28 2 7 17T71 20M-45 29Q-17 19 10 28" fill="none" stroke="#b08b58" strokeWidth="1.5" />
        <path d="M56 0V-28M56-13H48V-24M56-18H64V-33" fill="none" stroke="#85825a" strokeWidth="5" strokeLinecap="round" />
      </g>;
    case 4:
      return <g>
        <path d="M-83-12Q-25-32 0-10T85 0L72 31Q23 54-28 36L-85 18Z" fill="#6d9b98" />
        <path d="M-85-15Q-33-38 1-14T87-2L84 10Q27 20-3-3T-85-3Z" fill="#e0ce9f" />
        <path d="M-85-3Q-38-25-3-3T84 10" fill="none" stroke="#f3ead0" strokeWidth="3" />
        <path d="M-63 19Q-46 11-29 19M2 28Q20 20 39 28M47 15Q59 9 71 15" fill="none" stroke="#c4d3bb" strokeWidth="2" />
        <path d="M-36-17V-70H-18V-15Z" fill="#dfd9bc" />
        <path d="M-36-70-27-83-18-70Z" fill="#795d47" />
        <path d="M-37-62H-17M-36-42H-18" stroke="#9a7054" strokeWidth="5" />
        <path d="M-41-69H-13M-27-62V-53" stroke="#5a6456" strokeWidth="2" />
      </g>;
    case 5:
      return <Cave />;
    default:
      return <g>
        <path d="M-75 9-29-75 22-80 77 13Z" fill="#9a7868" />
        <path d="M-29-75-9-65 22-80 77 13 14-9Z" fill="#725b51" />
        <path d="M-29-75Q-3-91 22-80Q6-64-9-65Z" fill="#4d4540" />
        <path d="M-20-76Q-2-82 14-78Q0-69-12-70Z" fill="#bb6c43" />
        <path d="M-7-67 4-45-5-29 14-9 30 12" fill="none" stroke="#c58250" strokeWidth="5" />
        <path d="M0-96Q-18-115-7-130M12-100Q26-116 15-138" fill="none" stroke="#877a65" strokeWidth="3" strokeLinecap="round" opacity=".5" />
        <path d="M-65 18-54 5-40 18M42 23 54 9 65 25" fill="#8e705e" />
      </g>;
  }
}

function Geography() {
  return <>
    <g className="treasure-map__sea-lines" fill="none" stroke="#a6aa91" strokeWidth="1">
      <path d="M40 357Q150 298 264 378T481 365T730 390T967 372T1190 392T1554 411" />
      <path d="M42 367Q151 308 263 388T482 375T731 400T968 382T1191 402T1556 421" />
      <path d="M44 378Q154 320 264 399T483 387T732 412T969 394T1192 414T1558 433" />
      <path d="M227 134Q328 84 420 130T636 143T849 106T1079 136T1351 112" />
      <path d="M229 143Q330 93 420 140T636 153T849 116T1079 146T1351 122" />
    </g>
    {BIOMES.map((biome, index) => {
      const { x, y } = project(WAYPOINTS[index]);
      return <g key={biome.name} transform={`translate(${x} ${y})`}>
        <ellipse cy="37" rx="93" ry="29" fill="#665b3c" opacity=".1" />
        <path d={LAND} transform="translate(0 18)" fill={biome.edge} />
        <path d={LAND} fill={biome.color} stroke={biome.edge} strokeWidth="1.3" />
        <path d="M-77 11Q-50 38-19 30T38 30Q64 28 81 13M-66 19Q-40 41-12 37T56 34" fill="none" stroke="#eee7c9" strokeWidth="1" opacity=".5" />
        <Terrain index={index} />
      </g>;
    })}
    <g transform={`translate(${project(WAYPOINTS[7]).x} ${project(WAYPOINTS[7]).y})`}>
      <path d={LAND} transform="translate(0 15) scale(.72)" fill="#8c8771" />
      <path d={LAND} transform="scale(.72)" fill="#b5b19a" stroke="#8c8771" />
      <Cave end />
    </g>
  </>;
}

export default function TreasureMap({ open, onClose, onTravel, progress = 0, projects = [], world, onTown }) {
  const dialogRef = useRef(null);
  const viewportRef = useRef(null);
  const stageRef = useRef(null);
  const closeRef = useRef(onClose);
  const progressRef = useRef(progress);
  const backdropDown = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const instructionId = useId();
  const amount = clamp(progress);
  const position = routePoint(amount);
  const stops = projects.slice(0, 7);
  const currentStop = chapterAt(amount);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      const stage = stageRef.current;
      if (viewport && stage) {
        viewport.scrollLeft = stage.offsetLeft - viewport.offsetLeft + routePoint(progressRef.current).x / 1600 * stage.clientWidth - viewport.clientWidth / 2;
      }
    });

    const keepFocus = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current?.();
      }
      if (event.key !== "Tab") return;
      const targets = [...dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    dialog.addEventListener("keydown", keepFocus);
    return () => {
      cancelAnimationFrame(frame);
      dialog.removeEventListener("keydown", keepFocus);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const travel = (target) => {
    onTravel?.(target);
    onClose?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className="treasure-map"
      data-panel="expedition-map"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose?.(); }}
      onPointerDown={(event) => { backdropDown.current = event.target === event.currentTarget; }}
      onClick={(event) => {
        if (backdropDown.current && event.target === event.currentTarget) onClose?.();
        backdropDown.current = false;
      }}
    >
      <div className="treasure-map__paper">
        <header className="treasure-map__header">
          <div>
            <h2 id={titleId}>The expedition</h2>
            <p id={descriptionId}>Seven places. One winding trail.</p>
          </div>
          <button type="button" className="treasure-map__close" onClick={onClose} aria-label="Close expedition map" autoFocus>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div className="treasure-map__viewport" ref={viewportRef} tabIndex={0} role="region" aria-label="Expedition chart, scroll horizontally to explore" aria-describedby={instructionId}>
          <div className="treasure-map__stage" ref={stageRef}>
            <svg className="treasure-map__geography" viewBox="0 0 1600 600" fill="none" aria-hidden="true" focusable="false">
              <g transform="translate(84 90)" stroke="#80775c" strokeWidth="1">
                <circle r="27" /><circle r="21" opacity=".45" />
                <path d="M0-42V42M-42 0H42M-19-19 19 19M19-19-19 19" opacity=".5" />
                <path d="M0-28 7 0 0 27-7 0Z" fill="#e4d6b6" />
                <path d="M0-28V0H7Z" fill="#6d7350" />
              </g>
              <Geography />
              <path d={TRAIL} stroke="#695d43" strokeWidth="13" opacity=".17" transform="translate(0 7)" strokeLinecap="round" />
              <path d={TRAIL} stroke="#e9d7af" strokeWidth="12" strokeLinecap="round" />
              <path d={TRAIL} stroke="#8c7654" strokeWidth="2.5" strokeDasharray="4 7" strokeLinecap="round" />
              {amount > 0 && <path d={routePath(amount)} stroke="#8b503a" strokeWidth="3.5" strokeLinecap="round" />}
              <g stroke="#625d47" strokeWidth="1.4">
                <path d="M1284 506h192m-192-5v10m64-10v10m64-10v10m64-10v10" />
                <path d="M1284 506h64m64 0h64" strokeWidth="5" />
              </g>
            </svg>
            <span className="treasure-map__north" aria-hidden="true">N</span>
            <span className="treasure-map__marginalia" aria-hidden="true">a few good detours.</span>
            <span className="treasure-map__scale" aria-hidden="true">not to scale · made for wandering</span>
            <nav aria-label="Project destinations">
              {stops.map((item, index) => {
                const point = project(WAYPOINTS[index]);
                return <button
                  type="button"
                  key={item.id || index}
                  className="treasure-map__stop"
                  style={{ left: `${point.x / 16}%`, top: `${point.y / 6}%`, "--stop-ink": BIOMES[index].edge }}
                  onClick={() => travel(projectProgress(index))}
                  aria-label={`Travel to ${item.name}, ${BIOMES[index].name}, stop ${index + 1} of 7`}
                  aria-current={currentStop === index && world !== "town" ? "location" : undefined}
                >
                  <span className="treasure-map__number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="treasure-map__stop-label"><strong>{item.name}</strong><span>{BIOMES[index].name}</span></span>
                </button>;
              })}
            </nav>
            <button type="button" className="treasure-map__end-label treasure-map__end-stop" onClick={() => travel(1)} aria-label="Travel to the final cave">The final cave<span>Beyond the ember valley</span></button>
            <div className="treasure-map__traveller" style={{ left: `${position.x / 16}%`, top: `${position.y / 6}%` }} role="img" aria-label={`Your position: ${Math.round(amount * 100)} percent along the trail`}>
              <span>You are here</span>
              <svg viewBox="0 0 24 34" width="24" height="34" aria-hidden="true"><path d="M12 32C9 23 2 19 2 12a10 10 0 0 1 20 0c0 7-7 11-10 20Z" fill="#934f39" stroke="#f4e8cc" strokeWidth="2" /><circle cx="12" cy="12" r="3.5" fill="#f4e8cc" /></svg>
            </div>
          </div>
        </div>

        <footer className="treasure-map__footer">
          <p className="treasure-map__location"><span aria-hidden="true" />{world === "town" ? "In the little town" : `${Math.round(amount * 100)}% along the trail`}</p>
          <p id={instructionId} className="treasure-map__instruction"><span className="treasure-map__scroll-hint">Scroll across the chart. </span>Select a place to travel.</p>
          {world === "town" && typeof onTown === "function" && <button type="button" className="treasure-map__town" onClick={() => { onTown(); onClose?.(); }}>Return to town <span aria-hidden="true">→</span></button>}
        </footer>
      </div>
    </dialog>
  );
}
