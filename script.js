let videos = [];

let openVideoId = null;
let currentSearch = '';
let currentTagFilter = 'tutti';
let currentPage = 1;

const PAGE_SIZE = 10;

const listEl = document.getElementById('video-list');
const searchInput = document.getElementById('search-input');
const tagFilter = document.getElementById('tag-filter');
const paginationEl = document.getElementById('pagination');
const resultsInfoEl = document.getElementById('results-info');

function getThumb(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

async function loadVideos() {
  try {
    const response = await fetch('videos.json');

    if (!response.ok) {
      throw new Error(`Errore caricamento videos.json: ${response.status}`);
    }

    videos = await response.json();
    renderList();
  } catch (error) {
    console.error(error);
    listEl.innerHTML = `
      <div class="empty-state">
        Errore nel caricamento dei contenuti video.
      </div>
    `;
    paginationEl.innerHTML = '';
    resultsInfoEl.textContent = '';
  }
}

function hasActiveSearch() {
  return currentSearch.length > 0;
}

function hasActiveFilter() {
  return normalizeText(currentTagFilter) !== 'tutti';
}

function getHomepageVideos() {
  return videos.filter((video) => video.homepage === true).slice(0, 5);
}

function getFilteredVideos() {
  const searchActive = hasActiveSearch();
  const filterActive = hasActiveFilter();

  if (!searchActive && !filterActive) {
    return getHomepageVideos();
  }

  return videos.filter((video) => {
    const title = normalizeText(video.title);
    const description = normalizeText(video.description);
    const theme = normalizeText(video.theme);
    const tag = normalizeText(video.tag);

    const matchesSearch =
      !searchActive ||
      title.includes(currentSearch) ||
      description.includes(currentSearch) ||
      theme.includes(currentSearch) ||
      tag.includes(currentSearch);

    const selectedFilter = normalizeText(currentTagFilter);

    const matchesFilter =
      selectedFilter === 'tutti' ||
      theme === selectedFilter ||
      tag === selectedFilter;

    return matchesSearch && matchesFilter;
  });
}

function getPaginatedVideos(filteredVideos) {
  const start = (currentPage - 1) * PAGE_SIZE;
  return filteredVideos.slice(start, start + PAGE_SIZE);
}

function renderResultsInfo(totalResults) {
  const searchActive = hasActiveSearch();
  const filterActive = hasActiveFilter();

  if (!searchActive && !filterActive) {
    resultsInfoEl.textContent = `In evidenza: ${totalResults} contenuti`;
    return;
  }

  resultsInfoEl.textContent = `${totalResults} contenuti trovati`;
}

function renderPagination(totalResults) {
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  let html = '';

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.getAttribute('data-page'));
      openVideoId = null;
      renderList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderList() {
  const filtered = getFilteredVideos();
  const paginated = getPaginatedVideos(filtered);

  renderResultsInfo(filtered.length);

  if (!filtered.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        Nessun contenuto trovato con i filtri selezionati.
      </div>
    `;
    paginationEl.innerHTML = '';
    return;
  }

  listEl.innerHTML = paginated
    .map((video) => {
      const isOpen = video.id === openVideoId;

      return `
        <div class="video-card ${isOpen ? 'selected' : ''}" data-video-id="${video.id}">
          ${
            isOpen
              ? `
                <div class="player-wrapper">
                  <iframe
                    src="https://www.youtube.com/embed/${video.youtubeId}?autoplay=1"
                    title="${video.title}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              `
              : `
                <img
                  src="${getThumb(video.youtubeId)}"
                  alt="${video.title}"
                  class="video-thumb"
                />
              `
          }

          <div class="video-card-body">
            <div class="video-meta-row">
              <span class="video-theme">${video.theme}</span>
              <span class="video-tag">${video.tag}</span>
            </div>
            <h3>${video.title}</h3>
            <p>${video.description}</p>
          </div>
        </div>
      `;
    })
    .join('');

  listEl.querySelectorAll('[data-video-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-video-id');
      openVideoId = openVideoId === id ? null : id;
      renderList();
    });
  });

  renderPagination(filtered.length);
}

function bindFilters() {
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      currentSearch = normalizeText(event.target.value);
      currentPage = 1;
      openVideoId = null;
      renderList();
    });
  }

  if (tagFilter) {
    tagFilter.addEventListener('change', (event) => {
      currentTagFilter = event.target.value;
      currentPage = 1;
      openVideoId = null;
      renderList();
    });
  }
}

bindFilters();
loadVideos();
