/* ==================================================================
   VP DESIGNS / VARDEST PRO — PORTFOLIO SCRIPT
   Everything is wrapped in DOMContentLoaded so it only runs once the
   page's HTML is ready. Each feature lives in its own small function,
   called once at the bottom under "INIT — run everything".
   ================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------------
     1. PRELOADER
     Fades out the loading screen once the whole page (images, fonts,
     etc.) has finished loading. Falls back to a max 1.2s wait so the
     site never feels stuck if something loads slowly.
  ---------------------------------------------------------------- */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const hide = () => preloader.classList.add('loaded');

    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
    }
    // Safety net: never let the preloader block the site for more than 1.2s
    setTimeout(hide, 1200);
  }

  /* ----------------------------------------------------------------
     2. DARK MODE TOGGLE
     Reads/writes the user's preference to localStorage under
     "vp-theme" so it persists across visits. Defaults to the
     system preference on first visit if nothing is saved yet.
  ---------------------------------------------------------------- */
  function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const root = document.documentElement;
    const STORAGE_KEY = 'vp-theme';

    const applyTheme = (theme) => {
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        root.removeAttribute('data-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    };

    // Determine starting theme: saved preference > system preference > light
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    }

    toggleBtn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  /* ----------------------------------------------------------------
     3. SCROLL PROGRESS BAR + STICKY NAVBAR SHRINK
  ---------------------------------------------------------------- */
  function initScrollEffects() {
    const progressBar = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    const onScroll = () => {
      // Progress bar width = % of the page scrolled
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = percent + '%';

      // Shrink navbar + show back-to-top after scrolling past the hero
      if (scrollTop > 80) {
        navbar.classList.add('scrolled');
        backToTop.classList.add('show');
      } else {
        navbar.classList.remove('scrolled');
        backToTop.classList.remove('show');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load in case the page opens already scrolled

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------------
     4. MOBILE HAMBURGER MENU
  ---------------------------------------------------------------- */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu whenever a link is tapped (mobile UX nicety)
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------------
     5. ACTIVE NAV LINK ON SCROLL
     Highlights whichever section's nav link corresponds to the
     section currently in view, using IntersectionObserver.
  ---------------------------------------------------------------- */
  function initActiveNavHighlight() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' }); // triggers when a section crosses the middle of the viewport

    sections.forEach((section) => observer.observe(section));
  }

  /* ----------------------------------------------------------------
     6. SCROLL-REVEAL ANIMATIONS
     Adds .revealed to any [data-reveal] element once it enters the
     viewport. Paired with the fade/slide-up transition in style.css.
  ---------------------------------------------------------------- */
  function initScrollReveal() {
    const items = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target); // only need to animate in once
        }
      });
    }, { threshold: 0.15 });

    items.forEach((item) => observer.observe(item));
  }

  /* ----------------------------------------------------------------
     7. ANIMATED COUNTERS (stats: 150+ Projects, 50+ Clients, etc.)
     Counts up from 0 to data-target once the element scrolls into view.
  ---------------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const duration = 1400; // ms
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        // Ease-out for a natural "settling" feel near the end
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target; // avoid rounding gaps at the very end
        }
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ----------------------------------------------------------------
     8. SKILL BAR FILL ANIMATION
     Grows each .skill-fill to its data-percent width when the Skills
     section scrolls into view.
  ---------------------------------------------------------------- */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-fill');

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const percent = entry.target.getAttribute('data-percent') || 0;
          entry.target.style.width = percent + '%';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    bars.forEach((bar) => observer.observe(bar));
  }

  /* ----------------------------------------------------------------
     9. PROJECT FILTERS
     Clicking a filter button shows only project cards whose
     data-category matches (or all of them, for "All").
  ---------------------------------------------------------------- */
  function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        cards.forEach((card) => {
          const matches = filter === 'all' || card.getAttribute('data-category') === filter;
          card.classList.toggle('is-hidden', !matches);
        });
      });
    });
  }

  /* ----------------------------------------------------------------
     10. TESTIMONIAL SLIDER
     A lightweight slider: one card visible at a time, with
     prev/next buttons, clickable dots, and auto-advance every 6s.
  ---------------------------------------------------------------- */
  function initTestimonialSlider() {
    const track = document.getElementById('testimonialTrack');
    const dotsWrap = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    if (!track) return;

    const slides = track.children;
    let current = 0;
    let autoTimer;

    // Build one dot per slide
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    const dots = dotsWrap.children;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      Array.from(dots).forEach((d, i) => d.classList.toggle('active', i === current));
      resetAutoAdvance();
    }

    function resetAutoAdvance() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 6000);
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    resetAutoAdvance();
  }

  /* ----------------------------------------------------------------
     11. CONTACT FORM VALIDATION
     Simple client-side validation + a success message. Remember:
     this alone does NOT send an email anywhere — see the comment
     above the <form> in index.html for how to wire up a real
     backend (Formspree, Web3Forms, EmailJS, etc.).
  ---------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const successMsg = document.getElementById('formSuccess');
    const fields = {
      name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
      email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
      subject: { input: document.getElementById('subject'), error: document.getElementById('subjectError') },
      message: { input: document.getElementById('message'), error: document.getElementById('messageError') },
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validate() {
      let isValid = true;

      Object.entries(fields).forEach(([key, field]) => {
        const value = field.input.value.trim();
        field.error.textContent = '';

        if (!value) {
          field.error.textContent = 'This field is required.';
          isValid = false;
        } else if (key === 'email' && !emailPattern.test(value)) {
          field.error.textContent = 'Enter a valid email address.';
          isValid = false;
        }
      });

      return isValid;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault(); // prevent the default browser submit — replace with real submit logic once a backend is connected
      successMsg.classList.remove('show');

      if (validate()) {
        // ---- Placeholder "success" behaviour ----
        // Once a real form backend is connected (see note in index.html),
        // this is where you'd typically await a fetch() call before
        // showing the success message and resetting the form.
        successMsg.classList.add('show');
        form.reset();
      }
    });
  }

  /* ----------------------------------------------------------------
     12. OPTIONAL TYPING EFFECT (disabled by default)
     Set ENABLE_TYPING_EFFECT to true to have the hero's accent text
     cycle through the phrases below instead of staying static.
  ---------------------------------------------------------------- */
  function initTypingEffect() {
    const ENABLE_TYPING_EFFECT = false; // flip to true to turn this on
    if (!ENABLE_TYPING_EFFECT) return;

    const el = document.getElementById('typedText');
    if (!el) return;

    const phrases = ['Get Attention.', 'Build Trust.', 'Look Premium.', 'Stand Out.'];
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = phrases[phraseIndex];
      el.textContent = deleting
        ? current.substring(0, charIndex--)
        : current.substring(0, charIndex++);

      let delay = deleting ? 40 : 80;

      if (!deleting && charIndex === current.length + 1) {
        delay = 1400; // pause at full phrase
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 300;
      }

      setTimeout(tick, delay);
    }
    tick();
  }

  /* ----------------------------------------------------------------
     13. MISC: footer year
  ---------------------------------------------------------------- */
  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------------
     INIT — run everything
  ---------------------------------------------------------------- */
  initPreloader();
  initThemeToggle();
  initScrollEffects();
  initMobileMenu();
  initActiveNavHighlight();
  initScrollReveal();
  initCounters();
  initSkillBars();
  initProjectFilters();
  initTestimonialSlider();
  initContactForm();
  initTypingEffect();
  initFooterYear();

});
