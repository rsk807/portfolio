document.addEventListener('DOMContentLoaded', () => {
  initOrganicElements();
  initNotebookTabs();
  initInkUnderlines();
  initCoverPage();
  initNavigationSystem();
  updateBookmarkTabs(0);
});

/**
 * Handles cover-specific details like dynamic dates and ribbon scrolling events.
 */
function initCoverPage() {
  // Ribbon click scrolling
  const scrollRibbon = document.getElementById('scroll-ribbon');
  if (scrollRibbon) {
    scrollRibbon.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('chapter-01') || document.getElementById('log-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Chapter 08 Return Ribbon scrolling back to Chapter 01
  const returnRibbon = document.getElementById('return-ribbon');
  if (returnRibbon) {
    returnRibbon.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('chapter-01');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/**
 * Applies minor, organic rotation variation to hand-placed elements
 * (like sticky notes, tape strips, and polaroid photos) to make the notebook feel handcrafted.
 */
function initOrganicElements() {
  // Randomize rotation of sticky notes slightly
  const stickyNotes = document.querySelectorAll('.sticky-note');
  stickyNotes.forEach(note => {
    const angle = (Math.random() * 4 - 2).toFixed(1);
    note.style.transform = `rotate(${angle}deg)`;
  });

  // Randomize polaroid frames slightly
  const imageFrames = document.querySelectorAll('.image-frame');
  imageFrames.forEach(frame => {
    const angle = (Math.random() * 3 - 1.5).toFixed(1);
    frame.style.transform = `rotate(${angle}deg)`;
  });

  // Randomize washi tape strips
  const tapes = document.querySelectorAll('.washi-tape');
  tapes.forEach(tape => {
    if (tape.classList.contains('washi-tape-top')) {
      const angle = (Math.random() * 2 - 1).toFixed(1);
      tape.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    } else if (tape.classList.contains('washi-tape-corner')) {
      const angle = (Math.random() * 10 - 50).toFixed(1);
      tape.style.transform = `rotate(${angle}deg)`;
    } else {
      const angle = (Math.random() * 4 - 2).toFixed(1);
      tape.style.transform = `rotate(${angle}deg)`;
    }
  });
}

/**
 * Simple page tab switcher that simulates shifting focus between log categories.
 */
function initNotebookTabs() {
  const tabs = document.querySelectorAll('.notebook-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Allow default links to navigate to separate pages (e.g. design-system.html)
      if (tab.getAttribute('href') && !tab.getAttribute('href').startsWith('#')) {
        return;
      }
      e.preventDefault();
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabTarget = tab.getAttribute('href') || tab.textContent.trim();
      
      const page = document.querySelector('.notebook-page');
      if (page) {
        page.style.opacity = '0.5';
        page.style.transform = 'skewY(-0.5deg) scale(0.99)';
        
        setTimeout(() => {
          page.style.opacity = '1';
          page.style.transform = 'none';
        }, 150);
      }
    });
  });
}

/**
 * Animates simulated hand-drawn ink underlines under active headings
 */
function initInkUnderlines() {
  const headers = document.querySelectorAll('.chapter-title, .case-file-title');
  
  headers.forEach(header => {
    header.addEventListener('mouseenter', () => {
      header.style.borderBottomColor = 'var(--color-accent-blue)';
    });
    
    header.addEventListener('mouseleave', () => {
      header.style.borderBottomColor = 'var(--color-ink-primary)';
    });
  });
}

/**
 * Handles dynamic chapter observation, scroll-to-clicks, drawer controls, and paper toggles.
 */
function initNavigationSystem() {
  const sections = document.querySelectorAll('.notebook-chapter-section');
  const spineLinks = document.querySelectorAll('.spine-link');
  const bookmarkTabs = document.querySelectorAll('.bookmark-tab');
  const drawerItems = document.querySelectorAll('.drawer-item');
  const headerActiveChapter = document.getElementById('header-active-chapter');
  const pageNumDisplay = document.getElementById('current-page-display');

  // Intersection Observer to track active scrolling log sheet
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -45% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const chapterNum = entry.target.getAttribute('data-chapter');
        const chapterTitle = entry.target.getAttribute('data-title');
        const pageNum = entry.target.getAttribute('data-page-num');

        // Update active class on left spine links
        spineLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Update Dynamic Bookmarks based on active chapter
        const currentChapterInt = parseInt(chapterNum, 10);
        if (!isNaN(currentChapterInt)) {
          updateBookmarkTabs(currentChapterInt);
        }

        // Update active class on mobile drawer card links
        drawerItems.forEach(item => {
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });

        // Update Header dynamic text
        if (headerActiveChapter) {
          headerActiveChapter.textContent = `Ch. ${chapterNum}: ${chapterTitle}`;
        }

        // Update Footer Page Number display
        if (pageNumDisplay) {
          pageNumDisplay.textContent = `Page ${pageNum}`;
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Hook smooth scrolling behavior
  const scrollLinks = [...spineLinks, ...bookmarkTabs, ...drawerItems];
  scrollLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = el.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        closeDrawer();
      }
    });
  });

  // Mobile Drawer triggers
  const drawerOverlay = document.getElementById('drawer-overlay');
  const indexDrawer = document.getElementById('index-drawer');
  const drawerToggle = document.getElementById('mobile-drawer-toggle');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');

  function openDrawer() {
    if (indexDrawer && drawerOverlay) {
      indexDrawer.classList.add('open');
      drawerOverlay.classList.add('open');
    }
  }

  function closeDrawer() {
    if (indexDrawer && drawerOverlay) {
      indexDrawer.classList.remove('open');
      drawerOverlay.classList.remove('open');
    }
  }

  if (drawerToggle) drawerToggle.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Lined/Graph Paper Theme Toggle
  const themeToggleBtn = document.getElementById('paper-theme-toggle');
  const notebookPage = document.querySelector('.notebook-page');

  if (themeToggleBtn && notebookPage) {
    themeToggleBtn.addEventListener('click', () => {
      const isRuled = notebookPage.classList.toggle('theme-ruled');
      themeToggleBtn.textContent = isRuled ? 'PAPER: RULED' : 'PAPER: GRID';
    });
  }
}

