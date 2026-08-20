/**
 * Visit Wolaita — Interactive Geospatial Tourism Platform Engine
 */

// Global State
const state = {
  destinations: [],
  experiences: [],
  itineraries: [],
  guides: [],
  stories: [],
  phrases: [],
  ensetSteps: [],
  reviews: [],
  weatherData: null,
  travelInfo: null,
  hubLocation: {
    id: 'sodo-hub',
    name: 'Wolaita Sodo (City Center)',
    lat: 6.8583,
    lng: 37.7611,
    elevation: '2,100 m',
    googleEarthUrl: 'https://earth.google.com/web/@6.8583,37.7611,2100a,4000d,35y,0h,45t,0r'
  },
  selectedExperienceIds: new Set(),
  activeStoryId: null,
  activeEnsetStep: 1,
  activeLandmarkId: 'damota',
  currency: 'USD', // 'USD' | 'ETB'
  exchangeRate: 120, // 1 USD = 120 ETB
  isAudioPlaying: false,
  audioCtx: null,
  audioNodes: [],
  currentLang: 'en',
  
  // Real Leaflet Map Instances
  leafletMap: null,
  mapMarkers: {},
  mapRoutePolyline: null,
  currentTileLayer: null,
  tileLayers: {}
};

// Language Dictionary for Hero & Key Elements
const i18n = {
  en: {
    eyebrow: 'Southern Ethiopia · 06°50′ N · Kingdom of Wolaita',
    headline: 'Come for the<br><i>landscape.</i><br>Stay for the soul.',
    intro: 'Wolaita is a highland sanctuary of emerald volcanic ridges, cascading twin waterfalls, UNESCO living traditions, and generous tables centered around the ancient sacred Enset. Let verified local hosts shape your unhurried journey.'
  },
  wol: {
    eyebrow: 'Tohossa Itiyoophiyaa · Wolaitta Dambaa',
    headline: 'Biittaa giyyoorissaw<br><i>yiite.</i><br>Asatethaa saron de\'ite.',
    intro: 'Wolaitti biittay madduwaa qan\'ishshi, Damota zawaa, Gifaataa maaduwaa, qassi Uttaani wodiyaa laamettida dambaa. Nu son saron mokkettiite!'
  },
  am: {
    eyebrow: 'ደቡብ ኢትዮጵያ · 06°50′ N · የዎላይታ ምድር',
    headline: 'በተፈጥሮ ውበቱ<br><i>ይመሰጡ፤</i><br>በፍቅሩና በባህሉ ይቆዩ።',
    intro: 'ዎላይታ ለምለም ተራሮች፣ ድንቅ ፏፏቴዎች፣ የዩኔስኮ ቅርስ የሆነው ጊፋታ በዓል እና የታታሪ ህዝቦች መገኛ ናት። በአካባቢው አስጎብኚዎች ልዩ ጉዞዎን ዛሬውኑ ይጀምሩ።'
  }
};

// DOM Elements
const destinationsGrid = document.querySelector('#destinationsGrid');
const experienceGrid = document.querySelector('#experienceGrid');
const itinerariesContainer = document.querySelector('#itinerariesContainer');
const storyTabs = document.querySelector('#storyTabs');
const storyBodyCard = document.querySelector('#storyBodyCard');
const phrasebookGrid = document.querySelector('#phrasebookGrid');
const guidesGrid = document.querySelector('#guidesGrid');
const reviewsGrid = document.querySelector('#reviewsGrid');
const travelInfoGrid = document.querySelector('#travelInfoGrid');
const journeyForm = document.querySelector('#journeyForm');
const formMessage = document.querySelector('#formMessage');
const journeyCountBadge = document.querySelector('#journeyCount');
const mobileJourneyCount = document.querySelector('#mobileJourneyCount');
const basketCountEl = document.querySelector('#basketCount');
const selectedItemsList = document.querySelector('#selectedItemsList');
const soundButton = document.querySelector('#soundButton');
const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');
const detailModal = document.querySelector('#detailModal');
const modalBody = document.querySelector('#modalBody');
const modalCloseBtn = document.querySelector('#modalCloseBtn');
const confirmationModal = document.querySelector('#confirmationModal');
const confirmationBody = document.querySelector('#confirmationBody');
const confirmCloseBtn = document.querySelector('#confirmCloseBtn');
const experienceSearch = document.querySelector('#experienceSearch');

// Drawer Elements
const journeyDrawer = document.querySelector('#journeyDrawer');
const drawerOverlay = document.querySelector('#drawerOverlay');
const journeyDrawerBtn = document.querySelector('#journeyDrawerBtn');
const mobileDrawerTrigger = document.querySelector('#mobileDrawerTrigger');
const drawerCloseBtn = document.querySelector('#drawerCloseBtn');
const drawerBasketItems = document.querySelector('#drawerBasketItems');
const drawerCostSummary = document.querySelector('#drawerCostSummary');
const drawerClearBtn = document.querySelector('#drawerClearBtn');

// Map Elements
const inspBadge = document.querySelector('#inspBadge');
const inspTitle = document.querySelector('#inspTitle');
const inspTagline = document.querySelector('#inspTagline');
const inspDesc = document.querySelector('#inspDesc');
const inspElevation = document.querySelector('#inspElevation');
const inspDistance = document.querySelector('#inspDistance');
const inspBestTime = document.querySelector('#inspBestTime');
const inspDifficulty = document.querySelector('#inspDifficulty');
const inspExploreBtn = document.querySelector('#inspExploreBtn');
const inspGoogleEarthLink = document.querySelector('#inspGoogleEarthLink');
const recenterMapBtn = document.querySelector('#recenterMapBtn');

