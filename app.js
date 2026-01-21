// App State
const state = {
  videos: JSON.parse(localStorage.getItem("kidsTube_videos")) || [],
  isSettingsOpen: false,
  player: null,
};

// DOM Elements
const elements = {
  app: document.getElementById("app"),
  kidsView: document.getElementById("kids-view"),
  settingsView: document.getElementById("settings-view"),
  videoGrid: document.getElementById("video-grid"),
  manageList: document.getElementById("manage-video-list"),

  // Buttons
  settingsBtn: document.getElementById("settings-btn"),
  closeSettingsBtn: document.getElementById("close-settings-btn"),
  addVideoBtn: document.getElementById("add-video-btn"),

  // Inputs
  videoInput: document.getElementById("video-url-input"),

  // Modals
  videoModal: document.getElementById("video-modal"),
  closeModalBtn: document.getElementById("close-modal-btn"),
  lockModal: document.getElementById("lock-modal"),
  unlockBtn: document.getElementById("unlock-btn"),
  cancelLockBtn: document.getElementById("cancel-lock-btn"),
  mathProblem: document.getElementById("math-problem"),
  mathAnswer: document.getElementById("math-answer"),
};

// Utils
function saveVideos() {
  localStorage.setItem("kidsTube_videos", JSON.stringify(state.videos));
}

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Render Functions
function renderGrid() {
  elements.videoGrid.innerHTML = "";

  if (state.videos.length === 0) {
    elements.videoGrid.innerHTML = `
            <div class="empty-state">
                <p>まだ動画がありません。<br>右上の設定ボタン(⚙️)から動画を追加してください。</p>
            </div>
        `;
    return;
  }

  state.videos.forEach((video) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
            <img src="${video.thumbnail}" alt="Video Thumbnail">
            <div class="play-icon">▶️</div>
        `;
    card.onclick = () => openPlayer(video.id);
    elements.videoGrid.appendChild(card);
  });
}

function renderManageList() {
  elements.manageList.innerHTML = "";
  state.videos.forEach((video, index) => {
    const item = document.createElement("li");
    item.className = "manage-item";
    item.innerHTML = `
            <img src="${video.thumbnail}" alt="thumb">
            <span class="manage-item-title">動画 ${index + 1}: ${video.id}</span>
            <button class="delete-btn" onclick="deleteVideo('${video.id}')">削除</button>
        `;
    elements.manageList.appendChild(item);
  });
}

// Logic - Video Management
function addVideo() {
  const url = elements.videoInput.value.trim();
  if (!url) return;

  const videoId = extractVideoId(url);
  if (!videoId) {
    alert("正しいYouTubeのURLを入力してください。");
    return;
  }

  // Check duplicate
  if (state.videos.some((v) => v.id === videoId)) {
    alert("この動画はすでに登録されています。");
    return;
  }

  const newVideo = {
    id: videoId,
    thumbnail: getThumbnail(videoId),
    addedAt: new Date().toISOString(),
  };

  state.videos.push(newVideo);
  saveVideos();

  elements.videoInput.value = "";
  renderManageList();
  renderGrid();
}

window.deleteVideo = function (id) {
  if (!confirm("本当に削除しますか？")) return;
  state.videos = state.videos.filter((v) => v.id !== id);
  saveVideos();
  renderManageList();
  renderGrid();
};

// Logic - Player
// We use simple IFrame injection instead of the API to avoid "file://" origin restrictions (Error 153).

function openPlayer(videoId) {
    elements.videoModal.classList.remove('hidden');
    
    // Inject the IFrame directly. This is more robust for local files.
    // autoplay=1: Start immediately
    // rel=0: Minimize related videos
    const origin = window.location.origin;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&origin=${origin}`;
    
    // We clear content first to ensure clean state, then add iframe
    const iframeHTML = `
        <iframe 
            src="${embedUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
        </iframe>
    `;
    
    document.getElementById('youtube-player').innerHTML = iframeHTML;
}

function closePlayer() {
    elements.videoModal.classList.add('hidden');
    // Destroy the iframe to stop playback immediately
    document.getElementById('youtube-player').innerHTML = '';
}

// Logic - Settings Lock
let currentMathAnswer = 0;

function generateMathProblem() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  currentMathAnswer = a + b;
  elements.mathProblem.textContent = `${a} + ${b} = ?`;
  elements.mathAnswer.value = "";
}

function openSortOfLock() {
  elements.lockModal.classList.remove("hidden");
  generateMathProblem();
  elements.mathAnswer.focus();
}

function checkLock() {
  const input = parseInt(elements.mathAnswer.value);
  if (input === currentMathAnswer) {
    elements.lockModal.classList.add("hidden");
    openSettings();
  } else {
    alert("答えが違います！");
    elements.mathAnswer.value = "";
  }
}

function openSettings() {
  elements.kidsView.classList.remove("active");
  setTimeout(() => {
    elements.kidsView.style.display = "none";
    elements.settingsView.style.display = "block";
    setTimeout(() => elements.settingsView.classList.add("active"), 10);
  }, 300);
  renderManageList();
}

function closeSettings() {
  elements.settingsView.classList.remove("active");
  setTimeout(() => {
    elements.settingsView.style.display = "none";
    elements.kidsView.style.display = "block";
    setTimeout(() => elements.kidsView.classList.add("active"), 10);
  }, 300);
  renderGrid(); // Refresh grid in case changes were made
}

// Event Listeners
elements.settingsBtn.addEventListener("click", openSortOfLock);
elements.closeSettingsBtn.addEventListener("click", closeSettings);
elements.addVideoBtn.addEventListener("click", addVideo);

elements.closeModalBtn.addEventListener("click", closePlayer);
elements.videoModal.addEventListener("click", (e) => {
  if (e.target === elements.videoModal) closePlayer();
});

elements.unlockBtn.addEventListener("click", checkLock);
elements.cancelLockBtn.addEventListener("click", () => {
  elements.lockModal.classList.add("hidden");
});
elements.mathAnswer.addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkLock();
});

// Initialization
renderGrid();
