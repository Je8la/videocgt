const videos = window.CGT_VIDEOS || [];
let activeFilter = 'tutti';
let openVideoId = null;

const listEl = document.getElementById('video-list');
const filterButtons = document.querySelectorAll('.filter-btn');

function getThumb(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

function getFilteredVideos() {
  if (activeFilter === 'tutti') return videos;
  return videos.filter((video) => video.type === activeFilter);
}

function renderList() {
  const filtered = getFilteredVideos();

  listEl.innerHTML = filtered
    .map((video) => {
      const isOpen = video.id === openVideoId;

      return `
        <div class="video-card" data-video-id="${video.id}">
          
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
              <span class="video-type">${video.type.toUpperCase()}</span>
              <span class="video-category">${video.category}</span>
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

function renderFilters() {
  filterButtons.forEach((btn) => {
    const value = btn.getAttribute('data-filter');
    btn.classList.toggle('active', value === activeFilter);

    btn.onclick = () => {
      activeFilter = value;
      openVideoId = null;
      renderList();
    };
  });
}

function render() {
  renderFilters();
  renderList();
}

render();
