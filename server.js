import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory persistent stores
const enquiries = [];

const destinations = [
  {
    id: 'damota',
    name: 'Mount Damota',
    tagline: 'The Sacred Roof of Wolaita',
    elevation: '2,900 m',
    distanceFromSodo: '12 km (25 min)',
    category: 'Highlands & Peaks',
    lat: 6.9142,
    lng: 37.7889,
    mapCoords: { x: 48, y: 32 },
    googleEarthUrl: 'https://earth.google.com/web/@6.9142,37.7889,2890a,3500d,35y,45h,60t,0r',
    image: 'walaita1.jpeg',
    summary: 'A towering volcanic massif offering 360-degree vistas over the Great Rift Valley, Lake Abaya, and lush terraced hillsides. Revered for centuries as a sacred site of ancient kings.',
    highlights: ['Breathtaking dawn cloud inversions', 'Hiking trails through indigenous afro-alpine flora', 'Mochena Borago archaeological shelter nearby', 'Paragliding vantage points'],
    bestTime: 'October to February (Early Mornings)',
    difficulty: 'Moderate to Challenging',
    wildlife: 'Colobus monkeys, Lammergeier eagles, endemic butterflies'
  },
  {
    id: 'ajora',
    name: 'Ajora Twin Falls',
    tagline: 'Cascading Twin Jewels of Boloso Bombe',
    elevation: '1,750 m',
    distanceFromSodo: '35 km (1 hr)',
    category: 'Waterfalls & Gorges',
    lat: 7.0833,
    lng: 37.5167,
    mapCoords: { x: 26, y: 22 },
    googleEarthUrl: 'https://earth.google.com/web/@7.0833,37.5167,1750a,2800d,35y,120h,55t,0r',
    image: 'wolaita.jpeg',
    summary: 'Formed by the roaring confluence of the Soke and Ajancho rivers, these twin waterfalls plunge over 100 meters into a prehistoric jungle canyon filled with ferns and rare hornbills.',
    highlights: ['Twin waterfalls dropping side-by-side', 'Lush rainforest canyon trekking', 'Natural mist-sprayed picnic spots', 'Rich monkey and bird species'],
    bestTime: 'September to January (Peak river volume)',
    difficulty: 'Active canyon hiking',
    wildlife: 'Silvery-cheeked hornbills, Vervet monkeys, wild orchids'
  },
  {
    id: 'abaya',
    name: 'Lake Abaya Wetlands',
    tagline: 'Rift Valley Waters & Bird Sanctuaries',
    elevation: '1,285 m',
    distanceFromSodo: '45 km (1 hr 15 min)',
    category: 'Lakes & Wildlife',
    lat: 6.6500,
    lng: 37.9500,
    mapCoords: { x: 74, y: 78 },
    googleEarthUrl: 'https://earth.google.com/web/@6.6500,37.9500,1285a,6000d,35y,0h,45t,0r',
    image: 'walaita1.jpeg',
    summary: 'Ethiopia’s second-largest lake with distinctive reddish-copper waters, framed by dramatic escarpments. A sanctuary for hundreds of bird species, Nile crocodiles, and freshwater fish.',
    highlights: ['Canoe excursions with local fishermen', 'Pelican and fish eagle birdwatching', 'Sunset views against the Gamo-Wolaita ridges', 'Fresh grilled tilapia by the shore'],
    bestTime: 'Year-round (Best sunsets Nov–March)',
    difficulty: 'Gentle & Relaxed',
    wildlife: 'Great white pelicans, African fish eagles, Nile monitor lizards'
  },
  {
    id: 'bilbo',
    name: 'Bilbo Hot Springs',
    tagline: 'Natural Geothermal Healing Baths',
    elevation: '1,420 m',
    distanceFromSodo: '32 km (50 min)',
    category: 'Wellness & Springs',
    lat: 6.6833,
    lng: 37.8333,
    mapCoords: { x: 62, y: 55 },
    googleEarthUrl: 'https://earth.google.com/web/@6.6833,37.8333,1420a,2000d,35y,60h,50t,0r',
    image: 'wolaita.jpeg',
    summary: 'Natural thermal springs emerging from volcanic subterranean fissures in Abala Abaya, known for soothing mineral qualities and centuries of traditional restorative retreats.',
    highlights: ['Therapeutic mineral bathing pools', 'Natural steam vents in tropical greenery', 'Traditional herbal tea post-bath', 'Peaceful rural retreat setting'],
    bestTime: 'November to May',
    difficulty: 'Easy & Therapeutic',
    wildlife: 'Sunbirds, weaver birds, giant wild fig trees'
  },
  {
    id: 'mochena',
    name: 'Mochena Borago Rockshelter',
    tagline: 'Echoes of the Middle Stone Age',
    elevation: '2,200 m',
    distanceFromSodo: '8 km (15 min)',
    category: 'Archaeology & Heritage',
    lat: 6.8950,
    lng: 37.7550,
    mapCoords: { x: 44, y: 40 },
    googleEarthUrl: 'https://earth.google.com/web/@6.8950,37.7550,2200a,1500d,35y,30h,65t,0r',
    image: 'walaita1.jpeg',
    summary: 'A world-famous archaeological site situated under a massive rock overhang on Mount Damota, uncovering human habitation and obsidian tool-making dating back over 50,000 years.',
    highlights: ['Paleolithic excavation sites and cave formations', 'Guided historical narrative by local scholars', 'Stunning views overlooking Sodo city basin', 'Native wildlife sightings along the slope trail'],
    bestTime: 'Dry season (October to May)',
    difficulty: 'Moderate walk',
    wildlife: 'Rock hyrax, mountain swallows'
  },
  {
    id: 'tona-fortress',
    name: 'Kawo Tona Fortress Walls',
    tagline: 'The Ancient Kingdom Defensive Ramparts',
    elevation: '2,050 m',
    distanceFromSodo: '18 km (35 min)',
    category: 'Archaeology & Heritage',
    lat: 6.8200,
    lng: 37.7100,
    mapCoords: { x: 38, y: 64 },
    googleEarthUrl: 'https://earth.google.com/web/@6.8200,37.7100,2050a,2000d,35y,200h,50t,0r',
    image: 'wolaita.jpeg',
    summary: 'Massive defensive earthworks, trenches, and stone fortifications constructed under King Kawo Tona, the legendary 19th-century warrior king of the Kingdom of Wolaita.',
    highlights: ['Ancient defensive moats and stone masonry', 'Oral history sessions with village elders', 'Panoramic viewpoint across historical battlegrounds', 'Trek along the King’s ceremonial trails'],
    bestTime: 'October to April',
    difficulty: 'Moderate exploration',
    wildlife: 'Highland falcons, wild sage vegetation'
  }
];

