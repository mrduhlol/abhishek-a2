import { useRef, useState } from 'react'
import { PROJECTS } from '../data/projects.js'
import './InternetExplorer.css'

export default function InternetExplorer({ openApp }) {
  const [draft, setDraft] = useState('')
  const [history, setHistory] = useState({ entries: [''], index: 0 })
  const searchInput = useRef(null)
  const query = history.entries[history.index]
  const terms = query.toLowerCase().split(/\s+/)
  const results = query ? PROJECTS.filter(({ name, description, tech }) => {
    const text = [name, description, ...tech].join(' ').toLowerCase()
    return terms.every(term => text.includes(term))
  }) : []
  const googleUrl = query ? `https://www.google.com/search?${new URLSearchParams({ q: query })}` : 'https://www.google.com/'

  function navigate(nextQuery) {
    setDraft(nextQuery)
    if (nextQuery === query) return
    setHistory({ entries: [...history.entries.slice(0, history.index + 1), nextQuery], index: history.index + 1 })
  }

  function move(offset) {
    const index = history.index + offset
    setHistory({ ...history, index })
    setDraft(history.entries[index])
  }

  return (
    <div className="win98-ie">
      <nav className="win98-ie-toolbar" aria-label="Browser toolbar">
        <button type="button" disabled={history.index === 0} onClick={() => move(-1)}>Back</button>
        <button type="button" disabled={history.index === history.entries.length - 1} onClick={() => move(1)}>Forward</button>
        <button type="button" onClick={() => navigate('')}>Home</button>
        <button type="button" onClick={() => searchInput.current.focus()}>Search</button>
      </nav>
      <div className="win98-ie-address">
        <label htmlFor="win98-ie-address">Address</label>
        <input id="win98-ie-address" readOnly value={googleUrl} />
      </div>
      <div className={'win98-ie-page' + (query ? ' win98-ie-results-page' : '')}>
        <h1 className="win98-ie-wordmark" aria-label="Google">
          <span aria-hidden="true">G</span><span aria-hidden="true">o</span><span aria-hidden="true">o</span><span aria-hidden="true">g</span><span aria-hidden="true">l</span><span aria-hidden="true">e</span>
        </h1>
        <form className="win98-ie-search" onSubmit={event => {
          event.preventDefault()
          navigate(draft.trim())
        }}>
          <label htmlFor="win98-ie-query">Search Abhishek’s projects</label>
          <div>
            <input id="win98-ie-query" type="search" ref={searchInput} value={draft}
              onChange={event => setDraft(event.target.value)} />
            <button type="submit">Search Projects</button>
          </div>
        </form>
        {query && (
          <section className="win98-ie-results" aria-label="Project results">
            <p className="win98-ie-result-count" role="status">
              {results.length ? `${results.length} project${results.length === 1 ? '' : 's'} found` : 'No projects found'} for “{query}”
            </p>
            <ul>
              {results.map(({ id, name, description, tech }) => (
                <li key={id}>
                  <button type="button" onClick={() => openApp('project-' + id)}>{name}</button>
                  <p>{description}</p>
                  <div className="win98-ie-tech">{tech.join(' · ')}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
        <a className="win98-ie-google-link" href={googleUrl} target="_blank" rel="noopener noreferrer">
          {query ? 'Search Google for this query' : 'Open Google'} (new tab)
        </a>
      </div>
    </div>
  )
}
