import { motion, useReducedMotion } from "motion/react";
import MagneticButton from "./MagneticButton.jsx";
import { SOCIALS } from "../data/portfolio.js";

const LINKS = [
  { label: "GitHub", href: SOCIALS.github, note: `@${SOCIALS.githubHandle}` },
  { label: "LinkedIn", href: SOCIALS.linkedin, note: "Connect" },
  { label: "Email", href: SOCIALS.email, note: SOCIALS.emailLabel },
];

// Cinematic finale — oversized type, quiet background, magnetic links.
export default function Contact() {
  const reduce = useReducedMotion();
  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden" aria-label="Contact">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 100%, rgba(91,140,255,0.09), transparent 70%), radial-gradient(ellipse 45% 40% at 80% 20%, rgba(139,92,246,0.06), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-44">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-8"
        >
          07 — Contact
        </motion.p>
        <h2 className="display-tight text-balance text-[15vw] sm:text-7xl md:text-8xl lg:text-[7rem]">
          {["LET'S BUILD", "SOMETHING", "INTERESTING."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.05em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {i === 2 ? (
                  <span className="bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] bg-clip-text text-transparent">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h2>

        <div className="mt-12 border-t border-white/[0.08] md:mt-16">
          {LINKS.map((l, i) => (
            <motion.div
              key={l.label}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <MagneticButton strength={0.12} className="block w-full">
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 border-b border-white/[0.08] py-6 md:py-8"
                >
                  <span className="display-tight text-3xl transition-transform duration-500 group-hover:translate-x-2 md:text-5xl">
                    {l.label}
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="hidden font-mono text-xs text-white/35 sm:block">{l.note}</span>
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:border-white/50 group-hover:bg-white group-hover:text-black"
                    >
                      ↗
                    </span>
                  </span>
                </a>
              </MagneticButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
