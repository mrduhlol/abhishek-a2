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
  linkedin: "https://www.linkedin.com/in/duhlol",
  email: "mailto:abhishek.a2534@gmail.com",
  emailLabel: "abhishek.a2534@gmail.com",
};

export const PROJECTS = [
  {
    id: "blackjack",
    index: "01",
    name: "Black Jack",
    tagline: "Classic 21 card game in the browser",
    description:
      "A browser blackjack game with betting, hit/stand/double logic and a clean casino-table interface. Built to learn game state, odds and fast, tactile UI.",
    tech: ["React", "JavaScript", "Vite", "Tailwind CSS"],
    links: { live: "#", github: "https://github.com/mrduhlol" },
    accent: "#EAB308",
    motif: "blackjack",
    image: "/blackjack-preview.png",
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

// Scrollytelling 2.0 — pinned narrative chapters. Scroll scrubs through
// these; each chapter crossfades + scales cinematically while sticky.
// Keep copy short: one idea per chapter, readable in ~3 seconds.
export const SCROLLY_STORY = [
  {
    id: "build",
    index: "01",
    kink: "BUILD",
    title: "I start by building.",
    text: "Interfaces, games, tools — if I can click it, I want to know how it was made. Every project is a lab experiment.",
    accent: "#5B8CFF",
  },
  {
    id: "break",
    index: "02",
    kink: "BREAK",
    title: "Then I break it.",
    text: "Labs, networks, web security. Breaking things on purpose teaches how systems actually behave under pressure.",
    accent: "#8B5CF6",
  },
  {
    id: "learn",
    index: "03",
    kink: "LEARN",
    title: "Every break is a lesson.",
    text: "Linux, networking, fundamentals done right. I document, automate the boring parts, and harden what I build.",
    accent: "#22D3EE",
  },
  {
    id: "repeat",
    index: "04",
    kink: "REPEAT",
    title: "Then I ship it again — stronger.",
    text: "Secure systems, AI-assisted workflows, things that matter. The loop never ends: build, break, learn, repeat.",
    accent: "#34D399",
  },
];

export const STORY_SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "story", label: "Story" },
  { id: "about", label: "About" },
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
];
