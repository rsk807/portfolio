document.addEventListener('DOMContentLoaded', () => {
  initBeyondInteractiveAccordion();
  initBeyondLightboxArrows();
  initAssetProtection();
});

window.PROTECTED_SELECTOR = window.PROTECTED_SELECTOR || '.protected-asset, .sketch-page-content, .image-frame, .blueprint-sketch-placeholder, .cd-disc, .swordsman-video, .blueprint-video-frame, .blueprint-real-media';

/**
 * Displays a stylish archival protection toast when casual asset downloads or context menus are attempted.
 */
function showProtectionNotice() {
  let notice = document.querySelector('.protection-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.className = 'protection-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.textContent = '🔒 Archival Record: Direct download is restricted. Official engineering inquiries: see Contact Memo.';
    document.body.appendChild(notice);
  }
  if (window._protectionNoticeTimer) {
    clearTimeout(window._protectionNoticeTimer);
  }
  notice.classList.remove('show');
  void notice.offsetWidth;
  notice.classList.add('show');
  window._protectionNoticeTimer = setTimeout(() => {
    notice.classList.remove('show');
  }, 2800);
}
window.showProtectionNotice = window.showProtectionNotice || showProtectionNotice;

/**
 * Attaches right-click context menu interceptors for protected archival media.
 */
function initAssetProtection() {
  if (window._assetProtectionInitialized) return;
  window._assetProtectionInitialized = true;

  document.addEventListener('contextmenu', (e) => {
    if (e.target && e.target.closest && e.target.closest(window.PROTECTED_SELECTOR)) {
      e.preventDefault();
      (window.showProtectionNotice || showProtectionNotice)();
    }
  }, { capture: true });
}
window.initAssetProtection = window.initAssetProtection || initAssetProtection;

// Archive loaded state machine to prevent duplicate dynamic DOM injection
const loadedArchives = {
  'be-01': false,
  'be-02': false,
  'be-03': false,
  'be-04': false
};

/**
 * Initializes Chapter 02 interactive accordion mechanics
 */
function initBeyondInteractiveAccordion() {
  const indexRows = document.querySelectorAll('[data-archive-toggle]');
  
  indexRows.forEach(row => {
    row.addEventListener('click', () => {
      const archiveId = row.getAttribute('data-archive-toggle');
      toggleArchive(archiveId, row);
    });
  });
}

/**
 * Toggles expanding and collapsing of archives
 * @param {string} archiveId - ID of the target archive ('be-01' to 'be-04')
 * @param {HTMLElement} activeRow - The index row element clicked
 */
function toggleArchive(archiveId, activeRow) {
  const targetSection = document.querySelector(`[data-archive-content="${archiveId}"]`);
  if (!targetSection) return;

  const isAlreadyExpanded = targetSection.classList.contains('archive-section-expanded');

  // 1. Collapse any currently expanded section first
  const currentExpandedSection = document.querySelector('.beyond-section.archive-section-expanded');
  if (currentExpandedSection) {
    const currentId = currentExpandedSection.getAttribute('data-archive-content');
    collapseArchiveSection(currentId, currentExpandedSection);
  }

  // 2. Expand clicked section if it wasn't already expanded
  if (!isAlreadyExpanded) {
    expandArchiveSection(archiveId, targetSection, activeRow);
  }
}

/**
 * Collapses the specified archive section
 */
function collapseArchiveSection(id, sectionEl) {
  sectionEl.classList.remove('archive-section-expanded');
  sectionEl.classList.add('archive-section-collapsed');

  // Deactivate active row in the index list
  const indexRow = document.querySelector(`[data-archive-toggle="${id}"]`);
  if (indexRow) {
    indexRow.classList.remove('active');
  }

  // Cleanup dynamic elements to stop downloads/processing
  if (id === 'be-04') {
    destroySwordsmanVideo();
  }
}

/**
 * Expands the specified archive section, lazy-loading contents on demand
 */
