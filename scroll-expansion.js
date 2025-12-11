/**
 * Scroll Expansion Media Component
 * Vanilla JS implementation of the scroll-based media expansion effect
 * SUPER OPTIMIZED for mobile with GPU acceleration and 60fps
 */

class ScrollExpandMedia {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.scrollProgress = 0;
        this.targetScrollProgress = 0;
        this.showContent = false;
        this.mediaFullyExpanded = false;
        this.touchStartY = 0;
        this.isMobile = window.innerWidth < 768;
        this.isActive = false;
        this.animationFrame = null;
        this.lastFrameTime = 0;

        // Sound control state
        this.hasUnmutedOnce = false;
        this.isMuted = true;
        this.userHasInteracted = false;

        // Throttle flags for performance
        this.isThrottled = false;
        this.throttleDelay = 16; // ~60fps

        // Cache DOM elements
        this.mediaWrapper = this.container.querySelector('.scroll-expand-media-wrapper');
        this.bgImage = this.container.querySelector('.scroll-expand-bg');
        this.bgOverlay = this.container.querySelector('.scroll-expand-bg-overlay');
        this.titleFirst = this.container.querySelector('.scroll-expand-title-first');
        this.titleRest = this.container.querySelector('.scroll-expand-title-rest');
        this.dateText = this.container.querySelector('.scroll-expand-date');
        this.scrollHint = this.container.querySelector('.scroll-expand-hint');
        this.contentSection = this.container.querySelector('.scroll-expand-content');
        this.videoOverlay = this.container.querySelector('.scroll-expand-video-overlay');

        // Video and sound button
        this.videoDesktop = document.getElementById('eximia-video');
        this.videoMobile = document.getElementById('eximia-video-mobile');
        this.soundToggleBtn = document.getElementById('sound-toggle');

        // Bind methods
        this.handleWheel = this.handleWheel.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.checkIfInView = this.checkIfInView.bind(this);
        this.toggleSound = this.toggleSound.bind(this);
        this.animate = this.animate.bind(this);
        this.handleUserInteraction = this.handleUserInteraction.bind(this);
        this.keepVideoPlaying = this.keepVideoPlaying.bind(this);

