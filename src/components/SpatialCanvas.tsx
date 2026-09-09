import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface SpatialCanvasProps {
  onScrollProgress?: (progress: number) => void;
  lightAngle?: number;
  darkMode?: boolean;
  bgOpacity?: number;
  paused?: boolean;
  onReady?: () => void;
}

// ─────────────────────────────────────────────────────────────
// 天空（背景）Shader：星雲 + 重力透鏡 + 光子環 + 黑洞陰影
// ─────────────────────────────────────────────────────────────
const SKY_VERT = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SKY_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uCamPos;
uniform vec3 uSkyBase;
uniform float uNebulaI;
varying vec3 vWorldPos;

vec3 nebula(vec3 rd) {
  float t1 = 0.5 + 0.5 * sin(rd.y * 2.0 + rd.x * 1.3);
  float t2 = 0.5 + 0.5 * sin(rd.z * 3.0 - rd.x * 2.0 + 1.7);
  float t3 = 0.5 + 0.5 * sin(rd.y * 4.0 + rd.z * 3.0 + 3.1);
  vec3 base = uSkyBase;
  vec3 tint = (vec3(0.06, 0.10, 0.20) * t1 + vec3(0.14, 0.06, 0.20) * t2 + vec3(0.03, 0.12, 0.20) * t3) * uNebulaI;
  return base + tint;
}

