export const DISTRICTS = [
  {
    id: "downtown",
    name: "Downtown LA",
    emoji: "🏙️",
    desc: "DTLA, Arts District, Little Tokyo, Chinatown",
    lat: 34.0407, lng: -118.2468,
  },
  {
    id: "echo-park",
    name: "Echo Park / Silver Lake",
    emoji: "🎨",
    desc: "Silver Lake, Echo Park, Los Feliz, Filipinotown",
    lat: 34.0780, lng: -118.2600,
  },
  {
    id: "koreatown",
    name: "Koreatown / Wilshire",
    emoji: "🍜",
    desc: "Koreatown, Mid-Wilshire, Miracle Mile, Hancock Park",
    lat: 34.0600, lng: -118.3010,
  },
  {
    id: "hollywood-weho",
    name: "Hollywood / WeHo",
    emoji: "⭐",
    desc: "Hollywood, Thai Town, West Hollywood, Beverly Hills",
    lat: 34.0928, lng: -118.3500,
  },
  {
    id: "westside",
    name: "Westside",
    emoji: "🏖️",
    desc: "Santa Monica, Venice, Culver City, Sawtelle, Westwood",
    lat: 34.0195, lng: -118.4912,
  },
  {
    id: "studio-noho",
    name: "Studio City / Burbank / NoHo",
    emoji: "🎬",
    desc: "Studio City, Burbank, North Hollywood, Toluca Lake",
    lat: 34.1650, lng: -118.3750,
  },
  {
    id: "sfv",
    name: "San Fernando Valley",
    emoji: "🌇",
    desc: "Sherman Oaks, Van Nuys, Encino, Woodland Hills, Reseda",
    lat: 34.1750, lng: -118.4487,
  },
  {
    id: "glendale-pasadena",
    name: "Glendale / Pasadena",
    emoji: "🏔️",
    desc: "Glendale, Pasadena, South Pasadena, Montrose, La Crescenta",
    lat: 34.1478, lng: -118.2000,
  },
  {
    id: "south-bay",
    name: "South Bay / LAX",
    emoji: "✈️",
    desc: "Manhattan Beach, Hermosa Beach, Redondo Beach, Torrance",
    lat: 33.8622, lng: -118.3995,
  },
  {
    id: "east-la-sgv",
    name: "East LA / San Gabriel Valley",
    emoji: "🌮",
    desc: "East LA, Highland Park, Eagle Rock, Alhambra, Monterey Park",
    lat: 34.0520, lng: -118.1700,
  },
  {
    id: "south-la",
    name: "South LA",
    emoji: "🏟️",
    desc: "Inglewood, Crenshaw, USC area, Baldwin Hills, Carson, San Pedro",
    lat: 33.9500, lng: -118.3000,
  },
  {
    id: "long-beach",
    name: "Long Beach",
    emoji: "🚢",
    desc: "Downtown LB, Belmont Shore, Signal Hill, Naples, Bixby Knolls",
    lat: 33.7701, lng: -118.1937,
  },
];

export const PLACE_CATS = [
  { id: "restaurants", icon: "🍽️", title: "Еда", color: "#E74C3C" },
  { id: "bars", icon: "🍸", title: "Бары", color: "#8E44AD" },
  { id: "coffee", icon: "☕", title: "Кофе", color: "#F47B20" },
  { id: "hiking", icon: "🥾", title: "Хайкинг", color: "#27AE60" },
  { id: "interesting", icon: "✨", title: "Интересно", color: "#2980B9" },
  { id: "music", icon: "🎵", title: "Музыка", color: "#E91E8C" },
];

export const PLACE_CAT_IDS = new Set(PLACE_CATS.map((c) => c.id));

export function getDistrictById(id) {
  return DISTRICTS.find((d) => d.id === String(id || "").toLowerCase().trim()) || null;
}

export function getPlaceCatById(id) {
  return PLACE_CATS.find((c) => c.id === String(id || "").toLowerCase().trim()) || null;
}