// Enset Lab Elements
const ensetStepNav = document.querySelector('#ensetStepNav');
const ensetStepContent = document.querySelector('#ensetStepContent');
const ensetProgressFill = document.querySelector('#ensetProgressFill');
const prevEnsetStep = document.querySelector('#prevEnsetStep');
const nextEnsetStep = document.querySelector('#nextEnsetStep');

// Calculator Elements
const calcTravelers = document.querySelector('#calcTravelers');
const calcTravelersVal = document.querySelector('#calcTravelersVal');
const calcDays = document.querySelector('#calcDays');
const calcDaysVal = document.querySelector('#calcDaysVal');
const calcLodging = document.querySelector('#calcLodging');
const calcTransport = document.querySelector('#calcTransport');
const calcActCount = document.querySelector('#calcActCount');
const calcTotalPrimary = document.querySelector('#calcTotalPrimary');
const calcTotalSecondary = document.querySelector('#calcTotalSecondary');
const calcPerPerson = document.querySelector('#calcPerPerson');
const calcBreakdownLodging = document.querySelector('#calcBreakdownLodging');
const calcBreakdownTransport = document.querySelector('#calcBreakdownTransport');
const calcBreakdownActivities = document.querySelector('#calcBreakdownActivities');

// Initialize Platform
async function init() {
  loadSavedJourney();
  setupEventListeners();
  await Promise.all([
    fetchWeather(),
    fetchDestinations(),
    fetchExperiences(),
    fetchItineraries(),
    fetchEnsetSteps(),
    fetchStories(),
    fetchPhrases(),
    fetchGuides(),
    fetchReviews(),
    fetchTravelInfo()
  ]);
  initRealLeafletMap();
  updateCalculator();
}

// --------------------------------------------------------------------------
// API Fetchers
// --------------------------------------------------------------------------

async function fetchWeather() {
  try {
    const res = await fetch('/api/weather');
    state.weatherData = await res.json();
    if (state.weatherData && state.weatherData.sodo) {
      const s = state.weatherData.sodo;
      const barTemp = document.querySelector('#barTemp');
      const barCond = document.querySelector('#barCondition');
      if (barTemp) barTemp.textContent = s.currentTemp.split('/')[0].trim();
      if (barCond) barCond.textContent = s.condition;
    }
  } catch (err) {
    console.error('Weather fetch error:', err);
  }
}

async function fetchDestinations() {
  try {
    const res = await fetch('/api/destinations');
    state.destinations = await res.json();
    renderDestinations(state.destinations);
  } catch (err) {
    console.error('Error fetching destinations:', err);
  }
}

async function fetchExperiences(category = 'all') {
  try {
    const url = category === 'all' ? '/api/experiences' : `/api/experiences?category=${encodeURIComponent(category)}`;
    const res = await fetch(url);
    state.experiences = await res.json();
    renderExperiences(state.experiences);
    updateCalculator();
    updateDrawer();
  } catch (err) {
    console.error('Error fetching experiences:', err);
  }
}

async function fetchItineraries() {
  try {
    const res = await fetch('/api/itineraries');
    state.itineraries = await res.json();
    renderItineraries(state.itineraries);
  } catch (err) {
    console.error('Error fetching itineraries:', err);
  }
}

async function fetchEnsetSteps() {
  try {
    const res = await fetch('/api/enset-steps');
    state.ensetSteps = await res.json();
    renderEnsetStep();
  } catch (err) {
    console.error('Error fetching enset steps:', err);
  }
}

async function fetchStories() {
  try {
    const res = await fetch('/api/stories');
    state.stories = await res.json();
    if (state.stories.length > 0) {
      state.activeStoryId = state.stories[0].id;
      renderStories();
    }
  } catch (err) {
    console.error('Error fetching stories:', err);
  }
}

async function fetchPhrases() {
  try {
    const res = await fetch('/api/phrases');
    state.phrases = await res.json();
    renderPhrases(state.phrases);
  } catch (err) {
    console.error('Error fetching phrases:', err);
  }
}

async function fetchGuides() {
  try {
    const res = await fetch('/api/guides');
    state.guides = await res.json();
    renderGuides(state.guides);
  } catch (err) {
    console.error('Error fetching guides:', err);
  }
}

