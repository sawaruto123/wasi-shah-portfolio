import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface SpatialCanvasProps {
  onScrollProgress?: (progress: number) => void;
  lightAngle?: number;
  darkMode?: boolean;
  onReady?: () => void;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  onScrollProgress,
  lightAngle = 135,
  darkMode = false,
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const backLightRef = useRef<THREE.DirectionalLight | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // ── 主題調色盤：夜間更黑更霓虹、日間更乾淨通透 ──────────────
    const dark = darkMode;
    const P = dark
      ? {
          bg: 0x020409,
          fog: 0x020409,
          gridCenter: 0x2e7cf6,
          gridGrid: 0x0f2038,
          ambient: 0x667799,
          ambientI: 0.28,
          key: 0x5599dd,
          keyI: 1.7,
          fill: 0xccb09a,
          fillI: 0.5,
          back: 0xcc4a8a,
          backI: 1.0,
          exposure: 1.1,
          bloomStrength: 0.4,
          bloomThreshold: 0.8,
          coreEmissive: 0x2e7cf6,
          coreEmissiveI: 1.0,
          ringBlue: 0x2e7cf6,
          ringOrange: 0xcc9a62,
          ringPink: 0xcc4a8a,
          particle: 0x5599cc,
          particleOpacity: 0.35,
          creatureOpacity: 0.35,
          cloudOpacity: 0.04,
          planetOpacity: 0.3,
          planetEmissive: 0x2e7cf6,
          planetEmissiveI: 0.5,
        }
      : {
          bg: 0xf6faff,
          fog: 0xeaf2fb,
          gridCenter: 0x2e7cf6,
          gridGrid: 0x8fb4e8,
          ambient: 0xffffff,
          ambientI: 0.6,
          key: 0xbfd9ff,
          keyI: 2.5,
          fill: 0xffdfc4,
          fillI: 0.9,
          back: 0xff9db2,
          backI: 1.5,
          exposure: 1.15,
          bloomStrength: 0.3,
          bloomThreshold: 1.0,
          coreEmissive: 0x2e7cf6,
          coreEmissiveI: 1.3,
          ringBlue: 0x1e5bc4,
          ringOrange: 0xff9a2e,
          ringPink: 0xff5ca8,
          particle: 0x2e7cf6,
          particleOpacity: 0.9,
          creatureOpacity: 0.75,
          cloudOpacity: 0.05,
          planetOpacity: 0.7,
          planetEmissive: 0x2e7cf6,
          planetEmissiveI: 0.6,
        };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(P.bg);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // HDR：色彩空間 + 電影色調映射
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = P.exposure;

    // HDR 環境光（讓材質有反射層次）
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 後處理：Bloom（霓虹柔光）+ 景深（DOF）
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new BokehPass(scene, camera, { focus: 6.0, aperture: 0.0001, maxblur: 0.01 }));
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(width, height), P.bloomStrength, 0.6, P.bloomThreshold)
    );
    composer.addPass(new OutputPass());

    // 三點打光：主光（冷藍）+ 補光（暖白）+ 背光（螢光粉），立體分離
    const ambientLight = new THREE.AmbientLight(P.ambient, P.ambientI);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(P.key, P.keyI);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(P.fill, P.fillI);
    fillLight.position.set(-5, 2, 6);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(P.back, P.backI);
    backLight.position.set(-6, -4, -5);
    scene.add(backLight);

    keyLightRef.current = keyLight;
    fillLightRef.current = fillLight;
    backLightRef.current = backLight;

    // OZ 網格地面（霓虹底網）
    const gridHelper = new THREE.GridHelper(160, 80, P.gridCenter, P.gridGrid);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    // 前景柔焦球（Z 分層：靠近鏡頭，強化視差）
    const fgPos: [number, number, number][] = [[-7, 5, 5], [8, -5, 4], [-9, -6, 3], [9, 6, 2]];
    fgPos.forEach(([x, y, z], i) => {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(1.5 + i * 0.5, 32, 32),
        new THREE.MeshBasicMaterial({ color: P.ringBlue, transparent: true, opacity: 0.05, depthWrite: false })
      );
      s.position.set(x, y, z);
      scene.add(s);
    });

    // --- 角落彩蛋（世界模式探索時的小驚喜）---
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffb800 })
    );
    sun.position.set(11, 7, -52);
    scene.add(sun);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xff5ca8, roughness: 0.35, metalness: 0.3, emissive: 0xff5ca8, emissiveIntensity: 0.5 })
    );
    planet.position.set(-11, -1.5, -6);
    scene.add(planet);
    const planetRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.03, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0xd6ff33, roughness: 0.35, metalness: 0.3, emissive: 0xd6ff33, emissiveIntensity: 0.7 })
    );
    planetRing.rotation.x = Math.PI / 2.6;
    planet.add(planetRing);

    // --- 數位生物（小抽象幾何，漂流） ---
    const creatureGeos = [
      new THREE.TetrahedronGeometry(0.18),
      new THREE.OctahedronGeometry(0.2),
      new THREE.TorusGeometry(0.14, 0.05, 8, 24),
      new THREE.IcosahedronGeometry(0.15, 0),
      new THREE.ConeGeometry(0.16, 0.28, 4),
      new THREE.DodecahedronGeometry(0.15, 0),
    ];
    const creatureColors = [0x6cc8ff, 0xffb15e, 0xff9db2, 0x6cc8ff, 0xffd166, 0xff9db2];
    const creatures: { mesh: THREE.Mesh; baseY: number; phase: number; rot: number }[] = [];
    creatureGeos.forEach((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: creatureColors[i],
        flatShading: true,
        transparent: true,
        opacity: P.creatureOpacity,
        roughness: 0.4,
        metalness: 0.15,
        emissive: creatureColors[i],
        emissiveIntensity: 0.35,
      });
      const m = new THREE.Mesh(geo, mat);
      const baseY = 1.2 + (i % 3) * 2.2;
      m.position.set((i % 2 === 0 ? -1 : 1) * (5 + (i % 3) * 1.5), baseY, -8 - i * 10);
      scene.add(m);
      creatures.push({ mesh: m, baseY, phase: i * 1.1, rot: 0.3 + i * 0.15 });
    });

    // --- 雲朵（柔白扁平球體，高空漂移） ---
    const clouds: { mesh: THREE.Mesh; speed: number; x: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(2.6 + (i % 3) * 1.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: P.cloudOpacity, roughness: 1, metalness: 0 })
      );
      cloud.scale.set(1, 0.42, 0.8);
      cloud.position.set(-8 + i * 4.5, 9.5 + (i % 2) * 2.5, -5 - i * 12);
      scene.add(cloud);
      clouds.push({ mesh: cloud, speed: 0.03 + i * 0.02, x: cloud.position.x });
    }

    // Master Spatial Corridor Group
    const corridorGroup = new THREE.Group();
    scene.add(corridorGroup);

    // --- ROOM 1: HERO / CORE NEXUS (Z = 0) ---
    const room1Group = new THREE.Group();
    room1Group.position.set(0, 0, 0);
    corridorGroup.add(room1Group);

    // OZ 網際網路行星（半透明 + 節點連線星座）
    const ozPlanet = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x6cc8ff, transparent: true, opacity: P.planetOpacity, roughness: 0.25, metalness: 0.15, emissive: P.planetEmissive, emissiveIntensity: P.planetEmissiveI })
    );
    room1Group.add(ozPlanet);

    const nodeGroup = new THREE.Group();
    const nodeCount = 24;
    const nodePoints: THREE.Vector3[] = [];
    const nodeDots: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.72;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffb15e }));
      dot.position.set(x, y, z);
      nodeGroup.add(dot);
      nodeDots.push(dot);
      nodePoints.push(new THREE.Vector3(x, y, z));
    }
    const lineMat = new THREE.LineBasicMaterial({ color: P.ringBlue, transparent: true, opacity: 0.75 });
    for (let i = 0; i < nodePoints.length; i++) {
      for (let j = i + 1; j < nodePoints.length; j++) {
        if (nodePoints[i].distanceTo(nodePoints[j]) < 1.05) {
          const geo = new THREE.BufferGeometry().setFromPoints([nodePoints[i], nodePoints[j]]);
          nodeGroup.add(new THREE.Line(geo, lineMat));
        }
      }
    }
    room1Group.add(nodeGroup);

    // Inner Luminous Core
    const innerGeo = new THREE.OctahedronGeometry(1.3, 0);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x0a0a0c,
      emissive: P.coreEmissive,
      specular: 0xccff00,
      shininess: 100,
      transparent: true,
      opacity: 0.95,
      emissiveIntensity: P.coreEmissiveI,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    room1Group.add(innerMesh);

    // Dual Kinetic Gyro Rings
    const ringGeo1 = new THREE.TorusGeometry(3.0, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: P.ringBlue });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    room1Group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.3, 0.032, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: P.ringOrange });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    room1Group.add(ring2);

    // 夏日大作戰（OZ）風格的暖色環
    const ringGeo3 = new THREE.TorusGeometry(3.6, 0.028, 16, 100);
    const ringMat3 = new THREE.MeshBasicMaterial({ color: P.ringPink });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.z = Math.PI / 2.4;
    room1Group.add(ring3);

    // --- ROOM 2: DISCIPLINE & ABOUT STUDIO (Z = -14, X = -3) ---
    const room2Group = new THREE.Group();
    room2Group.position.set(-3, 0, -14);
    corridorGroup.add(room2Group);

    const monolithGeo = new THREE.BoxGeometry(0.8, 3.2, 0.8);
    const monolithMat = new THREE.MeshPhongMaterial({ color: P.ringBlue, wireframe: true, emissive: P.ringBlue, emissiveIntensity: 0.3 });
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(monolithGeo, monolithMat);
      m.position.set((i - 1.5) * 2.0, Math.sin(i) * 0.5, i % 2 === 0 ? 1 : -1);
      room2Group.add(m);
    }

    const discGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.08, 32);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.3, roughness: 0.45 });
    const studioDisc = new THREE.Mesh(discGeo, discMat);
    studioDisc.position.set(0, -2, 0);
    room2Group.add(studioDisc);

    // --- ROOM 3: SELECTED ARTIFACTS & WORK GALLERY (Z = -28, X = 3) ---
    const room3Group = new THREE.Group();
    room3Group.position.set(3, 0, -28);
    corridorGroup.add(room3Group);

    const portalGeo = new THREE.TorusGeometry(2.8, 0.06, 16, 64, Math.PI * 1.5);
    const portalMat = new THREE.MeshBasicMaterial({ color: P.ringBlue });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.rotation.z = Math.PI / 4;
    room3Group.add(portalMesh);

    const cubesGroup = new THREE.Group();
    const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cubeMats = [
      new THREE.MeshStandardMaterial({ color: P.ringBlue, wireframe: true, emissive: P.ringBlue, emissiveIntensity: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0xd6ff33, wireframe: true, emissive: 0xd6ff33, emissiveIntensity: 0.4 }),
    ];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rad = 3.8;
      const cube = new THREE.Mesh(cubeGeo, cubeMats[i % 2]);
      cube.position.set(Math.cos(angle) * rad, Math.sin(angle) * 1.5, Math.sin(angle) * rad);
      cube.rotation.x = i * 0.4;
      cube.rotation.y = i * 0.6;
      cubesGroup.add(cube);
    }
    room3Group.add(cubesGroup);

    // --- ROOM 4: CINEMATIC / FILM & PHOTOGRAPHY LOUNGE (Z = -42, X = -2) ---
    const room4Group = new THREE.Group();
    room4Group.position.set(-2, 0, -42);
    corridorGroup.add(room4Group);

    const frameGeo = new THREE.RingGeometry(2.2, 2.5, 32);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0c, side: THREE.DoubleSide });
    const cinemaFrame = new THREE.Mesh(frameGeo, frameMat);
    room4Group.add(cinemaFrame);

    const coneGeo = new THREE.ConeGeometry(3, 6, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: P.ringBlue,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.rotation.x = Math.PI / 2;
    room4Group.add(lightCone);

    // --- ROOM 5: DISPATCH & CONTACT TRANSMISSION (Z = -56, X = 0) ---
    const room5Group = new THREE.Group();
    room5Group.position.set(0, 0, -56);
    corridorGroup.add(room5Group);

    const beaconGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xffb15e, wireframe: true, emissive: 0xffb15e, emissiveIntensity: 0.9 });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    room5Group.add(beaconMesh);

    const waveGeo = new THREE.TorusGeometry(3.5, 0.03, 16, 100);
    const waveMat = new THREE.MeshBasicMaterial({ color: P.ringBlue });
    const waveRing = new THREE.Mesh(waveGeo, waveMat);
    room5Group.add(waveRing);

    // --- GLOBAL CONNECTING CORRIDOR PARTICLES ---
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 16;
      particlePos[i + 1] = (Math.random() - 0.5) * 13;
      particlePos[i + 2] = -Math.random() * 62;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: P.particle,
      size: 0.07,
      transparent: true,
      opacity: P.particleOpacity,
      blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interactivity（只在有滑鼠的裝置啟用）
    let targetRotX = 0;
    let targetRotY = 0;
    const pointerNdc = new THREE.Vector2(0, 0);
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = normX * 0.45;
      targetRotX = normY * 0.35;
      pointerNdc.set(normX, normY);
    };
    if (hasFinePointer) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Scroll-driven Navigation
    let scrollProgress = 0;
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        scrollProgress = Math.min(Math.max(window.scrollY / total, 0), 1);
      }
      onScrollProgress?.(scrollProgress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleResize = () => {
      if (!container) return;
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

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const targetCamZ = 8 - scrollProgress * 56;
      const targetCamX = Math.sin(scrollProgress * Math.PI * 3.0) * 2.8 + targetRotY * 1.2 + Math.sin(elapsed * 0.5) * 0.15;
      const targetCamY = Math.cos(scrollProgress * Math.PI * 2.0) * 0.6 - targetRotX * 0.8 + Math.cos(elapsed * 0.6) * 0.12;

      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;

      const targetFov = 45 + scrollProgress * 8 + Math.sin(elapsed * 0.4) * 0.5;
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();

      camera.lookAt(camera.position.x * 0.2, camera.position.y * 0.2, camera.position.z - 6.0);

      room1Group.rotation.y += 0.008;
      room1Group.rotation.x = Math.sin(elapsed * 0.8) * 0.15;
      ring1.rotation.z += 0.015;
      ring2.rotation.x += 0.012;
      const pulse = 1.0 + Math.sin(elapsed * 2.5) * 0.08;
      innerMesh.scale.set(pulse, pulse, pulse);

      ozPlanet.rotation.y += 0.002;
      nodeGroup.rotation.y += 0.003;
      nodeGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.1;

      camera.updateMatrixWorld();
      nodeGroup.updateMatrixWorld(true);
      const tempV = new THREE.Vector3();
      nodeDots.forEach((d, i) => {
        d.getWorldPosition(tempV);
        tempV.project(camera);
        const dx = tempV.x - pointerNdc.x;
        const dy = tempV.y - pointerNdc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const glow = Math.max(0, 1 - dist / 0.32);
        const pulse2 = 1 + Math.sin(elapsed * 2 + i * 0.9) * 0.4;
        d.scale.setScalar(pulse2 + glow * 2.4);
        (d.material as THREE.MeshBasicMaterial).color.set(glow > 0.03 ? 0xffffff : 0xffb15e);
      });

      creatures.forEach((c) => {
        c.mesh.rotation.y += c.rot * 0.008;
        c.mesh.rotation.x += c.rot * 0.005;
        c.mesh.position.y = c.baseY + Math.sin(elapsed * 0.7 + c.phase) * 0.5;
      });

      clouds.forEach((c) => {
        c.x += c.speed * 0.01;
        if (c.x > 15) c.x = -15;
        c.mesh.position.x = c.x;
      });

      room2Group.rotation.y = elapsed * 0.2;
      cubesGroup.rotation.y += 0.01;
      cubesGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.2;
      lightCone.rotation.z += 0.008;

      const bPulse = 1.0 + Math.sin(elapsed * 3.5) * 0.15;
      beaconMesh.scale.set(bPulse, bPulse, bPulse);
      waveRing.rotation.x = elapsed * 0.5;

      sun.rotation.y += 0.005;
      planet.rotation.y += 0.01;
      planetRing.rotation.z += 0.008;

      composer.render();

      if (!readyFired) {
        readyFired = true;
        onReady?.();
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (hasFinePointer) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onScrollProgress, onReady, darkMode]);

  // 光線方向：旋轉三點光源位置（key/fill/back 分開計算）
  useEffect(() => {
    const rad = (lightAngle * Math.PI) / 180;
    const dist = 11;
    keyLightRef.current?.position.set(Math.cos(rad) * dist, 6, Math.sin(rad) * dist);
    fillLightRef.current?.position.set(Math.cos(rad + (Math.PI * 2) / 3) * dist, 2, Math.sin(rad + (Math.PI * 2) / 3) * dist);
    backLightRef.current?.position.set(Math.cos(rad + Math.PI) * dist, -4, Math.sin(rad + Math.PI) * dist);
  }, [lightAngle]);

  return (
    <div
      id="spatial-canvas-container"
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent"
    />
  );
};
