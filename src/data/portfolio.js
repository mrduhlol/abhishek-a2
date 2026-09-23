// Central content model — edit here to extend the site.
// Adding a project = append one object to PROJECTS. No UI changes needed.

export const NAV_LINKS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
];

export const SOCIALS = {
  github: "https://github.com/mrduhlol",
  githubHandle: "mrduhlol",
  linkedin: "https://www.linkedin.com/",
  email: "mailto:hello@abhishek.dev",
  emailLabel: "hello@abhishek.dev",
};

export const PROJECTS = [
  {
    id: "flipdeck",
    index: "01",
    name: "FlipDeck",
    tagline: "UNO-inspired multiplayer web game",
    description:
      "A real-time multiplayer card game with rooms, turn logic and a fast, tactile interface. Built to learn state sync, game loops and playful UI under latency.",
    tech: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    links: { live: "#", github: "https://github.com/mrduhlol" },
    accent: "#5B8CFF",
    motif: "cards",
  },
  {
    id: "bytedrop",
    index: "02",
    name: "Byte Drop",
    tagline: "Lightweight device-to-device file transfer",
    description:
      "A minimal file-transfer app for moving files between devices on a network. Focused on speed, zero setup and a calm, exact interface.",
    tech: ["Python", "JavaScript", "Networking"],
    links: { live: "#", github: "https://github.com/mrduhlol" },
    accent: "#8B5CF6",
    motif: "transfer",
  },
  {
    id: "cricketdude",
    index: "03",
    name: "Cricket Dude",
    tagline: "Cricket data in the terminal",
    description:
      "A Python terminal app that pulls live cricket data from public APIs into a clean CLI/TUI. Scores, fixtures and details — no browser required.",
    tech: ["Python", "API", "CLI/TUI"],
    links: { live: "#", github: "https://github.com/mrduhlol" },
    accent: "#5B8CFF",
    motif: "terminal",
  },
];

export const SKILL_GROUPS = [
  {
    id: "development",
    title: "Development",
    items: ["React", "TypeScript", "JavaScript", "Python", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    items: ["Linux", "Networking", "Web Security", "Security Fundamentals"],
  },
  {
    id: "tools",
    title: "Tools",
    items: ["Git", "GitHub", "VS Code", "Docker", "Cloud platforms"],
  },
  {
    id: "interests",
    title: "Interests",
    items: ["AI", "Cloud Security", "Robotics", "Software Engineering"],
  },
];

export const JOURNEY = [
  { id: "jnv", title: "JNV", text: "Foundations — curiosity, discipline, first principles." },
  { id: "design", title: "Technology & Design", text: "Learned how things look, feel and break." },
  { id: "web", title: "Web Development", text: "React, TypeScript and shipping real interfaces." },
  { id: "security", title: "Cybersecurity", text: "Linux, networking and how systems actually work." },
  { id: "projects", title: "Building Projects", text: "Games, tools and terminal apps — now." },
  { id: "future", title: "Future", text: "Secure systems, AI and things that matter." },
];

export const EXPLORING = [
  { title: "Cybersecurity", text: "Web security, labs and fundamentals done right." },
  { title: "AI", text: "LLMs, agents and building with models." },
  { title: "Cloud Security", text: "Identity, misconfigurations and safe defaults." },
  { title: "Web Development", text: "Motion, performance and refined interfaces." },
  { title: "Systems", text: "Networking, Linux and how it all connects." },
  { title: "Robotics", text: "Hardware curiosity — sensors, control, play." },
];

export const ABOUT_INTERESTS = [
  "Cybersecurity",
  "Web Development",
  "AI",
  "Cloud",
  "Software Engineering",
  "Robotics",
];
