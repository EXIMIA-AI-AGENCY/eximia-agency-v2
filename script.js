// ================================
// EXIMIA - Interactive Functionality
// ================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroDemo();
    initAnimatedCounters();
    initFAQ();
    initScrollAnimations();
    initPlanToggle();
    initSpotlightEffect();
});

// ================================
// Navigation
// ================================

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // Sticky navbar with blur on scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');

        // Toggle Body Scroll Lock
        document.body.classList.toggle('no-scroll');
    });

    // Close menu when clicking on a link
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll'); // Unlock scroll
        });
    });

    // Close menu when clicking outside (on overlay part)
    document.addEventListener('click', function (e) {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !hamburger.contains(e.target)) {

            // This condition is tricky with fullscreen overlay because navLinks CONTAINS everything in it.
            // But usually clicks on links are handled above. 
            // Clicks on "empty space" might be desired to close.
            // For now, let's trust the hamburger and links.
            // Removing this generic outside click for fullscreen menu as it might be buggy with inset:0
        }
    });
}

// ================================
// Hero Interactive Demo
// ================================
// Now handled by dropdown.js

function initHeroDemo() {
    // Legacy function - dropdown functionality moved to dropdown.js
    // Kept for backward compatibility, no longer performs actions
    return;
}

// ================================
// Animated Counters
// ================================

function initAnimatedCounters() {
    const metrics = document.querySelectorAll('.metric-value');
    let hasAnimated = false;

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    };

    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                metrics.forEach(metric => {
                    animateCounter(metric);
                });
                hasAnimated = true;
            }
        });
    }, { threshold: 0.5 });

    // Observe metrics section
    const metricsSection = document.querySelector('.metrics');
    if (metricsSection) {
        observer.observe(metricsSection);
    }
}

// ================================
// FAQ Accordion
// ================================

function initFAQ() {
    const questions = document.querySelectorAll('.faq-question');
    console.log(`Init FAQ: Found ${questions.length} questions`);

    questions.forEach(question => {
        // Clone to remove existing listeners (nuclear option to ensure clean slate)
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);

        newQuestion.addEventListener('click', () => {
            console.log('FAQ clicked');
            const item = newQuestion.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isActive = item.classList.contains('active');

            // Close all currently open items
            document.querySelectorAll('.faq-item.active').forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle clicked item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
}

// ================================
// Scroll Animations
// ================================

function initScrollAnimations() {
    const revealElements = document.querySelectorAll(
        '.step-card, .plan-card, .case-card, .testimonial-card, .cost-row'
    );

    revealElements.forEach(el => {
        el.classList.add('scroll-reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });
}

// ================================
// Plan Toggle
// ================================

function initPlanToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const plans = document.querySelectorAll('.plan-card');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active from all
            toggleButtons.forEach(btn => btn.classList.remove('active'));

            // Add active to clicked
            this.classList.add('active');

            const selectedType = this.getAttribute('data-type');

            // Filter Plans
            plans.forEach(plan => {
                const planType = plan.getAttribute('data-billing');

                // If plan has no billing type, show it always (safety)
                if (!planType) return;

                if (planType === selectedType) {
                    plan.classList.remove('plan-faded');
                } else {
                    plan.classList.add('plan-faded');
                }
            });
        });
    });

    // Initialize with default selection
    const activeBtn = document.querySelector('.toggle-btn.active');
    if (activeBtn) activeBtn.click();
}

// ================================
// Smooth Scroll for Anchor Links
// ================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Don't prevent default for empty hash or href="#"
        if (href === '#' || href === '') return;

        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const navbarHeight = document.getElementById('navbar').offsetHeight;
            const targetPosition = targetElement.offsetTop - navbarHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ================================
// Spotlight Effect
// ================================

function initSpotlightEffect() {
    const cards = document.querySelectorAll(
        '.step-card, .plan-card, .case-card, .metric, .testimonial-card, .cost-row, .integration-logo'
    );

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}
// ================================
// Infinite Marquee (Testimonials)
// ================================

function initTestimonialMarquee() {
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;

    // Prevent double initialization
    if (slider.getAttribute('data-init') === 'true') return;
    slider.setAttribute('data-init', 'true');

    // Get original cards ONLY (before we add clones)
    const originalCards = Array.from(document.querySelectorAll('.testimonial-card'));

    if (originalCards.length === 0) return;

    // Clone strategy:
    // We needed an EVEN number of total sets for -50% translation to match perfectly.
    // [Set][Set] -> Moves -50% (1 Set) -> Reset to 0 (First Set). Correct.
    // [Set][Set][Set][Set] -> Moves -50% (2 Sets) -> Reset to 0 (First 2 Sets). Correct.

    // We will create 7 clones of the entire set, resulting in 8 Total Sets.
    // This guarantees massive width.

    // Create fragment for performance
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 7; i++) { // 7 iterations = 7 clone sets
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true'); // Accessibility
            fragment.appendChild(clone);
        });
    }

    slider.appendChild(fragment);
}