async function fetchReviews() {
  try {
    const res = await fetch('/api/reviews');
    state.reviews = await res.json();
    renderReviews(state.reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }
}

async function fetchTravelInfo() {
  try {
    const res = await fetch('/api/travel-info');
    state.travelInfo = await res.json();
    renderTravelInfo(state.travelInfo);
  } catch (err) {
    console.error('Error fetching travel info:', err);
  }
}

// --------------------------------------------------------------------------
// Real Geographic Leaflet Map Engine
// --------------------------------------------------------------------------

function initRealLeafletMap() {
  const mapContainer = document.querySelector('#realLeafletMap');
  if (!mapContainer || typeof L === 'undefined') return;

  // Center on Wolaita Sodo coordinates
  const sodoLat = 6.8583;
  const sodoLng = 37.7611;

  state.leafletMap = L.map('realLeafletMap', {
    center: [sodoLat, sodoLng],
    zoom: 10,
    zoomControl: true,
    attributionControl: true
  });

  // Base Map Layer Providers
  state.tileLayers = {
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
    }),
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    })
  };

  // Start with High-Resolution Satellite imagery
  state.currentTileLayer = state.tileLayers.satellite;
  state.currentTileLayer.addTo(state.leafletMap);

  // Add Sodo Central Hub Marker
  const sodoIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: '<div class="custom-marker-pin sodo">★</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const sodoMarker = L.marker([sodoLat, sodoLng], { icon: sodoIcon }).addTo(state.leafletMap);
  sodoMarker.bindPopup(`
    <div style="padding:4px;">
      <h4>📍 Wolaita Sodo (Hub)</h4>
      <p>City of 7 Gates · Elevation: 2,100 m</p>
      <button class="popup-btn" onclick="selectMapLandmark('sodo-hub')">Inspect Hub Details</button>
    </div>
  `);
  sodoMarker.on('click', () => selectMapLandmark('sodo-hub'));
  state.mapMarkers['sodo-hub'] = sodoMarker;

  // Add Landmark Markers
  state.destinations.forEach(dest => {
    const iconSymbol = dest.category.includes('Highland') ? '⛰' : dest.category.includes('Water') ? '💧' : '🏛';
    const markerIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="custom-marker-pin">${iconSymbol}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([dest.lat, dest.lng], { icon: markerIcon }).addTo(state.leafletMap);
    marker.bindPopup(`
      <div style="padding:4px;">
        <h4>${dest.name}</h4>
        <p>${dest.tagline} · ${dest.elevation}</p>
        <button class="popup-btn" onclick="selectMapLandmark('${dest.id}')">Inspect & 3D Flyover</button>
      </div>
    `);
    marker.on('click', () => selectMapLandmark(dest.id));
    state.mapMarkers[dest.id] = marker;
  });

  updateMapInspector(state.activeLandmarkId);
  drawLeafletRoute(state.activeLandmarkId);
}

function switchMapTileLayer(layerKey) {
  if (!state.leafletMap || !state.tileLayers[layerKey]) return;
  if (state.currentTileLayer) {
    state.leafletMap.removeLayer(state.currentTileLayer);
  }
  state.currentTileLayer = state.tileLayers[layerKey];
  state.currentTileLayer.addTo(state.leafletMap);
}

function drawLeafletRoute(destId) {
  if (!state.leafletMap || typeof L === 'undefined') return;

  if (state.mapRoutePolyline) {
    state.leafletMap.removeLayer(state.mapRoutePolyline);
    state.mapRoutePolyline = null;
  }

  if (destId === 'sodo-hub') return;

  const dest = state.destinations.find(d => d.id === destId);
  if (!dest) return;

  const sodoCoords = [6.8583, 37.7611];
  const destCoords = [dest.lat, dest.lng];

  state.mapRoutePolyline = L.polyline([sodoCoords, destCoords], {
    color: '#e0a93b',
    weight: 3.5,
    opacity: 0.9,
    dashArray: '6, 8',
    lineCap: 'round'
  }).addTo(state.leafletMap);
}

window.selectMapLandmark = function(id) {
  state.activeLandmarkId = id;
  updateMapInspector(id);
  drawLeafletRoute(id);

  if (state.leafletMap) {
    if (id === 'sodo-hub') {
      state.leafletMap.flyTo([6.8583, 37.7611], 12, { duration: 1.2 });
    } else {
      const dest = state.destinations.find(d => d.id === id);
      if (dest) {
        state.leafletMap.flyTo([dest.lat, dest.lng], 13, { duration: 1.2 });
        if (state.mapMarkers[dest.id]) {
          state.mapMarkers[dest.id].openPopup();
        }
      }
    }
  }
};

function updateMapInspector(id) {
  if (!inspTitle) return;
  if (id === 'sodo-hub') {
    inspBadge.textContent = 'Regional Capital & Hub';
    inspTitle.textContent = 'Wolaita Sodo ("City of 7 Gates")';
    inspTagline.textContent = 'The Cultural & Transportation Heart';
    inspDesc.textContent = 'A vibrant highland city nestled between Mount Damota and the Rift Valley. Home to authentic weaving markets, organic Enset eateries, and local guide desks.';
    inspElevation.textContent = '2,100 m';
    inspDistance.textContent = '0 km (Central Hub)';
    inspBestTime.textContent = 'Year-round';
    inspDifficulty.textContent = 'City Walking';
    if (inspGoogleEarthLink) inspGoogleEarthLink.href = 'https://earth.google.com/web/@6.8583,37.7611,2100a,4000d,35y,0h,45t,0r';
    inspExploreBtn.onclick = () => window.location.hash = '#destinations';
    return;
  }

  const dest = state.destinations.find(d => d.id === id);
  if (!dest) return;

  inspBadge.textContent = dest.category;
  inspTitle.textContent = dest.name;
  inspTagline.textContent = dest.tagline;
  inspDesc.textContent = dest.summary;
  inspElevation.textContent = dest.elevation;
  inspDistance.textContent = dest.distanceFromSodo;
  inspBestTime.textContent = dest.bestTime;
  inspDifficulty.textContent = dest.difficulty || 'Moderate';
  if (inspGoogleEarthLink) inspGoogleEarthLink.href = dest.googleEarthUrl;
  inspExploreBtn.onclick = () => openDestinationModal(dest.id);
}

