/* ============================================
   LIQUID MESH EFFECT - WebGL VERSION
   High-performance GPU-accelerated rendering
   ============================================ */

// --- BROWSER DETECTION ---
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

// --- CONFIGURAZIONE GLOBALE ---
const LIQUID_SETTINGS = {
    // Risoluzione Griglia - 12x12 per tutti (WebGL è veloce)
    cols: 12,
    rows: 12,

    // Fisica
    friction: 0.32,
    returnForce: 0.05,
    mouseRadius: 140,
    mouseStrength: 28.0,
    stiffness: 1,

    // Rendering
    overlap: 1.06
};

// Lista istanze
const liquidInstances = [];

// WebGL context counter - browsers limit to ~8-16 contexts
let activeWebGLContexts = 0;
const MAX_WEBGL_CONTEXTS = 8; // Safe limit for most browsers

// --- SHADERS GLSL ---
// Use highp precision for Safari compatibility
const VERTEX_SHADER_SOURCE = `
    precision highp float;
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;

    void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision highp float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;

// --- HELPER FUNCTIONS ---
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// --- CLASSE LIQUID ITEM (WebGL) ---
class LiquidItem {
    constructor(container, imgSrc, videoSrc) {
        this.container = container;
        this.useWebGL = true;

        // Elementi originali
        this.originalImg = container.querySelector('img');
        this.originalVideo = container.querySelector('video');
        this.placeholder = container.querySelector('.project-card__placeholder, .tool-card__placeholder');

        // Flag
        this.isImageLoaded = false;
        this.canvasReady = false;
        this.isVisible = true;
        this.isSleeping = true;
        this.isHovering = false;
        this.isVideoReady = false;
        this.rafId = null;

        // Mouse
        this.mx = -10000;
        this.my = -10000;

        // Dimensioni
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'liquid-canvas';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.opacity = '0';
        this.container.appendChild(this.canvas);

        // Try WebGL, fallback to 2D if not available
        // CRITICAL: powerPreference 'high-performance' forces dedicated GPU on Safari/Firefox
        // desynchronized: true reduces input latency
        this.gl = this.canvas.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: false,
            antialias: false,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',  // Force dedicated GPU
            desynchronized: true,                  // Lower latency
            depth: false,                          // Not needed - 2D
            stencil: false                         // Not needed
        });

        if (!this.gl) {
            console.warn('WebGL not available, falling back to 2D');
            this.useWebGL = false;
            this.ctx = this.canvas.getContext('2d');
        } else if (activeWebGLContexts >= MAX_WEBGL_CONTEXTS) {
            // Too many WebGL contexts, use Canvas 2D fallback
            console.warn('Max WebGL contexts reached, using 2D fallback');
            this.useWebGL = false;
            this.gl = null;
            this.ctx = this.canvas.getContext('2d');
        } else {
            activeWebGLContexts++;
            this.initWebGL();

            // Handle context loss
            this.canvas.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                console.warn('WebGL context lost, falling back to 2D');
                this.useWebGL = false;
                activeWebGLContexts--;
                this.ctx = this.canvas.getContext('2d');
                if (this.isImageLoaded) {
                    this.draw();
                }
            });

            this.canvas.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored');
                activeWebGLContexts++;
                this.useWebGL = true;
                this.initWebGL();
                if (this.isImageLoaded) {
                    this.createTexture(this.img, 'image');
                    if (this.isVideoReady) {
                        this.createTexture(this.video, 'video');
                    }
                    this.draw();
                }
            });
        }

        // Media
        this.img = new Image();
        this.img.crossOrigin = "Anonymous";

        this.video = document.createElement('video');
        this.video.crossOrigin = "Anonymous";
        this.video.muted = true;
        this.video.loop = true;
        this.video.playsInline = true;
        this.video.preload = 'auto';
        this.video.setAttribute('muted', '');
        this.video.setAttribute('playsinline', '');

        // Init mesh data
        this.initData();
        this.initEvents();

        // Image loading
        const onImageReady = () => {
            if (this.isImageLoaded) return;
            this.isImageLoaded = true;
            this.recalculateUVs('image');

            if (this.useWebGL) {
                this.createTexture(this.img, 'image');
            }

            this.drawStatic();
            this.canvas.style.opacity = '1';
            if (this.originalImg) this.originalImg.style.display = 'none';
            if (this.originalVideo) this.originalVideo.style.display = 'none';
            if (this.placeholder) this.placeholder.style.display = 'none';
            this.canvasReady = true;
        };

        if (imgSrc) {
            this.img.onload = onImageReady;
            this.img.src = imgSrc;
            if (this.img.complete && this.img.naturalWidth > 0) {
                onImageReady();
            }
        }

        this.video.addEventListener('canplaythrough', () => {
            this.isVideoReady = true;
            this.recalculateUVs('video');
            if (this.useWebGL) {
                this.createTexture(this.video, 'video');
            }
        }, { once: true });

        this.video.addEventListener('loadedmetadata', () => {
            if (!this.isVideoReady) {
                this.recalculateUVs('video');
            }
        });

        if (videoSrc) this.video.src = videoSrc;

        this.initObserver();
    }

    initWebGL() {
        const gl = this.gl;

        // Compile shaders
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

        if (!vertexShader || !fragmentShader) {
            this.useWebGL = false;
            this.ctx = this.canvas.getContext('2d');
            return;
        }

        this.program = createProgram(gl, vertexShader, fragmentShader);
        if (!this.program) {
            this.useWebGL = false;
            this.ctx = this.canvas.getContext('2d');
            return;
        }

        // Get locations
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
        this.textureLocation = gl.getUniformLocation(this.program, 'u_texture');

        // Create buffers
        this.positionBuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Set viewport
        gl.viewport(0, 0, this.width, this.height);

        // Textures
        this.imageTexture = null;
        this.videoTexture = null;
    }

    createTexture(source, type) {
        const gl = this.gl;
        if (!gl) return;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

        if (type === 'image') {
            this.imageTexture = texture;
        } else {
            this.videoTexture = texture;
        }
    }

    updateVideoTexture() {
        const gl = this.gl;
        if (!gl || !this.videoTexture || this.video.readyState < 2) return;

        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
    }

    initData() {
        const cols = LIQUID_SETTINGS.cols;
        const rows = LIQUID_SETTINGS.rows;
        this.count = cols * rows;

        // Mesh position arrays
        this.x = new Float32Array(this.count);
        this.y = new Float32Array(this.count);
        this.ox = new Float32Array(this.count);
        this.oy = new Float32Array(this.count);
        this.hx = new Float32Array(this.count);
        this.hy = new Float32Array(this.count);

        // UV arrays (normalized 0-1)
        this.u = new Float32Array(this.count);
        this.v = new Float32Array(this.count);

        // Pre-compute spacing
        this.spacingX = this.width / (cols - 1);
        this.spacingY = this.height / (rows - 1);

        this.resetPositions();

        // Build index buffer for triangles
        this.buildIndices();
    }

    buildIndices() {
        const cols = LIQUID_SETTINGS.cols;
        const rows = LIQUID_SETTINGS.rows;
        const triangleCount = (cols - 1) * (rows - 1) * 2;
        this.indices = new Uint16Array(triangleCount * 3);

        let idx = 0;
        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols - 1; c++) {
                const i = r * cols + c;
                // Triangle 1
                this.indices[idx++] = i;
                this.indices[idx++] = i + 1;
                this.indices[idx++] = i + cols;
                // Triangle 2
                this.indices[idx++] = i + 1;
                this.indices[idx++] = i + cols + 1;
                this.indices[idx++] = i + cols;
            }
        }

        // Upload to GPU if WebGL
        if (this.gl) {
            const gl = this.gl;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        }
    }

    resetPositions() {
        const cols = LIQUID_SETTINGS.cols;
        for (let i = 0; i < this.count; i++) {
            const c = i % cols;
            const r = (i / cols) | 0;
            const px = c * this.spacingX;
            const py = r * this.spacingY;
            this.x[i] = this.ox[i] = this.hx[i] = px;
            this.y[i] = this.oy[i] = this.hy[i] = py;

            // UVs (normalized 0-1)
            this.u[i] = c / (cols - 1);
            this.v[i] = r / (LIQUID_SETTINGS.rows - 1);
        }
    }

    recalculateUVs(type) {
        let srcW, srcH;

        if (type === 'image') {
            srcW = this.img.naturalWidth || this.img.width;
            srcH = this.img.naturalHeight || this.img.height;
        } else {
            srcW = this.video.videoWidth;
            srcH = this.video.videoHeight;
        }

        if (!srcW || !srcH) return;

        // Calculate UVs for 'cover' behavior (maintain aspect ratio, fill canvas)
        const imgRatio = srcW / srcH;
        const canvasRatio = this.width / this.height;

        let uOffset = 0, vOffset = 0;
        let uScale = 1, vScale = 1;

        if (canvasRatio > imgRatio) {
            // Canvas is wider - crop top/bottom of image
            vScale = imgRatio / canvasRatio;
            vOffset = (1 - vScale) / 2;
        } else {
            // Canvas is taller - crop left/right of image
            uScale = canvasRatio / imgRatio;
            uOffset = (1 - uScale) / 2;
        }

        // Update UVs
        const cols = LIQUID_SETTINGS.cols;
        for (let i = 0; i < this.count; i++) {
            const c = i % cols;
            const r = (i / cols) | 0;
            const baseU = c / (cols - 1);
            const baseV = r / (LIQUID_SETTINGS.rows - 1);

            // Apply cover transformation
            this.u[i] = uOffset + baseU * uScale;
            this.v[i] = vOffset + baseV * vScale;
        }

        this.srcAspect = srcW / srcH;
        this.canvasAspect = this.width / this.height;
    }

    initEvents() {
        let lastMove = 0;
        this.canvas.addEventListener('mousemove', e => {
            const now = performance.now();
            if (now - lastMove < 16) return;
            lastMove = now;

            const rect = this.canvas.getBoundingClientRect();
            this.mx = e.clientX - rect.left;
            this.my = e.clientY - rect.top;
            this.wakeUp();
        }, { passive: true });

        this.canvas.addEventListener('mouseenter', () => {
            this.isHovering = true;
            if (this.isVideoReady) {
                this.video.currentTime = 0;
                this.video.play().catch(() => { });
            } else if (this.video.src) {
                this.video.load();
                this.video.play().catch(() => { });
            }
            this.wakeUp();
        }, { passive: true });

        this.canvas.addEventListener('mouseleave', () => {
            this.mx = -10000;
            this.my = -10000;
            this.isHovering = false;
            this.video.pause();
        }, { passive: true });
    }

    initObserver() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                this.isVisible = e.isIntersecting;
                if (e.isIntersecting) {
                    this.wakeUp();
                } else {
                    this.video.pause();
                    if (this.rafId) {
                        cancelAnimationFrame(this.rafId);
                        this.rafId = null;
                    }
                }
            });
        }, { threshold: 0.01, rootMargin: '50px' });
        obs.observe(this.canvas);
    }

    wakeUp() {
        if (!this.rafId && this.isVisible && this.canvasReady) {
            this.isSleeping = false;
            this.loop();
        }
    }

    update() {
        const friction = LIQUID_SETTINGS.friction;
        const returnForce = LIQUID_SETTINGS.returnForce;
        const mouseRadius = LIQUID_SETTINGS.mouseRadius;
        const mouseStrength = LIQUID_SETTINGS.mouseStrength;
        const radSq = mouseRadius * mouseRadius;

        let totalMotion = 0;
        const mx = this.mx;
        const my = this.my;

        for (let i = 0; i < this.count; i++) {
            let vx = (this.x[i] - this.ox[i]) * friction;
            let vy = (this.y[i] - this.oy[i]) * friction;

            vx += (this.hx[i] - this.x[i]) * returnForce;
            vy += (this.hy[i] - this.y[i]) * returnForce;

            this.ox[i] = this.x[i];
            this.oy[i] = this.y[i];
            this.x[i] += vx;
            this.y[i] += vy;

            totalMotion += Math.abs(vx) + Math.abs(vy);

            const dx = this.x[i] - mx;
            const dy = this.y[i] - my;
            const dSq = dx * dx + dy * dy;

            if (dSq < radSq && dSq > 1) {
                const dist = Math.sqrt(dSq);
                const f = (mouseRadius - dist) / mouseRadius;
                const push = f * mouseStrength;
                const invDist = 1 / dist;
                this.x[i] += dx * invDist * push;
                this.y[i] += dy * invDist * push;
                totalMotion += 5;
            }
        }

        // Constraints
        const cols = LIQUID_SETTINGS.cols;
        const rows = LIQUID_SETTINGS.rows;
        const spX = this.spacingX;
        const spY = this.spacingY;

        for (let i = 0; i < this.count; i++) {
            const c = i % cols;
            const r = (i / cols) | 0;
            if (c < cols - 1) this.resolve(i, i + 1, spX);
            if (r < rows - 1) this.resolve(i, i + cols, spY);
        }

        if (totalMotion < 0.05 && !this.isHovering) {
            this.isSleeping = true;
        }
    }

    resolve(i1, i2, t) {
        const dx = this.x[i1] - this.x[i2];
        const dy = this.y[i1] - this.y[i2];
        const distSq = dx * dx + dy * dy;
        if (distSq < 0.0001) return;

        const dist = Math.sqrt(distSq);
        const diff = (dist - t) * 0.5 / dist;
        const ox = dx * diff;
        const oy = dy * diff;
        this.x[i1] -= ox;
        this.y[i1] -= oy;
        this.x[i2] += ox;
        this.y[i2] += oy;
    }

    drawStatic() {
        if (!this.isImageLoaded) return;
        this.draw();
    }

    draw() {
        if (this.useWebGL) {
            this.drawWebGL();
        } else {
            this.drawCanvas2D();
        }
    }

    drawWebGL() {
        const gl = this.gl;
        if (!gl) return;

        // Select texture and update if video
        let texture;
        if (this.isHovering && this.isVideoReady && this.video.readyState >= 2) {
            this.updateVideoTexture();
            texture = this.videoTexture;
        } else if (this.imageTexture) {
            texture = this.imageTexture;
        } else {
            return;
        }

        // Clear
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use program
        gl.useProgram(this.program);

        // Set resolution
        gl.uniform2f(this.resolutionLocation, this.width, this.height);

        // Build position buffer from current mesh state
        const positions = new Float32Array(this.count * 2);
        for (let i = 0; i < this.count; i++) {
            positions[i * 2] = this.x[i];
            positions[i * 2 + 1] = this.y[i];
        }

        // Upload positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Upload UVs
        const uvs = new Float32Array(this.count * 2);
        for (let i = 0; i < this.count; i++) {
            uvs[i * 2] = this.u[i];
            uvs[i * 2 + 1] = this.v[i];
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.textureLocation, 0);

        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    drawCanvas2D() {
        // Fallback Canvas 2D implementation
        const ctx = this.ctx;
        if (!ctx) return;

        let src, tx, ty;
        if (this.isHovering && this.isVideoReady && this.video.readyState >= 2) {
            src = this.video;
        } else if (this.isImageLoaded) {
            src = this.img;
        } else {
            ctx.fillStyle = '#C5D92D';
            ctx.fillRect(0, 0, this.width, this.height);
            return;
        }

        ctx.clearRect(0, 0, this.width, this.height);

        // Simple draw without distortion for fallback
        ctx.drawImage(src, 0, 0, this.width, this.height);
    }

    loop() {
        if (!this.isVisible || this.isSleeping) {
            this.rafId = null;
            if (this.isVisible && this.canvasReady) {
                this.draw();
            }
            return;
        }

        this.update();
        this.draw();
        this.rafId = requestAnimationFrame(() => this.loop());
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // Cleanup WebGL resources
        if (this.gl) {
            const gl = this.gl;
            if (this.imageTexture) gl.deleteTexture(this.imageTexture);
            if (this.videoTexture) gl.deleteTexture(this.videoTexture);
            if (this.program) gl.deleteProgram(this.program);
            if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
            if (this.texCoordBuffer) gl.deleteBuffer(this.texCoordBuffer);
            if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
        }

        this.canvas?.remove();
    }
}

// --- INIT ---
let lazyFluidObserver = null;

function initFluidEffects() {
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isMobile) return;

    const containers = document.querySelectorAll('.project-card__media, .tool-card__media');

    if (!lazyFluidObserver) {
        lazyFluidObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(() => {
                            initSingleFluidEffect(entry.target);
                        }, { timeout: 100 });
                    } else {
                        setTimeout(() => {
                            initSingleFluidEffect(entry.target);
                        }, 0);
                    }
                    lazyFluidObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });
    }

    containers.forEach(container => {
        if (container._liquidEffect || container._fluidObserved) return;
        container._fluidObserved = true;
        lazyFluidObserver.observe(container);
    });
}

function initSingleFluidEffect(container) {
    if (container._liquidEffect) return;

    const imgEl = container.querySelector('img');
    const videoEl = container.querySelector('video');
    const imgSrc = imgEl?.getAttribute('src') || '';
    const videoSrc = videoEl?.getAttribute('src') || '';

    if (!imgSrc) return;

    const effect = new LiquidItem(container, imgSrc, videoSrc);
    container._liquidEffect = effect;
    liquidInstances.push(effect);
}

function reinitFluidEffects() {
    initFluidEffects();
}

function destroyFluidEffects() {
    liquidInstances.forEach(e => e.destroy());
    liquidInstances.length = 0;
}

// Export
window.LiquidItem = LiquidItem;
window.LIQUID_SETTINGS = LIQUID_SETTINGS;
window.initFluidEffects = initFluidEffects;
window.reinitFluidEffects = reinitFluidEffects;
window.destroyFluidEffects = destroyFluidEffects;