// ================================
// Typewriter Effect
// ================================

class Typewriter {
    constructor(element, options) {
        this.element = element;
        this.cursor = options.cursor;
        this.texts = options.texts || [];
        this.typingSpeed = options.typingSpeed || 50;
        this.deletingSpeed = options.deletingSpeed || 30;
        this.pauseDuration = options.pauseDuration || 2000;
        this.loop = options.loop !== undefined ? options.loop : true;

        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.displayedText = '';
        this.isVisible = false;

        this.init();
    }

    init() {
        // Observer to start when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.isVisible = true;
                    this.start();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 });

        // Observe parent because the text span might be empty/heightless initially
        if (this.element.parentElement) {
            observer.observe(this.element.parentElement);
        } else if (this.element) {
            observer.observe(this.element);
        }
    }

    start() {
        if (!this.isVisible) return;
        this.tick();
    }

    tick() {
        const currentFullText = this.texts[this.currentTextIndex];

        if (this.isDeleting) {
            this.displayedText = currentFullText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.displayedText = currentFullText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }

        // Render HTML safely (allowing nested spans usually requires innerHTML)
        this.element.innerHTML = this.displayedText;

        // Handling Cursor Speed
        let typeSpeed = this.typingSpeed;
        if (this.isDeleting) typeSpeed = this.deletingSpeed;

        // Determine State Changes
        if (!this.isDeleting && this.currentCharIndex === currentFullText.length) {
            // Finished typing sentence
            typeSpeed = this.pauseDuration;
            this.isDeleting = true;

            // If it's the last sentence and no loop, stop deletion
            if (!this.loop && this.currentTextIndex === this.texts.length - 1) {
                this.isDeleting = false;
                // Hide cursor for a clean static look
                if (this.cursor) {
                    this.cursor.style.display = 'none';
                }
                return; // Stop animation
            }
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            // Finished deleting
            this.isDeleting = false;
            this.currentTextIndex++;
            if (this.currentTextIndex >= this.texts.length) {
                this.currentTextIndex = 0;
            }
            typeSpeed = 500; // Small pause before next word
        }

        setTimeout(() => this.tick(), typeSpeed);
    }
}

// ================================
// Liquid Button (Mercury)
// ================================

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

        // Position based on click or center if generic
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

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initPlanToggle();
    initSpotlightEffect();
    // initTestimonialMarquee(); // Disabled for static layout
    initFAQ();
    initHeroDemo();
    initLiquidButton();

    // Init Typewriter
    const typeText = document.getElementById('typewriterText');
    const typeCursor = document.querySelector('.typewriter-cursor');
    if (typeText) {
        new Typewriter(typeText, {
            texts: [
                'IA que responde, agenda y cierra ventas mientras tú duermes'
            ],
            cursor: typeCursor,
            typingSpeed: 50,
            deletingSpeed: 30,
            pauseDuration: 3000,
            loop: false // Run only once
        });
    }
});
