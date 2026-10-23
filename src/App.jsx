import UnderConstruction from "./components/UnderConstruction.jsx";
import PortraitOpening from "./components/PortraitOpening.jsx";

// The new portrait opens the site while the adventure is being built.
// The existing construction scene and contact links remain below it.
export default function App() {
  return <><PortraitOpening /><UnderConstruction /></>;
}
