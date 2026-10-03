import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Statement from "./components/Statement.jsx";
import About from "./components/About.jsx";
import Projects from "./components/Projects.jsx";
import Skills from "./components/Skills.jsx";
import Journey from "./components/Journey.jsx";
import Exploring from "./components/Exploring.jsx";
import GithubActivity from "./components/GithubActivity.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import WelcomeIntro from "./components/WelcomeIntro.jsx";
import NotFound from "./components/NotFound.jsx";
import IsoLab from "./components/IsoLab.jsx";
import StoryProgress from "./components/Scrolly/StoryProgress.jsx";
import StoryChapters from "./components/Scrolly/StoryChapters.jsx";
import { useSmoothScroll } from "./hooks/useSmoothScroll.js";

// Single-page site: any pathname that isn't home is an unknown URL.
// Cloudflare serves index.html for those (not_found_handling:
// single-page-application in wrangler.jsonc), so we render the
// liquid-motion 404 client-side instead of a blank page.
function isHomePath(pathname) {
  const clean = (pathname || "/").split("?")[0].split("#")[0] || "/";
  if (clean === "/" || clean === "/index.html") return true;
  const rawBase = import.meta.env.BASE_URL || "/";
  const base = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
  if (!base || base === "/") return false;
  return clean === base || clean === `${base}/` || clean === `${base}/index.html`;
}

export default function App() {
  useSmoothScroll();
  // Mac-style boot: black "welcome" splash first, site mounts as it lifts.
  const [revealed, setRevealed] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [path, setPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  const missing = !isHomePath(path);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goHome = useCallback(() => {
    window.history.pushState({}, "", "/");
    setPath("/");
    setRevealed(true);
    setIntroGone(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const goSection = useCallback(
    (id) => {
      window.history.pushState({}, "", "/");
      setPath("/");
      setRevealed(true);
      setIntroGone(true);
      // Wait a tick for home to mount, then glide to the section.
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0 });
        if (id) history.replaceState(null, "", `#${id}`);
      }, 80);
    },
    [],
  );

  if (missing) {
    return (
      <div className="grain relative min-h-screen bg-[var(--page-bg)] text-[#F5F5F5] transition-colors duration-500">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to home
        </a>
        <CustomCursor />
        <NotFound
          attemptedPath={`${window.location.pathname}${window.location.search}`}
          onHome={goHome}
          onSection={goSection}
        />
      </div>
    );
  }

  return (
    <div className="grain relative min-h-screen bg-[var(--page-bg)] text-[#F5F5F5] transition-colors duration-500">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <CustomCursor />
      <StoryProgress />
      {!introGone && (
        <WelcomeIntro
          onReveal={() => setRevealed(true)}
          onDone={() => setIntroGone(true)}
        />
      )}
      {revealed && (
        <>
          <Navbar />
          <main id="main">
            <Hero />
            <Statement />
            <StoryChapters />
            <div className="mx-auto max-w-6xl px-5 md:px-8" aria-hidden="true">
              <div className="h-px bg-line" />
            </div>
            <About />
            <Projects />
            <div className="mx-auto max-w-6xl px-5 md:px-8" aria-hidden="true">
              <div className="h-px bg-line" />
            </div>
            <Skills />
            <IsoLab />
            <Journey />
            <Exploring />
            <GithubActivity />
            <Contact />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
