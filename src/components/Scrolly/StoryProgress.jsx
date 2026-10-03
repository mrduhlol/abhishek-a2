import { useEffect, useState } from "react";
import { STORY_SECTIONS } from "../../data/portfolio.js";
import { useActiveSection } from "../../hooks/useActiveSection.js";

// Fixed chapter rail: a quiet dot-nav that tracks the story as you scroll.
// Desktop only, fades in after the hero, respects reduced motion via CSS.
export default function StoryProgress() {
  const ids = STORY_SECTIONS.map((s) => s.id);
  const active = useActiveSection(ids);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Story chapters"
      className={`story-rail fixed right-5 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-end gap-1 xl:flex ${
        past ? "story-rail-on" : ""
      }`}
    >
      {STORY_SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? "true" : undefined}
            aria-label={`Go to ${s.label}`}
            className="group flex items-center gap-3 py-1.5"
          >
            <span
              className={`font-mono text-[10px] tracking-[0.22em] uppercase transition-all duration-300 ${
                on ? "translate-x-0 text-ink opacity-100" : "translate-x-2 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
            <span
              aria-hidden="true"
              className={`block rounded-full transition-all duration-300 ${
                on
                  ? "h-6 w-[3px] bg-gradient-to-b from-[#5B8CFF] to-[#8B5CF6]"
                  : "h-[3px] w-4 bg-ink/20 group-hover:bg-ink/45"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
