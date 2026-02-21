/**
 * Three.js Shader Background for Hero Section
 * Glow effect that follows cursor - Adapted to color palette
 */

(function() {
    'use strict';
    
    let container, camera, scene, renderer, material, mesh;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    // Color palette - using your colors
    const colors = {
        primary: new THREE.Color(0x0047FF),    // #0047FF
        accent: new THREE.Color(0x1A1A1A),      // #1A1A1A
        white: new THREE.Color(0xFFFFFF),      // #FFFFFF
        neutral: new THREE.Color(0xA0A0A0)     // #A0A0A0
    };
    
    function init() {
        container = document.getElementById('shader-container');
        if (!container) {
            console.error('Shader container not found');
            return;
        }
        
        // Camera
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Scene
        scene = new THREE.Scene();
        
        // Geometry - full screen plane
        const geometry = new THREE.PlaneGeometry(2, 2);
        
        // Custom shader with glow effect
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec2 u_resolution;
            uniform vec3 u_colorPrimary;
            uniform vec3 u_colorAccent;
            uniform vec3 u_colorNeutral;
            
            varying vec2 vUv;
            
            // Simplex noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                   -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                vec2 uv = vUv;
                vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
                
                // Mouse position normalized
                vec2 mouse = u_mouse * aspect;
                vec2 pos = uv * aspect;
                
                // Distance from mouse
                float dist = length(pos - mouse);
                
                // Soft diffused glow - no hard edges
                float glow = exp(-dist * 8.0); // Exponential falloff for soft blur
                glow = pow(glow, 0.8);
                
                // Animated noise background
                float noise = snoise(uv * 3.0 + u_time * 0.1) * 0.5 + 0.5;
                float noise2 = snoise(uv * 6.0 - u_time * 0.15) * 0.5 + 0.5;
                
                // Mix noise
                float pattern = mix(noise, noise2, 0.5);
                
                // Base color - dark with slight variation
                vec3 baseColor = u_colorAccent * 0.3;
                baseColor += u_colorNeutral * pattern * 0.15;
                
                // Add primary color glow around cursor
                vec3 glowColor = u_colorPrimary * glow * 0.6;
                
                // Add some white highlight at center - very subtle
                float coreGlow = exp(-dist * 15.0);
                glowColor += vec3(1.0) * coreGlow * 0.15;
                
                // Combine
                vec3 finalColor = baseColor + glowColor;
                
                // Add subtle pulsing
                finalColor += u_colorPrimary * sin(u_time * 2.0) * 0.05;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
        
        material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
                u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                u_colorPrimary: { value: colors.primary },
                u_colorAccent: { value: colors.accent },
                u_colorNeutral: { value: colors.neutral }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        
        container.appendChild(renderer.domElement);
        
        // Event listeners
        document.addEventListener('mousemove', onDocumentMouseMove);
        window.addEventListener('resize', onWindowResize);
        
        // Start animation
        animate();
    }
    
    function onDocumentMouseMove(event) {
        mouseX = event.clientX / window.innerWidth;
        mouseY = 1.0 - event.clientY / window.innerHeight;
    }
    
    function onWindowResize() {
        if (!renderer) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Smooth mouse movement
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;
        
        // Update uniforms
        material.uniforms.u_time.value += 0.01;
        material.uniforms.u_mouse.value.set(targetX, targetY);
        
        renderer.render(scene, camera);
    }
    
    // Initialize when Three.js is available
    function startShader() {
        if (typeof THREE !== 'undefined') {
            init();
        } else {
            // Wait for Three.js to load
            const checkThree = setInterval(() => {
                if (typeof THREE !== 'undefined') {
                    clearInterval(checkThree);
                    init();
                }
            }, 100);
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startShader);
    } else {
        startShader();
    }
})();
