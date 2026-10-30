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
      if (lightIcon) lightIcon.classList.remove('hidden');
      if (darkIcon) darkIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      if (lightIcon) lightIcon.classList.add('hidden');
      if (darkIcon) darkIcon.classList.remove('hidden');
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

  // Dynamic Header Blur & Shadow on scroll (matches live Uffizio & Instagram)
  const siteHeader = document.getElementById('site-header');
  const siteHeaderBlur = document.getElementById('site-header-blur');
  if (siteHeader) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 15) {
        siteHeader.classList.add('scrolled');
        if (siteHeaderBlur) siteHeaderBlur.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
        if (siteHeaderBlur) siteHeaderBlur.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // ================= 4. ACTIVE STATE SYNCHRONIZATION & SCROLLSPY =================
  const productsNavBtn = document.getElementById('nav-products-btn');

  // List of high-level category pages
  const categoryList = ['telematics', 'commute', 'iotech'];

  // Mapping from product/category ID to parent category name
  const productToCategoryMap = {
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

  // Function to completely clear all active highlights (used when on Home or outside product/category pages)
  function clearAllActiveStates() {
    if (productsNavBtn) {
      productsNavBtn.classList.remove('is-current-page');
    }
    document.querySelectorAll('.mega-item.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.category-header-wrap.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.mobile-product-link.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.mobile-category-header.is-active').forEach((el) => el.classList.remove('is-active'));
  }

  function setActiveMegaMenuItem(targetId) {
    if (!targetId || targetId === 'home' || targetId === '#') {
      clearAllActiveStates();
      return;
    }
    targetId = targetId.replace('#', '').toLowerCase();

    const category = productToCategoryMap[targetId];
    if (!category) {
      clearAllActiveStates();
      return; // not a product or category in the mega menu
    }

    const isCategoryPage = categoryList.includes(targetId);

    // 1. Highlight the Top Nav Trigger Button ("Products & Software")
    if (productsNavBtn) {
      productsNavBtn.classList.add('is-current-page');
    }

    // 2. Clear previous active states inside the mega menu
    document.querySelectorAll('.mega-item.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.category-header-wrap.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.mobile-product-link.is-active').forEach((el) => el.classList.remove('is-active'));
    document.querySelectorAll('.mobile-category-header.is-active').forEach((el) => el.classList.remove('is-active'));

    // 3. Activate the matching Category Header (desktop & mobile)
    const desktopCatHeader = document.querySelector(`.category-header-wrap[data-category="${category}"]`);
    if (desktopCatHeader) {
      desktopCatHeader.classList.add('is-active');
    }
    const mobileCatHeader = document.querySelector(`.mobile-category-header[data-mobile-category="${category}"]`);
    if (mobileCatHeader) {
      mobileCatHeader.classList.add('is-active');
    }

    // 4. RULE: When on Category page (e.g. #telematics, #commute, #iotech):
    // DO NOT show active / green dot on any product!
    // ONLY show green dot when on a specific Product page!
    if (!isCategoryPage) {
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

      if (!target || target === 'home') {
        // User clicked Home / Logo / Top / Uffizio Group redirect
        isProgrammaticScroll = true;
        clearTimeout(scrollTimeout);
        clearAllActiveStates();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
        }, 800);
      } else if (productToCategoryMap[target]) {
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
        clearAllActiveStates();
        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
        }, 800);
      }
    });
  });

  // Listen to hashchange event (e.g. back/forward browser button)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash ? window.location.hash.replace('#', '').toLowerCase() : '';
    if (hash && productToCategoryMap[hash]) {
      setActiveMegaMenuItem(hash);
    } else {
      clearAllActiveStates();
    }
  });

  // IntersectionObserver / ScrollSpy:
  // Observe 'home' (Hero Section) + Category Sections (telematics, commute, iotech)
  // When scrolling onto 'home', clear all active highlights!
  // When scrolling into a category section, activate that Category (with NO product active)!
  const observedSectionIds = ['home', ...categoryList];
  const observedSections = observedSectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      if (isProgrammaticScroll) return; // Prevent scrollspy conflict during click scrolling
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'home') {
            clearAllActiveStates();
          } else {
            setActiveMegaMenuItem(entry.target.id);
          }
        }
      });
    }, {
      rootMargin: '-15% 0px -55% 0px',
      threshold: 0
    });

    observedSections.forEach((sec) => observer.observe(sec));
  }

  // Smooth scroll listener fallback: when scrolled near top, ensure Home state has no active selection
  window.addEventListener('scroll', () => {
    if (isProgrammaticScroll) return;
    if (window.scrollY < 120) {
      clearAllActiveStates();
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
  // If URL has a specific product or category hash (e.g. #trakzee), activate it.
  // When on Uffizio Home (no hash or #home): NO product or category should be selected!
  const initialHash = window.location.hash ? window.location.hash.replace('#', '').toLowerCase() : '';
  if (initialHash && productToCategoryMap[initialHash]) {
    setActiveMegaMenuItem(initialHash);
  } else {
    clearAllActiveStates();
  }
});
