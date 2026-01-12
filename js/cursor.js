// ========== CUSTOM CURSOR - TEMPORARILY DISABLED ==========
// Disabled for performance testing on Safari/Firefox

/*
(function () {
    // Only enable on non-touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return;
    }

    // Browser detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const isSlowBrowser = isSafari || isFirefox;

    // Create cursor elements
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);

    // Mouse position
    let mouseX = 0;
    let mouseY = 0;
    let rafPending = false;

    // Update cursor position using transform3d (GPU accelerated)
    function updateCursorPosition() {
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        cursorOutline.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        rafPending = false;
    }

    // Track mouse position with RAF throttle
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // RAF throttle: only update once per frame
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(updateCursorPosition);
        }
    }, { passive: true });

    // Interactive elements that trigger hover state
    const interactiveSelectors = [
        'a',
        'button',
        '.project-card',
        '.tool-card',
        '.toggle__switch',
        '.toggle__label',
        'input',
        'textarea',
        '[role="button"]',
        '.clickable'
    ].join(', ');

    // Add hover class on interactive elements
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursorDot.classList.add('cursor--hover');
            cursorOutline.classList.add('cursor--hover');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursorDot.classList.remove('cursor--hover');
            cursorOutline.classList.remove('cursor--hover');
        }
    }, { passive: true });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    }, { passive: true });

    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    }, { passive: true });

    // Click animation
    document.addEventListener('mousedown', () => {
        cursorDot.classList.add('cursor--click');
        cursorOutline.classList.add('cursor--click');
    }, { passive: true });

    document.addEventListener('mouseup', () => {
        cursorDot.classList.remove('cursor--click');
        cursorOutline.classList.remove('cursor--click');
    }, { passive: true });
})();
*/
