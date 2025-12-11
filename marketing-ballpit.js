import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ==========================================
// UTILS
// ==========================================
const { randFloat, randFloatSpread } = THREE.MathUtils;

// ==========================================
// PHYSICS ENGINE
// ==========================================
class Physics {
    constructor(config) {
        this.config = config;
        this.positionData = new Float32Array(3 * config.count).fill(0);
        this.velocityData = new Float32Array(3 * config.count).fill(0);
        this.sizeData = new Float32Array(config.count).fill(1);
        this.center = new THREE.Vector3();

        // Temp vectors for calculations
        this.v1 = new THREE.Vector3();
        this.v2 = new THREE.Vector3();
        this.v3 = new THREE.Vector3();
        this.v4 = new THREE.Vector3();
        this.v5 = new THREE.Vector3();
        this.v6 = new THREE.Vector3();
        this.v7 = new THREE.Vector3();
        this.v8 = new THREE.Vector3();
        this.v9 = new THREE.Vector3();
        this.v10 = new THREE.Vector3();

        this.initPositions();
        this.setSizes();
    }

    initPositions() {
        const { config, positionData } = this;
        // Center starts at 0,0,0
        // Randomize others
        for (let i = 1; i < config.count; i++) {
            const s = 3 * i;
            positionData[s] = randFloatSpread(2 * config.maxX);
            positionData[s + 1] = randFloatSpread(2 * config.maxY);
            positionData[s + 2] = randFloatSpread(2 * config.maxZ);
        }
    }

    setSizes() {
        const { config, sizeData } = this;
        sizeData[0] = config.size0;
        for (let i = 1; i < config.count; i++) {
            sizeData[i] = randFloat(config.minSize, config.maxSize);
        }
    }

    update(time) {
        const { config, center, positionData, sizeData, velocityData } = this;
        let startIndex = 0;

        // Mouse Drag Control Logic (Sphere 0)
        if (config.controlSphere0) {
            startIndex = 1;
            this.v1.fromArray(positionData, 0);
            this.v1.lerp(center, 0.1).toArray(positionData, 0);
            this.v4.set(0, 0, 0).toArray(velocityData, 0);
        }

        // Apply Forces (Gravity + Friction)
        for (let i = startIndex; i < config.count; i++) {
            const base = 3 * i;
            this.v2.fromArray(positionData, base);
            this.v5.fromArray(velocityData, base);

            // Gravity
            this.v5.y -= time.delta * config.gravity * sizeData[i];

            // Friction
            this.v5.multiplyScalar(config.friction);

            // Limit Velocity
            this.v5.clampLength(0, config.maxVelocity);

            // Apply Velocity
            this.v2.add(this.v5);

            this.v2.toArray(positionData, base);
            this.v5.toArray(velocityData, base);
        }

        // Collisions
        for (let i = startIndex; i < config.count; i++) {
            const base = 3 * i;
            this.v2.fromArray(positionData, base); // Pos
            this.v5.fromArray(velocityData, base); // Vel
            const radius = sizeData[i];

            // Sphere-Sphere Collision
            for (let j = i + 1; j < config.count; j++) {
                const otherBase = 3 * j;
                this.v3.fromArray(positionData, otherBase);
                this.v6.fromArray(velocityData, otherBase);
                const otherRadius = sizeData[j];

                this.v7.copy(this.v3).sub(this.v2); // Distance vector
                const dist = this.v7.length();
                const sumRadius = radius + otherRadius;

                if (dist < sumRadius) {
                    const overlap = sumRadius - dist;
                    this.v8.copy(this.v7).normalize().multiplyScalar(0.5 * overlap);

                    this.v9.copy(this.v8).multiplyScalar(Math.max(this.v5.length(), 1));
                    this.v10.copy(this.v8).multiplyScalar(Math.max(this.v6.length(), 1));

                    this.v2.sub(this.v8);
                    this.v5.sub(this.v9);

                    this.v2.toArray(positionData, base);
                    this.v5.toArray(velocityData, base);

                    this.v3.add(this.v8);
                    this.v6.add(this.v10);

                    this.v3.toArray(positionData, otherBase);
                    this.v6.toArray(velocityData, otherBase);
                }
            }

            // Sphere 0 (Cursor) Collision separate check
            if (config.controlSphere0) {
                this.v7.copy(this.v1).sub(this.v2);
                const dist = this.v7.length();
                const sumRadius0 = radius + sizeData[0];
                if (dist < sumRadius0) {
                    const diff = sumRadius0 - dist;
                    this.v8.copy(this.v7.normalize()).multiplyScalar(diff);
                    this.v9.copy(this.v8).multiplyScalar(Math.max(this.v5.length(), 2));
                    this.v2.sub(this.v8);
                    this.v5.sub(this.v9);
                }
            }

            // Wall Boundaries
            // X
            if (Math.abs(this.v2.x) + radius > config.maxX) {
                this.v2.x = Math.sign(this.v2.x) * (config.maxX - radius);
                this.v5.x = -this.v5.x * config.wallBounce;
            }

            // Y (Floor/Ceiling)
            if (config.gravity === 0) {
                if (Math.abs(this.v2.y) + radius > config.maxY) {
                    this.v2.y = Math.sign(this.v2.y) * (config.maxY - radius);
                    this.v5.y = -this.v5.y * config.wallBounce;
                }
            } else if (this.v2.y - radius < -config.maxY) {
                this.v2.y = -config.maxY + radius;
                this.v5.y = -this.v5.y * config.wallBounce;
            }

            // Z (Depth)
            const maxBoundary = Math.max(config.maxZ, config.maxSize);
            if (Math.abs(this.v2.z) + radius > maxBoundary) {
                this.v2.z = Math.sign(this.v2.z) * (config.maxZ - radius);
                this.v5.z = -this.v5.z * config.wallBounce;
            }

            this.v2.toArray(positionData, base);
            this.v5.toArray(velocityData, base);
        }
    }
}

