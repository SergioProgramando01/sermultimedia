// ========================================
// DASHBOARD.JS - Dashboard Functionality
// ========================================

// Default password (should be changed by user)
const DEFAULT_PASSWORD = 'admin123';

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('dashboardAuth') === 'true';
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

// Show login screen
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardMain').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardMain').style.display = 'flex';
    loadTrackingSettings();
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('passwordInput').value;
    const storedPassword = localStorage.getItem('dashboardPassword') || DEFAULT_PASSWORD;

    if (password === storedPassword) {
        localStorage.setItem('dashboardAuth', 'true');
        showDashboard();
        showToast('¡Bienvenido al Dashboard!', 'success');
    } else {
        showToast('Contraseña incorrecta', 'error');
        document.getElementById('passwordInput').value = '';
    }
}

// Handle logout
function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('dashboardAuth');
        showLogin();
        showToast('Sesión cerrada', 'info');
    }
}

// Show section
function showSection(sectionName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${sectionName}`).classList.add('active');

    // Update page title
    const titles = {
        'overview': 'Resumen',
        'tracking': 'Píxeles & Analytics',
        'portfolio': 'Gestión de Contenido',
        'pricing': 'Gestión de Precios',
        'contacts': 'Formularios de Contacto',
        'settings': 'Configuración'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';

    // Load content editors if needed
    if (sectionName === 'portfolio' || sectionName === 'pricing') {
        loadContentEditors();
    }
}

// ===== TRACKING PIXELS MANAGEMENT =====

// Load tracking settings
function loadTrackingSettings() {
    const settings = Storage.get('trackingSettings', {
        facebookPixel: { enabled: false, pixelId: '' },
        googleAnalytics: { enabled: false, measurementId: '' },
        googleTagManager: { enabled: false, containerId: '' }
    });

    // Facebook Pixel
    document.getElementById('fbPixelEnabled').checked = settings.facebookPixel.enabled;
    document.getElementById('fbPixelId').value = settings.facebookPixel.pixelId || '';
    updateTrackingStatusDisplay('facebook', settings.facebookPixel);

    // Google Analytics
    document.getElementById('gaEnabled').checked = settings.googleAnalytics.enabled;
    document.getElementById('gaMeasurementId').value = settings.googleAnalytics.measurementId || '';
    updateTrackingStatusDisplay('google', settings.googleAnalytics);

    // Google Tag Manager
    document.getElementById('gtmEnabled').checked = settings.googleTagManager.enabled;
    document.getElementById('gtmContainerId').value = settings.googleTagManager.containerId || '';
    updateTrackingStatusDisplay('gtm', settings.googleTagManager);
}

// Update tracking status display
function updateTrackingStatusDisplay(platform, data) {
    let statusElement, statusText, statusClass;

    switch (platform) {
        case 'facebook':
            statusElement = document.getElementById('fbStatus');
            if (data.enabled && data.pixelId) {
                statusText = '✓ Activo';
                statusClass = 'status-active';
            } else {
                statusText = '○ No configurado';
                statusClass = 'status-inactive';
            }
            break;
        case 'google':
            statusElement = document.getElementById('gaStatus');
            if (data.enabled && data.measurementId) {
                statusText = '✓ Activo';
                statusClass = 'status-active';
            } else {
                statusText = '○ No configurado';
                statusClass = 'status-inactive';
            }
            break;
        case 'gtm':
            statusElement = document.getElementById('gtmStatus');
            if (data.enabled && data.containerId) {
                statusText = '✓ Activo';
                statusClass = 'status-active';
            } else {
                statusText = '○ No configurado';
                statusClass = 'status-inactive';
            }
            break;
    }

    if (statusElement) {
        statusElement.innerHTML = `<i class="fas fa-circle"></i> ${statusText}`;
        statusElement.className = `tracking-status ${statusClass}`;
    }
}

// Update tracking status when toggle changes
function updateTrackingStatus(platform) {
    const settings = Storage.get('trackingSettings', {});

    switch (platform) {
        case 'facebook':
            settings.facebookPixel = settings.facebookPixel || {};
            settings.facebookPixel.enabled = document.getElementById('fbPixelEnabled').checked;
            updateTrackingStatusDisplay('facebook', settings.facebookPixel);
            break;
        case 'google':
            settings.googleAnalytics = settings.googleAnalytics || {};
            settings.googleAnalytics.enabled = document.getElementById('gaEnabled').checked;
            updateTrackingStatusDisplay('google', settings.googleAnalytics);
            break;
        case 'gtm':
            settings.googleTagManager = settings.googleTagManager || {};
            settings.googleTagManager.enabled = document.getElementById('gtmEnabled').checked;
            updateTrackingStatusDisplay('gtm', settings.googleTagManager);
            break;
    }

    Storage.set('trackingSettings', settings);
}

// Save tracking settings
function saveTrackingSettings() {
    const fbPixelId = document.getElementById('fbPixelId').value.trim();
    const gaMeasurementId = document.getElementById('gaMeasurementId').value.trim();
    const gtmContainerId = document.getElementById('gtmContainerId').value.trim();

    // Validate IDs
    if (fbPixelId && !TrackingManager.validate.facebookPixel(fbPixelId)) {
        showToast('Facebook Pixel ID inválido. Debe tener 15-16 dígitos.', 'error');
        return;
    }

    if (gaMeasurementId && !TrackingManager.validate.googleAnalytics(gaMeasurementId)) {
        showToast('Google Analytics ID inválido. Formato: G-XXXXXXXXXX', 'error');
        return;
    }

    if (gtmContainerId && !TrackingManager.validate.googleTagManager(gtmContainerId)) {
        showToast('Google Tag Manager ID inválido. Formato: GTM-XXXXXXX', 'error');
        return;
    }

    // Save settings
    const settings = {
        facebookPixel: {
            enabled: document.getElementById('fbPixelEnabled').checked,
            pixelId: fbPixelId,
            lastUpdated: new Date().toISOString()
        },
        googleAnalytics: {
            enabled: document.getElementById('gaEnabled').checked,
            measurementId: gaMeasurementId,
            lastUpdated: new Date().toISOString()
        },
        googleTagManager: {
            enabled: document.getElementById('gtmEnabled').checked,
            containerId: gtmContainerId,
            lastUpdated: new Date().toISOString()
        }
    };

    Storage.set('trackingSettings', settings);

    // Update status displays
    updateTrackingStatusDisplay('facebook', settings.facebookPixel);
    updateTrackingStatusDisplay('google', settings.googleAnalytics);
    updateTrackingStatusDisplay('gtm', settings.googleTagManager);

    showToast('✓ Configuración guardada correctamente', 'success');

    // Show instructions
    setTimeout(() => {
        showToast('Los píxeles se aplicarán automáticamente en todas las páginas', 'info', 5000);
    }, 1500);
}

// Preview tracking code
function previewTrackingCode() {
    const settings = Storage.get('trackingSettings', {});
    let code = '<!-- CÓDIGOS DE SEGUIMIENTO -->\n\n';

    if (settings.facebookPixel?.enabled && settings.facebookPixel?.pixelId) {
        code += TrackingManager.generateCode.facebookPixel(settings.facebookPixel.pixelId) + '\n\n';
    }

    if (settings.googleAnalytics?.enabled && settings.googleAnalytics?.measurementId) {
        code += TrackingManager.generateCode.googleAnalytics(settings.googleAnalytics.measurementId) + '\n\n';
    }

    if (settings.googleTagManager?.enabled && settings.googleTagManager?.containerId) {
        code += TrackingManager.generateCode.googleTagManager(settings.googleTagManager.containerId) + '\n\n';
    }

    if (code === '<!-- CÓDIGOS DE SEGUIMIENTO -->\n\n') {
        showToast('No hay píxeles configurados para previsualizar', 'info');
        return;
    }

    // Create modal to show code
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: #1e1e30; padding: 30px; border-radius: 12px; max-width: 800px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #fff; margin: 0;">Vista Previa del Código</h3>
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <pre style="background: #0f0f1e; padding: 20px; border-radius: 8px; color: #00ff88; overflow-x: auto; font-size: 12px; line-height: 1.6;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            <button onclick="copyToClipboard(\`${code.replace(/`/g, '\\`')}\`); this.textContent='¡Copiado!'" style="margin-top: 15px; padding: 10px 20px; background: #00ff88; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-copy"></i> Copiar Código
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// ===== SETTINGS =====

// Change password
function changePassword() {
    const newPassword = document.getElementById('newPassword').value.trim();

    if (!newPassword) {
        showToast('Por favor ingresa una nueva contraseña', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    localStorage.setItem('dashboardPassword', newPassword);
    document.getElementById('newPassword').value = '';
    showToast('✓ Contraseña actualizada correctamente', 'success');
}

// Export data
function exportData() {
    const data = {
        trackingSettings: Storage.get('trackingSettings', {}),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `sermultimedia-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showToast('✓ Datos exportados correctamente', 'success');
}

