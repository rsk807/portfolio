/*
 * INTERACTIVE BLUEPRINT VIEWER & LIGHTBOX ORCHESTRATION
 * Automatically handles lazy loading, local storage video session preferences,
 * scroll visibility pause hooks, pinch/drag pan gestures, and zoom modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  initBlueprintMedia();
  initLightbox();
});

/**
 * Initializes and lazy-loads project blueprints and media components.
 * Manages video control bindings and viewport visibility events.
 */
function initBlueprintMedia() {
  const containers = document.querySelectorAll('.interactive-blueprint');
  
  // Setup intersection observer for lazy initialization
  const mediaObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        initializeContainerMedia(container);
        observer.unobserve(container);
      }
    });
  }, { rootMargin: '100px' });
  
  containers.forEach(container => {
    mediaObserver.observe(container);
  });
}

function initializeContainerMedia(container) {
  const mediaType = container.getAttribute('data-media-type');
  const mediaSrc = container.getAttribute('data-media-src');
  const mediaFrame = container.querySelector('.blueprint-media-frame');
  const skeleton = container.querySelector('.blueprint-skeleton');
  
  if (!mediaFrame || !mediaSrc) return;
  
  if (mediaType === 'video') {
    // Generate Video element
    const video = document.createElement('video');
    video.className = 'blueprint-real-media';
    video.src = mediaSrc;
    video.loop = true;
    video.playsInline = true;
    
    // Read user mute preferences
    const isMuted = sessionStorage.getItem('vacars_muted') !== 'false';
    video.muted = isMuted;
    
    // Add custom hover hints, controls, and play listeners
    video.addEventListener('loadeddata', () => {
      skeleton.classList.add('fade-out');
      video.classList.add('loaded');
      container.classList.add('media-ready');
      video.play().catch(() => {
        // Handle autoplay policy blockages safely
        video.muted = true;
        video.play();
      });
    });
    
    mediaFrame.appendChild(video);
    setupVideoControls(container, video);
    setupVideoScrollVisibility(video);
    
  } else {
    // Generate Image element
    const img = document.createElement('img');
    img.className = 'blueprint-real-media';
    img.src = mediaSrc;
    const blueprintLabel = container.querySelector('.blueprint-label')?.textContent?.trim() || 'Blueprint Spec';
    const blueprintStamp = container.querySelector('.blueprint-stamp')?.textContent?.trim() || '';
    img.alt = `${blueprintLabel}${blueprintStamp ? ' - ' + blueprintStamp : ''} - Technical Architecture Specification by Sushant Kumar`;
    img.loading = 'lazy';
    
    img.addEventListener('load', () => {
      skeleton.classList.add('fade-out');
      img.classList.add('loaded');
      container.classList.add('media-ready');
    });
    
    mediaFrame.appendChild(img);
    
    // Bind click actions to lightbox modal launch
    container.addEventListener('click', () => {
      openLightbox(mediaSrc);
    });
  }
}

/**
 * Handles custom video overlay interfaces, mutes, toggles, progress bars.
 */
function setupVideoControls(container, video) {
  const mediaFrame = container.querySelector('.blueprint-media-frame');
  
  // Custom Controls HUD Overlay
  const HUD = document.createElement('div');
  HUD.className = 'video-overlay-controls';
  
  // Play/Pause button
  const playBtn = document.createElement('button');
  playBtn.className = 'video-btn';
  playBtn.ariaLabel = 'Play / Pause Video';
  playBtn.innerHTML = getPauseSVG();
  
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayState(video, playBtn);
  });
  
  video.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayState(video, playBtn);
  });
  
  // Progress track
  const progressContainer = document.createElement('div');
  progressContainer.className = 'video-progress-container';
  const progressBar = document.createElement('div');
  progressBar.className = 'video-progress-bar';
  progressContainer.appendChild(progressBar);
  
  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }
  });
  
  progressContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  });
  
  // Floating Sound toggle (bottom-right)
  const soundBtn = document.createElement('button');
  soundBtn.className = 'video-btn inline-mute-btn';
  soundBtn.ariaLabel = video.muted ? 'Unmute' : 'Mute';
  soundBtn.innerHTML = video.muted ? getMuteSVG() : getVolumeSVG();
  
  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    soundBtn.innerHTML = video.muted ? getMuteSVG() : getVolumeSVG();
    soundBtn.ariaLabel = video.muted ? 'Unmute' : 'Mute';
    sessionStorage.setItem('vacars_muted', video.muted ? 'true' : 'false');
  });
  
  HUD.appendChild(playBtn);
  HUD.appendChild(progressContainer);
  HUD.appendChild(soundBtn);
  
  mediaFrame.appendChild(HUD);
  
  // Fullscreen double-click hook
  video.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
  });
}

