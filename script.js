let videos = [];

let openVideoId = null;
let currentSearch = '';
let currentCategoryFilter = 'tutti';
let currentFamilyFilter = 'tutti';
let currentPage = 1;

const PAGE_SIZE = 10;

const listEl = document.getElementById('video-list');
const searchInput = document.getElementById('search-input');
const tagFilter = document.getElementById('tag-filter');
const familyFilter = document.getElementById('family-filter');
const paginationEl = document.getElementById('pagination');
const resultsInfoEl = document.getElementById('results-info');

function normalizeText(value) {
  return (value || '').toString().toLowerCase().trim();
}

function getThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function isHomepageVideo(v) {
  return v.homepage === true || normalizeText(v.homepage) === 'true';
}

function getTags(video) {
  return (video.tag || '').split(',').map(t => t.trim());
}

async function loadVideos() {
  const res = await fetch('videos.json');
  videos = await res.json();

  buildFilters();
  render();
}

function buildFilters() {
  const families = new Set();
  const categories = new Set();

  videos.forEach(v => {
    if (v.family) families.add(v.family);
    if (v.theme) categories.add(v.theme);
    getTags(v).forEach(t => categories.add(t));
  });

  familyFilter.innerHTML =
    `<option value="tutti">Seleziona famiglia</option>` +
    [...families].map(f => `<option>${f}</option>`).join('');

  tagFilter.innerHTML =
    `<option value="tutti">Seleziona categoria</option>` +
    [...categories].map(c => `<option>${c}</option>`).join('');
}

function getFilteredVideos() {
  let result = videos;

  const search = normalizeText(currentSearch);
  const cat = normalizeText(currentCategoryFilter);
  const fam = normalizeText(currentFamilyFilter);

  if (!search && cat === 'tutti' && fam === 'tutti') {
    return videos.filter(isHomepageVideo).slice(0, 5);
  }

  return result.filter(v => {
    const text = normalizeText(v.title + v.description);
    const theme = normalizeText(v.theme);
    const family = normalizeText(v.family);
    const tags = getTags(v).map(normalizeText);

    return (
      (!search || text.includes(search)) &&
      (cat === 'tutti' || theme === cat || tags.includes(cat)) &&
      (fam === 'tutti' || family === fam)
    );
  });
}

function render() {
  const filtered = getFilteredVideos();
  const start = (currentPage - 1) * PAGE_SIZE;
  const page = filtered.slice(start, start + PAGE_SIZE);

  resultsInfoEl.textContent = `${filtered.length} contenuti`;

  listEl.innerHTML = page.map(v => {
    const isOpen = String(v.id) === String(openVideoId);

    return `
      <div class="video-card ${isOpen ? 'selected' : ''}" data-id="${v.id}">

        ${isOpen
          ? `<div class="player-wrapper">
              <iframe src="https://www.youtube.com/embed/${v.youtubeId}?autoplay=1"></iframe>
            </div>`
          : `<img src="${getThumb(v.youtubeId)}" class="video-thumb">`
        }

        <div class="video-card-body">
          <div class="video-meta-row">
            <span class="video-theme">${v.family}</span>
            <span class="video-theme">${v.theme}</span>
            ${getTags(v).map(t => `<span class="video-tag">${t}</span>`).join('')}
          </div>
          <h3>${v.title}</h3>
          <p>${v.description}</p>
        </div>

      </div>
    `;
  }).join('');

  document.querySelectorAll('.video-card').forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;
      openVideoId = openVideoId === id ? null : id;
      render();
    };
  });

  renderPagination(filtered.length);
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return paginationEl.innerHTML = '';

  paginationEl.innerHTML = [...Array(pages)]
    .map((_, i) =>
      `<button class="page-btn ${i+1===currentPage?'active':''}" data-p="${i+1}">${i+1}</button>`
    ).join('');

  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.onclick = () => {
      currentPage = Number(btn.dataset.p);
      render();
      window.scrollTo({top:0});
    };
  });
}

searchInput.oninput = e => {
  currentSearch = e.target.value;
  currentPage = 1;
  openVideoId = null;
  render();
};

tagFilter.onchange = e => {
  currentCategoryFilter = e.target.value;
  currentPage = 1;
  openVideoId = null;
  render();
};

familyFilter.onchange = e => {
  currentFamilyFilter = e.target.value;
  currentPage = 1;
  openVideoId = null;
  render();
};

loadVideos();
