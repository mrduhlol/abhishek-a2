const email = 'abhishek.a2534@gmail.com'
const github = 'https://github.com/mrduhlol'
const linkedin = 'https://www.linkedin.com/in/duhlol'
const portrait = import.meta.env.BASE_URL + 'abhishek-cutout.webp'

export default function PortfolioContent({ app, openApp }) {
  if (app === 'welcome') {
    return (
      <section className="win98-content win98-welcome">
        <h1>Welcome</h1>
        <p>Explore Abhishek’s portfolio from the desktop. Double-click a system shortcut or select it from the Start menu.</p>
        <dl>
          <dt>My Computer</dt><dd>About Abhishek</dd>
          <dt>My Documents</dt><dd>Project list</dd>
          <dt>Internet Explorer</dt><dd>Search the portfolio</dd>
          <dt>Outlook Express</dt><dd>Contact and social links</dd>
        </dl>
        <p>Click a project icon to open its details.</p>
      </section>
    )
  }

  if (app === 'contact') {
    return (
      <section className="win98-content win98-contact">
        <h1>Contact Abhishek</h1>
        <p>Have a question about a project or an idea to share? Send me an email.</p>
        <ul className="win98-contact-links">
          <li><a href={'mailto:' + email}>{email}</a></li>
          <li><a href={github}>GitHub</a></li>
          <li><a href={linkedin}>LinkedIn</a></li>
        </ul>
      </section>
    )
  }

  return (
    <section className="win98-content win98-about">
      <div>
        <h1>Hi, I’m Abhishek.</h1>
        <p>I build Android apps, Linux utilities, and things for the web. You can turn your phone into a Linux microphone with Voxlink, convert files locally with Orbit, or make stickers from your photos with Stikr.</p>
        <div className="win98-content-actions">
          <button type="button" onClick={() => openApp('projects')}>Browse projects</button>
          <button type="button" onClick={() => openApp('contact')}>Get in touch</button>
        </div>
      </div>
      <div className="win98-portrait"><img src={portrait} alt="Abhishek" /></div>
    </section>
  )
}
