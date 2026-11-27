import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PortfolioContent from './PortfolioContent.jsx'
import './desktop.css'

const apps = {
  about: { label: 'About me', file: 'Welcome.txt', status: 'Abhishek A. / Portfolio' },
  projects: { label: 'Projects', file: 'Projects', status: 'Abhishek A. / Projects' },
  contact: { label: 'Contact', file: 'Contact', status: 'Abhishek A. / Contact' },
}
const appIds = Object.keys(apps)

function Icon({ name }) {
  const paths = {
    about: <><path fill="#fff6d9" d="M6 2h11l5 5v20H6z"/><path fill="#a7d8cd" d="M17 2v6h5"/><path d="M9 13h10M9 17h10M9 21h7"/></>,
    projects: <><path fill="#e9a94d" d="M2 9h10l3 4h12v13H2z"/><path fill="#ffe096" d="M5 15h24l-4 11H2z"/></>,
    contact: <><path fill="#eee4ff" d="M2 7h26v17H2z"/><path d="m2 8 13 9L28 8M2 24l9-10m17 10-9-10"/></>,
    trail: <><path fill="#d1eddd" d="M2 3h26v24H2z"/><path fill="#5eb296" d="m3 24 8-14 5 8 4-5 7 11z"/><path stroke="#fc9d55" d="M21 8h3"/></>,
    start: <><path fill="#aaebe2" d="M3 3h24v18H3z"/><path fill="#7365a6" d="M6 6h18v12H6z"/><path d="M15 21v5M8 27h14"/><path stroke="#fff" d="m10 9 3 3-3 3m5 0h4"/></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 30 30" fill="none" stroke="#182440" strokeWidth="1.5" strokeLinejoin="round">{paths[name]}</svg>
}

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <time className="win98-clock" dateTime={now.toISOString()} title={now.toLocaleDateString()}>
    {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
  </time>
}

function Desktop() {
  const [app, setApp] = useState('about')
  const [visible, setVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [start, setStart] = useState(false)
  const heading = useRef(null)
  const startButton = useRef(null)
  const startArea = useRef(null)
  const firstStartItem = useRef(null)
  const focusWindow = useRef(false)

  useEffect(() => {
    if (visible && focusWindow.current) {
      heading.current?.focus()
      focusWindow.current = false
    }
  }, [app, visible])

  useEffect(() => {
    if (!start) return
    firstStartItem.current?.focus()
    function dismiss(event) {
      if (!startArea.current?.contains(event.target)) setStart(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [start])

  function openApp(id) {
    if (id === app && visible) heading.current?.focus()
    else focusWindow.current = true
    setApp(id)
    setVisible(true)
    setStart(false)
  }

  function hideWindow(close) {
    setVisible(false)
    if (close) {
      setApp(null)
      setExpanded(false)
    }
    document.getElementById(close ? 'win98-shortcut-' + app : 'win98-task').focus()
  }

  const trail = import.meta.env.BASE_URL
  return (
    <div className="win98-desktop">
      <div className="win98-workspace">
        <nav className="win98-shortcuts" aria-label="Desktop shortcuts">
          {appIds.map(id => (
            <button key={id} id={'win98-shortcut-' + id} type="button" onClick={() => openApp(id)}>
              <Icon name={id} /><span>{apps[id].label}</span>
            </button>
          ))}
          <a href={trail}><Icon name="trail" /><span>Expedition</span></a>
        </nav>
        <main className="win98-main">
          {app && visible && (
            <section className={'win98-window' + (expanded ? ' win98-expanded' : '')} aria-labelledby="win98-title">
              <header className="win98-titlebar">
                <Icon name={app} />
                <span tabIndex={-1} ref={heading} id="win98-title">{apps[app].file}</span>
                <div className="win98-window-controls">
                  <button type="button" aria-label="Minimize window" onClick={() => hideWindow(false)}><i className="win98-minimize" /></button>
                  <button type="button" aria-label={expanded ? 'Restore window size' : 'Maximize window'} onClick={() => setExpanded(value => !value)}><i className={expanded ? 'win98-restore' : 'win98-maximize'} /></button>
                  <button type="button" aria-label="Close window" onClick={() => hideWindow(true)}><i className="win98-close" /></button>
                </div>
              </header>
              <nav className="win98-window-nav" aria-label="Portfolio sections">
                {appIds.map(id => <button key={id} type="button" aria-current={id === app ? 'page' : undefined} onClick={() => openApp(id)}>{apps[id].label}</button>)}
              </nav>
              <div className="win98-window-body" key={app}><PortfolioContent app={app} openApp={openApp} /></div>
              <footer className="win98-status"><span>{apps[app].status}</span><span>Ready</span></footer>
            </section>
          )}
        </main>
      </div>
      <footer className="win98-taskbar">
        <div ref={startArea} className="win98-start-area" onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setStart(false)
        }} onKeyDown={event => {
          if (event.key === 'Escape' && start) {
            setStart(false)
            startButton.current?.focus()
          }
        }}>
          <button type="button" className="win98-start" ref={startButton} aria-expanded={start} aria-controls="win98-launcher" onClick={() => setStart(value => !value)}>
            <Icon name="start" /> Start
          </button>
          <nav id="win98-launcher" className="win98-launcher" aria-label="Start menu" hidden={!start}>
            {appIds.map((id, index) => <button key={id} type="button" ref={index === 0 ? firstStartItem : undefined} onClick={() => openApp(id)}><Icon name={id} />{apps[id].label}</button>)}
            <a href={trail}><Icon name="trail" />Expedition</a>
          </nav>
        </div>
        {app && <button id="win98-task" type="button" aria-pressed={visible} onClick={() => visible ? hideWindow(false) : openApp(app)}><Icon name={app} />{apps[app].file}</button>}
        <Clock />
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><Desktop /></StrictMode>)
