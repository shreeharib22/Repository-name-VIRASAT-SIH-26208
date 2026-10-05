import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export interface PlayerControls {
  keys: Record<string, boolean>;
  yaw: number;
  grounded: boolean;
  verticalVelocity: number;
  velocity: THREE.Vector3;
}

export type PlayerAnimation =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump';

const PLAYER_PATH = '/models/player/';

function loadFBX(
  loader: FBXLoader,
  url: string,
): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      resolve,
      undefined,
      reject,
    );
  });
}

/* ============================================================
   CHARACTER MATERIAL SETUP
   ============================================================ */

function prepareCharacter(root: THREE.Group) {
  root.updateMatrixWorld(true);

  /* ----------------------------------------------------------
     Normalize character height
     ---------------------------------------------------------- */

  const initialBox =
    new THREE.Box3().setFromObject(root);

  const height =
    initialBox.max.y -
    initialBox.min.y;

  if (height > 0.001) {
    const targetHeight = 1.85;

    const scale =
      targetHeight / height;

    root.scale.setScalar(scale);
  }

  root.updateMatrixWorld(true);

  /* ----------------------------------------------------------
     Put feet exactly on the game ground
     ---------------------------------------------------------- */

  const finalBox =
    new THREE.Box3().setFromObject(root);

  root.position.y -= finalBox.min.y;

  /* ----------------------------------------------------------
     Material conversion cache
     ---------------------------------------------------------- */

  const materialCache =
    new Map<
      THREE.Material,
      THREE.MeshStandardMaterial
    >();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;

    const sourceMaterials =
      Array.isArray(object.material)
        ? object.material
        : [object.material];

    const convertedMaterials =
      sourceMaterials.map((sourceMaterial) => {
        const cached =
          materialCache.get(
            sourceMaterial,
          );

        if (cached) {
          return cached;
        }

        const source =
          sourceMaterial as THREE.MeshPhongMaterial;

        /* ----------------------------------------------------
           Preserve source texture/color
           ---------------------------------------------------- */

        const sourceMap =
          source.map ?? null;

        const sourceColor =
          source.color?.clone() ??
          new THREE.Color(0.72, 0.58, 0.46);

        /* ----------------------------------------------------
           Detect extremely dark source materials.
           Mixamo non-PBR FBX assets often contain
           materials that look too dark under PBR lighting.
           ---------------------------------------------------- */

        const brightness =
          sourceColor.r +
          sourceColor.g +
          sourceColor.b;

        if (brightness < 0.7) {
          sourceColor.lerp(
            new THREE.Color(0x6f4b36),
            0.18,
          );
        }

        /* ----------------------------------------------------
           Create a REAL MeshStandardMaterial.
           This is an actual conversion, not a cast.
           ---------------------------------------------------- */

        const material =
          new THREE.MeshStandardMaterial({
            color: sourceColor,

            map: sourceMap,

            normalMap:
              source.normalMap ?? null,

            normalScale:
              source.normalScale?.clone() ??
              new THREE.Vector2(1, 1),

            alphaMap:
              source.alphaMap ?? null,

            transparent:
              source.transparent,

            opacity:
              source.opacity ?? 1,

            side:
              THREE.FrontSide,

            roughness: 0.68,

            metalness: 0.02,

            depthWrite:
              !source.transparent,
          });

        /* ----------------------------------------------------
           Correct diffuse texture color space.
           ---------------------------------------------------- */

        if (material.map) {
          material.map.colorSpace =
            THREE.SRGBColorSpace;

          material.map.needsUpdate = true;
        }

        /* ----------------------------------------------------
           Skin/material readability.
           ---------------------------------------------------- */

        if (brightness < 0.45) {
          material.emissive.set(
            0x1c120d,
          );

          material.emissiveIntensity =
            0.14;
        }

        material.needsUpdate = true;

        materialCache.set(
          sourceMaterial,
          material,
        );

        return material;
      });

    object.material =
      Array.isArray(object.material)
        ? convertedMaterials
        : convertedMaterials[0];
  });

  root.updateMatrixWorld(true);
}

/* ============================================================
   FALLBACK CHARACTER
   ============================================================ */

