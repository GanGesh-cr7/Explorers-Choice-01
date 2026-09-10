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
    slug: "royal-rajasthan",
    destinationSlug: "rajasthan",
    name: "Royal Rajasthan",
    destination: "Rajasthan",
    country: "India",
    duration: "9 days",
    startingPrice: 54999,
    highlights: ["Amber Fort elephant ride", "Thar Desert camel safari", "Udaipur boat ride", "Jodhpur blue city walk"],
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Journey through the land of maharajas — from Jaipur's pink palaces to Jodhpur's blue lanes and Udaipur's lakefront romance, with a night under the desert stars.",
    itinerary: [
      { day: "Day 1", title: "Jaipur arrival", description: "Welcome dinner and a stroll through the old city bazaars." },
      { day: "Day 2", title: "Jaipur exploration", description: "Amber Fort, City Palace, Hawa Mahal and Jantar Mantar." },
      { day: "Day 3", title: "Pushkar", description: "Sacred lake, Brahma temple and the fragrant rose gardens." },
      { day: "Day 4", title: "Jodhpur", description: "Blue city walking tour and the towering Mehrangarh Fort." },
      { day: "Day 5", title: "Thar Desert", description: "Camel safari into the dunes and a sunset camp dinner." },
      { day: "Day 6", title: "Desert sunrise", description: "Morning in the dunes and drive to Udaipur." },
      { day: "Day 7", title: "Udaipur", description: "City Palace, Jagdish Temple and a sunset boat ride on Lake Pichola." },
      { day: "Day 8", title: "Udaipur lakes", description: "Saheliyon ki Bari gardens and a rooftop dinner overlooking the lake." },
      { day: "Day 9", title: "Departure", description: "Transfer to Udaipur airport." },
    ],
    included: [
      "8 nights heritage hotels & desert camp",
      "Private air-conditioned vehicle",
      "Expert local guide throughout",
      "Daily breakfast + 4 dinners",
      "Camel safari & boat ride",
    ],
    featured: true,
  },
  {
    slug: "kerala-backwaters",
    destinationSlug: "kerala",
    name: "Kerala Backwater Escape",
    destination: "Kerala",
    country: "India",
    duration: "7 days",
    startingPrice: 39999,
    highlights: ["Alleppey houseboat", "Munnar tea plantation trek", "Kovalam beach", "Ayurvedic massage"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Drift through Kerala's emerald backwaters on a traditional houseboat, trek the misty tea gardens of Munnar, and unwind with Ayurveda on the Malabar coast.",
    itinerary: [
      { day: "Day 1", title: "Cochin arrival", description: "Explore Fort Kochi's Chinese fishing nets and spice markets." },
      { day: "Day 2", title: "Munnar", description: "Drive through spice plantations to the hill station of Munnar." },
      { day: "Day 3", title: "Tea country", description: "Trek through tea estates and visit the Tea Museum." },
      { day: "Day 4", title: "Alleppey houseboat", description: "Board your private houseboat and glide through the backwaters." },
      { day: "Day 5", title: "Backwater cruise", description: "Wake to village life along the canals and enjoy freshly cooked Kerala lunch." },
      { day: "Day 6", title: "Kovalam", description: "Relax on the golden sands and enjoy an Ayurvedic spa treatment." },
      { day: "Day 7", title: "Departure", description: "Transfer to Trivandrum airport." },
    ],
    included: [
      "6 nights: hill resort, houseboat & beach hotel",
      "Private houseboat with crew",
      "All transfers with driver-guide",
      "Daily breakfast + 3 lunches",
      "Ayurvedic massage session",
    ],
    featured: true,
  },
  {
    slug: "spiritual-varanasi",
    destinationSlug: "varanasi",
    name: "Spiritual Varanasi",
    destination: "Varanasi",
    country: "India",
    duration: "4 days",
    startingPrice: 21999,
    highlights: ["Ganga Aarti ceremony", "Dawn boat ride", "Old city lanes", "Sarnath Buddhist site"],
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Experience the soul of India on the banks of the Ganges — witness the mesmerising Ganga Aarti, explore ancient ghats at dawn, and discover the birthplace of Buddhism at Sarnath.",
    itinerary: [
      { day: "Day 1", title: "Arrival in Varanasi", description: "Settle in and witness the evening Ganga Aarti at Dashashwamedh Ghat." },
      { day: "Day 2", title: "Sunrise on the Ganges", description: "Pre-dawn boat ride past the ghats, then explore the old city's winding lanes." },
      { day: "Day 3", title: "Sarnath excursion", description: "Visit the Dhamek Stupa and the place where Buddha gave his first sermon." },
      { day: "Day 4", title: "Departure", description: "Morning walk along the ghats and transfer to the airport." },
    ],
    included: [
      "3 nights boutique hotel on the ghats",
      "Private boat rides (dawn & sunset)",
      "Expert local guide",
      "Daily breakfast + 2 dinners",
      "Sarnath excursion with guide",
    ],
    featured: true,
  },
  {
    slug: "ladakh-adventure",
    destinationSlug: "ladakh",
    name: "Ladakh High Passes",
    destination: "Ladakh",
    country: "India",
    duration: "10 days",
    startingPrice: 62999,
    highlights: ["Pangong Lake camping", "Nubra Valley", "Khardung La", "Leh Palace"],
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Conquer the world's highest motorable passes, camp beside the luminous Pangong Lake, and explore ancient monasteries perched on the roof of the world.",
    itinerary: [
      { day: "Day 1", title: "Leh arrival", description: "Acclimatise in the mountain capital and visit Leh Palace." },
      { day: "Day 2", title: "Leh exploration", description: "Shanti Stupa, Leh market and local monastery visits." },
      { day: "Day 3", title: "Khardung La", description: "Drive to the world's highest motorable pass and return." },
      { day: "Day 4", title: "Nubra Valley", description: "Cross Khardug La to the double-humped camel valley." },
      { day: "Day 5", title: "Nubra monasteries", description: "Visit Diskit and Hunder monasteries and sand dunes." },
      { day: "Day 6", title: "Pangong Lake", description: "Drive to the stunning blue lake on the Indo-China border." },
      { day: "Day 7", title: "Pangong sunrise", description: "Wake to the changing colours of the lake and drive back to Leh." },
      { day: "Day 8", title: "Hemis & Thiksey", description: "Visit two of Ladakh's most beautiful monasteries." },
      { day: "Day 9", title: "Sham Valley", description: "A gentle drive through villages and apricot orchards." },
      { day: "Day 10", title: "Departure", description: "Transfer to Leh airport." },
    ],
    included: [
      "9 nights hotels, guesthouses & lakeside camp",
      "All inner-line permits arranged",
      "Experienced mountain driver",
      "Daily breakfast + 5 dinners",
      "Camel ride in Nubra Valley",
    ],
  },
  {
    slug: "goa-beach-holiday",
    destinationSlug: "goa",
    name: "Goa Beach & Culture",
    destination: "Goa",
    country: "India",
    duration: "5 days",
    startingPrice: 24999,
    highlights: ["Old Goa churches", "Palolem beach", "Spice plantation", "Fontainhas heritage walk"],
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Sun, spice and soul — explore Portuguese-era churches, laoze on golden beaches, and wander through the colourful Latin Quarter of Fontainhas.",
    itinerary: [
      { day: "Day 1", title: "Arrival in Goa", description: "Transfer to your beachside hotel and sunset at the shore." },
      { day: "Day 2", title: "Old Goa", description: "Basilica of Bom Jesus, Se Cathedral and the Portuguese quarter." },
      { day: "Day 3", title: "Spice plantation", description: "Tour a working spice farm and enjoy a traditional Goan lunch." },
      { day: "Day 4", title: "Beach day & Fontainhas", description: "Morning at Palolem, afternoon in the Latin Quarter of Panaji." },
      { day: "Day 5", title: "Departure", description: "Leisurely breakfast and transfer to the airport." },
    ],
    included: [
      "4 nights beach resort",
      "Airport transfers",
      "Old Goa guided tour",
      "Daily breakfast + 2 dinners",
      "Spice plantation visit with lunch",
    ],
  },
  {
    slug: "himachal-mountains",
    destinationSlug: "himachal-pradesh",
    name: "Himachal Mountain Trail",
    destination: "Himachal Pradesh",
    country: "India",
    duration: "8 days",
    startingPrice: 44999,
    highlights: ["Manali paragliding", "Shimla heritage walk", "Spiti valley drive", "Rohtang Pass views"],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    summary:
      "From the colonial charm of Shimla to the raw beauty of the Spiti Valley, this mountain trail combines adventure, heritage and the tranquillity of Himalayan villages.",
    itinerary: [
      { day: "Day 1", title: "Shimla arrival", description: "Heritage walk through the Mall Road and Christ Church." },
      { day: "Day 2", title: "Kufri & Chail", description: "Mountain views and the quiet royal estate of Chail." },
      { day: "Day 3", title: "Drive to Manali", description: "Scenic drive through pine forests and river valleys." },
      { day: "Day 4", title: "Manali adventure", description: "Solang Valley, Hadimba Temple and Old Manali cafes." },
      { day: "Day 5", title: "Rohtang Pass", description: "Snow-capped views and high-altitude landscapes." },
      { day: "Day 6", title: "Kasol & Parvati", description: "Drive to the Israeli-influenced town of Kasol by the Parvati River." },
      { day: "Day 7", title: "Trek & village", description: "A gentle Himalayan trek through pine forests and apple orchards." },
      { day: "Day 8", title: "Departure", description: "Drive to Chandigarh or Manali airport." },
    ],
    included: [
      "7 nights mountain hotels & guesthouses",
      "Private vehicle for all transfers",
      "Local guide in Shimla & Manali",
      "Daily breakfast + 3 dinners",
      "Rohtang Pass permit arranged",
    ],
  },
  {
    slug: "andaman-island-retreat",
    destinationSlug: "andaman-islands",
    name: "Andaman Island Retreat",
    destination: "Andaman Islands",
    country: "India",
    duration: "6 days",
    startingPrice: 47999,
    highlights: ["Radhanagar Beach", "Scuba diving at Havelock", "Cellular Jail light show", "Sea turtle snorkelling"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Escape to India's tropical paradise — snorkel with sea turtles, dive vibrant coral reefs, and unwind on white-sand beaches that rival the Maldives.",
    itinerary: [
      { day: "Day 1", title: "Port Blair", description: "Arrive and visit the historic Cellular Jail, evening light show." },
      { day: "Day 2", title: "Havelock ferry", description: "Speed boat to Havelock and relax at Radhanagar Beach." },
      { day: "Day 3", title: "Scuba diving", description: "Discover the underwater world with a beginner-friendly dive." },
      { day: "Day 4", title: "Snorkelling", description: "Snorkel at Elephant Beach and spot sea turtles." },
      { day: "Day 5", title: "Island hopping", description: "Visit Neil Island and its pristine Bharatpur Beach." },
      { day: "Day 6", title: "Departure", description: "Ferry back to Port Blair and fly out." },
    ],
    included: [
      "5 nights beach resorts on Port Blair & Havelock",
      "Inter-island ferry tickets",
      "Airport & jetty transfers",
      "Daily breakfast + 2 dinners",
      "Scuba diving session with instructor",
    ],
  },
  {
    slug: "taj-mahal-golden-triangle",
    destinationSlug: "taj-mahal-agra",
    name: "Golden Triangle & Taj Mahal",
    destination: "Agra & Taj Mahal",
    country: "India",
    duration: "5 days",
    startingPrice: 29999,
    highlights: ["Taj Mahal sunrise", "Agra Fort", "Fatehpur Sikri", "Delhi old city walk"],
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80",
    summary:
      "Witness the world's most famous monument to love at sunrise, explore Mughal forts and the ghost city of Fatehpur Sikri on India's most iconic travel circuit.",
    itinerary: [
      { day: "Day 1", title: "Delhi arrival", description: "Explore Old Delhi — Jama Masjid, Chandni Chowk and the Red Fort." },
      { day: "Day 2", title: "New Delhi", description: "Humayun's Tomb, Qutub Minar and Lutyens' Delhi drive." },
      { day: "Day 3", title: "Drive to Agra", description: "Morning drive, afternoon at Agra Fort and marble inlay workshop." },
      { day: "Day 4", title: "Taj Mahal sunrise", description: "Watch the Taj glow at dawn, then visit Fatehpur Sikri." },
      { day: "Day 5", title: "Departure", description: "Transfer to Agra airport or train to Delhi." },
    ],
    included: [
      "4 nights heritage hotels",
      "Private air-conditioned car",
      "Expert monument guide",
      "Daily breakfast + 2 dinners",
      "Taj Mahal sunrise entry tickets",
    ],
  },
];

export function getPackageBySlug(slug: string) {
  return packages.find((p) => p.slug === slug);
}

export function getPackagesByDestination(destinationSlug: string) {
  return packages.filter((p) => p.destinationSlug === destinationSlug);
}
