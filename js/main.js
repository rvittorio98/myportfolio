/* ============================================
   PORTFOLIO MAIN JAVASCRIPT
   Refactored with Centralized State Management
   ============================================ */

// ========== GLOBAL STATE MANAGER ==========
const AppState = {
    currentView: 'project', // 'project' or 'tool'
    initialized: {
        projects: false,
        tools: false
    },
    elements: {},

    init() {
        // Cache DOM elements
        this.elements = {
            toggle: document.getElementById('viewToggle'),
            projectLabel: document.querySelector('.toggle__label--project'),
            toolLabel: document.querySelector('.toggle__label--tool'),
            projectView: document.getElementById('projectView'),
            toolView: document.getElementById('toolView')
        };

        // Check URL for initial view
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'tool') {
            this.currentView = 'tool';
        }
    },

    setView(view) {
        this.currentView = view;
    },

    markInitialized(view) {
        this.initialized[view === 'project' ? 'projects' : 'tools'] = true;
    },

    isInitialized(view) {
        return this.initialized[view === 'project' ? 'projects' : 'tools'];
    }
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
    // Initialize state first
    AppState.init();

    // Render content - both views are visible at this point
    renderProjects();
    renderTools();

    // If starting in TOOL view, hide PROJECT immediately to prevent flash
    const projectView = document.getElementById('projectView');
    const toolView = document.getElementById('toolView');

    if (AppState.currentView === 'tool' && projectView && toolView) {
        // Hide project visually but keep dimensions for initialization
        projectView.style.visibility = 'hidden';
        projectView.style.position = 'absolute';
        // Show tool immediately
        toolView.classList.remove('hidden');
        document.body.classList.add('dark-mode');

        // Update toggle visual state
        const toggle = document.querySelector('.toggle__switch');
        const projectLabel = document.querySelector('.toggle__label--project');
        const toolLabel = document.querySelector('.toggle__label--tool');
        if (toggle) toggle.classList.add('active');
        if (projectLabel) projectLabel.classList.remove('active');
        if (toolLabel) toolLabel.classList.add('active');
    }

    // Setup interactions
    setupToggle();
    setupScrollHeader();
    setupWheelScroll();

    // Initialize BOTH galleries while dimensions are available
    setTimeout(() => {
        // Initialize projects
        initSeamlessScroll('projectScroll', 'projectTrack', 'projects');
        AppState.markInitialized('project');

        // Initialize tools (ensure visible for dimension calculation)
        if (toolView && !toolView.classList.contains('hidden')) {
            // Tool is already visible (TOOL view)
            initSeamlessScroll('toolScroll', 'toolTrack', 'tools');
            AppState.markInitialized('tool');

            // Now hide project properly
            if (projectView) {
                projectView.style.visibility = '';
                projectView.style.position = '';
                projectView.classList.add('hidden');
            }
        } else if (toolView) {
            // PROJECT view - temporarily show tools to initialize
            toolView.classList.remove('hidden');
            toolView.style.visibility = 'hidden';
            toolView.style.position = 'absolute';

            setTimeout(() => {
                initSeamlessScroll('toolScroll', 'toolTrack', 'tools');
                AppState.markInitialized('tool');

                // Restore tool view state
                toolView.style.visibility = '';
                toolView.style.position = '';
                toolView.classList.add('hidden');
            }, 50);
        }

        setupVideoHover();

        if (typeof initFluidEffects === 'function') {
            initFluidEffects();
        }
    }, 100);
});