const hubLocation = {
  id: 'sodo-hub',
  name: 'Wolaita Sodo (City Center)',
  lat: 6.8583,
  lng: 37.7611,
  elevation: '2,100 m',
  googleEarthUrl: 'https://earth.google.com/web/@6.8583,37.7611,2100a,4000d,35y,0h,45t,0r'
};

const experiences = [
  {
    id: 'damota-sunrise',
    name: 'Mount Damota Dawn Trek & Cloud Forest',
    type: 'Highland Trekking',
    duration: '5 hours',
    difficulty: 'Moderate',
    priceUSD: 35,
    priceETB: 4200,
    price: '$35 / 4,200 ETB',
    note: 'Ascend the highest peak of Wolaita before first light. Savor freshly brewed highland coffee while watching morning clouds roll across the Great Rift Valley.',
    included: ['Certified mountain guide', 'Highland sunrise coffee ceremony', 'Snack pack with local fruits & honey', 'Walking poles on request'],
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: 'ajora-canyon-trek',
    name: 'Ajora Twin Falls Canyon Expedition',
    type: 'Highland Trekking',
    duration: 'Full Day (7 hrs)',
    difficulty: 'Active',
    priceUSD: 50,
    priceETB: 6000,
    price: '$50 / 6,000 ETB',
    note: 'Descend through dense rainforest canyons to the mist-covered base of the 100m twin cascades. Spot colobus monkeys and exotic birdlife.',
    included: ['Round-trip scenic transport', 'Eco-trail escort & safety gear', 'Local community trail fee', 'Riverside picnic lunch'],
    rating: 5.0,
    reviewsCount: 44
  },
  {
    id: 'gifataa-culture',
    name: 'Gifaataa Living Heritage & Dance Immersion',
    type: 'Living Culture',
    duration: 'Full Day',
    difficulty: 'Easy',
    priceUSD: 45,
    priceETB: 5400,
    price: '$45 / 5,400 ETB',
    note: 'Experience the UNESCO-recognized Wolaita New Year traditions. Learn dynamic Gereessa dance steps, hear ancient folklore, and wear hand-woven celebratory shemma.',
    included: ['Elder storytelling session', 'Traditional attire dressing & photoshoot', 'Gereessa dance workshop', 'Festive banquet with local delicacies'],
    rating: 4.9,
    reviewsCount: 29
  },
  {
    id: 'enset-masterclass',
    name: 'The Enset Table: Farm-to-Feast Workshop',
    type: 'Enset & Gastronomy',
    duration: '4 hours',
    difficulty: 'Easy',
    priceUSD: 30,
    priceETB: 3600,
    price: '$30 / 3,600 ETB',
    note: 'Step inside a lush homestead to harvest and decorticate the ancient false banana plant. Bake crisp Kocho over clay griddles and taste steaming Bulla porridge.',
    included: ['Hands-on Enset scraping demo', 'Kocho flatbread baking', 'Bulla porridge & spiced butter tasting', 'Organic coffee roasting ritual'],
    rating: 5.0,
    reviewsCount: 52
  },
  {
    id: 'shemma-weaving',
    name: 'Tricolor Shemma Weaving Masterclass',
    type: 'Artisan Crafts',
    duration: '3 hours',
    difficulty: 'Easy',
    priceUSD: 25,
    priceETB: 3000,
    price: '$25 / 3,000 ETB',
    note: 'Sit alongside master cotton weavers as they interlace vibrant red, black, and yellow geometric patterns on traditional wooden foot-pedal looms.',
    included: ['Guided loom trial', 'Organic cotton spinning lesson', 'Artisan community stipend', 'Custom woven bookmark/coaster gift'],
    rating: 4.8,
    reviewsCount: 21
  },
  {
    id: 'bilbo-spa',
    name: 'Bilbo Geothermal Springs & Herbal Retreat',
    type: 'Wellness & Nature',
    duration: 'Half Day (4 hrs)',
    difficulty: 'Easy',
    priceUSD: 35,
    priceETB: 4200,
    price: '$35 / 4,200 ETB',
    note: 'Soak in mineral-rich volcanic warm pools nestled beneath wild fig trees, followed by traditional herbal steam and spiced honey infusions.',
    included: ['Private mineral pool access', 'Local herbal steam treatment', 'Organic forest honey tea', 'Local wellness host guide'],
    rating: 4.7,
    reviewsCount: 19
  },
  {
    id: 'homestay-tukil',
    name: 'Wolaita Bamboo Cottage (Tukil) Homestay',
    type: 'Community Homestays',
    duration: '2 Days / 1 Night',
    difficulty: 'Easy',
    priceUSD: 65,
    priceETB: 7800,
    price: '$65 / 7,800 ETB',
    note: 'Sleep in an authentic woven bamboo dome cottage. Share evening stories by the embers, wake up to rooster calls, and experience true southern hospitality.',
    included: ['Overnight in traditional family compound', '3 homecooked organic meals', 'Evening campfire music & lore', 'Community host support fund'],
    rating: 5.0,
    reviewsCount: 33
  }
];

