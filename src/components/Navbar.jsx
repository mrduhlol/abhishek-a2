import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_LINKS } from "../data/portfolio.js";
import { useActiveSection } from "../hooks/useActiveSection.js";

const IDS = ["about", "projects", "skills", "journey", "contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-[70] transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.08] bg-[#08090C]/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 md:px-8"
        >
          <a href="#top" className="text-[13px] font-700 font-bold tracking-[0.28em] text-white">
            ABHISHEK&nbsp;A.
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  aria-current={active === l.id ? "true" : undefined}
                  className={`text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                    active === l.id ? "text-white" : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  {l.label}
                  <span
                    aria-hidden="true"
                    className={`mt-1 block h-px bg-white transition-transform duration-300 ${
                      active === l.id ? "scale-x-100" : "scale-x-0"
                    } origin-left`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <a
              href="#contact"
              className="rounded-full border border-white/15 px-5 py-2 text-[13px] font-semibold text-white transition-colors duration-300 hover:border-white/35 hover:bg-white/5"
            >
              Contact
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 top-0 h-px w-4 bg-white transition-transform duration-300 ${
                  open ? "translate-y-[5.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[5.5px] h-px w-4 bg-white transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[11px] h-px w-4 bg-white transition-transform duration-300 ${
                  open ? "-translate-y-[5.5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-[65] flex flex-col justify-center bg-[#08090C]/95 px-8 backdrop-blur-2xl md:hidden"
          >
            <ul className="space-y-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.45, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className="display-tight block py-2 text-5xl text-white"
                  >
                    <span className="mr-4 align-middle text-sm font-normal tracking-widest text-white/30">
                      0{i + 1}
                    </span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="eyebrow mt-12"
            >
              CSE — Cybersecurity
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
