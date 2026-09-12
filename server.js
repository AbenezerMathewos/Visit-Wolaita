// ============================================================
//  Visit Wolaita — Express API Server
//  FIX: imports are now at the top (was: after middleware)
//  FIX: removed duplicate PORT declaration
//  FIX: removed duplicate /api/health route
//  NEW: gzip compression, proper rate-limiting, CSP header,
//       enquiry persistence to enquiries.json, real validation
// ============================================================

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --------------------------------------------------------------------------
// Enquiry Persistence — load from disk, save on each new submission
// --------------------------------------------------------------------------
const ENQUIRIES_FILE = path.join(__dirname, 'enquiries.json');
let enquiries = [];
try {
  if (fs.existsSync(ENQUIRIES_FILE)) {
    enquiries = JSON.parse(fs.readFileSync(ENQUIRIES_FILE, 'utf8'));
  }
} catch (e) {
  console.warn('[Enquiries] Could not load enquiries.json — starting fresh.');
}

function saveEnquiries() {
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf8');
  } catch (e) {
    console.error('[Enquiries] Failed to save enquiries.json:', e.message);
  }
}

// --------------------------------------------------------------------------
// Static data
// --------------------------------------------------------------------------

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
    summary: 'Ethiopia\'s second-largest lake with distinctive reddish-copper waters, framed by dramatic escarpments. A sanctuary for hundreds of bird species, Nile crocodiles, and freshwater fish.',
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
    highlights: ['Ancient defensive moats and stone masonry', 'Oral history sessions with village elders', 'Panoramic viewpoint across historical battlegrounds', 'Trek along the King\'s ceremonial trails'],
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
    bio: 'Born at the base of Mount Damota, Tariku has guided over 400 travelers across Southern Ethiopia\'s ridges and hidden waterfalls.',
    phone: '+251 91 234 5678'
  },
  {
    id: 'selamawit',
    name: 'Selamawit Kassa',
    role: 'Cultural Historian & Gastronomy Specialist',
    experience: '6 years experience',
    languages: ['English', 'Wolayttatto', 'Amharic'],
    specialties: ['Enset traditions', 'Gifaataa festival lore', 'Artisan weaving trails'],
    bio: 'Selamawit is passionate about preserving Wolaita\'s intangible heritage, empowering female agricultural cooperatives and homestay families.',
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
  { wol: 'Saro de\'ayti?', amh: 'እንደምን አላችሁ?', eng: 'How are you?', phonetic: 'Sah-roh deh-eye-tee' },
  { wol: 'Wodaasi / Wodasso', amh: 'አመሰግናለሁ', eng: 'Thank you very much', phonetic: 'Woh-dah-see' },
  { wol: 'Ne suntsay oone?', amh: 'ስምህ/ሽ ማነው?', eng: 'What is your name?', phonetic: 'Neh soon-tsye oh-neh' },
  { wol: 'Ta suntsay...', amh: 'ስሜ ... ነው', eng: 'My name is...', phonetic: 'Tah soon-tsye...' },
  { wol: 'Aykeettaa', amh: 'ችግር የለም / ይቅርታ', eng: 'No problem / Excuse me', phonetic: 'Eye-kayt-tah' },
  { wol: 'Aybadaa?', amh: 'ስንት ነው?', eng: 'How much is it?', phonetic: 'Eye-bah-dah' },
  { wol: 'Lo\'o galla!', amh: 'መልካም ቀን!', eng: 'Have a great day!', phonetic: 'Loh-oh gahl-lah' }
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

// Weather: static fallback — replace with real OpenWeatherMap data when API key is set
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

// --------------------------------------------------------------------------
// Smart Studio: Trails, Panoramas, Cultural Calendar
// --------------------------------------------------------------------------

const trailGuides = [
  {
    id: 'damota-summit',
    name: 'Mount Damota Summit & Afro-Alpine Ridge',
    distance: '8.4 km round-trip',
    elevationGain: '+800 m',
    startElevation: 2100,
    peakElevation: 2900,
    duration: '4.5 – 5.5 hours',
    difficulty: 'Challenging',
    terrain: 'Volcanic singletrack, bamboo corridors, afro-alpine rocky crest',
    waterPoints: ['Sodo Trailhead', 'Midway Spring (km 2.4)'],
    highlights: ['Mochena Borago cave junction', 'Giant lobelia fields', '360° Great Rift Valley & Lake Abaya panorama'],
    elevationProfile: [
      { km: 0.0, alt: 2100, label: 'Sodo Trailhead' },
      { km: 1.2, alt: 2280, label: 'Mochena Cave Fork' },
      { km: 2.4, alt: 2450, label: 'Bamboo Forest Rest Halt' },
      { km: 3.5, alt: 2680, label: 'Afro-Alpine Heath Boundary' },
      { km: 4.2, alt: 2900, label: 'Mount Damota Summit Peak' },
      { km: 5.5, alt: 2650, label: 'Eastern Ridge Descent' },
      { km: 7.0, alt: 2320, label: 'Valley View Spring' },
      { km: 8.4, alt: 2100, label: 'Sodo Hub Finish' }
    ],
    gpxData: {
      trailName: 'Mount Damota Summit Ascent',
      latMin: 6.8583, latMax: 6.9142,
      lngMin: 37.7611, lngMax: 37.7889,
      pointsCount: 8
    }
  },
  {
    id: 'ajora-canyon',
    name: 'Ajora Twin Falls Rainforest Canyon Descent',
    distance: '6.2 km circuit',
    elevationGain: '±280 m',
    startElevation: 1750,
    peakElevation: 1750,
    minElevation: 1470,
    duration: '3.5 – 4.5 hours',
    difficulty: 'Active Canyon',
    terrain: 'Lush canyon steps, wet riverbed boulders, rainforest footpaths',
    waterPoints: ['Boloso Bombe Eco-Post', 'Riverside Ranger Station'],
    highlights: ['Twin 100m cascading waterfalls', 'Colobus monkey sightings', 'Natural basalt amphitheater & mist spray'],
    elevationProfile: [
      { km: 0.0, alt: 1750, label: 'Boloso Bombe Trailhead' },
      { km: 1.0, alt: 1680, label: 'Upper Canyon Viewpoint' },
      { km: 2.1, alt: 1540, label: 'Fern Forest Switchbacks' },
      { km: 3.1, alt: 1470, label: 'Ajora Twin Basin & Mist Pool' },
      { km: 4.2, alt: 1560, label: 'Soke River Crossing' },
      { km: 5.2, alt: 1670, label: 'Hornbill Overhang' },
      { km: 6.2, alt: 1750, label: 'Eco-Post Return' }
    ],
    gpxData: {
      trailName: 'Ajora Twin Falls Canyon Expedition',
      latMin: 7.0500, latMax: 7.0833,
      lngMin: 37.5000, lngMax: 37.5167,
      pointsCount: 7
    }
  },
  {
    id: 'tona-fortress',
    name: 'Kawo Tona Ancient Fortress & Defensive Moats',
    distance: '5.0 km heritage loop',
    elevationGain: '+160 m',
    startElevation: 2050,
    peakElevation: 2210,
    duration: '2.5 – 3 hours',
    difficulty: 'Moderate Heritage',
    terrain: 'Historical earthworks, ancient drystone trenches, village farm paths',
    waterPoints: ['Fortress Entrance Gate', 'Elders Council Spring'],
    highlights: ['500-year-old defensive moats', 'Royal lookout post', 'Panoramic views over southern farmlands'],
    elevationProfile: [
      { km: 0.0, alt: 2050, label: 'Outer Defensive Earthworks' },
      { km: 1.2, alt: 2110, label: 'Drystone Rampart Gate' },
      { km: 2.5, alt: 2210, label: 'Kawo Tona Command Crest' },
      { km: 3.8, alt: 2140, label: 'Clan Assembly Grove' },
      { km: 5.0, alt: 2050, label: 'Heritage Center Loop End' }
    ],
    gpxData: {
      trailName: 'Kawo Tona Fortress Historic Circuit',
      latMin: 6.8100, latMax: 6.8350,
      lngMin: 37.7000, lngMax: 37.7200,
      pointsCount: 5
    }
  }
];

const virtualPanoramas = [
  {
    id: 'damota-summit',
    name: 'Mount Damota Summit (2,900 m)',
    tagline: 'The Sacred Roof & Great Rift Valley Clouds',
    category: 'Highland Peak',
    image: 'walaita1.jpeg',
    ambientSound: 'highland-wind',
    elevation: '2,900 m',
    lightingModes: ['Dawn Cloud Inversion', 'Golden Sun', 'Crisp Midday', 'Starlight Night'],
    hotspots: [
      { id: 'hs-1', x: 28, y: 44, title: 'Lake Abaya Copper Shimmer', desc: 'On clear mornings, gaze 45 km south to the shimmering reddish waters of Lake Abaya framing the Gamo highlands.' },
      { id: 'hs-2', x: 64, y: 58, title: 'Afro-Alpine Giant Lobelia', desc: 'Endemic giant heather and afro-alpine herbs that thrive exclusively on the high-altitude volcanic soils of Damota.' },
      { id: 'hs-3', x: 84, y: 32, title: 'Dawn Inversion Viewpoint', desc: 'The prime vantage point to watch clouds blanket the valley floor before morning sun rays pierce the mist.' }
    ],
    photoTips: 'Use a wide-angle lens (16-24mm) at 06:15 AM for dawn cloud blankets. A polarizing filter enhances deep blue highland skies.'
  },
  {
    id: 'ajora-canyon',
    name: 'Ajora Twin Falls Canyon',
    tagline: '100-Meter Cascades & Prehistoric Rainforest',
    category: 'Waterfalls & Gorge',
    image: 'wolaita.jpeg',
    ambientSound: 'waterfall-roar',
    elevation: '1,750 m',
    lightingModes: ['Morning Rainbow Mist', 'Tropical Midday', 'Forest Dusklight'],
    hotspots: [
      { id: 'hs-4', x: 32, y: 36, title: 'Soke Cascade (Left Waterfall)', desc: 'The western river branch plunging 100 meters down black volcanic basalt into the prehistoric gorge.' },
      { id: 'hs-5', x: 59, y: 41, title: 'Ajancho Cascade (Right Waterfall)', desc: 'The roaring eastern sister fall whose constant mist feeds rare giant ferns and wild orchids.' },
      { id: 'hs-6', x: 79, y: 24, title: 'Colobus & Hornbill Canopy', desc: 'Lush fig and podocarpus trees home to silvery-cheeked hornbills and mantled guereza monkeys.' }
    ],
    photoTips: 'Bring an ND filter (ND64/ND1000) for smooth long-exposure water textures. Keep a lens cloth handy for canyon spray.'
  },
  {
    id: 'mochena-caves',
    name: 'Mochena Borago Archaeological Rockshelter',
    tagline: '50,000 Years of Middle Stone Age Human Innovation',
    category: 'Archaeology & Heritage',
    image: 'walaita1.jpeg',
    ambientSound: 'cave-echoes',
    elevation: '2,200 m',
    lightingModes: ['Morning Amber Shafts', 'Sheltered Shadow', 'Hearthlight Night'],
    hotspots: [
      { id: 'hs-7', x: 38, y: 52, title: 'Obsidian Tool Stratigraphy', desc: 'World-renowned archaeological excavation layers uncovering obsidian bladelets from 50,000+ years ago.' },
      { id: 'hs-8', x: 68, y: 30, title: 'Natural Basalt Overhang Dome', desc: 'Massive volcanic rock canopy that sheltered ancient hunter-gatherers during volcanic and glacial eras.' }
    ],
    photoTips: 'Bracket 3 exposures (+-2 EV) or use HDR mode to capture both the shadowed cave interior and bright valley backdrop.'
  },
  {
    id: 'tukil-homestead',
    name: 'Traditional Bamboo Tukil Compound',
    tagline: 'The Sacred Architecture of Wolaita Living',
    category: 'Culture & Living Heritage',
    image: 'wolaita.jpeg',
    ambientSound: 'village-evening',
    elevation: '2,050 m',
    lightingModes: ['Warm Morning Sun', 'Afternoon Enset Shade', 'Evening Campfire Glow'],
    hotspots: [
      { id: 'hs-9', x: 32, y: 46, title: 'Woven Bamboo Tukil Dome', desc: 'Constructed entirely from local bamboo with zero nails, featuring natural thermal insulation that stays warm on mountain nights.' },
      { id: 'hs-10', x: 72, y: 64, title: 'Thriving Enset Micro-Farm', desc: 'The green sanctuary surrounding every homestead, providing food, building thatch, and shade.' }
    ],
    photoTips: 'Photograph between 4:30 PM and 5:30 PM for warm golden sidelight revealing the intricate woven bamboo patterns.'
  }
];

const culturalCalendar = {
  gifaataa: {
    name: 'Gifaataa: Wolaita New Year & Reconciliation Festival',
    status: 'UNESCO Intangible Cultural Heritage',
    season: 'Late September (Annual)',
    nextDates: 'September 24 – 27, 2026',
    coreRituals: [
      { name: 'Shukhiya (Communal Blessing)', desc: 'Families prepare special bulls, clean compound gates, and receive elder butter blessings.' },
      { name: 'Gereessa (Dynamic Warrior Dance)', desc: 'Thousands gather in vibrant tricolor attire with rhythmic bamboo horns and drums.' },
      { name: 'Gifaataa Feast of Peace', desc: 'Communal sharing of tender Kocho, spiced butter Bulla, and clan forgiveness covenants.' }
    ]
  },
  agrarianSeasons: [
    { month: 'September', title: 'Gifaataa New Year & Blooming Meadows', activity: 'UNESCO celebrations, Gereessa dances, greenest landscape photography', icon: '🎉' },
    { month: 'October', title: 'Highland Coffee Harvest & Honey Gathering', activity: 'Single-origin coffee picking and traditional tree-hive forest honey extraction', icon: '☕' },
    { month: 'November', title: 'Tricolor Shemma Textile Fairs', activity: 'Open-air artisan weaving markets in Sodo, Boditi, and Areka', icon: '🧵' },
    { month: 'December – February', title: 'Peak Trekking & Paragliding Season', activity: 'Crisp clear skies on Mount Damota, sunrise expeditions, Bilbo hot springs retreats', icon: '⛰️' },
    { month: 'March – May', title: 'Spring Soil Awakening & Enset Planting', activity: 'Traditional homestead Enset decortication, Bulla extracting workshops', icon: '🌱' },
    { month: 'June – August', title: 'Waterfall Volume Surge & Roaring Canyons', activity: 'Ajora Falls at maximum roar, lush rainforest canyon photography', icon: '💧' }
  ],
  shemmaSymbolism: {
    title: 'The Sacred Tricolor Palette of Wolaita',
    colors: [
      { name: 'Zo\'o (Red)', meaning: 'Courage, vitality, the warm hearth fire, and sacrificial royal heritage.', hex: '#c85a32' },
      { name: 'Karetta (Yellow)', meaning: 'Hope, sunbeams over Mount Damota, ripening grains, and communal prosperity.', hex: '#e0a93b' },
      { name: 'Kareensa (Black)', meaning: 'Dignity, fertile volcanic dark loam soil, deep wisdom, and sovereign fortitude.', hex: '#14241d' }
    ]
  }
};

// --------------------------------------------------------------------------
// AI Concierge Knowledge Engine & Persona Planner
// --------------------------------------------------------------------------
function handleConciergeQuery(payload) {
  const { persona = 'trekker', query = '', days = 3, travelers = 2 } = payload || {};
  const q = (query || '').toLowerCase().trim();

  const personas = {
    trekker: {
      title: 'Highland Trekker & Summit Pioneer',
      badge: 'Active & Adventure',
      summary: 'Designed for hikers seeking mountain sunrises, dramatic canyon descents, and pure volcanic wilderness.',
      expIds: ['damota-sunrise', 'ajora-canyon-trek', 'bilbo-spa'],
      itinerary: [
        { day: 1, title: 'Mount Damota Dawn Summit & Mochena Borago Caves', morning: 'Dawn ascent to 2,900m summit with mountain coffee', afternoon: 'Explore 50,000-year-old Paleolithic rockshelter' },
        { day: 2, title: 'Ajora Twin Falls 100m Gorge Descent', morning: 'Trek through rainforest canyon to the foot of twin cascades', afternoon: 'Picnic beside mist pools and hornbill birdwatching' },
        { day: 3, title: 'Bilbo Geothermal Hot Springs & Recovery', morning: 'Soak in mineral-rich volcanic thermal baths', afternoon: 'Traditional herbal tea and return to Sodo hub' }
      ],
      gear: ['Sturdy hiking boots with grip', 'Rain shell & lightweight fleece', 'Refillable water canteen', 'Sun hat & sunscreen'],
      guideId: 'tariku'
    },
    heritage: {
      title: 'Royal Kingdom & Living Lore Historian',
      badge: 'Culture & Archaeology',
      summary: 'Delve into 50+ sovereigns of the ancient Kingdom of Wolaita, defensive earthworks, and UNESCO traditions.',
      expIds: ['gifataa-culture', 'shemma-weaving', 'homestay-tukil'],
      itinerary: [
        { day: 1, title: 'King Kawo Tona Ramparts & City of 7 Gates', morning: 'Trek the 500-year-old defensive moats and stone fortifications', afternoon: 'Oral history session with village elders' },
        { day: 2, title: 'UNESCO Gifaataa Traditions & Gereessa Workshop', morning: 'Learn traditional Gereessa dance rhythms and dress in tricolor shemma', afternoon: 'Feast of reconciliation with local community' },
        { day: 3, title: 'Cotton Loom Masterclass & Bamboo Tukil Homestay', morning: 'Hands-on weaving with master artisans in Sodo', afternoon: 'Evening campfire lore inside authentic bamboo dome cottage' }
      ],
      gear: ['Comfortable walking shoes', 'Modest clothing covering shoulders', 'Notebook or field journal', 'Camera with portrait lens'],
      guideId: 'mathewos'
    },
    gastronomy: {
      title: 'Enset Culinary & Agrarian Soul',
      badge: 'Food & Farming',
      summary: 'Experience the "Tree Against Hunger," farm-to-table Enset decortication, Bulla porridge, and single-origin coffee rituals.',
      expIds: ['enset-masterclass', 'homestay-tukil', 'damota-sunrise'],
      itinerary: [
        { day: 1, title: 'The Enset Homestead: Decortication to Feast', morning: 'Hands-on leaf scraping with bamboo woshesha tool', afternoon: 'Bake crisp Kocho flatbread over clay griddle with spiced butter' },
        { day: 2, title: 'Highland Coffee Roasting & Bamboo Homestay', morning: 'Harvest and roast organic single-origin coffee beans over charcoal', afternoon: 'Tasting silky Bulla porridge and overnight in family compound' },
        { day: 3, title: 'Sodo Market & Traditional Gastronomy Tour', morning: 'Explore spices, Enset fermentations, and herbal teas at Sodo market', afternoon: 'Celebratory banquet with local matriarchs' }
      ],
      gear: ['Apron/comfortable cooking clothes', 'Appetite for rich spiced butter & sourdough aromas', 'Slip-on shoes for homestays'],
      guideId: 'selamawit'
    },
    artisan: {
      title: 'Tricolor Textile & Craft Collector',
      badge: 'Crafts & Community',
      summary: 'Meet master cotton spinners, foot-pedal loom weavers, and traditional bamboo architects.',
      expIds: ['shemma-weaving', 'gifataa-culture', 'enset-masterclass'],
      itinerary: [
        { day: 1, title: 'Sodo Weaving Quarter & Cotton Spinning', morning: 'Discover how raw cotton is cleaned, carded, and hand-spun', afternoon: 'Learn the loom rhythm and create your own tricolor coaster' },
        { day: 2, title: 'Bamboo Tukil Architecture Masterclass', morning: 'Observe master bamboo carpenters weave living dome cottages', afternoon: 'Traditional homestay tea & village music' },
        { day: 3, title: 'Artisan Cooperative Market & Gifaataa Attire', morning: 'Direct purchase of authentic certified Natela shawls and Gabi blankets', afternoon: 'Farewell coffee ceremony with artisan cooperative' }
      ],
      gear: ['Extra luggage space for authentic textiles', 'Cash (ETB) for direct cooperative purchases', 'Camera for artisan portraits (always ask permission)'],
      guideId: 'selamawit'
    },
    naturalist: {
      title: 'Rift Valley Birding & Slow Naturalist',
      badge: 'Wildlife & Lakes',
      summary: 'Traverse shimmering copper lakes, volcanic hot springs, and high-altitude afro-alpine bird sanctuaries.',
      expIds: ['damota-sunrise', 'bilbo-spa', 'ajora-canyon-trek'],
      itinerary: [
        { day: 1, title: 'Lake Abaya Wetlands & Canoe Excursion', morning: 'Morning boat ride among pelicans, fish eagles, and Nile monitors', afternoon: 'Fresh grilled tilapia by the reddish copper shoreline' },
        { day: 2, title: 'Bilbo Geothermal Springs & Botanical Forest', morning: 'Soak in warm mineral pools beneath ancient wild fig trees', afternoon: 'Sunbird and weaver bird spotting in lush forest groves' },
        { day: 3, title: 'Mount Damota High Ridge Birdwatching', morning: 'Spot rare Lammergeier bearded vultures soaring on morning thermals', afternoon: 'Panoramic sunset view across the Great Rift Valley' }
      ],
      gear: ['Binoculars (8x42 or 10x42)', 'Telephoto camera lens (200-400mm)', 'Birding field guide / app', 'Swimwear & towel for hot springs'],
      guideId: 'mathewos'
    }
  };

  const selectedPersona = personas[persona] || personas.trekker;

  let answer = '';
  if (q.includes('weather') || q.includes('rain') || q.includes('season') || q.includes('when to visit')) {
    answer = 'The best time to visit Wolaita is between September and March. September brings the breathtaking green landscapes and the UNESCO Gifaataa Festival. December to February offers crystal-clear skies for Mount Damota summit treks.';
  } else if (q.includes('get there') || q.includes('flight') || q.includes('bus') || q.includes('addis')) {
    answer = 'You can reach Wolaita Sodo easily from Addis Ababa: either take a 1-hour Ethiopian Airlines flight to Arba Minch (AMH) or Hawassa (HWA) followed by a 1.5–2 hr scenic drive, or enjoy a direct 5.5-hour drive via the Butajira-Hossana scenic highway.';
  } else if (q.includes('food') || q.includes('vegan') || q.includes('vegetarian') || q.includes('enset') || q.includes('kocho')) {
    answer = 'Wolaita cuisine is exceptionally welcoming for all diets! Kocho (fermented Enset flatbread) and Bulla porridge are 100% plant-based superfoods. For vegetarians and vegans, Enset is prepared with spiced highland greens (gomen), lentils, and local herbs.';
  } else if (q.includes('safe') || q.includes('safety') || q.includes('water')) {
    answer = 'Wolaita is one of the most peaceful and hospitable zones in Southern Ethiopia. Local communities revere travelers as honored guests. For drinking, bottled water or filtered boiled highland teas are recommended.';
  } else if (q.includes('wear') || q.includes('dress') || q.includes('clothes') || q.includes('etiquette')) {
    answer = 'Modest, layered clothing is best. Mornings and evenings in Sodo and Mount Damota (2,100m–2,900m) can be crisp (12°C–15°C), while afternoons are pleasantly warm (22°C–25°C). For village ceremonies and homesteads, modest wear covering shoulders and knees is respectful.';
  } else {
    answer = `Based on your interest in ${selectedPersona.title}, I have curated a personalized ${days}-day expedition maximizing authentic local connections, certified community guides, and transparent pricing.`;
  }

  const matchedExperiences = experiences.filter(e => selectedPersona.expIds.includes(e.id));
  const activitiesTotalUSD = matchedExperiences.reduce((sum, e) => sum + (e.priceUSD || 35), 0);
  const lodgingTransportTotalUSD = (55 + 60) * Number(days);
  const totalUSD = (lodgingTransportTotalUSD + activitiesTotalUSD) * Number(travelers);
  const totalETB = totalUSD * 120;

  return {
    personaKey: persona,
    personaTitle: selectedPersona.title,
    badge: selectedPersona.badge,
    summary: selectedPersona.summary,
    conciergeAnswer: answer,
    itineraryDays: selectedPersona.itinerary,
    recommendedExperiences: matchedExperiences,
    packingGear: selectedPersona.gear,
    assignedGuide: guides.find(g => g.id === selectedPersona.guideId) || guides[0],
    pricing: {
      days: Number(days),
      travelers: Number(travelers),
      totalUSD,
      totalETB,
      perTravelerUSD: Math.round(totalUSD / Number(travelers))
    }
  };
}

// --------------------------------------------------------------------------
// Input helpers
// --------------------------------------------------------------------------
function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

// --------------------------------------------------------------------------
// Middleware — order matters!
// --------------------------------------------------------------------------

// 1. Gzip compression
app.use(compression());

// 2. Parse JSON bodies
app.use(express.json());

// 3. CORS — restrict to your domain in production via ALLOWED_ORIGIN env var
app.use((_req, res, next) => {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 4. Security headers (including CSP)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://*.tile.openstreetmap.org https://*.google.com https://*.googleapis.com",
      "connect-src 'self' https://api.openweathermap.org",
      "frame-src https://earth.google.com"
    ].join('; ')
  );
  next();
});