// --------------------------------------------------------------------------
// Enset Gastronomy Lab Renderer
// --------------------------------------------------------------------------

function renderEnsetStep() {
  if (!ensetStepContent || !state.ensetSteps || state.ensetSteps.length === 0) return;

  const current = state.ensetSteps.find(s => s.step === state.activeEnsetStep) || state.ensetSteps[0];
  const stepIcons = ['🌱', '🏺', '🔥', '🥣'];
  const icon = stepIcons[current.step - 1] || '🍌';

  ensetStepContent.innerHTML = `
    <div class="step-info-col">
      <span class="inspector-badge">Stage 0${current.step} of 04</span>
      <h3>${current.title}</h3>
      <p class="step-wol-name">🗣 Wolayttatto Name: <i>"${current.wolName}"</i></p>
      <p class="step-desc-p">${current.desc}</p>
      <div class="step-tip-box">
        <strong>💡 Master Tip:</strong> ${current.tip}
      </div>
    </div>

    <div class="step-visual-col">
      <div class="step-badge-icon">${icon}</div>
      <h4>${current.title}</h4>
      <p>A thousands-year-old sustainable food engineering system unique to Southern Ethiopia.</p>
    </div>
  `;

  // Update Nav Buttons
  document.querySelectorAll('#ensetStepNav .enset-step-btn').forEach(btn => {
    const s = Number(btn.getAttribute('data-step'));
    btn.classList.toggle('active', s === state.activeEnsetStep);
  });

  // Update Progress Bar
  if (ensetProgressFill) {
    ensetProgressFill.style.width = `${(state.activeEnsetStep / 4) * 100}%`;
  }
}

// --------------------------------------------------------------------------
// Experiences & Currency Format
// --------------------------------------------------------------------------

function formatPrice(usdPrice, etbPrice) {
  if (state.currency === 'ETB') {
    return `${(etbPrice || usdPrice * state.exchangeRate).toLocaleString()} ETB`;
  }
  return `$${usdPrice} USD`;
}

