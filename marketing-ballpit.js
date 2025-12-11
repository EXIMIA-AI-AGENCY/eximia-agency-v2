import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ===============================================
// PORT OF KEVIN LEVRON BALLPIT (Vanilla JS Adapt)
// ===============================================

// Short aliases to match original code structure where possible for fidelity
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

// ===============================================
// CORE RENDERER MANAGER (Class x)
// ===============================================
class RenderManager {
    #e;
    canvas;
    camera;
    cameraMinAspect;
    cameraMaxAspect;
    cameraFov;
    maxPixelRatio;
    minPixelRatio;
    scene;
    renderer;
    #t;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    render = this.#i;
    onBeforeRender = () => { };
    onAfterRender = () => { };
    onAfterResize = () => { };
    #s = false; // intersecting
    #n = false; // animating
    isDisposed = false;
    #o; // observer
    #r; // resize observer
    #a; // resize timeout
    #c = new Clock();
    #h = { elapsed: 0, delta: 0 };
    #l; // raf id

    constructor(e) {
        this.#e = { ...e };
        this.#m();
        this.#d();
        this.#p();
        this.resize();
        this.#g();
    }
    #m() {
        this.camera = new PerspectiveCamera();
        this.cameraFov = this.camera.fov;
    }
    #d() {
        this.scene = new Scene();
    }
    #p() {
        if (this.#e.canvas) {
            this.canvas = this.#e.canvas;
        } else if (this.#e.id) {
            this.canvas = document.getElementById(this.#e.id);
        } else {
            console.error('Three: Missing canvas or id parameter');
        }
        this.canvas.style.display = 'block';
        const e = {
            canvas: this.canvas,
            powerPreference: 'high-performance',
            ...(this.#e.rendererOptions ?? {})
        };
        this.renderer = new WebGLRenderer(e);
        this.renderer.outputColorSpace = SRGBColorSpace;
    }
    #g() {
        if (!(this.#e.size instanceof Object)) {
            window.addEventListener('resize', this.#f.bind(this));
            if (this.#e.size === 'parent' && this.canvas.parentNode) {
                this.#r = new ResizeObserver(this.#f.bind(this));
                this.#r.observe(this.canvas.parentNode);
            }
        }
        // Intersection Observer for performance
        this.#o = new IntersectionObserver(this.#u.bind(this), {
            root: null,
            rootMargin: '0px',
            threshold: 0
        });
        this.#o.observe(this.canvas);
        document.addEventListener('visibilitychange', this.#v.bind(this));
    }
    #y() {
        window.removeEventListener('resize', this.#f.bind(this));
        this.#r?.disconnect();
        this.#o?.disconnect();
        document.removeEventListener('visibilitychange', this.#v.bind(this));
    }
    #u(e) {
        this.#s = e[0].isIntersecting;
        this.#s ? this.#w() : this.#z();
    }
    #v() {
        if (this.#s) {
            document.hidden ? this.#z() : this.#w();
        }
    }
    #f() {
        if (this.#a) clearTimeout(this.#a);
        this.#a = setTimeout(this.resize.bind(this), 100);
    }
    resize() {
        let e, t;
        if (this.#e.size instanceof Object) {
            e = this.#e.size.width;
            t = this.#e.size.height;
        } else if (this.#e.size === 'parent' && this.canvas.parentNode) {
            e = this.canvas.parentNode.offsetWidth;
            t = this.canvas.parentNode.offsetHeight;
        } else {
            e = window.innerWidth;
            t = window.innerHeight;
        }
        this.size.width = e;
        this.size.height = t;
        this.size.ratio = e / t;
        this.#x();
        this.#b();
        this.onAfterResize(this.size);
    }
    #x() {
        this.camera.aspect = this.size.width / this.size.height;
        if (this.camera.isPerspectiveCamera && this.cameraFov) {
            if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
                this.#A(this.cameraMinAspect);
            } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
                this.#A(this.cameraMaxAspect);
            } else {
                this.camera.fov = this.cameraFov;
            }
        }
        this.camera.updateProjectionMatrix();
        this.updateWorldSize();
    }
    #A(e) {
        const t = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / e);
        this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(t));
    }
    updateWorldSize() {
        if (this.camera.isPerspectiveCamera) {
            const e = (this.camera.fov * Math.PI) / 180;
            this.size.wHeight = 2 * Math.tan(e / 2) * this.camera.position.length();
            this.size.wWidth = this.size.wHeight * this.camera.aspect;
        } else if (this.camera.isOrthographicCamera) {
            this.size.wHeight = this.camera.top - this.camera.bottom;
            this.size.wWidth = this.camera.right - this.camera.left;
        }
    }
    #b() {
        this.renderer.setSize(this.size.width, this.size.height);
        this.#t?.setSize(this.size.width, this.size.height);
        let e = window.devicePixelRatio;
        if (this.maxPixelRatio && e > this.maxPixelRatio) {
            e = this.maxPixelRatio;
        } else if (this.minPixelRatio && e < this.minPixelRatio) {
            e = this.minPixelRatio;
        }
        this.renderer.setPixelRatio(e);
        this.size.pixelRatio = e;
    }
    get postprocessing() {
        return this.#t;
    }
    set postprocessing(e) {
        this.#t = e;
        this.render = e.render.bind(e);
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
        this.#n = true;
        // this.#c.start(); // Bug fix: Three.js Clock auto-starts
        animate();
    }
    #z() {
        if (this.#n) {
            cancelAnimationFrame(this.#l);
            this.#n = false;
            this.#c.stop();
        }
    }
    #i() {
        this.renderer.render(this.scene, this.camera);
    }
    clear() {
        this.scene.traverse(e => {
            if (e.isMesh && typeof e.material === 'object' && e.material !== null) {
                Object.keys(e.material).forEach(t => {
                    const i = e.material[t];
                    if (i !== null && typeof i === 'object' && typeof i.dispose === 'function') {
                        i.dispose();
                    }
                });
                e.material.dispose();
                e.geometry.dispose();
            }
        });
        this.scene.clear();
    }
    dispose() {
        this.#y();
        this.#z();
        this.clear();
        this.#t?.dispose();
        this.renderer.dispose();
        this.isDisposed = true;
    }
}