const itineraries = [
  {
    id: '1-day',
    title: 'The Sodo Cultural & Scenic Trail',
    duration: '1 Day',
    pace: 'Relaxed & Enriching',
    tagline: 'The perfect introduction for weekenders and short-stay travelers.',
    schedule: [
      { time: '06:00 AM', title: 'Mount Damota Dawn Viewpoint', desc: 'Gentle morning drive and scenic stroll to watch golden light flood the Rift Valley.' },
      { time: '09:30 AM', title: 'Sodo Organic Coffee & Breakfast', desc: 'Savor freshly roasted single-origin highland coffee with warm Omolcho snack.' },
      { time: '11:30 AM', title: 'Sodo Artisan & Cotton Weaving Quarter', desc: 'Meet local weavers crafting the iconic red, yellow, and black shemma textiles.' },
      { time: '01:30 PM', title: 'Traditional Feast at Enset Kitchen', desc: 'Taste freshly baked Kocho with tender kitfo, seasoned bulla, and organic greens.' },
      { time: '04:30 PM', title: 'Mochena Borago Archaeological Walk', desc: 'Explore the historic rock overhang and prehistoric cave shelter.' }
    ]
  },
  {
    id: '3-day',
    title: 'Highland Peaks, Waterfalls & Living Lore',
    duration: '3 Days / 2 Nights',
    pace: 'Active & Immersive',
    tagline: 'A comprehensive journey traversing clouds, canyons, and authentic village life.',
    schedule: [
      { time: 'Day 1', title: 'Summiting Mount Damota & Ancient Heritage', desc: 'Full trek to the 2,900m summit, picnic above the clouds, and visit the King Tona fortifications.' },
      { time: 'Day 2', title: 'Ajora Twin Waterfalls Canyon Adventure', desc: 'Full-day expedition through Boloso Bombe gorge to the foot of the 100m twin cascades.' },
      { time: 'Day 3', title: 'Enset Masterclass & Bilbo Hot Springs Soak', desc: 'Hands-on farm experience in a family compound, followed by relaxing in geothermal waters.' }
    ]
  },
  {
    id: '5-day',
    title: 'The Grand Wolaita Expedition & Homestay',
    duration: '5 Days / 4 Nights',
    pace: 'Deep Immersion',
    tagline: 'The ultimate expedition from Lake Abaya shores to sacred highland peaks.',
    schedule: [
      { time: 'Day 1', title: 'Arrival in Sodo: City of 7 Gates & Cultural Welcome', desc: 'Orientation, local market discovery, and welcome banquet.' },
      { time: 'Day 2', title: 'Mount Damota & Mochena Borago Caves', desc: 'Archaeological wonders, afro-alpine birdwatching, and panoramic sunsets.' },
      { time: 'Day 3', title: 'Ajora Falls Trek & Boloso Bombe Rainforest', desc: 'Canyon hiking, river crossings, and wild orchid spotting.' },
      { time: 'Day 4', title: 'Bamboo Tukil Village Homestay & Gifaataa Traditions', desc: 'Immersive night in a rural homestead with traditional dance, songs, and cooking.' },
      { time: 'Day 5', title: 'Lake Abaya Wetland Canoe Excursion & Farewell', desc: 'Morning boat ride on the reddish lake waters, shore birding, and departure.' }
    ]
  }
];

