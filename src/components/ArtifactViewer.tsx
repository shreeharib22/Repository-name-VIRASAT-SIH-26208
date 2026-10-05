import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ArtifactDefinition } from '../types/game';
import { loadArtifactModel } from '../game/AssetLoader';

export function ArtifactViewer({ artifact }: { artifact: ArtifactDefinition }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x110d09);
    scene.fog = new THREE.Fog(0x110d09, 8, 22);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 3, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffdfbd, 0x24170f, 2.4);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffd19b, 3.4);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    scene.add(key);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.2, 0.55, 48),
      new THREE.MeshStandardMaterial({ color: 0x4b3b2c, roughness: 0.92 }),
    );
    floor.position.y = -0.28;
    floor.receiveShadow = true;
    scene.add(floor);

    let model: THREE.Object3D | null = null;
    let raf = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let yaw = 0.35;
    let pitch = 0.28;
    let distance = 8;
    let disposed = false;

    const load = async () => {
      try {
        const loaded = await loadArtifactModel(artifact);
        if (disposed) {
          disposeObject(loaded);
          return;
        }
        model = loaded;
        scene.add(model);
      } catch (error) {
        console.error('Viewer model load failed:', error);
      }
    };
    void load();

    const down = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      yaw -= dx * 0.006;
      pitch = THREE.MathUtils.clamp(pitch - dy * 0.004, -0.2, 0.9);
    };
    const up = () => { dragging = false; };
    const wheel = (event: WheelEvent) => {
      distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.01, 3, 16);
    };
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', up);
    renderer.domElement.addEventListener('wheel', wheel, { passive: true });

    const resize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const target = new THREE.Vector3(0, 2, 0);
    const desired = new THREE.Vector3();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const horizontal = distance * Math.cos(pitch);
      desired.set(Math.sin(yaw) * horizontal, 2 + distance * Math.sin(pitch), Math.cos(yaw) * horizontal);
      camera.position.lerp(desired, 0.12);
      camera.lookAt(target);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointermove', move);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointercancel', up);
      renderer.domElement.removeEventListener('wheel', wheel);
      disposeObject(model);
      floor.geometry.dispose();
      floor.material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [artifact]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: 380, borderRadius: 18, overflow: 'hidden' }} />;
}

function disposeObject(root: THREE.Object3D | null) {
  if (!root) return;
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => m.dispose());
  });
}
