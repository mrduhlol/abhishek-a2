import { PROJECTS } from "../data/projects.js";
import "./project-content.css";

const baseUrl = import.meta.env.BASE_URL;

export const projectApps = PROJECTS.map(({ id, name }) => ({
  id: `project-${id}`,
  label: name,
  iconUrl: `${baseUrl}win98-project-icons/${id}.png`,
}));

const screenshots = {
  "github-widgets": {
    file: "github-widgets.webp",
    caption: "GitHub contribution statistics in the Android app",
    source: "https://github.com/mrduhlol/github-widget/blob/2bb98b55a185a55d50a812c6b1a2ee0ed01a406b/site/assets/screens/08-stats.webp",
  },
  docutype: {
    file: "docutype.png",
    caption: "DocuType extension popup",
    source: "https://github.com/mrduhlol/DocuType/blob/1828a238b52d3ed35c3587242c60a0f8c14eeb6d/docs/popup.png",
  },
  stikr: {
    file: "stikr.webp",
    caption: "Sticker editor in the Android app",
    source: "https://github.com/mrduhlol/stikr/blob/3168315640e13307d553b6aaefb565327cedf3ec/docs/site/assets/app-editor.webp",
  },
  "black-jack": {
    file: "black-jack.png",
    caption: "Black Jack gameplay preview",
    source: "https://github.com/mrduhlol/black-jack/blob/db8c1f846e1bc3c1091cdb6fe95f3edf63252b89/docs/preview.png",
  },
};

export default function ProjectContent({ app, openApp }) {
  if (app === "projects") {
    return (
      <section className="win98-content win98-project-directory">
        <h1>Projects</h1>
        <ul className="win98-project-shortcuts">
          {projectApps.map(({ id, label, iconUrl }) => (
            <li key={id}>
              <button type="button" onClick={() => openApp(id)}>
                <img src={iconUrl} alt="" width="32" height="32" />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const project = PROJECTS.find(({ id }) => app === `project-${id}`);
  if (!project) return null;

  const screenshot = screenshots[project.id];
  return (
    <article className="win98-content win98-project-detail">
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <p>Built with {project.tech.join(" · ")}</p>
      <p className="win98-project-links">
        <a href={project.github} aria-label={`View ${project.name} source on GitHub`}>View source</a>
        {project.live && <a href={project.live}>Open {project.name}</a>}
      </p>
      {screenshot && (
        <figure className="win98-project-screenshot">
          <a href={screenshot.source} aria-label={`View original ${project.name} screenshot on GitHub`}>
            <img src={`${baseUrl}win98-projects/${screenshot.file}`} alt={screenshot.caption} />
          </a>
          <figcaption>{screenshot.caption}</figcaption>
        </figure>
      )}
    </article>
  );
}
