export type Package = {
  slug: string;
  destinationSlug: string;
  name: string;
  destination: string;
  country: string;
  duration: string;
  startingPrice: number;
  highlights: string[];
  image: string;
  summary: string;
  itinerary: { day: string; title: string; description: string }[];
  included: string[];
  featured?: boolean;
};

export const packages: Package[] = [
  {
    slug: "iceland-ring-road",
    destinationSlug: "iceland",
    name: "Iceland Ring Road",
    destination: "Iceland",
    country: "Iceland",
    duration: "8 days",
    startingPrice: 4290,
    highlights: ["Glacier lagoon kayak", "Golden Circle", "Local hot springs", "Coastal hikes"],
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1600&q=80",
    summary:
      "A complete lap of the Ring Road in a small group, with local guides, glacier lagoons, and nights in countryside stays away from the tour-bus crowds.",
    itinerary: [
      { day: "Day 1", title: "Reykjavík arrival", description: "Welcome dinner and orientation with your local guide." },
      { day: "Day 2", title: "Golden Circle", description: "Þingvellir, Geysir, Gullfoss — the classics, done well." },
      { day: "Day 3", title: "South Coast", description: "Seljalandsfoss, Skógafoss and the black sands of Vík." },
      { day: "Day 4", title: "Glacier lagoon", description: "Jökulsárlón boat trip among drifting icebergs." },
      { day: "Day 5", title: "East fjords", description: "Quiet fishing villages and dramatic coastal roads." },
      { day: "Day 6", title: "Lake Mývatn", description: "Geothermal landscapes and a soak in a natural pool." },
      { day: "Day 7", title: "North to Akureyri", description: "Waterfalls, whale watching and city charm." },
      { day: "Day 8", title: "Departure", description: "Morning transfer to Keflavík Airport." },
    ],
    included: [
      "7 nights handpicked accommodation",
      "Small-group transport & expert local guide",
      "Daily breakfast + 4 dinners",
      "Glacier lagoon boat excursion",
      "Natural hot spring entry",
    ],
    featured: true,
  },
  {
    slug: "peru-sacred-valley",
    destinationSlug: "peru",
    name: "Sacred Valley & Machu Picchu",
    destination: "Peru",
    country: "Peru",
    duration: "9 days",
    startingPrice: 3890,
    highlights: ["Machu Picchu sunrise", "Sacred Valley", "Cusco old town", "Andean family lunch"],
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Explore the Sacred Valley at a thoughtful pace, meet Andean communities, and reach Machu Picchu with a guide who makes the stones come alive.",
    itinerary: [
      { day: "Day 1", title: "Arrive in Cusco", description: "Altitude acclimatisation and a gentle first evening." },
      { day: "Day 2", title: "Cusco old town", description: "Qorikancha, Sacsayhuamán and cobbled streets." },
      { day: "Day 3", title: "Sacred Valley", description: "Pisac market and the terraces of Ollantaytambo." },
      { day: "Day 4", title: "Andean family day", description: "A slow day with a local community and shared lunch." },
      { day: "Day 5", title: "Rail to Aguas Calientes", description: "Scenic train through the gorge." },
      { day: "Day 6", title: "Machu Picchu", description: "Sunrise over the citadel with your private guide." },
      { day: "Day 7", title: "Return to Cusco", description: "Free day for markets or a cooking class." },
      { day: "Day 8", title: "Moray & Maras", description: "Inca terraces and the salt pans." },
      { day: "Day 9", title: "Departure", description: "Transfer to Cusco airport." },
    ],
    included: [
      "8 nights boutique hotels",
      "Machu Picchu entry + private guide",
      "Scenic Vistadome train",
      "Daily breakfast + 3 dinners",
      "Andean community visit",
    ],
    featured: true,
  },
  {
    slug: "japan-essence",
    destinationSlug: "japan",
    name: "Japan Essence",
    destination: "Japan",
    country: "Japan",
    duration: "11 days",
    startingPrice: 5490,
    highlights: ["Kyoto temples", "Tokyo & Mt Fuji", "Bullet train", "Traditional ryokan"],
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
    summary:
      "The essential Japan, balanced between electric cities and serene temples, with a ryokan night and a bullet-train glide between two worlds.",
    itinerary: [
      { day: "Day 1", title: "Tokyo arrival", description: "Settle in and an evening in Shinjuku." },
      { day: "Day 2", title: "Tokyo highlights", description: "Senso-ji, Shibuya, and hidden laneways." },
      { day: "Day 3", title: "Mt Fuji day", description: "Lake Kawaguchi and framed views of the peak." },
      { day: "Day 4", title: "Train to Kyoto", description: "Shinkansen over the Kansai plains." },
      { day: "Day 5", title: "Kyoto temples", description: "Fushimi Inari and Kiyomizu at quiet hours." },
      { day: "Day 6", title: "Arashiyama", description: "Bamboo grove and a riverside garden." },
      { day: "Day 7", title: "Nara day trip", description: "The Great Buddha and free-roaming deer." },
      { day: "Day 8", title: "Ryokan night", description: "An onsen stay with kaiseki dinner." },
      { day: "Day 9", title: "Osaka food walk", description: "Street food and spirited Dotonbori." },
      { day: "Day 10", title: "Hiroshima", description: "A moving visit to the Peace Park." },
      { day: "Day 11", title: "Departure", description: "Return to Tokyo and onward flight." },
    ],
    included: [
      "10 nights including ryokan",
      "JR Pass & reserved Shinkansen",
      "Private Kyoto guide",
      "Daily breakfast + 3 dinners",
      "Onsen entry & kimono experience",
    ],
    featured: true,
  },
  {
    slug: "morocco-sahara",
    destinationSlug: "morocco",
    name: "Morocco Unveiled",
    destination: "Morocco",
    country: "Morocco",
    duration: "9 days",
    startingPrice: 2890,
    highlights: ["Marrakech medina", "Sahara desert camp", "Atlas crossing", "Riad stays"],
    image: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1600&q=80",
    summary:
      "From the red city to the dunes of Erg Chebbi, through the Atlas Mountains and into the heart of Berber hospitality.",
    itinerary: [
      { day: "Day 1", title: "Marrakech arrival", description: "Riads, mint tea and an introduction to the medina." },
      { day: "Day 2", title: "Medina & souks", description: "Wander the lanes with your local guide." },
      { day: "Day 3", title: "Atlas crossing", description: "High passes and Berber villages." },
      { day: "Day 4", title: "Ouarzazate", description: "Kasbahs and the desert gateways." },
      { day: "Day 5", title: "Dades Valley", description: "Dramatic gorges and palm oases." },
      { day: "Day 6", title: "Erg Chebbi dunes", description: "Camel trek at dusk into the Sahara." },
      { day: "Day 7", title: "Desert camp", description: "Starlit night, drums and Berber tea." },
      { day: "Day 8", title: "Return to Marrakech", description: "A final evening in the medina." },
      { day: "Day 9", title: "Departure", description: "Transfer to Marrakech airport." },
    ],
    included: [
      "8 nights: riads + desert camp",
      "Camel trek & desert camp dinner",
      "Atlas crossing with driver-guide",
      "Daily breakfast + 5 dinners",
      "Medina walking tour",
    ],
  },
  {
    slug: "new-zealand-south-island",
    destinationSlug: "new-zealand",
    name: "South Island Loop",
    destination: "New Zealand",
    country: "New Zealand",
    duration: "14 days",
    startingPrice: 6290,
    highlights: ["Milford Sound", "Queenstown", "Glacier country", "Golden high country"],
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1600&q=80",
    summary:
      "A full lap of the South Island—glaciers, fiords and golden plains—with expert local drivers and stays that put the scenery on your doorstep.",
    itinerary: [
      { day: "Day 1", title: "Christchurch arrival", description: "Garden city welcome and orientation." },
      { day: "Day 2", title: "Kaikoura coast", description: "Whale watching and dramatic shoreline." },
      { day: "Day 3", title: "Marlborough", description: "Wine country and the Sounds." },
      { day: "Day 4", title: "Nelson & Abel Tasman", description: "Golden beaches and coastal tracks." },
      { day: "Day 5", title: "West Coast", description: "Pancake rocks and wild seas." },
      { day: "Day 6", title: "Fox Glacier", description: "Valley walks beneath the ice." },
      { day: "Day 7", title: "Wanaka", description: "Lake views and the lonely tree." },
      { day: "Day 8", title: "Queenstown", description: "Adventure capital, at your own pace." },
      { day: "Day 9", title: "Milford Sound", description: "A cruise through fiordland grandeur." },
      { day: "Day 10", title: "Te Anau & Doubtful", description: "The quieter fiord, wilderness cruise." },
      { day: "Day 11", title: "Dunedin", description: "Scottish heritage and Otago coast." },
      { day: "Day 12", title: "Aoraki / Mt Cook", description: "Night skies and alpine hikes." },
      { day: "Day 13", title: "Lake Tekapo", description: "Turquoise water and star observatory." },
      { day: "Day 14", title: "Return", description: "Drive back to Christchurch airport." },
    ],
    included: [
      "13 nights handpicked lodges",
      "Small-group coach with local driver",
      "Milford Sound cruise",
      "Daily breakfast + 6 dinners",
      "Stargazing night at Tekapo",
    ],
  },
  {
    slug: "portugal-light",
    destinationSlug: "portugal",
    name: "Portugal Light & Douro",
    destination: "Portugal",
    country: "Portugal",
    duration: "8 days",
    startingPrice: 3190,
    highlights: ["Lisbon", "Douro valley", "Atlantic coast", "Wine tastings"],
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Sun-warmed Lisbon, the terraced vine country of the Douro, and a slow stretch of Atlantic coastline—a gentle, golden introduction to Portugal.",
    itinerary: [
      { day: "Day 1", title: "Lisbon arrival", description: "Old town lights and a fado evening." },
      { day: "Day 2", title: "Lisbon districts", description: "Alfama, Belém and the tram-lined hills." },
      { day: "Day 3", title: "Sintra", description: "Fairytale palaces amid forested hills." },
      { day: "Day 4", title: "Coast road north", description: "Cascais, Óbidos and fishing towns." },
      { day: "Day 5", title: "Porto", description: "Riverside Ribeira and azulejo streets." },
      { day: "Day 6", title: "Douro Valley", description: "Terraced vines and a river cruise." },
      { day: "Day 7", title: "Wine estate", description: "Tastings and a slow countryside lunch." },
      { day: "Day 8", title: "Departure", description: "Transfer to Porto airport." },
    ],
    included: [
      "7 nights boutique hotels",
      "Sintra & Douro excursions",
      "River cruise & wine tastings",
      "Daily breakfast + 4 dinners",
      "Local guides in Lisbon & Porto",
    ],
  },
  {
    slug: "costa-rica-pura-vida",
    destinationSlug: "costa-rica",
    name: "Costa Rica Pura Vida",
    destination: "Costa Rica",
    country: "Costa Rica",
    duration: "10 days",
    startingPrice: 3490,
    highlights: ["Cloud forest", "Volcanoes", "Pacific coast", "Wildlife"],
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Misty cloud forests, steaming volcanoes and wild Pacific shores—a restorative journey through Costa Rica's richest landscapes.",
    itinerary: [
      { day: "Day 1", title: "San José arrival", description: "Settle into the capital's green hills." },
      { day: "Day 2", title: "Poás Volcano", description: "Cloud forest and a steaming crater." },
      { day: "Day 3", title: "Arenal", description: "Volcano views and evening hot springs." },
      { day: "Day 4", title: "Monteverde", description: "Trek the cloud forest canopy." },
      { day: "Day 5", title: "Hanging bridges", description: "Wildlife-spotting on forest trails." },
      { day: "Day 6", title: "Pacific coast", description: "Cross to the Guanacaste shore." },
      { day: "Day 7", title: "Beach days", description: "Surf, swim or simply unwind." },
      { day: "Day 8", title: "Turtle project", description: "A morning with local conservationists." },
      { day: "Day 9", title: "Sunset catamaran", description: "Sail the coast with dinner aboard." },
      { day: "Day 10", title: "Departure", description: "Transfer to Liberia airport." },
    ],
    included: [
      "9 nights eco-lodges & beach stay",
      "All transfers with local drivers",
      "Cloud forest & volcano entries",
      "Daily breakfast + 5 dinners",
      "Turtle conservation morning",
    ],
  },
  {
    slug: "greece-aegean",
    destinationSlug: "greece",
    name: "Aegean Island Sail",
    destination: "Greece",
    country: "Greece",
    duration: "10 days",
    startingPrice: 3890,
    highlights: ["Aegean sailing", "Santorini", "Island villages", "Ancient heritage"],
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Sail the Aegean between whitewashed islands, linger in harbour villages, and watch the sun set over the caldera from the water.",
    itinerary: [
      { day: "Day 1", title: "Athens arrival", description: "Acropolis views and a rooftop dinner." },
      { day: "Day 2", title: "Athens ancient city", description: "The Acropolis, Plaka and Monastiraki." },
      { day: "Day 3", title: "Ferry to the islands", description: "Cross to the Cyclades." },
      { day: "Day 4", title: "Island villages", description: "White walls, blue domes and slow mornings." },
      { day: "Day 5", title: "Sail day", description: "A day aboard a traditional boat." },
      { day: "Day 6", title: "Swim stops", description: "Secluded coves and clear water." },
      { day: "Day 7", title: "Santorini", description: "Caldera-edge walking at golden hour." },
      { day: "Day 8", title: "Oia sunset", description: "The classic view, from the best cliff." },
      { day: "Day 9", title: "Sailing return", description: "One last swim and a farewell dinner." },
      { day: "Day 10", title: "Departure", description: "Flight from Santorini." },
    ],
    included: [
      "9 nights hotels + boat nights",
      "Aegean sailing day with crew",
      "Ferry & inter-island transport",
      "Daily breakfast + 4 dinners",
      "Santorini caldera guide",
    ],
  },
];

export function getPackageBySlug(slug: string) {
  return packages.find((p) => p.slug === slug);
}

export function getPackagesByDestination(destinationSlug: string) {
  return packages.filter((p) => p.destinationSlug === destinationSlug);
}