// ========== VIEW STATE MANAGEMENT ==========
function applyViewState(view, animate = true) {
    const { toggle, projectLabel, toolLabel, projectView, toolView } = AppState.elements;

    if (!projectView || !toolView) return;

    if (view === 'tool') {
        // Switch to TOOL
        if (toggle) toggle.classList.add('active');
        if (projectLabel) projectLabel.classList.remove('active');
        if (toolLabel) toolLabel.classList.add('active');
        document.body.classList.add('dark-mode');

        if (animate) {
            projectView.classList.add('fade-out');
            setTimeout(() => {
                projectView.classList.add('hidden');
                projectView.classList.remove('fade-out');
                toolView.classList.remove('hidden');
                const toolsNotice = document.getElementById('toolsNotice');
                if (toolsNotice) {
                    toolsNotice.classList.remove('hidden');
                    // Auto-hide notice after 5 seconds
                    setTimeout(() => {
                        toolsNotice.classList.add('fade-out');
                        setTimeout(() => toolsNotice.classList.add('hidden'), 500);
                    }, 5000);
                }
                initializeViewIfNeeded('tool');
            }, 300);
        } else {
            projectView.classList.add('hidden');
            toolView.classList.remove('hidden');
            const toolsNotice = document.getElementById('toolsNotice');
            if (toolsNotice) {
                toolsNotice.classList.remove('hidden');
                // Auto-hide notice after 5 seconds
                setTimeout(() => {
                    toolsNotice.classList.add('fade-out');
                    setTimeout(() => toolsNotice.classList.add('hidden'), 500);
                }, 5000);
            }
        }
    } else {
        // Switch to PROJECT
        if (toggle) toggle.classList.remove('active');
        if (projectLabel) projectLabel.classList.add('active');
        if (toolLabel) toolLabel.classList.remove('active');
        document.body.classList.remove('dark-mode');

        if (animate) {
            toolView.classList.add('fade-out');
            const toolsNotice = document.getElementById('toolsNotice');
            if (toolsNotice) toolsNotice.classList.add('hidden');
            setTimeout(() => {
                toolView.classList.add('hidden');
                toolView.classList.remove('fade-out');
                projectView.classList.remove('hidden');
                initializeViewIfNeeded('project');
            }, 300);
        } else {
            toolView.classList.add('hidden');
            const toolsNotice = document.getElementById('toolsNotice');
            if (toolsNotice) toolsNotice.classList.add('hidden');
            projectView.classList.remove('hidden');
        }
    }

    AppState.setView(view);
}

function initializeCurrentView() {
    initializeViewIfNeeded(AppState.currentView);
}

function initializeViewIfNeeded(view) {
    if (AppState.isInitialized(view)) return;

    // Use double requestAnimationFrame to ensure DOM is fully rendered
    // This is critical for getting correct element dimensions after unhiding
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (view === 'tool') {
                initSeamlessScroll('toolScroll', 'toolTrack', 'tools');
            } else {
                initSeamlessScroll('projectScroll', 'projectTrack', 'projects');
            }

            setupVideoHover();

            if (typeof initFluidEffects === 'function') {
                initFluidEffects();
            }

            AppState.markInitialized(view);
        });
    });
}

// ========== TOGGLE FUNCTIONALITY ==========
function setupToggle() {
    const { toggle, projectLabel, toolLabel } = AppState.elements;

    if (!toggle) return;

    const handleToggle = () => {
        const nextView = AppState.currentView === 'project' ? 'tool' : 'project';
        applyViewState(nextView, true);
    };

    toggle.addEventListener('click', handleToggle);

    if (projectLabel) {
        projectLabel.addEventListener('click', () => {
            if (AppState.currentView !== 'project') {
                applyViewState('project', true);
            }
        });
    }

    if (toolLabel) {
        toolLabel.addEventListener('click', () => {
            if (AppState.currentView !== 'tool') {
                applyViewState('tool', true);
            }
        });
    }
}

// ========== RENDER PROJECTS ==========
function renderProjects() {
    const container = document.getElementById('projectTrack');
    if (!container) return;

    let html = '';
    PROJECTS.forEach((project) => {
        html += createProjectCard(project);
    });
    container.innerHTML = html;
}

