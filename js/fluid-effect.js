/* ============================================
   LIQUID MESH EFFECT - OPTIMIZED
   Performance-focused version
   ============================================ */

// --- CONFIGURAZIONE GLOBALE ---
const LIQUID_SETTINGS = {
    // Risoluzione Griglia (ridotta per performance)
    cols: 12,
    rows: 12,

    // Fisica
    friction: 0.32,
    returnForce: 0.05,
    mouseRadius: 140,
    mouseStrength: 28.0,
    stiffness: 1, // Ridotto da 2

    // Rendering (overlap maggiore elimina le cuciture tra triangoli)
    overlap: 1.06
};

// Lista istanze
const liquidInstances = [];

// --- CLASSE LIQUID ITEM (OTTIMIZZATA) ---
class LiquidItem {
    constructor(container, imgSrc, videoSrc) {
        this.container = container;

        // Elementi originali - li usiamo come fallback finché il canvas non è pronto
        this.originalImg = container.querySelector('img');
        this.originalVideo = container.querySelector('video');
        this.placeholder = container.querySelector('.project-card__placeholder, .tool-card__placeholder');

        // Flag per stato caricamento
        this.isImageLoaded = false;
        this.canvasReady = false;

        // Setup dimensioni PRIMA di creare il canvas
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        // Crea canvas - alpha: true per trasparenza sfondo
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'liquid-canvas';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // Inizia invisibile, mostreremo solo quando pronto
        this.canvas.style.opacity = '0';
        this.ctx = this.canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: false
        });
        this.container.appendChild(this.canvas);

        // Stato
        this.isVisible = true; // Assumiamo visibile inizialmente
        this.isSleeping = true;
        this.isHovering = false;
        this.isVideoReady = false;
        this.rafId = null;

        // Mouse fuori
        this.mx = -10000;
        this.my = -10000;

        // Media - Crea nuovi elementi
        this.img = new Image();
        this.img.crossOrigin = "Anonymous";

        this.video = document.createElement('video');
        this.video.crossOrigin = "Anonymous";
        this.video.muted = true;
        this.video.loop = true;
        this.video.playsInline = true;
        this.video.preload = 'metadata';

        // Inizializza dati mesh
        this.initData();
        this.initEvents();

        // Callback per quando l'immagine è pronta
        const onImageReady = () => {
            if (this.isImageLoaded) return; // Previeni doppia esecuzione
            this.isImageLoaded = true;
            this.recalculateUVs('image');
            this.drawStatic(); // Disegna frame statico

            // Ora che abbiamo disegnato, possiamo fare lo switch
            this.canvas.style.opacity = '1';
            if (this.originalImg) this.originalImg.style.display = 'none';
            if (this.originalVideo) this.originalVideo.style.display = 'none';
            if (this.placeholder) this.placeholder.style.display = 'none';
            this.canvasReady = true;
        };

        // Imposta src e gestisci caricamento
        if (imgSrc) {
            this.img.onload = onImageReady;
            this.img.src = imgSrc;

            // Se l'immagine è già in cache, onload potrebbe non scattare
            if (this.img.complete && this.img.naturalWidth > 0) {
                onImageReady();
            }
        }

        this.video.addEventListener('loadedmetadata', () => {
            this.isVideoReady = true;
            this.recalculateUVs('video');
        });

        if (videoSrc) this.video.src = videoSrc;

        // Osservatore per visibilità (lazy)
        this.initObserver();
    }

    initData() {
        const cols = LIQUID_SETTINGS.cols;
        const rows = LIQUID_SETTINGS.rows;
        this.count = cols * rows;

        // Array tipizzati per performance
        this.x = new Float32Array(this.count);
        this.y = new Float32Array(this.count);
        this.ox = new Float32Array(this.count);
        this.oy = new Float32Array(this.count);
        this.hx = new Float32Array(this.count);
        this.hy = new Float32Array(this.count);

        this.tx_img = new Float32Array(this.count);
        this.ty_img = new Float32Array(this.count);
        this.tx_vid = new Float32Array(this.count);
        this.ty_vid = new Float32Array(this.count);

        // Pre-calcola spacing
        this.spacingX = this.width / (cols - 1);
        this.spacingY = this.height / (rows - 1);

        this.resetPositions();
    }

    resetPositions() {
        const cols = LIQUID_SETTINGS.cols;
        for (let i = 0; i < this.count; i++) {
            const c = i % cols;
            const r = (i / cols) | 0; // Bit shift invece di Math.floor
            const px = c * this.spacingX;
            const py = r * this.spacingY;
            this.x[i] = this.ox[i] = this.hx[i] = px;
            this.y[i] = this.oy[i] = this.hy[i] = py;
        }
    }

    recalculateUVs(type) {
        let srcW, srcH, txArr, tyArr;

        if (type === 'image') {
            srcW = this.img.naturalWidth || this.img.width;
            srcH = this.img.naturalHeight || this.img.height;
            txArr = this.tx_img;
            tyArr = this.ty_img;
        } else {
            srcW = this.video.videoWidth;
            srcH = this.video.videoHeight;
            txArr = this.tx_vid;
            tyArr = this.ty_vid;
        }

        if (!srcW || !srcH) return;

        const imgRatio = srcW / srcH;
        const canvasRatio = this.width / this.height;
        let renderW, renderH, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            renderW = srcW;
            renderH = srcW / canvasRatio;
            offsetX = 0;
            offsetY = (srcH - renderH) / 2;
        } else {
            renderH = srcH;
            renderW = srcH * canvasRatio;
            offsetX = (srcW - renderW) / 2;
            offsetY = 0;
        }

        const padding = 2.0;
        offsetX += padding;
        offsetY += padding;
        renderW -= padding * 2;
        renderH -= padding * 2;

        const cols = LIQUID_SETTINGS.cols;
        const colsM1 = cols - 1;
        const rowsM1 = LIQUID_SETTINGS.rows - 1;

        for (let i = 0; i < this.count; i++) {
            const c = i % cols;
            const r = (i / cols) | 0;
            txArr[i] = offsetX + (c / colsM1) * renderW;
            tyArr[i] = offsetY + (r / rowsM1) * renderH;
        }
    }

    initEvents() {
        // Throttled mousemove
        let lastMove = 0;
        this.canvas.addEventListener('mousemove', e => {
            const now = performance.now();
            if (now - lastMove < 16) return; // ~60fps cap
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

        // Constraints (una sola iterazione per performance)
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

        // Vai in sleep se movimento minimo e non hover
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

    // Disegna frame statico (senza fisica)
    drawStatic() {
        if (!this.isImageLoaded) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawMesh(this.img, this.tx_img, this.ty_img);
    }

    draw() {
        let src, tx, ty;

        if (this.isHovering && this.isVideoReady && this.video.readyState >= 2) {
            src = this.video;
            tx = this.tx_vid;
            ty = this.ty_vid;
        } else if (this.isImageLoaded) {
            src = this.img;
            tx = this.tx_img;
            ty = this.ty_img;
        } else {
            // Fallback placeholder
            this.ctx.fillStyle = '#C5D92D';
            this.ctx.fillRect(0, 0, this.width, this.height);
            return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawMesh(src, tx, ty);
    }

    drawMesh(src, tx, ty) {
        const cols = LIQUID_SETTINGS.cols;
        const rows = LIQUID_SETTINGS.rows;
        const overlap = LIQUID_SETTINGS.overlap;
        const ctx = this.ctx;

        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols - 1; c++) {
                const i = r * cols + c;

                // Triangolo 1
                this.drawTriangle(
                    i, i + 1, i + cols,
                    src, tx, ty, overlap, ctx
                );

                // Triangolo 2
                this.drawTriangle(
                    i + 1, i + cols + 1, i + cols,
                    src, tx, ty, overlap, ctx
                );
            }
        }
    }

    drawTriangle(i1, i2, i3, src, uArr, vArr, s, ctx) {
        const x0 = this.x[i1], y0 = this.y[i1];
        const x1 = this.x[i2], y1 = this.y[i2];
        const x2 = this.x[i3], y2 = this.y[i3];

        // Centro e overlap
        const cx = (x0 + x1 + x2) * 0.33333;
        const cy = (y0 + y1 + y2) * 0.33333;

        const ox0 = cx + (x0 - cx) * s;
        const oy0 = cy + (y0 - cy) * s;
        const ox1 = cx + (x1 - cx) * s;
        const oy1 = cy + (y1 - cy) * s;
        const ox2 = cx + (x2 - cx) * s;
        const oy2 = cy + (y2 - cy) * s;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ox0, oy0);
        ctx.lineTo(ox1, oy1);
        ctx.lineTo(ox2, oy2);
        ctx.closePath();
        ctx.clip();

        const u0 = uArr[i1], v0 = vArr[i1];
        const dU1 = uArr[i2] - u0;
        const dV1 = vArr[i2] - v0;
        const dU2 = uArr[i3] - u0;
        const dV2 = vArr[i3] - v0;
        const det = dU1 * dV2 - dU2 * dV1;

        if (det !== 0) {
            const idet = 1 / det;
            const dx1 = x1 - x0, dy1 = y1 - y0;
            const dx2 = x2 - x0, dy2 = y2 - y0;

            const a = (dx1 * dV2 - dx2 * dV1) * idet;
            const b = (dy1 * dV2 - dy2 * dV1) * idet;
            const c = (dx2 * dU1 - dx1 * dU2) * idet;
            const d = (dy2 * dU1 - dy1 * dU2) * idet;
            const e = x0 - a * u0 - c * v0;
            const f = y0 - b * u0 - d * v0;

            ctx.transform(a, b, c, d, e, f);
            ctx.drawImage(src, 0, 0);
        }
        ctx.restore();
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
        this.canvas?.remove();
    }
}

// --- INIT ---
// Lazy initialization observer - shared across all containers
let lazyFluidObserver = null;

function initFluidEffects() {
    // Skip fluid effects on mobile devices
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isMobile) return;

    const containers = document.querySelectorAll('.project-card__media, .tool-card__media');

    // Create lazy observer if not exists
    if (!lazyFluidObserver) {
        lazyFluidObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Use requestIdleCallback or setTimeout to avoid blocking
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
        }, { rootMargin: '200px' });  // Pre-load 200px before visible
    }

    containers.forEach(container => {
        // Skip if already has effect or being observed
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