function expandArchiveSection(id, sectionEl, activeRow) {
  sectionEl.classList.remove('archive-section-collapsed');
  sectionEl.classList.add('archive-section-expanded');

  // Set active row state in index list
  activeRow.classList.add('active');

  // Trigger ephemeral red stamp animation
  triggerStampAnimation(id);

  // Lazy-load data assets on first open
  if (id === 'be-01' && !loadedArchives['be-01']) {
    lazyLoadSketches();
    loadedArchives['be-01'] = true;
  } else if (id === 'be-02' && !loadedArchives['be-02']) {
    lazyLoadSculptures();
    loadedArchives['be-02'] = true;
  } else if (id === 'be-03' && !loadedArchives['be-03']) {
    lazyLoadMusicCards();
    loadedArchives['be-03'] = true;
  } else if (id === 'be-04') {
    // Re-mount the video player dynamically on every expand
    mountSwordsmanVideo();
  }

  // Smoothly scroll to top of target opened section with sticky header offset
  setTimeout(() => {
    const yOffset = -58;
    const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }, 200);
}

/**
 * Triggers stamp animation overlay
 */
function triggerStampAnimation(id) {
  const stamp = document.getElementById(`stamp-${id}`);
  if (!stamp) return;

  stamp.classList.remove('stamped');
  void stamp.offsetWidth; // Force CSS reflow
  stamp.classList.add('stamped');
}

/**
 * Lazy loads sketches dynamically into container with sequential fade-slide animations
 */
function lazyLoadSketches() {
  const container = document.getElementById('sketches-archive-container');
  if (!container || !window.BEYOND_ASSETS || !BEYOND_ASSETS.sketches) return;

  BEYOND_ASSETS.sketches.forEach((filename, index) => {
    const src = `field_notes/recent_sketches/${filename}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'sketch-page-wrapper fade-slide-up-in';
    
    // Stagger animation delays to let images slide in sequentially
    wrapper.style.animationDelay = `${index * 0.08}s`;

    // Subtle random rotation
    const angle = (Math.random() * 4 - 2).toFixed(1);
    wrapper.style.transform = `rotate(${angle}deg)`;

    // Attach masking tape or clips
    let attachmentHtml = '';
    if (index === 0 || index === 3) {
      attachmentHtml = `<div class="paper-clip-mini" aria-hidden="true"></div>`;
    } else if (index === 1 || index === 4) {
      attachmentHtml = `<div class="washi-tape-mini" aria-hidden="true"></div>`;
    }

    wrapper.innerHTML = `
      ${attachmentHtml}
      <div class="sketch-page-content protected-asset" data-full="${src}">
        <img src="${src}" alt="Sushant Kumar Notebook Ideation Sketch ${index + 1} - Archival Technical and Design Concept Drawing" loading="lazy" draggable="false" class="protected-asset">
        <span class="sketch-spec-label">SKETCH-SPEC // REF: BE-01-${index + 1}</span>
      </div>
    `;

    wrapper.addEventListener('click', () => {
      if (window.openLightbox) {
        window.openLightbox(src);
      }
    });

    container.appendChild(wrapper);
  });
}

/**
 * Lazy loads clay sculptures into container with sequential fade-slide animations
 */
function lazyLoadSculptures() {
  const container = document.getElementById('sculptures-container');
  if (!container || !window.BEYOND_ASSETS || !BEYOND_ASSETS.sculptures) return;

  BEYOND_ASSETS.sculptures.forEach((filename, index) => {
    const src = `field_notes/Sculptures_Youngerself/${filename}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'sculpture-frame-wrapper fade-slide-up-in';
    
    // Stagger animation delays
    wrapper.style.animationDelay = `${index * 0.08}s`;

    // Random rotation
    const angle = (Math.random() * 3 - 1.5).toFixed(1);
    wrapper.style.transform = `rotate(${angle}deg)`;

    wrapper.innerHTML = `
      <div class="image-frame protected-asset" data-full="${src}">
        <img src="${src}" alt="Sushant Kumar Clay Sculpture Study ${index + 1} - Archival Handcrafted Studio Sculpture Specimen" loading="lazy" draggable="false" class="protected-asset">
        <div class="image-frame-caption">STUDIO REF // BE-02-${index + 1}</div>
      </div>
    `;

    wrapper.addEventListener('click', () => {
      if (window.openLightbox) {
        window.openLightbox(src);
      }
    });

    container.appendChild(wrapper);
  });
}

/**
 * Staggers static music corner cards entrance
 */
