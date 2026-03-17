import * as THREE from 'three';

export class BankEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this._build();
    scene.add(this.group);
  }

  _build() {
    this._createFloor();
    this._createWalls();
    this._createDesk();
    this._createChair();
    this._createDecorations();
    this._createLighting();
  }

  _createFloor() {
    // Main floor — dark marble look
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2c2c3e,
      roughness: 0.3,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Floor trim / carpet under desk area
    const carpetGeo = new THREE.PlaneGeometry(4, 6);
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x1a3a5c,
      roughness: 0.8,
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.005, 1);
    this.group.add(carpet);
  }

  _createWalls() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e2a3a,
      roughness: 0.7,
      metalness: 0.05,
    });

    // Back wall
    const backWallGeo = new THREE.PlaneGeometry(14, 5);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 2.5, -4);
    backWall.receiveShadow = true;
    this.group.add(backWall);

    // Left wall
    const sideWallGeo = new THREE.PlaneGeometry(14, 5);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.position.set(-7, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    this.group.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.position.set(7, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    this.group.add(rightWall);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(14, 14);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1a1f2e,
      roughness: 0.9,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5;
    this.group.add(ceiling);

    // Wainscoting/trim on back wall
    const trimGeo = new THREE.BoxGeometry(14, 0.15, 0.05);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.4,
      metalness: 0.3,
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, 1.2, -3.97);
    this.group.add(trim);

    // Wall sign: "FIRST NATIONAL BANK"
    this._createWallSign();
  }

  _createWallSign() {
    const signGeo = new THREE.BoxGeometry(4, 0.8, 0.1);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.5,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 3.8, -3.92);
    this.group.add(sign);

    // Gold border around sign
    const borderGeo = new THREE.BoxGeometry(4.2, 1, 0.08);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.6,
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 3.8, -3.95);
    this.group.add(border);

    // Text using canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#d4a843';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FIRST NATIONAL BANK', 256, 64);
    const textTexture = new THREE.CanvasTexture(canvas);
    const textGeo = new THREE.PlaneGeometry(3.8, 0.7);
    const textMat = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(0, 3.8, -3.88);
    this.group.add(textMesh);
  }

  _createDesk() {
    // Main desk surface
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Desktop
    const topGeo = new THREE.BoxGeometry(3.5, 0.1, 1.4);
    const top = new THREE.Mesh(topGeo, deskMat);
    top.position.set(0, 1.0, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    this.group.add(top);

    // Front panel
    const frontGeo = new THREE.BoxGeometry(3.5, 1.0, 0.08);
    const front = new THREE.Mesh(frontGeo, deskMat);
    front.position.set(0, 0.5, 0.7);
    front.castShadow = true;
    this.group.add(front);

    // Side panels
    const sideGeo = new THREE.BoxGeometry(0.08, 1.0, 1.4);
    const left = new THREE.Mesh(sideGeo, deskMat);
    left.position.set(-1.75, 0.5, 0);
    left.castShadow = true;
    this.group.add(left);

    const right = new THREE.Mesh(sideGeo, deskMat);
    right.position.set(1.75, 0.5, 0);
    right.castShadow = true;
    this.group.add(right);

    // Gold desk trim
    const deskTrimGeo = new THREE.BoxGeometry(3.6, 0.03, 0.04);
    const deskTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.5,
    });
    const deskTrim = new THREE.Mesh(deskTrimGeo, deskTrimMat);
    deskTrim.position.set(0, 1.05, 0.72);
    this.group.add(deskTrim);

    // Items on desk: computer monitor, keyboard, pen holder
    this._createDeskItems();
  }

  _createDeskItems() {
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.3,
      metalness: 0.4,
    });

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(0.8, 0.6, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, darkMat);
    monitor.position.set(-0.8, 1.45, -0.2);
    monitor.castShadow = true;
    this.group.add(monitor);

    // Monitor screen (glowing)
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      emissive: 0x1e40af,
      emissiveIntensity: 0.3,
      roughness: 0.1,
    });
    const screenGeo = new THREE.PlaneGeometry(0.7, 0.5);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.8, 1.45, -0.17);
    this.group.add(screen);

    // Monitor stand
    const standGeo = new THREE.CylinderGeometry(0.03, 0.08, 0.2, 8);
    const stand = new THREE.Mesh(standGeo, darkMat);
    stand.position.set(-0.8, 1.1, -0.2);
    this.group.add(stand);

    // Keyboard
    const kbGeo = new THREE.BoxGeometry(0.5, 0.02, 0.18);
    const kb = new THREE.Mesh(kbGeo, darkMat);
    kb.position.set(-0.8, 1.06, 0.15);
    this.group.add(kb);

    // Pen holder
    const penHolderGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.12, 12);
    const penHolderMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.5,
    });
    const penHolder = new THREE.Mesh(penHolderGeo, penHolderMat);
    penHolder.position.set(1.2, 1.11, -0.1);
    this.group.add(penHolder);

    // Paper stack
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
    const paperGeo = new THREE.BoxGeometry(0.3, 0.04, 0.4);
    const papers = new THREE.Mesh(paperGeo, paperMat);
    papers.position.set(0.8, 1.07, 0.1);
    this.group.add(papers);

    // Nameplate
    const nameplateGeo = new THREE.BoxGeometry(0.5, 0.12, 0.08);
    const nameplateMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.6,
    });
    const nameplate = new THREE.Mesh(nameplateGeo, nameplateMat);
    nameplate.position.set(0.3, 1.11, 0.5);
    this.group.add(nameplate);
  }

  _createChair() {
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.6,
      metalness: 0.2,
    });

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.6, 0.08, 0.5);
    const seat = new THREE.Mesh(seatGeo, chairMat);
    seat.position.set(0, 0.7, -1.2);
    this.group.add(seat);

    // Back
    const backGeo = new THREE.BoxGeometry(0.6, 0.8, 0.08);
    const back = new THREE.Mesh(backGeo, chairMat);
    back.position.set(0, 1.15, -1.45);
    this.group.add(back);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, metalness: 0.6 });
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6);
    const offsets = [[-0.25, -0.2], [0.25, -0.2], [-0.25, 0.2], [0.25, 0.2]];
    for (const [x, z] of offsets) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.35, -1.2 + z);
      this.group.add(leg);
    }
  }

  _createDecorations() {
    // Potted plant on the left side
    const potMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
    const potGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.35, 12);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(-3, 0.175, -2.5);
    this.group.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 });
    for (let i = 0; i < 5; i++) {
      const leafGeo = new THREE.SphereGeometry(0.2, 8, 6);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(
        -3 + (Math.random() - 0.5) * 0.3,
        0.5 + i * 0.15,
        -2.5 + (Math.random() - 0.5) * 0.3
      );
      leaf.scale.set(1, 0.7, 1);
      this.group.add(leaf);
    }

    // Filing cabinet on the right side
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.5,
      metalness: 0.3,
    });
    const cabinetGeo = new THREE.BoxGeometry(0.7, 1.5, 0.5);
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.set(3, 0.75, -3);
    cabinet.castShadow = true;
    this.group.add(cabinet);

    // Cabinet drawer handles
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      metalness: 0.7,
    });
    for (let i = 0; i < 3; i++) {
      const handleGeo = new THREE.BoxGeometry(0.15, 0.02, 0.04);
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(3, 0.3 + i * 0.5, -2.73);
      this.group.add(handle);
    }

    // Picture frame on back wall
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.5,
    });
    const frameGeo = new THREE.BoxGeometry(1.2, 0.9, 0.05);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(-2.5, 2.8, -3.95);
    this.group.add(frame);

    const pictureMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      roughness: 0.7,
    });
    const pictureGeo = new THREE.PlaneGeometry(1.0, 0.7);
    const picture = new THREE.Mesh(pictureGeo, pictureMat);
    picture.position.set(-2.5, 2.8, -3.91);
    this.group.add(picture);
  }

  _createLighting() {
    // Ambient — soft fill
    const ambient = new THREE.AmbientLight(0x4a5568, 0.4);
    this.scene.add(ambient);

    // Main overhead warm light
    const mainLight = new THREE.PointLight(0xffd699, 1.5, 15);
    mainLight.position.set(0, 4.5, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    this.scene.add(mainLight);

    // Desk spotlight
    const deskSpot = new THREE.SpotLight(0xffeedd, 2, 8, Math.PI / 6, 0.5, 1.5);
    deskSpot.position.set(0, 4, 1);
    deskSpot.target.position.set(0, 1, 0);
    deskSpot.castShadow = true;
    this.scene.add(deskSpot);
    this.scene.add(deskSpot.target);

    // Accent lights for atmosphere
    const accentLeft = new THREE.PointLight(0x3b82f6, 0.4, 8);
    accentLeft.position.set(-4, 3, -2);
    this.scene.add(accentLeft);

    const accentRight = new THREE.PointLight(0x6366f1, 0.3, 8);
    accentRight.position.set(4, 3, -2);
    this.scene.add(accentRight);

    // Subtle backlight on the sign
    const signLight = new THREE.SpotLight(0xd4a843, 1, 6, Math.PI / 8, 0.5, 2);
    signLight.position.set(0, 4.8, -2);
    signLight.target.position.set(0, 3.8, -4);
    this.scene.add(signLight);
    this.scene.add(signLight.target);
  }
}
