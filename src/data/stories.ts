export type Story = {
  slug: string;
  title: string;
  excerpt: string;
  quote: string;
  author: string;
  trip: string;
  date: string;
  image: string;
  body: string[];
};

export const stories: Story[] = [
  {
    slug: "the-trip-that-brought-us-back-to-each-other",
    title: "The trip that brought us back to each other",
    excerpt: "After five years of saying 'one day', Hannah and Tom finally made it to Japan—and found more than they were looking for.",
    quote: "Every detail felt considered, but nothing felt over-planned. We had room to get lost.",
    author: "Hannah & Tom",
    trip: "Japan Essence",
    date: "March 2024",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=80",
    body: [
      "We had been talking about Japan for five years. Work, weddings, house renovations—there was always a reason to push it back. When we finally called Explorers Choice, we didn't want to be rushed through a checklist. We wanted to feel somewhere.",
      "They understood that straight away. Our trip had the things we had dreamed about—Kyoto's temples, the lights of Tokyo, a night in a mountain ryokan—but also the spaces between. A quiet morning by the Kamo River. An afternoon in a tiny pottery studio. Time to take the wrong train and laugh about it.",
      "The best part was never having to think about the logistics. Our guide Mai knew the best time to visit every place, and when to leave us alone. We came home with hundreds of photos, but the memories we talk about most are the small ones.",
    ],
  },
  {
    slug: "finding-stillness-in-the-high-atlas",
    title: "Finding stillness in the High Atlas",
    excerpt: "A week in Morocco taught James that the best travel moments are often the quietest ones.",
    quote: "We went looking for adventure and found hospitality. That is the Morocco I will remember.",
    author: "James Wilson",
    trip: "Morocco Unveiled",
    date: "November 2023",
    image: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1400&q=80",
    body: [
      "The plan was adventure. I had pictured the desert, the souks, the long road through the Atlas. I hadn't pictured sitting on a kitchen floor in a village above the clouds, drinking tea with three generations of a Berber family.",
      "Our driver, Youssef, seemed to know everyone. The woman who made our lunch, the boy who showed us the path to a hidden waterfall, the old man who insisted we share his oranges. Morocco unfolded through people, not places.",
      "The desert camp was beautiful, of course. But the moment I carry home is waking before sunrise and hearing absolutely nothing. Then, slowly, the sand turning pink.",
    ],
  },
  {
    slug: "why-iceland-made-us-slow-down",
    title: "Why Iceland made us slow down",
    excerpt: "The Ring Road is famous for its landscapes. Less talked about is what happens when you stop trying to see everything.",
    quote: "The itinerary gave us a direction, not a deadline. That made all the difference.",
    author: "Priya & Asha",
    trip: "Iceland Ring Road",
    date: "August 2023",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1400&q=80",
    body: [
      "Before Iceland, our holidays had a familiar rhythm: wake up early, see the thing, drive to the next thing. We thought we were good travellers. We were actually just efficient.",
      "Explorers Choice had planned a day with no plans. Just a little fishing village, a hot pool, and a note that said 'ask your host where they go on a Sunday'. It became our favourite day of the trip.",
      "We still saw waterfalls that made us speechless and stood beside icebergs in a blue lagoon. But we also learned that the best itinerary is one that leaves a little white space.",
    ],
  },
  {
    slug: "a-table-for-twelve-in-the-sacred-valley",
    title: "A table for twelve in the Sacred Valley",
    excerpt: "The lunch we almost skipped became the meal none of us wanted to leave.",
    quote: "You can read about a place for years. Then someone opens their home, and suddenly you understand it.",
    author: "The Patel family",
    trip: "Sacred Valley & Machu Picchu",
    date: "June 2024",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=80",
    body: [
      "We were meant to visit another ruin that morning. Instead, our guide Valeria asked if we would like to meet her aunt. There were twelve of us around a long wooden table by the time lunch was served.",
      "We helped make the pachamanca—a traditional meal cooked in the earth—and learned about the community's weaving collective. Our children played football with the neighbours while we tried to communicate in a mix of Spanish, English and laughter.",
      "Machu Picchu was extraordinary. But it was that table we talked about on the flight home. Travel is at its best when it gives you a seat at someone else's table.",
    ],
  },
];

export function getStoryBySlug(slug: string) {
  return stories.find((story) => story.slug === slug);
}