// ===============================================
// INPUT HANDLER (S)
// ===============================================
const b = new Map(),
    A = new Vector2();
let R = false; // Is Global Listener Active?

function InputHandler(e) {
    const t = {
        position: new Vector2(),
        nPosition: new Vector2(),
        hover: false,
        touching: false,
        onEnter() { },
        onMove() { },
        onClick() { },
        onLeave() { },
        ...e
    };
    (function (e, t) {
        if (!b.has(e)) {
            b.set(e, t);
            if (!R) {
                document.body.addEventListener('pointermove', M);
                document.body.addEventListener('pointerleave', L);
                document.body.addEventListener('click', C);
                // Note: 'passive: false' allows preventDefault
                document.body.addEventListener('touchstart', TouchStart, { passive: false });
                document.body.addEventListener('touchmove', TouchMove, { passive: false });
                document.body.addEventListener('touchend', TouchEnd, { passive: false });
                document.body.addEventListener('touchcancel', TouchEnd, { passive: false });
                R = true;
            }
        }
    })(e.domElement, t);

    t.dispose = () => {
        const el = e.domElement;
        b.delete(el);
        if (b.size === 0) {
            document.body.removeEventListener('pointermove', M);
            document.body.removeEventListener('pointerleave', L);
            document.body.removeEventListener('click', C);
            document.body.removeEventListener('touchstart', TouchStart);
            document.body.removeEventListener('touchmove', TouchMove);
            document.body.removeEventListener('touchend', TouchEnd);
            document.body.removeEventListener('touchcancel', TouchEnd);
            R = false;
        }
    };
    return t;
}

