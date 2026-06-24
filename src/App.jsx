import { useState } from "react";
import mirageMap from "./assets/Cs2_mirage.png";
import "./App.css";

const utilities = [
  {
    id: 1,
    name: "Window Smoke",
    type: "Smoke",
    x: 52,
    y: 38,
    description: "Blocks Window for mid control."
  },
  {
    id: 2,
    name: "A Ramp Flash",
    type: "Flash",
    x: 40,
    y: 62,
    description: "Helps teammates enter A site."
  },
  {
    id: 3,
    name: "Default Molotov",
    type: "Molotov",
    x: 58,
    y: 58,
    description: "Clears default plant position."
  }
];

function App() {
  const [selectedUtility, setSelectedUtility] = useState(null);

  return (
    <div>
      <h1>CS2 StratLens</h1>
      <div className="layout">
        <div className="map-container">
          <img src={mirageMap} alt="Mirage map" className="map-image" />
          {utilities.map((utility) => (
            <div
              key={utility.id}
              className="marker"
              style={{ left: `${utility.x}%`, top: `${utility.y}%` }}
              onClick={() => setSelectedUtility(utility)}
            >
              {utility.type}
            </div>
          ))}
        </div>
        <div className="info-panel">
          {selectedUtility ? (
            <>
              <h2>{selectedUtility.name}</h2>
              <p>Type: {selectedUtility.type}</p>
              <p>{selectedUtility.description}</p>
            </>
          ) : (
            <p>Click a marker on the map.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App;