function renderExperiences(experiences) {
  if (!experienceGrid) return;
  if (!experiences || experiences.length === 0) {
    experienceGrid.innerHTML = '<p class="empty-hint" style="grid-column: 1/-1; text-align: center; padding: 40px;">No experiences matched your filter. Try another category.</p>';
    return;
  }
  experienceGrid.innerHTML = experiences.map(exp => {
    const isAdded = state.selectedExperienceIds.has(exp.id);
    const displayPrice = formatPrice(exp.priceUSD, exp.priceETB);
    return `
      <article class="exp-card">
        <div class="exp-header">
          <span class="exp-type">${exp.type}</span>
          <span class="exp-duration">⏱ ${exp.duration} · ${exp.difficulty}</span>
        </div>
        <h3>${exp.name}</h3>
        <div class="exp-rating-row">
          <span class="exp-stars">★ ${exp.rating || '4.9'}</span>
          <span>(${exp.reviewsCount || '30+'} traveler reviews)</span>
        </div>
        <p class="exp-note">${exp.note}</p>
        <div class="exp-footer">
          <span class="exp-price">${displayPrice}</span>
          <button 
            class="btn-add-journey ${isAdded ? 'added' : ''}" 
            onclick="toggleExperienceInJourney('${exp.id}')"
          >
            ${isAdded ? 'Added ✓' : '+ Add to Journey'}
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function renderDestinations(destinations) {
  if (!destinationsGrid) return;
  destinationsGrid.innerHTML = destinations.map(dest => `
    <article class="dest-card">
      <div class="dest-card-media">
        <img src="${dest.image}" alt="${dest.name}">
        <span class="dest-tag">${dest.category}</span>
        <span class="dest-elevation">${dest.elevation}</span>
      </div>
      <div class="dest-card-body">
        <h3>${dest.name}</h3>
        <p class="dest-tagline">${dest.tagline}</p>
        <p class="dest-summary">${dest.summary}</p>
        <div class="dest-meta">
          <span>📍 ${dest.distanceFromSodo}</span>
          <button class="btn-card-action" onclick="openDestinationModal('${dest.id}')">
            View Insights <span>→</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderItineraries(itineraries) {
  if (!itinerariesContainer) return;
  itinerariesContainer.innerHTML = itineraries.map(itin => `
    <article class="itin-card">
      <span class="itin-badge">${itin.duration} · ${itin.pace}</span>
      <h3>${itin.title}</h3>
      <p class="itin-tagline">${itin.tagline}</p>
      <ul class="itin-timeline">
        ${itin.schedule.map(item => `
          <li class="itin-timeline-item">
            <span class="itin-time">${item.time}</span>
            <p class="itin-title">${item.title}</p>
            <p class="itin-desc">${item.desc}</p>
          </li>
        `).join('')}
      </ul>
      <a href="#plan" class="button primary" style="justify-content: center; font-size: 13px;">
        Personalize This Route <span>→</span>
      </a>
    </article>
  `).join('');
}

function renderStories() {
  if (!storyTabs || !storyBodyCard) return;
  
  storyTabs.innerHTML = state.stories.map(story => `
    <button 
      class="story-tab-btn ${story.id === state.activeStoryId ? 'active' : ''}" 
      onclick="selectStory('${story.id}')"
    >
      ${story.title.split(':')[0]}
    </button>
  `).join('');

  const current = state.stories.find(s => s.id === state.activeStoryId);
  if (current) {
    storyBodyCard.innerHTML = `
      <p class="story-subtitle">${current.subtitle}</p>
      <h3>${current.title}</h3>
      <p style="font-weight: 600; color: var(--ink);">${current.excerpt}</p>
      <p>${current.body}</p>
    `;
  }
}

window.selectStory = function(id) {
  state.activeStoryId = id;
  renderStories();
};

function renderPhrases(phrases) {
  if (!phrasebookGrid) return;
  phrasebookGrid.innerHTML = phrases.map((p, idx) => `
    <div class="phrase-card">
      <div>
        <div class="phrase-wol">${p.wol}</div>
        <div class="phrase-phonetic">[ ${p.phonetic || p.wol} ]</div>
        <div class="phrase-eng">${p.eng}</div>
        <div class="phrase-amh">${p.amh}</div>
      </div>
      <button class="btn-speak-phrase" onclick="playPhraseAudio('${encodeURIComponent(p.wol)}', ${idx})" title="Listen to pronunciation">
        🔊
      </button>
    </div>
  `).join('');
}

window.playPhraseAudio = function(phraseText, idx) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(decodeURIComponent(phraseText));
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
  playHarmonicChime(440 + (idx * 50));
};

function playHarmonicChime(freq = 520) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function renderGuides(guides) {
  if (!guidesGrid) return;
  guidesGrid.innerHTML = guides.map(guide => `
    <article class="guide-card">
      <div class="guide-header">
        <div class="guide-avatar">${guide.name.charAt(0)}</div>
        <div>
          <h3>${guide.name}</h3>
          <p class="guide-role">${guide.role}</p>
        </div>
      </div>
      <p class="guide-bio">${guide.bio}</p>
      <div class="guide-specs">
        ${guide.specialties.map(spec => `<span class="guide-spec-tag">${spec}</span>`).join('')}
      </div>
      <div class="guide-languages">
        🗣 Languages: ${guide.languages.join(', ')} · 🏆 ${guide.experience}
      </div>
    </article>
  `).join('');
}

function renderReviews(reviews) {
  if (!reviewsGrid || !reviews) return;
  reviewsGrid.innerHTML = reviews.map(rev => `
    <article class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">“${rev.text}”</p>
      <div class="review-author-meta">
        <div>
          <span class="review-author">${rev.author}</span>
          <span style="color:var(--muted);"> · ${rev.country}</span>
        </div>
        <span class="review-trip">${rev.trip}</span>
      </div>
    </article>
  `).join('');
}

function renderTravelInfo(info) {
  if (!travelInfoGrid || !info) return;
  travelInfoGrid.innerHTML = `
    <div class="travel-card">
      <h3>🚗 Getting to Wolaita Sodo</h3>
      <ul class="travel-list">
        ${info.gettingThere.map(item => `
          <li class="travel-list-item">
            <strong>${item.mode}</strong>
            <p>${item.desc}</p>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="travel-card">
      <h3>☀️ Climate & Seasons</h3>
      <ul class="travel-list">
        ${info.seasons.map(item => `
          <li class="travel-list-item">
            <strong>${item.title}</strong>
            <p>${item.note}</p>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="travel-card">
      <h3>🤝 Cultural Etiquette & Tips</h3>
      <ul class="travel-list">
        ${info.etiquetteTips.map(tip => `
          <li class="travel-list-item">
            <p style="margin:0;">✦ ${tip}</p>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

// --------------------------------------------------------------------------
// Interactive Live Budget Calculator
// --------------------------------------------------------------------------

function updateCalculator() {
  if (!calcTravelers || !calcDays) return;

  const travelers = Number(calcTravelers.value);
  const days = Number(calcDays.value);
  
  if (calcTravelersVal) calcTravelersVal.textContent = `${travelers} ${travelers === 1 ? 'person' : 'people'}`;
  if (calcDaysVal) calcDaysVal.textContent = `${days} ${days === 1 ? 'day' : 'days'}`;

  const lodgingStyle = calcLodging ? calcLodging.value : 'ecolodge';
  const transportStyle = calcTransport ? calcTransport.value : 'private4x4';

  const lodgingDailyUSD = lodgingStyle === 'homestay' ? 35 : lodgingStyle === 'ecolodge' ? 55 : 75;
  const transportDailyUSD = transportStyle === 'minibus' ? 15 : transportStyle === 'shuttle' ? 40 : 60;

  const selectedExpObjects = state.experiences.filter(e => state.selectedExperienceIds.has(e.id));
  const activitiesTotalUSD = selectedExpObjects.reduce((acc, curr) => acc + (curr.priceUSD || 30), 0);

  if (calcActCount) {
    calcActCount.textContent = `${selectedExpObjects.length} ${selectedExpObjects.length === 1 ? 'activity' : 'activities'} selected`;
  }

  const totalLodging = lodgingDailyUSD * days * travelers;
  const totalTransport = transportDailyUSD * days;
  const totalActivities = activitiesTotalUSD * travelers;
  const totalUSD = totalLodging + totalTransport + totalActivities;
  const totalETB = totalUSD * state.exchangeRate;
  const perPersonUSD = Math.round(totalUSD / travelers);
  const perPersonETB = Math.round(totalETB / travelers);

  if (calcTotalPrimary) {
    calcTotalPrimary.textContent = state.currency === 'ETB' ? `${totalETB.toLocaleString()} ETB` : `$${totalUSD} USD`;
  }
  if (calcTotalSecondary) {
    calcTotalSecondary.textContent = state.currency === 'ETB' ? `(~$${totalUSD} USD)` : `(~${totalETB.toLocaleString()} ETB)`;
  }
  if (calcPerPerson) {
    calcPerPerson.textContent = state.currency === 'ETB' 
      ? `(${perPersonETB.toLocaleString()} ETB per traveler for ${days} days)`
      : `($${perPersonUSD} USD per traveler for ${days} days)`;
  }

  if (calcBreakdownLodging) calcBreakdownLodging.textContent = formatPrice(totalLodging);
  if (calcBreakdownTransport) calcBreakdownTransport.textContent = formatPrice(totalTransport);
  if (calcBreakdownActivities) calcBreakdownActivities.textContent = formatPrice(totalActivities);
}

// --------------------------------------------------------------------------
// Slide-out Journey Drawer & Basket Management
// --------------------------------------------------------------------------

window.toggleExperienceInJourney = function(id) {
  if (state.selectedExperienceIds.has(id)) {
    state.selectedExperienceIds.delete(id);
  } else {
    state.selectedExperienceIds.add(id);
    playHarmonicChime(640);
  }
  updateBasketUI();
  updateDrawer();
  updateCalculator();
  renderExperiences(state.experiences);
  saveJourneyState();
};

window.removeBasketItem = function(id) {
  state.selectedExperienceIds.delete(id);
  updateBasketUI();
  updateDrawer();
  updateCalculator();
  renderExperiences(state.experiences);
  saveJourneyState();
};

function updateBasketUI() {
  const count = state.selectedExperienceIds.size;
  if (journeyCountBadge) journeyCountBadge.textContent = count;
  if (mobileJourneyCount) mobileJourneyCount.textContent = count;
  if (basketCountEl) basketCountEl.textContent = count;

  if (!selectedItemsList) return;

  if (count === 0) {
    selectedItemsList.innerHTML = '<li class="empty-basket-hint">No activities selected yet. Explore experiences above and click "+ Add to Journey".</li>';
    return;
  }

  const selectedObjects = state.experiences.filter(e => state.selectedExperienceIds.has(e.id));
  selectedItemsList.innerHTML = selectedObjects.map(item => `
    <li class="selected-basket-item">
      <span>✦ ${item.name} (${formatPrice(item.priceUSD, item.priceETB)})</span>
      <button class="remove-item-btn" onclick="removeBasketItem('${item.id}')" title="Remove activity">✕</button>
    </li>
  `).join('');
}

function updateDrawer() {
  if (!drawerBasketItems || !drawerCostSummary) return;

  const count = state.selectedExperienceIds.size;
  if (count === 0) {
    drawerBasketItems.innerHTML = `
      <div style="text-align:center; padding: 40px 10px; color:var(--muted);">
        <p style="font-size:32px; margin-bottom:8px;">🎒</p>
        <p><strong>Your journey basket is empty</strong></p>
        <p style="font-size:12px; margin-top:4px;">Add trekking, culinary workshops, or homestays from the experiences catalog.</p>
      </div>
    `;
    drawerCostSummary.innerHTML = `
      <div class="drawer-cost-row"><span>Activities Subtotal:</span><strong>$0 USD</strong></div>
    `;
    return;
  }

  const selectedObjects = state.experiences.filter(e => state.selectedExperienceIds.has(e.id));
  const subtotalUSD = selectedObjects.reduce((acc, curr) => acc + (curr.priceUSD || 30), 0);

  drawerBasketItems.innerHTML = selectedObjects.map(item => `
    <div class="drawer-item-card">
      <div class="drawer-item-info">
        <strong>${item.name}</strong>
        <span>${formatPrice(item.priceUSD, item.priceETB)} · ${item.duration}</span>
      </div>
      <button class="remove-item-btn" onclick="removeBasketItem('${item.id}')" title="Remove item">✕</button>
    </div>
  `).join('');

  drawerCostSummary.innerHTML = `
    <div class="drawer-cost-row">
      <span>Selected Experiences:</span>
      <strong>${count} items</strong>
    </div>
    <div class="drawer-cost-row total">
      <span>Activities Total:</span>
      <strong>${formatPrice(subtotalUSD)}</strong>
    </div>
  `;
}

function openDrawer() {
  if (journeyDrawer) {
    journeyDrawer.classList.add('open');
    journeyDrawer.setAttribute('aria-hidden', 'false');
  }
}

function closeDrawer() {
  if (journeyDrawer) {
    journeyDrawer.classList.remove('open');
    journeyDrawer.setAttribute('aria-hidden', 'true');
  }
}

function saveJourneyState() {
  localStorage.setItem('visit_wolaita_basket', JSON.stringify(Array.from(state.selectedExperienceIds)));
}

function loadSavedJourney() {
  try {
    const saved = localStorage.getItem('visit_wolaita_basket');
    if (saved) {
      state.selectedExperienceIds = new Set(JSON.parse(saved));
      updateBasketUI();
      updateDrawer();
    }
  } catch (e) {
    console.warn('Could not load saved basket:', e);
  }
}

// --------------------------------------------------------------------------
// Modal Handlers
// --------------------------------------------------------------------------

window.openDestinationModal = function(id) {
  const dest = state.destinations.find(d => d.id === id);
  if (!dest || !detailModal || !modalBody) return;

  modalBody.innerHTML = `
    <span class="dest-tag" style="position:static; display:inline-block; margin-bottom:12px;">${dest.category}</span>
    <h3 id="modalTitle">${dest.name}</h3>
    <p class="modal-tagline">${dest.tagline}</p>
    <p style="color: var(--muted); line-height: 1.7;">${dest.summary}</p>
    
    <div class="modal-highlights">
      <strong>Key Highlights & Wildlife:</strong>
      ${dest.highlights.map(h => `<div>✦ ${h}</div>`).join('')}
      <div style="margin-top:6px; color:var(--leaf-dark);">🐾 <strong>Wildlife:</strong> ${dest.wildlife || 'Endemic birds & highland flora'}</div>
    </div>

    <div style="font-size:13px; color:var(--leaf-dark); font-weight:600; margin-top:14px;">
      📍 Distance: ${dest.distanceFromSodo} · ⛰ Altitude: ${dest.elevation} · 🌤 Best Time: ${dest.bestTime} · 🧭 GPS: ${dest.lat}°N, ${dest.lng}°E
    </div>

    <div class="modal-actions">
      <a href="${dest.googleEarthUrl}" target="_blank" rel="noopener noreferrer" class="button google-earth-btn">
        <span>🌐 Open 3D in Google Earth</span> <span>↗</span>
      </a>
      <a href="#plan" class="button primary" onclick="detailModal.close()">
        Include in Custom Journey <span>↗</span>
      </a>
      <button class="button" style="background:var(--sand); color:var(--ink);" onclick="detailModal.close()">
        Close
      </button>
    </div>
  `;

  detailModal.showModal();
};

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => detailModal.close());
}
if (confirmCloseBtn) {
  confirmCloseBtn.addEventListener('click', () => confirmationModal.close());
}

// --------------------------------------------------------------------------
// Web Audio Ambient Nature Soundscape
// --------------------------------------------------------------------------

function toggleSoundscape() {
  if (state.isAudioPlaying) {
    stopSoundscape();
  } else {
    startSoundscape();
  }
}

function startSoundscape() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContext();

    const bufferSize = state.audioCtx.sampleRate * 2;
    const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = state.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = state.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, state.audioCtx.currentTime);

    const gainNode = state.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.04, state.audioCtx.currentTime);

    const osc = state.audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, state.audioCtx.currentTime);

    const oscGain = state.audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.02, state.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(state.audioCtx.destination);

    osc.connect(oscGain);
    oscGain.connect(state.audioCtx.destination);

    whiteNoise.start();
    osc.start();

    state.audioNodes = [whiteNoise, osc];
    state.isAudioPlaying = true;

    soundButton.classList.add('playing');
    soundButton.setAttribute('aria-pressed', 'true');
    soundButton.querySelector('.sound-label').textContent = 'Listening to the land (Pause)';
  } catch (err) {
    console.error('Audio could not be initialized:', err);
  }
}

