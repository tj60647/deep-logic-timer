
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CELESTIAL_BODIES } from '../services/celestialData';

interface ThreeSceneProps {
  isRunning: boolean;
}

/** Animation time-step when the timer is actively running. */
const ANIMATION_SPEED_RUNNING = 0.004;
/** Animation time-step when the timer is idle / paused. */
const ANIMATION_SPEED_IDLE = 0.0008;
/** Scaling factor that maps real orbital periods (hours) to visible angular speed. */
const ORBITAL_SPEED_SCALE = 260;

export const ThreeScene: React.FC<ThreeSceneProps> = ({ isRunning }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(isRunning);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      10000,
    );

    // Camera rig: an Object3D that orbits the origin; the camera is a child
    const cameraRig = new THREE.Object3D();
    scene.add(cameraRig);
    camera.position.set(0, 120, 380);
    camera.lookAt(0, 0, 0);
    cameraRig.add(camera);

    // ── Lights ────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x112244, 2.5);
    scene.add(ambient);

    const sun = new THREE.PointLight(0x00ccff, 4, 1200);
    sun.position.set(0, 0, 0);
    scene.add(sun);

    // ── Starfield ─────────────────────────────────────────────────────────
    const starCount = 4000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 2000 + Math.random() * 3000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
      // Slight blue-white tint
      starColors[i * 3]     = 0.7 + Math.random() * 0.3;
      starColors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      starColors[i * 3 + 2] = 1.0;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.4, vertexColors: true, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Central core (space station / origin beacon) ───────────────────────
    const coreGeo = new THREE.IcosahedronGeometry(14, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x003344,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Glow sprite behind the core
    const glowTex = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0,255,255,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(canvas);
    })();
    const glowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }),
    );
    glowSprite.scale.set(120, 120, 1);
    scene.add(glowSprite);

    // ── Orbiting bodies (from real celestial data) ─────────────────────────
    const bodyPalette = [0x00e5ff, 0xb040ff, 0x40ffb0, 0xff6060, 0xffdd00, 0x4488ff];
    const orbitPivots: THREE.Object3D[] = [];
    const bodyMeshes: THREE.Mesh[] = [];

    CELESTIAL_BODIES.forEach((body, i) => {
      const orbitRadius = 60 + i * 55;
      const tiltAngle = (i * 37 + 15) * (Math.PI / 180);

      // Orbit ring (torus)
      const torusGeo = new THREE.TorusGeometry(orbitRadius, 0.35, 8, 120);
      const torusMat = new THREE.MeshBasicMaterial({
        color: bodyPalette[i % bodyPalette.length],
        transparent: true,
        opacity: 0.18,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = tiltAngle;
      scene.add(torus);

      // Pivot for orbital animation
      const pivot = new THREE.Object3D();
      pivot.rotation.x = tiltAngle;
      scene.add(pivot);
      orbitPivots.push(pivot);

      // Body sphere
      const radius = 4 + (CELESTIAL_BODIES.length - i) * 1.2;
      const bodyGeo = new THREE.SphereGeometry(radius, 16, 16);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyPalette[i % bodyPalette.length],
        emissive: new THREE.Color(bodyPalette[i % bodyPalette.length]).multiplyScalar(0.3),
        roughness: 0.7,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(bodyGeo, bodyMat);
      mesh.position.set(orbitRadius, 0, 0);
      pivot.add(mesh);
      bodyMeshes.push(mesh);

      // Small glow dot on the body
      const dotSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTex, color: bodyPalette[i % bodyPalette.length], transparent: true, depthWrite: false, opacity: 0.6 }),
      );
      dotSprite.scale.set(radius * 5, radius * 5, 1);
      mesh.add(dotSprite);
    });

    // ── Asteroid belt (particle ring) ─────────────────────────────────────
    const beltCount = 600;
    const beltPos = new Float32Array(beltCount * 3);
    for (let i = 0; i < beltCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 340 + (Math.random() - 0.5) * 60;
      beltPos[i * 3]     = Math.cos(angle) * r;
      beltPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      beltPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const beltGeo = new THREE.BufferGeometry();
    beltGeo.setAttribute('position', new THREE.BufferAttribute(beltPos, 3));
    scene.add(new THREE.Points(beltGeo, new THREE.PointsMaterial({ color: 0x888888, size: 1.2, sizeAttenuation: true })));

    // ── Animation loop ────────────────────────────────────────────────────
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = isRunningRef.current ? ANIMATION_SPEED_RUNNING : ANIMATION_SPEED_IDLE;
      t += dt;

      // Orbiting camera rig revolves slowly around Y axis
      cameraRig.rotation.y = t * 0.18;
      cameraRig.rotation.x = Math.sin(t * 0.07) * 0.12;

      // Rotate core icosahedron
      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.x += 0.003;

      // Each body orbits at a speed proportional to its real period (inverse)
      CELESTIAL_BODIES.forEach((body, i) => {
        // faster period → larger angular speed; scale so slowest still moves visibly
        const speed = (1 / body.orbitalPeriodHours) * ORBITAL_SPEED_SCALE;
        orbitPivots[i].rotation.y += speed * dt;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize handler ────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};
