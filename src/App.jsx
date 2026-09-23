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
import { useSmoothScroll } from "./hooks/useSmoothScroll.js";

export default function App() {
  useSmoothScroll();

  return (
    <div className="grain relative min-h-screen bg-[var(--page-bg)] text-[#F5F5F5] transition-colors duration-500">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Statement />
        <div className="mx-auto max-w-6xl px-5 md:px-8" aria-hidden="true">
          <div className="h-px bg-line" />
        </div>
        <About />
        <Projects />
        <div className="mx-auto max-w-6xl px-5 md:px-8" aria-hidden="true">
          <div className="h-px bg-line" />
        </div>
        <Skills />
        <Journey />
        <Exploring />
        <GithubActivity />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
