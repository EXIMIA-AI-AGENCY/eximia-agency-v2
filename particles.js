// ================================
// EXIMIA - Advanced AI Neural Network
// ================================

class AgentNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.packets = [];
        this.mouse = { x: null, y: null, radius: 250 };

        // Configuration
        this.config = {
            nodeCount: 60, // Number of static/drifting nodes
            connectionDistance: 180, // Max distance to connect
            nodeSpeed: 0.4, // Drifting speed
            packetSpawnRate: 0.05, // Chance to spawn a data packet per frame
            packetSpeed: 2.5, // Speed of data packets
            colors: {
                primary: '168, 85, 247', // Electric Purple
                secondary: '139, 92, 246', // Violet
                background: '0, 0, 0' // Pure Black
            }
        };

        this.init();
    }

    init() {
        this.resize();
        this.createNodes();
        this.animate();

        // Event Listeners
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        // Re-create nodes on resize to distribute them well
        this.createNodes();
    }

    createNodes() {
        this.nodes = [];
        const { width, height } = this.canvas;

        // Calculate dynamic node count based on screen area
        const area = width * height;
        const count = Math.min(Math.floor(area / 15000), 100);

        for (let i = 0; i < count; i++) {
            this.nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * this.config.nodeSpeed,
                vy: (Math.random() - 0.5) * this.config.nodeSpeed,
                radius: Math.random() * 1.5 + 1.5,
                color: Math.random() > 0.5 ? this.config.colors.primary : this.config.colors.secondary,
                pulse: Math.random() * Math.PI * 2,
                connections: [] // To track active connections for this node
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

    spawnPacket(p1, p2) {
        // Only spawn if not too many packets
        if (this.packets.length > 20) return;

        this.packets.push({
            x: p1.x,
            y: p1.y,
            target: p2,
            startX: p1.x,
            startY: p1.y,
            progress: 0,
            speed: this.config.packetSpeed / Math.hypot(p2.x - p1.x, p2.y - p1.y), // Normalized speed
            color: p1.color // Inherit color from source
        });
    }

    updateNodes() {
        this.nodes.forEach(node => {
            // Move
            node.x += node.vx;
            node.y += node.vy;

            // Wall bounce
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

            // Pulse effect
            node.pulse += 0.05;

            // Mouse interaction (Repel/Attract)
            if (this.mouse.x) {
                const dx = this.mouse.x - node.x;
                const dy = this.mouse.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    // Gentle attraction to look like "investigating"
                    const angle = Math.atan2(dy, dx);
                    node.x += Math.cos(angle) * force * 0.5;
                    node.y += Math.sin(angle) * force * 0.5;
                }
            }
        });
    }

    updatePackets() {
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const p = this.packets[i];
            p.progress += p.speed;

            if (p.progress >= 1) {
                // Packet reached destination
                this.packets.splice(i, 1);
                continue;
            }

            // Interpolate position
            p.x = p.startX + (p.target.x - p.startX) * p.progress;
            p.y = p.startY + (p.target.y - p.startY) * p.progress;
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Reset connections for this frame
        this.nodes.forEach(n => n.connections = []);

        // 1. Draw Connections & Spawn Packets
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const p1 = this.nodes[i];
                const p2 = this.nodes[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.config.connectionDistance) {
                    const opacity = 1 - (dist / this.config.connectionDistance);

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${p1.color}, ${opacity * 0.2})`; // Very subtle lines
                    ctx.lineWidth = 1;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();

                    // Chance to spawn a data packet
                    if (Math.random() < this.config.packetSpawnRate * opacity) {
                        this.spawnPacket(p1, p2);
                        // Also spawn reserve packet sometimes
                        if (Math.random() < 0.5) this.spawnPacket(p2, p1);
                    }
                }
            }
        }

        // 2. Draw Packets (Data flow)
        this.packets.forEach(p => {
            ctx.beginPath();
            ctx.fillStyle = `rgb(${p.color})`;
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();

            // Glow trail
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgb(${p.color})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // 3. Draw Nodes (Agents)
        this.nodes.forEach(node => {
            ctx.beginPath();
            const pulseSize = Math.sin(node.pulse) * 0.5 + 0.5; // 0 to 1
            const r = node.radius + pulseSize;

            ctx.fillStyle = `rgb(${node.color})`;
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgb(${node.color})`;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Inner core (white)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(node.x, node.y, r * 0.4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    animate() {
        this.updateNodes();
        this.updatePackets();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AgentNetwork('particleCanvas');
});