function stopSoundscape() {
  if (state.audioCtx) {
    state.audioNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    state.audioCtx.close();
    state.audioCtx = null;
    state.audioNodes = [];
  }
  state.isAudioPlaying = false;
  soundButton.classList.remove('playing');
  soundButton.setAttribute('aria-pressed', 'false');
  soundButton.querySelector('.sound-label').textContent = 'Soundscape of Wolaita';
}

// --------------------------------------------------------------------------
// Event Listeners
// --------------------------------------------------------------------------

function setupEventListeners() {
  // Sound Button
  if (soundButton) {
    soundButton.addEventListener('click', toggleSoundscape);
  }

  // Real Map Toolbar Layer Switchers
  document.querySelectorAll('.map-layer-selector .layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-layer-selector .layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const layer = btn.getAttribute('data-layer');
      switchMapTileLayer(layer);
    });
  });

  // Recenter Map Button
  if (recenterMapBtn) {
    recenterMapBtn.addEventListener('click', () => {
      if (state.leafletMap) {
        state.leafletMap.flyTo([6.8583, 37.7611], 10, { duration: 1 });
      }
    });
  }

  // Drawer Toggles
  if (journeyDrawerBtn) journeyDrawerBtn.addEventListener('click', openDrawer);
  if (mobileDrawerTrigger) mobileDrawerTrigger.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  if (drawerClearBtn) {
    drawerClearBtn.addEventListener('click', () => {
      state.selectedExperienceIds.clear();
      saveJourneyState();
      updateBasketUI();
      updateDrawer();
      updateCalculator();
      renderExperiences(state.experiences);
    });
  }

  // Mobile Menu Toggle
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Destination Filters
  document.querySelectorAll('#destinationFilterBar .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#destinationFilterBar .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') {
        renderDestinations(state.destinations);
      } else {
        const filtered = state.destinations.filter(d => 
          d.category.toLowerCase().includes(filter.toLowerCase())
        );
        renderDestinations(filtered);
      }
    });
  });

  // Experience Category Filters
  document.querySelectorAll('#experienceFilterBar .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#experienceFilterBar .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      fetchExperiences(category);
    });
  });

  // Experience Real-time Search
  if (experienceSearch) {
    experienceSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderExperiences(state.experiences);
        return;
      }
      const matches = state.experiences.filter(exp => 
        exp.name.toLowerCase().includes(query) || 
        exp.note.toLowerCase().includes(query) ||
        exp.type.toLowerCase().includes(query)
      );
      renderExperiences(matches);
    });
  }

  // Enset Step Buttons
  document.querySelectorAll('#ensetStepNav .enset-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeEnsetStep = Number(btn.getAttribute('data-step'));
      renderEnsetStep();
    });
  });

  if (prevEnsetStep) {
    prevEnsetStep.addEventListener('click', () => {
      if (state.activeEnsetStep > 1) {
        state.activeEnsetStep--;
        renderEnsetStep();
      }
    });
  }
  if (nextEnsetStep) {
    nextEnsetStep.addEventListener('click', () => {
      if (state.activeEnsetStep < 4) {
        state.activeEnsetStep++;
        renderEnsetStep();
      }
    });
  }

  // Calculator Inputs
  if (calcTravelers) calcTravelers.addEventListener('input', updateCalculator);
  if (calcDays) calcDays.addEventListener('input', updateCalculator);
  if (calcLodging) calcLodging.addEventListener('change', updateCalculator);
  if (calcTransport) calcTransport.addEventListener('change', updateCalculator);

  // Currency Switcher
  document.querySelectorAll('.curr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.curr-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currency = btn.getAttribute('data-curr');
      renderExperiences(state.experiences);
      updateCalculator();
      updateDrawer();
      updateBasketUI();
    });
  });

  // Language Switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      switchLanguage(lang);
    });
  });

  // Journey Form Submission
  if (journeyForm) {
    journeyForm.addEventListener('submit', handleJourneySubmit);
  }
}