function togglePlayState(video, button) {
  if (video.paused) {
    video.play();
    button.innerHTML = getPauseSVG();
  } else {
    video.pause();
    button.innerHTML = getPlaySVG();
  }
}

/**
 * Automates playback suspension when items roll out of viewport.
 */
function setupVideoScrollVisibility(video) {
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });
  
  visibilityObserver.observe(video);
}

/* Modal Lightbox State Management Variables */
let zoomScale = 1.0;
let currentRotation = 0;
let fitMode = 'auto'; // 'auto' | 'width' | 'height' | 'original'
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;
let touchStartDist = 0;
let naturalWidth = 0, naturalHeight = 0;

function isRotatedOdd(deg) {
  const norm = Math.abs(Math.round(deg / 90)) % 4;
  return norm === 1 || norm === 3;
}

function getViewportDimensions() {
  const container = document.getElementById('lightbox-container');
  const w = container ? container.clientWidth : window.innerWidth;
  const h = container ? container.clientHeight : window.innerHeight;
  const isMobile = window.innerWidth <= 600;
  const padX = isMobile ? 16 : 48;
  const padY = isMobile ? 72 : 96;
  return {
    availWidth: Math.max(100, w - padX),
    availHeight: Math.max(100, h - padY)
  };
}

function getBaseScaleForMode(mode, visW, visH, availW, availH) {
  if (visW <= 0 || visH <= 0) return 1.0;
  switch (mode) {
    case 'width':
      return availW / visW;
    case 'height':
      return availH / visH;
    case 'original':
      return 1.0;
    case 'auto':
    default: {
      // Auto detect orientation:
      // Uses portrait layout for tall images (constrained by height)
      // Uses landscape layout for wide images (constrained by width)
      return Math.min(availW / visW, availH / visH);
    }
  }
}

function applyTransform(animated = false) {
  const image = document.getElementById('lightbox-image');
  if (!image) return;

  const nw = naturalWidth || image.naturalWidth || 800;
  const nh = naturalHeight || image.naturalHeight || 600;
  if (nw <= 0 || nh <= 0) return;

  const { availWidth, availHeight } = getViewportDimensions();
  const isRot = isRotatedOdd(currentRotation);
  const visW = isRot ? nh : nw;
  const visH = isRot ? nw : nh;

  const baseScale = getBaseScaleForMode(fitMode, visW, visH, availWidth, availHeight);
  const totalScale = baseScale * zoomScale;

  if (animated && !isDragging) {
    image.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
  } else if (isDragging) {
    image.style.transition = 'none';
  }

  // Pure CSS transform matrix: translate in screen coordinates -> rotate around center -> scale
  image.style.transform = `translate3d(${translateX}px, ${translateY}px, 0px) rotate(${currentRotation}deg) scale(${totalScale})`;

  // Update zoom indicator readout (relative to auto fit baseline)
  const zoomVal = document.getElementById('zoom-val');
  if (zoomVal) {
    const autoScale = getBaseScaleForMode('auto', visW, visH, availWidth, availHeight);
    const displayPercent = Math.round((totalScale / autoScale) * 100);
    zoomVal.textContent = `${displayPercent}%`;
  }
}

function rotateLeft() {
  currentRotation -= 90;
  translateX = 0;
  translateY = 0;
  applyTransform(true);
}

function rotateRight() {
  currentRotation += 90;
  translateX = 0;
  translateY = 0;
  applyTransform(true);
}

function setFitMode(mode) {
  fitMode = mode;
  zoomScale = 1.0;
  translateX = 0;
  translateY = 0;
  updateActiveFitBtn();
  applyTransform(true);
}

function updateActiveFitBtn() {
  const fitBtns = document.querySelectorAll('.lightbox-fit-btn');
  fitBtns.forEach(btn => {
    btn.classList.toggle('active', btn.id === `fit-${fitMode}`);
  });
}

function adjustZoom(amt) {
  if (amt === 0) {
    zoomScale = 1.0;
    translateX = 0;
    translateY = 0;
    applyTransform(true);
    return;
  }
  
  if (amt > 0) {
    zoomScale = Math.min(6.0, zoomScale * 1.25);
  } else {
    zoomScale = Math.max(0.15, zoomScale * 0.8);
  }
  
  if (zoomScale <= 1.0 && fitMode === 'auto') {
    translateX = 0;
    translateY = 0;
  }
  applyTransform(true);
}

window.adjustZoom = adjustZoom;
window.resetViewerZoom = function() {
  translateX = 0;
  translateY = 0;
  zoomScale = 1.0;
  const image = document.getElementById('lightbox-image');
  if (!image) return;

  function onNextImageReady() {
    naturalWidth = image.naturalWidth;
    naturalHeight = image.naturalHeight;
    image.style.width = naturalWidth + 'px';
    image.style.height = naturalHeight + 'px';
    image.style.maxWidth = 'none';
    image.style.maxHeight = 'none';
    applyTransform(true);
  }

  if (image.complete && image.naturalWidth > 0) {
    onNextImageReady();
  } else {
    image.onload = onNextImageReady;
  }
};

