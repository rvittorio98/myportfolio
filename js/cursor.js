// ========== CUSTOM CURSOR ==========
// Creates a custom cursor with two circles:
// - Normal: solid circle
// - Hover: small dot + large outline circle

(function () {
    // Only enable on non-touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return;
    }

    // Create cursor elements
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);

    // Cursor position with smooth follow
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    // Track mouse position - both follow instantly
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Both follow instantly - no delay
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        cursorOutline.style.left = mouseX + 'px';
        cursorOutline.style.top = mouseY + 'px';
    });

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
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursorDot.classList.remove('cursor--hover');
            cursorOutline.classList.remove('cursor--hover');
        }
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });

    // Click animation
    document.addEventListener('mousedown', () => {
        cursorDot.classList.add('cursor--click');
        cursorOutline.classList.add('cursor--click');
    });

    document.addEventListener('mouseup', () => {
        cursorDot.classList.remove('cursor--click');
        cursorOutline.classList.remove('cursor--click');
    });
})();
