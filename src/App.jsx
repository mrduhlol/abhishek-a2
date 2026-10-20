import UnderConstruction from "./components/UnderConstruction.jsx";

// The portfolio is temporarily parked while the site is rebuilt: every path
// renders the under-construction page (the camel-caravan dusk piece). All
// portfolio components remain in src/components/ untouched — point App back
// at them when the redesign ships. Cloudflare serves index.html for unknown
// paths (SPA fallback in wrangler.jsonc), so deep links land here too.
export default function App() {
  return <UnderConstruction />;
}
