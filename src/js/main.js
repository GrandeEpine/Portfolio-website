// ============ I18N - Gestion des langues ============
let currentLanguage = localStorage.getItem('language') || 'fr';

// Initialiser la langue au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Définir la langue initiale
    setLanguage(currentLanguage);

    // Ajouter un écouteur au bouton de basculement
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Initialiser le carrousel et autres fonctionnalités
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
});

/**
 * Définit la langue actuelle et met à jour tous les textes
 * @param {string} lang - Code de langue ('fr' ou 'en')
 */
function setLanguage(lang) {
    // Valider la langue
    if (!translations[lang]) {
        console.warn(`Langue '${lang}' non disponible. Utilisation du français par défaut.`);
        lang = 'fr';
    }

    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;

    // Traduire tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Vérifier si l'élément contient des enfants (cas du greeting avec span.accent)
            if (el.children.length > 0) {
                // Sauvegarder les enfants
                const children = Array.from(el.children);
                el.textContent = translations[lang][key];
                // Réinsérer les enfants après le texte
                children.forEach(child => el.appendChild(child));
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    // Mettre à jour le titre de la page
    document.title = `Mon Portfolio - ${translations[lang]['aboutMe']}`;

    // Mettre à jour le bouton de langue
    updateLanguageButton();
}

/**
 * Bascule entre les langues (FR ↔ EN)
 */
function toggleLanguage() {
    const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
}

/**
 * Met à jour le texte du bouton de langue
 */
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

    // Garde‑fous
    if (!viewport || !track || slides.length === 0) return;

    // Construire la pagination
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

    // Clavier depuis la zone carrousel
    root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev?.click(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next?.click(); }
});

    // Sync pagination au scroll
    let raf = null;
    viewport.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { updateUI(); raf = null; });
}, { passive: true });

    // Initialisation fiable après chargement des images
    const imgs = slides.filter(s => !s.complete);
    if (imgs.length) {
    let left = imgs.length;
    imgs.forEach(img => img.addEventListener('load', () => {
    if (--left === 0) { goTo(0); updateUI(); }
}));
} else {
    goTo(0); updateUI();
}

    // Ajuster la position quand la largeur change
    window.addEventListener('resize', () => goTo(index()));
}
})();

