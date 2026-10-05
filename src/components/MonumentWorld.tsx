import { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';

import type { ArtifactDefinition } from '../types/game';

import { loadArtifactModel } from '../game/AssetLoader';

import { createPlayer } from '../game/Player';



interface MonumentWorldProps {

  artifact: ArtifactDefinition;

  locationName: string;

  region: string;

  onBack: () => void;

  onMuseum: () => void;

  onCollect: (artifactId: string) => void;

}



export function MonumentWorld({

  artifact,

  locationName,

  region,

  onBack,

  onMuseum,

  onCollect,

}: MonumentWorldProps) {

  const mountRef = useRef<HTMLDivElement | null>(null);



  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [showInfo, setShowInfo] = useState(false);

  const [collected, setCollected] = useState(false);



  useEffect(() => {

    const mount = mountRef.current;



    if (!mount) return;



    setLoading(true);

    setError('');



    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x17110b);

    scene.fog = new THREE.Fog(

      0x17110b,

      28,

      110,

    );



    const camera =

      new THREE.PerspectiveCamera(

        62,

        Math.max(1, mount.clientWidth) /

          Math.max(1, mount.clientHeight),

        0.1,

        250,

      );



    camera.position.set(

      0,

      4,

      12,

    );



    const renderer =

      new THREE.WebGLRenderer({

        antialias: true,

        powerPreference:

          'high-performance',

      });



    renderer.setPixelRatio(

      Math.min(

        window.devicePixelRatio,

        1.5,

      ),

    );



    renderer.setSize(

      Math.max(1, mount.clientWidth),

      Math.max(1, mount.clientHeight),

      false,

    );



    renderer.outputColorSpace =

      THREE.SRGBColorSpace;



    renderer.toneMapping =

      THREE.ACESFilmicToneMapping;



    renderer.toneMappingExposure = 1.05;



    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =

      THREE.PCFSoftShadowMap;



    renderer.domElement.style.width =

      '100%';



    renderer.domElement.style.height =

      '100%';



    renderer.domElement.style.display =

      'block';



    renderer.domElement.style.touchAction =

      'none';



    renderer.domElement.style.cursor =

      'grab';



    mount.appendChild(

      renderer.domElement,

    );



    const hemi =

      new THREE.HemisphereLight(

        0xffddb0,

        0x24160e,

        2.5,

      );



    scene.add(hemi);



    const sun =

      new THREE.DirectionalLight(

        0xffc78c,

        3.0,

      );



    sun.position.set(

      18,

      28,

      14,

    );



    sun.castShadow = true;



    sun.shadow.mapSize.set(

      1024,

      1024,

    );



    sun.shadow.camera.near = 0.1;

    sun.shadow.camera.far = 100;



    scene.add(sun);



    const rim =

      new THREE.DirectionalLight(

        0xa7c6ff,

        1.3,

      );



    rim.position.set(

      -15,

      10,

      -18,

    );



    scene.add(rim);



    const warmLight =

      new THREE.PointLight(

        0xd89d54,

        4.5,

        35,

      );



    warmLight.position.set(

      0,

      7,

      0,

    );



    scene.add(warmLight);



    const groundMaterial =

      new THREE.MeshStandardMaterial({

        color: 0x4b3827,

        roughness: 1,

      });



    const ground =

      new THREE.Mesh(

        new THREE.CircleGeometry(

          42,

          96,

        ),

        groundMaterial,

      );



    ground.rotation.x =

      -Math.PI / 2;



    ground.receiveShadow = true;



    scene.add(ground);



    const plazaMaterial =

      new THREE.MeshStandardMaterial({

        color: 0x75604b,

        roughness: 0.92,

      });



    const plaza =

      new THREE.Mesh(

        new THREE.CylinderGeometry(

          8.5,

          9.3,

          0.7,

          72,

        ),

        plazaMaterial,

      );



    plaza.position.y = 0.35;

    plaza.receiveShadow = true;



    scene.add(plaza);



    const innerRing =

      new THREE.Mesh(

        new THREE.TorusGeometry(

          7.7,

          0.09,

          12,

          96,

        ),

        new THREE.MeshStandardMaterial({

          color: 0xc99c5c,

          roughness: 0.38,

          metalness: 0.2,

        }),

      );



    innerRing.rotation.x =

      Math.PI / 2;



    innerRing.position.y =

      0.73;



    scene.add(innerRing);



    const stoneMaterial =

      new THREE.MeshStandardMaterial({

        color: 0x625242,

        roughness: 0.94,

      });



    const pillarObjects:

      THREE.Object3D[] = [];



    for (

      let i = 0;

      i < 12;

      i += 1

    ) {

      const angle =

        (i / 12) *

        Math.PI *

        2;



      const x =

        Math.cos(angle) *

        13.5;



      const z =

        Math.sin(angle) *

        13.5;



      const pillar =

        new THREE.Mesh(

          new THREE.CylinderGeometry(

            0.55,

            0.72,

            5.8,

            10,

          ),

          stoneMaterial,

        );



      pillar.position.set(

        x,

        2.9,

        z,

      );



      pillar.castShadow = true;

      pillar.receiveShadow = true;



      scene.add(pillar);

      pillarObjects.push(

        pillar,

      );



      const capital =

        new THREE.Mesh(

          new THREE.BoxGeometry(

            1.55,

            0.34,

            1.55,

          ),

          stoneMaterial,

        );



      capital.position.set(

        x,

        5.87,

        z,

      );



      capital.castShadow = true;

      capital.receiveShadow = true;



      scene.add(capital);

      pillarObjects.push(

        capital,

      );

    }



    const playerParts =

      createPlayer();



    // Start closer to the landmark so the supplied asset reads as the main destination.
    playerParts.player.position.set(
      0,
      0,
      7.5,
    );



    scene.add(

      playerParts.player,

    );



    let model:

      THREE.Object3D | null =

      null;



    let disposed = false;

    let animationFrame = 0;

    let previous =

      performance.now();



    const controls = {

      keys: {} as Record<

        string,

        boolean

      >,



      // Stable initial angle. The camera only rotates while the user drags.
      yaw: 0,
      pitch: 0.24,
      distance: 7.2,



      dragging: false,



      lastX: 0,

      lastY: 0,

    };



    const velocity =

      new THREE.Vector3();



    const direction =

      new THREE.Vector3();



    const cameraTarget =

      new THREE.Vector3();



    const desiredCamera =

      new THREE.Vector3();



    let verticalVelocity = 0;

    let grounded = true;



    const loadModel =

      async () => {

        try {

          const loaded =

            await loadArtifactModel(

              artifact,

            );



          if (disposed) {

            disposeObject(

              loaded,

            );



            return;

          }
          // AssetLoader normalizes the imported asset. Enlarge it for the
          // playable monument world so the landmark is visually dominant.
          loaded.scale.multiplyScalar(1.65);
          loaded.updateMatrixWorld(true);

          loaded.position.set(
            0,
            0,
            0,
          );

          loaded.updateMatrixWorld(
            true,
          );

          const box =
            new THREE.Box3().setFromObject(
              loaded,
            );

          // Seat the enlarged asset exactly on the raised plaza.
          loaded.position.y +=
            0.78 - box.min.y;

          loaded.updateMatrixWorld(
            true,
          );



          loaded.traverse(

            (object) => {

              if (

                !(object instanceof

                  THREE.Mesh)

              ) {

                return;

              }



              object.castShadow =

                true;



              object.receiveShadow =

                true;

            },

          );



          model =

            loaded;



          scene.add(

            loaded,

          );



          setLoading(false);

        } catch (loadError) {

          console.error(

            'Monument model load failed:',

            loadError,

          );



          if (disposed) return;



          setLoading(false);



          setError(

            loadError instanceof

              Error

              ? loadError.message

              : 'The monument model could not be loaded.',

          );

        }

      };



    const onKeyDown = (

      event: KeyboardEvent,

    ) => {

      controls.keys[

        event.code

      ] = true;



      if (

        event.code ===

        'Space'

      ) {

        event.preventDefault();

      }



      if (

        event.code ===

        'KeyE'

      ) {

        setShowInfo(true);

      }



      if (

        event.code ===

        'Escape'

      ) {

        setShowInfo(false);

      }

    };



    const onKeyUp = (

      event: KeyboardEvent,

    ) => {

      controls.keys[

        event.code

      ] = false;

    };



    const onPointerDown = (

      event: PointerEvent,

    ) => {

      if (

        event.button !== 0

      ) {

        return;

      }



      controls.dragging = true;



      controls.lastX =

        event.clientX;



      controls.lastY =

        event.clientY;



      renderer.domElement.style.cursor =

        'grabbing';



      renderer.domElement.setPointerCapture(

        event.pointerId,

      );

    };



    const onPointerMove = (

      event: PointerEvent,

    ) => {

      if (

        !controls.dragging

      ) {

        return;

      }



      const dx =

        event.clientX -

        controls.lastX;



      const dy =

        event.clientY -

        controls.lastY;



      controls.lastX =

        event.clientX;



      controls.lastY =

        event.clientY;



      controls.yaw -=

        dx * 0.005;



      controls.pitch =

        THREE.MathUtils.clamp(

          controls.pitch -

            dy * 0.004,

          -0.12,

          0.88,

        );

    };



    const onPointerUp = () => {

      controls.dragging = false;



      renderer.domElement.style.cursor =

        'grab';

    };



    const onWheel = (

      event: WheelEvent,

    ) => {

      controls.distance = THREE.MathUtils.clamp(
        controls.distance + event.deltaY * 0.008,
        4.8,
        12,
      );

    };



    const onResize = () => {

      const width =

        Math.max(

          1,

          mount.clientWidth,

        );



      const height =

        Math.max(

          1,

          mount.clientHeight,

        );



      camera.aspect =

        width / height;



      camera.updateProjectionMatrix();



      renderer.setSize(

        width,

        height,

        false,

      );

    };



    window.addEventListener(

      'keydown',

      onKeyDown,

    );



    window.addEventListener(

      'keyup',

      onKeyUp,

    );



    window.addEventListener(

      'resize',

      onResize,

    );



    renderer.domElement.addEventListener(

      'pointerdown',

      onPointerDown,

    );



    renderer.domElement.addEventListener(

      'pointermove',

      onPointerMove,

    );



    renderer.domElement.addEventListener(

      'pointerup',

      onPointerUp,

    );



    renderer.domElement.addEventListener(

      'pointercancel',

      onPointerUp,

    );



    renderer.domElement.addEventListener(

      'wheel',

      onWheel,

      {

        passive: true,

      },

    );



    const animate = (

      now: number,

    ) => {

      animationFrame =

        requestAnimationFrame(

          animate,

        );



      const delta =

        Math.min(

          (now - previous) /

            1000,

          0.05,

        );



      previous = now;



      direction.set(

        0,

        0,

        0,

      );



      if (

        controls.keys.KeyW

      ) {

        direction.z -= 1;

      }



      if (

        controls.keys.KeyS

      ) {

        direction.z += 1;

      }



      if (

        controls.keys.KeyA

      ) {

        direction.x -= 1;

      }



      if (

        controls.keys.KeyD

      ) {

        direction.x += 1;

      }



      const wantsMove =

        direction.lengthSq() >

        0;



      if (wantsMove) {

        direction.normalize();



        direction.applyAxisAngle(

          new THREE.Vector3(

            0,

            1,

            0,

          ),

          controls.yaw,

        );



        const running =

          controls.keys.ShiftLeft ||

          controls.keys.ShiftRight;



        const speed =

          running

            ? 6.5

            : 3.6;



        velocity.x =

          THREE.MathUtils.damp(

            velocity.x,

            direction.x *

              speed,

            18,

            delta,

          );



        velocity.z =

          THREE.MathUtils.damp(

            velocity.z,

            direction.z *

              speed,

            18,

            delta,

          );

      } else {

        velocity.x =

          THREE.MathUtils.damp(

            velocity.x,

            0,

            24,

            delta,

          );



        velocity.z =

          THREE.MathUtils.damp(

            velocity.z,

            0,

            24,

            delta,

          );

      }



      playerParts.player.position.x +=

        velocity.x * delta;



      playerParts.player.position.z +=

        velocity.z * delta;



      if (

        controls.keys.Space &&

        grounded

      ) {

        verticalVelocity =

          8.2;



        grounded = false;

      }



      verticalVelocity +=

        -21 * delta;



      playerParts.player.position.y +=

        verticalVelocity * delta;



      if (

        playerParts.player.position.y <=

        0

      ) {

        playerParts.player.position.y =

          0;



        verticalVelocity = 0;

        grounded = true;

      }



      playerParts.player.position.x =

        THREE.MathUtils.clamp(

          playerParts.player.position.x,

          -19,

          19,

        );



      playerParts.player.position.z =

        THREE.MathUtils.clamp(

          playerParts.player.position.z,

          -19,

          19,

        );



      const horizontalSpeed =

        Math.hypot(

          velocity.x,

          velocity.z,

        );



      if (

        horizontalSpeed >

        0.05

      ) {

        playerParts.player.rotation.y =

          Math.atan2(

            velocity.x,

            velocity.z,

          );



        playerParts.body.position.y =

          1.05 +

          Math.sin(

            now * 0.014,

          ) *

            0.035;

      } else {

        playerParts.body.position.y =

          1.05;

      }



      cameraTarget.set(

        playerParts.player.position.x,

        playerParts.player.position.y +

          1.35,

        playerParts.player.position.z,

      );



      const horizontal =

        controls.distance *

        Math.cos(

          controls.pitch,

        );



      desiredCamera.set(

        playerParts.player.position.x +

          Math.sin(

            controls.yaw,

          ) *

            horizontal,



        playerParts.player.position.y +

          1.25 +

          controls.distance *

            Math.sin(

              controls.pitch,

            ),



        playerParts.player.position.z +

          Math.cos(

            controls.yaw,

          ) *

            horizontal,

      );



      camera.position.lerp(

        desiredCamera,

        0.1,

      );



      camera.lookAt(

        cameraTarget,

      );
      // Keep the monument static. Dragging changes the camera angle instead.
      renderer.render(
        scene,
        camera,
      );

    };



    void loadModel();



    animationFrame =

      requestAnimationFrame(

        animate,

      );



    return () => {

      disposed = true;



      cancelAnimationFrame(

        animationFrame,

      );



      window.removeEventListener(

        'keydown',

        onKeyDown,

      );



      window.removeEventListener(

        'keyup',

        onKeyUp,

      );



      window.removeEventListener(

        'resize',

        onResize,

      );



      renderer.domElement.removeEventListener(

        'pointerdown',

        onPointerDown,

      );



      renderer.domElement.removeEventListener(

        'pointermove',

        onPointerMove,

      );



      renderer.domElement.removeEventListener(

        'pointerup',

        onPointerUp,

      );



      renderer.domElement.removeEventListener(

        'pointercancel',

        onPointerUp,

      );



      renderer.domElement.removeEventListener(

        'wheel',

        onWheel,

      );



      disposeObject(model);



      disposeObject(

        playerParts.player,

      );



      ground.geometry.dispose();

      groundMaterial.dispose();



      plaza.geometry.dispose();

      plazaMaterial.dispose();



      innerRing.geometry.dispose();



      if (

        innerRing.material instanceof

        THREE.Material

      ) {

        innerRing.material.dispose();

      }



      pillarObjects.forEach(

        (object) => {

          disposeObject(object);

        },

      );



      renderer.dispose();



      if (

        mount.contains(

          renderer.domElement,

        )

      ) {

        mount.removeChild(

          renderer.domElement,

        );

      }

    };

  }, [artifact]);



  const collectArtifact = () => {

    if (collected) return;



    setCollected(true);

    onCollect(

      artifact.id,

    );

  };



  return (

    <section className="monument-world-shell">

      <div

        ref={mountRef}

        className="monument-canvas-host"

      />



      <div className="monument-hud pointer">

        <div className="glass-panel hud-panel">

          <div className="eyebrow">

            VIRASAT · 3D WORLD

          </div>



          <strong

            style={{

              display: 'block',

              marginTop: 5,

              fontFamily:

                'Space Grotesk',

              fontSize: 20,

            }}

          >

            {locationName.toUpperCase()}

          </strong>



          <div

            style={{

              marginTop: 6,

              color:

                'rgba(244,234,215,.58)',

              fontSize: 11,

            }}

          >

            {region} ·{' '}

            {artifact.category}

          </div>

        </div>



        <div className="hud-right">

          <button

            className="small-btn"

            onClick={onBack}

          >

            WORLD MAP

          </button>



          <button

            className="small-btn"

            onClick={onMuseum}

          >

            3D MUSEUM

          </button>



          <button

            className="small-btn"

            onClick={() =>

              setShowInfo(true)

            }

          >

            INSPECT

          </button>



          <button

            className="small-btn"

            onClick={

              collectArtifact

            }

          >

            {collected

              ? 'COLLECTED'

              : 'COLLECT ARTIFACT'}

          </button>

        </div>

      </div>



      <div className="monument-bottom pointer">

        <div className="glass-panel">

          <strong>

            {loading

              ? 'LOADING WORLD'

              : error

                ? 'MODEL ERROR'

                : 'WORLD READY'}

          </strong>



          <div

            style={{

              marginTop: 6,

              fontSize: 11,

              color:

                'rgba(244,234,215,.58)',

            }}

          >

            WASD MOVE · SHIFT RUN ·

            SPACE JUMP · DRAG CAMERA ·

            WHEEL ZOOM · E INSPECT

          </div>



          {error && (

            <div

              style={{

                marginTop: 8,

                color:

                  'rgba(255,180,160,.85)',

                fontSize: 12,

              }}

            >

              {error}

            </div>

          )}

        </div>

      </div>



      {showInfo && (

        <div className="modal-backdrop">

          <div className="glass-panel modal">

            <div className="eyebrow">

              HERITAGE INSPECTION

            </div>



            <h2>

              {artifact.name}

            </h2>



            <div className="kicker">

              {region} ·{' '}

              {artifact.category}

            </div>



            <p

              style={{

                lineHeight: 1.7,

                color:

                  'rgba(244,234,215,.7)',

              }}

            >

              {artifact.description}

            </p>



            <div className="modal-actions">

              <button

                className="primary-btn"

                onClick={

                  collectArtifact

                }

              >

                {collected

                  ? 'COLLECTED'

                  : 'ADD TO PASSPORT'}

              </button>



              <button

                className="secondary-btn"

                onClick={onMuseum}

              >

                OPEN 3D MUSEUM

              </button>



              <button

                className="ghost-btn"

                onClick={() =>

                  setShowInfo(false)

                }

              >

                CLOSE

              </button>

            </div>

          </div>

        </div>

      )}

    </section>

  );

}



function disposeObject(

  root: THREE.Object3D | null,

) {

  if (!root) return;



  root.traverse(

    (object) => {

      if (

        !(object instanceof

          THREE.Mesh)

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

}