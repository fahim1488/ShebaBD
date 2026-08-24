import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── GLSL Shaders ─────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform vec2  uMouse;
  varying float vAlpha;
  varying float vDist;

  void main() {
    vec3 pos = position;

    // Organic sinusoidal drift
    pos.x += sin(uTime * 0.4 + aPhase)        * 0.6;
    pos.y += cos(uTime * 0.3 + aPhase * 1.3)  * 0.5;
    pos.z += sin(uTime * 0.25 + aPhase * 0.7) * 0.3;

    // Mouse gravity repulsion
    vec2 toMouse = uMouse - pos.xy;
    float mDist   = length(toMouse);
    float mForce  = smoothstep(8.0, 0.0, mDist) * 2.2;
    pos.xy       -= normalize(toMouse) * mForce;

    vec4 mvPos  = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float depth = 1.0 - clamp(-mvPos.z / 50.0, 0.0, 1.0);
    gl_PointSize = aSize * depth * (350.0 / -mvPos.z);

    vAlpha = 0.55 + 0.45 * sin(uTime * 0.8 + aPhase);
    vDist  = mDist;
  }
`;

const FRAG = /* glsl */`
  varying float vAlpha;
  varying float vDist;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float r    = length(uv);
    if (r > 0.5) discard;

    float core = 1.0 - smoothstep(0.0, 0.22, r);
    float glow = 1.0 - smoothstep(0.22, 0.5, r);

    float t     = clamp(1.0 - vDist / 9.0, 0.0, 1.0);
    vec3  color = mix(uColor1, uColor2, t);

    float alpha = (core * 0.95 + glow * 0.45) * vAlpha;
    gl_FragColor = vec4(color, alpha);
  }