const guides = [
  {
    id: 'tariku',
    name: 'Tariku Bancha',
    role: 'Senior Highland Trekking & Eco Guide',
    experience: '9 years experience',
    languages: ['English', 'Wolayttatto', 'Amharic'],
    specialties: ['Mount Damota summit trails', 'Afro-alpine botany', 'Paragliding logistics'],
    bio: 'Born at the base of Mount Damota, Tariku has guided over 400 travelers across Southern Ethiopia’s ridges and hidden waterfalls.',
    phone: '+251 91 234 5678'
  },
  {
    id: 'selamawit',
    name: 'Selamawit Kassa',
    role: 'Cultural Historian & Gastronomy Specialist',
    experience: '6 years experience',
    languages: ['English', 'Wolayttatto', 'Amharic'],
    specialties: ['Enset traditions', 'Gifaataa festival lore', 'Artisan weaving trails'],
    bio: 'Selamawit is passionate about preserving Wolaita’s intangible heritage, empowering female agricultural cooperatives and homestay families.',
    phone: '+251 92 876 5432'
  },
  {
    id: 'mathewos',
    name: 'Mathewos Wolde',
    role: 'Archaeology & Wildlife Naturalist',
    experience: '11 years experience',
    languages: ['English', 'Wolayttatto', 'Amharic', 'French'],
    specialties: ['Mochena Borago caves', 'Lake Abaya birding', 'King Tona fortress history'],
    bio: 'Mathewos holds a background in tourism and heritage conservation, offering captivating narratives of the ancient Kingdom of Wolaita.',
    phone: '+251 93 456 7890'
  }
];

