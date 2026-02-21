// ========================================
// CONTENT-MANAGER.JS - Content Management System
// ========================================

// Default content structure
const DEFAULT_CONTENT = {
    navigation: {
        logo: 'SERMULTIMEDIA',
        menuItems: [
            { text: 'Video', href: '#video' },
            { text: 'Web', href: '#web' },
            { text: 'Gestión', href: '#upgrade' },
            { text: 'Cotizar', href: '#contacto', isButton: true }
        ]
    },
    hero: {
        slides: [
            {
                type: 'image',
                background: 'assets/bg-video.jpg',
                title: 'DALE PLAY A TU NEGOCIO',
                titleHighlight: 'SIN COMPLICACIONES',
                description: 'Videos Verticales (Reels/TikTok) diseñados estratégicamente para vender.',
                buttonText: 'Ver Planes Video',
                buttonLink: '#video'
            },
            {
                type: 'image',
                background: 'assets/bg-web.jpg',
                title: 'TU VITRINA DIGITAL',
                titleHighlight: 'ABIERTA 24/7',
                description: 'Catálogos y Menús Web inteligentes. Sin plantillas lentas, puro código veloz.',
                buttonText: 'Ver Planes Web',
                buttonLink: '#web'
            }
        ]
    },
    portfolio: {
        title: 'PORTAFOLIO',
        titleHighlight: 'VISUAL',
        videos: [
            { title: 'Gastronomía', videoUrl: 'assets/demo1.mp4' },
            { title: 'Moda / Retail', videoUrl: 'assets/demo2.mp4' },
            { title: 'Inmobiliaria', videoUrl: 'assets/demo3.mp4' }
        ]
    },
    pricing: {
        title: 'PAQUETES DE',
        titleHighlight: 'EDICIÓN',
        plans: [
            {
                name: 'PLAN 1: SEMANA FULL',
                price: '$340.000',
                paymentType: 'Pago Único',
                features: [
                    '🎬 <strong>5 Videos Verticales</strong>.',
                    '⏱️ Ágiles (15-30 seg).',
                    '🎥 1 Sesión Grabación (4h).',
                    '⚡ Entrega única.'
                ],
                buttonText: 'Elegir Semana',
                featured: false
            },
            {
                name: 'PLAN 2: MES PRO 👑',
                price: '$640.000',
                paymentType: 'Pago Único',
                features: [
                    '🎬 <strong>12 Videos Profesionales</strong>.',
                    '🧠 Mix: Tendencias + Ventas.',
                    '🎥 2 Sesiones (8h total).',
                    '🔄 2 Entregas parciales.'
                ],
                buttonText: 'Elegir Mes Pro',
                featured: true
            }
        ]
    },
    contact: {
        whatsapp: '+573054786001',
        instagram: 'https://instagram.com/sergiomultimedia',
        tiktok: 'https://tiktok.com/@sergiomultimedia',
        facebook: 'https://facebook.com/sergiomultimedia',
        googleMaps: 'https://maps.app.goo.gl/YAGimGCwMT3m8s47A'
    }
};

// Load content from localStorage or use defaults
function loadContent() {
    return Storage.get('siteContent', DEFAULT_CONTENT);
}

// Save content to localStorage
function saveContent(content) {
    return Storage.set('siteContent', content);
}

// Apply content to the live site
function applyContentToSite() {
    const content = loadContent();

    // Update navigation
    updateNavigation(content.navigation);

    // Update hero slider
    updateHeroSlider(content.hero);

    // Update portfolio
    updatePortfolio(content.portfolio);

    // Update pricing
    updatePricing(content.pricing);

    showToast('✓ Contenido aplicado correctamente', 'success');
}

// Update navigation in the live site
function updateNavigation(navData) {
    // Update logo
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        logoElement.innerHTML = `${navData.logo}<span class="dot">.</span>`;
    }

    // Update menu items
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = navData.menuItems.map(item => {
            if (item.isButton) {
                return `<a href="${item.href}" class="btn btn-sm btn-primary">${item.text}</a>`;
            }
            return `<a href="${item.href}">${item.text}</a>`;
        }).join('');
    }
}

