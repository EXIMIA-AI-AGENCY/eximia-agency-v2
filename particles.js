// EXIMIA - AI Super-Entity 3D Animation
// Uses Three.js for a high-performance particle system

class AISuperEntity {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.count = 4000; // Number of particles
        this.positions = null;
        this.colors = null;
        this.sizes = null;
        this.initialPositions = null; // Store base for morphing
        this.clock = new THREE.Clock();

        // State for "self-organizing" behavior
        this.mode = 'swarm'; // swarm, sphere, ring, DNA
        this.modeTimer = 0;
        this.targetPositions = new Float32Array(this.count * 3);

        this.init();
    }

    init() {
        // Scene Setup
        this.scene = new THREE.Scene();
        // Fog to blend into background (matches CSS #000000)
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 1, 2000);
        this.camera.position.z = 800;
        this.camera.position.y = 100;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Particles
        this.createParticles();

        // Listeners
        window.addEventListener('resize', this.onResize.bind(this));

        // Start Loop
        this.animate();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);
        this.sizes = new Float32Array(this.count);
        this.initialPositions = new Float32Array(this.count * 3);

        const color1 = new THREE.Color('#a855f7'); // Electric Violet
        const color2 = new THREE.Color('#c084fc'); // Soft Cyan/Purple

        for (let i = 0; i < this.count; i++) {
            // Random initial swirl distribution
            const r = Math.random() * 800 - 400;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = 1000 * Math.random() - 500;
            const y = 600 * Math.random() - 300;
            const z = 1000 * Math.random() - 500;

            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;

            this.initialPositions[i * 3] = x;
            this.initialPositions[i * 3 + 1] = y;
            this.initialPositions[i * 3 + 2] = z;

            // Mix Colors
            const mixedColor = color1.clone().lerp(color2, Math.random());
            this.colors[i * 3] = mixedColor.r;
            this.colors[i * 3 + 1] = mixedColor.g;
            this.colors[i * 3 + 2] = mixedColor.b;

            this.sizes[i] = Math.random() * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

        // Material (using standard helper for dots)
        // Creating a texture on the fly for soft particles would be nice, but simple squares are faster.
        // Let's use a simple shader or texture loader? 
        // We'll use a simple circle texture created on Canvas to avoid loading external assets if possible, 
        // or just standard points. Standard Points are cleaner.

        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        this.updateTargets(); // Initialize targets
    }

    updateTargets() {
        // Switch modes occasionally to simulate "Intelligence" / "Self-Organizing"
        const modes = ['swarm', 'sphere', 'cube', 'doubleHelix'];
        this.mode = modes[Math.floor(Math.random() * modes.length)];

        const time = Date.now() * 0.001;

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            if (this.mode === 'sphere') {
                const phi = Math.acos(-1 + (2 * i) / this.count);
                const theta = Math.sqrt(this.count * Math.PI) * phi;
                const radius = 350;

                this.targetPositions[i3] = radius * Math.cos(theta) * Math.sin(phi);
                this.targetPositions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
                this.targetPositions[i3 + 2] = radius * Math.cos(phi);

            } else if (this.mode === 'cube') {
                const size = 600;
                this.targetPositions[i3] = Math.random() * size - size / 2;
                this.targetPositions[i3 + 1] = Math.random() * size - size / 2;
                this.targetPositions[i3 + 2] = Math.random() * size - size / 2;

            } else if (this.mode === 'doubleHelix') {
                const t = i * 0.1;
                const radius = 200;
                const height = 4 * (i - this.count / 2); // spread vertical

                // Helix 1
                if (i % 2 === 0) {
                    this.targetPositions[i3] = radius * Math.cos(t);
                    this.targetPositions[i3 + 1] = i * 0.2 - 300; // y spread
                    this.targetPositions[i3 + 2] = radius * Math.sin(t);
                } else {
                    // Helix 2 (offset)
                    this.targetPositions[i3] = radius * Math.cos(t + Math.PI);
                    this.targetPositions[i3 + 1] = i * 0.2 - 300;
                    this.targetPositions[i3 + 2] = radius * Math.sin(t + Math.PI);
                }

            } else { // Swarm / Chaos
                const scale = 800;
                // Perlin-ish logic simplified: just big sin waves based on position
                this.targetPositions[i3] = Math.sin(i * 0.01 + time) * scale * 0.5 + (Math.random() - 0.5) * 200;
                this.targetPositions[i3 + 1] = Math.cos(i * 0.02 + time) * scale * 0.3 + (Math.random() - 0.5) * 200;
                this.targetPositions[i3 + 2] = Math.sin(i * 0.03 + time) * scale * 0.5 + (Math.random() - 0.5) * 200;
            }
        }
    }

    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Rotate entire system slowly
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.z += 0.0005;
        }

        // Morphing Logic
        this.modeTimer += delta;
        if (this.modeTimer > 6.0) { // Change shape every 6 seconds
            this.updateTargets();
            this.modeTimer = 0;
        }

        // Smoothly move particles towards targets
        const positions = this.particles.geometry.attributes.position.array;
        const speed = 2.5 * delta; // Movement speed

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            // Basic lerp towards target
            positions[i3] += (this.targetPositions[i3] - positions[i3]) * speed;
            positions[i3 + 1] += (this.targetPositions[i3 + 1] - positions[i3 + 1]) * speed;
            positions[i3 + 2] += (this.targetPositions[i3 + 2] - positions[i3 + 2]) * speed;

            // Add some "nervous" energy / AI-thinking wobble
            positions[i3] += (Math.random() - 0.5) * 0.5;
            positions[i3 + 1] += (Math.random() - 0.5) * 0.5;
            positions[i3 + 2] += (Math.random() - 0.5) * 0.5;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }
}

// Init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to ensure Three.js is loaded if it's from CDN
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            new AISuperEntity('hero-animation-container');
        } else {
            console.error("Three.js not loaded");
        }
    }, 100);
});
