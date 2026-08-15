const grid = document.querySelector('#experienceGrid');
const form = document.querySelector('#journeyForm');
const message = document.querySelector('#formMessage');

async function loadExperiences() {
  try {
    const response = await fetch('/api/experiences');
    const experiences = await response.json();
    grid.innerHTML = experiences.map((item, i) => `<article class="experience-card card-${i + 1}"><span class="number">0${i + 1}</span><p class="card-type">${item.type} · ${item.duration}</p><h3>${item.name}</h3><p>${item.note}</p><button data-id="${item.id}" class="save">Add to my journey <span>+</span></button></article>`).join('');
    document.querySelectorAll('.save').forEach(button => button.addEventListener('click', () => {
      button.classList.toggle('saved');
      button.innerHTML = button.classList.contains('saved') ? 'Saved to your journey <span>✓</span>' : 'Add to my journey <span>+</span>';
    }));
  } catch { grid.innerHTML = '<p class="loading">Experiences are taking the scenic route. Please refresh.</p>'; }
}
form.addEventListener('submit', async event => {
  event.preventDefault(); message.textContent = 'Sending your note…';
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    message.textContent = `${result.message} Reference: ${result.reference}.`; form.reset();
  } catch (error) { message.textContent = error.message || 'We could not send your note. Please try again.'; }
});
document.querySelector('.menu').addEventListener('click', () => document.querySelector('.site-header').classList.toggle('open'));
document.querySelector('#soundButton').addEventListener('click', event => { const active = event.currentTarget.getAttribute('aria-pressed') === 'true'; event.currentTarget.setAttribute('aria-pressed', String(!active)); event.currentTarget.querySelector('span').textContent = active ? 'Listen to the land' : 'The land is listening'; });
loadExperiences();