function M(e) {
    A.x = e.clientX;
    A.y = e.clientY;
    processInteraction();
}
function processInteraction() {
    for (const [elem, t] of b) {
        const i = elem.getBoundingClientRect();
        if (D(i)) {
            P(t, i);
            if (!t.hover) {
                t.hover = true;
                t.onEnter(t);
            }
            t.onMove(t);
        } else if (t.hover && !t.touching) {
            t.hover = false;
            t.onLeave(t);
        }
    }
}
function C(e) {
    A.x = e.clientX;
    A.y = e.clientY;
    for (const [elem, t] of b) {
        const i = elem.getBoundingClientRect();
        P(t, i);
        if (D(i)) t.onClick(t);
    }
}
function L() {
    for (const t of b.values()) {
        if (t.hover) {
            t.hover = false;
            t.onLeave(t);
        }
    }
}
function TouchStart(e) {
    if (e.touches.length > 0) {
        // e.preventDefault(); // Sometimes blocking scrolling is bad, but code had it
        A.x = e.touches[0].clientX;
        A.y = e.touches[0].clientY;
        for (const [elem, t] of b) {
            const rect = elem.getBoundingClientRect();
            if (D(rect)) {
                t.touching = true;
                P(t, rect);
                if (!t.hover) {
                    t.hover = true;
                    t.onEnter(t);
                }
                t.onMove(t);
            }
        }
    }
}
function TouchMove(e) {
    if (e.touches.length > 0) {
        // e.preventDefault();
        A.x = e.touches[0].clientX;
        A.y = e.touches[0].clientY;
        for (const [elem, t] of b) {
            const rect = elem.getBoundingClientRect();
            P(t, rect);
            if (D(rect)) {
                if (!t.hover) {
                    t.hover = true;
                    t.touching = true;
                    t.onEnter(t);
                }
                t.onMove(t);
            } else if (t.hover && t.touching) {
                t.onMove(t);
            }
        }
    }
}
function TouchEnd() {
    for (const [, t] of b) {
        if (t.touching) {
            t.touching = false;
            if (t.hover) {
                t.hover = false;
                t.onLeave(t);
            }
        }
    }
}
function P(e, t) {
    const { position: i, nPosition: s } = e;
    i.x = A.x - t.left;
    i.y = A.y - t.top;
    s.x = (i.x / t.width) * 2 - 1;
    s.y = (-i.y / t.height) * 2 + 1;
}
function D(e) {
    const { x: t, y: i } = A;
    const { left: s, top: n, width: o, height: r } = e;
    return t >= s && t <= s + o && i >= n && i <= n + r;
}

// ===============================================
// PHYSICS ENGINE (Class W)
// ===============================================
const { randFloat: k, randFloatSpread: E } = MathUtils;
const F = new Vector3();
const I = new Vector3();
const O = new Vector3();
const V = new Vector3();
const B = new Vector3();
const N = new Vector3();
const _ = new Vector3();
const j = new Vector3();
const H = new Vector3();
const T = new Vector3();

