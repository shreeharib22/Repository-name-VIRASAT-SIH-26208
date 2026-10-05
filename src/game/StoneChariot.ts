import * as THREE from 'three';
import { loadArtifactModel } from './AssetLoader';
import { artifacts } from '../data/gameData';

export async function loadStoneChariot(
  scene: THREE.Scene,
  position = new THREE.Vector3(0, 0, 0),
  scale = 1,
) {
  const model = await loadArtifactModel(artifacts[0]);
  model.scale.multiplyScalar(scale / 8);
  model.position.copy(position);
  model.rotation.y = Math.PI;
  scene.add(model);
  return model;
}
