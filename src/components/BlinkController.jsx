import { useReducedMotion } from 'motion/react';
import { useBlink } from '../hooks/useBlink.js';

// Isolated blink controller. Owns the randomized scheduler, renders nothing.
// Only the eyelid strips animate — the face stays completely stationary.
export default function BlinkController({ lidRefs, scopeRef, liveRef }) {
  const reduce = useReducedMotion();
  useBlink(lidRefs, scopeRef, liveRef, reduce);
  return null;
}
