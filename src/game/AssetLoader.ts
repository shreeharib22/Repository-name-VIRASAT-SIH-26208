import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import type { ArtifactDefinition } from '../types/game';

export async function loadArtifactModel(definition: ArtifactDefinition) {
  if (!definition.model || !definition.format) {
    throw new Error(`No model configured for ${definition.name}`);
  }

  const model = definition.format === 'glb'
    ? await loadGlb(definition.model)
    : await loadFbx(definition.model);

  normalizeModel(model, definition.scale ?? 1);
  return model;
}

function loadGlb(path: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(path, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

function loadFbx(path: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    new FBXLoader().load(path, (object) => resolve(object), undefined, reject);
  });
}

export function normalizeModel(model: THREE.Object3D, scaleMultiplier = 1) {
  model.updateMatrixWorld(true);

  const initialBox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  initialBox.getSize(size);

  if (size.length() === 0) return model;

  const maxDimension = Math.max(size.x, size.y, size.z);
  const desiredSize = 8 * scaleMultiplier;
  const scale = desiredSize / maxDimension;

  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);

  const finalBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  finalBox.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= finalBox.min.y;

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      material.needsUpdate = true;
      if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
        material.roughness = Math.min(0.95, Math.max(0.25, material.roughness || 0.8));
      }
    });
  });

  return model;
}