/**
 * Lightbox modal implementation with rotation, fit modes, zoom, pan, wheel, pinch gesture handlers.
 */
function initLightbox() {
  const overlay = document.getElementById('lightbox-overlay');
  const closeBtn = document.getElementById('lightbox-close');
  const imgWrapper = document.getElementById('lightbox-img-wrapper');
  const image = document.getElementById('lightbox-image');
  
  const rotateLeftBtn = document.getElementById('rotate-left');
  const rotateRightBtn = document.getElementById('rotate-right');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const fitAutoBtn = document.getElementById('fit-auto');
  const fitWidthBtn = document.getElementById('fit-width');
  const fitHeightBtn = document.getElementById('fit-height');
  const fitOriginalBtn = document.getElementById('fit-original');
  
  if (!overlay || !closeBtn || !image || !imgWrapper) return;
  
  window.openLightbox = function(src) {
    image.src = src;
    currentRotation = 0; // Requirement 5: Do not auto-rotate images. Allow users to decide orientation manually.
    fitMode = 'auto';
    zoomScale = 1.0;
    translateX = 0;
    translateY = 0;
    updateActiveFitBtn();

    function onImageReady() {
      naturalWidth = image.naturalWidth || 1200;
      naturalHeight = image.naturalHeight || 900;
      image.style.width = naturalWidth + 'px';
      image.style.height = naturalHeight + 'px';
      image.style.maxWidth = 'none';
      image.style.maxHeight = 'none';
      applyTransform(true);
    }

    if (image.complete && image.naturalWidth > 0) {
      onImageReady();
    } else {
      image.onload = onImageReady;
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scrolling
  };
  
  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (image) {
        image.src = '';
        image.style.transform = '';
        image.style.width = '';
        image.style.height = '';
        image.style.maxWidth = '';
        image.style.maxHeight = '';
      }
      currentRotation = 0;
      zoomScale = 1.0;
      translateX = 0;
      translateY = 0;
    }, 400);
  }
  
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === document.getElementById('lightbox-container')) {
      closeLightbox();
    }
  });
  
  // Keyboard Shortcuts: R = Rotate Right, Shift+R = Rotate Left, Esc = Close
  window.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;

    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      if (e.shiftKey) {
        rotateLeft();
      } else {
        rotateRight();
      }
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      adjustZoom(0.25);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      adjustZoom(-0.25);
    } else if (e.key === '0') {
      e.preventDefault();
      setFitMode('auto');
    }
  });
  
  // Rotation controls
  if (rotateLeftBtn) rotateLeftBtn.addEventListener('click', rotateLeft);
  if (rotateRightBtn) rotateRightBtn.addEventListener('click', rotateRight);

  // Zoom buttons
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => adjustZoom(0.25));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => adjustZoom(-0.25));
  }

  // Fit mode buttons
  if (fitAutoBtn) fitAutoBtn.addEventListener('click', () => setFitMode('auto'));
  if (fitWidthBtn) fitWidthBtn.addEventListener('click', () => setFitMode('width'));
  if (fitHeightBtn) fitHeightBtn.addEventListener('click', () => setFitMode('height'));
  if (fitOriginalBtn) fitOriginalBtn.addEventListener('click', () => setFitMode('original'));

  // Window resize handler
  window.addEventListener('resize', () => {
    if (overlay.classList.contains('active')) {
      applyTransform(false);
    }
  });
  
  // Wheel scroll zoom hook
  imgWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.2 : -0.2;
    adjustZoom(factor);
  }, { passive: false });
  
  // Drag and pan actions
  imgWrapper.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    applyTransform(false);
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform(false);
  });
  
  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      applyTransform(true);
    }
  });
  
  // Mobile touch gestures (Pinch & Pan)
  imgWrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
      applyTransform(false);
    } else if (e.touches.length === 2) {
      isDragging = false;
      touchStartDist = getTouchDistance(e);
    }
  }, { passive: true });
  
  imgWrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      applyTransform(false);
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      e.preventDefault();
      const currentDist = getTouchDistance(e);
      const diff = currentDist / touchStartDist;
      zoomScale = Math.min(6.0, Math.max(0.15, zoomScale * diff));
      touchStartDist = currentDist;
      applyTransform(false);
    }
  }, { passive: false });
  
  imgWrapper.addEventListener('touchend', () => {
    isDragging = false;
    touchStartDist = 0;
    applyTransform(true);
  });
}

function getTouchDistance(e) {
  return Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY
  );
}

/* SVG Assets Mocks */
function getPlaySVG() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}
function getPauseSVG() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
}
function getVolumeSVG() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
}
function getMuteSVG() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
}
