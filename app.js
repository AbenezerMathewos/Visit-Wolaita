/**
 * Visit Wolaita — Interactive Tourism Platform Engine
 */

// Global State
const state = {
  destinations: [],
  experiences: [],
  itineraries: [],
  guides: [],
  stories: [],
  phrases: [],
  travelInfo: null,
  selectedExperienceIds: new Set(),
  activeStoryId: null,
  isAudioPlaying: false,
  audioCtx: null,
  audioNodes: [],
  currentLang: 'en'
};

// Language Dictionary for Hero & Key Elements
const i18n = {
  en: {
    eyebrow: 'Southern Ethiopia · 06°50′ N · Kingdom of Wolaita',
    headline: 'Come for the<br><i>landscape.</i><br>Stay for the soul.',
    intro: 'Wolaita is a highland sanctuary of green volcanic ridges, rushing twin waterfalls, UNESCO living traditions, and tables centered around the ancient sacred Enset. Let local hosts shape your unhurried journey.'
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
const travelInfoGrid = document.querySelector('#travelInfoGrid');
const journeyForm = document.querySelector('#journeyForm');
const formMessage = document.querySelector('#formMessage');
const journeyCountBadge = document.querySelector('#journeyCount');
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

// Initialize Platform
async function init() {
  loadSavedJourney();
  setupEventListeners();
  await Promise.all([
    fetchDestinations(),
    fetchExperiences(),
    fetchItineraries(),
    fetchStories(),
    fetchPhrases(),
    fetchGuides(),
    fetchTravelInfo()
  ]);
}

// --------------------------------------------------------------------------
// API Fetchers
// --------------------------------------------------------------------------

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
// Render Functions
// --------------------------------------------------------------------------

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

function renderExperiences(experiences) {
  if (!experienceGrid) return;
  if (!experiences || experiences.length === 0) {
    experienceGrid.innerHTML = '<p class="empty-hint" style="grid-column: 1/-1; text-align: center; padding: 40px;">No experiences matched your filter. Try another category.</p>';
    return;
  }
  experienceGrid.innerHTML = experiences.map(exp => {
    const isAdded = state.selectedExperienceIds.has(exp.id);
    return `
      <article class="exp-card">
        <div class="exp-header">
          <span class="exp-type">${exp.type}</span>
          <span class="exp-duration">⏱ ${exp.duration} · ${exp.difficulty}</span>
        </div>
        <h3>${exp.name}</h3>
        <p class="exp-note">${exp.note}</p>
        <div class="exp-footer">
          <span class="exp-price">${exp.price}</span>
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
  phrasebookGrid.innerHTML = phrases.map(p => `
    <div class="phrase-card">
      <div class="phrase-wol">${p.wol}</div>
      <div class="phrase-eng">${p.eng}</div>
      <div class="phrase-amh">${p.amh}</div>
    </div>
  `).join('');
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
// Journey Builder & Basket Management
// --------------------------------------------------------------------------

window.toggleExperienceInJourney = function(id) {
  if (state.selectedExperienceIds.has(id)) {
    state.selectedExperienceIds.delete(id);
  } else {
    state.selectedExperienceIds.add(id);
  }
  updateBasketUI();
  renderExperiences(state.experiences);
  saveJourneyState();
};

window.removeBasketItem = function(id) {
  state.selectedExperienceIds.delete(id);
  updateBasketUI();
  renderExperiences(state.experiences);
  saveJourneyState();
};

function updateBasketUI() {
  const count = state.selectedExperienceIds.size;
  if (journeyCountBadge) journeyCountBadge.textContent = count;
  if (basketCountEl) basketCountEl.textContent = count;

  if (!selectedItemsList) return;

  if (count === 0) {
    selectedItemsList.innerHTML = '<li class="empty-basket-hint">No activities selected yet. Explore experiences above and click "+ Add to Journey".</li>';
    return;
  }

  const selectedObjects = state.experiences.filter(e => state.selectedExperienceIds.has(e.id));
  selectedItemsList.innerHTML = selectedObjects.map(item => `
    <li class="selected-basket-item">
      <span>✦ ${item.name}</span>
      <button class="remove-item-btn" onclick="removeBasketItem('${item.id}')" title="Remove activity">✕</button>
    </li>
  `).join('');
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
      <strong>Key Highlights & Features:</strong>
      ${dest.highlights.map(h => `<div>✦ ${h}</div>`).join('')}
    </div>

    <div style="font-size:13px; color:var(--leaf-dark); font-weight:600; margin-top:14px;">
      📍 Distance: ${dest.distanceFromSodo} · ⛰ Altitude: ${dest.elevation} · 🌤 Best Time: ${dest.bestTime}
    </div>

    <div class="modal-actions">
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

    // Gentle highland wind noise node
    const bufferSize = state.audioCtx.sampleRate * 2;
    const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = state.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft mountain breeze
    const filter = state.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, state.audioCtx.currentTime);

    const gainNode = state.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.04, state.audioCtx.currentTime);

    // Warm harmonic drone (representing sacred highland serenity)
    const osc = state.audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, state.audioCtx.currentTime); // A3

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

  // Mobile Menu Toggle
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close nav on click
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
      <div>🎒 <strong>Experiences Included:</strong> ${summary.experiencesCount} curated items</div>
      ${(summary.experiences || []).map(e => `<div style="margin-left:14px; color:var(--leaf-dark);">✦ ${e.name}</div>`).join('')}
    </div>

    <p style="font-size:12px; color:var(--muted); margin-bottom:20px;">
      Our local hosts will review your itinerary and email your welcome briefing within 24 hours.
    </p>

    <button class="button primary" onclick="confirmationModal.close()" style="width:100%; justify-content:center;">
      Done & Explore More <span>✓</span>
    </button>
  `;

  confirmationModal.showModal();
}

// Start application
init();
