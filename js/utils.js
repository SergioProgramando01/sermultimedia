// ========================================
// UTILS.JS - Helper Functions & Utilities
// ========================================

// === SCROLL OBSERVERS ===
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
}

// === LAZY LOADING ===
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
}

// === SMOOTH SCROLL ===
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// === FORM VALIDATION ===
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\s/g, ''));
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }

        if (input.type === 'email' && !validateEmail(input.value)) {
            input.classList.add('error');
            isValid = false;
        }

        if (input.type === 'tel' && !validatePhone(input.value)) {
            input.classList.add('error');
            isValid = false;
        }
    });

    return isValid;
}

// === LOCALSTORAGE HELPERS ===
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// === DATA FORMATTERS ===
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slideInRight`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff006e' : '#00d4ff'};
        color: #000;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        z-index: 9999;
        font-weight: 600;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('animate-slideInRight');
        toast.classList.add('animate-fadeOut');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// === LOADING STATE ===
function setLoading(element, isLoading) {
    if (isLoading) {
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    } else {
        element.disabled = false;
        element.textContent = element.dataset.originalText || element.textContent;
    }
}

// === DEBOUNCE ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === THROTTLE ===
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// === COPY TO CLIPBOARD ===
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado al portapapeles', 'success');
        return true;
    } catch (err) {
        console.error('Error al copiar:', err);
        showToast('Error al copiar', 'error');
        return false;
    }
}

// === TRACKING PIXELS MANAGER ===
const TrackingManager = {
    // Load tracking settings from localStorage
    loadSettings: () => {
        return Storage.get('trackingSettings', {
            facebookPixel: { enabled: false, pixelId: '' },
            googleAnalytics: { enabled: false, measurementId: '' },
            googleTagManager: { enabled: false, containerId: '' }
        });
    },

    // Save tracking settings
    saveSettings: (settings) => {
        return Storage.set('trackingSettings', settings);
    },

    // Validate tracking IDs
    validate: {
        facebookPixel: (id) => /^\d{15,16}$/.test(id),
        googleAnalytics: (id) => /^G-[A-Z0-9]{10}$/.test(id),
        googleTagManager: (id) => /^GTM-[A-Z0-9]{7}$/.test(id)
    },

    // Generate tracking code
    generateCode: {
        facebookPixel: (pixelId) => `
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/></noscript>
<!-- End Facebook Pixel Code -->`,

        googleAnalytics: (measurementId) => `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>
<!-- End Google Analytics 4 -->`,

        googleTagManager: (containerId) => `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->`
    },

    // Inject tracking codes into page
    inject: () => {
        const settings = TrackingManager.loadSettings();
        const container = document.getElementById('tracking-scripts');
        if (!container) return;

        let html = '';

        if (settings.facebookPixel.enabled && settings.facebookPixel.pixelId) {
            html += TrackingManager.generateCode.facebookPixel(settings.facebookPixel.pixelId);
        }

        if (settings.googleAnalytics.enabled && settings.googleAnalytics.measurementId) {
            html += TrackingManager.generateCode.googleAnalytics(settings.googleAnalytics.measurementId);
        }

        if (settings.googleTagManager.enabled && settings.googleTagManager.containerId) {
            html += TrackingManager.generateCode.googleTagManager(settings.googleTagManager.containerId);
        }

        container.innerHTML = html;
    }
};

// === INITIALIZE ON DOM READY ===
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initLazyLoading();
    initSmoothScroll();
    TrackingManager.inject();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Storage,
        TrackingManager,
        showToast,
        setLoading,
        debounce,
        throttle,
        copyToClipboard,
        validateForm,
        formatCurrency,
        formatDate
    };
}