function createProjectCard(project, isClone = false) {
    const toolsHtml = project.tools.map(toolKey => {
        const software = SOFTWARE[toolKey];
        if (!software) return '';
        return `<a href="${software.url}" target="_blank" rel="noopener noreferrer" class="project-card__tool" onclick="event.stopPropagation()">${software.name}</a>`;
    }).join('');

    const cloneClass = isClone ? ' clone' : '';
    const imgTag = project.thumbnail ? `<img src="${project.thumbnail}" alt="${project.title}" loading="lazy" onerror="this.style.display='none'">` : '';
    const videoTag = project.video ? `<video src="${project.video}" muted loop playsinline preload="none"></video>` : '';

    return `
        <article class="project-card project-card--${project.height}${cloneClass}" data-project="${project.slug}" onclick="goToProject('${project.slug}')">
            <div class="project-card__media">
                ${imgTag}
                ${videoTag}
                <div class="project-card__placeholder"></div>
            </div>
            <div class="project-card__info">
                <h3 class="project-card__title">${project.title}</h3>
                <p class="project-card__made-with">MADE WITH</p>
                <div class="project-card__tools">
                    ${toolsHtml}
                </div>
            </div>
        </article>
    `;
}

// ========== RENDER TOOLS ==========
function renderTools() {
    const container = document.getElementById('toolTrack');
    if (!container) return;

    let html = '';
    USER_TOOLS.forEach((tool) => {
        html += createToolCard(tool);
    });
    container.innerHTML = html;
}

function createToolCard(tool, isClone = false) {
    const cloneClass = isClone ? ' clone' : '';

    // Check if video is Vimeo URL
    let videoTag = '';
    if (tool.video) {
        const vimeoMatch = tool.video.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
        if (vimeoMatch) {
            const vimeoId = vimeoMatch[1];
            videoTag = `<iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1" 
                        frameborder="0" allow="autoplay; fullscreen"></iframe>`;
        } else {
            videoTag = `<video src="${tool.video}" autoplay muted loop playsinline></video>`;
        }
    }

    // Placeholder solo se non c'è video
    const placeholderTag = !tool.video ? '<div class="tool-card__placeholder"></div>' : '';

    // Description (opzionale)
    const descriptionTag = tool.description ? `<p class="tool-card__description">${tool.description}</p>` : '';

    return `
        <article class="tool-card${cloneClass}" data-tool="${tool.id}" onclick="window.open('${tool.url}', '_blank')">
            <div class="tool-card__media tool-card__media--no-fluid">
                ${videoTag}
                ${placeholderTag}
            </div>
            <div class="tool-card__info">
                <h3 class="tool-card__title">${tool.title}</h3>
                ${descriptionTag}
            </div>
        </article>
    `;
}

