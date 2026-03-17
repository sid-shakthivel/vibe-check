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
    // Main floor — warm wood or linoleum look
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355, // Warm wooden floor color
      roughness: 0.8,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Floor trim / carpet under desk area
    const carpetGeo = new THREE.PlaneGeometry(5, 7);
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x6e7f60, // Lighter olive green carpet
      roughness: 1.0,
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.005, 1);
    this.group.add(carpet);
  }

  _createWalls() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x829074, // Lighter, warm olive green for walls (like the image)
      roughness: 0.9,
      metalness: 0.0,
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
      color: 0xe8e4c9, // Warm cream ceiling
      roughness: 1.0,
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
    ctx.fillText('VIBE BANK', 256, 64);
    const textTexture = new THREE.CanvasTexture(canvas);
    const textGeo = new THREE.PlaneGeometry(3.8, 0.7);
    const textMat = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(0, 3.8, -3.88);
    this.group.add(textMesh);
  }

  _createDesk() {
    // Main desk surface — lighter, warmer wood
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x6b4a31, // Warm brown wood
      roughness: 0.7,
      metalness: 0.0,
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
      color: 0xdcd6bc, // Cream/beige retro computer color
      roughness: 0.8,
      metalness: 0.1,
    });

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(0.8, 0.6, 0.4); // Thicker, older CRT style monitor
    const monitor = new THREE.Mesh(monitorGeo, darkMat);
    monitor.position.set(-0.9, 1.45, -0.3);
    monitor.castShadow = true;
    this.group.add(monitor);

    // Monitor screen (retro green text on dark bg)
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x113311,
      emissive: 0x225522,
      emissiveIntensity: 0.8,
      roughness: 0.5,
    });
    const screenGeo = new THREE.PlaneGeometry(0.7, 0.5);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.9, 1.45, -0.09);
    this.group.add(screen);

    // Monitor stand
    const standGeo = new THREE.BoxGeometry(0.4, 0.2, 0.3); // Blockier stand
    const stand = new THREE.Mesh(standGeo, darkMat);
    stand.position.set(-0.9, 1.1, -0.3);
    this.group.add(stand);

    // Keyboard
    const kbGeo = new THREE.BoxGeometry(0.5, 0.04, 0.2);
    const kb = new THREE.Mesh(kbGeo, darkMat);
    kb.position.set(-0.8, 1.07, 0.15);
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

    // Paper stack (side)
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide });
    const paperGeo = new THREE.BoxGeometry(0.3, 0.04, 0.4);
    const papers = new THREE.Mesh(paperGeo, paperMat);
    papers.position.set(0.8, 1.07, 0.1);
    this.group.add(papers);

    // Scattered papers in front of manager (for him to write on)
    const thinPaperGeo = new THREE.PlaneGeometry(0.35, 0.45);
    
    const paper1 = new THREE.Mesh(thinPaperGeo, paperMat);
    paper1.rotation.x = -Math.PI / 2;
    paper1.rotation.z = 0.1;
    paper1.position.set(0.3, 1.051, 0.3);
    this.group.add(paper1);

    const paper2 = new THREE.Mesh(thinPaperGeo, paperMat);
    paper2.rotation.x = -Math.PI / 2;
    paper2.rotation.z = -0.2;
    paper2.position.set(0.2, 1.052, 0.25);
    this.group.add(paper2);

    const paper3 = new THREE.Mesh(thinPaperGeo, paperMat);
    paper3.rotation.x = -Math.PI / 2;
    paper3.rotation.z = 0.05;
    paper3.position.set(0.35, 1.053, 0.2);
    this.group.add(paper3);

    // Nameplate
    const nameplateGeo = new THREE.BoxGeometry(0.5, 0.12, 0.08);
    const nameplateMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.6,
    });
    const nameplate = new THREE.Mesh(nameplateGeo, nameplateMat);
    nameplate.position.set(0.4, 1.11, 0.5);
    this.group.add(nameplate);

    // Piggy Bank
    const piggyMat = new THREE.MeshStandardMaterial({
      color: 0xffadc9, // Cute pink
      roughness: 0.4,
      metalness: 0.1,
    });
    // Body
    const piggyGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const piggy = new THREE.Mesh(piggyGeo, piggyMat);
    piggy.position.set(-1.4, 1.25, 0.2);
    piggy.scale.set(1.2, 1, 1);
    this.group.add(piggy);
    
    // Piggy snout
    const snoutGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
    const snout = new THREE.Mesh(snoutGeo, piggyMat);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(-1.25, 1.25, 0.2);
    this.group.add(snout);

    // Piggy ears
    const earGeo = new THREE.ConeGeometry(0.04, 0.08, 4);
    const leftEar = new THREE.Mesh(earGeo, piggyMat);
    leftEar.position.set(-1.3, 1.4, 0.1);
    leftEar.rotation.x = -Math.PI / 8;
    this.group.add(leftEar);
    const rightEar = new THREE.Mesh(earGeo, piggyMat);
    rightEar.position.set(-1.3, 1.4, 0.3);
    rightEar.rotation.x = Math.PI / 8;
    this.group.add(rightEar);

    // Rubber Stamp
    const stampBaseMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
    const stampHandleMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.4 }); // Dark red handle
    
    const stampBaseGeo = new THREE.BoxGeometry(0.15, 0.05, 0.1);
    const stampBase = new THREE.Mesh(stampBaseGeo, stampBaseMat);
    stampBase.position.set(0.9, 1.075, 0.5);
    this.group.add(stampBase);

    const stampHandleGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.15, 12);
    const stampHandle = new THREE.Mesh(stampHandleGeo, stampHandleMat);
    stampHandle.position.set(0.9, 1.17, 0.5);
    this.group.add(stampHandle);

    // Ink Pad
    const inkPadBoxGeo = new THREE.BoxGeometry(0.25, 0.04, 0.15);
    const inkPadBox = new THREE.Mesh(inkPadBoxGeo, stampBaseMat);
    inkPadBox.position.set(1.2, 1.07, 0.5);
    this.group.add(inkPadBox);

    const inkGeo = new THREE.PlaneGeometry(0.2, 0.1);
    const inkMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.2 }); // Red ink
    const ink = new THREE.Mesh(inkGeo, inkMat);
    ink.rotation.x = -Math.PI / 2;
    ink.position.set(1.2, 1.091, 0.5);
    this.group.add(ink);

    // Calculator / Adding Machine
    const calcMat = new THREE.MeshStandardMaterial({ color: 0xdcd6bc, roughness: 0.8 });
    const calcGeo = new THREE.BoxGeometry(0.3, 0.15, 0.4);
    const calc = new THREE.Mesh(calcGeo, calcMat);
    calc.position.set(-1.4, 1.12, 0.7);
    // Slope the calculator
    calc.rotation.x = Math.PI / 12;
    this.group.add(calc);

    // More scattered documents
    const whiteDocMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const yellowDocMat = new THREE.MeshStandardMaterial({ color: 0xfdf7d5, roughness: 0.9 }); // Manilla folder color
    
    const doc1 = new THREE.Mesh(paperGeo, whiteDocMat);
    doc1.position.set(0.2, 1.06, 0.3);
    doc1.rotation.y = 0.2;
    this.group.add(doc1);

    const doc2 = new THREE.Mesh(paperGeo, yellowDocMat);
    doc2.position.set(0.3, 1.07, 0.3);
    doc2.rotation.y = -0.1;
    this.group.add(doc2);
  }

  _createChair() {
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x5a4634, // Warm brown leather
      roughness: 0.6,
      metalness: 0.1,
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
      color: 0x727d66, // Light olive/gray matching walls
      roughness: 0.7,
      metalness: 0.1,
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
    // Ambient — brighter, warmer fill for a positive atmosphere
    const ambient = new THREE.AmbientLight(0xfff5e6, 1.2);
    this.scene.add(ambient);

    // Main overhead warm light (like sunlight coming through a window)
    const mainLight = new THREE.PointLight(0xffeedd, 2.5, 20);
    mainLight.position.set(0, 4.5, 2);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.001;
    this.scene.add(mainLight);

    // Desk lamp light (warm, inviting)
    const deskSpot = new THREE.SpotLight(0xffddaa, 2.5, 8, Math.PI / 4, 0.5, 1.0);
    deskSpot.position.set(-1.5, 3, 1);
    deskSpot.target.position.set(0, 1, 0);
    deskSpot.castShadow = true;
    this.scene.add(deskSpot);
    this.scene.add(deskSpot.target);

    // Accent lights (warm bounces instead of sci-fi blue/purple)
    const accentLeft = new THREE.PointLight(0xffeeba, 0.8, 8);
    accentLeft.position.set(-4, 3, -1);
    this.scene.add(accentLeft);

    const accentRight = new THREE.PointLight(0xfff0cc, 0.8, 8);
    accentRight.position.set(4, 3, -1);
    this.scene.add(accentRight);
  }
}
