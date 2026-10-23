import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createTerrain, TERRAIN_ASCII } from './terrain.js';
import './terrain.css';

// Each terrain specialist owns one module. Vite's static registry includes
// those modules in the terrain chunk without adding runtime network requests.
const drawings = import.meta.glob('./terrains/*.js', { eager: true, import: 'default' });

export default function TerrainScene({ type = 'mountain', className = '' }) {
  const frameRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    let renderer;
    let drawing;
    let stopped = false;
    let raf = 0;
    let inView = false;
    let dirty = true;
    let width = 0;
    let height = 0;
    let pointerX = 0;
    let pointerY = 0;
    let rotationX = 0;
    let rotationY = 0;
    let last = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-50, 50, 40, -40, .1, 200);
    camera.position.z = 100;

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = 'terrain-scene__canvas';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      drawing = createTerrain(type, drawings[`./terrains/${type}.js`]);
      scene.add(drawing.group);
      frame.prepend(renderer.domElement);
    } catch {
      renderer?.dispose();
      drawing?.dispose();
      frame.dataset.fallback = 'true';
      return undefined;
    }
    frame.dataset.fallback = 'false';

    const render = now => {
      raf = 0;
      if (stopped || !inView || document.hidden) return;
      if (now - last < 32 && !dirty) { raf = requestAnimationFrame(render); return; }
      last = now;
      const targetX = reduce.matches ? 0 : pointerY * .035;
      const targetY = reduce.matches ? 0 : pointerX * .055;
      rotationX += (targetX - rotationX) * .08;
      rotationY += (targetY - rotationY) * .08;
      drawing.group.rotation.x = rotationX;
      drawing.group.rotation.y = rotationY;
      renderer.render(scene, camera);
      dirty = false;
      // Render on demand. A still drawing does not keep a RAF loop alive.
      if (!reduce.matches && (Math.abs(targetX - rotationX) > .0001 || Math.abs(targetY - rotationY) > .0001)) {
        raf = requestAnimationFrame(render);
      }
    };
    const requestRender = () => {
      dirty = true;
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(render);
    };
    const resize = () => {
      const bounds = frame.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      renderer.setSize(width, height, false);
      const aspect = width / height;
      // Fit the whole illustration instead of cropping mountain peaks on phones.
      const vertical = Math.max(40, 50 / aspect);
      camera.left = -vertical * aspect;
      camera.right = vertical * aspect;
      camera.top = vertical;
      camera.bottom = -vertical;
      camera.updateProjectionMatrix();
      requestRender();
    };
    const onPointer = event => {
      if (reduce.matches || event.pointerType === 'touch') return;
      const rect = frame.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / width * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / height * 2 - 1));
      requestRender();
    };
    const resetPointer = () => { pointerX = 0; pointerY = 0; requestRender(); };
    const onScroll = () => {
      if (!inView || reduce.matches) return;
      const bounds = frame.getBoundingClientRect();
      pointerY = Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight));
      requestRender();
    };
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else requestRender();
    };
    const onContextLost = event => {
      event.preventDefault();
      stopped = true;
      cancelAnimationFrame(raf);
      raf = 0;
      frame.dataset.fallback = 'true';
    };
    const onContextRestored = () => {
      stopped = false;
      frame.dataset.fallback = 'false';
      requestRender();
    };
    const intersection = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) requestRender();
      else { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '160px' });
    const observer = new ResizeObserver(resize);
    intersection.observe(frame);
    observer.observe(frame);
    frame.addEventListener('pointermove', onPointer, { passive: true });
    frame.addEventListener('pointerleave', resetPointer);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduce.addEventListener('change', resetPointer);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
    resize();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      intersection.disconnect();
      observer.disconnect();
      frame.removeEventListener('pointermove', onPointer);
      frame.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reduce.removeEventListener('change', resetPointer);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      drawing.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [type]);

  return (
    <div ref={frameRef} className={`terrain-scene ${className}`} aria-hidden="true">
      <pre className="terrain-scene__fallback">{TERRAIN_ASCII[type] || TERRAIN_ASCII.mountain}</pre>
      <div className="terrain-scene__notation">
        <span>{type === 'ocean' ? '~ ~ ~' : type === 'cave' ? '+ . +' : '. · .'}</span>
        <span>{type === 'forest' ? '/ | \\' : type === 'desert' ? '· . ·' : '— / —'}</span>
      </div>
    </div>
  );
}
