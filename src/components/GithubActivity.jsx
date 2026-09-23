import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading.jsx";
import Reveal from "./Reveal.jsx";
import { PROJECTS, SOCIALS } from "../data/portfolio.js";

// Honest GitHub section: no fake numbers. Shows the profile, selected
// repos, and an activity slot. To go live, point `fetchActivity` at the
// GitHub REST API (repos + events) — the UI already handles loading/empty.
function useGithubRepos() {
  const [state, setState] = useState({ loading: true, repos: [] });
  useEffect(() => {
    let alive = true;
    // Placeholder data path — replace with fetch(`https://api.github.com/users/${SOCIALS.githubHandle}/repos?sort=updated`)
    // when ready. Falls back to local selected work so the section never looks broken offline.
    const t = setTimeout(() => {
      if (!alive) return;
      setState({
        loading: false,
        repos: PROJECTS.map((p) => ({
          name: p.id,
          title: p.name,
          description: p.tagline,
          tech: p.tech.slice(0, 3).join(" • "),
          url: SOCIALS.github,
        })),
      });
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  return state;
}

export default function GithubActivity() {
  const { loading, repos } = useGithubRepos();
  return (
    <section className="relative" aria-label="GitHub activity">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <SectionHeading
          index="06"
          eyebrow="Open source"
          title="On GitHub."
          blurb="Selected repositories and recent motion. Live contribution data plugs in here — nothing is faked."
        />
        <div className="grid gap-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <a
              href={SOCIALS.github}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-8 transition-colors duration-500 hover:border-ink/25"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line font-mono text-lg text-ink">
                  ⌥
                </div>
                <p className="mt-6 font-mono text-xs tracking-[0.25em] text-muted">PROFILE</p>
                <p className="display-tight mt-2 text-3xl">@{SOCIALS.githubHandle}</p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                Open profile
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </a>
          </Reveal>
          <div className="space-y-4 lg:col-span-3">
            {loading ? (
              <div className="space-y-4" aria-label="Loading repositories">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl border border-line bg-wash" />
                ))}
              </div>
            ) : (
              repos.map((r, i) => (
                <Reveal key={r.name} delay={i * 0.06}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-6 py-5 transition-colors duration-300 hover:border-ink/25 hover:bg-wash"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{r.title}</p>
                      <p className="mt-1 truncate text-sm text-muted">{r.description} — {r.tech}</p>
                    </div>
                    <span aria-hidden="true" className="shrink-0 text-ink/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink">→</span>
                  </a>
                </Reveal>
              ))
            )}
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-dashed border-line px-6 py-5">
                <p className="font-mono text-[11px] leading-relaxed text-muted">
                  // activity graph connects here via the GitHub API.
                  <br />
                  // No mock streaks, no inflated counts — real data or nothing.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
