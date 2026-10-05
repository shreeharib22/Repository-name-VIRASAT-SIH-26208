import * as THREE from 'three';

export interface WorldHandles {
  trees: THREE.Group[];
  colliders: THREE.Box3[];
  cleanup: () => void;
}

type GraphicsQuality = 'low' | 'medium' | 'high';

export function buildHampiWorld(
  scene: THREE.Scene,
  graphics: GraphicsQuality,
): WorldHandles {
  const worldRoot = new THREE.Group();
  worldRoot.name = 'Virasat_Hampi_World';

  scene.add(worldRoot);

  const trees: THREE.Group[] = [];
  const colliders: THREE.Box3[] = [];

  const disposables: Array<{
    geometry?: THREE.BufferGeometry;
    material?: THREE.Material | THREE.Material[];
  }> = [];

  const resolution =
    graphics === 'low'
      ? 0
      : graphics === 'medium'
        ? 1
        : 2;

  const shadowsEnabled =
    graphics !== 'low';

  const shadowSize =
    graphics === 'high'
      ? 2048
      : graphics === 'medium'
        ? 1024
        : 512;

  /* ============================================================
     CINEMATIC SCENE
     ============================================================ */

  scene.background =
    new THREE.Color(0x170f0a);

  scene.fog = new THREE.Fog(
    0x170f0a,
    graphics === 'high' ? 70 : 55,
    graphics === 'high' ? 220 : 155,
  );

  /* ============================================================
     LIGHTING
     ============================================================ */

  const hemisphere =
    new THREE.HemisphereLight(
      0xffdcb3,
      0x17100b,
      graphics === 'high'
        ? 2.0
        : 1.65,
    );

  worldRoot.add(hemisphere);

  const sun =
    new THREE.DirectionalLight(
      0xffbd79,
      graphics === 'high'
        ? 4.8
        : graphics === 'medium'
          ? 4.0
          : 3.2,
    );

  sun.position.set(
    55,
    75,
    35,
  );

  sun.castShadow =
    shadowsEnabled;

  sun.shadow.mapSize.set(
    shadowSize,
    shadowSize,
  );

  sun.shadow.camera.left = -95;
  sun.shadow.camera.right = 95;
  sun.shadow.camera.top = 95;
  sun.shadow.camera.bottom = -95;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 230;

  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.035;

  worldRoot.add(sun);

  const warmFill =
    new THREE.PointLight(
      0xff9b4e,
      graphics === 'high'
        ? 18
        : 12,
      52,
      2,
    );

  warmFill.position.set(
    0,
    8,
    -76,
  );

  worldRoot.add(warmFill);

  const coolRim =
    new THREE.DirectionalLight(
      0x718dc7,
      graphics === 'high'
        ? 1.4
        : 0.9,
    );

  coolRim.position.set(
    -50,
    34,
    -75,
  );

  worldRoot.add(coolRim);

  /* ============================================================
     SKY / SUN DISC
     ============================================================ */

  const skyDome =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        170,
        32,
        18,
      ),
      new THREE.MeshBasicMaterial({
        color: 0x24140d,
        side: THREE.BackSide,
      }),
    );

  skyDome.name = 'SkyDome';

  worldRoot.add(skyDome);

  disposables.push({
    geometry: skyDome.geometry,
    material:
      skyDome.material,
  });

  const sunDisc =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        8,
        48,
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffc26c,
        transparent: true,
        opacity:
          graphics === 'high'
            ? 0.9
            : 0.72,
        depthWrite: false,
      }),
    );

  sunDisc.position.set(
    -62,
    58,
    -105,
  );

  sunDisc.lookAt(
    new THREE.Vector3(0, 15, -40),
  );

  worldRoot.add(sunDisc);

  disposables.push({
    geometry:
      sunDisc.geometry,
    material:
      sunDisc.material,
  });

  /* ============================================================
     MATERIALS
     ============================================================ */

  const groundMat =
    new THREE.MeshStandardMaterial({
      color: 0x62452e,
      roughness: 1.0,
    });

  const earthMat =
    new THREE.MeshStandardMaterial({
      color: 0x765033,
      roughness: 0.98,
    });

  const pathMat =
    new THREE.MeshStandardMaterial({
      color: 0xa47a4d,
      roughness: 0.94,
    });

  const sandstone =
    new THREE.MeshStandardMaterial({
      color: 0x927052,
      roughness: 0.9,
    });

  const sunStone =
    new THREE.MeshStandardMaterial({
      color: 0xb88956,
      roughness: 0.78,
    });

  const darkStone =
    new THREE.MeshStandardMaterial({
      color: 0x4d4037,
      roughness: 0.96,
    });

  const weatheredStone =
    new THREE.MeshStandardMaterial({
      color: 0x76665a,
      roughness: 0.95,
    });

  const wood =
    new THREE.MeshStandardMaterial({
      color: 0x432d20,
      roughness: 0.92,
    });

  const leaf =
    new THREE.MeshStandardMaterial({
      color: 0x33412d,
      roughness: 1,
    });

  const leafLight =
    new THREE.MeshStandardMaterial({
      color: 0x4d5b39,
      roughness: 1,
    });

  const waterMat =
    new THREE.MeshStandardMaterial({
      color: 0x385b5c,
      roughness: 0.18,
      metalness: 0.04,
      transparent: true,
      opacity: 0.82,
    });

  const goldTrim =
    new THREE.MeshStandardMaterial({
      color: 0xa6814f,
      roughness: 0.68,
      metalness: 0.08,
    });

  disposables.push({
    material: [
      groundMat,
      earthMat,
      pathMat,
      sandstone,
      sunStone,
      darkStone,
      weatheredStone,
      wood,
      leaf,
      leafLight,
      waterMat,
      goldTrim,
    ],
  });

  /* ============================================================
     SHARED GEOMETRY
     ============================================================ */

  const rockGeo =
    new THREE.IcosahedronGeometry(
      2.4,
      resolution,
    );

  const smallRockGeo =
    new THREE.DodecahedronGeometry(
      1.1,
      resolution,
    );

  const trunkGeo =
    new THREE.CylinderGeometry(
      0.22,
      0.38,
      3.2,
      8,
    );

  const crownGeo =
    new THREE.SphereGeometry(
      2.15,
      graphics === 'high' ? 14 : 9,
      graphics === 'high' ? 12 : 7,
    );

  const leafClusterGeo =
    new THREE.SphereGeometry(
      1.2,
      10,
      8,
    );

  const pillarGeo =
    new THREE.CylinderGeometry(
      0.42,
      0.58,
      4.8,
      graphics === 'high'
        ? 12
        : 8,
    );

  const capitalGeo =
    new THREE.BoxGeometry(
      1.6,
      0.42,
      1.6,
    );

  const pillarBaseGeo =
    new THREE.CylinderGeometry(
      0.72,
      0.84,
      0.5,
      10,
    );

  disposables.push(
    { geometry: rockGeo },
    { geometry: smallRockGeo },
    { geometry: trunkGeo },
    { geometry: crownGeo },
    { geometry: leafClusterGeo },
    { geometry: pillarGeo },
    { geometry: capitalGeo },
    { geometry: pillarBaseGeo },
  );

  /* ============================================================
     HELPERS
     ============================================================ */

  function addBox(
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    material = sandstone,
    collision = false,
    rotationY = 0,
  ) {
    const mesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          sx,
          sy,
          sz,
        ),
        material,
      );

    mesh.position.set(
      x,
      y,
      z,
    );

    mesh.rotation.y =
      rotationY;

    mesh.castShadow =
      shadowsEnabled;

    mesh.receiveShadow = true;

    worldRoot.add(mesh);

    disposables.push({
      geometry:
        mesh.geometry,
    });

    if (collision) {
      colliders.push(
        new THREE.Box3().setFromObject(
          mesh,
        ),
      );
    }

    return mesh;
  }

  function addCylinder(
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
    material = sandstone,
    collision = false,
  ) {
    const mesh =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          radius * 0.94,
          radius,
          height,
          graphics === 'high'
            ? 18
            : 10,
        ),
        material,
      );

    mesh.position.set(
      x,
      y,
      z,
    );

    mesh.castShadow =
      shadowsEnabled;

    mesh.receiveShadow = true;

    worldRoot.add(mesh);

    disposables.push({
      geometry:
        mesh.geometry,
    });

    if (collision) {
      colliders.push(
        new THREE.Box3().setFromObject(
          mesh,
        ),
      );
    }

    return mesh;
  }

  function addPillar(
    x: number,
    z: number,
    height = 5,
    material = weatheredStone,
  ) {
    const group =
      new THREE.Group();

    const base =
      new THREE.Mesh(
        pillarBaseGeo,
        material,
      );

    base.position.y =
      0.25;

    const shaft =
      new THREE.Mesh(
        pillarGeo,
        material,
      );

    shaft.scale.y =
      height / 4.8;

    shaft.position.y =
      height / 2;

    const capital =
      new THREE.Mesh(
        capitalGeo,
        material,
      );

    capital.position.y =
      height + 0.2;

    group.add(
      base,
      shaft,
      capital,
    );

    group.position.set(
      x,
      0,
      z,
    );

    group.traverse(
      (object) => {
        if (
          object instanceof THREE.Mesh
        ) {
          object.castShadow =
            shadowsEnabled;

          object.receiveShadow =
            true;
        }
      },
    );

    worldRoot.add(group);

    return group;
  }

  function addRock(
    x: number,
    y: number,
    z: number,
    scale: number,
    tall = false,
  ) {
    const mesh =
      new THREE.Mesh(
        tall
          ? rockGeo
          : smallRockGeo,
        tall
          ? darkStone
          : weatheredStone,
      );

    mesh.position.set(
      x,
      y,
      z,
    );

    mesh.scale.set(
      scale,
      scale *
        THREE.MathUtils.randFloat(
          0.72,
          1.2,
        ),
      scale *
        THREE.MathUtils.randFloat(
          0.8,
          1.35,
        ),
    );

    mesh.rotation.set(
      THREE.MathUtils.randFloat(
        -0.15,
        0.15,
      ),
      Math.random() *
        Math.PI *
        2,
      THREE.MathUtils.randFloat(
        -0.12,
        0.12,
      ),
    );

    mesh.castShadow =
      shadowsEnabled;

    mesh.receiveShadow =
      true;

    worldRoot.add(mesh);

    return mesh;
  }

  function addTree(
    x: number,
    z: number,
    scale = 1,
    variant = 0,
  ) {
    const tree =
      new THREE.Group();

    const trunk =
      new THREE.Mesh(
        trunkGeo,
        wood,
      );

    trunk.position.y =
      1.5 * scale;

    trunk.scale.setScalar(
      scale,
    );

    trunk.castShadow =
      shadowsEnabled;

    trunk.receiveShadow =
      true;

    tree.add(trunk);

    const mainCrown =
      new THREE.Mesh(
        crownGeo,
        variant % 2 === 0
          ? leaf
          : leafLight,
      );

    mainCrown.position.y =
      4.0 * scale;

    mainCrown.scale.set(
      1.0 * scale,
      0.86 * scale,
      0.94 * scale,
    );

    mainCrown.castShadow =
      shadowsEnabled;

    mainCrown.receiveShadow =
      true;

    tree.add(mainCrown);

    for (
      let i = 0;
      i < (graphics === 'high' ? 4 : 3);
      i += 1
    ) {
      const cluster =
        new THREE.Mesh(
          leafClusterGeo,
          i % 2 === 0
            ? leaf
            : leafLight,
        );

      const angle =
        (i / 4) *
        Math.PI *
        2;

      cluster.position.set(
        Math.cos(angle) *
          1.35 *
          scale,

        (4.0 +
          Math.sin(i * 1.7) *
            0.3) *
          scale,

        Math.sin(angle) *
          1.2 *
          scale,
      );

      cluster.scale.setScalar(
        scale *
          THREE.MathUtils.randFloat(
            0.75,
            1.08,
          ),
      );

      cluster.castShadow =
        shadowsEnabled;

      cluster.receiveShadow =
        true;

      tree.add(cluster);
    }

    tree.position.set(
      x,
      0,
      z,
    );

    tree.rotation.y =
      Math.random() *
      Math.PI *
      2;

    worldRoot.add(tree);

    trees.push(tree);

    return tree;
  }

  function addTorch(
    x: number,
    z: number,
  ) {
    const group =
      new THREE.Group();

    const pole =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.1,
          0.14,
          2.3,
          8,
        ),
        wood,
      );

    pole.position.y =
      1.15;

    const flame =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.3,
          10,
          10,
        ),
        new THREE.MeshBasicMaterial({
          color: 0xffae52,
        }),
      );

    flame.position.y =
      2.35;

    const light =
      new THREE.PointLight(
        0xff963d,
        graphics === 'high'
          ? 7
          : 4.5,
        10,
        2,
      );

    light.position.y =
      2.35;

    group.add(
      pole,
      flame,
      light,
    );

    group.position.set(
      x,
      0,
      z,
    );

    worldRoot.add(group);

    disposables.push({
      geometry:
        pole.geometry,
    });

    disposables.push({
      geometry:
        flame.geometry,
      material:
        flame.material,
    });

    /*
     * Use onBeforeRender so the flame
     * subtly changes without needing
     * App.tsx animation changes.
     */
    flame.onBeforeRender = () => {
      const t =
        performance.now() *
        0.009;

      const pulse =
        0.9 +
        Math.sin(t + x * 0.2) *
          0.11;

      flame.scale.set(
        pulse,
        1.15 * pulse,
        pulse,
      );

      light.intensity =
        (graphics === 'high'
          ? 7
          : 4.5) +
        Math.sin(t * 1.7) *
          0.8;
    };

    return group;
  }

  /* ============================================================
     GROUND
     ============================================================ */

  const ground =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        240,
        240,
        graphics === 'high'
          ? 32
          : 16,
      ),
      groundMat,
    );

  ground.rotation.x =
    -Math.PI / 2;

  ground.receiveShadow = true;

  worldRoot.add(ground);

  disposables.push({
    geometry:
      ground.geometry,
  });

  /* ============================================================
     DIRT / TERRAIN PATCHES
     ============================================================ */

  for (let i = 0; i < 26; i += 1) {
    const patch =
      new THREE.Mesh(
        new THREE.CircleGeometry(
          THREE.MathUtils.randFloat(
            4,
            10,
          ),
          28,
        ),
        earthMat,
      );

    patch.rotation.x =
      -Math.PI / 2;

    patch.position.set(
      THREE.MathUtils.randFloat(
        -65,
        65,
      ),
      0.012,
      THREE.MathUtils.randFloat(
        -104,
        26,
      ),
    );

    patch.scale.x =
      THREE.MathUtils.randFloat(
        0.7,
        1.5,
      );

    patch.scale.y =
      THREE.MathUtils.randFloat(
        0.7,
        1.4,
      );

    patch.rotation.z =
      Math.random() *
      Math.PI;

    patch.receiveShadow = true;

    worldRoot.add(patch);

    disposables.push({
      geometry:
        patch.geometry,
    });
  }

  /* ============================================================
     MAIN HERITAGE PATH
     ============================================================ */

  const path =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        12,
        124,
      ),
      pathMat,
    );

  path.rotation.x =
    -Math.PI / 2;

  path.position.set(
    0,
    0.025,
    -44,
  );

  path.receiveShadow = true;

  worldRoot.add(path);

  disposables.push({
    geometry:
      path.geometry,
  });

  /* ============================================================
     PATH STONE TILES
     ============================================================ */

  for (
    let z = 8;
    z >= -104;
    z -= 4
  ) {
    const tileWidth =
      THREE.MathUtils.randFloat(
        8.8,
        10.8,
      );

    const tile =
      addBox(
        THREE.MathUtils.randFloat(
          -0.4,
          0.4,
        ),
        0.055,
        z,
        tileWidth,
        0.08,
        2.8,
        z % 8 === 0
          ? sandstone
          : sunStone,
        false,
        THREE.MathUtils.randFloat(
          -0.015,
          0.015,
        ),
      );

    tile.receiveShadow =
      true;
  }

  /* ============================================================
     ENTRY GATE
     ============================================================ */

  addPillar(
    -7,
    5,
    6,
    sunStone,
  );

  addPillar(
    7,
    5,
    6,
    sunStone,
  );

  addBox(
    0,
    6.4,
    5,
    17,
    0.8,
    1.4,
    darkStone,
    false,
  );

  addBox(
    0,
    7.25,
    5,
    12,
    0.35,
    0.9,
    goldTrim,
    false,
  );

  /* ============================================================
     RUINED HALL
     ============================================================ */

  for (
    let x = -10;
    x <= 10;
    x += 5
  ) {
    addPillar(
      x,
      -13,
      THREE.MathUtils.randFloat(
        4.8,
        6.0,
      ),
      weatheredStone,
    );
  }

  addBox(
    0,
    6.4,
    -13,
    23,
    0.65,
    1.5,
    weatheredStone,
  );

  /* Broken roof pieces */

  for (
    let i = 0;
    i < 7;
    i += 1
  ) {
    addBox(
      THREE.MathUtils.randFloat(
        -10,
        10,
      ),
      THREE.MathUtils.randFloat(
        3.7,
        5.8,
      ),
      -20 -
        THREE.MathUtils.randFloat(
          -1,
          1,
        ),
      THREE.MathUtils.randFloat(
        2,
        5,
      ),
      THREE.MathUtils.randFloat(
        0.3,
        0.8,
      ),
      THREE.MathUtils.randFloat(
        1.0,
        2.1,
      ),
      i % 2 === 0
        ? sandstone
        : weatheredStone,
      false,
      THREE.MathUtils.randFloat(
        -0.4,
        0.4,
      ),
    );
  }

  /* ============================================================
     SIDE RUINS
     ============================================================ */

  const ruinSets = [
    {
      x: -16,
      z: -28,
      scale: 1,
    },
    {
      x: 16,
      z: -31,
      scale: 1.1,
    },
    {
      x: -17,
      z: -56,
      scale: 0.9,
    },
    {
      x: 17,
      z: -60,
      scale: 1.15,
    },
    {
      x: -17,
      z: -91,
      scale: 1,
    },
    {
      x: 18,
      z: -95,
      scale: 1.05,
    },
  ];

  ruinSets.forEach(
    (ruin, index) => {
      const h =
        2.8 +
        ruin.scale *
          THREE.MathUtils.randFloat(
            1.5,
            2.8,
          );

      addBox(
        ruin.x,
        h / 2,
        ruin.z,
        6 *
          ruin.scale,
        h,
        3.5 *
          ruin.scale,
        index % 2 === 0
          ? darkStone
          : sandstone,
        false,
        THREE.MathUtils.randFloat(
          -0.12,
          0.12,
        ),
      );

      addBox(
        ruin.x,
        h + 0.18,
        ruin.z,
        4.4 *
          ruin.scale,
        0.3,
        1.0 *
          ruin.scale,
        goldTrim,
      );
    },
  );

  /* ============================================================
     STONE STEPS
     ============================================================ */

  for (
    let i = 0;
    i < 6;
    i += 1
  ) {
    addBox(
      0,
      0.15 +
        i * 0.18,
      -36 -
        i * 1.45,
      18 +
        i * 1.1,
      0.3,
      2.4,
      sandstone,
      true,
    );
  }

  /* ============================================================
     CENTRAL TEMPLE COURT
     ============================================================ */

  addBox(
    0,
    0.45,
    -45,
    34,
    0.9,
    18,
    darkStone,
  );

  addBox(
    0,
    0.95,
    -45,
    28,
    0.35,
    13,
    sunStone,
  );

  for (
    let x = -12;
    x <= 12;
    x += 4
  ) {
    addPillar(
      x,
      -46,
      THREE.MathUtils.randFloat(
        3.6,
        4.8,
      ),
      sandstone,
    );
  }

  /* ============================================================
     WATER COURT
     ============================================================ */

  const water =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        7,
        40,
      ),
      waterMat,
    );

  water.rotation.x =
    -Math.PI / 2;

  water.position.set(
    -12,
    0.06,
    -55,
  );

  water.scale.set(
    1.25,
    0.78,
    1,
  );

  worldRoot.add(water);

  disposables.push({
    geometry:
      water.geometry,
  });

  const waterGlow =
    new THREE.PointLight(
      0x5b9da0,
      graphics === 'high'
        ? 3.2
        : 2,
      14,
      2,
    );

  waterGlow.position.set(
    -12,
    1.7,
    -55,
  );

  worldRoot.add(
    waterGlow,
  );

  water.onBeforeRender = () => {
    const t =
      performance.now() *
      0.0012;

    water.material =
      waterMat;

    waterMat.opacity =
      0.78 +
      Math.sin(t) * 0.04;
  };

  /* ============================================================
     CHARIOT APPROACH
     ============================================================ */

  for (
    let i = 0;
    i < 4;
    i += 1
  ) {
    addBox(
      0,
      0.2 +
        i * 0.2,
      -57 -
        i * 2.0,
      18 +
        i * 2.5,
      0.35,
      2.2,
      sandstone,
    );
  }

  /* ============================================================
     STONE CHARIOT COURTYARD
     ============================================================ */

  addBox(
    0,
    0.38,
    -76,
    32,
    0.76,
    30,
    darkStone,
  );

  addBox(
    0,
    0.88,
    -76,
    25,
    0.28,
    23,
    goldTrim,
  );

  /* Courtyard border */

  for (
    let i = -11;
    i <= 11;
    i += 4
  ) {
    addBox(
      i,
      1.25,
      -89,
      2.5,
      0.7,
      1.2,
      sandstone,
    );

    addBox(
      i,
      1.25,
      -63,
      2.5,
      0.7,
      1.2,
      sandstone,
    );
  }

  [-11, 11].forEach(
    (x) => {
      [-84, -76, -68].forEach(
        (z) => {
          addPillar(
            x,
            z,
            3.4,
            sandstone,
          );
        },
      );
    },
  );

  /* ============================================================
     DISTANT HILLS / BOULDER FIELDS
     ============================================================ */

  const hillMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4c3020,
      roughness: 1,
    });

  disposables.push({
    material:
      hillMaterial,
  });

  const hillPositions = [
    [-58, 12, 13, 8],
    [55, 10, 16, 10],
    [-68, -35, 18, 12],
    [68, -48, 20, 13],
    [-65, -84, 22, 15],
    [65, -101, 24, 15],
  ];

  hillPositions.forEach(
    ([x, z, width, height]) => {
      const hill =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            1,
            graphics === 'high'
              ? 24
              : 16,
            graphics === 'high'
              ? 18
              : 12,
          ),
          hillMaterial,
        );

      hill.scale.set(
        width,
        height,
        width * 0.72,
      );

      hill.position.set(
        x,
        height * 0.82,
        z,
      );

      hill.castShadow =
        shadowsEnabled;

      hill.receiveShadow =
        true;

      worldRoot.add(hill);

      disposables.push({
        geometry:
          hill.geometry,
      });
    },
  );

  /* ============================================================
     BOULDERS
     ============================================================ */

  const boulders = [
    [-22, 2.0, -9, 3.4],
    [22, 2.4, -11, 3.8],
    [-26, 2.7, -35, 4.5],
    [25, 2.4, -42, 4.0],
    [-27, 2.9, -62, 4.6],
    [28, 2.5, -68, 4.2],
    [-28, 2.7, -91, 4.2],
    [28, 3.0, -102, 4.8],
    [-39, 1.8, -73, 3.3],
    [40, 1.7, -80, 3.7],
  ];

  boulders.forEach(
    ([x, y, z, scale]) => {
      addRock(
        x,
        y,
        z,
        scale,
        true,
      );
    },
  );

  /* ============================================================
     VEGETATION
     ============================================================ */

  const treePositions = [
    [-13, -3, 1.0],
    [13, -5, 1.15],
    [-19, -18, 1.2],
    [19, -20, 1.0],
    [-20, -34, 1.15],
    [20, -37, 1.1],
    [-22, -54, 1.3],
    [21, -56, 1.1],
    [-24, -72, 1.2],
    [24, -75, 1.3],
    [-23, -93, 1.15],
    [22, -98, 1.2],
    [-34, -27, 0.9],
    [34, -43, 1.0],
    [-38, -65, 0.95],
    [36, -84, 1.0],
    [-39, -104, 0.95],
  ];

  treePositions.forEach(
    ([x, z, scale], index) => {
      addTree(
        x,
        z,
        scale,
        index,
      );
    },
  );

  /* ============================================================
     EXTRA SHRUBS
     ============================================================ */

  for (
    let i = 0;
    i <
    (graphics === 'high'
      ? 28
      : graphics === 'medium'
        ? 18
        : 10);
    i += 1
  ) {
    const x =
      THREE.MathUtils.randFloat(
        -36,
        36,
      );

    const z =
      THREE.MathUtils.randFloat(
        -108,
        18,
      );

    if (
      Math.abs(x) < 8
    ) {
      continue;
    }

    const shrub =
      new THREE.Mesh(
        leafClusterGeo,
        i % 2 === 0
          ? leaf
          : leafLight,
      );

    shrub.position.set(
      x,
      0.8,
      z,
    );

    shrub.scale.set(
      THREE.MathUtils.randFloat(
        0.5,
        1.0,
      ),
      THREE.MathUtils.randFloat(
        0.35,
        0.7,
      ),
      THREE.MathUtils.randFloat(
        0.5,
        1.0,
      ),
    );

    shrub.castShadow =
      shadowsEnabled;

    shrub.receiveShadow =
      true;

    worldRoot.add(shrub);
  }

  /* ============================================================
     TORCHES
     ============================================================ */

  [
    [-8, -11],
    [8, -11],
    [-9, -45],
    [9, -45],
    [-12, -62],
    [12, -62],
    [-12, -90],
    [12, -90],
  ].forEach(
    ([x, z]) => {
      addTorch(x, z);
    },
  );

  /* ============================================================
     DUST PARTICLES
     ============================================================ */

  const dustCount =
    graphics === 'low'
      ? 0
      : graphics === 'medium'
        ? 180
        : 360;

  let dust:
    | THREE.Points
    | null = null;

  let dustGeometry:
    | THREE.BufferGeometry
    | null = null;

  let dustMaterial:
    | THREE.PointsMaterial
    | null = null;

  if (dustCount > 0) {
    const positions =
      new Float32Array(
        dustCount * 3,
      );

    for (
      let i = 0;
      i < dustCount;
      i += 1
    ) {
      positions[i * 3] =
        THREE.MathUtils.randFloat(
          -75,
          75,
        );

      positions[
        i * 3 + 1
      ] =
        THREE.MathUtils.randFloat(
          0.8,
          14,
        );

      positions[
        i * 3 + 2
      ] =
        THREE.MathUtils.randFloat(
          -118,
          28,
        );
    }

    dustGeometry =
      new THREE.BufferGeometry();

    dustGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    dustMaterial =
      new THREE.PointsMaterial({
        color: 0xe4c6a1,
        size:
          graphics === 'high'
            ? 0.075
            : 0.055,
        transparent: true,
        opacity:
          graphics === 'high'
            ? 0.32
            : 0.2,
        depthWrite: false,
        sizeAttenuation: true,
      });

    dust =
      new THREE.Points(
        dustGeometry,
        dustMaterial,
      );

    worldRoot.add(dust);

    dust.onBeforeRender = () => {
      dust!.rotation.y +=
        0.000045;
    };
  }

  /* ============================================================
     FLOATING LIGHT PARTICLES
     ============================================================ */

  const glowCount =
    graphics === 'high'
      ? 80
      : graphics === 'medium'
        ? 40
        : 0;

  if (glowCount > 0) {
    const geometry =
      new THREE.BufferGeometry();

    const positions =
      new Float32Array(
        glowCount * 3,
      );

    for (
      let i = 0;
      i < glowCount;
      i += 1
    ) {
      positions[i * 3] =
        THREE.MathUtils.randFloat(
          -30,
          30,
        );

      positions[
        i * 3 + 1
      ] =
        THREE.MathUtils.randFloat(
          1,
          7,
        );

      positions[
        i * 3 + 2
      ] =
        THREE.MathUtils.randFloat(
          -95,
          -5,
        );
    }

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    const material =
      new THREE.PointsMaterial({
        color: 0xffd28b,
        size: 0.09,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      });

    const glow =
      new THREE.Points(
        geometry,
        material,
      );

    worldRoot.add(glow);

    glow.onBeforeRender = () => {
      glow.rotation.y +=
        0.00008;

      const pulse =
        0.8 +
        Math.sin(
          performance.now() *
            0.0015,
        ) *
          0.12;

      material.opacity =
        pulse * 0.65;
    };

    disposables.push({
      geometry,
      material,
    });
  }

  /* ============================================================
     DECORATIVE STONE BORDERS
     ============================================================ */

  for (
    let z = 3;
    z >= -106;
    z -= 5
  ) {
    addBox(
      -8.3,
      0.35,
      z,
      0.65,
      0.7,
      2.7,
      weatheredStone,
      false,
    );

    addBox(
      8.3,
      0.35,
      z,
      0.65,
      0.7,
      2.7,
      weatheredStone,
      false,
    );
  }

  /* ============================================================
     LOW COLLISION OBJECTS
     ============================================================ */

  /*
   * We intentionally keep the collision boxes
   * relatively low. The current player physics
   * can interpret a tall collider's top as a
   * walkable surface.
   */

  addBox(
    -4.8,
    0.4,
    -18,
    1.6,
    0.8,
    2.0,
    darkStone,
    true,
  );

  addBox(
    4.8,
    0.35,
    -25,
    1.5,
    0.7,
    2.0,
    darkStone,
    true,
  );

  addBox(
    -5.2,
    0.35,
    -51,
    1.5,
    0.7,
    2.0,
    darkStone,
    true,
  );

  addBox(
    5.4,
    0.4,
    -59,
    1.7,
    0.8,
    2.2,
    darkStone,
    true,
  );

  /* ============================================================
     LANDMARK LIGHT
     ============================================================ */

  const landmarkLight =
    new THREE.PointLight(
      0xffbd6b,
      graphics === 'high'
        ? 8
        : 5.5,
      42,
      2,
    );

  landmarkLight.position.set(
    0,
    8,
    -76,
  );

  worldRoot.add(
    landmarkLight,
  );

  /* ============================================================
     CLEANUP
     ============================================================ */

  const cleanup = () => {
    scene.remove(
      worldRoot,
    );

    disposables.forEach(
      (resource) => {
        resource.geometry?.dispose();

        if (
          Array.isArray(
            resource.material,
          )
        ) {
          resource.material.forEach(
            (material) => {
              material.dispose();
            },
          );
        } else {
          resource.material?.dispose();
        }
      },
    );

    /*
     * Dispose shadow maps when available.
     */
    if (sun.shadow.map) {
      sun.shadow.map.dispose();
    }

    trees.length = 0;
    colliders.length = 0;
  };

  return {
    trees,
    colliders,
    cleanup,
  };
}