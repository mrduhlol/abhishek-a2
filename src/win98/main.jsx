import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PortfolioContent from './PortfolioContent.jsx'
import './desktop.css'

const base = import.meta.env.BASE_URL
const welcomePreference = 'portfolio-win98-welcome'

function showWelcome() {
  try {
    return localStorage.getItem(welcomePreference) !== 'off'
  } catch {
    return true
  }
}
const apps = {
  about: { label: 'About', file: 'Welcome', icon: 'windows_32' },
  projects: { label: 'Projects', file: 'Projects', icon: 'directory_open_file_mydocs_32' },
  contact: { label: 'Contact', file: 'Contact', icon: 'outlook_express_32' },
}
const appIds = Object.keys(apps)
const shortcuts = [
  { label: 'My Computer', icon: 'computer_explorer_32', app: 'projects' },
  { label: 'My Documents', icon: 'directory_open_file_mydocs_32', app: 'projects' },
  { label: 'Internet Explorer', icon: 'ie_32', href: base },
  { label: 'Outlook Express', icon: 'outlook_express_32', app: 'contact' },
  { label: 'Welcome', icon: 'windows_32', app: 'about' },
  { label: 'Notepad', icon: 'notepad_32', app: 'about' },
]

function Icon({ name, size = 16 }) {
  return <img src={base + 'win98-icons/' + name + '.png'} alt="" width={size} height={size} draggable={false} />
}

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <time dateTime={now.toISOString()} title={now.toLocaleDateString()}>
    {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
  </time>
}

function Desktop() {
  const [app, setApp] = useState(() => showWelcome() ? 'about' : null)
  const [visible, setVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [start, setStart] = useState(false)
  const [startup, setStartup] = useState(app === 'about')
  const [selected, setSelected] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const drag = useRef(null)
  const workspace = useRef(null)
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
      setPosition({ x: 0, y: 0 })
    }
    document.getElementById(close ? 'win98-shortcut-' + shortcuts.findIndex(item => item.app === app) : 'win98-task')?.focus()
  }

  function startDrag(event) {
    if (event.button !== 0 || expanded || event.target.closest('button') || matchMedia('(max-width: 640px)').matches) return
    const windowBounds = event.currentTarget.parentElement.getBoundingClientRect()
    const desktopBounds = workspace.current.getBoundingClientRect()
    drag.current = {
      pointerX: event.clientX - position.x,
      pointerY: event.clientY - position.y,
      minX: position.x - windowBounds.left + desktopBounds.left,
      minY: position.y - windowBounds.top + desktopBounds.top,
      maxX: position.x + desktopBounds.right - windowBounds.right,
      maxY: position.y + desktopBounds.bottom - windowBounds.bottom,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveWindow(event) {
    if (!drag.current) return
    const { pointerX, pointerY, minX, minY, maxX, maxY } = drag.current
    setPosition({
      x: Math.max(minX, Math.min(maxX, event.clientX - pointerX)),
      y: Math.max(minY, Math.min(maxY, event.clientY - pointerY)),
    })
  }

  return (
    <div className="win98-desktop">
      <div className="win98-workspace" ref={workspace}>
        <nav className="win98-shortcuts" aria-label="Desktop shortcuts">
          {shortcuts.map(({ label, icon, app: target, href }, index) => href ? (
            <a key={label} href={href} aria-label="Expedition" title="Open the expedition portfolio"><Icon name={icon} size={32} /><span>{label}</span></a>
          ) : (
            <button key={label} id={'win98-shortcut-' + index} type="button" aria-pressed={selected === label}
              onClick={event => {
                setSelected(label)
                if (event.detail === 0 || matchMedia('(pointer: coarse)').matches) openApp(target)
              }} onDoubleClick={() => openApp(target)}>
              <Icon name={icon} size={32} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <main className="win98-main">
          {app && visible && (
            <section className={'win98-window' + (expanded ? ' win98-expanded' : '')}
              style={{ '--window-x': position.x + 'px', '--window-y': position.y + 'px' }} aria-labelledby="win98-title">
              <header className="win98-titlebar" onPointerDown={startDrag} onPointerMove={moveWindow}
                onLostPointerCapture={() => { drag.current = null }}
                onDoubleClick={event => { if (!event.target.closest('button')) setExpanded(value => !value) }}>
                <Icon name={apps[app].icon} />
                <span tabIndex={-1} ref={heading} id="win98-title">{apps[app].file}</span>
                <div className="win98-window-controls">
                  <button type="button" aria-label="Minimize window" onClick={() => hideWindow(false)}><i className="win98-minimize" /></button>
                  <button type="button" aria-label={expanded ? 'Restore window size' : 'Maximize window'} onClick={() => setExpanded(value => !value)}><i className={expanded ? 'win98-restore' : 'win98-maximize'} /></button>
                  <button type="button" aria-label="Close window" onClick={() => hideWindow(true)}><i className="win98-close" /></button>
                </div>
              </header>
              <div className="win98-banner"><Icon name="windows_32" size={32} />Welcome to Abhishek's portfolio</div>
              <div className="win98-window-layout">
                <nav className="win98-window-nav" aria-label="Portfolio sections">
                  {appIds.map(id => (
                    <button key={id} type="button" aria-current={id === app ? 'page' : undefined} onClick={() => openApp(id)}>
                      <Icon name={apps[id].icon} /><span>{apps[id].label}</span>
                    </button>
                  ))}
                </nav>
                <div className="win98-window-body" key={app}><PortfolioContent app={app} openApp={openApp} /></div>
              </div>
              <footer className="win98-status">
                <label><input type="checkbox" checked={startup} onChange={event => {
                  const checked = event.target.checked
                  setStartup(checked)
                  try {
                    localStorage.setItem(welcomePreference, checked ? 'on' : 'off')
                  } catch {
                    // Sandboxed previews can still change the preference for this session.
                  }
                }} /> Show Welcome at startup</label>
                <button type="button" onClick={() => hideWindow(true)}>Close</button>
              </footer>
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
            <Icon name="windows_16" /> Start
          </button>
          <nav id="win98-launcher" className="win98-launcher" aria-label="Start menu" hidden={!start}>
            <span className="win98-launcher-brand" aria-hidden="true"><b>Windows</b>98</span>
            <div>
              {appIds.map((id, index) => <button key={id} type="button" ref={index === 0 ? firstStartItem : undefined} onClick={() => openApp(id)}><Icon name={apps[id].icon} size={24} />{apps[id].label}</button>)}
              <a href={base}><Icon name="ie_32" size={24} />Expedition</a>
            </div>
          </nav>
        </div>
        <div className="win98-quicklaunch" aria-label="Quick Launch">
          <a href={base} aria-label="Open expedition" title="Open expedition"><Icon name="ie_16" /></a>
          <button type="button" aria-label="Show desktop" title="Show desktop" onClick={() => {
            if (app && visible) hideWindow(false)
            else if (app) openApp(app)
          }}><Icon name="desktop_16" /></button>
        </div>
        {app && <button id="win98-task" type="button" aria-pressed={visible} onClick={() => visible ? hideWindow(false) : openApp(app)}><Icon name={apps[app].icon} />{apps[app].file}</button>}
        <div className="win98-tray"><Icon name="sched_task_16" /><Icon name="loudspeaker_rays_16" /><Clock /></div>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><Desktop /></StrictMode>)
