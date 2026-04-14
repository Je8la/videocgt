const videos = window.CGT_VIDEOS || [];
let openVideoId = null;
let currentSearch = '';
let currentTagFilter = 'tutti';

const listEl = document.getElementById('video-list');
const searchInput = document.getElementById('search-input');
const tagFilter = document.getElementById('tag-filter');

function getThumb(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

function getFilteredVideos() {
  return videos.filter((video) => {
    const matchesText =
      currentSearch === '' ||
      normalizeText(video.title).includes(currentSearch) ||
      normalizeText(video.description).includes(currentSearch) ||
      normalizeText(video.theme).includes(currentSearch) ||
      normalizeText(video.tag).includes(currentSearch);

    const matchesTag =
      currentTagFilter === 'tutti' ||
      video.theme === currentTagFilter ||
      video.tag === currentTagFilter;

    return matchesText && matchesTag;
  });
}

function renderList() {
  const filtered = getFilteredVideos();

  if (!filtered.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        Nessun contenuto trovato con i filtri selezionati.
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered
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
}

function bindFilters() {
  searchInput.addEventListener('input', (event) => {
    currentSearch = normalizeText(event.target.value);
    openVideoId = null;
    renderList();
  });

  tagFilter.addEventListener('change', (event) => {
    currentTagFilter = event.target.value;
    openVideoId = null;
    renderList();
  });
}

function render() {
  bindFilters();
  renderList();
}

render();
