import mirageMap from "./assets/Cs2_mirage.png";
import "./App.css";

function App() {
  return (
    <div>
      <h1>CS2 StratLens</h1>
      <div className="map-container">
        <img src={mirageMap} alt="Mirage map" className="map-image" />

      <div className="marker" style={{ top: "50%", left: "50%" }}>Smoke</div>
      </div>
    </div>
  )
}

export default App;