import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { loadArtifactModel } from './AssetLoader';
import type { ArtifactDefinition } from '../types/game';

/**
 * Shared WebXR experience for VIRASAT.
 *
 * Features:
 * - Desktop/WebXR shared Three.js scene
 * - AR hit-test placement
 * - VR controller placement
 * - Heritage artifact loading
 * - Hampi heritage video displayed on a floating 3D screen
 * - Safe TypeScript handling for browser-specific hit-test APIs
 */
export class XRExperience {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.Camera;
  private readonly xrGroup: THREE.Group;

  private readonly reticle: THREE.Mesh;

  // WebXR hit-test types vary across lib.dom versions, so keep the raw
  // browser objects behind a small, local type boundary.
  private hitTestSource: any = null;
  private viewerSpace: XRReferenceSpace | null = null;

  private selectedArtifact: ArtifactDefinition | null = null;
  private selectedModel: THREE.Object3D | null = null;

  private arButton: HTMLElement | null = null;
  private vrButton: HTMLElement | null = null;
  private vrController: THREE.Group | null = null;

  private readonly arVisibility = new Map<THREE.Object3D, boolean>();

  private heritageVideo: HTMLVideoElement | null = null;
  private heritageVideoTexture: THREE.VideoTexture | null = null;
  private heritageVideoGroup: THREE.Group | null = null;
  private heritageVideoReady = false;
  private heritageVideoFinished = false;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');