// Import data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.trackingSettings) {
                Storage.set('trackingSettings', data.trackingSettings);
                loadTrackingSettings();
                showToast('✓ Datos importados correctamente', 'success');
            } else {
                showToast('Archivo de respaldo inválido', 'error');
            }
        } catch (error) {
            showToast('Error al importar datos', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const colors = {
        success: '#00ff88',
        error: '#ff006e',
        info: '#00d4ff',
        warning: '#ffaa00'
    };

    toast.style.cssText = `
        background: ${colors[type] || colors.info};
        color: #000;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== CONTENT MANAGEMENT FUNCTIONS =====

// Load content editors
function loadContentEditors() {
    const content = loadContent();

    // Load navigation
    document.getElementById('navLogo').value = content.navigation.logo;
    renderMenuItems(content.navigation.menuItems);

    // Load hero slides
    renderHeroSlides(content.hero.slides);

    // Load portfolio
    document.getElementById('portfolioTitle').value = content.portfolio.title;
    document.getElementById('portfolioHighlight').value = content.portfolio.titleHighlight;
    renderPortfolioVideos(content.portfolio.videos);

    // Load pricing
    document.getElementById('pricingTitle').value = content.pricing.title;
    document.getElementById('pricingHighlight').value = content.pricing.titleHighlight;
    renderPricingPlans(content.pricing.plans);
}

// Render menu items
function renderMenuItems(items) {
    const container = document.getElementById('menuItemsList');
    container.innerHTML = items.map((item, index) => `
        <div class="menu-item">
            <div class="item-header">
                <h4>Elemento ${index + 1}</h4>
                <button class="btn-remove" onclick="removeMenuItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Texto</label>
                    <input type="text" value="${item.text}" onchange="updateMenuItem(${index}, 'text', this.value)">
                </div>
                <div class="form-group">
                    <label>Enlace</label>
                    <input type="text" value="${item.href}" onchange="updateMenuItem(${index}, 'href', this.value)">
                </div>
            </div>
            <div class="toggle-group">
                <input type="checkbox" id="menuBtn${index}" ${item.isButton ? 'checked' : ''} onchange="updateMenuItem(${index}, 'isButton', this.checked)">
                <label for="menuBtn${index}">Es botón</label>
            </div>
        </div>
    `).join('');
}

// Add menu item
function addMenuItem() {
    const content = loadContent();
    content.navigation.menuItems.push({ text: 'Nuevo', href: '#', isButton: false });
    saveContent(content);
    renderMenuItems(content.navigation.menuItems);
}

// Update menu item
function updateMenuItem(index, field, value) {
    const content = loadContent();
    content.navigation.menuItems[index][field] = value;
    saveContent(content);
}

// Remove menu item
function removeMenuItem(index) {
    const content = loadContent();
    content.navigation.menuItems.splice(index, 1);
    saveContent(content);
    renderMenuItems(content.navigation.menuItems);
}

// Render hero slides
function renderHeroSlides(slides) {
    const container = document.getElementById('heroSlidesList');
    container.innerHTML = slides.map((slide, index) => `
        <div class="slide-item">
            <div class="item-header">
                <h4>Slide ${index + 1}</h4>
                <button class="btn-remove" onclick="removeHeroSlide(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-group">
                <label>Tipo</label>
                <select onchange="updateHeroSlide(${index}, 'type', this.value)">
                    <option value="image" ${slide.type === 'image' ? 'selected' : ''}>Imagen</option>
                    <option value="video" ${slide.type === 'video' ? 'selected' : ''}>Video</option>
                </select>
            </div>
            <div class="form-group">
                <label>Fondo (URL)</label>
                <input type="text" value="${slide.background}" onchange="updateHeroSlide(${index}, 'background', this.value)">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" value="${slide.title}" onchange="updateHeroSlide(${index}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Texto Destacado</label>
                    <input type="text" value="${slide.titleHighlight}" onchange="updateHeroSlide(${index}, 'titleHighlight', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea rows="2" onchange="updateHeroSlide(${index}, 'description', this.value)">${slide.description}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Texto del Botón</label>
                    <input type="text" value="${slide.buttonText}" onchange="updateHeroSlide(${index}, 'buttonText', this.value)">
                </div>
                <div class="form-group">
                    <label>Enlace del Botón</label>
                    <input type="text" value="${slide.buttonLink}" onchange="updateHeroSlide(${index}, 'buttonLink', this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

// Add hero slide
function addHeroSlide() {
    const content = loadContent();
    content.hero.slides.push({
        type: 'image',
        background: 'assets/bg.jpg',
        title: 'NUEVO SLIDE',
        titleHighlight: 'DESTACADO',
        description: 'Descripción del slide',
        buttonText: 'Ver Más',
        buttonLink: '#'
    });
    saveContent(content);
    renderHeroSlides(content.hero.slides);
}

// Update hero slide
function updateHeroSlide(index, field, value) {
    const content = loadContent();
    content.hero.slides[index][field] = value;
    saveContent(content);
}

// Remove hero slide
function removeHeroSlide(index) {
    const content = loadContent();
    content.hero.slides.splice(index, 1);
    saveContent(content);
    renderHeroSlides(content.hero.slides);
}

// Render portfolio videos
function renderPortfolioVideos(videos) {
    const container = document.getElementById('portfolioVideosList');
    container.innerHTML = videos.map((video, index) => `
        <div class="video-item-editor">
            <div class="item-header">
                <h4>Video ${index + 1}</h4>
                <button class="btn-remove" onclick="removePortfolioVideo(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" value="${video.title}" onchange="updatePortfolioVideo(${index}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>URL del Video</label>
                    <input type="text" value="${video.videoUrl}" onchange="updatePortfolioVideo(${index}, 'videoUrl', this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

// Add portfolio video
function addPortfolioVideo() {
    const content = loadContent();
    content.portfolio.videos.push({ title: 'Nuevo Video', videoUrl: 'assets/video.mp4' });
    saveContent(content);
    renderPortfolioVideos(content.portfolio.videos);
}

// Update portfolio video
function updatePortfolioVideo(index, field, value) {
    const content = loadContent();
    content.portfolio.videos[index][field] = value;
    saveContent(content);
}

// Remove portfolio video
function removePortfolioVideo(index) {
    const content = loadContent();
    content.portfolio.videos.splice(index, 1);
    saveContent(content);
    renderPortfolioVideos(content.portfolio.videos);
}

// Render pricing plans
function renderPricingPlans(plans) {
    const container = document.getElementById('pricingPlansList');
    container.innerHTML = plans.map((plan, index) => `
        <div class="pricing-plan-item">
            <div class="item-header">
                <h4>Plan ${index + 1}</h4>
                <button class="btn-remove" onclick="removePricingPlan(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Nombre del Plan</label>
                    <input type="text" value="${plan.name}" onchange="updatePricingPlan(${index}, 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Precio</label>
                    <input type="text" value="${plan.price}" onchange="updatePricingPlan(${index}, 'price', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Tipo de Pago</label>
                <input type="text" value="${plan.paymentType}" onchange="updatePricingPlan(${index}, 'paymentType', this.value)">
            </div>
            <div class="form-group">
                <label>Características (una por línea, usa HTML)</label>
                <textarea rows="4" onchange="updatePricingPlan(${index}, 'features', this.value.split('\\n'))">${plan.features.join('\n')}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Texto del Botón</label>
                    <input type="text" value="${plan.buttonText}" onchange="updatePricingPlan(${index}, 'buttonText', this.value)">
                </div>
                <div class="toggle-group">
                    <input type="checkbox" id="featured${index}" ${plan.featured ? 'checked' : ''} onchange="updatePricingPlan(${index}, 'featured', this.checked)">
                    <label for="featured${index}">Plan Destacado</label>
                </div>
            </div>
        </div>
    `).join('');
}

// Add pricing plan
function addPricingPlan() {
    const content = loadContent();
    content.pricing.plans.push({
        name: 'NUEVO PLAN',
        price: '$0',
        paymentType: 'Pago Único',
        features: ['Característica 1', 'Característica 2'],
        buttonText: 'Elegir Plan',
        featured: false
    });
    saveContent(content);
    renderPricingPlans(content.pricing.plans);
}

// Update pricing plan
function updatePricingPlan(index, field, value) {
    const content = loadContent();
    content.pricing.plans[index][field] = value;
    saveContent(content);
}

// Remove pricing plan
function removePricingPlan(index) {
    const content = loadContent();
    content.pricing.plans.splice(index, 1);
    saveContent(content);
    renderPricingPlans(content.pricing.plans);
}

// Save all content
function saveAllContent() {
    const content = loadContent();

    // Update from form fields
    content.navigation.logo = document.getElementById('navLogo').value;
    content.portfolio.title = document.getElementById('portfolioTitle').value;
    content.portfolio.titleHighlight = document.getElementById('portfolioHighlight').value;

    saveContent(content);
    showToast('✓ Contenido guardado correctamente', 'success');
}

// Save pricing content
function savePricingContent() {
    const content = loadContent();
    content.pricing.title = document.getElementById('pricingTitle').value;
    content.pricing.titleHighlight = document.getElementById('pricingHighlight').value;
    saveContent(content);
    showToast('✓ Precios guardados correctamente', 'success');
}

// Preview changes
function previewChanges() {
    window.open('index.html', '_blank');
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('¿Estás seguro? Esto restaurará todo el contenido a los valores por defecto.')) {
        saveContent(DEFAULT_CONTENT);
        loadContentEditors();
        showToast('✓ Contenido restaurado a valores por defecto', 'success');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
