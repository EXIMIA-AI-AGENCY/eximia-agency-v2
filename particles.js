// ================================
// EXIMIA - n8n Style Workflow Animation
// Visualizing Autonomous Agents
// ================================

class WorkflowAnimation {
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
                success: 'rgba(34, 197, 94, 1)',       // Green for completions
                processing: 'rgba(59, 130, 246, 1)',   // Blue for processing
                line: 'rgba(100, 116, 139, 0.2)',      // Subtle grey for connector lines
                bg: 'rgba(15, 23, 42, 0)'
            },
            nodeSize: { width: 140, height: 50 },
            packetSpeed: 0.008, // Progress per frame (0-1)
        };

        this.nodes = [];
        this.connections = [];
        this.packets = [];

        this.init();
    }

    init() {
        this.resize();
        this.buildWorkflowGraph();
        this.animate();

        window.addEventListener('resize', () => {
            this.resize();
            this.buildWorkflowGraph();
        });
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', () => this.triggerPacket()); // Click to manual trigger
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.scale = Math.min(this.canvas.width / 1400, 1); // Scale down on mobile
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    // Define the automation graph structure
    buildWorkflowGraph() {
        this.nodes = [];
        this.connections = [];

        // Grid layout calculation
        const cx = this.centerX + (this.canvas.width > 768 ? 100 : 0); // Shift right on desktop for text
        const cy = this.centerY;
        const w = 250 * this.scale; // Horizontal spacing
        const h = 150 * this.scale; // Vertical spacing

        // Define Nodes (Positions relative to center)
        const nodeDefinitions = [
            { id: 'start', label: 'Lead Entry (Form)', type: 'trigger', x: cx - w * 1.5, y: cy },
            { id: 'qualify', label: 'AI Qualifier', type: 'agent', x: cx - w * 0.5, y: cy },

            // Branch 1: Success
            { id: 'crm', label: 'Update CRM', type: 'action', x: cx + w * 0.5, y: cy - h * 0.8 },
            { id: 'booking', label: 'Book Meeting', type: 'action', x: cx + w * 1.5, y: cy - h * 0.8 },

            // Branch 2: Follow-up
            { id: 'wait', label: 'Wait 24h', type: 'time', x: cx + w * 0.5, y: cy + h * 0.8 },
            { id: 'email', label: 'Send Follow-up', type: 'action', x: cx + w * 1.5, y: cy + h * 0.8 },

            // Loop back (Logical representation)
            { id: 'notify', label: 'Notify Sales', type: 'success', x: cx + w * 2.5, y: cy },
        ];

        this.nodes = nodeDefinitions.map(n => ({
            ...n,
            status: 'idle', // idle, active, success
            pulse: 0
        }));

        // Define Connections (Source ID -> Target ID)
        const connectionDefs = [
            { from: 'start', to: 'qualify' },
            { from: 'qualify', to: 'crm' },
            { from: 'crm', to: 'booking' },
            { from: 'booking', to: 'notify' },
            { from: 'qualify', to: 'wait' },
            { from: 'wait', to: 'email' },
            { from: 'email', to: 'notify' }
        ];

        connectionDefs.forEach(c => {
            const source = this.nodes.find(n => n.id === c.from);
            const target = this.nodes.find(n => n.id === c.to);
            if (source && target) {
                this.connections.push({ source, target });
            }
        });

        // Start automatic workflow loop
        this.startAutoLoop();
    }

    startAutoLoop() {
        // Spawn a packet from start every few seconds
        setInterval(() => {
            this.triggerPacket();
        }, 2000);
    }

    triggerPacket() {
        if (this.nodes.length === 0) return;
        this.spawnPacket(this.nodes[0], null); // Start node
    }

    spawnPacket(sourceNode, targetNode) {
        // If just starting, find next connection
        if (!targetNode && sourceNode) {
            this.activateNode(sourceNode);
            // Find all outgoing connections
            const outgoing = this.connections.filter(c => c.source.id === sourceNode.id);
            outgoing.forEach(conn => {
                this.packets.push({
                    source: conn.source,
                    target: conn.target,
                    progress: 0,
                    speed: this.config.packetSpeed * (1 + Math.random() * 0.5) // Slight speed var
                });
            });
            return;
        }
    }

    activateNode(node) {
        node.status = 'active';
        node.pulse = 1;
        setTimeout(() => node.status = 'idle', 500);
    }

    update() {
        this.packets.forEach((p, index) => {
            p.progress += p.speed;

            if (p.progress >= 1) {
                // Packet reached target
                this.activateNode(p.target);

                // Spawn new packets from this target (Chain reaction)
                const outgoing = this.connections.filter(c => c.source.id === p.target.id);
                outgoing.forEach(conn => {
                    this.packets.push({
                        source: conn.source,
                        target: conn.target,
                        progress: 0,
                        speed: this.config.packetSpeed
                    });
                });

                // Remove finished packet
                this.packets.splice(index, 1);
            }
        });

        // Decay node pulses
        this.nodes.forEach(n => {
            if (n.pulse > 0) n.pulse -= 0.05;
        });
    }

    drawCurve(p1, p2, color, width) {
        const ctx = this.ctx;
        ctx.beginPath();
        const cp1x = p1.x + (p2.x - p1.x) * 0.5;
        const cp1y = p1.y;
        const cp2x = p1.x + (p2.x - p1.x) * 0.5;
        const cp2y = p2.y;

        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        return { cp1x, cp1y, cp2x, cp2y }; // Return control points for packet interpolation
    }

    // Cubic Bezier interpolation
    getPointOnCurve(p1, p2, t) {
        const cx1 = p1.x + (p2.x - p1.x) * 0.5;
        const cy1 = p1.y;
        const cx2 = p1.x + (p2.x - p1.x) * 0.5;
        const cy2 = p2.y;

        const k = 1 - t;
        const x = (k * k * k * p1.x) + (3 * k * k * t * cx1) + (3 * k * t * t * cx2) + (t * t * t * p2.x);
        const y = (k * k * k * p1.y) + (3 * k * k * t * cy1) + (3 * k * t * t * cy2) + (t * t * t * p2.y);
        return { x, y };
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.connections.forEach(conn => {
            this.drawCurve(conn.source, conn.target, this.config.colors.line, 2);
        });

        // Draw Packets
        this.packets.forEach(p => {
            const pos = this.getPointOnCurve(p.source, p.target, p.progress);

            // Packet glow
            ctx.beginPath();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.config.colors.primary;
            ctx.fillStyle = this.config.colors.primary;
            ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw Nodes
        this.nodes.forEach(node => {
            const w = this.config.nodeSize.width * this.scale;
            const h = this.config.nodeSize.height * this.scale;
            const x = node.x - w / 2;
            const y = node.y - h / 2;

            // Box shadow / Glow on active
            if (node.pulse > 0) {
                ctx.shadowBlur = 20 * node.pulse;
                ctx.shadowColor = this.config.colors.processing;
            }

            // Node Background
            ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; // Dark slate
            ctx.strokeStyle = node.pulse > 0 ? this.config.colors.primary : 'rgba(148, 163, 184, 0.2)';
            ctx.lineWidth = node.pulse > 0 ? 2 : 1;

            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 8);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Status Indicator Dot
            ctx.beginPath();
            ctx.fillStyle = node.pulse > 0.5 ? this.config.colors.processing : 'rgba(148, 163, 184, 0.5)';
            ctx.arc(x + 15, y + h / 2, 4, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.fillStyle = '#e2e8f0';
            ctx.font = `${12 * this.scale}px Inter, monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(node.label, x + 30, y + h / 2 + 4);
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new WorkflowAnimation('workflowCanvas');
});