void main() {
  vec3 rd = normalize(vWorldPos - uCamPos);
  vec3 bhDir = normalize(-uCamPos); // 黑洞在原點
  float cosA = clamp(dot(rd, bhDir), -1.0, 1.0);
  float ang = acos(cosA);
  float d = length(uCamPos);
  float b = d * sin(ang);      // 撞擊參數（近似）
  float bCrit = 2.6;           // 臨界撞擊參數（光子環）

  vec3 col = nebula(rd);
  // 重力透鏡：靠近黑洞的背景光被彎曲、增亮
  float warp = smoothstep(bCrit * 3.0, bCrit, b);
  float alpha = 2.0 / max(b, 0.1);
  vec3 bent = normalize(rd + bhDir * alpha * 0.4 * (1.0 - warp));
  col = mix(nebula(bent) * 1.5, col, warp);

  // 光子環（白熱）
  float ring = exp(-pow((b - bCrit) * 3.5, 2.0));
  col += vec3(1.0, 0.85, 0.65) * ring * 1.4;

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─────────────────────────────────────────────────────────────
// 吸積盤 Shader：溫度漸層 + 差速旋轉 + 都卜勒增亮
// ─────────────────────────────────────────────────────────────
const DISK_VERT = /* glsl */ `
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const DISK_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
varying vec3 vPos;

void main() {
  float r = length(vPos.xy);
  float ang = atan(vPos.y, vPos.x);
  float swirl = ang + uTime * (0.9 / (0.18 + r));
  float s1 = 0.5 + 0.5 * sin(swirl * 18.0 + r * 30.0);
  float s2 = 0.5 + 0.5 * sin(swirl * 7.0 - r * 12.0 + 1.7);
  float grain = 0.55 + 0.5 * s1 * s2;

  vec3 hot = vec3(1.0, 0.82, 0.5);
  vec3 warm = vec3(1.0, 0.55, 0.16);
  vec3 cool = vec3(0.45, 0.08, 0.02);

  float t = 1.0 - smoothstep(1.5, 4.5, r); // 1 內圈 → 0 外圈
  vec3 col = mix(cool, warm, smoothstep(0.1, 0.55, t));
  col = mix(col, hot, smoothstep(0.7, 1.0, t));
  col *= grain;
  col *= (0.55 + 0.7 * smoothstep(-5.0, 5.0, vPos.x)); // 都卜勒增亮

  float fade = (1.0 - smoothstep(3.8, 5.0, r)) * smoothstep(0.0, 0.4, r);
  gl_FragColor = vec4(col, fade);
}
`;

function makePlanetTexture(kind: 'gas' | 'rock' | 'ice'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  if (kind === 'gas') {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#7a4f2e');
    g.addColorStop(0.2, '#c9a06a');
    g.addColorStop(0.4, '#8a5a3a');
    g.addColorStop(0.6, '#d9b48a');
    g.addColorStop(0.8, '#6a4a30');
    g.addColorStop(1, '#a8825a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 50; i++) {
      const y = Math.random() * 256;
      ctx.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.1})`;
      ctx.fillRect(0, y, 256, 2 + Math.random() * 7);
    }
  } else if (kind === 'rock') {
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8000; i++) {
      const v = (60 + Math.random() * 90) | 0;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 12, 0, 6.283);
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.fill();
    }
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#b8d8f0');
    g.addColorStop(0.5, '#e8f4fc');
    g.addColorStop(1, '#9cc4e0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  onScrollProgress,
  darkMode = false,
  bgOpacity = 1,
  paused = false,
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const dark = darkMode;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(dark ? 0x000001 : 0x020611);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(14, 2.5, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.error('[SpatialCanvas] WebGL unavailable, using static background:', err);
      onReady?.();
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = dark ? 0.7 : 1.0;
    container.appendChild(renderer.domElement);

    // 環境光（行星反射用）
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    pmrem.dispose();

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), dark ? 0.38 : 0.32, 0.6, dark ? 0.78 : 0.85));
    composer.addPass(new OutputPass());

    // 主光（黑洞背光）
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(8, 6, 4);
    scene.add(keyLight);
    const ambientLight = new THREE.AmbientLight(dark ? 0x334455 : 0x8899aa, dark ? 0.5 : 1.0);
    scene.add(ambientLight);

    // ── 天空球（星雲 + 透鏡） ──
    const skyBase = dark ? new THREE.Color(0.0015, 0.003, 0.006) : new THREE.Color(0.01, 0.02, 0.04);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      uniforms: {
        uCamPos: { value: camera.position.clone() },
        uSkyBase: { value: skyBase },
        uNebulaI: { value: dark ? 0.06 : 0.3 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 48, 32), skyMat);
    sky.renderOrder = -100;
    sky.frustumCulled = false;
    scene.add(sky);

    // ── 黑洞 ──
    const blackhole = new THREE.Group();
    scene.add(blackhole);

    const horizon = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    blackhole.add(horizon);

    const diskMat = new THREE.ShaderMaterial({
      vertexShader: DISK_VERT,
      fragmentShader: DISK_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const diskHolder = new THREE.Group();
    diskHolder.rotation.x = -Math.PI / 2; // 平放（水平）
    const accretionDisk = new THREE.Mesh(new THREE.RingGeometry(1.55, 5.0, 160, 1), diskMat);
    diskHolder.add(accretionDisk);
    blackhole.add(diskHolder);

    const photonRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.02, 16, 180),
      new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending })
    );
    photonRing.rotation.x = -Math.PI / 2; // 平放
    blackhole.add(photonRing);

    // ── 行星 ──
    const planets: Array<{ mesh: THREE.Mesh; rot: number; orbit: number; r: number; y: number }> = [];
    const addPlanet = (radius: number, kind: 'gas' | 'rock' | 'ice', orbit: number, r: number, y: number, scale: number) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 48, 48),
        new THREE.MeshStandardMaterial({ map: makePlanetTexture(kind), roughness: 0.85, metalness: 0.05 })
      );
      m.position.set(Math.cos(orbit) * r, y, Math.sin(orbit) * r);
      m.scale.setScalar(scale);
      scene.add(m);
      planets.push({ mesh: m, rot: 0.01 + Math.random() * 0.02, orbit, r, y });
      return m;
    };
    addPlanet(1.3, 'gas', 0.7, 10, 1.2, 1);
    addPlanet(0.55, 'rock', 2.0, 7, -0.6, 1);
    addPlanet(0.4, 'ice', 3.1, 5.5, 1.6, 1);

    // ── UFO ──
    const ufo = new THREE.Group();
    const ufoBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 0.6, 0.42, 32),
      new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.85, roughness: 0.3 })
    );
    ufo.add(ufoBody);
    const ufoDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 16),
      new THREE.MeshStandardMaterial({ color: 0x66ccff, emissive: 0x66ccff, emissiveIntensity: 0.7, roughness: 0.2, metalness: 0.1 })
    );
    ufoDome.position.y = 0.32;
    ufoDome.scale.set(1, 0.62, 1);
    ufo.add(ufoDome);
    const ufoLights = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.06, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0xffaa44 })
    );
    ufoLights.rotation.x = Math.PI / 2;
    ufoLights.position.y = -0.12;
    ufo.add(ufoLights);
    ufo.position.set(Math.cos(2.6) * 8, 0.6, Math.sin(2.6) * 8);
    scene.add(ufo);

    // ── 小行星帶 ──
    const asteroidGroup = new THREE.Group();
    const rockGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.9, metalness: 0.1 });
    for (let i = 0; i < 140; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 4.4 + Math.random() * 1.4;
      const m = new THREE.Mesh(rockGeo, rockMat);
      m.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.5, Math.sin(a) * r);
      m.scale.setScalar(0.4 + Math.random() * 1.7);
      asteroidGroup.add(m);
    }
    scene.add(asteroidGroup);

    // ── 星野（點） ──
    const starCount = 700;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(90);
      starPos[i] = v.x;
      starPos[i + 1] = v.y;
      starPos[i + 2] = v.z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.14,
      transparent: true,
      opacity: dark ? 0.45 : 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── 流星 ──
    const comets: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3 }> = [];
    for (let i = 0; i < 5; i++) {
      const cm = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      cm.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, 20 + Math.random() * 15);
      scene.add(cm);
      comets.push({ mesh: cm, vel: new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, -0.12 - Math.random() * 0.1) });
    }

    // ── 可互動物件（hover 放大） ──
    const interactive: Array<{ mesh: THREE.Object3D; baseScale: number }> = [];
    [horizon, accretionDisk, photonRing, ufoBody, ufoDome, ufoLights, ...planets.map((p) => p.mesh)].forEach((m) => {
      interactive.push({ mesh: m, baseScale: m.scale.x });
    });
    const raycaster = new THREE.Raycaster();
    let hovered: THREE.Object3D | null = null;

    // ── 點擊衝擊波（不可見球上的漣漪） ──
    const ripples: Array<{ mesh: THREE.Mesh; life: number }> = [];
    const hitSphere = new THREE.Mesh(new THREE.SphereGeometry(26, 32, 32), new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(hitSphere);
    const spawnRipple = (point: THREE.Vector3) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.28, 40),
        new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false })
      );
      ring.position.copy(point);
      ring.lookAt(0, 0, 0);
      scene.add(ring);
      ripples.push({ mesh: ring, life: 1 });
    };

    // ── 互動 ──
    let targetRotX = 0;
    let targetRotY = 0;
    const pointerNdc = new THREE.Vector2(0, 0);
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const deviceRot = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = nx * 0.5;
      targetRotX = ny * 0.4;
      pointerNdc.set(nx, ny);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactive.map((i) => i.mesh), true);
      hovered = (hits[0]?.object as THREE.Object3D) ?? null;
    };
    const handleClick = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObject(hitSphere, false);
      if (hits.length > 0) spawnRipple(hits[0].point);
    };
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      deviceRot.y = Math.max(-1, Math.min(1, e.gamma / 45));
      deviceRot.x = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
    };
    const requestOrientationPermission = () => {
      const evt = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      evt.requestPermission?.().catch(() => {});
    };

    if (hasFinePointer) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('click', requestOrientationPermission, { once: true });
      window.addEventListener('touchstart', requestOrientationPermission, { once: true });
    }
    window.addEventListener('click', handleClick);

    // ── 滾動：房間進度 + 房內內容捲動（讓 3D 隨時跟著動）──
    let scrollProgress = 0;
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const roomProgress = total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 0;

      // 目前房間的內部捲動進度（房內內容多時，捲動也讓 3D 產生視差）
      let innerProgress = 0;
      document.querySelectorAll('[data-room-scroll]').forEach((node) => {
        const el = node as HTMLElement;
        const wrapper = el.parentElement?.parentElement;
        if (wrapper && wrapper.classList.contains('opacity-100')) {
          const max = el.scrollHeight - el.clientHeight;
          if (max > 0) innerProgress = Math.min(Math.max(el.scrollTop / max, 0), 1);
        }
      });

      scrollProgress = Math.min(Math.max(roomProgress + innerProgress * 0.1, 0), 1);
      onScrollProgress?.(roomProgress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    handleScroll();

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId: number;
    let readyFired = false;
    const tmpVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (pausedRef.current) return; // 暫停時（modal 開啟等）跳過渲染，省 GPU
      const elapsed = clock.getElapsedTime();
      const p = scrollProgress;

      if (!hasFinePointer) {
        targetRotY += (deviceRot.y * 0.6 - targetRotY) * 0.06;
        targetRotX += (deviceRot.x * 0.5 - targetRotX) * 0.06;
      }

      // 相機：繞黑洞螺旋前進（越滾越近，從上方俯視吸積盤）
      const orbit = p * Math.PI * 2.6 + targetRotY * 0.3;
      const radius = 16 - p * 8.5;
      const camY = 8 * (1 - p) + 1.5 - targetRotX * 1.4;
      tmpVec.set(Math.cos(orbit) * radius, camY, Math.sin(orbit) * radius);
      camera.position.lerp(tmpVec, 0.08);
      camera.lookAt(0, 0, 0);
      skyMat.uniforms.uCamPos.value.copy(camera.position);

      // 動畫
      diskMat.uniforms.uTime.value = elapsed;
      accretionDisk.rotation.z += 0.012;
      photonRing.rotation.z += 0.005;
      blackhole.rotation.y += 0.001;
      asteroidGroup.rotation.y += 0.004;
      ufo.rotation.y += 0.01;
      ufo.position.y = 0.6 + Math.sin(elapsed * 0.6) * 0.25;
      stars.rotation.y += 0.0005;

      planets.forEach((pl) => {
        pl.mesh.rotation.y += pl.rot;
        const a = pl.orbit + elapsed * 0.04;
        pl.mesh.position.set(Math.cos(a) * pl.r, pl.y, Math.sin(a) * pl.r);
      });

      comets.forEach((c) => {
        c.mesh.position.add(c.vel);
        if (c.mesh.position.z < -40) {
          c.mesh.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, 20 + Math.random() * 15);
        }
      });

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.life -= 0.025;
        if (r.life <= 0) {
          scene.remove(r.mesh);
          (r.mesh.material as THREE.MeshBasicMaterial).dispose();
          ripples.splice(i, 1);
          continue;
        }
        r.mesh.scale.setScalar(1 + (1 - r.life) * 9);
        (r.mesh.material as THREE.MeshBasicMaterial).opacity = r.life * 0.7;
      }

      interactive.forEach(({ mesh, baseScale }) => {
        const target = mesh === hovered ? baseScale * 1.1 : baseScale;
        const s = mesh.scale.x + (target - mesh.scale.x) * 0.12;
        mesh.scale.setScalar(s);
      });

      composer.render();

      if (!readyFired) {
        readyFired = true;
        onReady?.();
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (hasFinePointer) window.removeEventListener('mousemove', handleMouseMove);
      else window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [onScrollProgress, onReady, darkMode]);

  return (
    <div
      id="spatial-canvas-container"
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent transition-opacity duration-300"
      style={{ opacity: bgOpacity }}
    />
  );
};
