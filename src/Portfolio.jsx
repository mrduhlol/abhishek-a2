import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ReactLenis } from 'lenis/react'
import { PROJECTS as ARCHIVE_PROJECTS } from './data/projects'
import 'lenis/dist/lenis.css'
import './fonts.css'
import './portfolio.css'

gsap.registerPlugin(useGSAP)

const pulp = {
  id: 'pulp',
  name: 'Pulp',
  description: 'A 10-band equalizer for Chrome and Firefox. Adjust bass and treble, choose a preset, or save your own sound profiles.',
  tech: ['TypeScript', 'Web Audio'],
  github: 'https://github.com/mrduhlol/pulp',
}
const aurevia = {
  id: 'aurevia',
  name: 'Aurevia',
  description: 'An Android-first web app for meeting people on the same flight. The current build previews onboarding and lets users create profiles and record flights.',
  tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
  github: 'https://github.com/mrduhlol/Aurevia',
}
const projects = [aurevia, pulp, ...ARCHIVE_PROJECTS.filter(project => project.id !== 'orbit')]
const filters = ['All projects', 'Desktop', 'Android', 'Web']
const category = project => {
  if (project.id === 'voxlink') return 'Desktop'
  if (['github-widgets', 'inkora', 'stikr'].includes(project.id)) return 'Android'
  return 'Web'
}
const logos = {
  aurevia: 'aurevia.png',
  pulp: 'pulp.svg',
  voxlink: 'voxlink.png',
  'github-widgets': 'github-widgets.svg',
  inkora: 'inkora.png',
  docutype: 'docutype.svg',
  stikr: 'stikr.png',
  'black-jack': 'black-jack.svg',
}
const embeddedIcons = document.getElementById('portfolio-icons')
const iconUrls = embeddedIcons ? JSON.parse(embeddedIcons.textContent) : {}
const projectAsset = file => iconUrls[file] ?? `${import.meta.env.BASE_URL}project-icons/${file}`
const lenisOptions = { autoRaf: true, anchors: false }
const email = 'abhishek.a2534@gmail.com'
const github = 'https://github.com/mrduhlol'

function SmoothScroll() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)')
    const update = () => setEnabled(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  return enabled ? <ReactLenis root options={lenisOptions} /> : null
}

function Hero({ showAllProjects }) {
  const hero = useRef(null)

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('#hero-title', { y: 12, duration: 0.7 })
        .from('.icon-board img', { y: 14, duration: 0.55, stagger: 0.035 }, 0.06)
    })
    return () => media.revert()
  }, { scope: hero })

  return (
    <section className="hero wrap" aria-labelledby="hero-title" ref={hero}>
      <div className="hero-intro">
        <h1 id="hero-title">Abhishek A</h1>
        <div>
          <p>I build apps for Android, Linux, and the web.</p>
          <a className="work-link" href="#work">Browse projects</a>
        </div>
      </div>
      <nav className="icon-board" aria-label="Jump to a project">
        {projects.map(project => (
          <a
            className="icon-board-slot"
            href={`#project-${project.id}`}
            key={project.id}
            onClick={showAllProjects}
          >
            <img src={projectAsset(logos[project.id])} alt="" width={56} height={56} />
            <span>{project.name}</span>
          </a>
        ))}
      </nav>
    </section>
  )
}

function ProjectRow({ project }) {
  const [expanded, setExpanded] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const file = logos[project.id]
  const mediaType = project.id === 'inkora' ? 'app preview' : 'screenshot'
  const screenshot = project.id === 'inkora' ? 'inkora-preview.webp' : `${project.id}-screenshot.webp`
  const screenshotId = `${project.id}-screenshot`

  return (
    <article className="project-row" id={`project-${project.id}`} tabIndex={-1}>
      <div className="project-identity">
        <img
          className="project-icon"
          src={projectAsset(file)}
          alt=""
          width={56}
          height={56}
          decoding="async"
        />
        <div className="project-title">
          <h3>{project.name}</h3>
          <span>{category(project)}</span>
        </div>
      </div>
      <div className="project-info">
        <button
          className="project-description"
          type="button"
          aria-expanded={expanded}
          aria-controls={screenshotId}
          onClick={() => setExpanded(!expanded)}
        >
          <span>{project.description}</span>
          <span className="screenshot-label">{expanded ? 'Hide' : 'Show'} {mediaType}</span>
        </button>
        <div id={screenshotId} className="project-screenshot" hidden={!expanded}>
          {expanded && (unavailable ? (
            <p role="status">Image unavailable.</p>
          ) : (
            <img
              src={projectAsset(screenshot)}
              alt={`${project.name} ${mediaType}`}
              decoding="async"
              onError={() => setUnavailable(true)}
            />
          ))}
        </div>
        <ul className="tech-list" aria-label={`${project.name} technologies`}>
          {project.tech.map(tech => <li key={tech}>{tech}</li>)}
        </ul>
      </div>
      <a className="source-link" href={project.github} aria-label={`View ${project.name} source on GitHub`}>
        View source
      </a>
    </article>
  )
}

export default function Portfolio() {
  const [filter, setFilter] = useState('All projects')
  const visibleProjects = projects.filter(project => filter === 'All projects' || category(project) === filter)

  return (
    <>
      <SmoothScroll />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header wrap" id="home">
        <a className="wordmark" href="#home" aria-label="Abhishek A, home">abhishek</a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-github" href={github}>GitHub</a>
      </header>
      <main id="main" tabIndex={-1}>
        <Hero showAllProjects={() => {
          if (filter !== 'All projects') flushSync(() => setFilter('All projects'))
        }} />
        <section className="work-section wrap" id="work" aria-labelledby="work-title">
          <div className="work-header">
            <h2 id="work-title">Projects</h2>
            <div className="filters" role="group" aria-label="Filter projects by platform">
              {filters.map(item => (
                <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <p className="sr-only" role="status">{visibleProjects.length} projects shown</p>
          <div className="project-list">
            {visibleProjects.map(project => <ProjectRow key={project.id} project={project} />)}
          </div>
        </section>
        <section className="about-section wrap" id="about" aria-labelledby="about-title">
          <h2 id="about-title">About</h2>
          <div>
            <p>I make tools for things I use every day, like music in the browser, notes that work offline, and audio on Linux.</p>
            <a className="text-link" href={github}>Find me on GitHub</a>
          </div>
        </section>
        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="wrap contact-inner">
            <h2 id="contact-title">Get in touch</h2>
            <a className="contact-email" href={`mailto:${email}`}>{email}</a>
          </div>
        </section>
      </main>
      <footer className="wrap site-footer">
        <span>© {new Date().getFullYear()} Abhishek A</span>
        <div>
          <a href={github}>GitHub</a>
          <a href="https://www.linkedin.com/in/duhlol">LinkedIn</a>
          <a href="#home">Back to top</a>
        </div>
      </footer>
    </>
  )
}