function switchLanguage(lang) {
  state.currentLang = lang;
  const content = i18n[lang] || i18n.en;
  
  const eyebrowEl = document.querySelector('#heroEyebrow');
  const headlineEl = document.querySelector('#heroHeadline');
  const introEl = document.querySelector('#heroIntro');

  if (eyebrowEl) eyebrowEl.textContent = content.eyebrow;
  if (headlineEl) headlineEl.innerHTML = content.headline;
  if (introEl) introEl.textContent = content.intro;
}

// --------------------------------------------------------------------------
// Form Handler & Digital Journey Voucher
// --------------------------------------------------------------------------

async function handleJourneySubmit(event) {
  event.preventDefault();
  formMessage.className = 'form-message';
  formMessage.textContent = 'Registering your journey note with Sodo local desk…';

  const formData = new FormData(journeyForm);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    arrivalDate: formData.get('arrivalDate'),
    durationDays: formData.get('durationDays'),
    travelers: formData.get('travelers'),
    stayStyle: formData.get('stayStyle'),
    transportStyle: formData.get('transportStyle'),
    guidePreference: formData.get('guidePreference'),
    selectedExperienceIds: Array.from(state.selectedExperienceIds),
    specialRequests: formData.get('specialRequests')
  };

  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    formMessage.classList.add('success');
    formMessage.textContent = `${result.message} Reference: ${result.reference}`;
    
    // Display Confirmation Voucher Modal
    showConfirmationModal(result);

    // Reset Form & Basket
    journeyForm.reset();
    state.selectedExperienceIds.clear();
    saveJourneyState();
    updateBasketUI();
    updateDrawer();
    updateCalculator();
    renderExperiences(state.experiences);
  } catch (error) {
    formMessage.classList.add('error');
    formMessage.textContent = error.message || 'Could not send journey note. Please try again.';
  }
}

