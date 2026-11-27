import { StrictMode, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import BootSequence from './BootSequence.jsx'
import InternetExplorer from './InternetExplorer.jsx'
import PortfolioContent from './PortfolioContent.jsx'
import ProjectContent, { projectApps } from './ProjectContent.jsx'
import './desktop.css'

const base = import.meta.env.BASE_URL
const welcomePreference = 'portfolio-win98-welcome'
const systemApps = [
  { id: 'about', label: 'My Computer', icon: 'computer_explorer_32' },
  { id: 'projects', label: 'My Documents', icon: 'directory_open_file_mydocs_32' },
  { id: 'internet', label: 'Internet Explorer', icon: 'ie_32' },
  { id: 'contact', label: 'Outlook Express', icon: 'outlook_express_32' },
  { id: 'welcome', label: 'Welcome', icon: 'windows_32' },
]
const shortcuts = [...systemApps, ...projectApps]
const apps = Object.fromEntries(shortcuts.map(app => [app.id, app]))

function showWelcome() {
  try {
    return localStorage.getItem(welcomePreference) !== 'off'
  } catch {
    return true
  }
}

function Icon({ name, url, size = 16 }) {
  return <img src={url || base + 'win98-icons/' + name + '.png'} alt="" width={size} height={size} draggable={false} />
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

function AppWindow({ entry, index, active, workspace, openApp, activate, minimize, close, startup, setStartup }) {
  const { id, minimized } = entry
  const { label, icon, iconUrl } = apps[id]
  const [expanded, setExpanded] = useState(false)
  const [position, setPosition] = useState(() => {
    const offset = Math.min(72, Math.max(0, (workspace.current?.clientWidth ?? 0) - 755), (index % 7) * 18)
    return { x: offset, y: offset }
  })
  const drag = useRef(null)
  const heading = useRef(null)
  const windowRef = useRef(null)

  useEffect(() => {
    if (active && !windowRef.current?.contains(document.activeElement)) heading.current?.focus({ preventScroll: true })
  }, [active])

  function startDrag(event) {
    if (event.button !== 0 || expanded || event.target.closest('button') || matchMedia('(max-width: 640px)').matches) return
    const bounds = windowRef.current.getBoundingClientRect()
    const desktop = workspace.current.getBoundingClientRect()
    drag.current = {
      pointerX: event.clientX - position.x,
      pointerY: event.clientY - position.y,
      minX: position.x - bounds.left + desktop.left,
      minY: position.y - bounds.top + desktop.top,
      maxX: position.x + desktop.right - bounds.right,
      maxY: position.y + desktop.bottom - bounds.bottom,
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

  const welcome = id === 'welcome'
  return (
    <section ref={windowRef} className={'win98-window' + (expanded ? ' win98-expanded' : '')}
      hidden={minimized} data-active={active}
      style={{ '--window-x': position.x + 'px', '--window-y': position.y + 'px', zIndex: index + 1 }}
      aria-labelledby={'win98-title-' + id} onPointerDown={() => activate(id)} onFocus={() => activate(id)}>
      <header className="win98-titlebar" onPointerDown={startDrag} onPointerMove={moveWindow}
        onLostPointerCapture={() => { drag.current = null }}
        onDoubleClick={event => { if (!event.target.closest('button')) setExpanded(value => !value) }}>
        <Icon name={icon} url={iconUrl} />
        <span tabIndex={-1} ref={heading} id={'win98-title-' + id}>{label}</span>
        <div className="win98-window-controls">
          <button type="button" aria-label="Minimize window" onClick={() => minimize(id)}><i className="win98-minimize" /></button>
          <button type="button" aria-label={expanded ? 'Restore window size' : 'Maximize window'} onClick={() => setExpanded(value => !value)}><i className={expanded ? 'win98-restore' : 'win98-maximize'} /></button>
          <button type="button" aria-label="Close window" onClick={() => close(id)}><i className="win98-close" /></button>
        </div>
      </header>
      {welcome && <div className="win98-banner"><Icon name="windows_32" size={32} />Welcome to Abhishek's portfolio</div>}
      <div className="win98-window-body">
        {id === 'internet' ? <InternetExplorer openApp={openApp} /> :
          id === 'projects' || id.startsWith('project-') ? <ProjectContent app={id} openApp={openApp} /> :
          <PortfolioContent app={id} openApp={openApp} />}
      </div>
      {welcome && <footer className="win98-status">
        <label><input type="checkbox" checked={startup} onChange={event => setStartup(event.target.checked)} /> Show Welcome at startup</label>
        <button type="button" onClick={() => close(id)}>Close</button>
      </footer>}
    </section>
  )
}

function Desktop() {
  const [booting, setBooting] = useState(true)
  const finishBoot = useCallback(() => setBooting(false), [])
  const [startup, setStartup] = useState(showWelcome)
  const [windows, setWindows] = useState(() => showWelcome() ? [{ id: 'welcome', minimized: false }] : [])
  const [hiddenDesktop, setHiddenDesktop] = useState(false)
  const [start, setStart] = useState(false)
  const [selected, setSelected] = useState(null)
  const workspace = useRef(null)
  const startButton = useRef(null)
  const startArea = useRef(null)
  const firstStartItem = useRef(null)
  const active = hiddenDesktop ? undefined : windows.findLast(entry => !entry.minimized)?.id

  useEffect(() => {
    if (!start) return
    firstStartItem.current?.focus()
    function dismiss(event) {
      if (!startArea.current?.contains(event.target)) setStart(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [start])

  function changeStartup(checked) {
    setStartup(checked)
    try {
      localStorage.setItem(welcomePreference, checked ? 'on' : 'off')
    } catch {
      // Sandboxed previews still update the preference for this session.
    }
  }

  function activate(id) {
    setWindows(entries => {
      if (entries.at(-1)?.id === id && !entries.at(-1).minimized) return entries
      return [...entries.filter(entry => entry.id !== id), { id, minimized: false }]
    })
  }

  function openApp(id) {
    if (!Object.hasOwn(apps, id)) return
    activate(id)
    setHiddenDesktop(false)
    setStart(false)
  }

  function minimize(id) {
    setWindows(entries => entries.map(entry => entry.id === id ? { ...entry, minimized: true } : entry))
    document.getElementById('win98-task-' + id)?.focus()
  }

  function close(id) {
    setWindows(entries => entries.filter(entry => entry.id !== id))
    document.getElementById('win98-shortcut-' + id)?.focus()
  }

  if (booting) return <BootSequence onComplete={finishBoot} />

  return (
    <div className="win98-desktop">
      <div className="win98-workspace" ref={workspace}>
        <nav className="win98-shortcuts" aria-label="Desktop shortcuts">
          {shortcuts.map(({ id, label, icon, iconUrl }) => (
            <button key={id} id={'win98-shortcut-' + id} type="button" aria-pressed={selected === id}
              onClick={event => {
                setSelected(id)
                if (id.startsWith('project-') || !event.detail || matchMedia('(pointer: coarse)').matches) openApp(id)
              }} onDoubleClick={() => openApp(id)}>
              <Icon name={icon} url={iconUrl} size={32} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <main className="win98-main" hidden={hiddenDesktop}>
          {windows.toSorted((a, b) => a.id.localeCompare(b.id)).map(entry => <AppWindow key={entry.id} entry={entry} index={windows.indexOf(entry)}
            active={entry.id === active} workspace={workspace} openApp={openApp} activate={activate}
            minimize={minimize} close={close} startup={startup} setStartup={changeStartup} />)}
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
              {systemApps.map(({ id, icon, label }, index) => <button key={id} type="button" ref={index === 0 ? firstStartItem : undefined} onClick={() => openApp(id)}><Icon name={icon} size={24} />{label}</button>)}
              <a href={base}><Icon name="ie_32" size={24} />Expedition</a>
            </div>
          </nav>
        </div>
        <div className="win98-quicklaunch" aria-label="Quick Launch">
          <button type="button" aria-label="Open Internet Explorer" title="Internet Explorer" onClick={() => openApp('internet')}><Icon name="ie_16" /></button>
          <button type="button" aria-label="Show desktop" title="Show desktop" onClick={() => setHiddenDesktop(value => !value)}><Icon name="desktop_16" /></button>
        </div>
        <div className="win98-tasks" aria-label="Open windows">
          {windows.map(({ id }) => <button key={id} id={'win98-task-' + id} type="button" aria-pressed={id === active}
            onClick={() => id === active ? minimize(id) : openApp(id)}>
            <Icon name={apps[id].icon} url={apps[id].iconUrl} /><span>{apps[id].label}</span>
          </button>)}
        </div>
        <div className="win98-tray"><Icon name="sched_task_16" /><Icon name="loudspeaker_rays_16" /><Clock /></div>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><Desktop /></StrictMode>)
