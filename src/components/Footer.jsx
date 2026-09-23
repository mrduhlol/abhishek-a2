import { SOCIALS } from "../data/portfolio.js";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08]" aria-label="Footer">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="text-[13px] font-bold tracking-[0.28em]">ABHISHEK A.</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-white/35">CSE — CYBERSECURITY</p>
        </div>
        <p className="text-sm text-[#9CA3AF]">© 2026 Abhishek A.</p>
        <ul className="flex items-center gap-6 text-sm text-[#9CA3AF]">
          <li>
            <a href={SOCIALS.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
              GitHub
            </a>
          </li>
          <li>
            <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={SOCIALS.email} className="transition-colors hover:text-white">
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