function lazyLoadMusicCards() {
  const cards = document.querySelectorAll('#section-be03 .music-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-slide-up-in');
  });
}

/**
 * Dynamically mounts/creates the Swordsman Katana video element when BE-04 expands
 */
function mountSwordsmanVideo() {
  const container = document.getElementById('videos-container');
  if (!container || !window.BEYOND_ASSETS || !BEYOND_ASSETS.videos || BEYOND_ASSETS.videos.length === 0) return;

  // Clear previous content
  container.innerHTML = '';

  const filename = BEYOND_ASSETS.videos[0];
  const src = `field_notes/Swordsman_Sushant/${filename}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'video-frame-wrapper fade-slide-up-in';

  wrapper.innerHTML = `
    <div class="blueprint-video-frame protected-asset">
      <video class="swordsman-video protected-asset" src="${src}" loop muted playsinline preload="metadata" webkit-playsinline draggable="false" controlsList="nodownload nofullscreen noremoteplayback" disablePictureInPicture></video>
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

  // Setup control listeners
  const video = wrapper.querySelector('.swordsman-video');
  video.draggable = false;
  video.setAttribute('draggable', 'false');
  video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
  video.setAttribute('disablePictureInPicture', '');
  video.disablePictureInPicture = true;
  const playPauseBtn = wrapper.querySelector('.play-pause-btn');
  const muteBtn = wrapper.querySelector('.mute-btn');
  const fullscreenBtn = wrapper.querySelector('.fullscreen-btn');

  // Mute preference
  const isMuted = sessionStorage.getItem('swordsman_muted') !== 'false';
  video.muted = isMuted;
  updateMuteIcon(muteBtn, isMuted);

  video.addEventListener('click', () => togglePlayPause(video, playPauseBtn));
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause(video, playPauseBtn);
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      sessionStorage.setItem('swordsman_muted', video.muted ? 'true' : 'false');
      updateMuteIcon(muteBtn, video.muted);
    });
  }

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

  video.addEventListener('play', () => {
    playPauseBtn.innerHTML = `<svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
  });
  video.addEventListener('pause', () => {
    playPauseBtn.innerHTML = `<svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
  });

  // Visbility trigger via IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  observer.observe(video);
}

/**
 * Destroys/clears Swordsman video player resources on collapse to save bandwidth/processing
 */
function destroySwordsmanVideo() {
  const container = document.getElementById('videos-container');
  if (!container) return;

  const video = container.querySelector('.swordsman-video');
  if (video) {
    video.pause();
    video.src = '';
    video.load(); // Flush buffers
  }
  container.innerHTML = '';
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

    // Ensure watermark is present in overlay
    if (!overlay.querySelector('.lightbox-watermark')) {
      const watermark = document.createElement('div');
      watermark.className = 'lightbox-watermark';
      watermark.textContent = '© Sushant Kumar • Confidential Engineering Log';
      overlay.appendChild(watermark);
    }

    // Build lists of full urls
    const sketches = BEYOND_ASSETS.sketches.map(s => `field_notes/recent_sketches/${s}`);
    const sculptures = BEYOND_ASSETS.sculptures.map(s => `field_notes/Sculptures_Youngerself/${s}`);
    const allMedia = [...sketches, ...sculptures];

    // Find current index
    const match = image.src.match(/field_notes\/.+/);
    if (!match) return;
    const currentSrc = match[0];
    const index = allMedia.indexOf(currentSrc);
    if (index === -1) return;

    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % allMedia.length;
      image.src = allMedia[nextIndex];
      image.draggable = false;
      image.setAttribute('draggable', 'false');
      image.classList.add('protected-asset');
      resetLightboxZoom();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + allMedia.length) % allMedia.length;
      image.src = allMedia[prevIndex];
      image.draggable = false;
      image.setAttribute('draggable', 'false');
      image.classList.add('protected-asset');
      resetLightboxZoom();
    }
  });
}

function resetLightboxZoom() {
  if (typeof window.resetViewerZoom === 'function') {
    window.resetViewerZoom();
    return;
  }
  if (typeof adjustZoom === 'function') {
    adjustZoom(0);
  }
  const image = document.getElementById('lightbox-image');
  if (image) {
    image.style.transform = 'scale(1) translate(0px, 0px)';
  }
}
