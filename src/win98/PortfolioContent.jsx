import { PROJECTS } from "../data/projects.js";

const EMAIL = "abhishek.a2534@gmail.com";
const GITHUB = "https://github.com/mrduhlol";
const LINKEDIN = "https://www.linkedin.com/in/duhlol";
const PORTRAIT = `${import.meta.env.BASE_URL}abhishek-cutout.webp`;

export default function PortfolioContent({ app, openApp }) {
  switch (app) {
    case "about":
      return (
        <section className="win98-content win98-about">
          <div className="win98-about-copy">
            <h1>Hi, I’m Abhishek.</h1>
            <p>
              I build Android apps, Linux utilities, and things for the web.
              You can turn your phone into a Linux microphone with Voxlink,
              convert files locally with Orbit, or make stickers from your
              photos with Stikr.
            </p>
            <div className="win98-content-actions">
              <button type="button" onClick={() => openApp("projects")}>
                Browse projects
              </button>
              <button type="button" onClick={() => openApp("contact")}>
                Get in touch
              </button>
            </div>
            <p className="win98-profile-links">
              <a href={GITHUB}>GitHub</a>
              <a href={LINKEDIN}>LinkedIn</a>
            </p>
          </div>
          <div className="win98-portrait">
            <img src={PORTRAIT} alt="Abhishek" />
          </div>
        </section>
      );

    case "projects":
      return (
        <section className="win98-content win98-projects">
          <h1>Projects</h1>
          <ul className="win98-project-list">
            {PROJECTS.map(({ id, name, description, tech, github, live }) => (
              <li key={id} className="win98-project">
                <h2>{name}</h2>
                <p>{description}</p>
                <p className="win98-project-tech">{tech.join(" · ")}</p>
                <div className="win98-project-links">
                  <a href={github} aria-label={`View ${name} source on GitHub`}>
                    View source
                  </a>
                  {live && <a href={live}>Open {name}</a>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      );

    case "contact":
      return (
        <section className="win98-content win98-contact">
          <h1>Get in touch</h1>
          <p>Have a question about a project or an idea to share? Send me an email.</p>
          <ul className="win98-contact-links">
            <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li><a href={GITHUB}>GitHub</a></li>
            <li><a href={LINKEDIN}>LinkedIn</a></li>
          </ul>
        </section>
      );

    default:
      return null;
  }
}
