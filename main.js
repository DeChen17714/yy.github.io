/* ==========================================================================
   SAM YEN YAW — INTERACTIVE PORTFOLIO LOGIC
   Off-Register Design System & Accessibility Contracts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFilterTabs();
  initModals();
  initMobileMenu();
  initSmoothScroll();
});

/**
 * Case Study Filter System
 * Uses state classes (.is-hidden) instead of fragile inline styles
 */
function initFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const caseCards = document.querySelectorAll('.case-card');

  if (!filterBtns.length || !caseCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter') || 'all';

      caseCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * Accessible Modal System
 * Labeled dialogs, initial focus, focus trap, focus restoration, backdrop & Escape dismissal
 */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modalCloseBtns = document.querySelectorAll('.modal-close');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  let activeModal = null;
  let lastFocusedElement = null;
  let previousBodyOverflow = '';

  modalTriggers.forEach(trigger => {
    // Ensure keyboard accessibility for card triggers that are div elements
    if (!trigger.hasAttribute('tabindex') && trigger.tagName !== 'BUTTON' && trigger.tagName !== 'A') {
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('role', 'button');
    }

    const handleOpen = (e) => {
      e.preventDefault();
      const targetModalId = trigger.getAttribute('data-modal');
      if (!targetModalId) return;

      const targetModal = document.getElementById(targetModalId);
      if (!targetModal) return;

      lastFocusedElement = document.activeElement || trigger;
      openModal(targetModal);
    };

    trigger.addEventListener('click', handleOpen);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen(e);
      }
    });
  });

  function openModal(modalEl) {
    activeModal = modalEl;
    previousBodyOverflow = document.body.style.overflow;

    // Accessibility contracts on modal container
    const container = modalEl.querySelector('.modal-container') || modalEl;
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');

    // Wire aria-labelledby from header if present
    if (!container.hasAttribute('aria-labelledby')) {
      const heading = modalEl.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        if (!heading.id) {
          heading.id = (modalEl.id || 'modal') + '-title';
        }
        container.setAttribute('aria-labelledby', heading.id);
      }
    }

    modalEl.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Defer focus until the active class has made the dialog visible.
    const closeBtn = modalEl.querySelector('.modal-close');
    const firstFocusable = modalEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    window.setTimeout(() => {
      if (closeBtn) {
        closeBtn.focus({ preventScroll: true });
      } else if (firstFocusable) {
        firstFocusable.focus({ preventScroll: true });
      } else {
        container.focus({ preventScroll: true });
      }
    }, 350);
  }

  function closeAllModals() {
    if (!activeModal && !document.querySelector('.modal-overlay.active')) return;

    modalOverlays.forEach(overlay => overlay.classList.remove('active'));
    document.body.classList.remove('modal-open');
    document.body.style.overflow = previousBodyOverflow || '';
    activeModal = null;

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      try {
        lastFocusedElement.focus();
      } catch {
        // Safe fallback if element was removed
      }
    }
  }

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllModals();
    });
  });

  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Global key listener for Escape dismissal and Focus Trap
  document.addEventListener('keydown', (e) => {
    if (!activeModal) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeAllModals();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = Array.from(
        activeModal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !activeModal.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !activeModal.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });

  // Keep pointer and scripted focus inside the active dialog too.
  document.addEventListener('focusin', (e) => {
    if (!activeModal || activeModal.contains(e.target)) return;

    const firstFocusable = activeModal.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (firstFocusable) {
      firstFocusable.focus({ preventScroll: true });
    }
  });
}

/**
 * Mobile Navigation Toggle
 * Full button contract with aria-expanded, aria-controls, and close-after-navigation
 */
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!mobileToggle || !navLinks) return;

  // Ensure accessible attributes
  if (!mobileToggle.hasAttribute('aria-expanded')) {
    mobileToggle.setAttribute('aria-expanded', 'false');
  }
  if (!navLinks.id) {
    navLinks.id = 'nav-links';
  }
  if (!mobileToggle.hasAttribute('aria-controls')) {
    mobileToggle.setAttribute('aria-controls', navLinks.id);
  }
  if (!mobileToggle.hasAttribute('aria-label')) {
    mobileToggle.setAttribute('aria-label', 'Toggle navigation');
  }
  if (!mobileToggle.hasAttribute('role') && mobileToggle.tagName !== 'BUTTON') {
    mobileToggle.setAttribute('role', 'button');
    mobileToggle.setAttribute('tabindex', '0');
  }

  function setMenuState(open) {
    if (open) {
      navLinks.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
    } else {
      navLinks.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  mobileToggle.addEventListener('click', () => {
    const isCurrentlyActive = navLinks.classList.contains('active');
    setMenuState(!isCurrentlyActive);
  });

  mobileToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isCurrentlyActive = navLinks.classList.contains('active');
      setMenuState(!isCurrentlyActive);
    }
  });

  // Close menu after clicking any navigation link
  const menuLinks = navLinks.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  // Close when pressing Escape or clicking outside
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      setMenuState(false);
      mobileToggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !mobileToggle.contains(e.target)
    ) {
      setMenuState(false);
    }
  });
}

/**
 * Smooth Scrolling for Anchor Links
 * Respects prefers-reduced-motion
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });
}