const stories = [
  {
    id: 'gifataa',
    title: 'Gifaataa: The Festival of Reconciliation and Light',
    subtitle: 'UNESCO Intangible Cultural Heritage',
    excerpt: 'Celebrated every September, Gifaataa marks the arrival of the Wolaita New Year. It is not merely a celebration of the calendar, but a sacred covenant of peace, clan reconciliation, and mutual prosperity.',
    body: 'As the rainy season recedes and the hills turn emerald green, families clean their hearths and prepare special bulls for the communal feast. Elders bless the youth with fresh butter, and community members forgive old disputes. The rhythm of the Gereessa dance fills the evening air, celebrating the triumph of light over dark.'
  },
  {
    id: 'enset',
    title: 'Enset: The Tree That Sustains Generations',
    subtitle: 'The Architectural Backbone of Wolaita Gastronomy',
    excerpt: 'Often called the "Tree Against Hunger," Ensete ventricosum is an ecological wonder cultivated for thousands of years in the southern highlands.',
    body: 'Unlike annual crops that fail during droughts, Enset can withstand harsh seasons. Every part of the plant is treasured: the fermented pulp becomes hearty Kocho, the fine extract yields nutrient-packed Bulla, the fibers weave ropes and mats, and the broad green leaves insulate houses and steam meals.'
  },
  {
    id: 'kawo-tona',
    title: 'The Kingdom of Wolaita & The Legend of Kawo Tona',
    subtitle: 'A Legacy of 50+ Sovereigns and Historic Fortresses',
    excerpt: 'Before modern unification, Wolaita was a powerful, independent sovereign kingdom renowned for its advanced agricultural governance and engineering.',
    body: 'The Kingdom was governed by illustrious dynasties including the Mala and Tigre lines. King Kawo Tona, revered as one of the fiercest and most brilliant military strategists, constructed vast defensive drystone moats and earthen ramparts that can still be explored along the mountain passes today.'
  },
  {
    id: 'shemma',
    title: 'Woven Identity: The Tricolor Shemma Heritage',
    subtitle: 'Geometry, Pride, and the Rhythm of the Loom',
    excerpt: 'The vibrant tricolor bands—Red (courage and passion), Yellow (hope and harvest), and Black (dignity and heritage)—are known throughout Ethiopia.',
    body: 'In weaving quarters across Sodo and Boditi, artisans spin hand-harvested cotton on wooden spindles and handlooms. The resulting Natela shawls and Gabi blankets provide warm comfort in highland nights and are essential garments for weddings and festive assemblies.'
  }
];

const phrases = [
  { wol: 'Saro ditte!', amh: 'እንኳን ደህና መጣችሁ!', eng: 'Welcome! / Peace to you!', phonetic: 'Sah-roh dit-teh' },
  { wol: 'Saro de’ayti?', amh: 'እንደምን አላችሁ?', eng: 'How are you?', phonetic: 'Sah-roh deh-eye-tee' },
  { wol: 'Wodaasi / Wodasso', amh: 'አመሰግናለሁ', eng: 'Thank you very much', phonetic: 'Woh-dah-see' },
  { wol: 'Ne suntsay oone?', amh: 'ስምህ/ሽ ማነው?', eng: 'What is your name?', phonetic: 'Neh soon-tsye oh-neh' },
  { wol: 'Ta suntsay...', amh: 'ስሜ ... ነው', eng: 'My name is...', phonetic: 'Tah soon-tsye...' },
  { wol: 'Aykeettaa', amh: 'ችግር የለም / ይቅርታ', eng: 'No problem / Excuse me', phonetic: 'Eye-kayt-tah' },
  { wol: 'Aybadaa?', amh: 'ስንት ነው?', eng: 'How much is it?', phonetic: 'Eye-bah-dah' },
  { wol: 'Lo’o galla!', amh: 'መልካም ቀን!', eng: 'Have a great day!', phonetic: 'Loh-oh gahl-lah' }
];

