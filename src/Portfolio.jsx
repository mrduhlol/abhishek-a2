import { useEffect, useRef, useState } from 'react'
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
const projects = [pulp, ...ARCHIVE_PROJECTS.filter(project => project.id !== 'orbit')]
const filters = ['All projects', 'Desktop', 'Android', 'Web']
const category = project => {
  if (project.id === 'voxlink') return 'Desktop'
  if (['github-widgets', 'inkora', 'stikr'].includes(project.id)) return 'Android'
  return 'Web'
}
const logos = {
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
const equalizer = [38, 53, 67, 55, 36, 47, 69, 79, 62, 44]
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

function ProjectArtwork({ project, featured }) {
  const artwork = useRef(null)

  useGSAP(() => {
    if (!featured) return

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.equalizer-level', { scaleY: 0.35, duration: 0.6, stagger: 0.018 })
        .from('.project-icon', { y: 10, duration: 0.65 }, 0.04)
    }, artwork)
    return () => media.revert()
  }, { scope: artwork })

  const file = logos[project.id]
  return (
    <div className={`project-mark mark-${project.id}`} ref={artwork} aria-hidden="true">
      <img
        className="project-icon"
        src={iconUrls[file] ?? `${import.meta.env.BASE_URL}project-icons/${file}`}
        alt=""
        width={featured ? 112 : 64}
        height={featured ? 112 : 64}
        loading={featured ? 'eager' : 'lazy'}
        decoding="async"
      />
      {featured && (
        <div className="equalizer">
          <div className="equalizer-bands">
            {equalizer.map((level, band) => (
              <span className="equalizer-band" key={band}>
                <span className="equalizer-level" style={{ '--level': `${level}%` }} />
              </span>
            ))}
          </div>
          <div className="equalizer-range"><span>32 Hz</span><span>16 kHz</span></div>
        </div>
      )}
    </div>
  )
}

function ProjectRow({ project }) {
  const featured = project.id === 'pulp'
  return (
    <article className={`project-row${featured ? ' project-feature' : ''}`}>
      <ProjectArtwork project={project} featured={featured} />
      <div className="project-info">
        <div className="project-title">
          <h3>{project.name}</h3>
          <span>{category(project)}</span>
        </div>
        <p>{project.description}</p>
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
        <section className="hero wrap" aria-labelledby="hero-title">
          <h1 id="hero-title">Abhishek A</h1>
          <div className="hero-intro">
            <p>I build apps for Android, Linux, and the web.</p>
            <a className="text-link" href="#work">Browse my projects</a>
          </div>
        </section>
        <section className="work-section wrap" id="work" aria-labelledby="work-title">
          <div className="work-header">
            <h2 id="work-title">Selected work</h2>
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
            <p>I like making tools for small, everyday tasks. That includes turning an Android phone into a Linux mic and making an equalizer you can open right in your browser.</p>
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