// ==========================================
// CUSTOM MATERIAL (Thickness Shader)
// ==========================================
class BallpitMaterial extends THREE.MeshPhysicalMaterial {
    constructor(parameters) {
        super(parameters);
        this.uniforms = {
            thicknessDistortion: { value: 0.1 },
            thicknessAmbient: { value: 0 },
            thicknessAttenuation: { value: 0.1 },
            thicknessPower: { value: 2 },
            thicknessScale: { value: 10 }
        };
        this.defines.USE_UV = '';

        this.onBeforeCompile = shader => {
            Object.assign(shader.uniforms, this.uniforms);

            const fragmentDeclarations = `
                uniform float thicknessPower;
                uniform float thicknessScale;
                uniform float thicknessDistortion;
                uniform float thicknessAmbient;
                uniform float thicknessAttenuation;
            `;

            shader.fragmentShader = fragmentDeclarations + shader.fragmentShader;

            const scatteringFunc = `
                void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
                    vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
                    float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
                    #ifdef USE_COLOR
                        vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
                    #else
                        vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
                    #endif
                    reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
                }
                void main() {
            `;

            shader.fragmentShader = shader.fragmentShader.replace('void main() {', scatteringFunc);

            // Hook into lights fragment
            const lightsFragment = THREE.ShaderChunk.lights_fragment_begin.replaceAll(
                'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
                `
                RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
                RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
                `
            );

            shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsFragment);
        };
    }
}

// ==========================================
// INSTANCED MESH WRAPPER
// ==========================================
const dummyMatrix = new THREE.Object3D();

const DEFAULTS = {
    count: 200,
    colors: [0x000000, 0x111111, 0x222222], // Pure Black theme but shiny
    ambientColor: 0xffffff,
    ambientIntensity: 1,
    lightIntensity: 200,
    materialParams: {
        metalness: 0.6,
        roughness: 0.2, // Shinier for black glass look
        clearcoat: 1,
        clearcoatRoughness: 0.1
    },
    minSize: 0.5,
    maxSize: 1.2,
    size0: 1.5,
    gravity: 0.7, // As requested
    friction: 0.9, // Higher friction = less chaos
    wallBounce: 0.8,
    maxVelocity: 0.5,
    maxX: 12, // Wider for hero
    maxY: 8,
    maxZ: 5,
    controlSphere0: false,
    followCursor: true
};