function showConfirmationModal(result) {
  if (!confirmationModal || !confirmationBody) return;
  const summary = result.journeySummary || {};

  confirmationBody.innerHTML = `
    <div class="confirm-badge">🌿</div>
    <h3 style="font-family:var(--serif); font-size:28px; margin-bottom:6px;">Journey Registered!</h3>
    <p style="color:var(--muted); font-size:14px;">Wodaasi / Ameseginalehu, <strong>${summary.travelerName || 'Traveler'}</strong>.</p>
    
    <div class="confirm-code">${result.reference}</div>

    <div style="background:var(--sand); padding:16px; border-radius:12px; margin:16px 0; text-align:left; font-size:13px; line-height:1.6;">
      <div>👥 <strong>Travelers:</strong> ${summary.travelers} person(s)</div>
      <div>📅 <strong>Duration:</strong> ${summary.durationDays} Days (${summary.stayStyle})</div>
      <div>🚙 <strong>Transport:</strong> ${summary.transportStyle || 'Private 4x4'}</div>
      <div>🎒 <strong>Experiences Included:</strong> ${summary.experiencesCount} curated items</div>
      <div>💰 <strong>Estimated Budget:</strong> ${summary.estimatedTotal || 'Customized'}</div>
      ${(summary.experiences || []).map(e => `<div style="margin-left:14px; color:var(--leaf-dark);">✦ ${e.name}</div>`).join('')}
    </div>

    <p style="font-size:12px; color:var(--muted); margin-bottom:20px;">
      Our local hosts in Wolaita Sodo will review your route and send your comprehensive welcome briefing within 24 hours.
    </p>

    <div style="display:flex; gap:10px;">
      <button class="button primary" onclick="window.print()" style="flex:1; justify-content:center;">
        Print / Save Pass <span>🖨</span>
      </button>
      <button class="button" onclick="confirmationModal.close()" style="flex:1; justify-content:center; background:var(--sand); color:var(--ink);">
        Done <span>✓</span>
      </button>
    </div>
  `;

  confirmationModal.showModal();
}

// Start application
init();
