"""Seed the database with realistic demo destinations, packages and itineraries.

Demo content only — replace or extend with real product data via the admin API.
Safe to re-run: it skips items whose slug already exists.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal, Base, engine
from app.models import Destination, Package, ItineraryDay, PackageFaq

# ---------------------------------------------------------------------------
# Demo destinations
# ---------------------------------------------------------------------------
DESTINATIONS = [
    {
        "name": "Iceland",
        "slug": "iceland",
        "country": "Iceland",
        "region": "Nordic",
        "short_description": "Chasing waterfalls under the midnight sun",
        "description": (
            "A land shaped by fire and ice, where thundering waterfalls, black-sand beaches "
            "and moss-draped lava fields unfold along the Ring Road. Explorers Choice pairs "
            "you with local guides who know the quieter corners—glacial lagoons at golden "
            "hour, hot springs away from the crowds."
        ),
        "hero_image": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "June – August",
        "recommended_duration": "6–9 days",
        "highlights": ["Glacier lagoons", "Golden Circle", "Local hot springs", "Ring Road drive"],
        "things_to_do": [
            "Boat among icebergs at Jökulsárlón glacier lagoon",
            "Hike behind Seljalandsfoss waterfall",
            "Soak in a natural geothermal pool",
            "Spot puffins on the south coast",
        ],
        "travel_information": [
            "Currency: Icelandic króna (ISK)",
            "Language: Icelandic (English widely spoken)",
            "Visa: Schengen area rules apply",
        ],
        "is_featured": True,
    },
    {
        "name": "Peru",
        "slug": "peru",
        "country": "Peru",
        "region": "South America",
        "short_description": "From Sacred Valley to the heights of Machu Picchu",
        "description": (
            "Journey through the Sacred Valley with thoughtful pacing and small-group travel. "
            "Walk ancient Inca trails, share meals with Andean families, and arrive at Machu "
            "Picchu the way it deserves—slowly and with purpose."
        ),
        "hero_image": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "May – September",
        "recommended_duration": "8–12 days",
        "highlights": ["Machu Picchu", "Sacred Valley", "Cusco", "Andean family stays"],
        "things_to_do": [
            "Watch sunrise over Machu Picchu",
            "Wander the Pisac market",
            "Share an Andean family lunch",
            "Walk the terraces of Ollantaytambo",
        ],
        "travel_information": [
            "Currency: Sol (PEN)",
            "Language: Spanish & Quechua",
            "Altitude: Cusco sits at 3,400m — allow time to acclimatise",
        ],
        "is_featured": True,
    },
    {
        "name": "Japan",
        "slug": "japan",
        "country": "Japan",
        "region": "Asia",
        "short_description": "Old Kyoto, neon Tokyo and everything between",
        "description": (
            "A carefully paced introduction to Japan: temple mornings in Kyoto, the electric "
            "hum of Tokyo, a bullet-train glide between worlds, and quiet stays in ryokan "
            "where the pace finally slows."
        ),
        "hero_image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "March – May / Oct – Nov",
        "recommended_duration": "9–14 days",
        "highlights": ["Kyoto temples", "Tokyo districts", "Bullet train", "Ryokan stay"],
        "things_to_do": [
            "Walk Fushimi Inari at quiet hours",
            "Dip in a ryokan onsen",
            "Explore the neon lanes of Shibuya",
            "Ride the Shinkansen at sunrise",
        ],
        "travel_information": [
            "Currency: Japanese yen (JPY)",
            "Language: Japanese",
            "Visa: Most nationalities get 90 days visa-free",
        ],
        "is_featured": True,
    },
    {
        "name": "Morocco",
        "slug": "morocco",
        "country": "Morocco",
        "region": "North Africa",
        "short_description": "Medinas, mountains and the Saharan edge",
        "description": (
            "From the spice-scented lanes of Marrakech to the silence of the Sahara, Morocco "
            "rewards the curious traveller. Wander riads, ride camels into the dunes at dusk, "
            "and sleep under a canopy of stars."
        ),
        "hero_image": "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "March – May / Sep – Nov",
        "recommended_duration": "7–10 days",
        "highlights": ["Marrakech medina", "Sahara camp", "Atlas mountains", "Riad stays"],
        "things_to_do": [
            "Ride a camel into Erg Chebbi dunes",
            "Wander the Marrakech souks",
            "Share tea with an Atlas family",
            "Sleep under the desert stars",
        ],
        "travel_information": [
            "Currency: Moroccan dirham (MAD)",
            "Language: Arabic & French",
            "Visa: Most nationalities visa-free up to 90 days",
        ],
        "is_featured": True,
    },
    {
        "name": "New Zealand",
        "slug": "new-zealand",
        "country": "New Zealand",
        "region": "Oceania",
        "short_description": "Milford Sound, fjords and the South Island loop",
        "description": (
            "A road trip through a landscape that feels invented—emerald lakes, glacier-"
            "carved fiords and golden high country. Small group, great drivers, and plenty "
            "of room to simply stop and stare."
        ),
        "hero_image": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "November – March",
        "recommended_duration": "12–18 days",
        "highlights": ["Milford Sound", "Queenstown", "Glacier country", "South Island loop"],
        "things_to_do": [
            "Cruise Milford Sound at dawn",
            "Walk a glacier valley at Fox",
            "Star-watch above Lake Tekapo",
            "Stop anywhere the road begs you to",
        ],
        "travel_information": [
            "Currency: New Zealand dollar (NZD)",
            "Language: English & Te Reo Māori",
            "Driving: left-hand side — we drive for you anyway",
        ],
        "is_featured": False,
    },
    {
        "name": "Portugal",
        "slug": "portugal",
        "country": "Portugal",
        "region": "Europe",
        "short_description": "Lisbon light, Douro valleys and Atlantic coast",
        "description": (
            "Pastel-hued Lisbon, sun-bleached coastlines, and the terraced vineyards of the "
            "Douro. A relaxed journey through a country that moves at the perfect pace for "
            "slow travellers."
        ),
        "hero_image": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1533630757306-cbadb934edb9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "May – June / September",
        "recommended_duration": "7–10 days",
        "highlights": ["Lisbon", "Douro valley", "Atlantic coast", "Wine country"],
        "things_to_do": [
            "Ride Tram 28 through Alfama",
            "Sail the Douro through vine terraces",
            "Watch the sunset from Sintra",
            "Taste port where it's made",
        ],
        "travel_information": [
            "Currency: Euro (EUR)",
            "Language: Portuguese",
            "Visa: Schengen area rules apply",
        ],
        "is_featured": False,
    },
    {
        "name": "Costa Rica",
        "slug": "costa-rica",
        "country": "Costa Rica",
        "region": "Central America",
        "short_description": "Cloud forests, volcanoes and wild Pacific shores",
        "description": (
            "Pura vida in practice—misty cloud forests alive with wildlife, rumbling "
            "volcanoes, and long stretches of Pacific coast. A restorative journey for "
            "nature lovers."
        ),
        "hero_image": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "December – April",
        "recommended_duration": "8–12 days",
        "highlights": ["Cloud forest", "Volcanoes", "Pacific coast", "Wildlife"],
        "things_to_do": [
            "Trek Monteverde's hanging bridges",
            "Soak in volcano-fed hot springs",
            "Surf the Guanacaste coast",
            "Meet sea-turtle conservationists",
        ],
        "travel_information": [
            "Currency: Costa Rican colón (CRC)",
            "Language: Spanish",
            "Visa: Most nationalities visa-free up to 180 days",
        ],
        "is_featured": False,
    },
    {
        "name": "Greece",
        "slug": "greece",
        "country": "Greece",
        "region": "Europe",
        "short_description": "Aegean islands, white walls and endless blue",
        "description": (
            "Sail between islands catching the light just right, linger in villages "
            "untouched by time, and let the Aegean set the rhythm. Timeless, unhurried, "
            "deeply human."
        ),
        "hero_image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1601581875039-e899893d520c?auto=format&fit=crop&w=1200&q=80",
        ],
        "best_time": "May – October",
        "recommended_duration": "8–12 days",
        "highlights": ["Aegean sailing", "Island villages", "Santorini", "Ancient heritage"],
        "things_to_do": [
            "Sail the caldera at sunset",
            "Get lost in island villages",
            "Swim in the bluest water you've seen",
            "Walk the Acropolis at first light",
        ],
        "travel_information": [
            "Currency: Euro (EUR)",
            "Language: Greek",
            "Visa: Schengen area rules apply",
        ],
        "is_featured": False,
    },
]

# ---------------------------------------------------------------------------
# Demo packages
# ---------------------------------------------------------------------------
PACKAGES = [
    {
        "name": "Iceland Ring Road",
        "slug": "iceland-ring-road",
        "destination_slug": "iceland",
        "short_description": "A complete lap of the Ring Road in a small group.",
        "description": (
            "A complete lap of the Ring Road in a small group, with local guides, glacier "
            "lagoons, and nights in countryside stays away from the tour-bus crowds."
        ),
        "duration_days": 8,
        "duration_nights": 7,
        "starting_price": 4290.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Glacier lagoon kayak", "Golden Circle", "Local hot springs", "Coastal hikes"],
        "included": [
            "7 nights handpicked accommodation",
            "Small-group transport & expert local guide",
            "Daily breakfast + 4 dinners",
            "Glacier lagoon boat excursion",
            "Natural hot spring entry",
        ],
        "excluded": [
            "International flights",
            "Travel insurance",
            "Lunches & drinks",
        ],
        "accommodation_summary": "Countryside hotels and guesthouses, most with geothermal pools.",
        "transportation_summary": "Private minibus with a local driver-guide throughout.",
        "meal_summary": "Daily breakfast, four dinners, one traditional Icelandic lamb night.",
        "cancellation_policy": (
            "Free cancellation up to 60 days before departure. 30% charge within 60–30 days, "
            "50% within 30–15 days, 100% within 14 days."
        ),
        "important_information": [
            "Weather can change quickly — pack layers",
            "Minimum age: 10 years",
            "Pace: gentle, with daily walks of 1–2 hours",
        ],
        "is_featured": True,
        "itinerary": [
            {"day_number": 1, "title": "Reykjavík arrival", "description": "Welcome dinner and orientation with your local guide.", "activities": ["Welcome dinner", "City orientation walk"], "meals": "Dinner", "accommodation": "Reykjavík city hotel", "transportation": "Airport transfer"},
            {"day_number": 2, "title": "Golden Circle", "description": "Þingvellir, Geysir, Gullfoss — the classics, done well.", "activities": ["Þingvellir National Park", "Geysir hot springs", "Gullfoss waterfall"], "meals": "Breakfast, dinner", "accommodation": "Selfoss guesthouse", "transportation": "Private minibus"},
            {"day_number": 3, "title": "South Coast", "description": "Seljalandsfoss, Skógafoss and the black sands of Vík.", "activities": ["Seljalandsfoss hike", "Skógafoss", "Reynisfjara black beach"], "meals": "Breakfast, dinner", "accommodation": "Vík countryside hotel", "transportation": "Private minibus"},
            {"day_number": 4, "title": "Glacier lagoon", "description": "Jökulsárlón boat trip among drifting icebergs.", "activities": ["Glacier lagoon boat tour", "Diamond Beach"], "meals": "Breakfast, dinner", "accommodation": "Skaftafell lodge", "transportation": "Private minibus"},
            {"day_number": 5, "title": "East fjords", "description": "Quiet fishing villages and dramatic coastal roads.", "activities": ["East fjord villages", "Seal-spotting stop"], "meals": "Breakfast, dinner", "accommodation": "Egilsstaðir hotel", "transportation": "Private minibus"},
            {"day_number": 6, "title": "Lake Mývatn", "description": "Geothermal landscapes and a soak in a natural pool.", "activities": ["Mývatn nature baths", "Pseudo-craters walk"], "meals": "Breakfast, dinner", "accommodation": "Mývatn guesthouse", "transportation": "Private minibus"},
            {"day_number": 7, "title": "North to Akureyri", "description": "Waterfalls, whale watching and city charm.", "activities": ["Goðafoss waterfall", "Whale watching", "Akureyri walk"], "meals": "Breakfast, dinner", "accommodation": "Akureyri hotel", "transportation": "Private minibus"},
            {"day_number": 8, "title": "Departure", "description": "Morning transfer to Keflavík Airport.", "activities": ["Airport transfer"], "meals": "Breakfast", "accommodation": "—", "transportation": "Private transfer"},
        ],
        "faqs": [
            {"question": "Where does the tour start?", "answer": "Reykjavík, with a welcome dinner on day one.", "sort_order": 1},
            {"question": "Is the Ring Road tour suitable for children?", "answer": "Yes — minimum age is 10 years.", "sort_order": 2},
        ],
    },
    {
        "name": "Sacred Valley & Machu Picchu",
        "slug": "peru-sacred-valley",
        "destination_slug": "peru",
        "short_description": "The Sacred Valley at a thoughtful pace, ending at Machu Picchu sunrise.",
        "description": (
            "Explore the Sacred Valley at a thoughtful pace, meet Andean communities, and "
            "reach Machu Picchu with a guide who makes the stones come alive."
        ),
        "duration_days": 9,
        "duration_nights": 8,
        "starting_price": 3890.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Machu Picchu sunrise", "Sacred Valley", "Cusco old town", "Andean family lunch"],
        "included": [
            "8 nights boutique hotels",
            "Machu Picchu entry + private guide",
            "Scenic Vistadome train",
            "Daily breakfast + 3 dinners",
            "Andean community visit",
        ],
        "excluded": ["International flights", "Travel insurance", "Lunches & drinks"],
        "accommodation_summary": "Boutique hotels in Cusco and the Sacred Valley, one night in Aguas Calientes.",
        "transportation_summary": "Private van, scenic Vistadome train, and expert local drivers.",
        "meal_summary": "Daily breakfast, three dinners including a traditional Andean family lunch.",
        "cancellation_policy": (
            "Free cancellation up to 60 days before departure. 30% charge within 60–30 days, "
            "100% within 29 days."
        ),
        "important_information": [
            "Altitude: Cusco is 3,400m — we build in acclimatisation days",
            "Minimum age: 8 years",
            "Passport required for the Machu Picchu ticket",
        ],
        "is_featured": True,
        "itinerary": [
            {"day_number": 1, "title": "Arrive in Cusco", "description": "Altitude acclimatisation and a gentle first evening.", "activities": ["Arrival transfer", "Gentle city walk"], "meals": "Dinner", "accommodation": "Cusco boutique hotel", "transportation": "Private transfer"},
            {"day_number": 2, "title": "Cusco old town", "description": "Qorikancha, Sacsayhuamán and cobbled streets.", "activities": ["Qorikancha temple", "Sacsayhuamán fortress"], "meals": "Breakfast, dinner", "accommodation": "Cusco boutique hotel", "transportation": "Private van"},
            {"day_number": 3, "title": "Sacred Valley", "description": "Pisac market and the terraces of Ollantaytambo.", "activities": ["Pisac market", "Ollantaytambo terraces"], "meals": "Breakfast, lunch", "accommodation": "Sacred Valley lodge", "transportation": "Private van"},
            {"day_number": 4, "title": "Andean family day", "description": "A slow day with a local community and shared lunch.", "activities": ["Weaving collective visit", "Family lunch"], "meals": "Breakfast, lunch", "accommodation": "Sacred Valley lodge", "transportation": "Private van"},
            {"day_number": 5, "title": "Rail to Aguas Calientes", "description": "Scenic train through the gorge.", "activities": ["Vistadome train"], "meals": "Breakfast, dinner", "accommodation": "Aguas Calientes hotel", "transportation": "Vistadome train"},
            {"day_number": 6, "title": "Machu Picchu", "description": "Sunrise over the citadel with your private guide.", "activities": ["Machu Picchu tour", "Sunrise viewpoint"], "meals": "Breakfast, dinner", "accommodation": "Aguas Calientes hotel", "transportation": "Shuttle bus"},
            {"day_number": 7, "title": "Return to Cusco", "description": "Free day for markets or a cooking class.", "activities": ["Cusco market", "Optional cooking class"], "meals": "Breakfast", "accommodation": "Cusco boutique hotel", "transportation": "Vistadome train"},
            {"day_number": 8, "title": "Moray & Maras", "description": "Inca terraces and the salt pans.", "activities": ["Moray amphitheatre", "Maras salt pans"], "meals": "Breakfast, lunch", "accommodation": "Cusco boutique hotel", "transportation": "Private van"},
            {"day_number": 9, "title": "Departure", "description": "Transfer to Cusco airport.", "activities": ["Airport transfer"], "meals": "Breakfast", "accommodation": "—", "transportation": "Private transfer"},
        ],
        "faqs": [
            {"question": "How do I handle the altitude?", "answer": "We include acclimatisation days and you can take it slowly.", "sort_order": 1},
            {"question": "Is the Machu Picchu ticket included?", "answer": "Yes, entry plus a private guide is included.", "sort_order": 2},
        ],
    },
    {
        "name": "Japan Essence",
        "slug": "japan-essence",
        "destination_slug": "japan",
        "short_description": "The essential Japan, balanced between electric cities and serene temples.",
        "description": (
            "The essential Japan, balanced between electric cities and serene temples, with "
            "a ryokan night and a bullet-train glide between two worlds."
        ),
        "duration_days": 11,
        "duration_nights": 10,
        "starting_price": 5490.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Kyoto temples", "Tokyo & Mt Fuji", "Bullet train", "Traditional ryokan"],
        "included": [
            "10 nights including ryokan",
            "JR Pass & reserved Shinkansen",
            "Private Kyoto guide",
            "Daily breakfast + 3 dinners",
            "Onsen entry & kimono experience",
        ],
        "excluded": ["International flights", "Travel insurance", "Lunches & drinks"],
        "accommodation_summary": "City hotels plus one traditional ryokan night with kaiseki dinner.",
        "transportation_summary": "Japan Rail Pass, reserved Shinkansen seats, private transfers.",
        "meal_summary": "Daily breakfast, three dinners, plus a kaiseki dinner at the ryokan.",
        "cancellation_policy": (
            "Free cancellation up to 75 days before departure. 25% charge within 75–45 days, "
            "100% within 44 days."
        ),
        "important_information": [
            "Shoes off in ryokan and many temples",
            "Minimum age: 10 years",
            "Quiet carriages on the Shinkansen",
        ],
        "is_featured": True,
        "itinerary": [
            {"day_number": 1, "title": "Tokyo arrival", "description": "Settle in and an evening in Shinjuku.", "activities": ["Arrival", "Shinjuku evening"], "meals": "Dinner", "accommodation": "Shinjuku hotel", "transportation": "Airport transfer"},
            {"day_number": 2, "title": "Tokyo highlights", "description": "Senso-ji, Shibuya, and hidden laneways.", "activities": ["Senso-ji temple", "Shibuya crossing", "Golden Gai laneways"], "meals": "Breakfast", "accommodation": "Shinjuku hotel", "transportation": "Metro & walking"},
            {"day_number": 3, "title": "Mt Fuji day", "description": "Lake Kawaguchi and framed views of the peak.", "activities": ["Lake Kawaguchi", "Fuji viewpoint"], "meals": "Breakfast, lunch", "accommodation": "Shinjuku hotel", "transportation": "Private van"},
            {"day_number": 4, "title": "Train to Kyoto", "description": "Shinkansen over the Kansai plains.", "activities": ["Shinkansen ride"], "meals": "Breakfast", "accommodation": "Kyoto machiya", "transportation": "Shinkansen"},
            {"day_number": 5, "title": "Kyoto temples", "description": "Fushimi Inari and Kiyomizu at quiet hours.", "activities": ["Fushimi Inari", "Kiyomizu-dera"], "meals": "Breakfast", "accommodation": "Kyoto machiya", "transportation": "Bus & walking"},
            {"day_number": 6, "title": "Arashiyama", "description": "Bamboo grove and a riverside garden.", "activities": ["Bamboo grove", "Riverside garden"], "meals": "Breakfast, dinner", "accommodation": "Kyoto machiya", "transportation": "Train & walking"},
            {"day_number": 7, "title": "Nara day trip", "description": "The Great Buddha and free-roaming deer.", "activities": ["Tōdai-ji", "Nara deer park"], "meals": "Breakfast", "accommodation": "Kyoto machiya", "transportation": "Local train"},
            {"day_number": 8, "title": "Ryokan night", "description": "An onsen stay with kaiseki dinner.", "activities": ["Onsen soak", "Kaiseki dinner"], "meals": "Breakfast, dinner", "accommodation": "Hakone ryokan", "transportation": "Private transfer"},
            {"day_number": 9, "title": "Osaka food walk", "description": "Street food and spirited Dotonbori.", "activities": ["Dotonbori food walk"], "meals": "Breakfast", "accommodation": "Osaka hotel", "transportation": "Local train"},
            {"day_number": 10, "title": "Hiroshima", "description": "A moving visit to the Peace Park.", "activities": ["Peace Park Museum"], "meals": "Breakfast", "accommodation": "Osaka hotel", "transportation": "Shinkansen"},
            {"day_number": 11, "title": "Departure", "description": "Return to Tokyo and onward flight.", "activities": ["Return to Tokyo", "Airport transfer"], "meals": "Breakfast", "accommodation": "—", "transportation": "Shinkansen"},
        ],
        "faqs": [
            {"question": "How much walking is involved?", "answer": "A moderate amount — 2–4 hours per day with plenty of stops.", "sort_order": 1},
            {"question": "Do I need a tourist visa?", "answer": "Most nationalities get 90 days visa-free.", "sort_order": 2},
        ],
    },
    {
        "name": "Morocco Unveiled",
        "slug": "morocco-sahara",
        "destination_slug": "morocco",
        "short_description": "From the red city to the dunes of Erg Chebbi.",
        "description": (
            "From the red city to the dunes of Erg Chebbi, through the Atlas Mountains and "
            "into the heart of Berber hospitality."
        ),
        "duration_days": 9,
        "duration_nights": 8,
        "starting_price": 2890.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Marrakech medina", "Sahara desert camp", "Atlas crossing", "Riad stays"],
        "included": [
            "8 nights: riads + desert camp",
            "Camel trek & desert camp dinner",
            "Atlas crossing with driver-guide",
            "Daily breakfast + 5 dinners",
            "Medina walking tour",
        ],
        "excluded": ["International flights", "Travel insurance", "Lunches & drinks"],
        "accommodation_summary": "Traditional riads in medinas, plus one night in a desert camp.",
        "transportation_summary": "Private 4x4 with an expert local driver-guide.",
        "meal_summary": "Daily breakfast, five dinners including a berber desert meal.",
        "cancellation_policy": (
            "Free cancellation up to 45 days before departure. 25% charge within 45–21 days, "
            "75% within 20–7 days, 100% within 6 days."
        ),
        "important_information": [
            "Dress modestly outside Marrakech",
            "Minimum age: 12 years",
            "Desert nights can be cold — bring a layer",
        ],
        "is_featured": False,
        "itinerary": [
            {"day_number": 1, "title": "Marrakech arrival", "description": "Riads, mint tea and an introduction to the medina.", "activities": ["Arrival", "Riad welcome tea"], "meals": "Dinner", "accommodation": "Marrakech riad", "transportation": "Private transfer"},
            {"day_number": 2, "title": "Medina & souks", "description": "Wander the lanes with your local guide.", "activities": ["Medina walk", "Souk shopping"], "meals": "Breakfast, dinner", "accommodation": "Marrakech riad", "transportation": "Walking"},
            {"day_number": 3, "title": "Atlas crossing", "description": "High passes and Berber villages.", "activities": ["Tizi n'Tichka pass", "Berber villages"], "meals": "Breakfast, dinner", "accommodation": "Dades valley lodge", "transportation": "Private 4x4"},
            {"day_number": 4, "title": "Ouarzazate", "description": "Kasbahs and the desert gateways.", "activities": ["Aït Benhaddou kasbah"], "meals": "Breakfast, dinner", "accommodation": "Ouarzazate hotel", "transportation": "Private 4x4"},
            {"day_number": 5, "title": "Dades Valley", "description": "Dramatic gorges and palm oases.", "activities": ["Dades gorge walk"], "meals": "Breakfast, dinner", "accommodation": "Dades valley lodge", "transportation": "Private 4x4"},
            {"day_number": 6, "title": "Erg Chebbi dunes", "description": "Camel trek at dusk into the Sahara.", "activities": ["Camel trek", "Dune sunset"], "meals": "Breakfast, dinner", "accommodation": "Desert camp", "transportation": "Private 4x4 + camel"},
            {"day_number": 7, "title": "Desert camp", "description": "Starlit night, drums and Berber tea.", "activities": ["Dune sunrise", "Berber music night"], "meals": "Breakfast, dinner", "accommodation": "Desert camp", "transportation": "Camel + private 4x4"},
            {"day_number": 8, "title": "Return to Marrakech", "description": "A final evening in the medina.", "activities": ["Return drive"], "meals": "Breakfast, dinner", "accommodation": "Marrakech riad", "transportation": "Private 4x4"},
            {"day_number": 9, "title": "Departure", "description": "Transfer to Marrakech airport.", "activities": ["Airport transfer"], "meals": "Breakfast", "accommodation": "—", "transportation": "Private transfer"},
        ],
        "faqs": [
            {"question": "Is the desert camp comfortable?", "answer": "Yes — proper beds in traditional tents with a shared wash facility.", "sort_order": 1},
        ],
    },
    {
        "name": "South Island Loop",
        "slug": "new-zealand-south-island",
        "destination_slug": "new-zealand",
        "short_description": "A full lap of the South Island's glaciers, fiords and golden plains.",
        "description": (
            "A full lap of the South Island—glaciers, fiords and golden plains—with expert "
            "local drivers and stays that put the scenery on your doorstep."
        ),
        "duration_days": 14,
        "duration_nights": 13,
        "starting_price": 6290.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Milford Sound", "Queenstown", "Glacier country", "Golden high country"],
        "included": [
            "13 nights handpicked lodges",
            "Small-group coach with local driver",
            "Milford Sound cruise",
            "Daily breakfast + 6 dinners",
            "Stargazing night at Tekapo",
        ],
        "excluded": ["International flights", "Travel insurance", "Lunches & drinks"],
        "accommodation_summary": "Handpicked lodges and small hotels, most with lake or mountain views.",
        "transportation_summary": "Small-group coach with an expert local driver-guide.",
        "meal_summary": "Daily breakfast, six dinners across the best regions.",
        "cancellation_policy": (
            "Free cancellation up to 60 days before departure. 30% charge within 60–30 days, "
            "100% within 29 days."
        ),
        "important_information": [
            "Weather in Fiordland is famously changeable",
            "Minimum age: 8 years",
            "Bring sturdy walking shoes",
        ],
        "is_featured": False,
        "itinerary": [
            {"day_number": 1, "title": "Christchurch arrival", "description": "Garden city welcome and orientation.", "activities": ["Arrival", "Orientation walk"], "meals": "Dinner", "accommodation": "Christchurch hotel", "transportation": "Airport transfer"},
            {"day_number": 2, "title": "Kaikoura coast", "description": "Whale watching and dramatic shoreline.", "activities": ["Whale watching"], "meals": "Breakfast, dinner", "accommodation": "Kaikoura lodge", "transportation": "Small-group coach"},
            {"day_number": 3, "title": "Marlborough", "description": "Wine country and the Sounds.", "activities": ["Wine tasting", "Queen Charlotte lookout"], "meals": "Breakfast, dinner", "accommodation": "Blenheim lodge", "transportation": "Small-group coach"},
            {"day_number": 4, "title": "Nelson & Abel Tasman", "description": "Golden beaches and coastal tracks.", "activities": ["Abel Tasman coastal walk"], "meals": "Breakfast, dinner", "accommodation": "Nelson lodge", "transportation": "Small-group coach"},
            {"day_number": 5, "title": "West Coast", "description": "Pancake rocks and wild seas.", "activities": ["Punakaiki pancake rocks"], "meals": "Breakfast, dinner", "accommodation": "Hokitika hotel", "transportation": "Small-group coach"},
            {"day_number": 6, "title": "Fox Glacier", "description": "Valley walks beneath the ice.", "activities": ["Glacier valley walk"], "meals": "Breakfast, dinner", "accommodation": "Fox Glacier lodge", "transportation": "Small-group coach"},
            {"day_number": 7, "title": "Wanaka", "description": "Lake views and the lonely tree.", "activities": ["Lake Wanaka", "Roys Peak lookout"], "meals": "Breakfast, dinner", "accommodation": "Wanaka lodge", "transportation": "Small-group coach"},
            {"day_number": 8, "title": "Queenstown", "description": "Adventure capital, at your own pace.", "activities": ["Free day in Queenstown"], "meals": "Breakfast", "accommodation": "Queenstown hotel", "transportation": "Small-group coach"},
            {"day_number": 9, "title": "Milford Sound", "description": "A cruise through fiordland grandeur.", "activities": ["Milford Sound cruise"], "meals": "Breakfast, lunch", "accommodation": "Te Anau lodge", "transportation": "Small-group coach + cruise"},
            {"day_number": 10, "title": "Te Anau & Doubtful", "description": "The quieter fiord, wilderness cruise.", "activities": ["Doubtful Sound cruise"], "meals": "Breakfast, lunch", "accommodation": "Te Anau lodge", "transportation": "Small-group coach + cruise"},
            {"day_number": 11, "title": "Dunedin", "description": "Scottish heritage and Otago coast.", "activities": ["Dunedin heritage walk"], "meals": "Breakfast, dinner", "accommodation": "Dunedin hotel", "transportation": "Small-group coach"},
            {"day_number": 12, "title": "Aoraki / Mt Cook", "description": "Night skies and alpine hikes.", "activities": ["Hooker Valley track"], "meals": "Breakfast, dinner", "accommodation": "Mt Cook lodge", "transportation": "Small-group coach"},
            {"day_number": 13, "title": "Lake Tekapo", "description": "Turquoise water and star observatory.", "activities": ["Church of the Good Shepherd", "Stargazing night"], "meals": "Breakfast, dinner", "accommodation": "Tekapo lodge", "transportation": "Small-group coach"},
            {"day_number": 14, "title": "Return", "description": "Drive back to Christchurch airport.", "activities": ["Return drive"], "meals": "Breakfast", "accommodation": "—", "transportation": "Small-group coach"},
        ],
        "faqs": [
            {"question": "Is this trip high-energy?", "answer": "It's active but flexible — walks are optional each day.", "sort_order": 1},
        ],
    },
    {
        "name": "Portugal Light & Douro",
        "slug": "portugal-light",
        "destination_slug": "portugal",
        "short_description": "Sun-warmed Lisbon, the Douro valley and a slow Atlantic coast.",
        "description": (
            "Sun-warmed Lisbon, the terraced vine country of the Douro, and a slow stretch "
            "of Atlantic coastline — a gentle, golden introduction to Portugal."
        ),
        "duration_days": 8,
        "duration_nights": 7,
        "starting_price": 3190.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1533630757306-cbadb934edb9?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Lisbon", "Douro valley", "Atlantic coast", "Wine tastings"],
        "included": [
            "7 nights boutique hotels",
            "Sintra & Douro excursions",
            "River cruise & wine tastings",
            "Daily breakfast + 4 dinners",
            "Local guides in Lisbon & Porto",
        ],
        "excluded": ["International flights", "Travel insurance", "Lunches & drinks"],
        "accommodation_summary": "Boutique hotels in Lisbon, Porto and a countryside quinta in the Douro.",
        "transportation_summary": "Private van with local driver, plus a Douro river cruise.",
        "meal_summary": "Daily breakfast, four dinners including a wine estate lunch.",
        "cancellation_policy": (
            "Free cancellation up to 45 days before departure. 25% charge within 45–21 days, "
            "100% within 20 days."
        ),
        "important_information": [
            "Lisbon's hills are steep — comfortable shoes essential",
            "Minimum age: 8 years",
        ],
        "booking_mode": "INSTANT_BOOKING",
        "is_featured": False,
        "itinerary": [
            {"day_number": 1, "title": "Lisbon arrival", "description": "Old town lights and a fado evening.", "activities": ["Arrival", "Fado dinner"], "meals": "Dinner", "accommodation": "Lisbon boutique hotel", "transportation": "Airport transfer"},
            {"day_number": 2, "title": "Lisbon districts", "description": "Alfama, Belém and the tram-lined hills.", "activities": ["Alfama walk", "Belém tower", "Tram 28"], "meals": "Breakfast", "accommodation": "Lisbon boutique hotel", "transportation": "Tram & walking"},
            {"day_number": 3, "title": "Sintra", "description": "Fairytale palaces amid forested hills.", "activities": ["Pena Palace", "Quinta da Regaleira"], "meals": "Breakfast, lunch", "accommodation": "Lisbon boutique hotel", "transportation": "Private van"},
            {"day_number": 4, "title": "Coast road north", "description": "Cascais, Óbidos and fishing towns.", "activities": ["Cascais", "Óbidos walled town"], "meals": "Breakfast, dinner", "accommodation": "Nazaré hotel", "transportation": "Private van"},
            {"day_number": 5, "title": "Porto", "description": "Riverside Ribeira and azulejo streets.", "activities": ["Ribeira district", "Azulejo tiling tour"], "meals": "Breakfast", "accommodation": "Porto boutique hotel", "transportation": "Private van"},
            {"day_number": 6, "title": "Douro Valley", "description": "Terraced vines and a river cruise.", "activities": ["Douro river cruise"], "meals": "Breakfast, lunch", "accommodation": "Douro quinta", "transportation": "Private van + cruise"},
            {"day_number": 7, "title": "Wine estate", "description": "Tastings and a slow countryside lunch.", "activities": ["Wine tastings", "Quinta lunch"], "meals": "Breakfast, lunch, dinner", "accommodation": "Douro quinta", "transportation": "Private van"},
            {"day_number": 8, "title": "Departure", "description": "Transfer to Porto airport.", "activities": ["Airport transfer"], "meals": "Breakfast", "accommodation": "—", "transportation": "Private transfer"},
        ],
        "faqs": [
            {"question": "How hilly is Lisbon?", "answer": "Very — but we plan routes with trams and quiet shortcuts.", "sort_order": 1},
        ],
    },
    {
        "name": "Costa Rica Pura Vida",
        "slug": "costa-rica-pura-vida",
        "destination_slug": "costa-rica",
        "short_description": "Cloud forests, volcanoes and wild Pacific shores.",
        "description": (
            "Misty cloud forests, steaming volcanoes and wild Pacific shores — a restorative "
            "journey through Costa Rica's richest landscapes."
        ),
        "duration_days": 10,
        "duration_nights": 9,
        "starting_price": 3490.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Cloud forest", "Volcanoes", "Pacific coast", "Wildlife"],
        "included": [
            "9 nights eco-lodges & beach stay",
            "All transfers with local drivers",
            "Cloud forest & volcano entries",
            "Daily breakfast + 5 dinners",
            "Turtle conservation morning",
        ],
        "excluded": ["International flights", "Travel insurance", "Lunches & drinks"],
        "accommodation_summary": "Eco-lodges in the cloud forest and a relaxed beachfront stay.",
        "transportation_summary": "All transfers included with experienced local drivers.",
        "meal_summary": "Daily breakfast, five dinners including a beachside barbecue.",
        "cancellation_policy": (
            "Free cancellation up to 45 days before departure. 30% charge within 45–21 days, "
            "100% within 20 days."
        ),
        "important_information": [
            "Light rain is normal in the cloud forest",
            "Minimum age: 8 years",
            "Pack insect repellent",
        ],
        "booking_mode": "INSTANT_BOOKING",
        "is_featured": False,
        "itinerary": [
            {"day_number": 1, "title": "San José arrival", "description": "Settle into the capital's green hills.", "activities": ["Arrival", "Orientation"], "meals": "Dinner", "accommodation": "San José hotel", "transportation": "Airport transfer"},
            {"day_number": 2, "title": "Poás Volcano", "description": "Cloud forest and a steaming crater.", "activities": ["Poás crater hike"], "meals": "Breakfast, dinner", "accommodation": "Arenal lodge", "transportation": "Private van"},
            {"day_number": 3, "title": "Arenal", "description": "Volcano views and evening hot springs.", "activities": ["Arenal volcano", "Hot springs evening"], "meals": "Breakfast, dinner", "accommodation": "Arenal lodge", "transportation": "Private van"},
            {"day_number": 4, "title": "Monteverde", "description": "Trek the cloud forest canopy.", "activities": ["Cloud forest trek"], "meals": "Breakfast, dinner", "accommodation": "Monteverde eco-lodge", "transportation": "Private van"},
            {"day_number": 5, "title": "Hanging bridges", "description": "Wildlife-spotting on forest trails.", "activities": ["Hanging bridges walk"], "meals": "Breakfast, dinner", "accommodation": "Monteverde eco-lodge", "transportation": "Private van"},
            {"day_number": 6, "title": "Pacific coast", "description": "Cross to the Guanacaste shore.", "activities": ["Coast drive", "Beach arrival"], "meals": "Breakfast, dinner", "accommodation": "Guanacaste beach hotel", "transportation": "Private van"},
            {"day_number": 7, "title": "Beach days", "description": "Surf, swim or simply unwind.", "activities": ["Beach day"], "meals": "Breakfast", "accommodation": "Guanacaste beach hotel", "transportation": "—"},
            {"day_number": 8, "title": "Turtle project", "description": "A morning with local conservationists.", "activities": ["Turtle conservation"], "meals": "Breakfast", "accommodation": "Guanacaste beach hotel", "transportation": "Private van"},
            {"day_number": 9, "title": "Sunset catamaran", "description": "Sail the coast with dinner aboard.", "activities": ["Sunset catamaran"], "meals": "Breakfast", "accommodation": "Guanacaste beach hotel", "transportation": "Catamaran"},
            {"day_number": 10, "title": "Departure", "description": "Transfer to Liberia airport.", "activities": ["Airport transfer"], "meals": "Breakfast", "accommodation": "—", "transportation": "Private transfer"},
        ],
        "faqs": [
            {"question": "Do I need to be fit?", "answer": "Most days are gentle; the cloud forest trek is an easy-to-moderate walk.", "sort_order": 1},
        ],
    },
    {
        "name": "Aegean Island Sail",
        "slug": "greece-aegean",
        "destination_slug": "greece",
        "short_description": "Sail the Aegean between whitewashed islands at golden hour.",
        "description": (
            "Sail the Aegean between whitewashed islands, linger in harbour villages, and "
            "watch the sun set over the caldera from the water."
        ),
        "duration_days": 10,
        "duration_nights": 9,
        "starting_price": 3890.00,
        "currency": "USD",
        "hero_image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=80",
        ],
        "highlights": ["Aegean sailing", "Santorini", "Island villages", "Ancient heritage"],
        "included": [
            "9 nights hotels + boat nights",
            "Aegean sailing day with crew",
            "Ferry & inter-island transport",
            "Daily breakfast + 4 dinners",
            "Santorini caldera guide",
        ],
        "excluded": ["International flights", "Travel insurance", "Lunches & drinks"],
        "accommodation_summary": "Boutique island hotels and one night aboard a traditional boat.",
        "transportation_summary": "Ferries, a crewed sailing day, and private transfers.",
        "meal_summary": "Daily breakfast, four dinners including a sunset taverna feast.",
        "cancellation_policy": (
            "Free cancellation up to 45 days before departure. 25% charge within 45–21 days, "
            "100% within 20 days."
        ),
        "important_information": [
            "Ferry schedules vary by season",
            "Minimum age: 6 years",
            "Swim stops depend on the wind",
        ],
        "is_featured": False,
        "itinerary": [
            {"day_number": 1, "title": "Athens arrival", "description": "Acropolis views and a rooftop dinner.", "activities": ["Arrival", "Rooftop dinner"], "meals": "Dinner", "accommodation": "Athens hotel", "transportation": "Airport transfer"},
            {"day_number": 2, "title": "Athens ancient city", "description": "The Acropolis, Plaka and Monastiraki.", "activities": ["Acropolis", "Plaka district"], "meals": "Breakfast", "accommodation": "Athens hotel", "transportation": "Walking"},
            {"day_number": 3, "title": "Ferry to the islands", "description": "Cross to the Cyclades.", "activities": ["Ferry crossing"], "meals": "Breakfast", "accommodation": "Paros hotel", "transportation": "Ferry"},
            {"day_number": 4, "title": "Island villages", "description": "White walls, blue domes and slow mornings.", "activities": ["Paros villages walk"], "meals": "Breakfast, dinner", "accommodation": "Paros hotel", "transportation": "Walking"},
            {"day_number": 5, "title": "Sail day", "description": "A day aboard a traditional boat.", "activities": ["Sailing day"], "meals": "Breakfast, lunch", "accommodation": "Boat night", "transportation": "Sailboat"},
            {"day_number": 6, "title": "Swim stops", "description": "Secluded coves and clear water.", "activities": ["Swim stops", "Island hopping"], "meals": "Breakfast, lunch", "accommodation": "Ios hotel", "transportation": "Sailboat"},
            {"day_number": 7, "title": "Santorini", "description": "Caldera-edge walking at golden hour.", "activities": ["Caldera walk"], "meals": "Breakfast", "accommodation": "Santorini hotel", "transportation": "Ferry"},
            {"day_number": 8, "title": "Oia sunset", "description": "The classic view, from the best cliff.", "activities": ["Oia sunset", "Taverna dinner"], "meals": "Breakfast, dinner", "accommodation": "Santorini hotel", "transportation": "Walking"},
            {"day_number": 9, "title": "Sailing return", "description": "One last swim and a farewell dinner.", "activities": ["Farewell sail", "Farewell dinner"], "meals": "Breakfast, dinner", "accommodation": "Santorini hotel", "transportation": "Sailboat"},
            {"day_number": 10, "title": "Departure", "description": "Flight from Santorini.", "activities": ["Airport transfer"], "meals": "Breakfast", "accommodation": "—", "transportation": "Private transfer"},
        ],
        "faqs": [
            {"question": "Can I sail even if I'm prone to seasickness?", "answer": "The Aegean is usually calm; we also pick sheltered routes.", "sort_order": 1},
        ],
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Upsert destinations
        slug_to_destination: dict[str, Destination] = {}
        for d in DESTINATIONS:
            existing = db.scalars(select(Destination).where(Destination.slug == d["slug"])).first()
            if existing:
                slug_to_destination[d["slug"]] = existing
                continue
            destination = Destination(**d)
            db.add(destination)
            db.flush()
            slug_to_destination[d["slug"]] = destination

        # Upsert packages + itinerary
        for package_data in PACKAGES:
            existing_pkg = db.scalars(
                select(Package).where(Package.slug == package_data["slug"])
            ).first()
            if existing_pkg:
                continue

            data = package_data.copy()
            destination = slug_to_destination[data.pop("destination_slug")]
            itinerary = data.pop("itinerary")
            faqs = data.pop("faqs")
            package = Package(destination_id=destination.id, **data)
            package.itinerary = [ItineraryDay(**day) for day in itinerary]
            package.faqs = [PackageFaq(**faq) for faq in faqs]
            db.add(package)

        db.commit()
        print("✅ Seed complete")
        print(f"   Destinations: {db.query(Destination).count()}")
        print(f"   Packages:     {db.query(Package).count()}")
        print(f"   Itinerary:    {db.query(ItineraryDay).count()}")
        print(f"   Package FAQs: {db.query(PackageFaq).count()}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()