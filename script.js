/* ==========================================================================
   Kongsi Landing Page Javascript Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Dynamic Footer Year
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // 2. Mobile Navbar Overlay Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const navbar = document.getElementById('mainNavbar');
  let isMenuOpen = false;

  if (mobileToggle && mobileMenu && navbar) {
    function toggleMenu() {
      isMenuOpen = !isMenuOpen;
      navbar.classList.toggle('mobile-menu-active', isMenuOpen);
      mobileMenu.style.display = isMenuOpen ? 'block' : 'none';
      mobileToggle.setAttribute('aria-expanded', isMenuOpen);
    }

    mobileToggle.addEventListener('click', toggleMenu);

    // Close mobile menu when links are clicked
    const mobileLinks = [
      document.getElementById('mobileLinkShippers'),
      document.getElementById('mobileLinkCarriers'),
      document.getElementById('mobileLinkPilot')
    ];

    mobileLinks.forEach(link => {
      if (link) {
        link.addEventListener('click', () => {
          if (isMenuOpen) toggleMenu();
        });
      }
    });
  }

  // 3. Scroll Effect for Navbar Shadow & Padding
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // 4. Scroll-Triggered Fade-Up Animations (Intersection Observer)
  const fadeElements = document.querySelectorAll('.fade-up');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    fadeElements.forEach(el => el.classList.add('is-visible'));
  }

  // 5. In-Page CTA Role Selector & URL Parameter Handler
  const roleSelect = document.getElementById('role');
  const ctaShipperBtn = document.getElementById('ctaShipperBtn');
  const ctaCarrierBtn = document.getElementById('ctaCarrierBtn');

  // In-page button clicks
  if (ctaShipperBtn && roleSelect) {
    ctaShipperBtn.addEventListener('click', () => {
      roleSelect.value = 'shipper';
    });
  }

  if (ctaCarrierBtn && roleSelect) {
    ctaCarrierBtn.addEventListener('click', () => {
      roleSelect.value = 'carrier';
    });
  }

  // 6. Language Selection & Translation System
  const langModal = document.getElementById('langModal');
  const btnLangId = document.getElementById('btnLangId');
  const btnLangEn = document.getElementById('btnLangEn');
  const langSwitchBtns = document.querySelectorAll('[data-switch-lang]');

  // Helper to translate select element options dynamically
  function translateSelectOptions(lang) {
    if (!roleSelect) return;
    
    const options = {
      en: [
        { value: "", text: "Select your role", disabled: true },
        { value: "shipper", text: "Shipper (Looking for cargo capacity)" },
        { value: "carrier", text: "Carrier (Providing truck capacity)" }
      ],
      id: [
        { value: "", text: "Pilih peran Anda", disabled: true },
        { value: "shipper", text: "Pengirim (Mencari kapasitas kargo)" },
        { value: "carrier", text: "Carrier (Menyediakan kapasitas truk)" }
      ]
    };
    
    const currentVal = roleSelect.value;
    roleSelect.innerHTML = "";
    
    options[lang].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      if (opt.disabled) {
        option.disabled = true;
        option.hidden = true;
      }
      if (opt.value === currentVal) {
        option.selected = true;
      }
      roleSelect.appendChild(option);
    });

    if (!currentVal) {
      roleSelect.value = "";
    }
  }

  // Set page language function
  function setLanguage(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('kongsi-lang', lang);

    // Update input placeholders
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
      const placeholderText = lang === 'en' 
        ? el.getAttribute('data-placeholder-en') 
        : el.getAttribute('data-placeholder-id');
      el.placeholder = placeholderText;
    });

    // Rebuild select options for the select element
    translateSelectOptions(lang);

    // Update active highlight classes on both desktop and mobile switch buttons
    langSwitchBtns.forEach(btn => {
      if (btn.getAttribute('data-switch-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialize Language State
  const savedLang = localStorage.getItem('kongsi-lang');
  if (savedLang) {
    setLanguage(savedLang);
  } else {
    // Show Popup Selection Modal
    if (langModal) {
      langModal.classList.add('active');
    }
    // Fallback default language
    setLanguage('en');
  }

  // Handle Modal Option Clicks
  if (btnLangId && langModal) {
    btnLangId.addEventListener('click', () => {
      setLanguage('id');
      langModal.classList.remove('active');
    });
  }

  if (btnLangEn && langModal) {
    btnLangEn.addEventListener('click', () => {
      setLanguage('en');
      langModal.classList.remove('active');
    });
  }

  // Handle Inline Header Switcher Buttons
  langSwitchBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetLang = btn.getAttribute('data-switch-lang');
      setLanguage(targetLang);
    });
  });

  // Check URL parameters on page load for pre-filling role
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  if (roleParam && roleSelect) {
    const lowerParam = roleParam.toLowerCase();
    if (lowerParam === 'shipper' || lowerParam === 'carrier') {
      roleSelect.value = lowerParam;
    }
  }

  // 7. Formspree AJAX Form Submission with Success State
  const form = document.getElementById('pilotForm');
  const formContainer = document.getElementById('formContainer');
  const successState = document.getElementById('successState');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (form && formContainer && successState && submitBtn) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Set Loading State
      const btnSpan = submitBtn.querySelector('span');
      const currentLang = document.documentElement.getAttribute('data-lang') || 'en';
      const loadingText = currentLang === 'en' ? 'Sending...' : 'Mengirim...';
      const originalText = btnSpan ? btnSpan.textContent : 'Join the Pilot';
      
      if (btnSpan) btnSpan.textContent = loadingText;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.style.cursor = 'not-allowed';

      // Capture form data
      const formData = new FormData(form);

      // Perform Fetch AJAX Post
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          // Hide Form Card and Show Success State Card
          formContainer.style.display = 'none';
          successState.style.display = 'flex';
          form.reset();
        } else {
          response.json().then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
              alert(data.errors.map(error => error.message).join(", "));
            } else {
              const errorText = currentLang === 'en' 
                ? "Submission failed. Please check your inputs and try again."
                : "Pengiriman gagal. Silakan periksa masukan Anda dan coba lagi.";
              alert(errorText);
            }
          });
        }
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        const connectionError = currentLang === 'en'
          ? "A network error occurred. Please check your connection and try again."
          : "Terjadi kesalahan jaringan. Silakan periksa koneksi Anda dan coba lagi.";
        alert(connectionError);
      })
      .finally(() => {
        // Reset Button Loading State
        if (btnSpan) btnSpan.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        submitBtn.style.cursor = '';
      });
    });
  }

  // 8. Reset Form (Submit Another Application)
  if (resetBtn && formContainer && successState) {
    resetBtn.addEventListener('click', () => {
      successState.style.display = 'none';
      formContainer.style.display = 'block';
      formContainer.classList.add('animate-fade-in');
    });
  }

});
