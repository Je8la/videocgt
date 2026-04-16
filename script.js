let videos = [];

let openVideoId = null;
let currentSearch = '';
let currentFamilyFilter = 'tutti';
let currentCategoryFilter = 'tutti';
let currentPage = 1;

const PAGE_SIZE = 10;

const listEl = document.getElementById('video-list');
const searchInput = document.getElementById('search-input');
const familyFilter = document.getElementById('family-filter');
const tagFilter = document.getElementById('tag-filter');
const paginationEl = document.getElementById('pagination');
const resultsInfoEl = document.getElementById('results-info');

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

function getThumb(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

function getVideoTags(video) {
  return (video.tag || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function isHomepageVideo(video) {
  return video.homepage === true || normalizeText(video.homepage) === 'true';
}

async function loadVideos() {
  try {
    const res = await fetch('videos.json');

    if (!res.ok) throw new Error('Errore caricamento JSON');

    videos = await res.json();

    buildFamilyFilter();
    buildCategoryFilter();
    renderList();
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<div class="empty-state">Errore nel caricamento dei contenuti video.</div>`;
  }
}

function buildFamilyFilter() {
  const families = new Set();

  videos.forEach((v) => {
    if (v.family) families.add(v.family);
  });

  familyFilter.innerHTML = `
    <option value="tutti">Seleziona famiglia</option>
    ${[...families].sort().map(f => `<option value="${f}">${f}</option>`).join('')}
  `;
}

function buildCategoryFilter() {
  const categories = new Set();

  videos
    .filter(v => currentFamilyFilter === 'tutti' || v.family === currentFamilyFilter)
    .forEach(v => {
      if (v.theme) categories.add(v.theme);
      getVideoTags(v).forEach(t => categories.add(t));
    });

  tagFilter.innerHTML = `
    <option value="tutti">Seleziona categoria</option>
    ${[...categories].sort().map(c => `<option value="${c}">${c}</option>`).join('')}
  `;
}

function getFilteredVideos() {
  const searchActive = currentSearch.length > 0;

  if (!searchActive && currentFamilyFilter === 'tutti' && currentCategoryFilter === 'tutti') {
    return videos.filter(isHomepageVideo).slice(0, 5);
  }

  return videos.filter(v => {
    const title = normalizeText(v.title);
    const desc = normalizeText(v.description);
    const theme = normalizeText(v.theme);
    const tags = getVideoTags(v).map(normalizeText);

    const matchesSearch =
      !searchActive ||
      title.includes(currentSearch) ||
      desc.includes(currentSearch) ||
      theme.includes(currentSearch) ||
      tags.some(t => t.includes(currentSearch));

    const matchesFamily =
      currentFamilyFilter === 'tutti' ||
      v.family === currentFamilyFilter;

    const selectedCat = normalizeText(currentCategoryFilter);

    const matchesCategory =
      selectedCat === 'tutti' ||
      theme === selectedCat ||
      tags.includes(selectedCat);

    return matchesSearch && matchesFamily && matchesCategory;
  });
}

function getPaginatedVideos(list) {
  const start = (currentPage - 1) * PAGE_SIZE;
  return list.slice(start, start + PAGE_SIZE);
}

function renderResultsInfo(total) {
  if (!currentSearch && currentFamilyFilter === 'tutti' && currentCategoryFilter === 'tutti') {
    resultsInfoEl.textContent = `In evidenza: ${total} contenuti`;
  } else {
    resultsInfoEl.textContent = `${total} contenuti trovati`;
  }
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);

  if (pages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  let html = '';

  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll('[data-page]').forEach(btn => {
    btn.onclick = () => {
      currentPage = Number(btn.dataset.page);
      openVideoId = null;
      renderList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
}

function renderList() {
  const filtered = getFilteredVideos();
  const paginated = getPaginatedVideos(filtered);

  renderResultsInfo(filtered.length);

  if (!filtered.length) {
    listEl.innerHTML = `<div class="empty-state">Nessun contenuto trovato.</div>`;
    paginationEl.innerHTML = '';
    return;
  }

  listEl.innerHTML = paginated.map(v => {
    const isOpen = v.id === openVideoId;
    const tags = getVideoTags(v);

    return `
      <div class="video-card ${isOpen ? 'selected' : ''}" data-id="${v.id}">
        ${
          isOpen
            ? `<div class="player-wrapper">
                <iframe src="https://www.youtube.com/embed/${v.youtubeId}?autoplay=1" allowfullscreen></iframe>
               </div>`
            : `<img src="${getThumb(v.youtubeId)}" class="video-thumb"/>`
        }

        <div class="video-card-body">
          <div class="video-meta-row">
            ${v.family ? `<span class="video-theme">${v.family}</span>` : ''}
            ${v.theme ? `<span class="video-theme">${v.theme}</span>` : ''}
            ${tags.map(t => `<span class="video-tag">${t}</span>`).join('')}
          </div>

          <h3>${v.title}</h3>
          <p>${v.description}</p>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('[data-id]').forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;
      openVideoId = openVideoId === id ? null : id;
      renderList();
    };
  });

  renderPagination(filtered.length);
}

function bindEvents() {
  searchInput.oninput = e => {
    currentSearch = normalizeText(e.target.value);
    currentPage = 1;
    renderList();
  };

  familyFilter.onchange = e => {
    currentFamilyFilter = e.target.value;
    currentCategoryFilter = 'tutti';
    currentPage = 1;

    buildCategoryFilter();
    renderList();
  };

  tagFilter.onchange = e => {
    currentCategoryFilter = e.target.value;
    currentPage = 1;
    renderList();
  };
}

bindEvents();
loadVideos();
