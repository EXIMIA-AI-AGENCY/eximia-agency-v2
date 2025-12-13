/**
 * EXIMIA AI Voice Widget
 * A premium pill-style voice widget powered by ElevenLabs
 * 
 * Usage: Add to any page:
 * <script src="voice-widget.js" data-agent-id="YOUR_AGENT_ID"></script>
 */

(function () {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    const scriptTag = document.currentScript;
    const AGENT_ID = scriptTag?.getAttribute('data-agent-id') || 'agent_01jxr8njx9fyn8bn0fh921hcfw';
    const AVATAR_URL = scriptTag?.getAttribute('data-avatar') || 'ai-avatar.png';
    const POSITION = scriptTag?.getAttribute('data-position') || 'bottom-right'; // bottom-right, bottom-left
    const GREETING = scriptTag?.getAttribute('data-greeting') || 'Talk to AI';

    // ========================================
    // INJECT STYLES
    // ========================================
    const styles = `
        /* ================================
           EXIMIA VOICE WIDGET - PILL STYLE
           ================================ */
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .exi-voice-widget {
            position: fixed;
            ${POSITION === 'bottom-left' ? 'left: 24px;' : 'right: 24px;'}
            bottom: 24px;
            z-index: 999999;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* The Pill Button */
        .exi-pill {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 20px 8px 8px;
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.05) inset;
            position: relative;
            overflow: hidden;
        }

        .exi-pill::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .exi-pill:hover {
            transform: translateY(-2px);
            border-color: rgba(168, 85, 247, 0.3);
            box-shadow: 
                0 12px 40px rgba(168, 85, 247, 0.2),
                0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        .exi-pill:hover::before {
            opacity: 1;
        }

        .exi-pill:active {
            transform: translateY(0);
        }

        /* Avatar Container */
        .exi-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            overflow: hidden;
            position: relative;
            flex-shrink: 0;
            background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
            padding: 2px;
        }

        .exi-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        /* Pulse ring when active */
        .exi-avatar::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid #a855f7;
            opacity: 0;
            animation: none;
        }

        .exi-pill.active .exi-avatar::after {
            animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.8; }
            100% { transform: scale(1.3); opacity: 0; }
        }

        /* Status Section */
        .exi-status {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 100px;
        }

        .exi-status-text {
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
        }

        .exi-status-sub {
            font-size: 11px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.5);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        /* Live indicator dot */
        .exi-live-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #22c55e;
            animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        /* Audio Visualizer (mini) */
        .exi-mini-bars {
            display: none;
            align-items: center;
            gap: 2px;
            height: 16px;
            margin-left: 8px;
        }

        .exi-pill.active .exi-mini-bars {
            display: flex;
        }

        .exi-mini-bar {
            width: 3px;
            height: 4px;
            background: linear-gradient(to top, #a855f7, #ec4899);
            border-radius: 2px;
        }

        .exi-pill.listening .exi-mini-bar {
            animation: mini-wave 0.5s ease-in-out infinite;
        }

        .exi-pill.speaking .exi-mini-bar {
            animation: mini-wave 0.3s ease-in-out infinite;
            background: linear-gradient(to top, #22c55e, #4ade80);
        }

        .exi-mini-bar:nth-child(1) { animation-delay: 0s; }
        .exi-mini-bar:nth-child(2) { animation-delay: 0.1s; }
        .exi-mini-bar:nth-child(3) { animation-delay: 0.2s; }
        .exi-mini-bar:nth-child(4) { animation-delay: 0.15s; }

        @keyframes mini-wave {
            0%, 100% { height: 4px; }
            50% { height: 14px; }
        }

        /* End Button */
        .exi-end-btn {
            display: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            margin-left: 8px;
            transition: all 0.2s ease;
            flex-shrink: 0;
            position: relative;
            z-index: 10;
            -webkit-tap-highlight-color: transparent;
        }

        .exi-pill.active .exi-end-btn {
            display: flex;
        }

        .exi-end-btn:hover {
            background: rgba(239, 68, 68, 0.35);
            transform: scale(1.1);
        }
        
        .exi-end-btn:active {
            transform: scale(0.95);
            background: rgba(239, 68, 68, 0.5);
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
            .exi-voice-widget {
                ${POSITION === 'bottom-left' ? 'left: 16px;' : 'right: 16px;'}
                bottom: 16px;
            }

            .exi-pill {
                padding: 6px 16px 6px 6px;
                gap: 10px;
            }

            .exi-avatar {
                width: 38px;
                height: 38px;
            }

            .exi-status-text {
                font-size: 13px;
            }

            .exi-status-sub {
                font-size: 10px;
            }
        }

        /* Hide when chat widget visible (optional) */
        .exi-voice-widget.hidden {
            display: none;
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // ========================================
    // INJECT HTML
    // ========================================
    const widgetHTML = `
        <div class="exi-voice-widget" id="exiVoiceWidget">
            <div class="exi-pill" id="exiPill" role="button" tabindex="0" aria-label="Start voice conversation">
                <div class="exi-avatar">
                    <img src="${AVATAR_URL}" alt="AI Assistant" />
                </div>
                <div class="exi-status">
                    <span class="exi-status-text" id="exiStatusText">${GREETING}</span>
                    <span class="exi-status-sub" id="exiStatusSub">
                        <span class="exi-live-dot"></span>
                        Disponible 24/7
                    </span>
                </div>
                <div class="exi-mini-bars">
                    <div class="exi-mini-bar"></div>
                    <div class="exi-mini-bar"></div>
                    <div class="exi-mini-bar"></div>
                    <div class="exi-mini-bar"></div>
                </div>
                <button class="exi-end-btn" id="exiEndBtn" aria-label="End conversation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Inject widget
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);

    // ========================================
    // LOAD ELEVENLABS SDK
    // ========================================
    let ElevenLabsConversation = null;

    async function loadSDK() {
        try {
            const module = await import('https://cdn.jsdelivr.net/npm/@11labs/client/+esm');
            ElevenLabsConversation = module.Conversation;
            console.log('✅ ElevenLabs Voice Widget SDK loaded');
        } catch (error) {
            console.error('Failed to load ElevenLabs SDK:', error);
        }
    }

    loadSDK();

    // ========================================
    // WIDGET LOGIC
    // ========================================
    const pill = document.getElementById('exiPill');
    const statusText = document.getElementById('exiStatusText');
    const statusSub = document.getElementById('exiStatusSub');
    const endBtn = document.getElementById('exiEndBtn');

    let conversation = null;
    let isActive = false;

    // Start conversation
    async function startConversation() {
        if (isActive || !ElevenLabsConversation) {
            if (!ElevenLabsConversation) {
                statusText.textContent = 'Cargando...';
                setTimeout(startConversation, 500);
            }
            return;
        }

        try {
            statusText.textContent = 'Conectando...';
            statusSub.innerHTML = '<span class="exi-live-dot"></span> Solicitando permisos...';

            await navigator.mediaDevices.getUserMedia({ audio: true });

            conversation = await ElevenLabsConversation.startSession({
                agentId: AGENT_ID,
                connectionType: 'webrtc',

                onConnect: () => {
                    isActive = true;
                    pill.classList.add('active', 'listening');
                    statusText.textContent = 'Te escucho...';
                    statusSub.innerHTML = '<span class="exi-live-dot"></span> En vivo';
                },

                onDisconnect: () => {
                    resetWidget();
                },

                onError: (error) => {
                    console.error('Voice error:', error);
                    statusText.textContent = 'Error';
                    setTimeout(resetWidget, 2000);
                },

                onModeChange: (mode) => {
                    pill.classList.remove('listening', 'speaking');
                    if (mode.mode === 'speaking') {
                        pill.classList.add('speaking');
                        statusText.textContent = 'Hablando...';
                    } else {
                        pill.classList.add('listening');
                        statusText.textContent = 'Te escucho...';
                    }
                }
            });

        } catch (error) {
            console.error('Start error:', error);
            if (error.name === 'NotAllowedError') {
                statusText.textContent = 'Micrófono denegado';
            } else {
                statusText.textContent = 'Error';
            }
            setTimeout(resetWidget, 2000);
        }
    }

    // End conversation
    async function endConversation(e) {
        e.stopPropagation();
        if (conversation) {
            try {
                await conversation.endSession();
            } catch (err) {
                console.error('End error:', err);
            }
        }
        resetWidget();
    }

    // Reset widget to initial state
    function resetWidget() {
        isActive = false;
        conversation = null;
        pill.classList.remove('active', 'listening', 'speaking');
        statusText.textContent = GREETING;
        statusSub.innerHTML = '<span class="exi-live-dot"></span> Disponible 24/7';
    }

    // Event listeners
    pill.addEventListener('click', (e) => {
        // Don't start if clicking the end button
        if (e.target.closest('.exi-end-btn')) {
            return;
        }
        if (!isActive) {
            startConversation();
        }
    });

    // End button - use mousedown for faster response and prevent propagation
    endBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    endBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🛑 End button clicked');
        endConversation(e);
    });

    // Touch support for mobile
    endBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🛑 End button touched');
        endConversation(e);
    });

    // Keyboard accessibility
    pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isActive) {
                startConversation();
            }
        }
    });

    console.log('🎙️ EXIMIA Voice Widget initialized');

})();