class Physics {
    constructor(e) {
        this.config = e;
        this.positionData = new Float32Array(3 * e.count).fill(0);
        this.velocityData = new Float32Array(3 * e.count).fill(0);
        this.sizeData = new Float32Array(e.count).fill(1);
        this.center = new Vector3();
        this.#R();
        this.setSizes();
    }
    #R() {
        const { config: e, positionData: t } = this;
        this.center.toArray(t, 0);
        for (let i = 1; i < e.count; i++) {
            const s = 3 * i;
            t[s] = E(2 * e.maxX);
            t[s + 1] = E(2 * e.maxY);
            t[s + 2] = E(2 * e.maxZ);
        }
    }
    setSizes() {
        const { config: e, sizeData: t } = this;
        t[0] = e.size0;
        for (let i = 1; i < e.count; i++) {
            t[i] = k(e.minSize, e.maxSize);
        }
    }
    update(e) {
        const { config: t, center: i, positionData: s, sizeData: n, velocityData: o } = this;
        let r = 0;
        if (t.controlSphere0) {
            r = 1;
            F.fromArray(s, 0);
            F.lerp(i, 0.1).toArray(s, 0);
            V.set(0, 0, 0).toArray(o, 0);
        }
        for (let idx = r; idx < t.count; idx++) {
            const base = 3 * idx;
            I.fromArray(s, base);
            B.fromArray(o, base);
            B.y -= e.delta * t.gravity * n[idx];
            B.multiplyScalar(t.friction);
            B.clampLength(0, t.maxVelocity);
            I.add(B);
            I.toArray(s, base);
            B.toArray(o, base);
        }
        for (let idx = r; idx < t.count; idx++) {
            const base = 3 * idx;
            I.fromArray(s, base);
            B.fromArray(o, base);
            const radius = n[idx];
            for (let jdx = idx + 1; jdx < t.count; jdx++) {
                const otherBase = 3 * jdx;
                O.fromArray(s, otherBase);
                N.fromArray(o, otherBase);
                const otherRadius = n[jdx];
                _.copy(O).sub(I);
                const dist = _.length();
                const sumRadius = radius + otherRadius;
                if (dist < sumRadius) {
                    const overlap = sumRadius - dist;
                    j.copy(_)
                        .normalize()
                        .multiplyScalar(0.5 * overlap);
                    H.copy(j).multiplyScalar(Math.max(B.length(), 1));
                    T.copy(j).multiplyScalar(Math.max(N.length(), 1));
                    I.sub(j);
                    B.sub(H);
                    I.toArray(s, base);
                    B.toArray(o, base);
                    O.add(j);
                    N.add(T);
                    O.toArray(s, otherBase);
                    N.toArray(o, otherBase);
                }
            }
            if (t.controlSphere0) {
                _.copy(F).sub(I);
                const dist = _.length();
                const sumRadius0 = radius + n[0];
                if (dist < sumRadius0) {
                    const diff = sumRadius0 - dist;
                    j.copy(_.normalize()).multiplyScalar(diff);
                    H.copy(j).multiplyScalar(Math.max(B.length(), 2));
                    I.sub(j);
                    B.sub(H);
                }
            }
            if (Math.abs(I.x) + radius > t.maxX) {
                I.x = Math.sign(I.x) * (t.maxX - radius);
                B.x = -B.x * t.wallBounce;
            }
            if (t.gravity === 0) {
                if (Math.abs(I.y) + radius > t.maxY) {
                    I.y = Math.sign(I.y) * (t.maxY - radius);
                    B.y = -B.y * t.wallBounce;
                }
            } else if (I.y - radius < -t.maxY) {
                I.y = -t.maxY + radius;
                B.y = -B.y * t.wallBounce;
            }
            const maxBoundary = Math.max(t.maxZ, t.maxSize);
            if (Math.abs(I.z) + radius > maxBoundary) {
                I.z = Math.sign(I.z) * (t.maxZ - radius);
                B.z = -B.z * t.wallBounce;
            }
            I.toArray(s, base);
            B.toArray(o, base);
        }
    }
}

// ===============================================
// CUSTOM SHADER MATERIAL (Class Y)
// ===============================================
class BallpitMaterial extends MeshPhysicalMaterial {
    constructor(e) {
        super(e);
        this.uniforms = {
            thicknessDistortion: { value: 0.1 },
            thicknessAmbient: { value: 0 },
            thicknessAttenuation: { value: 0.1 },
            thicknessPower: { value: 2 },
            thicknessScale: { value: 10 }
        };
        this.defines.USE_UV = '';
        this.onBeforeCompile = e => {
            Object.assign(e.uniforms, this.uniforms);
            e.fragmentShader =
                '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' +
                e.fragmentShader;
            e.fragmentShader = e.fragmentShader.replace(
                'void main() {',
                '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
            );
            const t = ShaderChunk.lights_fragment_begin.replaceAll(
                'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
                '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
            );
            e.fragmentShader = e.fragmentShader.replace('#include <lights_fragment_begin>', t);
            if (this.onBeforeCompile2) this.onBeforeCompile2(e);
        };
    }
}

// ===============================================
// CONFIG & INSTANCED MESH
// ===============================================
const DefaultConfig = {
    count: 200,
    colors: [0, 0, 0],
    ambientColor: 16777215,
    ambientIntensity: 1,
    lightIntensity: 200,
    materialParams: {
        metalness: 0.5,
        roughness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.15
    },
    minSize: 0.5,
    maxSize: 1,
    size0: 1,
    gravity: 0.5,
    friction: 0.9975,
    wallBounce: 0.95,
    maxVelocity: 0.15,
    maxX: 5,
    maxY: 5,
    maxZ: 2,
    controlSphere0: false,
    followCursor: true
};

const U = new Object3D();

