export type Hotel = {
  slug: string;
  name: string;
  location: string;
  destination: string;
  tagline: string;
  description: string;
  image: string;
  rating: number;
  pricePerNight: number;
  currency?: string; // BUG-14: carry currency through the type
  amenities: string[];
  highlights: string[];
  featured?: boolean;
};

export const hotels: Hotel[] = [
  {
    slug: "taj-lake-palace-udaipur",
    name: "Taj Lake Palace",
    location: "Udaipur, Rajasthan",
    destination: "Rajasthan",
    tagline: "A floating marble palace on Lake Pichola",
    description:
      "Set on a 4-acre island in Lake Pichola, the Taj Lake Palace is a breathtaking 18th-century marble palace. With intricate carved jharokhas, lush courtyards and panoramic lake views, it offers an unforgettable royal experience.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    rating: 4.8,
    pricePerNight: 28500,
    amenities: ["Lake-view rooms", "Spa & wellness", "Fine dining", "Heritage walks", "Boat transfers"],
    highlights: ["Floating island location", "Royal Rajasthani decor", "Sunset boat rides", "Jiva Spa"],
    featured: true,
  },
  {
    slug: "kumarakom-lake-resort-kerala",
    name: "Kumarakom Lake Resort",
    location: "Kumarakom, Kerala",
    destination: "Kerala",
    tagline: "Kerala backwater luxury amid coconut groves",
    description:
      "Nestled on the banks of Lake Vembanad, this resort blends traditional Kerala architecture with modern luxury. Wake to the sound of kingfishers, cruise the backwaters on a private houseboat and indulge in authentic Ayurvedic therapies.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
    rating: 4.7,
    pricePerNight: 18000,
    amenities: ["Backwater views", "Ayurvedic spa", "Infinity pool", "Houseboat cruise", "Yoga sessions"],
    highlights: ["Private backwater access", "Traditional Kerala architecture", "Authentic Ayurveda", "Bird-watching tours"],
    featured: true,
  },
  {
    slug: "oberoi-udaivilas-udaipur",
    name: "The Oberoi Udaivilas",
    location: "Udaipur, Rajasthan",
    destination: "Rajasthan",
    tagline: "Where Mughal grandeur meets modern opulence",
    description:
      "Spread across 50 acres on the banks of Lake Pichola, The Oberoi Udaivilas features domed pavilions, sweeping courtyards and sunlit corridors. Every room offers stunning views of the Aravalli hills or the lake.",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
    rating: 4.9,
    pricePerNight: 42000,
    amenities: ["Lake-facing suites", "Temperature-controlled pool", "Oberoi Spa", "Cultural performances", "Private dining"],
    highlights: ["Architectural masterpiece", "Personal Oberoi concierge", "Sunset cocktails by the lake", "Rajasthani folk evenings"],
    featured: true,
  },
  {
    slug: "wildflower-hall-manali",
    name: "Wildflower Hall",
    location: "Manali, Himachal Pradesh",
    destination: "Himachal Pradesh",
    tagline: "A Himalayan retreat above the clouds",
    description:
      "Perched at 8,250 ft amid cedar forests and snow-capped peaks, Wildflower Hall offers an enchanting escape. With panoramic mountain views, an award-winning spa and adventure activities, it's the ultimate Himalayan luxury resort.",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80",
    rating: 4.8,
    pricePerNight: 32000,
    amenities: ["Mountain-view rooms", "Heated indoor pool", "Spa & fitness", "Mountain biking", "Nature walks"],
    highlights: ["8,250 ft altitude", "Cedar forest setting", "Adventure activities", "Star-gazing evenings"],
  },
  {
    slug: "taj-fort-aguada-goa",
    name: "Taj Fort Aguada",
    location: "Sinquerim, Goa",
    destination: "Goa",
    tagline: "A Portuguese-era fort turned beachside luxury resort",
    description:
      "Built within the ramparts of a 16th-century Portuguese fortress overlooking the Arabian Sea, Taj Fort Aguada combines colonial heritage with beachside luxury. Lush gardens, private beach access and world-class dining await.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    rating: 4.6,
    pricePerNight: 15000,
    amenities: ["Beachfront", "Heritage wings", "Jiva Spa", "Water sports", "Multiple restaurants"],
    highlights: ["16th-century fort setting", "Private beach access", "Portuguese architecture", "Sunset bar by the sea"],
  },
  {
    slug: "zostel-manali",
    name: "The Hosteller Manali",
    location: "Old Manali, Himachal Pradesh",
    destination: "Himachal Pradesh",
    tagline: "Budget-friendly mountain stays with stunning valley views",
    description:
      "Nestled in the heart of Old Manali with breathtaking views of the Beas River valley, this charming boutique stay offers cozy rooms, a rooftop cafe, and easy access to trails and cafes. Perfect for solo travellers and couples.",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1600&q=80",
    rating: 4.3,
    pricePerNight: 3500,
    amenities: ["Valley-view rooms", "Rooftop cafe", "Free Wi-Fi", "Lounge area", "Trekking helpdesk"],
    highlights: ["Old Manali location", "Budget luxury", "River valley views", "Walking distance to cafes"],
  },
  {
    slug: "coconut-lagoon-kerala",
    name: "Coconut Lagoon",
    location: "Kumarakom, Kerala",
    destination: "Kerala",
    tagline: "A heritage retreat accessible only by boat",
    description:
      "Tucked away on a peaceful island in the Vembanad backwaters, Coconut Lagoon is reachable only by country boat. With traditional Kerala tharavads, a butterfly garden and Ayurvedic centre, it's an eco-paradise.",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1600&q=80",
    rating: 4.5,
    pricePerNight: 12000,
    amenities: ["Backwater access", "Ayurvedic centre", "Butterfly garden", "Country boat transfers", "Organic kitchen"],
    highlights: ["Island-only access", "Heritage Kerala tharavads", "Eco-friendly resort", "Kayaking & canoeing"],
  },
  {
    slug: "rambagh-palace-jaipur",
    name: "Rambagh Palace",
    location: "Jaipur, Rajasthan",
    destination: "Rajasthan",
    tagline: "The former residence of the Maharaja of Jaipur",
    description:
      "Once the home of the Maharaja of Jaipur, Rambagh Palace is a living heritage property set in 47 acres of manicured gardens. With peacocks roaming the grounds and exquisite Art Deco interiors, it epitomises royal Rajasthani hospitality.",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
    rating: 4.7,
    pricePerNight: 35000,
    amenities: ["Palace suites", "Heritage walks", "Spa & salon", "Golf course", "Royal dining"],
    highlights: ["Former royal residence", "47-acre gardens", "Peacock-spotting", "Art Deco interiors"],
    featured: true,
  },
];

export function getHotelBySlug(slug: string) {
  return hotels.find((h) => h.slug === slug);
}

export function getHotelsByDestination(destination: string) {
  return hotels.filter((h) => h.destination === destination);
}
