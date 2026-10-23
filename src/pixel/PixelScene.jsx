import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PROJECTS } from "../data/projects";
import {
  START_X,
  END_X,
  clamp,
  chapterAtX,
  pathY,
  OBSTACLES,
  resolveTravel,
} from "./route";
import { drawActor } from "./actors";
import { drawVehicle } from "./vehicles";
import { TOWN_NPCS } from "./town";
const BASE = import.meta.env.BASE_URL;
const MARKS = [
  "",
  "voxlink.png",
  "github-widgets.svg",
  "inkora.svg",
  "docutype.svg",
  "stikr.png",
  "black-jack.svg",
];
const GUIDES = ["Tashi", "Jun", "Ari", "Nila", "Finn", "Pip", "Ash"];
function canvas(w, h, paint) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  paint(ctx);
  return c;
}
function obstaclePaint(ctx, type) {
  ctx.fillStyle = "#252b29";
  if (type === "jump") {
    ctx.fillRect(2, 21, 60, 15);
    ctx.fillStyle = "#77503c";
    ctx.fillRect(3, 19, 57, 14);
    ctx.fillStyle = "#b28c53";
    ctx.fillRect(5, 19, 53, 3);
    ctx.fillRect(3, 21, 7, 11);
    ctx.fillStyle = "#493e32";
    for (let i = 0; i < 7; i++) ctx.fillRect(14 + i * 6, 24 + (i % 3), 4, 2);
    ctx.fillStyle = "#617148";
    ctx.fillRect(20, 16, 10, 4);
    ctx.fillRect(46, 17, 8, 3);
  } else {
    ctx.fillRect(4, 6, 6, 36);
    ctx.fillRect(54, 6, 6, 36);
    ctx.fillStyle = "#63734d";
    ctx.fillRect(2, 2, 60, 8);
    ctx.fillStyle = "#afbd78";
    for (let i = 0; i < 10; i++) ctx.fillRect(3 + i * 6, 1 + (i % 3), 5, 3);
    ctx.fillStyle = "#9a7750";
    ctx.fillRect(6, 11, 2, 29);
    ctx.fillRect(56, 11, 2, 29);
  }
}
export default function PixelScene(props) {
  const host = useRef(null),
    latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });
  const [people, setPeople] = useState([]);
  const talk = useRef(() => {});
  useEffect(() => {
    const node = host.current;
    let disposed = false,
      frame = 0,
      renderer;
    const textures = [],
      materials = [],
      geometries = [],
      targets = [],
      scenery = [],
      actors = [];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#243a39");
    const camera = new THREE.OrthographicCamera(-52, 52, 32, -32, 0.1, 200);
    camera.position.set(START_X, pathY(START_X) + 8, 100);
    let x = START_X,
      world = "trail",
      last = 0,
      clock = 0,
      jumpTime = -99,
      crouch = false,
      entered = false,
      entranceTime = 0,
      stareUntil = 0,
      townWalk = 0,
      hover = null,
      signal = -1,
      actionSerial = -1,
      blocked = null,
      chapter = -1,
      report = 0,
      walkDistance = 0;
    let hero, vehicle, girl, hearts, torch, trailGroup, townGroup;
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const cache = new Map(),
      welcomed = new Set();
    let torchDrawUntil = 0;
    const texture = (image) => {
      const t = new THREE.CanvasTexture(image);
      t.magFilter = t.minFilter = THREE.NearestFilter;
      t.generateMipmaps = false;
      t.colorSpace = THREE.SRGBColorSpace;
      textures.push(t);
      return t;
    };
    const plane = (image, w, h, group, px = 0, py = 0, z = 1) => {
      const mat = new THREE.MeshBasicMaterial({
        map: texture(image),
        transparent: true,
        alphaTest: 0.01,
        depthWrite: false,
      });
      materials.push(mat);
      const geo = new THREE.PlaneGeometry(w, h);
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, z);
      mesh.renderOrder = z;
      group.add(mesh);
      return mesh;
    };
    const actorTexture = (kind, pose, step, direction, lit = false) => {
      const key = [kind, pose, step, direction, lit].join(":");
      if (!cache.has(key))
        cache.set(
          key,
          texture(
            canvas(32, 48, (ctx) =>
              drawActor(ctx, {
                kind,
                pose,
                frame: step,
                direction,
                torch: lit,
                age:
                  kind === "hero" || kind === "girl"
                    ? "teen"
                    : kind === "child"
                      ? "child"
                      : kind === "elder"
                        ? "elder"
                        : "adult",
              }),
            ),
          ),
        );
      return cache.get(key);
    };
    const makeActor = (data, group) => {
      const mesh = plane(
        canvas(32, 48, () => {}),
        5,
        7.5,
        group,
        data.x,
        data.y + 3.6,
        12,
      );
      mesh.userData.action = { type: "npc", person: data };
      if (data.id !== "hero") targets.push(mesh);
      const actor = { mesh, data };
      actors.push(actor);
      return actor;
    };
    const setActor = (a, pose, step = 0, dir = 1, lit = false) => {
      a.mesh.material.map = actorTexture(
        a.data.kind || "man",
        pose,
        step,
        dir,
        lit,
      );
    };
    const portal = (group, px, py, id) => {
      const p = plane(
        canvas(72, 80, (c) => {
          c.fillStyle = "#252832";
          c.fillRect(3, 12, 66, 66);
          c.fillStyle = "#72777b";
          c.fillRect(0, 23, 72, 48);
          c.fillRect(8, 8, 54, 20);
          c.fillRect(20, 0, 30, 10);
          c.fillStyle = "#aaa591";
          for (let i = 0; i < 9; i++)
            c.fillRect((i * 17) % 63, 10 + Math.floor(i / 3) * 20, 12, 5);
          c.fillStyle = "#101e29";
          c.fillRect(20, 29, 32, 48);
          c.fillRect(25, 20, 22, 10);
          c.fillStyle = "#c9ab62";
          c.fillRect(18, 35, 3, 8);
          c.fillRect(52, 35, 3, 8);
        }),
        11.25,
        12.5,
        group,
        px,
        py + 5,
        9,
      );
      p.userData.action = { type: "portal", id };
      targets.push(p);
      return p;
    };
    const projectPoint = (m) => {
      const v = m.position.clone().project(camera);
      return {
        x: (v.x + 1) / 2,
        y: (1 - v.y) / 2,
        visible: Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.94,
      };
    };
    const resize = () => {
      if (!renderer) return;
      const w = node.clientWidth,
        h = node.clientHeight;
      const viewH = world === "town" ? (w < 650 ? 110 : 95) : w < 650 ? 72 : 64;
      camera.left = (-viewH * w) / h / 2;
      camera.right = -camera.left;
      camera.top = viewH / 2;
      camera.bottom = -viewH / 2;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(1);
      renderer.setSize(
        Math.max(1, Math.floor(w / 2)),
        Math.max(1, Math.floor(h / 2)),
        false,
      );
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
    };
    const choose = (event) => {
      const r = node.getBoundingClientRect();
      pointer.set(
        ((event.clientX - r.left) / r.width) * 2 - 1,
        (-(event.clientY - r.top) / r.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      return (
        raycaster.intersectObjects(
          targets.filter((m) => m.visible && m.parent.visible),
          false,
        )[0]?.object || null
      );
    };
    const speak = (person) => {
      if (person.id === "town-girl" || person.id === "hero")
        stareUntil = clock + 5;
      latest.current.onNpc?.(person);
    };
    talk.current = speak;
    const click = (e) => {
      if (!latest.current.entered || latest.current.paused) return;
      const hit = choose(e);
      const action = hit?.userData.action;
      if (action?.type === "project") latest.current.onProject?.(action.index);
      if (action?.type === "npc") speak(action.person);
      if (action?.type === "portal" && (world === "town" || x > END_X - 18))
        latest.current.onPortal?.();
    };
    const move = (e) => {
      if (latest.current.paused) return;
      hover = choose(e);
      node.style.cursor = hover ? "pointer" : "default";
    };
    const leave = () => {
      hover = null;
      node.style.cursor = "default";
    };
    const perform = (name) => {
      if (latest.current.paused) return;
      if (
        name === "jump" &&
        clock - jumpTime > 0.8 &&
        !crouch &&
        world === "trail"
      )
        jumpTime = clock;
      if (name === "crouch") crouch = true;
      if (name === "stand") crouch = false;
    };
    const keydown = (e) => {
      if (
        e.target.closest("input,textarea,button,a,[data-panel]") ||
        !latest.current.entered
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) perform("jump");
      }
      if (e.key === "Shift") {
        e.preventDefault();
        perform("crouch");
      }
    };
    const keyup = (e) => {
      if (e.key === "Shift") crouch = false;
    };
    const blur = () => {
      crouch = false;
      last = 0;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("click", click);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    async function init() {
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: false,
          powerPreference: "low-power",
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute("aria-label", "Pixel adventure world");
        renderer.domElement.style.imageRendering = "pixelated";
        node.prepend(renderer.domElement);
        resize();
        trailGroup = new THREE.Group();
        townGroup = new THREE.Group();
        scene.add(trailGroup, townGroup);
        townGroup.visible = false;
        const atlas = new Image();
        atlas.src = `${BASE}pixel/terrain-atlas.png`;
        await atlas.decode();
        if (disposed) return;
        for (let i = 0; i < 7; i++) {
          const art = canvas(768, 512, (c) =>
            c.drawImage(
              atlas,
              ((i % 2) * atlas.width) / 2,
              (Math.floor(i / 2) * atlas.height) / 4,
              atlas.width / 2,
              atlas.height / 4,
              0,
              0,
              768,
              512,
            ),
          );
          const bg = plane(art, 120, 80, trailGroup, i * 120 + 60, -40, 0);
          scenery.push(bg);
          if (i === 0 || i === 6) {
            const edge = plane(
              art,
              120,
              80,
              trailGroup,
              i === 0 ? -60 : 900,
              -40,
              0,
            );
            edge.scale.x = -1;
            scenery.push(edge);
          }
          if (i === 4)
            plane(
              canvas(128, 56, (c) => {
                c.fillStyle = "#3d3e36";
                c.fillRect(2, 18, 122, 35);
                c.fillStyle = "#70543b";
                c.fillRect(0, 10, 128, 35);
                for (let y = 10; y < 43; y += 6) {
                  c.fillStyle = y % 12 ? "#ac8956" : "#967349";
                  c.fillRect(2, y, 124, 5);
                  c.fillStyle = "#cfaf71";
                  c.fillRect(3, y, 122, 1);
                }
                c.fillStyle = "#463d31";
                for (const px of [4, 116]) {
                  c.fillRect(px, 1, 7, 50);
                  c.fillStyle = "#b79765";
                  c.fillRect(px, 1, 7, 4);
                  c.fillStyle = "#463d31";
                }
              }),
              20,
              8.75,
              trailGroup,
              i * 120 + 60,
              pathY(i * 120 + 60) + 8.5,
              7,
            );
          const guide = {
            id: `guide-${i}`,
            name: GUIDES[i],
            kind: i % 2 ? "woman" : "man",
            x: i * 120 + 56,
            y: pathY(i * 120 + 56) + 7,
            dialogue: `Welcome to ${PROJECTS[i].name}! ${i === 1 ? "Keep your torch close." : i === 3 ? "Your truck is ready for the dunes." : i === 4 ? "Hop aboard. We’ll take the water route." : "Take your time. There’s plenty to discover."}`,
          };
          makeActor(guide, trailGroup);
          const base = plane(
            canvas(64, 64, (c) => {
              c.fillStyle = "#342f38";
              c.fillRect(8, 20, 48, 40);
              c.fillStyle = "#9d8151";
              c.fillRect(10, 14, 44, 41);
              c.fillStyle = "#c2ae74";
              c.fillRect(12, 12, 40, 7);
              c.fillStyle = "#555642";
              c.fillRect(15, 57, 34, 5);
            }),
            10,
            10,
            trailGroup,
            i * 120 + 65,
            pathY(i * 120 + 65) + 11,
            8,
          );
          const logo = plane(
            canvas(64, 64, (c) => {
              c.fillStyle = "#e9dab6";
              c.font = "bold 13px sans-serif";
              c.textAlign = "center";
              c.fillText("ORBIT", 32, 35);
            }),
            7,
            7,
            trailGroup,
            base.position.x,
            base.position.y + 1,
            10,
          );
          logo.userData.action = { type: "project", index: i };
          logo.userData.restY = logo.position.y;
          targets.push(logo);
          base.userData.action = logo.userData.action;
          targets.push(base);
          if (MARKS[i]) {
            const image = new Image();
            image.src = `${BASE}expedition/logos/${MARKS[i]}`;
            await image.decode();
            if (disposed) return;
            const tex = texture(image);
            logo.material.map = tex;
          }
        }
        for (const o of OBSTACLES) {
          const m = plane(
            canvas(64, 48, (c) => obstaclePaint(c, o.type)),
            10,
            7.5,
            trailGroup,
            o.x,
            pathY(o.x) + (o.type === "jump" ? 1.3 : 3),
            11,
          );
          m.userData.obstacle = o;
        }
        portal(trailGroup, END_X + 2, pathY(END_X), "trail-cave");
        const townImage = new Image();
        townImage.src = `${BASE}pixel/town.png`;
        await townImage.decode();
        if (disposed) return;
        plane(townImage, 240, 120, townGroup, 120, -60, 0);
        for (const resident of TOWN_NPCS) {
          const data = {
            ...resident,
            id: `town-${resident.id}`,
            kind: resident.working
              ? resident.role === "blacksmith"
                ? "smith"
                : resident.role
              : resident.kind,
            x: resident.x / 6.4 + (resident.id === "elder" ? 10 : 0),
            y: -resident.y / 6.4,
          };
          const a = makeActor(data, townGroup);
          if (data.id === "town-girl") girl = a;
        }
        if (!girl)
          girl = makeActor(
            {
              id: "town-girl",
              name: "Mira",
              kind: "woman",
              x: 820 / 6.4,
              y: -510 / 6.4,
              dialogue: "You made it. Stay a little?",
            },
            townGroup,
          );
        portal(townGroup, 14, -48, "return-cave").material.opacity = 0;
        hero = makeActor(
          {
            id: "hero",
            name: "Your guide",
            kind: "hero",
            x: START_X,
            y: pathY(START_X),
            dialogue: "A little detour was worth it.",
          },
          scene,
        );
        hero.mesh.userData.action = { type: "npc", person: hero.data };
        targets.push(hero.mesh);
        vehicle = plane(
          canvas(96, 64, (c) => drawVehicle(c, { kind: "boat", frame: 0 })),
          15,
          10,
          scene,
          0,
          0,
          13,
        );
        hearts = plane(
          canvas(32, 20, (c) => {
            c.fillStyle = "#f197a1";
            for (const [px, py] of [
              [2, 5],
              [18, 0],
            ]) {
              c.fillRect(px, py, 4, 4);
              c.fillRect(px + 6, py, 4, 4);
              c.fillRect(px, py + 3, 10, 4);
              c.fillRect(px + 2, py + 7, 6, 3);
              c.fillRect(px + 4, py + 10, 2, 2);
            }
          }),
          5,
          3.1,
          scene,
          0,
          0,
          20,
        );
        torch = plane(
          canvas(96, 96, (c) => {
            for (let r = 44; r > 2; r -= 5) {
              c.fillStyle = `rgba(255,193,83,${0.012 + (44 - r) * 0.0008})`;
              c.fillRect(48 - r, 48 - r, r * 2, r * 2);
            }
          }),
          22,
          22,
          scene,
          0,
          0,
          15,
        );
        torch.material.blending = THREE.AdditiveBlending;
        renderer.domElement.dataset.assetsReady = "true";
        renderer.domElement.dataset.assetsState = "loaded";
        latest.current.onReady?.();
        frame = requestAnimationFrame(tick);
      } catch (e) {
        if (!disposed) {
          latest.current.onError?.(e);
          console.error("Pixel world failed to load", e);
        }
      }
    }
    function tick(stamp) {
      if (disposed) return;
      const dt = last ? Math.min(0.25, (stamp - last) / 1000) : 0.016;
      last = stamp;
      const p = latest.current;
      if (!document.hidden) clock += dt;
      if (world !== p.world) {
        world = p.world;
        townWalk = 0;
        trailGroup.visible = world === "trail";
        townGroup.visible = world === "town";
        chapter = -1;
        blocked = null;
        resize();
      }
      if (p.action?.serial !== actionSerial) {
        actionSerial = p.action?.serial;
        perform(p.action?.name);
      }
      if (p.entered && !entered) {
        entered = true;
        entranceTime = clock;
        jumpTime = clock;
      }
      if (!p.entered) {
        entered = false;
        x = START_X;
      }
      const desired = START_X + clamp(p.progress) * (END_X - START_X);
      if (p.navigation !== signal) {
        if (signal !== -1 && world === "trail") {
          x = desired;
          camera.position.x = x + (node.clientWidth > 650 ? 10 : 0);
          camera.position.y = pathY(x) + 12;
        }
        signal = p.navigation;
        blocked = null;
      }
      const jumpAge = clock - jumpTime,
        jump =
          jumpAge >= 0 && jumpAge < 0.9
            ? Math.sin((jumpAge / 0.9) * Math.PI) * 6
            : 0;
      const previous = x;
      let heroX = x,
        heroY = pathY(x),
        mode = "walk";
      if (world === "trail") {
        if (entered && !p.paused) {
          const step =
            Math.sign(desired - x) *
            Math.min(Math.abs(desired - x), dt * (crouch ? 10 : 26));
          const result = resolveTravel(x, x + step, {
            jump,
            crouch,
            assisted: p.assisted || p.reducedMotion,
          });
          x = result.x;
          blocked = result.blocked;
        }
        const c = chapterAtX(x);
        if (c !== chapter) {
          chapter = c;
          if (c === 1) torchDrawUntil = clock + 1.2;
          setPeople(
            actors.filter((a) => a.data.id === `guide-${c}`).map((a) => a.data),
          );
        }
        const guide = actors.find((a) => a.data.id === `guide-${c}`);
        if (entered && Math.abs(x - guide.data.x) < 22 && !welcomed.has(c)) {
          welcomed.add(c);
          latest.current.onNpc?.(guide.data);
        }
        mode = c === 4 ? "boat" : c === 3 ? "truck" : "walk";
        heroX = x;
        heroY = pathY(x);
        walkDistance += Math.abs(x - previous);
      } else {
        if (!p.paused)
          townWalk = p.reducedMotion ? 1 : Math.min(1, townWalk + dt / 7);
        const stops = [
          [18, -56],
          [42, -68],
          [80, -76],
          [girl.data.x - 4.84375, girl.data.y],
        ];
        const leg = Math.min(2, Math.floor(townWalk * 3)),
          t = townWalk === 1 ? 1 : townWalk * 3 - leg;
        heroX = stops[leg][0] + (stops[leg + 1][0] - stops[leg][0]) * t;
        heroY = stops[leg][1] + (stops[leg + 1][1] - stops[leg][1]) * t;
        if (chapter !== 7) {
          chapter = 7;
          setPeople(
            actors
              .filter((a) => a.mesh.parent === townGroup)
              .map((a) => a.data),
          );
        }
      }
      const moving =
        world === "trail" ? Math.abs(x - previous) > 0.001 : townWalk < 1;
      const staring = clock < stareUntil;
      const pose =
        world === "town" && townWalk === 1
          ? staring
            ? "hold-stare"
            : "hold"
          : mode !== "walk"
            ? "sit"
            : chapter === 1 && clock < torchDrawUntil
              ? "draw"
              : jump > 0
                ? "jump"
                : crouch
                  ? "crouch"
                  : moving
                    ? "walk"
                    : "idle";
      hero.mesh.position.set(
        heroX,
        heroY +
          3.6 +
          (world === "trail" && mode === "walk" ? jump : 0) +
          (entered && clock - entranceTime < 1
            ? Math.max(0, 1 - (clock - entranceTime)) * 12
            : 0),
        14,
      );
      setActor(
        hero,
        pose,
        moving ? Math.floor(walkDistance * 1.8 + clock * 2) % 4 : 0,
        desired >= x ? 1 : -1,
        world === "trail" && chapter === 1,
      );
      for (const a of actors) {
        if (a === hero) continue;
        const inTown = a.mesh.parent === townGroup;
        const movingNpc = inTown && !a.data.working && a !== girl;
        const sway = p.reducedMotion ? 0 : Math.sin(clock * 0.5 + a.data.x) * 2;
        a.mesh.position.x = a.data.x + (movingNpc ? sway : 0);
        a.mesh.position.y = a.data.y + 3.6;
        setActor(
          a,
          a === girl && world === "town" && townWalk === 1
            ? staring
              ? "hold-stare"
              : "hold"
            : a.data.working
              ? "work"
              : movingNpc
                ? "walk"
                : "idle",
          p.reducedMotion ? 0 : Math.floor(clock * 5) % 4,
          a === girl ? -1 : 1,
        );
      }
      vehicle.visible = world === "trail" && mode !== "walk";
      if (vehicle.visible) {
        const vehicleFrame = p.reducedMotion
          ? 0
          : Math.floor(walkDistance * 1.5) % 4;
        const key = `vehicle-${mode}-${vehicleFrame}`;
        if (!cache.has(key))
          cache.set(
            key,
            texture(
              canvas(96, 64, (c) => {
                drawVehicle(c, { kind: mode, frame: vehicleFrame });
                if (mode === "truck") {
                  const rider = canvas(32, 48, (ctx) =>
                    drawActor(ctx, { kind: "hero", age: "teen", pose: "sit" }),
                  );
                  c.save();
                  c.beginPath();
                  c.rect(48, 26, 14, 11);
                  c.clip();
                  c.drawImage(rider, 43, 20, 18, 27);
                  c.restore();
                }
              }),
            ),
          );
        vehicle.material.map = cache.get(key);
        vehicle.position.set(
          heroX,
          heroY + 2 + (p.reducedMotion ? 0 : Math.sin(clock * 3) * 0.15),
          13,
        );
        hero.mesh.position.y = vehicle.position.y + 2;
      }
      hero.mesh.visible = !(vehicle.visible && mode === "truck");
      hearts.visible = world === "town" && townWalk === 1;
      hearts.position.set(
        heroX + 1.7,
        heroY + 10 + (p.reducedMotion ? 0 : Math.sin(clock * 2) * 0.4),
        20,
      );
      torch.visible = world === "trail" && chapter === 1;
      torch.position.set(heroX + 2, heroY + 5, 15);
      for (const target of targets) {
        if (target.userData.restY !== undefined) {
          const desiredY = target.userData.restY + (hover === target ? 2.8 : 0);
          target.position.y +=
            (desiredY - target.position.y) *
            (p.reducedMotion ? 1 : Math.min(1, dt * 12));
        }
      }
      for (const bg of scenery) bg.visible = Math.abs(bg.position.x - x) < 170;
      const targetY = heroY + 12,
        targetX = heroX + (node.clientWidth > 650 ? 10 : 0);
      const lerp = p.reducedMotion ? 1 : Math.min(1, dt * 5);
      camera.position.x += (targetX - camera.position.x) * lerp;
      camera.position.y += (targetY - camera.position.y) * lerp;
      renderer.render(scene, camera);
      const el = renderer.domElement;
      Object.assign(el.dataset, {
        world,
        heroX: heroX.toFixed(4),
        progress: String(p.progress),
        chapter: String(chapter),
        vehicle: mode,
        pose,
        torch: String(torch.visible),
        blocked: blocked?.id || "",
        jumpHeight: jump.toFixed(3),
        crouching: String(crouch),
        townArrived: String(world === "town" && townWalk === 1),
        handHolding: String(
          hearts.visible &&
            Math.abs(
              hero.mesh.position.x + 2.34375 - (girl.mesh.position.x - 2.5),
            ) < 0.02,
        ),
        handDistance: hearts.visible
          ? Math.abs(
              hero.mesh.position.x + 2.34375 - (girl.mesh.position.x - 2.5),
            ).toFixed(5)
          : "",
        staring: String(staring && hearts.visible),
        reducedMotion: String(Boolean(p.reducedMotion)),
        renderQuality: "pixel-native",
      });
      if (clock - report > 0.12) {
        report = clock;
        const npcs = actors
          .filter((a) => a !== hero && a.mesh.parent.visible)
          .map((a) => ({
            id: a.data.id,
            name: a.data.name,
            ...projectPoint(a.mesh),
          }));
        el.dataset.npcPoints = JSON.stringify(npcs);
        el.dataset.projectPoints = JSON.stringify(
          targets
            .filter((m) => m.userData.restY !== undefined)
            .map((m) => ({
              index: m.userData.action.index,
              height: m.position.y,
              restHeight: m.userData.restY,
              ...projectPoint(m),
            })),
        );
        latest.current.onPosition?.({
          chapter: world === "town" ? 6 : chapter,
          x: world === "town" ? x : heroX,
          y: heroY,
          z: 0,
          vehicle: mode,
        });
        latest.current.onGame?.({ blocked, vehicle: mode });
      }
      frame = requestAnimationFrame(tick);
    }
    init();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("click", click);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      geometries.forEach((g) => g.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);
  return (
    <div ref={host} className="pixel-scene">
      {props.entered && (
        <details className="pixel-people" data-panel>
          <summary>People nearby</summary>
          {people.map((person) => (
            <button key={person.id} onClick={() => talk.current(person)}>
              Talk to {person.name}
            </button>
          ))}
          {props.world === "town" && (
            <button
              onClick={() =>
                talk.current({
                  id: "hero",
                  name: "Your guide",
                  dialogue: "Oh, you’re still here?",
                })
              }
            >
              Talk to your guide
            </button>
          )}
        </details>
      )}
    </div>
  );
}
