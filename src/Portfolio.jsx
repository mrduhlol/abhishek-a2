import { useState } from 'react'
import { PROJECTS as ARCHIVE_PROJECTS } from './data/projects'

const PROJECTS = [{ id: 'pulp', name: 'Pulp', description: 'Shape the sound of your browser. A 10-band equalizer with sound presets, bass and treble controls, and custom profiles saved on your device.', tech: ['TypeScript', 'Web Audio', 'Chrome & Firefox'], github: 'https://github.com/mrduhlol/pulp' }, ...ARCHIVE_PROJECTS.filter(project => project.id !== 'orbit')]
import './fonts.css'
import './portfolio.css'

const filters = ['All projects', 'Desktop', 'Android', 'Web']
const category = (project) => ['voxlink'].includes(project.id) ? 'Desktop' : ['github-widgets', 'inkora', 'stikr'].includes(project.id) ? 'Android' : 'Web'
const logos = { pulp: 'pulp.svg', voxlink: 'voxlink.png', 'github-widgets': 'github-widgets.svg', inkora: 'inkora.png', docutype: 'docutype.svg', stikr: 'stikr.png', 'black-jack': 'black-jack.svg' }

export default function Portfolio() {
  const [filter, setFilter] = useState('All projects')
  const projects = PROJECTS.filter(project => filter === 'All projects' || category(project) === filter)
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header wrap">
      <a className="wordmark" href="#home" aria-label="Abhishek A., home">abhishek</a>
      <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      <a className="header-github" href="https://github.com/mrduhlol">GitHub</a>
    </header>
    <main id="main">
      <section className="hero wrap" id="home" aria-labelledby="hero-title">
        <div className="hero-copy"><h1 id="hero-title">Built out of<br />curiosity.</h1>
          <p>I’m Abhishek, an independent developer building thoughtful apps for your phone, desktop, and browser.</p>
          <div className="hero-actions"><a className="button" href="#work">Explore my work</a><a className="text-link" href="mailto:abhishek.a2534@gmail.com">Get in touch</a></div>
        </div>
        <div className="portrait-block"><div className="portrait-frame"><img src="/abhishek-cutout.webp" alt="Abhishek" width="650" height="800" fetchPriority="high" /></div><div className="portrait-caption"><span>Abhishek A.</span><span>Builder, always learning.</span></div></div>
      </section>
      <section className="work-section wrap" id="work" aria-labelledby="work-title">
        <div className="section-heading"><h2 id="work-title">Things I’ve made<span> / {PROJECTS.length}</span></h2><p>Independent projects. Open source.</p></div>
        <div className="filters" role="group" aria-label="Filter projects by platform">{filters.map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <p className="sr-only" role="status">{projects.length} projects shown</p>
        <div className="project-list">{projects.map(project => <article className="project-row" key={project.id}>
          <div className={`project-mark mark-${project.id}`} aria-hidden="true">{logos[project.id] ? <img src={`/project-icons/${logos[project.id]}`} alt="" width="56" height="56" loading="lazy" /> : <span>O</span>}</div>
          <div className="project-info"><div className="project-title"><h3><a href={project.github}>{project.name}</a></h3><span>{category(project)}</span></div><p>{project.description}</p><ul className="tech-list" aria-label={`${project.name} technologies`}>{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul></div>
          <a className="source-link" href={project.github} aria-label={`View ${project.name} source on GitHub`}>View source</a>
        </article>)}</div>
      </section>
      <section className="about-section wrap" id="about" aria-labelledby="about-title"><h2 id="about-title">Curiosity is<br />the starting point.</h2><div><p className="about-lead">I like making software that solves a small problem well.</p><p>That might be a better way to listen, a notebook that stays offline, or a game to play with friends. My work spans Android, Linux, and the web.</p><p>Every project is a chance to learn something new—and leave something useful behind.</p><a className="text-link" href="https://github.com/mrduhlol">See what I’m building on GitHub</a></div></section>
      <section className="contact-section" id="contact" aria-labelledby="contact-title"><div className="wrap contact-inner"><div><h2 id="contact-title">Have something<br />in mind?</h2><p>A project, a question, or just a hello. I’d love to hear it.</p></div><a className="contact-email" href="mailto:abhishek.a2534@gmail.com">Let’s talk<span>abhishek.a2534@gmail.com</span></a></div></section>
    </main>
    <footer className="wrap site-footer"><span>© {new Date().getFullYear()} Abhishek A.</span><div><a href="https://github.com/mrduhlol">GitHub</a><a href="https://www.linkedin.com/in/duhlol">LinkedIn</a><a href="#home">Back to top</a></div></footer>
  </>
}