`;

const LINE_VERT = /* glsl */`
  attribute float aAlpha;
  varying float   vAlpha;
  void main() {
    vAlpha      = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */`
  varying float vAlpha;
  uniform vec3  uColor;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * 0.38);
  }
`;

const RING_VERT = /* glsl */`
  uniform float uTime;
  uniform float uIndex;
  varying float vAlpha;
  void main() {
    float pulse = 0.82 + 0.18 * sin(uTime * 1.1 + uIndex * 1.8);
    vec3  pos   = position * pulse;
    vAlpha      = 0.18 + 0.12 * sin(uTime * 0.7 + uIndex * 2.3);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const RING_FRAG = /* glsl */`
  varying float vAlpha;
  uniform vec3  uColor;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRing(radius: number, segments: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ThreeBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 150);
    camera.position.set(0, 0, 28);

    // ── Particles (custom shader) ─────────────────────────────────────────────
    const COUNT = 110;
    const positions = new Float32Array(COUNT * 3);
    const phases    = new Float32Array(COUNT);
    const sizes     = new Float32Array(COUNT);
    const vels      = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 52;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 38;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      phases[i]            = Math.random() * Math.PI * 2;
      sizes[i]             = 3.5 + Math.random() * 5.5;
      vels[i * 3]          = (Math.random() - 0.5) * 0.012;
      vels[i * 3 + 1]      = (Math.random() - 0.5) * 0.012;
      vels[i * 3 + 2]      = (Math.random() - 0.5) * 0.008;
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    ptGeo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));
    ptGeo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    const ptMat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime:   { value: 0 },
        uMouse:  { value: new THREE.Vector2(-999, -999) },
        uColor1: { value: new THREE.Color('#E7A93B') },  // marigold
        uColor2: { value: new THREE.Color('#4DFFB0') },  // electric mint on hover
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const ptMesh = new THREE.Points(ptGeo, ptMat);
    scene.add(ptMesh);

    // ── Dynamic Lines (custom shader) ─────────────────────────────────────────
    const MAX_LINES  = COUNT * 8;
    const linePosArr = new Float32Array(MAX_LINES * 6);
    const lineAlpArr = new Float32Array(MAX_LINES * 2);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePosArr, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('aAlpha',   new THREE.BufferAttribute(lineAlpArr, 1).setUsage(THREE.DynamicDrawUsage));

    const lineMat = new THREE.ShaderMaterial({
      vertexShader:   LINE_VERT,
      fragmentShader: LINE_FRAG,
      uniforms: { uColor: { value: new THREE.Color('#4C8C6B') } },  // leaf green
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    // ── Floating Rings ────────────────────────────────────────────────────────
    const RING_CONFIGS = [
      { r: 9.5,  tilt: 0.28,  color: '#E7A93B', speed: 0.18  },
      { r: 14.0, tilt: -0.42, color: '#4C8C6B', speed: 0.11  },
      { r: 19.5, tilt: 0.62,  color: '#3E7A8C', speed: 0.07  },
      { r: 6.5,  tilt: 1.1,   color: '#D6472C', speed: 0.23  },
    ];

    const ringMeshes = RING_CONFIGS.map(({ r, tilt, color, speed }, idx) => {
      const geo = makeRing(r, 96);
      const mat = new THREE.ShaderMaterial({
        vertexShader:   RING_VERT,
        fragmentShader: RING_FRAG,
        uniforms: {
          uTime:  { value: 0 },
          uIndex: { value: idx },
          uColor: { value: new THREE.Color(color) },
        },
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      });
      const mesh = new THREE.Line(geo, mat);
      mesh.rotation.x = tilt;
      mesh.rotation.z = idx * 0.9;
      mesh.userData.rotSpeed = speed * (idx % 2 === 0 ? 1 : -1);
      return mesh;
    });
    ringMeshes.forEach(m => scene.add(m));

    // ── Ambient glow sphere ───────────────────────────────────────────────────
    const glowGeo = new THREE.SphereGeometry(4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xE7A93B,
      transparent: true,
      opacity: 0.025,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(-8, 4, -5);
    scene.add(glowMesh);

    const glowGeo2 = new THREE.SphereGeometry(5, 32, 32);
    const glowMat2 = new THREE.MeshBasicMaterial({
      color: 0x4C8C6B,
      transparent: true,
      opacity: 0.018,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh2 = new THREE.Mesh(glowGeo2, glowMat2);
    glowMesh2.position.set(10, -5, -8);
    scene.add(glowMesh2);

    // ── Mouse ─────────────────────────────────────────────────────────────────
    const rawMouse   = new THREE.Vector2(-999, -999);
    const smoothMouse = new THREE.Vector2(-999, -999);

    const onMouseMove = (e: MouseEvent) => {
      rawMouse.set(
        ((e.clientX / window.innerWidth)  * 2 - 1) * 25,
        ((e.clientY / window.innerHeight) * 2 - 1) * -18,
      );
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── Animation ─────────────────────────────────────────────────────────────
    const MAX_DIST   = 8.5;
    let   raf: number;
    let   t          = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      t  += 0.012;

      // Smooth mouse
      smoothMouse.lerp(rawMouse, 0.06);
      ptMat.uniforms.uTime.value  = t;
      ptMat.uniforms.uMouse.value = smoothMouse;

      // Drift particles
      const pos = ptGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        pos[ix]     += vels[ix];
        pos[ix + 1] += vels[ix + 1];
        pos[ix + 2] += vels[ix + 2];
        if (Math.abs(pos[ix])     > 28)  vels[ix]     *= -1;
        if (Math.abs(pos[ix + 1]) > 20)  vels[ix + 1] *= -1;
        if (Math.abs(pos[ix + 2]) > 12)  vels[ix + 2] *= -1;
      }
      ptGeo.attributes.position.needsUpdate = true;

      // Rebuild lines
      let lineCount = 0;
      for (let a = 0; a < COUNT && lineCount < MAX_LINES; a++) {
        const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
        for (let b = a + 1; b < COUNT && lineCount < MAX_LINES; b++) {
          const bx = pos[b * 3], by = pos[b * 3 + 1], bz = pos[b * 3 + 2];
          const d  = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
          if (d < MAX_DIST) {
            const base = lineCount * 6;
            linePosArr[base]   = ax; linePosArr[base+1] = ay; linePosArr[base+2] = az;
            linePosArr[base+3] = bx; linePosArr[base+4] = by; linePosArr[base+5] = bz;
            const alpha = (1 - d / MAX_DIST) * 0.7;
            lineAlpArr[lineCount * 2]     = alpha;
            lineAlpArr[lineCount * 2 + 1] = alpha;
            lineCount++;
          }
        }
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.aAlpha.needsUpdate   = true;
      lineGeo.setDrawRange(0, lineCount * 2);

      // Rotate rings
      ringMeshes.forEach((m, idx) => {
        m.rotation.y += RING_CONFIGS[idx].speed * 0.008;
        m.rotation.z += RING_CONFIGS[idx].speed * 0.004;
        (m.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      });

      // Breathe glows
      glowMesh.material.opacity  = 0.022 + 0.012 * Math.sin(t * 0.9);
      glowMesh2.material.opacity = 0.015 + 0.010 * Math.sin(t * 0.7 + 1.4);

      // Slow camera sway
      camera.position.x = Math.sin(t * 0.08) * 1.2;
      camera.position.y = Math.cos(t * 0.06) * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      [ptGeo, lineGeo, glowGeo, glowGeo2].forEach(g => g.dispose());
      [ptMat, lineMat, glowMat, glowMat2].forEach(m => m.dispose());
      ringMeshes.forEach(m => { m.geometry.dispose(); (m.material as THREE.ShaderMaterial).dispose(); });
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[1]" />;
}