function createFallback() {
  const fallback =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.42,
        0.9,
        5,
        8,
      ),
      new THREE.MeshStandardMaterial({
        color: 0xa45f39,
        roughness: 0.88,
      }),
    );

  body.position.y = 1.05;
  body.castShadow = true;

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.33,
        14,
        14,
      ),
      new THREE.MeshStandardMaterial({
        color: 0xb8784f,
        roughness: 0.9,
      }),
    );

  head.position.y = 1.92;
  head.castShadow = true;

  const cloth =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        0.52,
        1.1,
        7,
      ),
      new THREE.MeshStandardMaterial({
        color: 0x29221d,
        roughness: 0.95,
      }),
    );

  cloth.position.y = 0.7;
  cloth.rotation.x = Math.PI;

  cloth.castShadow = true;

  fallback.add(
    body,
    head,
    cloth,
  );

  return {
    fallback,
    body,
    head,
    cloth,
  };
}

/* ============================================================
   ANIMATION LOADER
   ============================================================ */

async function loadAnimationClip(
  loader: FBXLoader,
  filename: string,
  name: PlayerAnimation,
) {
  try {
    const animationFile =
      await loadFBX(
        loader,
        `${PLAYER_PATH}${filename}`,
      );

    const clip =
      animationFile.animations[0];

    if (!clip) {
      console.warn(
        `[VIRASAT] No animation found in ${filename}`,
      );

      return null;
    }

    clip.name = name;

    /*
     * Animation-only FBX files may contain
     * meshes/materials that we don't need.
     *
     * Clean those objects without touching
     * the animation clip itself.
     */
    animationFile.traverse(
      (object) => {
        if (
          !(object instanceof THREE.Mesh)
        ) {
          return;
        }

        object.geometry.dispose();

        const materials =
          Array.isArray(
            object.material,
          )
            ? object.material
            : [object.material];

        materials.forEach(
          (material) => {
            material.dispose();
          },
        );
      },
    );

    return clip;
  } catch (error) {
    console.warn(
      `[VIRASAT] Failed to load ${filename}`,
      error,
    );

    return null;
  }
}

/* ============================================================
   PLAYER
   ============================================================ */

