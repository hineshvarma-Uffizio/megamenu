/**
 * Uffizio Mega Menu - Interactive Behavior & Accessibility
 * Features:
 * - Light Mode & Dark Mode State & Toggle
 * - Hover Intent with Debounce (no accidental closures)
 * - Keyboard Navigation & Accessibility (ARIA, ESC key to dismiss)
 * - Responsive Mobile Drawer & Accordion
 * - Dynamic Dim Backdrop for Focus
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================= 1. THEME TOGGLE (DARK / LIGHT MODE) =================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

  function updateThemeUI(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.remove('uffizio-theme-light');
      if (lightIcon) lightIcon.classList.remove('hidden');
      if (darkIcon) darkIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.add('uffizio-theme-light');
      if (lightIcon) lightIcon.classList.add('hidden');
      if (darkIcon) darkIcon.classList.remove('hidden');
    }
    if (window.uffizioAI && typeof window.uffizioAI.applyTheme === 'function') {
      window.uffizioAI.currentTheme = isDark ? 'dark' : 'light';
      window.uffizioAI.applyTheme(false);
    }
  }

  // Initialize theme from class (set by head script)
  const isInitiallyDark = document.documentElement.classList.contains('dark');
  updateThemeUI(isInitiallyDark);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', toggleTheme);
  }

  // ================= 2. DESKTOP MEGA MENU NAVIGATION =================
  const navItemsWithDropdown = document.querySelectorAll('.nav-item[data-dropdown]');
  let closeTimeout = null;
  let activeDropdown = null;

  function openDropdown(item) {
    clearTimeout(closeTimeout);
    
    // Close other active dropdowns
    navItemsWithDropdown.forEach((other) => {
      if (other !== item) closeDropdown(other);
    });

    const dropdownId = item.getAttribute('data-dropdown');
    const dropdown = document.getElementById(dropdownId);
    const button = item.querySelector('button');

    if (dropdown) {
      item.classList.add('is-active');
      dropdown.classList.add('is-active');
      if (button) button.setAttribute('aria-expanded', 'true');
      activeDropdown = dropdown;
    }
  }

  function closeDropdown(item) {
    const dropdownId = item.getAttribute('data-dropdown');
    const dropdown = document.getElementById(dropdownId);
    const button = item.querySelector('button');

    if (dropdown) {
      item.classList.remove('is-active');
      dropdown.classList.remove('is-active');
      if (button) button.setAttribute('aria-expanded', 'false');
    }

    const anyOpen = document.querySelector('.mega-menu.is-active');
    if (!anyOpen) {
      activeDropdown = null;
    }
  }

  // Hover Intent on Desktop (min-width: 1024px)
  navItemsWithDropdown.forEach((item) => {
    const dropdownId = item.getAttribute('data-dropdown');
    const dropdown = document.getElementById(dropdownId);

    const handleMouseEnter = () => {
      if (window.innerWidth >= 1024) {
        clearTimeout(closeTimeout);
        openDropdown(item);
      }
    };

    const handleMouseLeave = () => {
      if (window.innerWidth >= 1024) {
        closeTimeout = setTimeout(() => {
          closeDropdown(item);
        }, 220);
      }
    };

    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);

    if (dropdown) {
      dropdown.addEventListener('mouseenter', handleMouseEnter);
      dropdown.addEventListener('mouseleave', handleMouseLeave);
    }

    // Focusout handling: close dropdown when keyboard tab navigation leaves this item
    item.addEventListener('focusout', (e) => {
      if (window.innerWidth >= 1024) {
        if (!item.contains(e.relatedTarget)) {
          closeDropdown(item);
        }
      }
    });

    // Touchscreen / Click fallback
    const triggerBtn = item.querySelector('button');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', (e) => {
        if (window.innerWidth >= 1024) {
          e.preventDefault();
          const isOpen = dropdown && dropdown.classList.contains('is-active');
          if (isOpen) {
            closeDropdown(item);
          } else {
            openDropdown(item);
          }
        }
      });

      // Keyboard: Pressing ArrowDown on trigger opens menu & focuses first link
      triggerBtn.addEventListener('keydown', (e) => {
        if (window.innerWidth >= 1024 && e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown(item);
          const firstLink = dropdown ? dropdown.querySelector('a') : null;
          if (firstLink) firstLink.focus();
        }
      });
    }
  });

  // Clicking outside header closes all open menus
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#site-header')) {
      navItemsWithDropdown.forEach(closeDropdown);
    }
  });

  // Keyboard navigation: Escape key closes menus and restores focus
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      let triggerToRefocus = null;
      navItemsWithDropdown.forEach((item) => {
        if (item.classList.contains('is-active')) {
          triggerToRefocus = item.querySelector('button');
          closeDropdown(item);
        }
      });
      if (triggerToRefocus) {
        triggerToRefocus.focus();
      }
      closeMobileDrawer();
    }
  });

  // Close dropdown when any category or anchor link inside mega-menu is clicked
  document.querySelectorAll('.mega-menu a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      navItemsWithDropdown.forEach(closeDropdown);
    });
  });

  // ================= 3. MOBILE NAVIGATION & ACCORDION =================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  function toggleMobileDrawer() {
    const isHidden = mobileDrawer.classList.contains('hidden');
    if (isHidden) {
      mobileDrawer.classList.remove('hidden');
      hamburgerIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    } else {
      closeMobileDrawer();
    }
  }

  function closeMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('hidden');
    hamburgerIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileDrawer);
  }

  // Mobile Accordion functionality (with Smart Auto-Collapse & ARIA updates)
  const accordionButtons = document.querySelectorAll('.mobile-accordion-btn');
  accordionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const chevron = btn.querySelector('svg');
      const isCurrentlyExpanded = !content.classList.contains('hidden');

      // Smart Auto-Collapse: close all other open accordions so the drawer stays compact
      accordionButtons.forEach((otherBtn) => {
        const otherContent = otherBtn.nextElementSibling;
        const otherChevron = otherBtn.querySelector('svg');
        if (otherContent) otherContent.classList.add('hidden');
        if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
        otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked accordion: if it was closed, open it now
      if (!isCurrentlyExpanded) {
        content.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Mobile Sub-Accordion functionality (Inside Products & Software: Telematics, Commute, IoTech)
  const subAccordionButtons = document.querySelectorAll('.mobile-sub-accordion-btn');
  subAccordionButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = btn.nextElementSibling;
      const chevron = btn.querySelector('.sub-chevron-icon');
      const isCurrentlyExpanded = !content.classList.contains('hidden');

      // Auto-collapse other sub-accordions within Products & Software
      subAccordionButtons.forEach((otherBtn) => {
        const otherContent = otherBtn.nextElementSibling;
        const otherChevron = otherBtn.querySelector('.sub-chevron-icon');
        if (otherContent) otherContent.classList.add('hidden');
        if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
        otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked sub-accordion
      if (!isCurrentlyExpanded) {
        content.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close mobile drawer on desktop resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeMobileDrawer();
    }
  });

  // Close mobile drawer when an internal anchor link is clicked
  document.querySelectorAll('#mobile-drawer a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // Dynamic Header Blur & Shadow on scroll (matches live Uffizio)
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 15) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // ================= 4. ACTIVE STATE SYNCHRONIZATION & SCROLLSPY =================
  const productsNavBtn = document.getElementById('nav-products-btn');
  const discoverNavBtn = document.getElementById('nav-discover-btn');
  const resourceNavBtn = document.getElementById('nav-resource-btn');

  // List of high-level category pages (including Uffizio Group / Home)
  const categoryList = ['home', 'explore', 'uffizio-group', 'telematics', 'commute', 'iotech'];

  // Discover & Resource menu items for full navigation parity
  const discoverItems = ['about', 'careers', 'events', 'support', 'contact', 'partner'];
  const resourceItems = ['blog', 'marketing', 'industries', 'whats-new', 'uffitalks', 'use-cases', 'devices', 'hardware'];

  // Mapping from product/category ID to parent category name
  const productToCategoryMap = {
    'home': 'uffizio-group',
    'explore': 'uffizio-group',
    'uffizio-group': 'uffizio-group',
    'telematics': 'telematics',
    'trakzee': 'telematics',
    'smart-waste': 'telematics',
    'gridzee': 'telematics',
    'petzee': 'telematics',
    'elexee': 'telematics',
    'trakzee-mini': 'telematics',
    'trakzee-gsm': 'telematics',
    'commute': 'commute',
    'smartbus': 'commute',
    'rosterz': 'commute',
    'smarttranzit': 'commute',
    'iotech': 'iotech',
    'taskeye': 'iotech',
    'enarzee': 'iotech',
  };

  let isProgrammaticScroll = false;
  let scrollTimeout = null;

  // Function to clear active highlights across all menus and nav triggers
  function clearAllActiveStates() {
    if (productsNavBtn) productsNavBtn.classList.remove('is-current-page');
    if (discoverNavBtn) discoverNavBtn.classList.remove('is-current-page');
    if (resourceNavBtn) resourceNavBtn.classList.remove('is-current-page');

    document.querySelectorAll('.mega-item.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.category-header-wrap.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.mega-column.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.mobile-product-link.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.mobile-category-header.is-active').forEach((el) => el.classList.remove('is-active'));
  }

  function setActiveMegaMenuItem(targetId) {
    if (!targetId || targetId === '#' || targetId === 'home') {
      targetId = 'home';
    } else {
      targetId = targetId.replace('#', '').toLowerCase();
    }

    // 1. Clear previous active states inside all mega menus and nav buttons
    clearAllActiveStates();

    // 2. DISCOVER MENU PARITY
    if (discoverItems.includes(targetId)) {
      if (discoverNavBtn) discoverNavBtn.classList.add('is-current-page');

      const desktopDiscover = document.querySelector(`.mega-item[data-discover-item="${targetId}"]`);
      if (desktopDiscover) desktopDiscover.classList.add('is-active');

      const mobileDiscover = document.querySelector(`.mobile-product-link[data-mobile-discover-item="${targetId}"]`);
      if (mobileDiscover) mobileDiscover.classList.add('is-active');

      // Auto-open mobile discover accordion
      const mobileDiscoverContent = document.getElementById('mobile-accordion-discover');
      const mobileDiscoverBtn = mobileDiscoverContent ? mobileDiscoverContent.previousElementSibling : null;
      if (mobileDiscoverContent && mobileDiscoverBtn) {
        mobileDiscoverContent.classList.remove('hidden');
        const chevron = mobileDiscoverBtn.querySelector('svg');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        mobileDiscoverBtn.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    // 3. RESOURCE MENU PARITY
    if (resourceItems.includes(targetId)) {
      if (resourceNavBtn) resourceNavBtn.classList.add('is-current-page');

      const desktopResource = document.querySelector(`.mega-item[data-resource-item="${targetId}"]`);
      if (desktopResource) desktopResource.classList.add('is-active');

      const mobileResource = document.querySelector(`.mobile-product-link[data-mobile-resource-item="${targetId}"]`);
      if (mobileResource) mobileResource.classList.add('is-active');

      // Auto-open mobile resource accordion
      const mobileResourceContent = document.getElementById('mobile-accordion-resources');
      const mobileResourceBtn = mobileResourceContent ? mobileResourceContent.previousElementSibling : null;
      if (mobileResourceContent && mobileResourceBtn) {
        mobileResourceContent.classList.remove('hidden');
        const chevron = mobileResourceBtn.querySelector('svg');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        mobileResourceBtn.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    // 4. PRODUCTS & SOFTWARE MENU (DEFAULT / PRODUCT FLOW)
    const category = productToCategoryMap[targetId] || 'uffizio-group';
    const isCategoryPage = categoryList.includes(targetId);

    // Highlight the Products Top Nav Trigger Button ("Products & Software")
    if (productsNavBtn) {
      productsNavBtn.classList.add('is-current-page');
    }

    // In Option 2 (Column Box), the box encloses the active category OR active product's column!
    const activeColumn = document.querySelector(`.mega-column[data-column="${category}"]`);
    if (activeColumn) {
      activeColumn.classList.add('is-active');
    }

    if (isCategoryPage) {
      // 1. User is on a CATEGORY PAGE (e.g. #home, #telematics, #commute, #iotech):
      // -> ONLY activate the Category Header!
      // -> DO NOT activate any product (no green dot, no blue product text).
      const desktopCatHeader = document.querySelector(`.category-header-wrap[data-category="${category}"]`);
      if (desktopCatHeader) {
        desktopCatHeader.classList.add('is-active');
      }
      const mobileCatHeader = document.querySelector(`.mobile-category-header[data-mobile-category="${category}"]`);
      if (mobileCatHeader) {
        mobileCatHeader.classList.add('is-active');
      }
    } else {
      // 2. User is on a SPECIFIC PRODUCT PAGE (e.g. #trakzee, #smartbus, #gridzee):
      // -> ONLY activate the specific Product (green dot + blue product text)!
      // -> Category Header stays clean WHITE (no pill, no blue category title)!
      const desktopProduct = document.querySelector(`.mega-item[data-product="${targetId}"]`);
      if (desktopProduct) {
        desktopProduct.classList.add('is-active');
      }
      const mobileProduct = document.querySelector(`.mobile-product-link[data-mobile-product="${targetId}"]`);
      if (mobileProduct) {
        mobileProduct.classList.add('is-active');
      }
    }

    // Auto-open active category sub-accordion on mobile
    const mobileSubContent = document.getElementById(`mobile-sub-${category}`);
    const mobileSubBtn = document.querySelector(`.mobile-sub-accordion-btn[data-mobile-category="${category}"]`);
    if (mobileSubContent && mobileSubBtn) {
      mobileSubContent.classList.remove('hidden');
      const chevron = mobileSubBtn.querySelector('.sub-chevron-icon');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
      mobileSubBtn.setAttribute('aria-expanded', 'true');
    }
  }

  // Handle click on links
  document.querySelectorAll('a[href^="#"]').forEach((el) => {
    el.addEventListener('click', () => {
      const href = el.getAttribute('href');
      const target = href ? href.replace('#', '').toLowerCase() : '';

      if (!target || target === 'home' || target === 'explore') {
        // User clicked Home / Logo / Top / Uffizio Group redirect
        isProgrammaticScroll = true;
        clearTimeout(scrollTimeout);
        setActiveMegaMenuItem('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
        }, 800);
      } else if (discoverItems.includes(target) || resourceItems.includes(target) || productToCategoryMap[target]) {
        isProgrammaticScroll = true;
        clearTimeout(scrollTimeout);
        setActiveMegaMenuItem(target);

        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
        }, 900);
      } else {
        // Any other non-product anchor link (e.g. #demo, #contact)
        isProgrammaticScroll = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
        }, 800);
      }
    });
  });

  // Helper to handle hash changes or initial hash
  function handleHashState() {
    const hash = window.location.hash ? window.location.hash.replace('#', '').toLowerCase() : '';
    if (hash && (discoverItems.includes(hash) || resourceItems.includes(hash) || productToCategoryMap[hash])) {
      setActiveMegaMenuItem(hash);
    } else {
      setActiveMegaMenuItem('telematics');
    }
  }

  // Listen to hashchange event (e.g. back/forward browser button)
  window.addEventListener('hashchange', handleHashState);

  // IntersectionObserver / ScrollSpy:
  // Observe 'home' (Hero / Uffizio Group) + Category Sections (telematics, commute, iotech)
  // When scrolling into any section, activate that Category!
  const observedSectionIds = ['home', 'telematics', 'commute', 'iotech'];
  const observedSections = observedSectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      if (isProgrammaticScroll) return; // Prevent scrollspy conflict during click scrolling
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveMegaMenuItem(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0
    });

    observedSections.forEach((sec) => observer.observe(sec));
  }

  // Smooth scroll listener fallback: when scrolled near top, ensure Uffizio Group is active
  window.addEventListener('scroll', () => {
    if (isProgrammaticScroll) return;
    if (window.scrollY < 120) {
      setActiveMegaMenuItem('home');
    }
  }, { passive: true });

  // Language Dropdown Selector Interactivity (Desktop & Mobile)
  const langLinks = document.querySelectorAll('[data-lang-code]');
  const langBtnText = document.getElementById('lang-btn-text');
  const mobileLangCurrent = document.getElementById('mobile-lang-current');
  if (langLinks) {
    langLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const code = link.getAttribute('data-lang-code');
        if (code) {
          if (langBtnText) langBtnText.textContent = code;
          if (mobileLangCurrent) mobileLangCurrent.textContent = code;
        }
      });
    });
  }

  // Initialize on page load:
  // If URL has a specific product, category, discover, or resource hash (e.g. #trakzee, #about, #blog), activate it.
  // Otherwise default to Home (Uffizio Group active)!
  handleHashState();

  // ================= FLOATING VARIATION SWITCHER LOGIC =================
  const btnVariationPills = document.getElementById('btn-variation-pills');
  const btnVariationBox = document.getElementById('btn-variation-box');

  function setMegaMenuVariation(variation) {
    const isBox = variation === 'box';

    if (isBox) {
      document.body.classList.add('variation-column-box');
      if (btnVariationBox) {
        btnVariationBox.className = 'variation-tab-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 bg-[#0077ff] text-white shadow-md shadow-[#0077ff]/30 ring-1 ring-[#0077ff]/50';
      }
      if (btnVariationPills) {
        btnVariationPills.className = 'variation-tab-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/10';
      }
      try {
        localStorage.setItem('megamenu_v2_variation', 'box');
      } catch (e) {}
    } else {
      document.body.classList.remove('variation-column-box');
      if (btnVariationPills) {
        btnVariationPills.className = 'variation-tab-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 bg-[#0077ff] text-white shadow-md shadow-[#0077ff]/30 ring-1 ring-[#0077ff]/50';
      }
      if (btnVariationBox) {
        btnVariationBox.className = 'variation-tab-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/10';
      }
      try {
        localStorage.setItem('megamenu_v2_variation', 'pills');
      } catch (e) {}
    }
  }

  if (btnVariationPills) {
    btnVariationPills.addEventListener('click', () => setMegaMenuVariation('pills'));
  }
  if (btnVariationBox) {
    btnVariationBox.addEventListener('click', () => setMegaMenuVariation('box'));
  }

  // Check URL query parameters (e.g. ?style=box or ?variation=box) or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const initialVariationParam = urlParams.get('style') || urlParams.get('variation');
  let savedVariation = 'pills';
  try {
    savedVariation = localStorage.getItem('megamenu_v2_variation') || 'pills';
  } catch (e) {}

  if (initialVariationParam === 'box' || initialVariationParam === 'column') {
    setMegaMenuVariation('box');
  } else if (initialVariationParam === 'pills') {
    setMegaMenuVariation('pills');
  } else if (savedVariation === 'box') {
    setMegaMenuVariation('box');
  } else {
    setMegaMenuVariation('pills');
  }

  // ================= FLOATING CONTACT FORM MODAL =================
  const lcContainer = document.getElementById('lcContainer');
  const lcOverlay = document.getElementById('lcOverlay');
  const lcTabBtn = document.getElementById('lcTabBtn');
  const lcCloseBtn = document.getElementById('lcClose');
  const lcForm = document.getElementById('lcContactForm');
  const lcSuccessMsg = document.getElementById('lcSuccessMsg');

  function openContactModal() {
    if (lcContainer) lcContainer.classList.add('is-open');
    if (lcOverlay) lcOverlay.classList.add('is-active');
    document.body.classList.add('has-lc-open');
    document.body.style.overflow = 'hidden';
    const firstInput = document.getElementById('lcName');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }

  function closeContactModal() {
    if (lcContainer) lcContainer.classList.remove('is-open');
    if (lcOverlay) lcOverlay.classList.remove('is-active');
    document.body.classList.remove('has-lc-open');
    document.body.style.overflow = '';
  }

  if (lcTabBtn) {
    lcTabBtn.addEventListener('click', openContactModal);
  }
  if (lcCloseBtn) {
    lcCloseBtn.addEventListener('click', closeContactModal);
  }
  if (lcOverlay) {
    lcOverlay.addEventListener('click', closeContactModal);
  }

  // Handle ESC key to dismiss modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lcContainer && lcContainer.classList.contains('is-open')) {
      closeContactModal();
    }
  });

  // Handle Contact Form Submission with graceful feedback
  if (lcForm) {
    lcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      lcForm.classList.add('hidden');
      if (lcSuccessMsg) lcSuccessMsg.classList.remove('hidden');
      setTimeout(() => {
        closeContactModal();
        setTimeout(() => {
          lcForm.reset();
          lcForm.classList.remove('hidden');
          if (lcSuccessMsg) lcSuccessMsg.classList.add('hidden');
        }, 500);
      }, 2500);
    });
  }
});


// ========================================================
// VARIATION 5: DIRECT 3D CARD FLIP SHOWCASE
// ========================================================
let v5CardFlipped = { 1: false, 2: false, 3: false };

function toggleV5Card(num) {
  v5CardFlipped[num] = !v5CardFlipped[num];
  const flipper = document.getElementById("flipper-v5-" + num);
  const front = document.getElementById("front-v5-" + num);
  const back = document.getElementById("back-v5-" + num);
  if (!flipper) return;

  const rot = v5CardFlipped[num] ? 180 : 0;
  flipper.style.transform = "rotateY(" + rot + "deg)";
  if (front && back) {
    front.style.pointerEvents = rot < 90 ? "auto" : "none";
    back.style.pointerEvents = rot >= 90 ? "auto" : "none";
  }
  updateV5FlipButtonState();
}

function flipAllV5() {
  const allFlipped = v5CardFlipped[1] && v5CardFlipped[2] && v5CardFlipped[3];
  const targetState = !allFlipped;

  [1, 2, 3].forEach((num, index) => {
    setTimeout(() => {
      v5CardFlipped[num] = targetState;
      const flipper = document.getElementById("flipper-v5-" + num);
      const front = document.getElementById("front-v5-" + num);
      const back = document.getElementById("back-v5-" + num);
      if (!flipper) return;

      const rot = targetState ? 180 : 0;
      flipper.style.transform = "rotateY(" + rot + "deg)";
      if (front && back) {
        front.style.pointerEvents = rot < 90 ? "auto" : "none";
        back.style.pointerEvents = rot >= 90 ? "auto" : "none";
      }
    }, index * 120);
  });

  const btnText = document.getElementById("v5-flip-btn-text");
  if (btnText) {
    btnText.innerText = targetState ? "Flip to Front" : "Flip Cards";
  }
}

function updateV5FlipButtonState() {
  const allFlipped = v5CardFlipped[1] && v5CardFlipped[2] && v5CardFlipped[3];
  const btnText = document.getElementById("v5-flip-btn-text");
  if (btnText) {
    btnText.innerText = allFlipped ? "Flip to Front" : "Flip Cards";
  }
}

function setV5FlipStage(p) {
  p = Math.max(0, Math.min(1, p));

  const flipper1 = document.getElementById("flipper-v5-1");
  const flipper2 = document.getElementById("flipper-v5-2");
  const flipper3 = document.getElementById("flipper-v5-3");

  const front1 = document.getElementById("front-v5-1");
  const front2 = document.getElementById("front-v5-2");
  const front3 = document.getElementById("front-v5-3");

  const back1 = document.getElementById("back-v5-1");
  const back2 = document.getElementById("back-v5-2");
  const back3 = document.getElementById("back-v5-3");

  if (!flipper1 || !flipper2 || !flipper3) return;

  const flipStart1 = 0.35;
  const flipEnd1   = 0.68;
  const flipStart2 = 0.45;
  const flipEnd2   = 0.78;
  const flipStart3 = 0.55;
  const flipEnd3   = 0.88;

  const rot1 = Math.min(180, Math.max(0, (p - flipStart1) / (flipEnd1 - flipStart1) * 180));
  const rot2 = Math.min(180, Math.max(0, (p - flipStart2) / (flipEnd2 - flipStart2) * 180));
  const rot3 = Math.min(180, Math.max(0, (p - flipStart3) / (flipEnd3 - flipStart3) * 180));

  flipper1.style.transform = "rotateY(" + rot1.toFixed(1) + "deg)";
  flipper2.style.transform = "rotateY(" + rot2.toFixed(1) + "deg)";
  flipper3.style.transform = "rotateY(" + rot3.toFixed(1) + "deg)";

  if (front1 && back1) {
    front1.style.pointerEvents = rot1 < 90 ? "auto" : "none";
    back1.style.pointerEvents = rot1 >= 90 ? "auto" : "none";
  }
  if (front2 && back2) {
    front2.style.pointerEvents = rot2 < 90 ? "auto" : "none";
    back2.style.pointerEvents = rot2 >= 90 ? "auto" : "none";
  }
  if (front3 && back3) {
    front3.style.pointerEvents = rot3 < 90 ? "auto" : "none";
    back3.style.pointerEvents = rot3 >= 90 ? "auto" : "none";
  }

  v5CardFlipped[1] = rot1 >= 90;
  v5CardFlipped[2] = rot2 >= 90;
  v5CardFlipped[3] = rot3 >= 90;
  updateV5FlipButtonState();
}

function handleV5Scroll() {
  const track = document.getElementById("v5-scroll-track");
  if (!track) return;

  const rect = track.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  if (rect.top > 0) {
    setV5FlipStage(0);
    return;
  }

  const totalScrollable = track.offsetHeight - windowHeight;
  if (totalScrollable <= 0) return;

  const scrolled = -rect.top;
  let progress = scrolled / totalScrollable;
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;

  setV5FlipStage(progress);
}

window.addEventListener("scroll", handleV5Scroll, { passive: true });
window.addEventListener("DOMContentLoaded", handleV5Scroll);