class BallpitMeshes extends THREE.InstancedMesh {
    constructor(renderer, config = {}) {
        const settings = { ...DEFAULTS, ...config };

        // Environment map
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const roomEnvironment = new RoomEnvironment();
        const envMap = pmremGenerator.fromScene(roomEnvironment).texture;
        roomEnvironment.dispose();

        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new BallpitMaterial({ envMap, ...settings.materialParams });
        // Correct envMap rotation
        material.envMapRotation.x = -Math.PI / 2;

        super(geometry, material, settings.count);

        this.config = settings;
        this.physics = new Physics(settings);

        this.initLights();
        this.setColors(settings.colors);
    }

    initLights() {
        this.ambientLight = new THREE.AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
        this.add(this.ambientLight);

        // Moving light follows cursor sphere
        this.light = new THREE.PointLight(this.config.colors[0], this.config.lightIntensity);
        this.add(this.light);
    }

    setColors(colors) {
        if (!Array.isArray(colors) || colors.length === 0) return;

        const tempColor = new THREE.Color();
        const hexColors = colors.map(c => new THREE.Color(c));

        const getColorAt = (ratio) => {
            const scaled = Math.max(0, Math.min(1, ratio)) * (hexColors.length - 1);
            const idx = Math.floor(scaled);

            if (idx >= hexColors.length - 1) return hexColors[hexColors.length - 1].clone();

            const start = hexColors[idx];
            const end = hexColors[idx + 1];
            const alpha = scaled - idx;

            return tempColor.clone().copy(start).lerp(end, alpha);
        }

        for (let i = 0; i < this.count; i++) {
            const col = getColorAt(i / this.count);
            this.setColorAt(i, col);

            if (i === 0) {
                this.light.color.copy(col);
            }
        }
        this.instanceColor.needsUpdate = true;
    }

    update(time) {
        this.physics.update(time);

        for (let i = 0; i < this.count; i++) {
            dummyMatrix.position.fromArray(this.physics.positionData, 3 * i);

            // Cursor sphere visibility
            if (i === 0 && !this.config.followCursor) {
                dummyMatrix.scale.setScalar(0);
            } else {
                dummyMatrix.scale.setScalar(this.physics.sizeData[i]);
            }

            dummyMatrix.updateMatrix();
            this.setMatrixAt(i, dummyMatrix.matrix);

            if (i === 0) this.light.position.copy(dummyMatrix.position);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

// ==========================================
// SCENE SETUP & RENDER LOOP
// ==========================================
class BallpitManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Ballpit container not found');
            return;
        }

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.initThree();
        this.initInteraction();
        this.resize();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    initThree() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, 25);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';

        // Initialize Ballpit
        this.ballpit = new BallpitMeshes(this.renderer, {
            // Config overrides if needed
            colors: ['#38bdf8', '#818cf8', '#1e293b'], // Brand Gradient Colors
            count: 150
        });
        this.scene.add(this.ballpit);
    }

    initInteraction() {
        this.pointer = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.intersectPoint = new THREE.Vector3();

        const onMove = (clientX, clientY) => {
            const rect = this.container.getBoundingClientRect();
            // Normalized Device Coordinates
            this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera);
            this.raycaster.ray.intersectPlane(this.plane, this.intersectPoint);

            // Update physics center target to mouse pos
            this.ballpit.physics.center.copy(this.intersectPoint);
            this.ballpit.config.controlSphere0 = true;
        };

        this.container.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        this.container.addEventListener('mouseleave', () => {
            this.ballpit.config.controlSphere0 = false;
        });

        this.container.addEventListener('touchend', () => {
            this.ballpit.config.controlSphere0 = false;
        });
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);

        // Update physics boundaries based on view
        // Approximate view width at z=0 (depth 0)
        // This keeps balls somewhat within screen (simplified)
        const dist = this.camera.position.z;
        const vFov = (this.camera.fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
        const visibleWidth = visibleHeight * this.camera.aspect;

        this.ballpit.config.maxX = visibleWidth / 2;
        this.ballpit.config.maxY = visibleHeight / 2;
        // console.log("Bounds", visibleWidth, visibleHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = {
            delta: this.clock ? this.clock.getDelta() : 0.016
        };
        if (!this.clock) this.clock = new THREE.Clock(); // Init clock once

        this.ballpit.update(time);
        this.renderer.render(this.scene, this.camera);
    }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    // Only init if the container exists
    if (document.getElementById('ballpit-container')) {
        new BallpitManager('ballpit-container');
    }
});
