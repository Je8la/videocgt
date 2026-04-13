const videos = window.CGT_VIDEOS || [];
let activeFilter = 'tutti';
let selectedVideoId = null;

const listEl = document.getElementById('video-list');
const playerSectionEl = document.getElementById('video-player-section');
const filterButtons = document.querySelectorAll('.filter-btn');

function getThumb(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

function getFilteredVideos() {
  if (activeFilter === 'tutti') return videos;
  return videos.filter((video) => video.type === activeFilter);
}

function getSelectedVideo() {
  const filtered = getFilteredVideos();

  if (!filtered.length) return null;

  return (
    filtered.find((video) => video.id === selectedVideoId) ||
    null
  );
}

function renderPlayer(video) {
  if (!video) {
    playerSectionEl.innerHTML = '';
    return;
  }

  playerSectionEl.innerHTML = `
    <div class="player-card">
      <div class="player-wrapper">
        <iframe
          src="https://www.youtube.com/embed/${video.youtubeId}"
          title="${video.title}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>

      <div class="player-info">
        <div class="video-meta-row">
          <span class="video-type">${video.type.toUpperCase()}</span>
          <span class="video-category">${video.category}</span>
        </div>
        <h2>${video.title}</h2>
        <p>${video.description}</p>
      </div>
    </div>
  `;
}

function renderList() {
  const filtered = getFilteredVideos();

  if (!filtered.length) {
    listEl.innerHTML =
      '<div class="player-card"><div class="player-info"><p>Nessun contenuto disponibile.</p></div></div>';
    return;
  }

  listEl.innerHTML = filtered
    .map((video) => {
      const selectedClass = video.id === selectedVideoId ? 'selected' : '';
      return `
        <button class="video-card ${selectedClass}" data-video-id="${video.id}">
          <img
            src="${getThumb(video.youtubeId)}"
            alt="${video.title}"
            class="video-thumb"
          />
          <div class="video-card-body">
            <div class="video-meta-row">
              <span class="video-type">${video.type.toUpperCase()}</span>
              <span class="video-category">${video.category}</span>
            </div>
            <h3>${video.title}</h3>
            <p>${video.description}</p>
          </div>
        </button>
      `;
    })
    .join('');

  listEl.querySelectorAll('[data-video-id]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedVideoId = button.getAttribute('data-video-id');
      render();
      playerSectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderFilters() {
  filterButtons.forEach((btn) => {
    const value = btn.getAttribute('data-filter');
    btn.classList.toggle('active', value === activeFilter);
    btn.onclick = () => {
      activeFilter = value;
      selectedVideoId = null;
      render();
    };
  });
}

function render() {
  renderFilters();
  renderPlayer(getSelectedVideo());
  renderList();
}

render();
