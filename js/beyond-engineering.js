document.addEventListener('DOMContentLoaded', () => {
  initBeyondSketches();
  initBeyondSculptures();
  initBeyondVideos();
  initBeyondLightboxArrows();
});

/**
 * Loads sketches dynamically from BEYOND_ASSETS.sketches
 */
function initBeyondSketches() {
  const container = document.getElementById('sketches-archive-container');
  if (!container || !window.BEYOND_ASSETS || !BEYOND_ASSETS.sketches) return;

  BEYOND_ASSETS.sketches.forEach((filename, index) => {
    const src = `field_notes/recent_sketches/${filename}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'sketch-page-wrapper';
    
    // Very subtle random rotation (between -2deg and +2deg)
    const angle = (Math.random() * 4 - 2).toFixed(1);
    wrapper.style.transform = `rotate(${angle}deg)`;

    // Place paper clips or washi tape on selected items
    let attachmentHtml = '';
    if (index === 0 || index === 3) {
      attachmentHtml = `<div class="paper-clip-mini" aria-hidden="true"></div>`;
    } else if (index === 1 || index === 4) {
      attachmentHtml = `<div class="washi-tape-mini" aria-hidden="true"></div>`;
    }

    wrapper.innerHTML = `
      ${attachmentHtml}
      <div class="sketch-page-content" data-full="${src}">
        <img src="${src}" alt="Notebook Sketch ${index + 1}" loading="lazy">
        <span class="sketch-spec-label">SKETCH-SPEC // REF: BE-01-${index + 1}</span>
      </div>
    `;

    // Click handler to launch fullscreen lightbox
    wrapper.addEventListener('click', () => {
      if (window.openLightbox) {
        window.openLightbox(src);
      }
    });

    container.appendChild(wrapper);
  });
}

/**
 * Loads sculptures dynamically from BEYOND_ASSETS.sculptures
 */
function initBeyondSculptures() {
  const container = document.getElementById('sculptures-container');
  if (!container || !window.BEYOND_ASSETS || !BEYOND_ASSETS.sculptures) return;

  BEYOND_ASSETS.sculptures.forEach((filename, index) => {
    const src = `field_notes/Sculptures_Youngerself/${filename}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'sculpture-frame-wrapper';

    // Random rotation (between -1.5deg and +1.5deg)
    const angle = (Math.random() * 3 - 1.5).toFixed(1);
    wrapper.style.transform = `rotate(${angle}deg)`;

    wrapper.innerHTML = `
      <div class="image-frame" data-full="${src}">
        <img src="${src}" alt="Clay Sculpture ${index + 1}" loading="lazy">
        <div class="image-frame-caption">STUDIO REF // BE-02-${index + 1}</div>
      </div>
    `;

    // Click handler to launch fullscreen lightbox
    wrapper.addEventListener('click', () => {
      if (window.openLightbox) {
        window.openLightbox(src);
      }
    });

    container.appendChild(wrapper);
  });
}

/**
 * Loads videos dynamically and sets up viewport visibility loops and preferences
 */
function initBeyondVideos() {
  const container = document.getElementById('videos-container');
  if (!container || !window.BEYOND_ASSETS || !BEYOND_ASSETS.videos) return;

  BEYOND_ASSETS.videos.forEach((filename, index) => {
    const src = `field_notes/Swordsman_Sushant/${filename}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'video-frame-wrapper';

    wrapper.innerHTML = `
      <div class="blueprint-video-frame">
        <video class="swordsman-video" src="${src}" loop muted playsinline preload="metadata" webkit-playsinline></video>
        <div class="video-overlay-controls">
          <button class="video-control-btn play-pause-btn" aria-label="Play/Pause">
            <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <button class="video-control-btn mute-btn" aria-label="Mute/Unmute">
            <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          </button>
          <button class="video-control-btn fullscreen-btn" aria-label="Toggle Fullscreen">
            <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          </button>
        </div>
        <div class="blueprint-frame-grid-overlay">
          <span class="blueprint-frame-label">SWORDSMAN DRILLS // SEC-BE-04</span>
          <span class="blueprint-stamp">DIAGRAM REF: SK-BE-04</span>
        </div>
      </div>
    `;

    container.appendChild(wrapper);

    // Controls Logic
    const video = wrapper.querySelector('.swordsman-video');
    const playPauseBtn = wrapper.querySelector('.play-pause-btn');
    const muteBtn = wrapper.querySelector('.mute-btn');
    const fullscreenBtn = wrapper.querySelector('.fullscreen-btn');

    // Retrieve user session mute preference
    const isMuted = sessionStorage.getItem('swordsman_muted') !== 'false';
    video.muted = isMuted;
    updateMuteIcon(muteBtn, isMuted);

    // Toggle Play/Pause on click
    video.addEventListener('click', () => togglePlayPause(video, playPauseBtn));
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlayPause(video, playPauseBtn);
      });
    }

    // Toggle Mute
    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        sessionStorage.setItem('swordsman_muted', video.muted ? 'true' : 'false');
        updateMuteIcon(muteBtn, video.muted);
      });
    }

    // Fullscreen support
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        }
      });
    }

    // Dynamic button icon states on video events
    video.addEventListener('play', () => {
      playPauseBtn.innerHTML = `<svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    });
    video.addEventListener('pause', () => {
      playPauseBtn.innerHTML = `<svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    });

    // IntersectionObserver to control playback
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay blocked fallback
            video.muted = true;
            video.play().catch(() => {});
          });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(video);
  });
}

function togglePlayPause(video, btn) {
  if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
}

function updateMuteIcon(btn, isMuted) {
  if (!btn) return;
  if (isMuted) {
    btn.innerHTML = `<svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
  } else {
    btn.innerHTML = `<svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
  }
}

/**
 * Wire keyboard navigation (ArrowLeft & ArrowRight) for all images in Chapter 02 when lightbox is active.
 */
function initBeyondLightboxArrows() {
  window.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('lightbox-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    const image = document.getElementById('lightbox-image');
    if (!image || !image.src || !window.BEYOND_ASSETS) return;

    // Build lists of full urls
    const sketches = BEYOND_ASSETS.sketches.map(s => `field_notes/recent_sketches/${s}`);
    const sculptures = BEYOND_ASSETS.sculptures.map(s => `field_notes/Sculptures_Youngerself/${s}`);
    const allMedia = [...sketches, ...sculptures];

    // Find current index
    const currentSrc = image.src.replace(window.location.origin + '/', '');
    const index = allMedia.indexOf(currentSrc);
    if (index === -1) return;

    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % allMedia.length;
      image.src = allMedia[nextIndex];
      resetLightboxZoom();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + allMedia.length) % allMedia.length;
      image.src = allMedia[prevIndex];
      resetLightboxZoom();
    }
  });
}

function resetLightboxZoom() {
  if (typeof adjustZoom === 'function') {
    adjustZoom(0); // Trigger zoom/pan reset metrics safely
  }
  const image = document.getElementById('lightbox-image');
  if (image) {
    // Force transform scale 1 and center alignment resets
    image.style.transform = 'scale(1) translate(0px, 0px)';
  }
}