const ensetSteps = [
  {
    step: 1,
    title: 'Decortication & Scraping',
    wolName: 'Uttaani Haaxisuwaa',
    desc: 'The pseudo-stem leaf sheaths are stripped and firmly scraped against a wooden beam using a sharpened bamboo tool (*woshesha*) to extract the moist pulp fibers.',
    tip: 'Observe the remarkable hand speed of local matriarchs who pass this technique across generations.'
  },
  {
    step: 2,
    title: 'Pit Fermentation',
    wolName: 'Gatta Oosuwaa',
    desc: 'The scraped pulp and pulverized corms are sealed in underground fermentation pits lined with fresh Enset leaves, weighed down with heavy river stones for 30 to 90 days.',
    tip: 'Natural probiotic yeasts develop a distinctive sourdough-like earthy aroma and high nutrient profile.'
  },
  {
    step: 3,
    title: 'Baking the Kocho Flatbread',
    wolName: 'Qocho Eeysuwaa',
    desc: 'The fermented dough is chopped finely with a knife on a wooden board, wrapped in glossy green enset leaves, and baked over a glowing charcoal griddle.',
    tip: 'Served steaming hot, crisp on the outside and tender inside with rich cardamom and spiced butter.'
  },
  {
    step: 4,
    title: 'Extracting Pure Bulla & Feasting',
    wolName: 'Bullaa Mokkuwaa',
    desc: 'The refined, silky liquid extract is squeezed out and dried into Bulla flour, cooked into a creamy restorative porridge drizzled with niter kibbeh (spiced butter).',
    tip: 'Traditionally shared communally around the family hearth alongside hot Ethiopian highland coffee.'
  }
];

const reviews = [
  {
    id: 'rev-1',
    author: 'Elena Rostova',
    country: 'Switzerland',
    trip: 'Mount Damota Sunrise & Ajora Trek',
    date: 'February 2026',
    rating: 5,
    text: 'Watching the dawn cloud ocean part over the Great Rift Valley from Mount Damota with Tariku was one of the most sublime hiking moments of my life. Authentic, uncommercial, pure magic.'
  },
  {
    id: 'rev-2',
    author: 'Samuel Abera',
    country: 'Addis Ababa, Ethiopia',
    trip: 'Enset Masterclass & Bamboo Tukil Homestay',
    date: 'January 2026',
    rating: 5,
    text: 'As an Ethiopian diaspora visiting with my family, staying in the bamboo Tukil and learning the Enset harvest with Selamawit reconnected us deeply with our roots. The food was unforgettable.'
  },
  {
    id: 'rev-3',
    author: 'Dr. Marcus & Sarah Thorne',
    country: 'United Kingdom',
    trip: '5-Day Grand Wolaita Odyssey',
    date: 'November 2025',
    rating: 5,
    text: 'Ajora Twin Falls felt like an untouched Jurassic gorge. The local guides were punctual, warm, and exceptionally knowledgeable about both birdlife and royal history.'
  }
];

const weatherData = {
  sodo: {
    location: 'Wolaita Sodo Town',
    altitude: '2,100 m',
    currentTemp: '22°C / 72°F',
    condition: 'Partly Sunny & Mild Highland Breeze',
    humidity: '58%',
    rainProb: '10%',
    trailStatus: 'Clear & Open'
  },
  damota: {
    location: 'Mount Damota Summit',
    altitude: '2,900 m',
    currentTemp: '14°C / 57°F',
    condition: 'Crisp Mist & Clear Ridge Visibility',
    humidity: '72%',
    rainProb: '15%',
    trailStatus: 'Optimal for Dawn Hiking'
  }
};

