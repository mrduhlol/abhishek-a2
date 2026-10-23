import "./ascii.css";

const SCENES = {
  mountain: [
    { text: "/\\\n/  \\", pos: "top: 14%; left: 6%;", sway: false },
    {
      text: "| |\n|-|\n| |\n|-|\n| |\n|-|\n| |",
      pos: "bottom: 18%; right: 8%;",
      sway: false,
      accent: true,
    },
  ],
  forest: [
    { text: " ( )\n /|\\\n  |", pos: "top: 12%; right: 7%;", sway: true },
    { text: " ~~~", pos: "bottom: 22%; left: 5%;", sway: true, accent: true },
  ],
  grassland: [
    { text: " /|  /|\n  |   |", pos: "bottom: 16%; left: 6%;", sway: true },
    {
      text: " '  '  '",
      pos: "bottom: 12%; right: 9%;",
      sway: true,
      accent: true,
    },
  ],
  desert: [
    {
      text: "   _\n  | | _\n _| || |\n| | ||_|\n|_| |\n  | |\n__|_|__",
      pos: "bottom: 16%; right: 8%;",
      sway: false,
    },
    { text: "~~~~~", pos: "bottom: 18%; left: 7%;", sway: false, accent: true },
  ],
  ocean: [
    { text: "~  ~  ~", pos: "top: 12%; left: 6%;", sway: false, accent: true },
    { text: "><>", pos: "bottom: 20%; right: 9%;", sway: true },
  ],
  cave: [
    {
      text: "   /\\\n  /| \\\n | | |\n | | |\n  \\|/",
      pos: "bottom: 14%; left: 7%;",
      sway: false,
      accent: true,
    },
    { text: " *  *", pos: "bottom: 16%; right: 8%;", sway: false },
  ],
  volcano: [
    { text: "  ^\n / \\", pos: "top: 13%; right: 7%;", sway: false },
    {
      text: " . ' .",
      pos: "bottom: 18%; left: 6%;",
      sway: false,
      accent: true,
    },
  ],
};

export default function AsciiScenery({ type }) {
  const items = SCENES[type] || [];
  return (
    <div className="ascii-scenery" aria-hidden="true">
      {items.map((item, i) => (
        <pre
          key={i}
          className={
            "ascii-scenery__object" +
            (item.accent ? " ascii-scenery__object--accent" : "") +
            (item.sway ? " ascii-scenery__object--sway" : "")
          }
          style={{ ...parseStyle(item.pos) }}
        >
          {item.text}
        </pre>
      ))}
    </div>
  );
}

function parseStyle(str) {
  const out = {};
  str.split(";").forEach((p) => {
    const [k, v] = p.split(":");
    if (k && v) out[k.trim()] = v.trim();
  });
  return out;
}
