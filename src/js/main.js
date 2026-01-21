// ============ I18N - Language handling ============
let currentLanguage = localStorage.getItem('language') || 'fr';

// Initialize language and wire UI once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    setLanguage(currentLanguage);

    // Bind language toggle button
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
    // Carousel initializes itself in its own module below
});

/**
 * Set the current language and update all translated texts
 * @param {string} lang - Language code ('fr' | 'en')
 */
function setLanguage(lang) {
    // Resolve translation dictionary from global or window to be robust to how it's declared
    const dict = (typeof translations !== 'undefined' ? translations : (typeof window !== 'undefined' ? window.translations : undefined)) || {};
    if (!dict[lang]) {
        console.warn(`Language '${lang}' not available. Falling back to 'fr'.`);
        lang = 'fr';
    }

    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[lang] && dict[lang][key]) {
            // Preserve inline markup (e.g., span.accent) by temporarily saving children
            if (el.children.length > 0) {
                const children = Array.from(el.children);
                el.textContent = dict[lang][key];
                children.forEach(child => el.appendChild(child));
            } else {
                el.textContent = dict[lang][key];
            }
        }
    });

    // Update page title based on a stable key
    if (dict[lang] && dict[lang]['aboutMe']) {
        document.title = `Mon Portfolio - ${dict[lang]['aboutMe']}`;
    }

    updateLanguageButton();
}

function toggleLanguage() {
    const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
}

function updateLanguageButton() {
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.textContent = currentLanguage === 'fr' ? 'EN' : 'FR';
        langToggle.setAttribute('aria-label',
            currentLanguage === 'fr' ? 'Switch to English' : 'Passer au Français'
        );
    }
}
(function () {
    // ============ Carousel ============
    function ready(cb) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', cb);
        } else cb();
    }

    ready(() => {
        document.querySelectorAll('[data-carousel]').forEach(initCarousel);
    });

    function initCarousel(root) {
        const viewport = root.querySelector('.viewport');
        const track = root.querySelector('.track');
        const slides = Array.from(track?.querySelectorAll('img') || []);
        const prev = root.querySelector('[data-prev]');
        const next = root.querySelector('[data-next]');
        const dotsWrap = root.querySelector('.dots');

        if (!viewport || !track || slides.length === 0) return;

        const dots = slides.map((_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', `Aller à l’image ${i + 1}`);
            dotsWrap?.appendChild(b);
            b.addEventListener('click', () => goTo(i));
            return b;
        });

        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const slideW = () => viewport.clientWidth || viewport.getBoundingClientRect().width || 1;

        function index() {
            const w = slideW();
            return clamp(Math.round(viewport.scrollLeft / w), 0, slides.length - 1);
        }
        function goTo(i) {
            const w = slideW();
            const target = clamp(i, 0, slides.length - 1) * w;
            viewport.scrollTo({ left: Math.round(target), behavior: 'smooth' });
            updateUI();
        }
        function updateUI() {
            const i = index();
            dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
            if (prev) prev.disabled = i === 0;
            if (next) next.disabled = i === slides.length - 1;
        }

        prev?.addEventListener('click', () => goTo(index() - 1));
        next?.addEventListener('click', () => goTo(index() + 1));

        root.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); prev?.click(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); next?.click(); }
        });

        let raf = null;
        viewport.addEventListener('scroll', () => {
            if (raf) return;
            raf = requestAnimationFrame(() => { updateUI(); raf = null; });
        }, { passive: true });

        const imgs = slides.filter(s => !s.complete);
        if (imgs.length) {
            let left = imgs.length;
            imgs.forEach(img => img.addEventListener('load', () => {
                if (--left === 0) { goTo(0); updateUI(); }
            }));
        } else {
            goTo(0); updateUI();
        }
        window.addEventListener('resize', () => goTo(index()));
    }
})();

(() => {
    // ============ image zoom ============
    function setupLightbox() {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', "Agrandissement de l’image");

        const img = document.createElement('img');
        img.className = 'lightbox-img';
        overlay.appendChild(img);

        function close() {
            overlay.classList.remove('is-open');
            document.body.classList.remove('lightbox-open');
            img.src = '';
            img.alt = '';
        }

        overlay.addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });

        document.body.appendChild(overlay);

        function open(src, alt) {
            img.src = src;
            img.alt = alt || '';
            overlay.classList.add('is-open');
            document.body.classList.add('lightbox-open');
        }

        const selector = '.projectImage img, .carousel .track img, img#profilePicture';
        document.querySelectorAll(selector).forEach(el => {
            el.style.cursor = 'zoom-in';
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                open(el.src, el.getAttribute('alt'));
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLightbox);
    } else {
        setupLightbox();
    }
})();