    this.xrGroup = new THREE.Group();
    this.xrGroup.name = 'XR-Gallery';
    scene.add(this.xrGroup);

    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0xd9ae62,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      }),
    );

    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.xrGroup.add(this.reticle);

    renderer.domElement.addEventListener(
      'pointerdown',
      this.onPointerDown,
    );

    renderer.xr.addEventListener(
      'sessionstart',
      this.onSessionStart,
    );

    renderer.xr.addEventListener(
      'sessionend',
      this.onSessionEnd,
    );
  }

  mountButtons(container: HTMLElement) {
    this.arButton = ARButton.createButton(this.renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: container },
    });

    this.arButton.textContent = 'ENTER AR';
    this.arButton.classList.add('xr-native-button');
    container.appendChild(this.arButton);

    this.vrButton = VRButton.createButton(this.renderer);
    this.vrButton.textContent = 'ENTER VR';
    this.vrButton.classList.add('xr-native-button');
    container.appendChild(this.vrButton);

    this.vrController = this.renderer.xr.getController(0);

    // Three.js' WebXR controller dispatcher uses its own EventDispatcher
    // typing. Keeping this small boundary as `any` avoids TS lib.dom version
    // differences around the "select" event while preserving runtime behavior.
    const controllerEvents = this.vrController as any;

   controllerEvents.addEventListener('select', () => {
  if (this.heritageVideoReady) {
    this.enableVideoAudio();
  }

  // AR: tap the screen to place the artifact on the detected surface.
  if (this.renderer.xr.isPresenting && this.renderer.xr.getSession()?.environmentBlendMode !== 'opaque') {
    if (!this.reticle.visible || !this.selectedModel) return;

    const position = new THREE.Vector3().setFromMatrixPosition(
      this.reticle.matrix,
    );

    this.selectedModel.position.copy(position);
    this.selectedModel.visible = true;

    if (this.heritageVideoGroup) {
      this.heritageVideoGroup.visible = true;
    }

    return;
  }

  // VR: controller select places the artifact in front of the user.
  if (!this.selectedModel) {
    void this.placeSelectedVR();
  }
});

    sceneAddControllerModel(this.vrController, this.scene);
  }

  async setArtifact(definition: ArtifactDefinition) {
    this.selectedArtifact = definition;

    if (this.selectedModel) {
      this.xrGroup.remove(this.selectedModel);
      disposeObject(this.selectedModel);
      this.selectedModel = null;
    }

    try {
      const model = await loadArtifactModel(definition);

      model.position.set(0, 0, -1.4);
      model.rotation.y = Math.PI;
      model.visible = true;

      this.selectedModel = model;
      this.xrGroup.add(model);
    } catch (error) {
      console.error('XR model load failed', error);
    }
  }

  /**
   * Creates the Hampi story video as a floating 3D panel in the XR scene.
   * Muted playback is attempted first for browser compatibility; the first
   * user interaction can enable sound.
   */
  async setHeritageVideo(
    src: string,
    title = 'THE STORY OF HAMPI',
    subtitle = 'VIRASAT · IMMERSIVE HERITAGE',
  ) {
    this.clearHeritageVideo();

    const video = document.createElement('video');
    video.src = src;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.controls = false;
    video.loop = false;

    this.heritageVideo = video;
    this.heritageVideoFinished = false;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    this.heritageVideoTexture = texture;

    const group = new THREE.Group();
    group.name = 'XR-Heritage-Story';
    group.visible = false;

    const panelWidth = 2.25;
    const panelHeight = 1.265;

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(panelWidth + 0.30, panelHeight + 0.30),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.36,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    shadow.position.z = -0.07;
    group.add(shadow);

    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(panelWidth + 0.14, panelHeight + 0.14),
      new THREE.MeshBasicMaterial({
        color: 0x120d08,
        transparent: true,
        opacity: 0.97,
        side: THREE.DoubleSide,
      }),
    );
    frame.position.z = -0.03;
    group.add(frame);

    const videoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(panelWidth, panelHeight),
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    videoMesh.position.z = 0.01;
    group.add(videoMesh);

    const border = new THREE.LineSegments(
      new THREE.EdgesGeometry(
        new THREE.BoxGeometry(
          panelWidth + 0.14,
          panelHeight + 0.14,
          0.025,
        ),
      ),
      new THREE.LineBasicMaterial({
        color: 0xd9ae62,
        transparent: true,
        opacity: 0.92,
      }),
    );
    border.position.z = 0.04;
    group.add(border);

    const accent = new THREE.LineSegments(
      new THREE.EdgesGeometry(
        new THREE.BoxGeometry(
          panelWidth + 0.27,
          panelHeight + 0.27,
          0.01,
        ),
      ),
      new THREE.LineBasicMaterial({
        color: 0x8e6530,
        transparent: true,
        opacity: 0.35,
      }),
    );
    accent.position.z = -0.01;
    group.add(accent);

    const labelTexture = createLabelTexture(title, subtitle);
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    label.scale.set(1.86, 0.30, 1);
    label.position.set(0, panelHeight / 2 + 0.25, 0.06);
    group.add(label);

    const footer = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createFooterTexture('TAP / SELECT · ENABLE SOUND'),
        transparent: true,
        depthWrite: false,
      }),
    );
    footer.scale.set(1.38, 0.18, 1);
    footer.position.set(0, -panelHeight / 2 - 0.18, 0.06);
    group.add(footer);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(
        panelWidth + 0.55,
        panelHeight + 0.50,
      ),
      new THREE.MeshBasicMaterial({
        color: 0xd19a42,
        transparent: true,
        opacity: 0.075,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    glow.position.z = -0.10;
    group.add(glow);

    group.position.set(0, 1.68, -2.85);

    this.heritageVideoGroup = group;
    this.xrGroup.add(group);

    video.addEventListener('canplay', () => {
      this.heritageVideoReady = true;
      void video.play().catch(() => undefined);
    });

    video.addEventListener('loadeddata', () => {
      this.heritageVideoReady = true;
    });

    video.addEventListener('ended', () => {
      this.heritageVideoFinished = true;
    });

    try {
      await video.play();
      this.heritageVideoReady = true;
    } catch {
      // User interaction will retry playback.
    }
  }

  clearHeritageVideo() {
    if (this.heritageVideo) {
      this.heritageVideo.pause();
      this.heritageVideo.removeAttribute('src');
      this.heritageVideo.load();
      this.heritageVideo = null;
    }

    this.heritageVideoTexture?.dispose();
    this.heritageVideoTexture = null;

    if (this.heritageVideoGroup) {
      this.xrGroup.remove(this.heritageVideoGroup);
      disposeObject(this.heritageVideoGroup);
      this.heritageVideoGroup = null;
    }

    this.heritageVideoReady = false;
    this.heritageVideoFinished = false;
  }

  update(frame: XRFrame | null) {
    if (!frame || !this.renderer.xr.isPresenting) return;

    const session = frame.session;
    const referenceSpace = this.renderer.xr.getReferenceSpace();

    if (!this.viewerSpace && session.visibilityState === 'visible') {
      void session
        .requestReferenceSpace('viewer')
        .then((space) => {
          this.viewerSpace = space;
        })
        .catch(() => undefined);
    }

    const sessionAny = session as any;

    // VR sessions generally use an opaque environment. In that case the
    // normal Three.js scene should remain visible.
    if (session.environmentBlendMode === 'opaque') {
      this.reticle.visible = false;
      this.updateVideoFacing();
      this.ensureHeritageVideoPlaying();
      return;
    }

    // AR hit-test support. Browser/WebXR typings differ between TS versions,
    // so access the optional API through a tiny runtime boundary.
    if (this.viewerSpace && !this.hitTestSource) {
      const requestHitTestSource =
        typeof sessionAny.requestHitTestSource === 'function'
          ? sessionAny.requestHitTestSource.bind(sessionAny)
          : null;

      if (requestHitTestSource) {
        void requestHitTestSource({
          space: this.viewerSpace,
        })
          .then((source: any) => {
            this.hitTestSource = source;
          })
          .catch(() => undefined);
      }
    }

    if (this.hitTestSource && referenceSpace) {
      const results = frame.getHitTestResults(
        this.hitTestSource,
      );

      if (results.length > 0) {
        const pose = results[0].getPose(referenceSpace);

        if (pose) {
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(
            pose.transform.matrix,
          );
        }
      } else {
        this.reticle.visible = false;
      }
    }

    this.updateVideoFacing();
    this.ensureHeritageVideoPlaying();
  }

  dispose() {
    this.renderer.domElement.removeEventListener(
      'pointerdown',
      this.onPointerDown,
    );

    this.renderer.xr.removeEventListener(
      'sessionstart',
      this.onSessionStart,
    );

    this.renderer.xr.removeEventListener(
      'sessionend',
      this.onSessionEnd,
    );

    if (this.hitTestSource) {
      try {
        this.hitTestSource.cancel();
      } catch {
        // Ignore WebXR cleanup errors.
      }
      this.hitTestSource = null;
    }

    if (this.selectedModel) {
      disposeObject(this.selectedModel);
      this.selectedModel = null;
    }

    this.clearHeritageVideo();

    this.arButton?.remove();
    this.vrButton?.remove();

    if (this.vrController) {
      this.vrController.removeFromParent();
      this.vrController = null;
    }

   this.reticle.geometry.dispose();

const reticleMaterials = Array.isArray(this.reticle.material)
  ? this.reticle.material
  : [this.reticle.material];

reticleMaterials.forEach((material) => {
  material.dispose();
});

this.xrGroup.removeFromParent();
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    if (!this.renderer.xr.isPresenting) return;
    if (event.button !== 0) return;

    if (this.heritageVideoReady) {
      this.enableVideoAudio();
    }

    if (!this.reticle.visible || !this.selectedModel) return;

    const position = new THREE.Vector3().setFromMatrixPosition(
      this.reticle.matrix,
    );

    this.selectedModel.position.copy(position);
    this.selectedModel.visible = true;

    if (this.heritageVideoGroup) {
      this.heritageVideoGroup.visible = true;
    }
  };

  private readonly onSessionStart = () => {
    this.hitTestSource = null;
    this.viewerSpace = null;

    this.arVisibility.clear();

    const session = this.renderer.xr.getSession();

    if (session?.environmentBlendMode !== 'opaque') {
      this.scene.children.forEach((child) => {
        if (
          child === this.xrGroup ||
          child instanceof THREE.Light
        ) {
          return;
        }

        this.arVisibility.set(child, child.visible);
        child.visible = false;
      });
    }

    if (this.heritageVideoGroup) {
      this.heritageVideoGroup.visible = true;
    }

    if (this.heritageVideo) {
      this.heritageVideo.muted = true;
      void this.heritageVideo.play().catch(() => undefined);
    }
  };

  private readonly onSessionEnd = () => {
    this.hitTestSource = null;
    this.viewerSpace = null;
    this.reticle.visible = false;

    this.arVisibility.forEach((visible, object) => {
      object.visible = visible;
    });

    this.arVisibility.clear();

    if (this.heritageVideoGroup) {
      this.heritageVideoGroup.visible = false;
    }

    this.heritageVideo?.pause();
  };

  private enableVideoAudio() {
    const video = this.heritageVideo;
    if (!video) return;

    video.muted = false;
    video.volume = 1;

    void video.play().catch(() => undefined);
  }

  private ensureHeritageVideoPlaying() {
    const video = this.heritageVideo;
    if (!video || !this.renderer.xr.isPresenting) return;

    if (video.paused && !this.heritageVideoFinished) {
      void video.play().catch(() => undefined);
    }
  }

  private updateVideoFacing() {
    if (!this.heritageVideoGroup || !this.renderer.xr.isPresenting) {
      return;
    }

    const cameraPosition = new THREE.Vector3();
    cameraPosition.setFromMatrixPosition(
      this.camera.matrixWorld,
    );

    this.heritageVideoGroup.lookAt(cameraPosition);
    this.heritageVideoGroup.rotateY(Math.PI);
  }

  private async placeSelectedVR() {
    if (!this.selectedArtifact) return;

    if (!this.selectedModel) {
      const model = await loadArtifactModel(
        this.selectedArtifact,
      );

      model.position.set(0, 0, -2);
      model.rotation.y = Math.PI;

      this.selectedModel = model;
      this.xrGroup.add(model);
    }

    this.selectedModel.visible = true;

    if (this.heritageVideoGroup) {
      this.heritageVideoGroup.visible = true;
    }
  }
}

