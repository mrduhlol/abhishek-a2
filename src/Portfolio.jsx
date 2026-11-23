import { useEffect, useState } from 'react'
import { ReactLenis } from 'lenis/react'
import { PROJECTS as ARCHIVE_PROJECTS } from './data/projects'
import 'lenis/dist/lenis.css'
import './fonts.css'
import './portfolio.css'

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

function Intro() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <h1 id="intro-title">Abhishek A</h1>
      <p>I make software for Android, Linux, and the web.</p>
      <a className="text-link" href={github}>GitHub</a>
      <a className="text-link" href={`mailto:${email}`}>Email</a>
    </section>
  )
}

function ProjectDetail({ project }) {
  const [expanded, setExpanded] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const file = logos[project.id]
  const mediaType = project.id === 'inkora' ? 'app preview' : 'screenshot'
  const screenshot = project.id === 'inkora' ? 'inkora-preview.webp' : `${project.id}-screenshot.webp`
  const screenshotId = `${project.id}-screenshot`

  return (
    <article
      className="project-detail"
      data-project={project.id}
      id={`project-${project.id}`}
      aria-labelledby={`title-${project.id}`}
      tabIndex={-1}
    >
      <div className="project-header">
        <img className="project-emblem" src={projectAsset(file)} alt="" width={52} height={52} decoding="async" />
        <div className="project-title">
          <h3 id={`title-${project.id}`}>{project.name}</h3>
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
        <a className="source-link" href={project.github} aria-label={`View ${project.name} source on GitHub`}>
          View source
        </a>
      </div>
    </article>
  )
}

export default function Portfolio() {
  const [filter, setFilter] = useState('All projects')
  const visibleProjects = projects.filter(project => filter === 'All projects' || category(project) === filter)

  useEffect(() => {
    const revealLinkedProject = () => {
      if (projects.some(project => location.hash === `#project-${project.id}`)) {
        setFilter('All projects')
      }
    }
    window.addEventListener('hashchange', revealLinkedProject)
    return () => window.removeEventListener('hashchange', revealLinkedProject)
  }, [])

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
      <main id="main" className="portfolio-main wrap" tabIndex={-1}>
        <Intro />
        <section className="projects" id="work" aria-labelledby="work-title">
          <div className="projects-header">
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
            {visibleProjects.map(project => <ProjectDetail key={project.id} project={project} />)}
          </div>
        </section>
        <section className="about-section" id="about" aria-labelledby="about-title">
          <h2 id="about-title">About</h2>
          <div>
            <p>I build the tools I want to use, like a browser equalizer, an offline notebook, and a way to use my phone as a Linux microphone.</p>
            <a className="text-link" href={github}>Find me on GitHub</a>
          </div>
        </section>
        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-inner">
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
