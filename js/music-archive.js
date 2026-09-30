/**
 * AUDIO ARCHIVE CD PLAYER CONTROLLER - "AN ENGINEER'S RESEARCH NOTEBOOK"
 * Section: BE-03 // AUDIO ARCHIVE
 * 
 * Features:
 * - Single lazy-loaded Audio instance
 * - Realistic CD rotation with freeze-on-pause angle preservation
 * - Monochrome oscilloscope audio visualizer (hidden when paused)
 * - Interactive archive progress block meter [ ████████░░░░░░░░ ]
 * - Favorite system (localStorage only, no backend, no count)
 * - Full playlist loop & auto-advance
 * - Accessible keyboard navigation (Spacebar, Left/Right arrows)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DATA SPECIFICATION: 10 RECORDED SESSIONS
  // =========================================================================
  const ARCHIVE_TRACKS = [
    {
      id: "audio-01",
      catalogId: "ARCHIVE // AUDIO-01",
      indexLabel: "AUDIO-01 Bulleya",
      title: "Bulleya",
      artist: "Papon",
      thumbnail: "RAW VOCALS/BULLEYA_PAPON.jpg",
      audio: "RAW VOCALS/BULLEYA_PAPON.ogg"
    },
    {
      id: "audio-02",
      catalogId: "ARCHIVE // AUDIO-02",
      indexLabel: "AUDIO-02 Chal Re Chal Re",
      title: "Chal Re Chal Re Waal × Kajre Ki Dhaar",
      artist: "Acoustic Session",
      thumbnail: "RAW VOCALS/Chalre chalre Waal X Kajre ki dhaar .png",
      audio: "RAW VOCALS/Chalre chalre Waal X Kajre ki dhaar.ogg"
    },
    {
      id: "audio-03",
      catalogId: "ARCHIVE // AUDIO-03",
      indexLabel: "AUDIO-03 Hale-E-Dil",
      title: "Hale-e-dil",
      artist: "Harshit Saxena",
      thumbnail: "RAW VOCALS/Hale-e-dilHARSHITSAXENA.jpg",
      audio: "RAW VOCALS/Hale-e-dilHARSHITSAXENA.ogg"
    },
    {
      id: "audio-04",
      catalogId: "ARCHIVE // AUDIO-04",
      indexLabel: "AUDIO-04 Kaun Tujhe",
      title: "Kaun Tujhe",
      artist: "Kishore Kumar",
      thumbnail: "RAW VOCALS/kaunTujhe Kishore Kumar.jpg",
      audio: "RAW VOCALS/kaunTujhe Kishore Kumar.ogg"
    },
    {
      id: "audio-05",
      catalogId: "ARCHIVE // AUDIO-05",
      indexLabel: "AUDIO-05 Lukk Chup Na Jao Ji",
      title: "Lukk Chup Na Jao Ji",
      artist: "Mame Khan",
      thumbnail: "RAW VOCALS/LUKK_CHUP_NA_JAOJI_mameKHAN.png",
      audio: "RAW VOCALS/LUKK_CHUP_NA_JAOJI_mameKHAN.ogg"
    },
    {
      id: "audio-06",
      catalogId: "ARCHIVE // AUDIO-06",
      indexLabel: "AUDIO-06 Mann Mera",
      title: "Mann Mera",
      artist: "Gajendra Verma",
      thumbnail: "RAW VOCALS/MannMera_GajendraVerma.jpg",
      audio: "RAW VOCALS/MannMera_GajendraVerma.ogg"
    },
    {
      id: "audio-07",
      catalogId: "ARCHIVE // AUDIO-07",
      indexLabel: "AUDIO-07 Meri Bheegi Bheegi Si",
      title: "Meri Bheegi Bheegi Si",
      artist: "Sanjeev Kumar",
      thumbnail: "RAW VOCALS/Meri-Bheegi-Bheegi-Si-Sanjeev-Kumar.jpg",
      audio: "RAW VOCALS/Meri-Bheegi-Bheegi-Si-Sanjeev-Kumar.ogg"
    },
    {
      id: "audio-08",
      catalogId: "ARCHIVE // AUDIO-08",
      indexLabel: "AUDIO-08 Paaro",
      title: "Paaro",
      artist: "Aditya Rikhari",
      thumbnail: "RAW VOCALS/Paaro-AdityaRikhari.jpg",
      audio: "RAW VOCALS/Paaro-AdityaRikhari.ogg"
    },
    {
      id: "audio-09",
      catalogId: "ARCHIVE // AUDIO-09",
      indexLabel: "AUDIO-09 Tera Mera Rishta",
      title: "Tera Mera Rishta",
      artist: "Mustafa Zahid",
      thumbnail: "RAW VOCALS/TeraMeraRishta-MUSTAFAZAHID.jpg",
      audio: "RAW VOCALS/TeraMeraRishta-MUSTAFAZAHID.ogg"
    },
    {
      id: "audio-10",
      catalogId: "ARCHIVE // AUDIO-10",
      indexLabel: "AUDIO-10 Teri Meri Kahani",
      title: "Teri Meri Kahani",
      artist: "Arijit Singh",
      thumbnail: "RAW VOCALS/teriMeriKahani_ARIJITSINGH.jfif",
      audio: "RAW VOCALS/teriMeriKahani_ARIJITSINGH.ogg"
    }
  ];

  window.ARCHIVE_TRACKS = ARCHIVE_TRACKS;

  // =========================================================================
  // 2. FAVORITE SERVICE (LOCALSTORAGE ONLY - NO BACKEND - NO COUNT)
  // =========================================================================
  const FavoriteService = {
    STORAGE_KEY: 'sk_audio_archive_favorites_v1',

    getFavorites() {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    isFavorited(trackId) {
      const favs = this.getFavorites();
      return favs.includes(trackId);
    },

    toggleFavorite(trackId) {
      try {
        let favs = this.getFavorites();
        if (favs.includes(trackId)) {
          favs = favs.filter(id => id !== trackId);
        } else {
          favs.push(trackId);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favs));
        return favs.includes(trackId);
      } catch (e) {
        return false;
      }
    }
  };

  // =========================================================================
  // 3. AUDIO ARCHIVE CD PLAYER ENGINE
  // =========================================================================
  class AudioArchivePlayer {
    constructor() {
      this.currentIndex = 0;
      this.isPlaying = false;
      this.audio = null;
      this.totalMeterBlocks = 26;
      this.isDragging = false;

      // Web Audio API Oscilloscope State
      this.audioCtx = null;
      this.analyser = null;
      this.sourceNode = null;
      this.oscAnimationId = null;
      this.isAudioCtxConnected = false;

      this.togglePlay = this.togglePlay.bind(this);
      this.prevTrack = this.prevTrack.bind(this);
      this.nextTrack = this.nextTrack.bind(this);
      this.handleFavoriteClick = this.handleFavoriteClick.bind(this);
      this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
      this.handleTrackEnded = this.handleTrackEnded.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.drawOscilloscope = this.drawOscilloscope.bind(this);
    }

    init() {
      this.deckEl = document.getElementById('music-archive-player');
      if (!this.deckEl) return;

      // Visual CD elements
      this.cdDisc = document.getElementById('cd-disc');
      this.cdArtworkImg = document.getElementById('cd-artwork-img');
      this.laserArm = document.getElementById('cd-laser-arm');
      this.statusIndicator = document.getElementById('archive-status-indicator');
      this.statusText = document.getElementById('archive-status-text');

      // Metadata elements
      this.catalogIdEl = document.getElementById('archive-catalog-id');
      this.trackCounterEl = document.getElementById('archive-track-counter');
      this.trackTitleEl = document.getElementById('archive-track-title');
      this.trackArtistEl = document.getElementById('archive-track-artist');
      this.statusBadgeEl = document.getElementById('archive-status-badge');
      this.timeDisplayEl = document.getElementById('archive-time-display');

      // Oscilloscope elements
      this.oscilloscopeContainer = document.getElementById('archive-oscilloscope-container');
      this.oscilloscopeCanvas = document.getElementById('archive-oscilloscope-canvas');
      this.canvasCtx = this.oscilloscopeCanvas ? this.oscilloscopeCanvas.getContext('2d') : null;

      // Progress elements
      this.percentReadoutEl = document.getElementById('archive-percent-readout');
      this.blockMeterEl = document.getElementById('archive-block-meter');
      this.meterBlocksFillEl = document.getElementById('meter-blocks-fill');

      // Controls elements
      this.btnPrev = document.getElementById('archive-btn-prev');
      this.btnPlay = document.getElementById('archive-btn-play');
      this.btnNext = document.getElementById('archive-btn-next');
      this.btnFav = document.getElementById('archive-btn-fav');
      this.favTextEl = document.getElementById('archive-fav-text');
      this.favHeartEl = document.getElementById('fav-heart-icon');

      this.iconPlay = document.getElementById('icon-play');
      this.iconPause = document.getElementById('icon-pause');
      this.playTextEl = document.getElementById('archive-play-text');

      // Playlist drawer
      this.tracklistGrid = document.getElementById('archive-tracklist-items');

      // Single Audio instance
      this.initAudio();

      // Render playlist drawer
      this.renderPlaylist();

      // Attach event listeners
      this.attachEvents();

      // Load initial track in stationary state
      this.loadTrack(0, false);
    }

    initAudio() {
      this.audio = new Audio();
      this.audio.preload = 'metadata'; // Lazy load current track metadata only
      this.audio.crossOrigin = 'anonymous';

      this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
      this.audio.addEventListener('ended', this.handleTrackEnded);

      this.audio.addEventListener('loadedmetadata', () => {
        this.updateTimeDisplay();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('[Audio Archive] Playback warning/fallback:', e);
        if (this.statusBadgeEl) this.statusBadgeEl.textContent = 'READY';
      });
    }

    /**
     * Initializes Web Audio API for true monochrome oscilloscope trace
     */
    ensureAudioContext() {
      if (!this.audio || this.isAudioCtxConnected) return;

      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.85;

        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        this.isAudioCtxConnected = true;
      } catch (e) {
        console.warn('[Audio Archive] Web Audio API initialization notice:', e);
      }
    }

    attachEvents() {
      // Button navigation
      if (this.btnPlay) this.btnPlay.addEventListener('click', this.togglePlay);
      if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.prevTrack(true));
      if (this.btnNext) this.btnNext.addEventListener('click', () => this.nextTrack(true));
      if (this.btnFav) this.btnFav.addEventListener('click', this.handleFavoriteClick);

      // Clicking CD disc toggles play/pause
      if (this.cdDisc) {
        this.cdDisc.addEventListener('click', this.togglePlay);
        this.cdDisc.setAttribute('tabindex', '0');
        this.cdDisc.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.togglePlay();
          }
        });
      }

      // Interactive block meter seeking
      if (this.blockMeterEl) {
        this.blockMeterEl.addEventListener('pointerdown', (e) => {
          this.isDragging = true;
          this.seekToPosition(e);
        });

        window.addEventListener('pointermove', (e) => {
          if (this.isDragging) this.seekToPosition(e);
        });

        window.addEventListener('pointerup', () => {
          this.isDragging = false;
        });

        this.blockMeterEl.addEventListener('keydown', (e) => {
          if (!this.audio || isNaN(this.audio.duration)) return;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 5);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
          }
        });
      }

      // Keyboard Accessibility
      document.addEventListener('keydown', this.handleKeyDown);

      // Screen resize block density recalculation
      window.addEventListener('resize', () => {
        this.calculateMeterBlocks();
        if (this.audio) this.updateMeter(this.audio.currentTime);
      });
      this.calculateMeterBlocks();
    }

    calculateMeterBlocks() {
      if (window.innerWidth < 480) {
        this.totalMeterBlocks = 18;
      } else if (window.innerWidth < 768) {
        this.totalMeterBlocks = 22;
      } else {
        this.totalMeterBlocks = 26;
      }
    }

    handleKeyDown(e) {
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const be03 = document.getElementById('section-be03');
      const isVisible = be03 && be03.classList.contains('archive-section-expanded');

      if (!isVisible && !this.isPlaying) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.key === 'ArrowLeft') {
        this.prevTrack(true);
      } else if (e.key === 'ArrowRight') {
        this.nextTrack(true);
      }
    }

    // =======================================================================
    // 4. TRACK LOADING & PLAYBACK CONTROL
    // =======================================================================
    loadTrack(index, autoPlay = false) {
      if (index < 0) {
        index = ARCHIVE_TRACKS.length - 1; // Loop to end
      } else if (index >= ARCHIVE_TRACKS.length) {
        index = 0; // Loop to start
      }

      this.currentIndex = index;
      const track = ARCHIVE_TRACKS[index];

      // Lazy load current track audio
      if (this.audio) {
        this.audio.pause();
        this.audio.src = track.audio;
        this.audio.load();
      }

      // Update Metadata
      if (this.catalogIdEl) this.catalogIdEl.textContent = track.catalogId;
      if (this.trackCounterEl) this.trackCounterEl.textContent = `Track ${String(index + 1).padStart(2, '0')} / ${String(ARCHIVE_TRACKS.length).padStart(2, '0')}`;
      if (this.trackTitleEl) this.trackTitleEl.textContent = track.title;
      if (this.trackArtistEl) this.trackArtistEl.textContent = track.artist;

      // Update CD Artwork
      if (this.cdArtworkImg) {
        this.cdArtworkImg.src = track.thumbnail;
        this.cdArtworkImg.alt = `${track.title} artwork`;
      }

      // Reset progress
      this.updateTimeDisplay(0, 0);
      this.updateMeter(0);

      // Update Favorite Button
      this.updateFavoriteUI();

      // Highlight active drawer item
      this.updateActivePlaylistItem();

      if (autoPlay) {
        this.play();
      } else {
        this.pause();
        if (this.statusBadgeEl) this.statusBadgeEl.textContent = 'READY';
      }
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    play() {
      if (!this.audio) return;

      this.ensureAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const p = this.audio.play();
      if (p !== undefined) {
        p.then(() => {
          this.isPlaying = true;
          this.applyPlaybackUI(true);
          this.startOscilloscope();
        }).catch((err) => {
          console.warn('[Audio Archive] Autoplay gesture needed:', err);
          this.isPlaying = false;
          this.applyPlaybackUI(false);
          this.stopOscilloscope();
        });
      }
    }

    pause() {
      if (this.audio) {
        this.audio.pause();
      }
      this.isPlaying = false;
      this.applyPlaybackUI(false);
      this.stopOscilloscope();
    }

    /**
     * Preserves exact rotation angle when paused without resetting
     */
    applyPlaybackUI(playing) {
      if (this.cdDisc) {
        if (playing) {
          this.cdDisc.classList.add('is-playing');
        } else {
          this.cdDisc.classList.remove('is-playing');
        }
      }

      if (this.laserArm) {
        if (playing) {
          this.laserArm.classList.add('is-active');
        } else {
          this.laserArm.classList.remove('is-active');
        }
      }

      if (this.statusIndicator) {
        this.statusIndicator.classList.toggle('is-playing', playing);
        this.statusIndicator.classList.toggle('is-paused', !playing && this.audio && this.audio.currentTime > 0);
      }

      const statusStr = playing ? 'PLAYING' : (this.audio && this.audio.currentTime > 0 ? 'PAUSED' : 'READY');
      if (this.statusBadgeEl) this.statusBadgeEl.textContent = statusStr;
      if (this.statusText) this.statusText.textContent = `STATUS: ${statusStr}`;

      if (this.iconPlay && this.iconPause && this.playTextEl) {
        if (playing) {
          this.iconPlay.style.display = 'none';
          this.iconPause.style.display = 'block';
          this.playTextEl.textContent = 'PAUSE';
          if (this.btnPlay) this.btnPlay.setAttribute('aria-label', 'Pause audio');
        } else {
          this.iconPlay.style.display = 'block';
          this.iconPause.style.display = 'none';
          this.playTextEl.textContent = 'PLAY';
          if (this.btnPlay) this.btnPlay.setAttribute('aria-label', 'Play audio');
        }
      }

      this.updateActivePlaylistItem();
    }

    prevTrack(autoPlay = false) {
      this.loadTrack(this.currentIndex - 1, autoPlay || this.isPlaying);
    }

    nextTrack(autoPlay = false) {
      this.loadTrack(this.currentIndex + 1, autoPlay || this.isPlaying);
    }

    handleTrackEnded() {
      this.nextTrack(true);
    }

    // =======================================================================
    // 5. PROGRESS & BLOCK METER SEEKING
    // =======================================================================
    handleTimeUpdate() {
      if (!this.audio || this.isDragging) return;

      const current = this.audio.currentTime;
      const duration = this.audio.duration;

      this.updateTimeDisplay(current, duration);
      this.updateMeter(current);
    }

    formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) return '00:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    updateTimeDisplay(cur, dur) {
      if (!this.timeDisplayEl) return;
      const currentSec = cur !== undefined ? cur : (this.audio ? this.audio.currentTime : 0);
      const totalSec = dur !== undefined ? dur : (this.audio ? this.audio.duration : 0);
      this.timeDisplayEl.textContent = `${this.formatTime(currentSec)} / ${this.formatTime(totalSec)}`;
    }

    updateMeter(currentTime) {
      if (!this.meterBlocksFillEl) return;
      const duration = this.audio && !isNaN(this.audio.duration) && this.audio.duration > 0 ? this.audio.duration : 0;

      if (duration === 0) {
        this.meterBlocksFillEl.textContent = '░'.repeat(this.totalMeterBlocks);
        if (this.percentReadoutEl) this.percentReadoutEl.textContent = '0%';
        if (this.blockMeterEl) this.blockMeterEl.setAttribute('aria-valuenow', 0);
        return;
      }

      const fraction = Math.min(1, Math.max(0, currentTime / duration));
      const filled = Math.round(fraction * this.totalMeterBlocks);
      const empty = Math.max(0, this.totalMeterBlocks - filled);
      const percent = Math.round(fraction * 100);

      this.meterBlocksFillEl.textContent = '█'.repeat(filled) + '░'.repeat(empty);
      if (this.percentReadoutEl) this.percentReadoutEl.textContent = `${percent}%`;
      if (this.blockMeterEl) this.blockMeterEl.setAttribute('aria-valuenow', percent);
    }

    seekToPosition(e) {
      if (!this.blockMeterEl || !this.audio || isNaN(this.audio.duration) || this.audio.duration <= 0) return;

      const rect = this.blockMeterEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const fraction = Math.min(1, Math.max(0, clickX / rect.width));

      const targetTime = fraction * this.audio.duration;
      this.audio.currentTime = targetTime;

      this.updateTimeDisplay(targetTime, this.audio.duration);
      this.updateMeter(targetTime);
    }

    // =======================================================================
    // 6. MONOCHROME OSCILLOSCOPE (HIDDEN WHEN PAUSED)
    // =======================================================================
    startOscilloscope() {
      if (!this.oscilloscopeContainer || !this.oscilloscopeCanvas || !this.canvasCtx || !this.analyser) return;

      this.oscilloscopeContainer.classList.add('is-active');
      if (this.oscAnimationId) cancelAnimationFrame(this.oscAnimationId);
      this.drawOscilloscope();
    }

    stopOscilloscope() {
      if (this.oscAnimationId) {
        cancelAnimationFrame(this.oscAnimationId);
        this.oscAnimationId = null;
      }
      if (this.oscilloscopeContainer) {
        this.oscilloscopeContainer.classList.remove('is-active');
      }
    }

    drawOscilloscope() {
      if (!this.isPlaying || !this.analyser || !this.canvasCtx) return;

      const bufferLength = this.analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteTimeDomainData(dataArray);

      const canvas = this.oscilloscopeCanvas;
      const ctx = this.canvasCtx;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw faint center guide grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw monochrome audio waveform
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#212121'; // Charcoal ink
      ctx.beginPath();

      const sliceWidth = (width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // 0 to 2
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      this.oscAnimationId = requestAnimationFrame(this.drawOscilloscope);
    }

    // =======================================================================
    // 7. FAVORITE BUTTON (♡ Favorite - LOCALSTORAGE ONLY)
    // =======================================================================
    handleFavoriteClick() {
      const track = ARCHIVE_TRACKS[this.currentIndex];
      if (!track) return;

      const isFav = FavoriteService.toggleFavorite(track.id);
      this.updateFavoriteUI();

      if (this.favHeartEl) {
        this.favHeartEl.style.transform = 'scale(1.35)';
        setTimeout(() => { if (this.favHeartEl) this.favHeartEl.style.transform = ''; }, 200);
      }
    }

    updateFavoriteUI() {
      const track = ARCHIVE_TRACKS[this.currentIndex];
      if (!track || !this.btnFav) return;

      const isFav = FavoriteService.isFavorited(track.id);
      this.btnFav.classList.toggle('is-favorited', isFav);

      if (this.favHeartEl) {
        this.favHeartEl.textContent = isFav ? '♥' : '♡';
      }
      if (this.favTextEl) {
        this.favTextEl.textContent = isFav ? 'Favorited' : 'Favorite';
      }
      this.btnFav.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    }

    // =======================================================================
    // 8. ARCHIVE INDEX PLAYLIST DRAWER
    // =======================================================================
    renderPlaylist() {
      if (!this.tracklistGrid) return;
      this.tracklistGrid.innerHTML = '';

      ARCHIVE_TRACKS.forEach((track, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'tracklist-item';
        item.setAttribute('data-index', index);
        item.setAttribute('aria-label', `Load ${track.indexLabel}`);

        item.innerHTML = `
          <span class="track-index-label">${track.indexLabel}</span>
          <span class="track-name-text">— ${track.artist}</span>
          <span class="track-play-indicator" aria-hidden="true">► ACTIVE</span>
        `;

        item.addEventListener('click', () => {
          if (this.currentIndex === index && this.isPlaying) {
            this.pause();
          } else {
            this.loadTrack(index, true);
          }
        });

        this.tracklistGrid.appendChild(item);
      });
    }

    updateActivePlaylistItem() {
      if (!this.tracklistGrid) return;
      const items = this.tracklistGrid.querySelectorAll('.tracklist-item');
      items.forEach((item, idx) => {
        if (idx === this.currentIndex) {
          item.classList.add('is-active');
          const indicator = item.querySelector('.track-play-indicator');
          if (indicator) {
            indicator.textContent = this.isPlaying ? '► PLAYING' : '❚❚ PAUSED';
          }
        } else {
          item.classList.remove('is-active');
        }
      });
    }
  }

  // =========================================================================
  // 9. AUTO-INITIALIZATION
  // =========================================================================
  function initMusicArchive() {
    if (window._musicArchiveInstance) return;
    const player = new AudioArchivePlayer();
    player.init();
    window._musicArchiveInstance = player;
  }

  window.initMusicArchive = initMusicArchive;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicArchive);
  } else {
    initMusicArchive();
  }
})();
