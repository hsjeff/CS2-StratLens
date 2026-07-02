import { useState, useEffect } from "react";
import mirageMap from "./assets/Cs2_mirage.png";
import "./App.css";

const utilities = [
  {
    id: 1,
    name: "Window Smoke",
    type: "Smoke",
    throwerId: "T1",

    throwTime: 1.0,
    landTime: 2.0,
    expireTime: 8.0,

    startX: 25,
    startY: 65,

    landX: 45,
    landY: 52,

    radius: 8,
    description: "Blocks connector vision for mid control."
  },
  {
    id: 2,
    name: "Top Mid Flash",
    type: "Flash",
    throwerId: "T2",

    throwTime: 1.5,
    landTime: 2.2,
    expireTime: 3.0,

    startX: 25.5,
    startY: 69,

    landX: 42,
    landY: 51,

    radius: 10,
    description: "Pop flash for top mid."
  },
  {
    id: 3,
    name: "Short Molotov",
    type: "Molotov",
    throwerId: "CT1",

    throwTime: 2.0,
    landTime: 2.8,
    expireTime: 9.0,

    startX: 65,
    startY: 40,

    landX: 55,
    landY: 48,

    radius: 7,
    description: "Denies short push."
  }
];

const players = [
  {
    id: "T1",
    name: "T Player 1",
    team: "T",
    path: [
      { time: 0, x: 20, y: 70 },
      { time: 1, x: 25, y: 65 },
      { time: 2, x: 30, y: 60 },
      { time: 3, x: 40, y: 55 },
      { time: 4, x: 50, y: 50 }
    ]
  },
  {
    id: "T2",
    name: "T Player 2",
    team: "T",
    path: [
      { time: 0, x: 18, y: 78 },
      { time: 1, x: 23, y: 72 },
      { time: 2, x: 28, y: 66 },
      { time: 3, x: 35, y: 60 },
      { time: 4, x: 42, y: 55 }
    ]
  },
  {
    id: "CT1",
    name: "CT Player 1",
    team: "CT",
    path: [
      { time: 0, x: 75, y: 30 },
      { time: 1, x: 70, y: 35 },
      { time: 2, x: 65, y: 40 },
      { time: 3, x: 60, y: 45 },
      { time: 4, x: 55, y: 50 }
    ]
  }
];
const maxTime = Math.max(...players.flatMap((player) => player.path.map((pos) => pos.time)), ...utilities.map((utility) => utility.expireTime));

function getInterpolatedPath(path, currentTime) {
  if (currentTime <= path[0].time) {
    return {
      visiblePath: [path[0]],
      currentPosition: path[0]
    };
  }

  if (currentTime >= path[path.length - 1].time) {
    return {
      visiblePath: path,
      currentPosition: path[path.length - 1]
    };
  }

  const visiblePath = [];

  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];

    if (start.time <= currentTime) {
      visiblePath.push(start);
    }

    if (currentTime >= start.time && currentTime <= end.time) {
      const progress =
        (currentTime - start.time) / (end.time - start.time);

      const currentPosition = {
        time: currentTime,
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
      };

      visiblePath.push(currentPosition);

      return {
        visiblePath,
        currentPosition
      };
    }
  }

  return {
    visiblePath: path,
    currentPosition: path[path.length - 1]
  };
}