// ========== SEAMLESS INFINITE SCROLL ==========
function initSeamlessScroll(scrollId, trackId, dataType) {
    const scrollContainer = document.getElementById(scrollId);
    const track = document.getElementById(trackId);

    if (!scrollContainer || !track) return;

    const originalItems = Array.from(track.children);
    const itemCount = originalItems.length;

    if (itemCount === 0) return;

    const dataArray = dataType === 'projects' ? PROJECTS : USER_TOOLS;
    const gap = 20;

    let singleSetWidth = 0;
    originalItems.forEach(item => {
        singleSetWidth += item.offsetWidth + gap;
    });

    if (singleSetWidth === 0) return;

    const viewportWidth = scrollContainer.clientWidth;
    const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    // More clone sets on mobile to handle fast momentum scrolling
    const setsNeeded = Math.ceil(viewportWidth / singleSetWidth) + (isMobileDevice ? 4 : 2);

    // Append clones to the right
    for (let set = 0; set < setsNeeded; set++) {
        dataArray.forEach(item => {
            const cloneHtml = dataType === 'projects'
                ? createProjectCard(item, true)
                : createToolCard(item, true);
            track.insertAdjacentHTML('beforeend', cloneHtml);
        });
    }

    // Prepend clones to the left
    for (let set = 0; set < setsNeeded; set++) {
        for (let j = dataArray.length - 1; j >= 0; j--) {
            const item = dataArray[j];
            const cloneHtml = dataType === 'projects'
                ? createProjectCard(item, true)
                : createToolCard(item, true);
            track.insertAdjacentHTML('afterbegin', cloneHtml);
        }
    }

    // Set initial scroll position
    const initialPosition = singleSetWidth * setsNeeded;
    scrollContainer.scrollLeft = initialPosition;

    // Initialize fluid effects on clones
    if (typeof initFluidEffects === 'function') {
        initFluidEffects();
    }

    // Store scroll data
    const scrollData = {
        singleSetWidth,
        initialPosition,
        setsNeeded,
        isAdjusting: false
    };

    // Scroll handler - different strategies for desktop vs mobile
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (isMobile) {
        // Mobile: RAF-based correction WITHOUT blocking flag
        // The blocking flag (isAdjusting) was causing issues with Safari momentum
        let ticking = false;

        scrollContainer.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Use mobile-specific correction (no blocking flag)
                    correctScrollPosition(scrollContainer, scrollData);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

    } else {
        // Desktop: Use immediate RAF-based correction with blocking flag
        let ticking = false;
        scrollContainer.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleSeamlessScroll(scrollContainer, scrollData);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}

// Correction function for mobile - no blocking flag
// Uses while-loop to handle cases where momentum exceeds bounds by multiple widths
function correctScrollPosition(container, data) {
    let scrollLeft = container.scrollLeft;
    const minBound = data.singleSetWidth;
    const maxBound = data.initialPosition + data.singleSetWidth;
    let corrected = false;

    // While loop handles extreme momentum that jumps multiple widths
    while (scrollLeft < minBound) {
        scrollLeft += data.singleSetWidth;
        corrected = true;
    }
    while (scrollLeft > maxBound) {
        scrollLeft -= data.singleSetWidth;
        corrected = true;
    }

    if (corrected) {
        container.scrollLeft = scrollLeft;
    }
}

function handleSeamlessScroll(container, data) {
    if (data.isAdjusting) return;

    const scrollLeft = container.scrollLeft;
    const minBound = data.singleSetWidth;
    const maxBound = data.initialPosition + data.singleSetWidth;

    if (scrollLeft < minBound) {
        data.isAdjusting = true;
        container.scrollLeft = scrollLeft + data.singleSetWidth;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                data.isAdjusting = false;
            });
        });
    } else if (scrollLeft > maxBound) {
        data.isAdjusting = true;
        container.scrollLeft = scrollLeft - data.singleSetWidth;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                data.isAdjusting = false;
            });
        });
    }
}

// ========== WHEEL SCROLL ==========
function setupWheelScroll() {
    const galleries = document.querySelectorAll('.gallery-scroll');
    galleries.forEach(gallery => {
        gallery.addEventListener('wheel', function (e) {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                gallery.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    });
}

// ========== SCROLL HEADER ==========
function setupScrollHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ========== VIDEO HOVER ==========
// Safari fix: detect Safari for special handling
const isSafariMain = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function setupVideoHover() {
    const allCards = document.querySelectorAll('.project-card, .tool-card');

    allCards.forEach(card => {
        const video = card.querySelector('video');
        if (video && !card.dataset.hoverSetup) {
            card.dataset.hoverSetup = 'true';

            card.addEventListener('mouseenter', () => {
                // Safari fix: ensure video is loaded before playing
                if (isSafariMain && video.readyState < 3) {
                    video.load();
                }
                video.play().catch(() => { });
            });

            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });
}

// ========== NAVIGATION ==========
function goToProject(slug) {
    window.location.href = `pages/project.html?id=${slug}`;
}

// ========== UTILITY FUNCTIONS ==========
function getProjectBySlug(slug) {
    return PROJECTS.find(p => p.slug === slug);
}

function getProjectIndex(slug) {
    return PROJECTS.findIndex(p => p.slug === slug);
}

function getNextProject(currentSlug) {
    const currentIndex = getProjectIndex(currentSlug);
    if (currentIndex === -1 || currentIndex >= PROJECTS.length - 1) return null;
    return PROJECTS[currentIndex + 1];
}

function getPrevProject(currentSlug) {
    const currentIndex = getProjectIndex(currentSlug);
    if (currentIndex <= 0) return null;
    return PROJECTS[currentIndex - 1];
}

function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}