function createLabelTexture(
  title: string,
  subtitle: string,
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 190;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(7,6,5,.95)';
  ctx.fillRect(24, 20, canvas.width - 48, canvas.height - 40);

  ctx.strokeStyle = 'rgba(224,174,84,.86)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 20, canvas.width - 48, canvas.height - 40);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#f0d49a';
  ctx.font = '700 48px Georgia';
  ctx.fillText(title, canvas.width / 2, 78);

  ctx.fillStyle = 'rgba(236,215,177,.54)';
  ctx.font = '20px Arial';
  ctx.fillText(subtitle, canvas.width / 2, 126);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createFooterTexture(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 100;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(7,6,5,.88)';
  ctx.fillRect(15, 22, canvas.width - 30, canvas.height - 44);

  ctx.strokeStyle = 'rgba(224,174,84,.50)';
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 22, canvas.width - 30, canvas.height - 44);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(240,216,173,.58)';
  ctx.font = '17px Arial';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function sceneAddControllerModel(
  controller: THREE.Group,
  scene: THREE.Scene,
) {
  scene.add(controller);

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);

  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0xd9ae62,
    }),
  );

  controller.add(line);
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    object.geometry.dispose();

    const materials = (
      Array.isArray(object.material)
        ? object.material
        : [object.material]
    ) as THREE.Material[];

    for (const material of materials) {
      const materialWithMap = material as THREE.Material & {
        map?: THREE.Texture | null;
      };

      if (materialWithMap.map) {
        materialWithMap.map.dispose();
      }

      material.dispose();
    }
  });
}
