export const DISTRICTS = [
  { id: "weho", name: "West Hollywood", emoji: "🌴", desc: "Restaurants, nightlife", lat: 34.09, lng: -118.3617 },
  { id: "hollywood", name: "Hollywood", emoji: "⭐", desc: "Bars, hiking, concerts", lat: 34.0928, lng: -118.3287 },
  { id: "glendale", name: "Glendale", emoji: "🏔️", desc: "Family spots, food", lat: 34.1425, lng: -118.2551 },
  { id: "dtla", name: "Downtown LA", emoji: "🏙️", desc: "Coffee, books, lofts", lat: 34.0407, lng: -118.2468 },
  { id: "valley", name: "Studio City / Valley", emoji: "🎬", desc: "Speakeasy bars", lat: 34.1486, lng: -118.3965 },
  { id: "silverlake", name: "Silver Lake / Los Feliz", emoji: "🎨", desc: "Indie, observatory", lat: 34.0869, lng: -118.2702 },
  { id: "westside", name: "Santa Monica / Venice", emoji: "🏖️", desc: "Beach, canals", lat: 34.0195, lng: -118.4912 },
  { id: "southbay", name: "South Bay / Beach", emoji: "🌊", desc: "Manhattan Beach, Hermosa Beach, Redondo Beach, Long Beach", lat: 33.8622, lng: -118.3995 },
  { id: "pasadena", name: "Pasadena", emoji: "🌸", desc: "Nature, trails", lat: 34.1478, lng: -118.1445 },
  { id: "midcity", name: "Mid-City / Melrose", emoji: "🛍️", desc: "Shopping, cafes", lat: 34.0771, lng: -118.3442 },
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
