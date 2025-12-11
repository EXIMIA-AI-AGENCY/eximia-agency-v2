document.addEventListener('DOMContentLoaded', () => {
    initLiquidButton();
});

function initLiquidButton() {
    const button = document.querySelector('.liquid-button');
    if (!button) return;

    function pressDown() {
        button.classList.add('is-pressed');
    }

    function releasePress() {
        button.classList.remove('is-pressed');
    }

    function createRipple(event) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        // Handles click position or centers it if not a pointer event
        const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
        const y = event.clientY ? event.clientY - rect.top : rect.height / 2;

        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    // Pointer (mouse + touch + stylus)
    button.addEventListener('pointerdown', (event) => {
        pressDown();
        createRipple(event);
    });

    button.addEventListener('pointerup', () => {
        releasePress();
    });

    button.addEventListener('pointerleave', () => {
        releasePress();
    });

    button.addEventListener('pointercancel', () => {
        releasePress();
    });

    // Keyboard support
    button.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.code === 'Enter') {
            pressDown();
        }
    });

    button.addEventListener('keyup', (event) => {
        if (event.code === 'Space' || event.code === 'Enter') {
            releasePress();
            createRipple({
                clientX: button.getBoundingClientRect().left + button.offsetWidth / 2,
                clientY: button.getBoundingClientRect().top + button.offsetHeight / 2
            });
        }
    });
}
