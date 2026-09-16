// Placeholder profile — replace with your real info + photos later
export const PROFILE = {
  name: 'Abhishek',
  handle: '@abhi',
  role: 'Creative Developer and Student',
  location: 'India, UTC+5:30',
  os: 'abhiOS 1.0',
  shell: 'zsh-lite',
  focus: 'Development, Linux, Security basics',
  bio: "I build web interfaces, practice Linux and Python, and like clean, simple design. This OS is my interactive portfolio — open the apps from the dock, play a game, or browse the gallery.",
  skills: ['React', 'JavaScript', 'Python', 'Linux', 'UI Design'],
  links: [
    { label: 'GitHub', detail: 'github.com', url: 'https://github.com/' },
    { label: 'Instagram', detail: 'instagram.com', url: 'https://instagram.com/' },
    { label: 'Email', detail: 'hello@example.com', url: 'mailto:hello@example.com' },
  ],
};

function Row({ k, v }) {
  return (
    <div className="set-row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export function AboutMe() {
  return (
    <div className="app">
      <div className="about-hero">
        <div className="avatar">A</div>
        <div>
          <h2 style={{ fontSize: 20 }}>{PROFILE.name}</h2>
          <div className="dim">{PROFILE.handle} — {PROFILE.role}</div>
        </div>
      </div>

      <div className="set-label">About</div>
      <div className="card" style={{ marginBottom: 6 }}>{PROFILE.bio}</div>

      <div className="set-label">Details</div>
      <div className="set-card">
        <Row k="Role" v={PROFILE.role} />
        <Row k="Location" v={PROFILE.location} />
        <Row k="System" v={PROFILE.os} />
        <Row k="Shell" v={PROFILE.shell} />
        <Row k="Focus" v={PROFILE.focus} />
      </div>

      <div className="set-label">Skills</div>
      <div className="set-card">
        <div className="skills" style={{ marginTop: 0 }}>
          {PROFILE.skills.map((s) => <span key={s} className="tag">{s}</span>)}
        </div>
      </div>

      <div className="set-label">Accounts</div>
      <div className="set-card">
        {PROFILE.links.map((l) => (
          <a key={l.label} className="set-row link" href={l.url} target="_blank" rel="noreferrer">
            <span>
              <span className="v" style={{ display: 'block' }}>{l.label}</span>
              <span className="dim" style={{ fontSize: 12 }}>{l.detail}</span>
            </span>
            <span className="chev">›</span>
          </a>
        ))}
      </div>

      <p className="dim" style={{ marginTop: 12, fontSize: 12 }}>
        To use your real info, edit PROFILE in src/os/apps/AboutMe.jsx.
      </p>
    </div>
  );
}
