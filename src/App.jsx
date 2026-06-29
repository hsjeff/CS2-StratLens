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

const playerPath = [
  { time: 0, x: 20, y: 70 },
  { time: 1, x: 25, y: 65 },
  { time: 2, x: 30, y: 60 },
  { time: 3, x: 40, y: 55 },
  { time: 4, x: 50, y: 50 }
];

function App() {
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const visiblePath = playerPath.filter((pos) => pos.time <= currentTime);

  const pathPoints = visiblePath
    .map((pos) => `${pos.x},${pos.y}`)
    .join(" ");

  const currentPlayerPosition = visiblePath[visiblePath.length - 1];
  return (
    <div>
      <h1>CS2 StratLens</h1>
      <div className="layout">
        <div>
          <div className="map-container">
            <img src={mirageMap} alt="Mirage map" className="map-image" />
            <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline className="path-line" points={pathPoints} />
            </svg>
            {visiblePath.map((pos, index) => (
              <div
                key={index}
                className="path-dot"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              />
            ))}
            {currentPlayerPosition && (
              <div
                className="player-dot"
                style={{
                  left: `${currentPlayerPosition.x}%`,
                  top: `${currentPlayerPosition.y}%`
                }}
              />
            )}

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
          <div className="timeline-control">
            <label>Time: {currentTime}</label>

            <input
              type="range"
              min="0"
              max="4"
              value={currentTime}
              onChange={(event) => setCurrentTime(Number(event.target.value))}
            />
          </div>
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