// 5. Custom API version & response-time headers
app.use((_req, res, next) => {
  res.setHeader('X-API-Version', '1.1.0');
  res.setHeader('X-Powered-By', 'Visit Wolaita API');
  const _t = Date.now();
  // Use 'finish' only for console logging — not for setting headers (headers already sent by then)
  res.on('finish', () => {
    console.debug('[RT]', Date.now() - _t, 'ms', _req.method, _req.url);
  });
  next();
});

// 6. Request logger
app.use((req, _res, next) => {
  console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.url);
  next();
});

// 7. Rate limiting (express-rate-limit — no memory leak)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', status: 429 }
});
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many enquiry submissions', status: 429 }
});
app.use('/api/', apiLimiter);

// 8. Static files — NOTE: use nginx/CDN in production
app.use(express.static(__dirname, {
  maxAge: '1d',
  etag: true,
  setHeaders(res, filePath) {
    // Long cache for versioned assets
    if (/\.(jpeg|jpg|png|webp|css|js|ico)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// --------------------------------------------------------------------------
// REST API Endpoints
// --------------------------------------------------------------------------

app.get('/api/destinations', (_req, res) => res.json(destinations));
app.get('/api/destinations/:id', (req, res) => {
  const dest = destinations.find(d => d.id === req.params.id);
  if (!dest) return res.status(404).json({ error: 'Destination not found' });
  res.json(dest);
});
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

// Smart Studio
app.get('/api/trails', (_req, res) => res.json(trailGuides));
app.get('/api/panoramas', (_req, res) => res.json(virtualPanoramas));
app.get('/api/cultural-calendar', (_req, res) => res.json(culturalCalendar));

// AI Concierge
app.post('/api/ai/concierge', (req, res) => {
  const result = handleConciergeQuery(req.body);
  res.json(result);
});

// Stats
app.get('/api/stats', (_req, res) => res.json({
  destinations: destinations.length,
  experiences: experiences.length,
  guides: guides.length,
  languages: 3,
  mapLayers: 3,
  trails: trailGuides.length,
  panoramas: virtualPanoramas.length
}));

// Enquiry count
app.get('/api/enquiry/count', (_req, res) => res.json({ count: enquiries.length, lastUpdated: new Date().toISOString() }));

// --------------------------------------------------------------------------
// Enquiry Submission — with validation + disk persistence
// --------------------------------------------------------------------------
app.post('/api/enquiries', enquiryLimiter, (req, res) => {
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

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ message: 'A valid name is required.' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }
  const numDays = Number(durationDays);
  const numTravelers = Number(travelers);
  if (!Number.isInteger(numDays) || numDays < 1 || numDays > 30) {
    return res.status(400).json({ message: 'Duration must be between 1 and 30 days.' });
  }
  if (!Number.isInteger(numTravelers) || numTravelers < 1 || numTravelers > 50) {
    return res.status(400).json({ message: 'Travelers must be between 1 and 50.' });
  }

  const selectedExpList = experiences.filter(exp => (selectedExperienceIds || []).includes(exp.id));

  const baseDayCostUSD = stayStyle === '100% Rural Homestay' ? 35 : stayStyle === 'Eco-Lodge & Homestay' ? 55 : 75;
  const transportDayUSD = transportStyle === 'Private 4x4' ? 60 : transportStyle === 'Local Minibus & TukTuk' ? 15 : 40;
  const activitiesTotalUSD = selectedExpList.reduce((acc, curr) => acc + (curr.priceUSD || 30), 0);
  const totalEstUSD = ((baseDayCostUSD + transportDayUSD) * numDays * numTravelers) + (activitiesTotalUSD * numTravelers);
  const totalEstETB = totalEstUSD * 120;

  const enquiry = {
    id: `VW-${String(enquiries.length + 1).padStart(4, '0')}`,
    name: sanitize(name),
    email: email.trim().toLowerCase(),
    phone: phone ? sanitize(phone, 30) : null,
    arrivalDate: arrivalDate || null,
    durationDays: numDays,
    travelers: numTravelers,
    stayStyle,
    transportStyle,
    guidePreference,
    selectedExperiences: selectedExpList.map(e => ({ id: e.id, name: e.name, price: e.price, priceUSD: e.priceUSD, priceETB: e.priceETB })),
    estimatedCost: { usd: totalEstUSD, etb: totalEstETB },
    specialRequests: sanitize(specialRequests, 1000),
    status: 'Confirmed & Assigned to Host',
    createdAt: new Date().toISOString()
  };

  enquiries.push(enquiry);
  saveEnquiries(); // Persist to disk

  res.status(201).json({
    message: 'Ameseginalehu / Wodaasi! Your custom journey plan has been registered.',
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

// --------------------------------------------------------------------------
// Health Check (single, rich version)
// --------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'Visit Wolaita Core Engine',
    version: '1.1.0',
    uptime: Math.floor(process.uptime()) + 's',
    destinations: destinations.length,
    experiences: experiences.length,
    itineraries: itineraries.length,
    guides: guides.length,
    trails: trailGuides.length,
    panoramas: virtualPanoramas.length,
    enquiriesCount: enquiries.length,
    timestamp: new Date().toISOString()
  });
});

// robots.txt & sitemap.xml
app.get('/robots.txt', (_req, res) => { res.type('text/plain'); res.sendFile(path.join(__dirname, 'robots.txt')); });
app.get('/sitemap.xml', (_req, res) => { res.type('application/xml'); res.sendFile(path.join(__dirname, 'sitemap.xml')); });

// --------------------------------------------------------------------------
// 404 & Global Error Handlers (must be last)
// --------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'Resource does not exist.', status: 404 });
});

app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error', status: err.status || 500 });
});

// --------------------------------------------------------------------------
// Start Server
// --------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const isDev = process.env.NODE_ENV !== 'production';

app.listen(PORT, HOST, () => {
  console.log(`✦ Visit Wolaita is live at http://localhost:${PORT}`);
  if (isDev) console.log('[Visit Wolaita] Running in development mode');
  console.log(`[Enquiries] ${enquiries.length} enquiry/ies loaded from disk.`);
});

process.on('unhandledRejection', (r) => console.error('[Unhandled Rejection]', r));
process.on('uncaughtException', (e) => { console.error('[Uncaught Exception]', e.message); process.exit(1); });
process.on('SIGTERM', () => { console.log('SIGTERM: shutting down gracefully'); process.exit(0); });
process.on('SIGINT',  () => { console.log('SIGINT: shutting down gracefully');  process.exit(0); });
