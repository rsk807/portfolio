/**
 * MUSIC CORNER CD PLAYER CONTROLLER - "AN ENGINEER'S RESEARCH NOTEBOOK"
 * Section: BE-03 // MUSIC CORNER
 * 
 * Features:
 * - Single lazy-loaded Audio instance
 * - Cross-browser CD rotation with pause-freeze angle preservation
 * - Monochrome oscilloscope audio visualizer (hidden when paused)
 * - Interactive tape progress block meter [ ████████░░░░░░░░ ]
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
      id: "session-01",
      catalogId: "MUSIC CORNER // SESSION-01",
      indexLabel: "SESSION 01: Bulleya",
      title: "Bulleya",
      artist: "Papon",
      thumbnail: "raw_vocals/bulleya_papon.jpg",
      audio: "raw_vocals/bulleya_papon.ogg"
    },
    {
      id: "session-02",
      catalogId: "MUSIC CORNER // SESSION-02",
      indexLabel: "SESSION 02: Chal Re Chal Re",
      title: "Chal Re Chal Re Waal × Kajre Ki Dhaar",
      artist: "Acoustic Session",
      thumbnail: "raw_vocals/chalre_chalre.png",
      audio: "raw_vocals/chalre_chalre.ogg"
    },
    {
      id: "session-03",
      catalogId: "MUSIC CORNER // SESSION-03",
      indexLabel: "SESSION 03: Hale-E-Dil",
      title: "Hale-e-dil",
      artist: "Harshit Saxena",
      thumbnail: "raw_vocals/hale_e_dil.jpg",
      audio: "raw_vocals/hale_e_dil.ogg"
    },
    {
      id: "session-04",
      catalogId: "MUSIC CORNER // SESSION-04",
      indexLabel: "SESSION 04: Kaun Tujhe",
      title: "Kaun Tujhe",
      artist: "Kishore Kumar",
      thumbnail: "raw_vocals/kaun_tujhe.jpg",
      audio: "raw_vocals/kaun_tujhe.ogg"
    },
    {
      id: "session-05",
      catalogId: "MUSIC CORNER // SESSION-05",
      indexLabel: "SESSION 05: Lukk Chup Na Jao Ji",
      title: "Lukk Chup Na Jao Ji",
      artist: "Mame Khan",
      thumbnail: "raw_vocals/lukk_chup.png",
      audio: "raw_vocals/lukk_chup.ogg"
    },
    {
      id: "session-06",
      catalogId: "MUSIC CORNER // SESSION-06",
      indexLabel: "SESSION 06: Mann Mera",
      title: "Mann Mera",
      artist: "Gajendra Verma",
      thumbnail: "raw_vocals/mann_mera.jpg",
      audio: "raw_vocals/mann_mera.ogg"
    },
    {
      id: "session-07",
      catalogId: "MUSIC CORNER // SESSION-07",
      indexLabel: "SESSION 07: Meri Bheegi Bheegi Si",
      title: "Meri Bheegi Bheegi Si",
      artist: "Sanjeev Kumar",
      thumbnail: "raw_vocals/meri_bheegi_bheegi_si.jpg",
      audio: "raw_vocals/meri_bheegi_bheegi_si.ogg"
    },
    {
      id: "session-08",
      catalogId: "MUSIC CORNER // SESSION-08",
      indexLabel: "SESSION 08: Paaro",
      title: "Paaro",
      artist: "Aditya Rikhari",
      thumbnail: "raw_vocals/paaro.jpg",
      audio: "raw_vocals/paaro.ogg"
    },
    {
      id: "session-09",
      catalogId: "MUSIC CORNER // SESSION-09",
      indexLabel: "SESSION 09: Tera Mera Rishta",
      title: "Tera Mera Rishta",
      artist: "Mustafa Zahid",
      thumbnail: "raw_vocals/tera_mera_rishta.jpg",
      audio: "raw_vocals/tera_mera_rishta.ogg"
    },
    {
      id: "session-10",
      catalogId: "MUSIC CORNER // SESSION-10",
      indexLabel: "SESSION 10: Teri Meri Kahani",
      title: "Teri Meri Kahani",
      artist: "Arijit Singh",
      thumbnail: "raw_vocals/teri_meri_kahani.jfif",
      audio: "raw_vocals/teri_meri_kahani.ogg"
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
      const legacyId = trackId.replace('session', 'audio');
      return favs.includes(trackId) || favs.includes(legacyId);
    },

    toggleFavorite(trackId) {
      try {
        let favs = this.getFavorites();
        const legacyId = trackId.replace('session', 'audio');
        if (favs.includes(trackId) || favs.includes(legacyId)) {
          favs = favs.filter(id => id !== trackId && id !== legacyId);
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
      this.audio.preload = 'auto'; // Buffer audio data for instant playback
      this.audio.volume = 0.9;
      // Note: do not set crossOrigin = 'anonymous' to prevent local/file protocol CORS playback failure

      this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
      this.audio.addEventListener('ended', this.handleTrackEnded);

      this.audio.addEventListener('loadedmetadata', () => {
        this.updateTimeDisplay();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('[Music Corner] Audio loading notice on track:', this.audio ? this.audio.src : '', e);
        if (this.statusBadgeEl) this.statusBadgeEl.textContent = 'READY';
      });
    }

    /**
     * Initializes Web Audio API for true monochrome oscilloscope trace
     */
    ensureAudioContext() {
      if (!this.audio || this.isAudioCtxConnected) return;

      // When running via file:/// protocol, Web Audio MediaElementSource is muted by browser security policy.
      // Use fallback visualizer instead of muting the audio element.
      if (window.location.protocol === 'file:') {
        this.useSyntheticVisualizer = true;
        return;
      }

      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          this.useSyntheticVisualizer = true;
          return;
        }

        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        this.isAudioCtxConnected = true;
      } catch (e) {
        console.warn('[Music Corner] Web Audio API notice (falling back to direct audio output):', e);
        this.useSyntheticVisualizer = true;
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
        this.cdArtworkImg.alt = `Sushant Kumar Music Corner - ${track.title} (${track.artist}) Acoustic Vocal Recording Artwork`;
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
      // 1. Instantly activate visual feedback on tap/click for zero-latency response
      this.isPlaying = true;
      this.applyPlaybackUI(true);
      this.startOscilloscope();

      if (!this.audio) return;

      this.ensureAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      // 2. Trigger audio playback with graceful fallback
      const p = this.audio.play();
      if (p !== undefined) {
        p.then(() => {
          this.stopSimulatedProgress();
        }).catch((err) => {
          console.warn('[Music Corner] Audio autoplay/format notice (simulating playback for visual rotation):', err);
          // Keep CD spinning and active for visual demonstration on iOS Safari or browsers without OGG support
          if (this.statusBadgeEl) this.statusBadgeEl.textContent = 'PLAYING (ACTIVE)';
          if (this.statusText) this.statusText.textContent = 'STATUS: PLAYING';
          this.startSimulatedProgress();
        });
      }
    }

    startSimulatedProgress() {
      this.stopSimulatedProgress();
      this.simulatedTime = this.simulatedTime || 0;
      this.simulatedTimer = setInterval(() => {
        if (!this.isPlaying) return;
        this.simulatedTime += 0.5;
        if (this.simulatedTime > 240) this.simulatedTime = 0;
        this.updateTimeDisplay(this.simulatedTime, 240);
        this.updateMeter(this.simulatedTime);
      }, 500);
    }

    stopSimulatedProgress() {
      if (this.simulatedTimer) {
        clearInterval(this.simulatedTimer);
        this.simulatedTimer = null;
      }
    }

    pause() {
      if (this.audio) {
        try { this.audio.pause(); } catch (e) {}
      }
      this.stopSimulatedProgress();
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
          this.cdDisc.classList.add('rotating');
          this.cdDisc.classList.remove('paused');
          // Web Animations API cross-browser hardware-accelerated fallback
          if (this.cdDisc.animate) {
            if (!this.discWebAnim) {
              try {
                this.discWebAnim = this.cdDisc.animate([
                  { transform: 'rotate(0deg)' },
                  { transform: 'rotate(360deg)' }
                ], {
                  duration: 6000,
                  iterations: Infinity,
                  easing: 'linear'
                });
              } catch (e) {}
            } else {
              try { this.discWebAnim.play(); } catch (e) {}
            }
          }
        } else {
          // Pause rotation animation at current angle without resetting
          if (this.cdDisc.classList.contains('rotating')) {
            this.cdDisc.classList.add('paused');
          }
          if (this.discWebAnim) {
            try { this.discWebAnim.pause(); } catch (e) {}
          }
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
      if (!this.isPlaying || !this.canvasCtx) return;

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

      let hasDrawn = false;
      if (this.analyser && !this.useSyntheticVisualizer) {
        const bufferLength = this.analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        // Check if there is actual audio signal
        let isSilent = true;
        for (let i = 0; i < bufferLength; i++) {
          if (Math.abs(dataArray[i] - 128) > 2) {
            isSilent = false;
            break;
          }
        }

        if (!isSilent) {
          const sliceWidth = (width * 1.0) / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          hasDrawn = true;
        }
      }

      if (!hasDrawn) {
        // Dynamic analog audio trace generated while playing
        const t = performance.now() * 0.007;
        const points = 40;
        const sliceWidth = width / points;
        let x = 0;
        for (let i = 0; i <= points; i++) {
          const w1 = Math.sin(t * 2.5 + i * 0.4) * 0.5;
          const w2 = Math.cos(t * 1.6 + i * 0.25) * 0.35;
          const y = (height / 2) + (w1 + w2) * (height * 0.3);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
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
          <span class="track-name-text">- ${track.artist}</span>
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
