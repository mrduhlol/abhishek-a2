import { motion, useReducedMotion } from "motion/react";
import MagneticButton from "./MagneticButton.jsx";

/*
 * Microinteraction CTA — one tactile button system for the whole site.
 * - magnetic drift (pointer only) + press-down scale
 * - shine sweep on hover (CSS, transform-only)
 * - arrow nudges forward on hover, snaps back on leave
 * - focus-visible ring for keyboard users
 * - reduced-motion safe: no magnet, no shine, instant states
 */
export default function CTAButton({
  href = "#contact",
  variant = "primary",
  children,
  arrow = true,
  magneticStrength = 0.2,
  className = "",
  ...rest
}) {
  const reduce = useReducedMotion();
  const isPrimary = variant === "primary";

  return (
    <MagneticButton strength={reduce ? 0 : magneticStrength} className={`inline-block ${className}`}>
      <motion.a
        href={href}
        whileHover={reduce ? undefined : { y: -1 }}
        whileTap={reduce ? undefined : { scale: 0.96, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className={[
          "btn-shine group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5",
          "text-[11px] font-bold tracking-[0.12em]",
          "outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          "transition-[background-color,border-color,color,box-shadow,transform] duration-300",
          isPrimary
            ? "bg-btn text-btnink shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_8px_28px_rgba(91,140,255,0.35)]"
            : "border border-line text-ink hover:border-ink/30 hover:bg-wash",
        ].join(" ")}
        {...rest}
      >
        <span className="relative z-[1] inline-flex items-center gap-2">
          <span>{children}</span>
          {arrow && (
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1 group-active:translate-x-0.5 motion-reduce:transition-none"
            >
              →
            </span>
          )}
        </span>
      </motion.a>
    </MagneticButton>
  );
}
