import { useState, useEffect } from "react";
import { maps, getMapById } from "./mapConfig";
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

  const [roundPlayers, setRoundPlayers] = useState(players);
  const [roundUtilities, setRoundUtilities] = useState(utilities);
  const [isLoadingRound, setIsLoadingRound] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [selectedDemoFile, setSelectedDemoFile] = useState(null);
  const [isUploadingDemo, setIsUploadingDemo] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [currentPage, setCurrentPage] = useState("home");
  const [activeReplayName, setActiveReplayName] = useState("Sample Mirage Replay");
  const [selectedMapId, setSelectedMapId] = useState("mirage");

  const selectedMap = getMapById(selectedMapId);

  useEffect(() => {
    async function loadRoundData() {
      try {
        setIsLoadingRound(true);
        setLoadError("");

        const response = await fetch("http://127.0.0.1:8000/round");

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();

        setRoundPlayers(data.players);
        setRoundUtilities(data.utilities);
      } catch (error) {
        console.error(error);
        setLoadError("Could not load backend data. Using local mock data.");
      } finally {
        setIsLoadingRound(false);
      }
    }

    loadRoundData();
  }, []);

  function openSampleReplay() {
    if (selectedMap.status !== "available") {
      setUploadMessage(`${selectedMap.name} support is coming next. Mirage is available now.`);
      return;
    }

    setActiveReplayName(`Sample ${selectedMap.name} Replay`);
    setCurrentTime(0);
    setIsPlaying(false);
    setSelectedUtility(null);
    setSelectedPlayerId("ALL");
    setSelectedUtilityType("ALL");
    setSearchQuery("");
    setCurrentPage("replay");
  }

  function goBackHome() {
    setIsPlaying(false);
    setSelectedUtility(null);
    setCurrentPage("home");
  }

  async function handleDemoUpload() {
    if (!selectedDemoFile) {
      setUploadMessage("Please choose a .dem file first.");
      return;
    }

    try {
      setIsUploadingDemo(true);
      setUploadMessage("");

      const formData = new FormData();
      formData.append("file", selectedDemoFile);

      const response = await fetch("http://127.0.0.1:8000/upload-demo", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Demo upload failed.");
      }

      setUploadMessage(
        `${data.filename} uploaded successfully. Saved to ${data.savedTo}.`
      );
    } catch (error) {
      console.error(error);
      setUploadMessage(error.message);
    } finally {
      setIsUploadingDemo(false);
    }
  }

  const maxTime = Math.max(
    0,
    ...roundPlayers.flatMap((player) => player.path.map((pos) => pos.time)),
    ...roundUtilities.map((utility) => utility.expireTime)
  );

  const filteredPlayers = roundPlayers.filter((player) => {
    return selectedPlayerId === "ALL" || player.id === selectedPlayerId;
  });

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchTerms = normalizedSearchQuery
    .split(/\s+/)
    .filter((term) => term !== "");

  const filteredUtilities = roundUtilities.filter((utility) => {
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

  if (currentPage === "home") {
    return (
      <div>
        <div className="home-page">
          <section className="hero-section">
            <div>
              <p className="eyebrow">CS2 Replay Analysis Prototype</p>
              <h1>CS2 StratLens</h1>
              <p className="hero-description">
                Upload, inspect, and visualize Counter-Strike 2 replay data with
                player movement, utility timelines, search, and filters.
              </p>

              <div className="hero-actions">
                <button onClick={openSampleReplay}>
                  View {selectedMap.name} Sample Replay
                </button>

                <button
                  className="secondary-button"
                  onClick={() => {
                    setUploadMessage("Demo upload is available below. Parsing will be connected next.");
                  }}
                >
                  Upload Demo
                </button>
              </div>
            </div>

            <div className="hero-card">
              <h2>Current MVP</h2>
              <ul>
                <li>React replay viewer</li>
                <li>FastAPI backend</li>
                <li>SQLite utility prototype</li>
                <li>Demo upload endpoint</li>
              </ul>
            </div>
          </section>

          <section className="home-grid">
            <div className="home-panel">
              <h2>Upload CS2 Demo</h2>
              <p>
                Upload a .dem file to start the analysis pipeline. The backend can
                save demo files now; parsing will be connected next.
              </p>

              <div className="upload-controls">
                <input
                  type="file"
                  accept=".dem"
                  onChange={(event) => {
                    const file = event.target.files[0];

                    if (file) {
                      setSelectedDemoFile(file);
                      setUploadMessage("");
                    }
                  }}
                />

                <button
                  onClick={handleDemoUpload}
                  disabled={!selectedDemoFile || isUploadingDemo}
                >
                  {isUploadingDemo ? "Uploading..." : "Upload Demo"}
                </button>
              </div>

              {selectedDemoFile && (
                <p className="selected-file">
                  Selected file: {selectedDemoFile.name}
                </p>
              )}

              {uploadMessage !== "" && (
                <p className="upload-message">{uploadMessage}</p>
              )}
            </div>

            <div className="home-panel">
              <h2>Supported Maps</h2>
              <p>
                Choose the map you want to analyze. Mirage is available now; other maps
                are ready in the map system and will be connected with images and
                calibration next.
              </p>

              <div className="map-card-list">
                {maps.map((map) => (
                  <button
                    key={map.id}
                    type="button"
                    className={`map-card ${selectedMapId === map.id ? "active-map-card" : ""}`}
                    onClick={() => {
                      setSelectedMapId(map.id);
                      setUploadMessage("");
                    }}
                  >
                    <strong>{map.name}</strong>
                    <span>
                      {map.status === "available" ? "Available now" : "Coming next"}
                    </span>
                  </button>
                ))}
              </div>

              <p className="selected-map-note">
                Selected map: <strong>{selectedMap.name}</strong>
              </p>
            </div>

            <div className="home-panel">
              <h2>Analysis Features</h2>
              <ul>
                <li>Timeline replay</li>
                <li>Player path visualization</li>
                <li>Smoke, flash, and molotov lifecycle states</li>
                <li>Search by name, type, thrower, or description</li>
                <li>Filter by player and utility type</li>
              </ul>
            </div>

            <div className="home-panel">
              <h2>Next Engineering Step</h2>
              <p>
                The next goal is to parse uploaded CS2 demo files and convert
                parser output into the same round data schema used by the replay
                viewer.
              </p>

              <button onClick={openSampleReplay}>
                Open Replay Viewer
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="replay-header">
        <div>
          <button className="back-button" onClick={goBackHome}>
            ← Back to Home
          </button>
          <h1>CS2 StratLens</h1>
          <p>{activeReplayName}</p>
        </div>

        <div className="replay-status">
          <span>Map: {selectedMap.name}</span>
          <span>Players: {roundPlayers.length}</span>
          <span>Utilities: {roundUtilities.length}</span>
        </div>
      </div>

      {isLoadingRound && <p>Loading backend round data...</p>}
      {loadError !== "" && <p>{loadError}</p>}

      <div className="layout">
        <div>
          <div className="upload-panel">
            <h2>Upload CS2 Demo</h2>

            <div className="upload-controls">
              <input
                type="file"
                accept=".dem"
                onChange={(event) => {
                  const file = event.target.files[0];

                  if (file) {
                    setSelectedDemoFile(file);
                    setUploadMessage("");
                  }
                }}
              />

              <button
                onClick={handleDemoUpload}
                disabled={!selectedDemoFile || isUploadingDemo}
              >
                {isUploadingDemo ? "Uploading..." : "Upload Demo"}
              </button>
            </div>

            {selectedDemoFile && (
              <p className="selected-file">
                Selected file: {selectedDemoFile.name}
              </p>
            )}

            {uploadMessage !== "" && (
              <p className="upload-message">{uploadMessage}</p>
            )}
          </div>
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
                {roundPlayers.map((player) => (
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
            <img
              src={selectedMap.image}
              alt={`${selectedMap.name} map`}
              className="map-image"
            />
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