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
    });

    // Close menu when clicking on a link
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// ================================
// Hero Interactive Demo
// ================================

function initHeroDemo() {
    const businessTypeSelect = document.getElementById('businessType');
    const automationList = document.getElementById('automationList');

    const automations = {
        clinic: [
            'Responder consultas de pacientes 24/7',
            'Agendar citas automáticamente',
            'Enviar recordatorios y seguimiento post-visita'
        ],
        realestate: [
            'Calificar leads por presupuesto e interés',
            'Agendar tours de propiedades',
            'Seguimiento automático de interesados'
        ],
        restaurant: [
            'Tomar reservas instantáneamente',
            'Responder preguntas sobre menú y horarios',
            'Enviar confirmaciones y recordatorios'
        ],
        services: [
            'Cotizar servicios al instante',
            'Agendar evaluaciones y visitas',
            'Seguimiento de clientes potenciales'
        ],
        ecommerce: [
            'Rastreo de pedidos en tiempo real',
            'Soporte 24/7 para consultas',
            'Recomendaciones y upsells automáticos'
        ],
        other: [
            'Respuestas instantáneas 24/7',
            'Calificación inteligente de leads',
            'Automatización de seguimiento'
        ]
    };

    businessTypeSelect.addEventListener('change', function () {
        const selectedType = this.value;
        const items = automations[selectedType];

        // Fade out
        automationList.style.opacity = '0';
        automationList.style.transform = 'translateY(10px)';

        setTimeout(() => {
            // Update content
            automationList.innerHTML = items.map(item => `<li>${item}</li>`).join('');

            // Fade in
            automationList.style.opacity = '1';
            automationList.style.transform = 'translateY(0)';
        }, 200);
    });

    // Set initial transition
    automationList.style.transition = 'all 0.3s ease-out';
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
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', function () {
            const isOpen = item.classList.contains('active');

            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }
            });

            // If it wasn't open before, open it now
            if (!isOpen) {
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

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initPlanToggle();
    initSpotlightEffect();
    initTestimonialMarquee(); // Start Marquee
    initFAQ(); // Start FAQ
});
