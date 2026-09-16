// Placeholder profile — replace with your real info + photos later
export const PROFILE = {
  name: 'Abhishek',
  handle: '@abhi',
  role: 'Creative Developer & Student',
  location: 'India • UTC+5:30',
  bio: "Hey! I'm Abhishek. I build playful web stuff, love Linux ricing, football, and late-night code sessions. This is my tiny OS — open the apps from the dock, play a game, and check the gallery.",
  skills: ['React', 'JavaScript', 'Python', 'Linux', 'UI Design'],
  links: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'Instagram', url: 'https://instagram.com/' },
    { label: 'Mail', url: 'mailto:hello@example.com' },
  ],
};

export function AboutMe() {
  return (
    <div className="app">
      <div className="about-hero">
        <div className="avatar">A</div>
        <div>
          <h2 style={{ fontSize: 24 }}>{PROFILE.name} <span className="dim" style={{ fontWeight: 400, fontSize: 14 }}>{PROFILE.handle}</span></h2>
          <div className="dim">{PROFILE.role}</div>
          <div className="dim" style={{ fontSize: 12.5 }}>{PROFILE.location}</div>
        </div>
      </div>
      <div className="card">{PROFILE.bio}</div>
      <div className="skills">
        {PROFILE.skills.map((s) => <span key={s} className="tag">{s}</span>)}
      </div>
      <div className="term">
        <div><span className="g">➜</span> <span className="b">~</span> whoami</div>
        <div>{PROFILE.handle} — {PROFILE.role}</div>
        <div><span className="g">➜</span> <span className="b">~</span> cat interests.txt</div>
        <div>coding • gaming • music • football • ricing desktops</div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        {PROFILE.links.map((l) => (
          <a key={l.label} className="btn ghost" style={{ textDecoration: 'none' }} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
        ))}
      </div>
      <p className="dim" style={{ marginTop: 12, fontSize: 12 }}>
        To use your real photo + bio, edit <code style={{ fontFamily: 'monospace' }}>src/os/apps/AboutMe.jsx</code> → PROFILE.
      </p>
    </div>
  );
}
