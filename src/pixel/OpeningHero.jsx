import { useEffect, useRef } from "react";
import { drawActor } from "./actors";
export default function OpeningHero({ entered }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current.getContext("2d");
    ctx.clearRect(0, 0, 32, 48);
    ctx.imageSmoothingEnabled = false;
    drawActor(ctx, {
      kind: "hero",
      pose: entered ? "jump" : "sit",
      frame: 0,
      direction: 1,
      age: "teen",
    });
  }, [entered]);
  return (
    <canvas
      ref={ref}
      width="32"
      height="48"
      className="opening-pixel-hero"
      aria-label="Teenage backpack adventurer sitting on Abhishek’s name"
    />
  );
}
