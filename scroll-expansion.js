/**
 * Scroll Expansion Media Component
 * Vanilla JS implementation of the scroll-based media expansion effect
 * Fixed version with smooth scrolling, video freeze prevention, and audio control
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

        // Sound control state
        this.hasUnmutedOnce = false;
        this.isMuted = true;
        this.userHasInteracted = false;

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
        // Set initial state
        this.updateUI();

        // Initialize video playback
        this.initVideoPlayback();

        // Add event listeners
        window.addEventListener('wheel', this.handleWheel, { passive: false });
        window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);

        // Track user interaction to enable audio
        document.addEventListener('click', this.handleUserInteraction, { once: true });
        document.addEventListener('touchstart', this.handleUserInteraction, { once: true });
        document.addEventListener('keydown', this.handleUserInteraction, { once: true });

        // Sound toggle button
        if (this.soundToggleBtn) {
            this.soundToggleBtn.addEventListener('click', this.toggleSound);
        }

        // Check initial view state
        this.checkIfInView();

        // Start animation loop
        this.animate();

        // Keep video playing check every 500ms
        setInterval(this.keepVideoPlaying, 500);
    }

    // Handle user interaction to allow audio
    handleUserInteraction() {
        this.userHasInteracted = true;
        console.log('User interaction detected, audio can now be enabled');
    }

    // Keep videos playing - prevent freeze
    keepVideoPlaying() {
        const activeVideo = this.getActiveVideo();
        if (activeVideo && activeVideo.paused && !activeVideo.ended) {
            activeVideo.play().catch(() => { });
        }
    }

    // Animation loop for smooth updates
    animate() {
        // Smooth interpolation for scroll progress
        const ease = 0.12;
        const diff = this.targetScrollProgress - this.scrollProgress;

        if (Math.abs(diff) > 0.001) {
            this.scrollProgress += diff * ease;
            this.updateUI();
        }

        this.animationFrame = requestAnimationFrame(this.animate);
    }

    // Initialize video playback with retry logic
    initVideoPlayback() {
        const videos = [this.videoDesktop, this.videoMobile].filter(v => v);

        videos.forEach(video => {
            // Ensure video is muted (required for autoplay)
            video.muted = true;

            // Prevent video from pausing during scroll
            video.setAttribute('data-scroll-active', 'true');

            // Handle when video is ready to play
            video.addEventListener('canplay', () => {
                this.tryPlayVideo(video);
            });

            // Handle if video was already loaded
            if (video.readyState >= 3) {
                this.tryPlayVideo(video);
            }

            // Handle play errors
            video.addEventListener('stalled', () => {
                console.log('Video stalled, attempting to reload...');
                video.load();
            });

            // Handle if video pauses unexpectedly - force replay
            video.addEventListener('pause', () => {
                if (!video.ended) {
                    setTimeout(() => {
                        video.play().catch(() => { });
                    }, 50);
                }
            });

            // Handle waiting/buffering
            video.addEventListener('waiting', () => {
                console.log('Video buffering...');
            });

            // Log when video plays
            video.addEventListener('playing', () => {
                console.log('Video is playing');
            });
        });
    }

    // Try to play video with error handling
    tryPlayVideo(video) {
        if (!video) return;

        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Video playback started successfully');
            }).catch(error => {
                console.log('Autoplay prevented, will retry...', error);
                // Retry after a short delay
                setTimeout(() => {
                    video.play().catch(() => { });
                }, 100);
            });
        }
    }

    // Get the active video based on screen size
    getActiveVideo() {
        return this.isMobile ? this.videoMobile : this.videoDesktop;
    }

    // Sync mute state for both videos
    syncMuteState() {
        if (this.videoDesktop) this.videoDesktop.muted = this.isMuted;
        if (this.videoMobile) this.videoMobile.muted = this.isMuted;
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

        // Check if section is in view (top of section is within viewport)
        this.isActive = rect.top <= 100 && rect.bottom > windowHeight * 0.5;

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

        if (this.mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= this.container.offsetTop + 5) {
            // Scrolling up when fully expanded - collapse
            this.mediaFullyExpanded = false;
            this.showContent = false;
            e.preventDefault();
        } else if (!this.mediaFullyExpanded && this.isActive) {
            e.preventDefault();

            // Use target progress for smooth animation
            const scrollDelta = e.deltaY * 0.0015;
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
        this.checkIfInView();
        if (!this.isActive) return;
        this.touchStartY = e.touches[0].clientY;

        // Register as user interaction
        this.userHasInteracted = true;
    }

    handleTouchMove(e) {
        if (!this.touchStartY || !this.isActive) return;

        const touchY = e.touches[0].clientY;
        const deltaY = this.touchStartY - touchY;

        if (this.mediaFullyExpanded && deltaY < -20 && window.scrollY <= this.container.offsetTop + 5) {
            this.mediaFullyExpanded = false;
            this.showContent = false;
            e.preventDefault();
        } else if (!this.mediaFullyExpanded) {
            e.preventDefault();
            const scrollFactor = deltaY < 0 ? 0.012 : 0.008;
            const scrollDelta = deltaY * scrollFactor;
            const newProgress = Math.min(Math.max(this.targetScrollProgress + scrollDelta, 0), 1);
            this.targetScrollProgress = newProgress;

            if (newProgress >= 1) {
                this.mediaFullyExpanded = true;
                this.showContent = true;
            } else if (newProgress < 0.75) {
                this.showContent = false;
            }

            this.touchStartY = touchY;
        }
    }

    handleTouchEnd() {
        this.touchStartY = 0;
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the scroll expansion component
    const scrollExpand = new ScrollExpandMedia('#scroll-expand-section');
});