const travelInfo = {
  gettingThere: [
    { mode: 'By Air', desc: 'Daily Ethiopian Airlines flights connect Addis Ababa (ADD) to Arba Minch (AMH, 1.5 hr scenic drive to Sodo) or Hawassa (HWA, 2 hr drive to Sodo).' },
    { mode: 'By Road / Express Bus', desc: 'Direct paved highway via Addis Ababa -> Butajira -> Hossana -> Sodo (approx. 330 km, 5.5 hours drive through spectacular Rift Valley landscapes).' },
    { mode: 'Private Guided Shuttle', desc: 'Custom 4x4 or minivan pickup arranged directly from Addis Ababa Bole Airport or Hawassa lakeside hotels.' }
  ],
  seasons: [
    { title: 'September – November (Prime)', note: 'Lush green landscapes, blooming wildflowers, and the vibrant Gifaataa Festival season.' },
    { title: 'December – March (Dry & Clear)', note: 'Crisp mountain visibility, ideal for Mount Damota trekking, paragliding, and camping.' },
    { title: 'April – August (Green Season)', note: 'Occasional refreshing highland showers, roaring waterfalls with peak flow at Ajora.' }
  ],
  etiquetteTips: [
    'Always accept a warm cup of coffee or tea when invited into a family compound — hospitality is sacred.',
    'Greet elders gently with a slight bow and both hands or forearm support.',
    'Ask for permission with a friendly smile before taking close-up portraits of weavers or market vendors.',
    'Dress modestly when visiting village ceremonies, shrines, or rural homesteads.'
  ]
};

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// REST API Endpoints
app.get('/api/destinations', (_req, res) => res.json(destinations));
app.get('/api/hub', (_req, res) => res.json(hubLocation));
app.get('/api/experiences', (req, res) => {
  const { category } = req.query;
  if (category && category !== 'all') {
    const filtered = experiences.filter(e => e.type.toLowerCase().includes(category.toLowerCase()));
    return res.json(filtered);
  }
  res.json(experiences);
});
app.get('/api/itineraries', (_req, res) => res.json(itineraries));
app.get('/api/guides', (_req, res) => res.json(guides));
app.get('/api/stories', (_req, res) => res.json(stories));
app.get('/api/phrases', (_req, res) => res.json(phrases));
app.get('/api/enset-steps', (_req, res) => res.json(ensetSteps));
app.get('/api/reviews', (_req, res) => res.json(reviews));
app.get('/api/weather', (_req, res) => res.json(weatherData));
app.get('/api/travel-info', (_req, res) => res.json(travelInfo));

// Enquiry Handler with Custom Journey Builder
app.post('/api/enquiries', (req, res) => {
  const {
    name,
    email,
    phone,
    arrivalDate,
    durationDays = 3,
    travelers = 1,
    stayStyle = 'Eco-Lodge & Homestay',
    transportStyle = 'Private 4x4',
    guidePreference = 'Any Certified Host',
    selectedExperienceIds = [],
    specialRequests = ''
  } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required to prepare your journey.' });
  }

  const selectedExpList = experiences.filter(exp => (selectedExperienceIds || []).includes(exp.id));

  // Compute estimate
  const baseDayCostUSD = stayStyle === '100% Rural Homestay' ? 35 : stayStyle === 'Eco-Lodge & Homestay' ? 55 : 75;
  const transportDayUSD = transportStyle === 'Private 4x4' ? 60 : transportStyle === 'Local Minibus & TukTuk' ? 15 : 40;
  const activitiesTotalUSD = selectedExpList.reduce((acc, curr) => acc + (curr.priceUSD || 30), 0);
  const totalEstUSD = ((baseDayCostUSD + transportDayUSD) * Number(durationDays) * Number(travelers)) + (activitiesTotalUSD * Number(travelers));
  const totalEstETB = totalEstUSD * 120;

  const enquiry = {
    id: `VW-${String(enquiries.length + 1).padStart(4, '0')}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : null,
    arrivalDate: arrivalDate || null,
    durationDays: Number(durationDays),
    travelers: Number(travelers),
    stayStyle,
    transportStyle,
    guidePreference,
    selectedExperiences: selectedExpList.map(e => ({ id: e.id, name: e.name, price: e.price, priceUSD: e.priceUSD, priceETB: e.priceETB })),
    estimatedCost: {
      usd: totalEstUSD,
      etb: totalEstETB
    },
    specialRequests: specialRequests.trim(),
    status: 'Confirmed & Assigned to Host',
    createdAt: new Date().toISOString()
  };

  enquiries.push(enquiry);

  res.status(201).json({
    message: `Ameseginalehu / Wodaasi! Your custom journey plan has been registered.`,
    reference: enquiry.id,
    journeySummary: {
      travelerName: enquiry.name,
      travelers: enquiry.travelers,
      durationDays: enquiry.durationDays,
      stayStyle: enquiry.stayStyle,
      transportStyle: enquiry.transportStyle,
      experiencesCount: enquiry.selectedExperiences.length,
      experiences: enquiry.selectedExperiences,
      estimatedTotal: `$${totalEstUSD} USD (~${totalEstETB.toLocaleString()} ETB)`
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ready',
    platform: 'Visit Wolaita Core Engine',
    destinations: destinations.length,
    experiences: experiences.length,
    itineraries: itineraries.length,
    guides: guides.length,
    enquiriesCount: enquiries.length,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Visit Wolaita is live at http://localhost:${PORT}`));
