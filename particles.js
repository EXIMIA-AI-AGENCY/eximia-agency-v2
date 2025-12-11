// ================================
// EXIMIA - AI Command Center Animation
// Palantir-style sophisticated visualization
// ================================

class AICommandCenter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.mouse = { x: null, y: null };
        this.time = 0;

        // Configuration
        this.config = {
            colors: {
                primary: 'rgba(168, 85, 247, 1)',      // Electric Purple
                primaryDim: 'rgba(168, 85, 247, 0.3)',
                secondary: 'rgba(139, 92, 246, 1)',    // Violet
                accent: 'rgba(192, 132, 252, 1)',      // Light Purple
                white: 'rgba(255, 255, 255, 0.8)',
                grid: 'rgba(168, 85, 247, 0.05)'
            },
            rings: [
                { radius: 120, speed: 0.0005, nodes: 6, nodeSize: 3 },
                { radius: 200, speed: -0.0003, nodes: 8, nodeSize: 2.5 },
                { radius: 280, speed: 0.0002, nodes: 12, nodeSize: 2 }
            ],
            coreSize: 20,
            corePulseSpeed: 0.02,
            dataStreamCount: 15,
            scanLineInterval: 3000  // ms between scan lines
        };

        this.dataStreams = [];
        this.scanLines = [];
        this.lastScanTime = 0;

        this.init();
    }

    init() {
        this.resize();
        this.createDataStreams();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Scale rings based on screen size
        const scale = Math.min(this.canvas.width, this.canvas.height) / 700;
        this.scale = Math.max(0.5, Math.min(scale, 1.2));
    }

    createDataStreams() {
        this.dataStreams = [];
        for (let i = 0; i < this.config.dataStreamCount; i++) {
            this.dataStreams.push({
                angle: Math.random() * Math.PI * 2,
                speed: 0.001 + Math.random() * 0.002,
                length: 50 + Math.random() * 100,
                offset: Math.random() * 300,
                opacity: 0.1 + Math.random() * 0.2
            });
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    handleMouseLeave() {
        this.mouse.x = null;
        this.mouse.y = null;
    }

    drawGrid() {
        const ctx = this.ctx;
        const gridSize = 50;

        ctx.strokeStyle = this.config.colors.grid;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawCore() {
        const ctx = this.ctx;
        const pulse = Math.sin(this.time * this.config.corePulseSpeed) * 0.3 + 0.7;
        const size = this.config.coreSize * this.scale * pulse;

        // Outer glow
        const gradient = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, size * 3
        );
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.1)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.centerX, this.centerY, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core ring
        ctx.beginPath();
        ctx.strokeStyle = this.config.colors.primary;
        ctx.lineWidth = 2;
        ctx.arc(this.centerX, this.centerY, size, 0, Math.PI * 2);
        ctx.stroke();

        // Inner core
        ctx.beginPath();
        ctx.fillStyle = this.config.colors.white;
        ctx.arc(this.centerX, this.centerY, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRings() {
        const ctx = this.ctx;

        this.config.rings.forEach((ring, ringIndex) => {
            const radius = ring.radius * this.scale;
            const rotation = this.time * ring.speed;

            // Draw the ring circle (very subtle)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
            ctx.lineWidth = 1;
            ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Draw nodes on the ring
            for (let i = 0; i < ring.nodes; i++) {
                const angle = (i / ring.nodes) * Math.PI * 2 + rotation;
                const x = this.centerX + Math.cos(angle) * radius;
                const y = this.centerY + Math.sin(angle) * radius;

                // Node glow
                const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, ring.nodeSize * 4);
                nodeGradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
                nodeGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

                ctx.beginPath();
                ctx.fillStyle = nodeGradient;
                ctx.arc(x, y, ring.nodeSize * 4, 0, Math.PI * 2);
                ctx.fill();

                // Node core
                ctx.beginPath();
                ctx.fillStyle = this.config.colors.primary;
                ctx.arc(x, y, ring.nodeSize, 0, Math.PI * 2);
                ctx.fill();

                // Connection line to center
                ctx.beginPath();
                ctx.strokeStyle = `rgba(168, 85, 247, ${0.05 + Math.sin(this.time * 0.01 + i) * 0.03})`;
                ctx.lineWidth = 1;
                ctx.moveTo(this.centerX, this.centerY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        });
    }

    drawDataStreams() {
        const ctx = this.ctx;

        this.dataStreams.forEach(stream => {
            stream.angle += stream.speed;

            const startRadius = 50 * this.scale + stream.offset;
            const endRadius = startRadius + stream.length * this.scale;

            const startX = this.centerX + Math.cos(stream.angle) * startRadius;
            const startY = this.centerY + Math.sin(stream.angle) * startRadius;
            const endX = this.centerX + Math.cos(stream.angle) * endRadius;
            const endY = this.centerY + Math.sin(stream.angle) * endRadius;

            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0)');
            gradient.addColorStop(0.5, `rgba(168, 85, 247, ${stream.opacity})`);
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        });
    }

    drawScanLines() {
        const ctx = this.ctx;
        const now = Date.now();

        // Spawn new scan line
        if (now - this.lastScanTime > this.config.scanLineInterval) {
            this.scanLines.push({
                radius: 0,
                maxRadius: Math.max(this.canvas.width, this.canvas.height),
                speed: 3
            });
            this.lastScanTime = now;
        }

        // Update and draw scan lines
        for (let i = this.scanLines.length - 1; i >= 0; i--) {
            const scan = this.scanLines[i];
            scan.radius += scan.speed;

            if (scan.radius > scan.maxRadius) {
                this.scanLines.splice(i, 1);
                continue;
            }

            const opacity = 1 - (scan.radius / scan.maxRadius);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.15})`;
            ctx.lineWidth = 2;
            ctx.arc(this.centerX, this.centerY, scan.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawMouseInteraction() {
        if (!this.mouse.x) return;

        const ctx = this.ctx;
        const dx = this.mouse.x - this.centerX;
        const dy = this.mouse.y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Line from core to mouse
        const gradient = ctx.createLinearGradient(
            this.centerX, this.centerY,
            this.mouse.x, this.mouse.y
        );
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.moveTo(this.centerX, this.centerY);
        ctx.lineTo(this.mouse.x, this.mouse.y);
        ctx.stroke();

        // Mouse cursor glow
        const cursorGradient = ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 30
        );
        cursorGradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
        cursorGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

        ctx.beginPath();
        ctx.fillStyle = cursorGradient;
        ctx.arc(this.mouse.x, this.mouse.y, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw layers in order (back to front)
        this.drawGrid();
        this.drawDataStreams();
        this.drawScanLines();
        this.drawRings();
        this.drawCore();
        this.drawMouseInteraction();
    }

    animate() {
        this.time++;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AICommandCenter('particleCanvas');
});