export function createPlayer() {
  const player =
    new THREE.Group();

  player.position.set(
    0,
    0,
    7,
  );

  /* ----------------------------------------------------------
     Temporary fallback
     ---------------------------------------------------------- */

  const fallbackParts =
    createFallback();

  player.add(
    fallbackParts.fallback,
  );

  /* ----------------------------------------------------------
     Runtime references
     ---------------------------------------------------------- */

  let character:
    | THREE.Group
    | null = null;

  let mixer:
    | THREE.AnimationMixer
    | null = null;

  const actions =
    new Map<
      PlayerAnimation,
      THREE.AnimationAction
    >();

  let activeAnimation:
    | PlayerAnimation
    | null = null;

  let disposed = false;

  /* ==========================================================
     UPDATE
     ========================================================== */

  const update = (
    delta: number,
  ) => {
    if (!mixer) {
      return;
    }

    mixer.update(delta);
  };

  /* ==========================================================
     ANIMATION SWITCHING
     ========================================================== */

  const playAnimation = (
    name: PlayerAnimation,
    fadeDuration = 0.15,
  ) => {
    const nextAction =
      actions.get(name);

    if (!nextAction) {
      return;
    }

    if (
      activeAnimation === name &&
      nextAction.isRunning()
    ) {
      return;
    }

    const previousAction =
      activeAnimation
        ? actions.get(
            activeAnimation,
          )
        : undefined;

    nextAction.reset();

    nextAction.enabled = true;

    nextAction.setEffectiveWeight(
      1,
    );

    /* --------------------------------------------------------
       Animation speed
       -------------------------------------------------------- */

    if (name === 'run') {
      nextAction.setEffectiveTimeScale(
        1.08,
      );
    } else if (name === 'walk') {
      nextAction.setEffectiveTimeScale(
        1.0,
      );
    } else if (name === 'jump') {
      nextAction.setEffectiveTimeScale(
        0.95,
      );
    } else {
      nextAction.setEffectiveTimeScale(
        1.0,
      );
    }

    /* --------------------------------------------------------
       Smooth blend
       -------------------------------------------------------- */

    if (
      previousAction &&
      previousAction !== nextAction
    ) {
      nextAction.crossFadeFrom(
        previousAction,
        fadeDuration,
        true,
      );
    }

    nextAction.play();

    activeAnimation = name;
  };

  const setAnimation = (
    name: PlayerAnimation,
  ) => {
    playAnimation(name);
  };

  /* ==========================================================
     LOAD CHARACTER + ANIMATIONS
     ========================================================== */

  const loadCharacter =
    async () => {
      const loader =
        new FBXLoader();

      try {
        const loadedCharacter =
          await loadFBX(
            loader,
            `${PLAYER_PATH}Ch33_nonPBR.fbx`,
          );

        if (disposed) {
          return;
        }

        /* ----------------------------------------------------
           Prepare the real Mixamo character
           ---------------------------------------------------- */

        prepareCharacter(
          loadedCharacter,
        );

        character =
          loadedCharacter;

        player.add(
          loadedCharacter,
        );

        /*
         * Hide primitive fallback.
         */
        fallbackParts.fallback.visible =
          false;

        /* ----------------------------------------------------
           Load animation clips
           ---------------------------------------------------- */

        const [
          idle,
          walk,
          run,
          jump,
        ] = await Promise.all([
          loadAnimationClip(
            loader,
            'Virasat_Idle.fbx',
            'idle',
          ),

          loadAnimationClip(
            loader,
            'Virasat_Walk.fbx',
            'walk',
          ),

          loadAnimationClip(
            loader,
            'Virasat_Run.fbx',
            'run',
          ),

          loadAnimationClip(
            loader,
            'Virasat_Jump.fbx',
            'jump',
          ),
        ]);

        if (disposed) {
          return;
        }

        /* ----------------------------------------------------
           Animation mixer
           ---------------------------------------------------- */

        mixer =
          new THREE.AnimationMixer(
            loadedCharacter,
          );

        const clips:
          Array<
            [
              PlayerAnimation,
              THREE.AnimationClip | null,
            ]
          > = [
          ['idle', idle],
          ['walk', walk],
          ['run', run],
          ['jump', jump],
        ];

        clips.forEach(
          ([name, clip]) => {
            if (!clip) {
              return;
            }

            const action =
              mixer!.clipAction(
                clip,
              );

            /*
             * Default loop.
             */
            action.setLoop(
              THREE.LoopRepeat,
              Infinity,
            );

            action.enabled = true;

            action.setEffectiveWeight(
              0,
            );

            actions.set(
              name,
              action,
            );
          },
        );

        /* ----------------------------------------------------
           Jump configuration
           ---------------------------------------------------- */

        const jumpAction =
          actions.get('jump');

        if (jumpAction) {
          jumpAction.setLoop(
            THREE.LoopOnce,
            1,
          );

          jumpAction.clampWhenFinished =
            true;
        }

        /* ----------------------------------------------------
           Idle is the starting animation
           ---------------------------------------------------- */

        playAnimation(
          'idle',
          0,
        );

        console.log(
          '[VIRASAT] Real player loaded successfully.',
        );
      } catch (error) {
        console.error(
          '[VIRASAT] Failed to load real player:',
          error,
        );

        /*
         * Keep fallback visible.
         */
        fallbackParts.fallback.visible =
          true;
      }
    };

  void loadCharacter();

  /* ==========================================================
     DISPOSE
     ========================================================== */

  const dispose = () => {
    disposed = true;

    mixer?.stopAllAction();

    if (character) {
      mixer?.uncacheRoot(
        character,
      );

      character = null;
    }

    mixer = null;

    actions.clear();
  };

  /* ==========================================================
     RETURN API
     ========================================================== */

  return {
    player,

    /*
     * Kept for compatibility with
     * existing App.tsx references.
     */
    body: fallbackParts.body,
    head: fallbackParts.head,
    cloth: fallbackParts.cloth,

    update,
    setAnimation,
    playAnimation,
    dispose,
  };
}

/* ============================================================
   MOVEMENT HELPER
   ============================================================ */

export function resolveMovement(
  direction: THREE.Vector3,
  cameraYaw: number,
  keys: Record<string, boolean>,
) {
  direction.set(
    0,
    0,
    0,
  );

  if (keys.KeyW) {
    direction.z -= 1;
  }

  if (keys.KeyS) {
    direction.z += 1;
  }

  if (keys.KeyA) {
    direction.x -= 1;
  }

  if (keys.KeyD) {
    direction.x += 1;
  }

  const moving =
    direction.lengthSq() > 0;

  if (moving) {
    direction.normalize();

    direction.applyAxisAngle(
      new THREE.Vector3(
        0,
        1,
        0,
      ),
      cameraYaw,
    );
  }

  return moving;
}