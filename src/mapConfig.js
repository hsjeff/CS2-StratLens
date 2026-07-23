import mirageMap from "./assets/Cs2_mirage.png";

export const maps = [
  {
    id: "mirage",
    gameMapName: "de_mirage",
    name: "Mirage",
    image: mirageMap,
    status: "available",
    description: "Sample replay viewer is available for Mirage."
  },
  {
    id: "inferno",
    gameMapName: "de_inferno",
    name: "Inferno",
    image: null,
    status: "coming-soon",
    description: "Map support structure is ready. Image and calibration will be added next."
  },
  {
    id: "dust2",
    gameMapName: "de_dust2",
    name: "Dust II",
    image: null,
    status: "coming-soon",
    description: "Map support structure is ready. Image and calibration will be added next."
  },
  {
    id: "nuke",
    gameMapName: "de_nuke",
    name: "Nuke",
    image: null,
    status: "coming-soon",
    description: "Map support structure is ready. Image and calibration will be added next."
  },
  {
    id: "ancient",
    gameMapName: "de_ancient",
    name: "Ancient",
    image: null,
    status: "coming-soon",
    description: "Map support structure is ready. Image and calibration will be added next."
  },
  {
    id: "anubis",
    gameMapName: "de_anubis",
    name: "Anubis",
    image: null,
    status: "coming-soon",
    description: "Map support structure is ready. Image and calibration will be added next."
  },
  {
    id: "overpass",
    gameMapName: "de_overpass",
    name: "Overpass",
    image: null,
    status: "coming-soon",
    description: "Map support structure is ready. Image and calibration will be added next."
  },
  {
    id: "train",
    gameMapName: "de_train",
    name: "Train",
    image: null,
    status: "coming-soon",
    description: "Map support structure is ready. Image and calibration will be added next."
  }
];

export function getMapById(mapId) {
  return maps.find((map) => map.id === mapId) || maps[0];
}

export function getMapByGameName(gameMapName) {
  return maps.find((map) => map.gameMapName === gameMapName) || maps[0];
}