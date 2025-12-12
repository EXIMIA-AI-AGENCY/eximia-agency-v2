import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ===============================================
// BALLPIT LOGIC (Adapted from query)
// ===============================================

const {
    Clock,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    SRGBColorSpace,
    MathUtils,
    Vector2,
    Vector3,
    MeshPhysicalMaterial,
    ShaderChunk,
    Color,
    Object3D,
    InstancedMesh,
    PMREMGenerator,
    SphereGeometry,
    AmbientLight,
    PointLight,
    ACESFilmicToneMapping,
    Raycaster,
    Plane
} = THREE;

// Render Manager
class RenderManager {
    #e; canvas; camera; scene; renderer; #t;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    render = this.#i;
    onBeforeRender = () => { }; onAfterRender = () => { }; onAfterResize = () => { };
    #s = false; #n = false; isDisposed = false; #o; #r; #a; #c = new Clock(); #h = { elapsed: 0, delta: 0 }; #l;

    constructor(e) {
        this.#e = { ...e };
        this.#m(); this.#d(); this.#p(); this.resize(); this.#g();
    }
    #m() { this.camera = new PerspectiveCamera(); this.cameraFov = this.camera.fov; }
    #d() { this.scene = new Scene(); }
    #p() {
        this.canvas = this.#e.canvas;
        const e = { canvas: this.canvas, powerPreference: 'high-performance', ...(this.#e.rendererOptions ?? {}) };
        this.renderer = new WebGLRenderer(e);
        this.renderer.outputColorSpace = SRGBColorSpace;
    }
    #g() {
        window.addEventListener('resize', this.#f.bind(this));
        this.#o = new IntersectionObserver(this.#u.bind(this), { root: null, rootMargin: '0px', threshold: 0 });
        this.#o.observe(this.canvas);
        document.addEventListener('visibilitychange', this.#v.bind(this));
    }
    #y() {
        window.removeEventListener('resize', this.#f.bind(this));
        this.#o?.disconnect();
        document.removeEventListener('visibilitychange', this.#v.bind(this));
    }
    #u(e) { this.#s = e[0].isIntersecting; this.#s ? this.#w() : this.#z(); }
    #v() { if (this.#s) document.hidden ? this.#z() : this.#w(); }
    #f() { if (this.#a) clearTimeout(this.#a); this.#a = setTimeout(this.resize.bind(this), 100); }

    resize() {
        const e = this.canvas.parentNode.offsetWidth;
        const t = this.canvas.parentNode.offsetHeight;
        this.size.width = e; this.size.height = t; this.size.ratio = e / t;
        this.#x(); this.#b();
        this.onAfterResize(this.size);
    }
    #x() {
        this.camera.aspect = this.size.width / this.size.height;
        if (this.camera.isPerspectiveCamera && this.cameraFov) this.camera.fov = this.cameraFov;
        this.camera.updateProjectionMatrix();
        this.updateWorldSize();
    }
    updateWorldSize() {
        const e = (this.camera.fov * Math.PI) / 180;
        this.size.wHeight = 2 * Math.tan(e / 2) * this.camera.position.length();
        this.size.wWidth = this.size.wHeight * this.camera.aspect;
    }
    #b() {
        this.renderer.setSize(this.size.width, this.size.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    #w() {
        if (this.#n) return;
        const animate = () => {
            this.#l = requestAnimationFrame(animate);
            this.#h.delta = this.#c.getDelta();
            this.#h.elapsed += this.#h.delta;
            this.onBeforeRender(this.#h);
            this.render();
            this.onAfterRender(this.#h);
        };
        this.#n = true; animate();
    }
    #z() { if (this.#n) { cancelAnimationFrame(this.#l); this.#n = false; } }
    #i() { this.renderer.render(this.scene, this.camera); }
    dispose() { this.#y(); this.#z(); this.renderer.dispose(); this.isDisposed = true; }
}

// Input Handler
const b = new Map(); const A = new Vector2(); let R = false;
function InputHandler(e) {
    const t = { position: new Vector2(), nPosition: new Vector2(), hover: false, touching: false, onEnter() { }, onMove() { }, onLeave() { }, ...e };
    if (!b.has(e.domElement)) {
        b.set(e.domElement, t);
        if (!R) {
            document.body.addEventListener('pointermove', M);
            document.body.addEventListener('pointerleave', L);
            R = true;
        }
    }
    t.dispose = () => {
        b.delete(e.domElement);
        if (b.size === 0) { document.body.removeEventListener('pointermove', M); document.body.removeEventListener('pointerleave', L); R = false; }
    };
    return t;
}
function M(e) { A.x = e.clientX; A.y = e.clientY; processInteraction(); }
function L() { for (const t of b.values()) { if (t.hover) { t.hover = false; t.onLeave(t); } } }
function processInteraction() {
    for (const [elem, t] of b) {
        const rect = elem.getBoundingClientRect();
        if (D(rect)) {
            P(t, rect);
            if (!t.hover) { t.hover = true; t.onEnter(t); }
            t.onMove(t);
        } else if (t.hover) { t.hover = false; t.onLeave(t); }
    }
}
function P(e, t) { e.position.x = A.x - t.left; e.position.y = A.y - t.top; e.nPosition.x = (e.position.x / t.width) * 2 - 1; e.nPosition.y = (-e.position.y / t.height) * 2 + 1; }
function D(e) { return A.x >= e.left && A.x <= e.left + e.width && A.y >= e.top && A.y <= e.top + e.height; }

// Physics Engine
const { randFloat: k, randFloatSpread: E } = MathUtils;
const F = new Vector3(), I = new Vector3(), O = new Vector3(), B = new Vector3(), N = new Vector3(), _ = new Vector3(), j = new Vector3(), H = new Vector3(), T = new Vector3();
class Physics {
    constructor(e) {
        this.config = e;
        this.positionData = new Float32Array(3 * e.count).fill(0);
        this.velocityData = new Float32Array(3 * e.count).fill(0);
        this.sizeData = new Float32Array(e.count).fill(1);
        this.center = new Vector3();
        this.#R(); this.setSizes();
    }
    #R() {
        for (let i = 1; i < this.config.count; i++) {
            this.positionData[3 * i] = E(2 * this.config.maxX);
            this.positionData[3 * i + 1] = E(2 * this.config.maxY);
            this.positionData[3 * i + 2] = E(2 * this.config.maxZ);
        }
    }
    setSizes() { this.sizeData[0] = this.config.size0; for (let i = 1; i < this.config.count; i++) this.sizeData[i] = k(this.config.minSize, this.config.maxSize); }
    update(e) {
        const n = this.sizeData;
        // Mouse Sphere Control
        if (this.config.controlSphere0) {
            F.fromArray(this.positionData, 0);
            F.lerp(this.center, 0.1).toArray(this.positionData, 0);
            this.velocityData[0] = 0; this.velocityData[1] = 0; this.velocityData[2] = 0;
        }
        // Physics Loop
        for (let i = this.config.controlSphere0 ? 1 : 0; i < this.config.count; i++) {
            const base = 3 * i;
            I.fromArray(this.positionData, base); B.fromArray(this.velocityData, base);
            B.y -= e.delta * this.config.gravity * n[i];
            B.multiplyScalar(this.config.friction);
            I.add(B);
            // Collisions
            const r = n[i];
            for (let j = i + 1; j < this.config.count; j++) {
                const ob = 3 * j;
                O.fromArray(this.positionData, ob);
                const dist = I.distanceTo(O);
                const sumR = r + n[j];
                if (dist < sumR) {
                    const overlap = sumR - dist;
                    _.copy(O).sub(I).normalize().multiplyScalar(0.5 * overlap);
                    I.sub(_); O.add(_);
                    // Simple elastic bounce approx
                    B.sub(_); // Dampen
                    I.toArray(this.positionData, base); O.toArray(this.positionData, ob);
                }
            }
            // Walls
            if (Math.abs(I.x) + r > this.config.maxX) { I.x = Math.sign(I.x) * (this.config.maxX - r); B.x *= -this.config.wallBounce; }
            if (Math.abs(I.y) + r > this.config.maxY) { I.y = Math.sign(I.y) * (this.config.maxY - r); B.y *= -this.config.wallBounce; }
            if (I.z + r > this.config.maxZ) { I.z = this.config.maxZ - r; B.z *= -this.config.wallBounce; }
            I.toArray(this.positionData, base);
            B.toArray(this.velocityData, base);
        }
    }
}

// Material
class BallMaterial extends MeshPhysicalMaterial {
    constructor(e) {
        super(e);
        this.onBeforeCompile = (shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                'void main() { gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); ' // Simplified for debug if needed, but keeping standard physical
            );
            // Kept simple for now to avoid shader errors, returning to standard MeshPhysical
        }
    }
}

// Main Class
class BallpitMesh extends InstancedMesh {
    constructor(renderer, config) {
        const geo = new SphereGeometry();
        const env = new PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture;
        const mat = new MeshPhysicalMaterial({
            envMap: env,
            metalness: 0.8,
            roughness: 0.1,
            clearcoat: 1.0,
            color: 0xffffff
        });

        // EXIMIA COLORS
        const colors = [new Color(0x6600ff), new Color(0x00ccff), new Color(0x111111)];

        super(geo, mat, config.count);

        this.config = config;
        this.physics = new Physics({ ...config, maxX: 10, maxY: 6, maxZ: 5 }); // Expanded bounds

        // Set Colors
        for (let i = 0; i < this.count; i++) {
            this.setColorAt(i, colors[i % colors.length]);
        }

        this.light = new PointLight(0xffffff, 500);
        this.add(this.light);
        this.add(new AmbientLight(0xffffff, 0.5));
    }

    update(delta) {
        this.physics.update({ delta: delta.delta });
        const dummy = new Object3D();
        for (let i = 0; i < this.count; i++) {
            dummy.position.fromArray(this.physics.positionData, 3 * i);
            dummy.scale.setScalar(this.physics.sizeData[i]);
            dummy.updateMatrix();
            this.setMatrixAt(i, dummy.matrix);
            // Follow cursor light
            if (i === 0) this.light.position.copy(dummy.position);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

function createScene(canvas, config) {
    const mgr = new RenderManager({ canvas: canvas, size: 'parent', rendererOptions: { alpha: true, antialias: true } });
    mgr.camera.position.z = 15;

    const ballpit = new BallpitMesh(mgr.renderer, config);
    mgr.scene.add(ballpit);

    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const target = new Vector3();

    const input = InputHandler({
        domElement: canvas,
        onMove: () => {
            raycaster.setFromCamera(input.nPosition, mgr.camera);
            raycaster.ray.intersectPlane(plane, target);
            ballpit.physics.center.copy(target);
            ballpit.physics.config.controlSphere0 = true;
        },
        onLeave: () => { ballpit.physics.config.controlSphere0 = false; }
    });

    mgr.onBeforeRender = (time) => {
        ballpit.update(time);
    };

    return { dispose: () => { input.dispose(); mgr.dispose(); } };
}

// React Component
const Ballpit = ({ className = '', count = 100 }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const instance = createScene(canvas, { count, size0: 1.5, minSize: 0.5, maxSize: 1.0, gravity: 0.7, friction: 0.8, wallBounce: 0.95 });
        return () => instance.dispose();
    }, [count]);

    return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

// Mount to DOM
const rootEl = document.getElementById('ballpit-react-root');
if (rootEl) {
    const root = createRoot(rootEl);
    root.render(<Ballpit count={200} followCursor={true} />);
}
