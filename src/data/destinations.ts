export type Destination = {
  slug: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  region: string;
  bestTime: string;
  highlights: string[];
  stats: { label: string; value: string }[];
  featured?: boolean;
};

export const destinations: Destination[] = [
  {
    slug: "iceland",
    name: "Iceland",
    country: "Iceland",
    tagline: "Chasing waterfalls under the midnight sun",
    description:
      "A land shaped by fire and ice, where thundering waterfalls, black-sand beaches and moss-draped lava fields unfold along the Ring Road. Explorers Choice pairs you with local guides who know the quieter corners—glacial lagoons at golden hour, hot springs away from the crowds.",
    image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1600&q=80",
    region: "Nordic",
    bestTime: "June – August",
    highlights: ["Glacier lagoons", "Golden Circle", "Local hot springs", "Ring Road drive"],
    stats: [
      { label: "Duration", value: "6–9 days" },
      { label: "Group", value: "Max 12" },
      { label: "Season", value: "Summer" },
    ],
    featured: true,
  },
  {
    slug: "peru",
    name: "Peru",
    country: "Peru",
    tagline: "From Sacred Valley to the heights of Machu Picchu",
    description:
      "Journey through the Sacred Valley with thoughtful pacing and small-group travel. Walk ancient Inca trails, share meals with Andean families, and arrive at Machu Picchu the way it deserves—slowly and with purpose.",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80",
    region: "South America",
    bestTime: "May – September",
    highlights: ["Machu Picchu", "Sacred Valley", "Cusco", "Andean family stays"],
    stats: [
      { label: "Duration", value: "8–12 days" },
      { label: "Group", value: "Max 10" },
      { label: "Season", value: "Dry season" },
    ],
    featured: true,
  },
  {
    slug: "japan",
    name: "Japan",
    country: "Japan",
    tagline: "Old Kyoto, neon Tokyo and everything between",
    description:
      "A carefully paced introduction to Japan: temple mornings in Kyoto, the electric hum of Tokyo, a bullet-train glide between worlds, and quiet stays in ryokan where the pace finally slows.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
    region: "Asia",
    bestTime: "March – May / Oct – Nov",
    highlights: ["Kyoto temples", "Tokyo districts", "Bullet train", "Ryokan stay"],
    stats: [
      { label: "Duration", value: "9–14 days" },
      { label: "Group", value: "Max 12" },
      { label: "Season", value: "Spring / Autumn" },
    ],
    featured: true,
  },
  {
    slug: "morocco",
    name: "Morocco",
    country: "Morocco",
    tagline: "Medinas, mountains and the Saharan edge",
    description:
      "From the spice-scented lanes of Marrakech to the silence of the Sahara, Morocco rewards the curious traveller. Wander riads, ride camels into the dunes at dusk, and sleep under a canopy of stars.",
    image: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1600&q=80",
    region: "North Africa",
    bestTime: "March – May / Sep – Nov",
    highlights: ["Marrakech medina", "Sahara camp", "Atlas mountains", "Riad stays"],
    stats: [
      { label: "Duration", value: "7–10 days" },
      { label: "Group", value: "Max 14" },
      { label: "Season", value: "Spring / Autumn" },
    ],
    featured: true,
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    country: "New Zealand",
    tagline: "Milford Sound, fjords and the South Island loop",
    description:
      "A road trip through a landscape that feels invented—emerald lakes, glacier-carved fiords and golden high country. Small group, great drivers, and plenty of room to simply stop and stare.",
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1600&q=80",
    region: "Oceania",
    bestTime: "November – March",
    highlights: ["Milford Sound", "Queenstown", "Glacier country", "South Island loop"],
    stats: [
      { label: "Duration", value: "12–18 days" },
      { label: "Group", value: "Max 12" },
      { label: "Season", value: "Summer" },
    ],
  },
  {
    slug: "portugal",
    name: "Portugal",
    country: "Portugal",
    tagline: "Lisbon light, Douro valleys and Atlantic coast",
    description:
      "Pastel-hued Lisbon, sun-bleached coastlines, and the terraced vineyards of the Douro. A relaxed journey through a country that moves at the perfect pace for slow travellers.",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
    region: "Europe",
    bestTime: "May – June / September",
    highlights: ["Lisbon", "Douro valley", "Atlantic coast", "Wine country"],
    stats: [
      { label: "Duration", value: "7–10 days" },
      { label: "Group", value: "Max 14" },
      { label: "Season", value: "Spring / Autumn" },
    ],
  },
  {
    slug: "costa-rica",
    name: "Costa Rica",
    country: "Costa Rica",
    tagline: "Cloud forests, volcanoes and wild Pacific shores",
    description:
      "Pura vida in practice—misty cloud forests alive with wildlife, rumbling volcanoes, and long stretches of Pacific coast. A restorative journey for nature lovers.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    region: "Central America",
    bestTime: "December – April",
    highlights: ["Cloud forest", "Volcanoes", "Pacific coast", "Wildlife"],
    stats: [
      { label: "Duration", value: "8–12 days" },
      { label: "Group", value: "Max 12" },
      { label: "Season", value: "Dry season" },
    ],
  },
  {
    slug: "greece",
    name: "Greece",
    country: "Greece",
    tagline: "Aegean islands, white walls and endless blue",
    description:
      "Sail between islands catching the light just right, linger in villages untouched by time, and let the Aegean set the rhythm. Timeless, unhurried, deeply human.",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
    region: "Europe",
    bestTime: "May – October",
    highlights: ["Aegean sailing", "Island villages", "Santorini", "Ancient heritage"],
    stats: [
      { label: "Duration", value: "8–12 days" },
      { label: "Group", value: "Max 14" },
      { label: "Season", value: "Summer" },
    ],
  },
];

export function getDestinationBySlug(slug: string) {
  return destinations.find((d) => d.slug === slug);
}