        this.init();
    }

    init() {
        // Enable GPU acceleration hints on animated elements
        this.enableGPUAcceleration();

        // Set initial state
        this.updateUI();

        // Initialize video playback
        this.initVideoPlayback();

        // Add event listeners with passive where possible
        window.addEventListener('wheel', this.handleWheel, { passive: false });
        window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.debounce(this.handleResize, 100));

        // Track user interaction to enable audio
        document.addEventListener('click', this.handleUserInteraction, { once: true });
        document.addEventListener('touchstart', this.handleUserInteraction, { once: true, passive: true });
        document.addEventListener('keydown', this.handleUserInteraction, { once: true });

        // Sound toggle button
        if (this.soundToggleBtn) {
            this.soundToggleBtn.addEventListener('click', this.toggleSound);
        }

        // Check initial view state immediately and after a delay (for slow loads)
        this.checkIfInView();
        setTimeout(() => this.checkIfInView(), 100);
        setTimeout(() => this.checkIfInView(), 500);

        // Use Intersection Observer for more reliable activation
        this.setupIntersectionObserver();

        // Start animation loop
        requestAnimationFrame(this.animate);

        // Keep checking view state frequently for reliability
        setInterval(() => {
            this.isMobile = window.innerWidth < 768; // Re-check mobile on every interval
            this.checkIfInView();
            this.keepVideoPlaying();
        }, 250);
    }

    // More reliable section detection with Intersection Observer
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                        this.isActive = true;
                    }
                });
            }, {
                threshold: [0.1, 0.3, 0.5, 0.7],
                rootMargin: '0px'
            });

            observer.observe(this.container);
        }
    }

    // Enable GPU acceleration on all animated elements
    enableGPUAcceleration() {
        const elements = [
            this.mediaWrapper,
            this.bgImage,
            this.bgOverlay,
            this.titleFirst,
            this.titleRest,
            this.dateText,
            this.scrollHint,
            this.videoOverlay
        ].filter(el => el);

        elements.forEach(el => {
            el.style.willChange = 'transform, opacity';
            el.style.backfaceVisibility = 'hidden';
            el.style.perspective = '1000px';
        });
    }

    // Debounce utility for resize
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Handle user interaction to allow audio
    handleUserInteraction() {
        this.userHasInteracted = true;
    }

    // Keep videos playing - prevent freeze
    keepVideoPlaying() {
        const activeVideo = this.getActiveVideo();
        if (activeVideo && activeVideo.paused && !activeVideo.ended) {
            activeVideo.play().catch(() => { });
        }
    }

    // Animation loop for smooth updates - optimized with delta time
    animate(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        // Adaptive easing - faster on mobile for snappier feel
        const baseEase = this.isMobile ? 0.15 : 0.12;
        const ease = Math.min(baseEase * (deltaTime / 16.67), 0.3); // Cap easing

        const diff = this.targetScrollProgress - this.scrollProgress;

        if (Math.abs(diff) > 0.0005) {
            this.scrollProgress += diff * ease;
            this.updateUI();
        }

        this.animationFrame = requestAnimationFrame(this.animate);
    }

    // Initialize video playback with retry logic
    initVideoPlayback() {
        // Pause the inactive video and only play the active one
        this.manageActiveVideo();

        // Listen for resize to switch videos
        window.addEventListener('resize', () => {
            this.manageActiveVideo();
        });
    }

    // Manage which video is playing based on screen size
    manageActiveVideo() {
        const activeVideo = this.getActiveVideo();
        const inactiveVideo = this.isMobile ? this.videoDesktop : this.videoMobile;

        // Pause and mute the inactive video
        if (inactiveVideo) {
            inactiveVideo.pause();
            inactiveVideo.muted = true;
        }

        // Setup and play the active video
        if (activeVideo) {
            activeVideo.muted = this.isMuted;

            // Only play if not already playing
            if (activeVideo.paused) {
                activeVideo.play().catch(() => { });
            }
        }
    }

    // Try to play video with error handling
    tryPlayVideo(video) {
        if (!video) return;

        // Only play if this is the active video
        if (video !== this.getActiveVideo()) {
            video.pause();
            return;
        }

        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Video playback started successfully');
            }).catch(error => {
                console.log('Autoplay prevented, will retry...', error);
            });
        }
    }

    // Get the active video based on screen size
    getActiveVideo() {
        return this.isMobile ? this.videoMobile : this.videoDesktop;
    }

    // Sync mute state - only for active video
    syncMuteState() {
        const activeVideo = this.getActiveVideo();
        const inactiveVideo = this.isMobile ? this.videoDesktop : this.videoMobile;

        // Always mute inactive video
        if (inactiveVideo) {
            inactiveVideo.muted = true;
        }

        // Apply mute state to active video only
        if (activeVideo) {
            activeVideo.muted = this.isMuted;
        }
    }

    toggleSound() {
        const activeVideo = this.getActiveVideo();
        if (!activeVideo) return;

        // Mark as user interaction
        this.userHasInteracted = true;

        // Mark that user has manually controlled sound (prevent auto-unmute from overriding)
        this.hasUnmutedOnce = true;

        // Toggle mute state
        this.isMuted = !this.isMuted;

        // Apply mute state directly to the active video first
        activeVideo.muted = this.isMuted;

        // Then sync to other video
        this.syncMuteState();

        // Ensure video is playing when unmuting
        if (!this.isMuted) {
            activeVideo.play().catch(() => { });
        }

        // Update button visual state
        if (this.soundToggleBtn) {
            if (this.isMuted) {
                this.soundToggleBtn.classList.remove('unmuted');
            } else {
                this.soundToggleBtn.classList.add('unmuted');
            }
        }

        console.log('Sound toggled:', this.isMuted ? 'muted' : 'unmuted');
    }

    updateSoundState() {
        const activeVideo = this.getActiveVideo();

        // Show button when scroll progress is significant
        if (this.soundToggleBtn) {
            const shouldShowButton = this.scrollProgress > 0.2;
            this.soundToggleBtn.classList.toggle('visible', shouldShowButton);
        }

        // Auto-unmute when scroll effect starts (only once, and only if user has interacted)
        if (this.scrollProgress > 0.2 && !this.hasUnmutedOnce && activeVideo && this.userHasInteracted) {
            this.hasUnmutedOnce = true;
            this.isMuted = false;
            this.syncMuteState();

            // Also ensure video is playing
            activeVideo.play().catch(() => { });

            if (this.soundToggleBtn) {
                this.soundToggleBtn.classList.add('unmuted');
            }
            console.log('Sound auto-enabled on scroll');
        }

        // Re-mute and reset when scrolling back to start
        if (this.scrollProgress < 0.05 && this.hasUnmutedOnce) {
            this.hasUnmutedOnce = false;
            this.isMuted = true;
            this.syncMuteState();
            if (this.soundToggleBtn) {
                this.soundToggleBtn.classList.remove('unmuted');
            }
        }
    }

    checkIfInView() {
        const rect = this.container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // More sensitive activation for mobile - trigger earlier
        // On mobile: activate when section is 60% visible from top
        // On desktop: activate when top is near viewport top
        const activationThreshold = this.isMobile ? windowHeight * 0.4 : 100;

        this.isActive = rect.top <= activationThreshold && rect.bottom > windowHeight * 0.3;

        // Keep video playing when active
        if (this.isActive) {
            this.keepVideoPlaying();
        }
    }

    handleWheel(e) {
        this.checkIfInView();

        if (!this.isActive) return;

        // Register as user interaction
        this.userHasInteracted = true;

        // If scrolling up and progress is 0, allow normal page scroll to go back to hero
        if (e.deltaY < 0 && this.targetScrollProgress <= 0 && !this.mediaFullyExpanded) {
            // Don't prevent default - let user scroll up to hero section
            return;
        }

        if (this.mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= this.container.offsetTop + 5) {
            // Scrolling up when fully expanded - collapse
            this.mediaFullyExpanded = false;
            this.showContent = false;
            e.preventDefault();
        } else if (!this.mediaFullyExpanded && this.isActive) {
            e.preventDefault();

            // Use target progress for smooth animation - faster expansion
            const scrollDelta = e.deltaY * 0.004; // 2.5x faster than before
            const newProgress = Math.min(Math.max(this.targetScrollProgress + scrollDelta, 0), 1);
            this.targetScrollProgress = newProgress;

            if (newProgress >= 1) {
                this.mediaFullyExpanded = true;
                this.showContent = true;
            } else if (newProgress < 0.75) {
                this.showContent = false;
            }
        }
    }

    handleTouchStart(e) {
        // ALWAYS capture touch data - check isActive during move
        this.touchStartY = e.touches[0].clientY;
        this.lastTouchY = this.touchStartY;
        this.touchVelocity = 0;
        this.lastTouchTime = Date.now();

        // Check if in view and register interaction
        this.checkIfInView();
        this.userHasInteracted = true;
    }

    handleTouchMove(e) {
        // Check isActive EVERY move, not just at start
        this.checkIfInView();

        if (!this.touchStartY) return;

        const touchY = e.touches[0].clientY;
        const deltaY = this.lastTouchY - touchY;
        const now = Date.now();
        const timeDelta = now - this.lastTouchTime;

        // Calculate velocity for momentum
        if (timeDelta > 0) {
            this.touchVelocity = deltaY / timeDelta;
        }

        this.lastTouchY = touchY;
        this.lastTouchTime = now;

        // If swiping up and progress is 0, allow normal scroll to go back to hero
        if (deltaY < 0 && this.targetScrollProgress <= 0 && !this.mediaFullyExpanded) {
            // Don't prevent default - let user scroll up to hero section
            return;
        }

        // If NOT in the active section, allow normal scroll
        if (!this.isActive) {
            return; // Let normal page scroll happen
        }

        if (this.mediaFullyExpanded && deltaY < -30 && window.scrollY <= this.container.offsetTop + 5) {
            this.mediaFullyExpanded = false;
            this.showContent = false;
            e.preventDefault();
        } else if (!this.mediaFullyExpanded) {
            e.preventDefault();

            // ULTRA responsive scroll factor for mobile - needs very little swipe
            const scrollFactor = 0.04; // Very sensitive - small swipe = big progress
            const scrollDelta = deltaY * scrollFactor;
            const newProgress = Math.min(Math.max(this.targetScrollProgress + scrollDelta, 0), 1);
            this.targetScrollProgress = newProgress;

            if (newProgress >= 1) {
                this.mediaFullyExpanded = true;
                this.showContent = true;
            } else if (newProgress < 0.75) {
                this.showContent = false;
            }
        }
    }

    handleTouchEnd() {
        // Apply momentum with snap behavior - more aggressive for mobile
        if (this.touchVelocity && !this.mediaFullyExpanded) {
            const momentum = this.touchVelocity * 120; // Much higher momentum multiplier
            let newProgress = this.targetScrollProgress + momentum;

            // More aggressive snap - easier to complete the effect
            if (newProgress > 0.6) {
                newProgress = 1;
                this.mediaFullyExpanded = true;
                this.showContent = true;
            } else if (newProgress < 0.2) {
                newProgress = 0;
            }

            this.targetScrollProgress = Math.min(Math.max(newProgress, 0), 1);
        }

        this.touchStartY = 0;
        this.lastTouchY = 0;
        this.touchVelocity = 0;
    }

    handleScroll() {
        this.checkIfInView();
    }

    handleResize() {
        this.isMobile = window.innerWidth < 768;
        this.updateUI();
    }

    updateUI() {
        // Calculate dimensions based on progress - Optimized for mobile
        const baseWidth = this.isMobile ? 280 : 300;
        const baseHeight = this.isMobile ? 350 : 400;

        // Calculate max dimensions to fill viewport on mobile
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidthAdd = this.isMobile ? (viewportWidth - baseWidth - 20) : 1250;
        const maxHeightAdd = this.isMobile ? (viewportHeight * 0.75 - baseHeight) : 400;

        const mediaWidth = baseWidth + this.scrollProgress * maxWidthAdd;
        const mediaHeight = baseHeight + this.scrollProgress * maxHeightAdd;
        const textTranslateX = this.scrollProgress * (this.isMobile ? 150 : 150);

        // Use transform for GPU-accelerated animations (prevents video freeze)
        if (this.mediaWrapper) {
            this.mediaWrapper.style.width = `${mediaWidth}px`;
            this.mediaWrapper.style.height = `${mediaHeight}px`;
        }

        // Update background opacity
        if (this.bgImage) {
            this.bgImage.style.opacity = 1 - this.scrollProgress;
        }
        if (this.bgOverlay) {
            this.bgOverlay.style.opacity = 1 - this.scrollProgress;
        }

        // Update text transforms using GPU-accelerated transform3d
        if (this.titleFirst) {
            this.titleFirst.style.transform = `translate3d(-${textTranslateX}vw, 0, 0)`;
        }
        if (this.titleRest) {
            this.titleRest.style.transform = `translate3d(${textTranslateX}vw, 0, 0)`;
        }
        if (this.dateText) {
            this.dateText.style.transform = `translate3d(-${textTranslateX}vw, 0, 0)`;
        }
        if (this.scrollHint) {
            this.scrollHint.style.transform = `translate3d(${textTranslateX}vw, 0, 0)`;
        }

        // Update video overlay
        if (this.videoOverlay) {
            this.videoOverlay.style.opacity = 0.5 - this.scrollProgress * 0.3;
        }

        // Update content section visibility
        if (this.contentSection) {
            this.contentSection.style.opacity = this.showContent ? '1' : '0';
            this.contentSection.style.visibility = this.showContent ? 'visible' : 'hidden';
        }

        // Update sound state
        this.updateSoundState();
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        window.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

// BULLETPROOF initialization - works 100% of the time
let scrollExpandInstance = null;

function initScrollExpand() {
    // Only initialize once
    if (scrollExpandInstance) return;

    const container = document.querySelector('#scroll-expand-section');
    if (!container) {
        // Container not ready, retry
        setTimeout(initScrollExpand, 50);
        return;
    }

    scrollExpandInstance = new ScrollExpandMedia('#scroll-expand-section');
    console.log('ScrollExpandMedia initialized successfully');
}

// Method 1: DOMContentLoaded (standard)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollExpand);
} else {
    // DOM is already ready
    initScrollExpand();
}

// Method 2: window.onload fallback (for slow mobile connections)
window.addEventListener('load', initScrollExpand);

// Method 3: Aggressive retry for mobile (belt and suspenders)
setTimeout(initScrollExpand, 100);
setTimeout(initScrollExpand, 300);
setTimeout(initScrollExpand, 500);
setTimeout(initScrollExpand, 1000);