function App() {
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("ALL");
  const [selectedUtilityType, setSelectedUtilityType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlayers = players.filter((player) => {
    return selectedPlayerId === "ALL" || player.id === selectedPlayerId;
  });

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredUtilities = utilities.filter((utility) => {
    const matchesPlayer =
      selectedPlayerId === "ALL" || utility.throwerId === selectedPlayerId;

    const matchesType =
      selectedUtilityType === "ALL" || utility.type === selectedUtilityType;

    const searchableText = [
      utility.name,
      utility.type,
      utility.throwerId,
      utility.description
    ]
      .join(" ")
      .toLowerCase();
    const searchTerms = normalizedSearchQuery
    .split(/\s+/)
    .filter((term) => term !== "");
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      searchTerms.every((term) => searchableText.includes(term));

    return matchesPlayer && matchesType && matchesSearch;
  });

  const utilityStates = filteredUtilities.map((utility) => {
    let state = "waiting";

    if (currentTime < utility.throwTime) {
      state = "waiting";
    } else if (currentTime < utility.landTime) {
      state = "flying";
    } else if (currentTime < utility.expireTime) {
      state = "active";
    } else {
      state = "expired";
    }

    let currentX = utility.landX;
    let currentY = utility.landY;

    if (state === "flying") {
      const progress = (currentTime - utility.throwTime) / (utility.landTime - utility.throwTime);
      currentX = utility.startX + (utility.landX - utility.startX) * progress;
      currentY = utility.startY + (utility.landY - utility.startY) * progress;
    }

    return {
      ...utility,
      state,
      currentX,
      currentY
    };
  });

  const visiblePlayers = filteredPlayers.map((player) => {
    const { visiblePath, currentPosition } = getInterpolatedPath(player.path, currentTime);

    const pathPoints = visiblePath
      .map((pos) => `${pos.x},${pos.y}`)
      .join(" ");

    return {
      ...player,
      visiblePath,
      pathPoints,
      currentPosition
    };
  });
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentTime((prevTime) => {
        if (prevTime >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }

        return Number((prevTime + 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [isPlaying, maxTime]);
  return (
    <div>
      <h1>CS2 StratLens</h1>
      <div className="layout">
        <div>
          <div className="filter-panel">
            <div className="filter-group">
              <label>Player</label>
              <select
                value={selectedPlayerId}
                onChange={(event) => {
                  setSelectedPlayerId(event.target.value);
                  setSelectedUtility(null);
                }}
              >
                <option value="ALL">All players</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.id} - {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Utility</label>
              <select
                value={selectedUtilityType}
                onChange={(event) => {
                  setSelectedUtilityType(event.target.value);
                  setSelectedUtility(null);
                }}
              >
                <option value="ALL">All utilities</option>
                <option value="Smoke">Smoke</option>
                <option value="Flash">Flash</option>
                <option value="Molotov">Molotov</option>
                <option value="Grenade">Grenade</option>
                <option value="Decoy">Decoy</option>
              </select>
            </div>
            <div className="filter-group search-group">
              <label>Search</label>
              <input
                type="text"
                value={searchQuery}
                placeholder="Type here..."
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSelectedUtility(null);
                }}
              />
            </div>
            <button
              onClick={() => {
                setSelectedPlayerId("ALL");
                setSelectedUtilityType("ALL");
                setSelectedUtility(null);
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
          {normalizedSearchQuery !== "" && (
            <div className="search-results">
              <p>
                Search results: {filteredUtilities.length}
              </p>

              {filteredUtilities.length === 0 ? (
                <p>No utilities found.</p>
              ) : (
                filteredUtilities.map((utility) => (
                  <button
                    key={utility.id}
                    className="search-result-item"
                    onClick={() => {
                      setSelectedUtility(utility);
                      setCurrentTime(utility.landTime);
                      setIsPlaying(false);
                    }}
                  >
                    <strong>{utility.name}</strong>
                    <span>
                      {utility.type} · {utility.throwerId} · lands at {utility.landTime}s
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
          <div className="map-container">
            <img src={mirageMap} alt="Mirage map" className="map-image" />
            <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              {visiblePlayers.map((player) => (
                <polyline
                  key={player.id}
                  className={`path-line ${player.team === "T" ? "t-path" : "ct-path"}`}
                  points={player.pathPoints} />
              ))}
              {utilityStates.map((utility) => {
                if (utility.state === "waiting" || utility.state === "expired") {
                  return null;
                }

                return (
                  <line
                    key={`throw-line-${utility.id}`}
                    className={`utility-throw-line ${utility.type.toLowerCase()}-throw-line`}
                    x1={utility.startX}
                    y1={utility.startY}
                    x2={utility.state === "flying" ? utility.currentX : utility.landX}
                    y2={utility.state === "flying" ? utility.currentY : utility.landY}
                  />
                );
              })}
            </svg>
            {visiblePlayers.map((player) =>
              player.visiblePath.map((pos, index) => (
                <div
                  key={`${player.id}-${index}`}
                  className={`path-dot ${player.team === "T" ? "t-dot" : "ct-dot"}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                />
              )))}
            {visiblePlayers.map((player) =>
              player.currentPosition ? (
                <div
                  key={player.id}
                  className={`player-dot ${player.team === "T" ? "t-player" : "ct-player"}`}
                  style={{
                    left: `${player.currentPosition.x}%`,
                    top: `${player.currentPosition.y}%`
                  }}
                >
                  {player.id}
                </div>
              ) : null
            )}

            {utilityStates.map((utility) => {
              if (utility.state === "waiting" || utility.state === "expired") {
                return null;
              }

              if (utility.state === "flying") {
                return (
                  <div
                    key={utility.id}
                    className={`utility-projectile ${utility.type.toLowerCase()}-projectile`}
                    style={{
                      left: `${utility.currentX}%`,
                      top: `${utility.currentY}%`
                    }}
                    onClick={() => setSelectedUtility(utility)}
                  >
                    {utility.type[0]}
                  </div>
                );
              }

              if (utility.state === "active") {
                return (
                  <div
                    key={utility.id}
                    className={`utility-effect ${utility.type.toLowerCase()}`}
                    style={{
                      left: `${utility.landX}%`,
                      top: `${utility.landY}%`,
                      width: `${utility.radius * 2}%`,
                      height: `${utility.radius * 2}%`
                    }}
                    onClick={() => setSelectedUtility(utility)}
                  >
                    <span className="utility-label">
                      {utility.type.toUpperCase()}
                    </span>
                  </div>
                );
              }

              return null;
            })}
          </div>
          <div className="timeline-control">
            <label>Time: {currentTime.toFixed(1)}s</label>

            <input
              type="range"
              min="0"
              step="0.1"
              max={maxTime}
              value={currentTime}
              onChange={(event) => setCurrentTime(Number(event.target.value))}
            />
            <div className="replay-buttons">
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? "Pause" : "Play"}
              </button>

              <button
                onClick={() => {
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <div className="info-panel">
          {selectedUtility ? (
            <>
              <h2>{selectedUtility.name}</h2>

              <p><strong>Type:</strong> {selectedUtility.type}</p>
              <p><strong>Thrower:</strong> {selectedUtility.throwerId}</p>

              <hr />

              <p><strong>Thrown:</strong> {selectedUtility.throwTime}s</p>
              <p><strong>Landed:</strong> {selectedUtility.landTime}s</p>
              <p><strong>Expired:</strong> {selectedUtility.expireTime}s</p>
              <p>
                <strong>Duration:</strong>{" "}
                {(selectedUtility.expireTime - selectedUtility.landTime).toFixed(1)}s
              </p>

              <hr />

              <p>
                <strong>Landing Position:</strong><br />
                x = {selectedUtility.landX}, y = {selectedUtility.landY}
              </p>

              <p>
                <strong>Effect Radius:</strong><br />
                {selectedUtility.radius}% of map scale
              </p>

              <p>{selectedUtility.description}</p>

              <button onClick={() => setSelectedUtility(null)}>
                Clear selection
              </button>
            </>
          ) : (
            <><h2>Utility Event Details</h2><p>Click an active utility on the map.</p></>
          )}
        </div>
      </div>
    </div>
  )
}

export default App;