// Fade out loading screen on load completion
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.classList.add('fade-out');
  }
});

// Dynamic Bookmark Engine colors mapping
const BOOKMARK_COLORS = [
  'var(--color-sticky-yellow)', // CH 01
  'var(--color-sticky-pink)',   // CH 02
  'var(--color-sticky-blue)',   // CH 03
  'var(--color-sticky-pink)',   // CH 04
  'var(--color-paper-base)',    // CH 05
  'var(--color-sticky-yellow)', // CH 06
  'var(--color-sticky-blue)',   // CH 07
  'var(--color-accent-highlighter-solid)' // CH 08
];

/**
 * Regenerates the right edge notebook bookmark tabs programmatically.
 * Displays only chapters whose indexes are strictly greater than the activeChapterInt.
 * @param {number} activeChapterInt - The active chapter integer (0-8)
 */
function updateBookmarkTabs(activeChapterInt) {
  const container = document.querySelector('.notebook-bookmarks-aside');
  if (!container) return;

  container.innerHTML = '';

  const sections = Array.from(document.querySelectorAll('.notebook-chapter-section'))
    .filter(sec => {
      const ch = parseInt(sec.getAttribute('data-chapter'), 10);
      return !isNaN(ch) && ch >= 1 && ch <= 8;
    });

  const visibleSections = sections.filter(sec => {
    const ch = parseInt(sec.getAttribute('data-chapter'), 10);
    return ch > activeChapterInt;
  });

  visibleSections.forEach(sec => {
    const id = sec.getAttribute('id');
    const chNumStr = sec.getAttribute('data-chapter');
    const chNum = parseInt(chNumStr, 10);
    const title = sec.getAttribute('data-title');
    const color = BOOKMARK_COLORS[chNum - 1] || 'var(--color-sticky-yellow)';

    const tab = document.createElement('a');
    tab.href = `#${id}`;
    tab.className = 'bookmark-tab';
    tab.style.setProperty('--bookmark-color', color);
    tab.title = `Chapter ${chNumStr}: ${title}`;
    tab.textContent = chNumStr;

    // Attach click smooth scroll behavior
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      sec.scrollIntoView({ behavior: 'smooth' });
    });

    container.appendChild(tab);
  });
}
