import { useReducedMotion } from 'motion/react';
import { useEyeTracking } from '../hooks/useEyeTracking.js';

// Isolated pupil-tracking controller. Owns the rAF loop, renders nothing.
// The custom cursor drives it for free — both read the same pointer.
export default function EyeTracker({ frameRef, irisRefs, liveRef }) {
  const reduce = useReducedMotion();
  useEyeTracking(frameRef, irisRefs, liveRef, reduce);
  return null;
}