class BallpitInstancedMesh extends InstancedMesh {
    constructor(e, t = {}) {
        // Override color defaults with Eximia Blue/Black theme
        const eximiaDefaults = {
            ...DefaultConfig,
            // Colors: Brand Blue #2563EB, Cyber #0EA5E9, Deep Black #0A0A0A
            colors: [0x2563EB, 0x0EA5E9, 0x050505],
            count: 200
        };
        const i = { ...eximiaDefaults, ...t };
        const s = new RoomEnvironment();
        const n = new PMREMGenerator(e, 0.04).fromScene(s).texture;
        const o = new SphereGeometry();
        const r = new BallpitMaterial({ envMap: n, ...i.materialParams });
        r.envMapRotation.x = -Math.PI / 2;
        super(o, r, i.count);
        this.config = i;
        this.physics = new Physics(i);
        this.#S();
        this.setColors(i.colors);
    }
    #S() {
        this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
        this.add(this.ambientLight);
        this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
        this.add(this.light);
    }
    setColors(e) {
        if (Array.isArray(e) && e.length > 1) {
            const t = (function (e) {
                let t, i;
                function setColors(e) {
                    t = e;
                    i = [];
                    t.forEach(col => {
                        i.push(new Color(col));
                    });
                }
                setColors(e);
                return {
                    setColors,
                    getColorAt: function (ratio, out = new Color()) {
                        const scaled = Math.max(0, Math.min(1, ratio)) * (t.length - 1);
                        const idx = Math.floor(scaled);
                        const start = i[idx];
                        if (idx >= t.length - 1) return start.clone();
                        const alpha = scaled - idx;
                        const end = i[idx + 1];
                        out.r = start.r + alpha * (end.r - start.r);
                        out.g = start.g + alpha * (end.g - start.g);
                        out.b = start.b + alpha * (end.b - start.b);
                        return out;
                    }
                };
            })(e);
            for (let idx = 0; idx < this.count; idx++) {
                this.setColorAt(idx, t.getColorAt(idx / this.count));
                if (idx === 0) {
                    this.light.color.copy(t.getColorAt(idx / this.count));
                }
            }
            this.instanceColor.needsUpdate = true;
        }
    }
    update(e) {
        this.physics.update(e);
        for (let idx = 0; idx < this.count; idx++) {
            U.position.fromArray(this.physics.positionData, 3 * idx);
            if (idx === 0 && this.config.followCursor === false) {
                U.scale.setScalar(0);
            } else {
                U.scale.setScalar(this.physics.sizeData[idx]);
            }
            U.updateMatrix();
            this.setMatrixAt(idx, U.matrix);
            if (idx === 0) this.light.position.copy(U.position);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

// ===============================================
// FACTORY FUNCTION & AUTO-INIT
// ===============================================

function createBallpit(canvas, t = {}) {
    const i = new RenderManager({
        canvas: canvas,
        size: 'parent',
        rendererOptions: { antialias: true, alpha: true }
    });
    let s;
    i.renderer.toneMapping = ACESFilmicToneMapping;
    i.camera.position.set(0, 0, 20);
    i.camera.lookAt(0, 0, 0);
    i.cameraMaxAspect = 1.5;
    i.resize();
    initialize(t);

    const n = new Raycaster();
    const o = new Plane(new Vector3(0, 0, 1), 0);
    const r = new Vector3();
    let c = false;

    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';

    const h = InputHandler({
        domElement: canvas,
        onMove() {
            n.setFromCamera(h.nPosition, i.camera);
            i.camera.getWorldDirection(o.normal);
            n.ray.intersectPlane(o, r);
            s.physics.center.copy(r);
            s.config.controlSphere0 = true;
        },
        onLeave() {
            s.config.controlSphere0 = false;
        }
    });
    function initialize(e) {
        if (s) {
            i.clear();
            i.scene.remove(s);
        }
        s = new BallpitInstancedMesh(i.renderer, e);
        i.scene.add(s);
    }
    i.onBeforeRender = e => {
        if (!c) s.update(e);
    };
    i.onAfterResize = e => {
        s.config.maxX = e.wWidth / 2;
        s.config.maxY = e.wHeight / 2;
    };
    return {
        three: i,
        get spheres() {
            return s;
        },
        setCount(e) {
            initialize({ ...s.config, count: e });
        },
        togglePause() {
            c = !c;
        },
        dispose() {
            h.dispose();
            i.dispose();
        }
    };
}

// Init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('ballpit-container');
    if (container) {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        // Init
        createBallpit(canvas, {
            count: 100,
            friction: 0.9,
            gravity: 0.5,
            colors: ['#2563EB', '#0EA5E9', '#000000'] // Custom colors
        });
    }
});