// Update hero slider
function updateHeroSlider(heroData) {
    const heroSlider = document.querySelector('.hero-slider');
    if (!heroSlider) return;

    // Clear existing slides except dots
    const dots = heroSlider.querySelector('.slider-dots');
    heroSlider.innerHTML = '';

    // Add slides
    heroData.slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;

        if (slide.type === 'video') {
            slideDiv.innerHTML = `
                <video autoplay muted loop playsinline style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: -1;">
                    <source src="${slide.background}" type="video/mp4">
                </video>
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9));"></div>
                <div class="container slide-content">
                    <h1 data-aos="fade-up">${slide.title} <span class="text-neon">${slide.titleHighlight}</span></h1>
                    <p data-aos="fade-up" data-aos-delay="100">${slide.description}</p>
                    <div class="hero-btns" data-aos="fade-up" data-aos-delay="200">
                        <a href="${slide.buttonLink}" class="btn btn-primary">${slide.buttonText}</a>
                    </div>
                </div>
            `;
        } else {
            slideDiv.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('${slide.background}')`;
            slideDiv.innerHTML = `
                <div class="container slide-content">
                    <h1 data-aos="fade-up">${slide.title} <span class="text-neon">${slide.titleHighlight}</span></h1>
                    <p data-aos="fade-up" data-aos-delay="100">${slide.description}</p>
                    <div class="hero-btns" data-aos="fade-up" data-aos-delay="200">
                        <a href="${slide.buttonLink}" class="btn btn-primary">${slide.buttonText}</a>
                    </div>
                </div>
            `;
        }

        heroSlider.appendChild(slideDiv);
    });

    // Re-add dots
    if (dots) {
        heroSlider.appendChild(dots);
    }
}

// Update portfolio
function updatePortfolio(portfolioData) {
    const titleElement = document.querySelector('#portafolio .section-title');
    if (titleElement) {
        titleElement.innerHTML = `${portfolioData.title} <span class="text-neon">${portfolioData.titleHighlight}</span>`;
    }

    const videoGrid = document.querySelector('.video-grid');
    if (videoGrid) {
        videoGrid.innerHTML = portfolioData.videos.map((video, index) => `
            <div class="video-item" data-aos="flip-left" data-aos-delay="${index * 100}" onclick="openModal('${video.videoUrl}')">
                <div class="overlay">
                    <i class="far fa-play-circle"></i>
                    <h4>${video.title}</h4>
                </div>
                <div class="thumb-placeholder"></div>
            </div>
        `).join('');
    }
}

// Update pricing
function updatePricing(pricingData) {
    const titleElement = document.querySelector('#video .section-title');
    if (titleElement) {
        titleElement.innerHTML = `${pricingData.title} <span class="text-neon">${pricingData.titleHighlight}</span>`;
    }

    const pricingGrid = document.querySelector('#video .grid-2');
    if (pricingGrid) {
        pricingGrid.innerHTML = pricingData.plans.map((plan, index) => `
            <div class="card ${plan.featured ? 'featured' : ''}" data-aos="fade-up" data-aos-delay="${index * 100}">
                ${plan.featured ? '<div class="badge">ESTRATEGIA</div>' : ''}
                <div class="card-header">
                    <h3>${plan.name}</h3>
                    <span class="price">${plan.price}</span>
                    <p class="payment-type">${plan.paymentType}</p>
                </div>
                <div class="card-body">
                    <ul class="detailed-list">
                        ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="card-footer">
                    <a href="#contacto" class="btn ${plan.featured ? 'btn-primary' : 'btn-outline'}" onclick="preselect('${plan.name}')">${plan.buttonText}</a>
                </div>
            </div>
        `).join('');
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadContent,
        saveContent,
        applyContentToSite,
        DEFAULT_CONTENT
    };
}
