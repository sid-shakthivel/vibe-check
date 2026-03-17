import * as THREE from 'three';

export class BankManager {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this._animationState = 'idle';
    this._animTimer = 0;

    this._build();
    this.group.position.set(0, 0, -1.0);
    scene.add(this.group);
  }

  _build() {
    // Skin material
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd4a07a,
      roughness: 0.7,
      metalness: 0.0,
    });

    // Suit material (dark navy)
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1a1f3a,
      roughness: 0.6,
      metalness: 0.1,
    });

    // Shirt material
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
    });

    // Tie material
    const tieMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.5,
    });

    // --- BODY (torso) ---
    const torsoGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.8, 12);
    this.torso = new THREE.Mesh(torsoGeo, suitMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Shirt collar area
    const collarGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.12, 10);
    const collar = new THREE.Mesh(collarGeo, shirtMat);
    collar.position.y = 1.78;
    this.group.add(collar);

    // Tie
    const tieGeo = new THREE.BoxGeometry(0.06, 0.4, 0.03);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.5, 0.22);
    this.group.add(tie);

    // --- HEAD ---
    const headGeo = new THREE.SphereGeometry(0.2, 16, 14);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 2.0;
    this.head.scale.set(1, 1.1, 1);
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x2c2c2c,
      roughness: 0.9,
    });
    const hairGeo = new THREE.SphereGeometry(0.21, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.02;
    hair.scale.set(1, 1, 1);
    this.group.add(hair);

    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.3 });

    // Left eye
    const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.07, 2.03, 0.17);
    this.group.add(leftEye);

    const pupilGeo = new THREE.SphereGeometry(0.018, 6, 6);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.07, 2.03, 0.2);
    this.group.add(leftPupil);

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.07, 2.03, 0.17);
    this.group.add(rightEye);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.07, 2.03, 0.2);
    this.group.add(rightPupil);

    // Glasses
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.6,
    });
    // Glasses bridge
    const bridgeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.1, 6);
    const bridge = new THREE.Mesh(bridgeGeo, glassMat);
    bridge.position.set(0, 2.03, 0.19);
    bridge.rotation.z = Math.PI / 2;
    this.group.add(bridge);

    // Glasses rims (torus)
    const rimGeo = new THREE.TorusGeometry(0.04, 0.005, 8, 16);
    const leftRim = new THREE.Mesh(rimGeo, glassMat);
    leftRim.position.set(-0.07, 2.03, 0.19);
    this.group.add(leftRim);

    const rightRim = new THREE.Mesh(rimGeo, glassMat);
    rightRim.position.set(0.07, 2.03, 0.19);
    this.group.add(rightRim);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, 1.97, 0.2);
    this.group.add(nose);

    // Mouth (subtle)
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xb07d62, roughness: 0.8 });
    const mouthGeo = new THREE.BoxGeometry(0.06, 0.01, 0.01);
    this.mouth = new THREE.Mesh(mouthGeo, mouthMat);
    this.mouth.position.set(0, 1.91, 0.19);
    this.group.add(this.mouth);

    // --- ARMS ---
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.55, 8);

    // Left arm
    this.leftArm = new THREE.Mesh(armGeo, suitMat);
    this.leftArm.position.set(-0.35, 1.3, 0);
    this.leftArm.rotation.z = 0.15;
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    // Right arm
    this.rightArm = new THREE.Mesh(armGeo, suitMat);
    this.rightArm.position.set(0.35, 1.3, 0);
    this.rightArm.rotation.z = -0.15;
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    // Hands
    const handGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(-0.38, 1.0, 0);
    this.group.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0.38, 1.0, 0);
    this.group.add(rightHand);

    // --- LEGS (below desk, partially visible) ---
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 8);
    const leftLeg = new THREE.Mesh(legGeo, suitMat);
    leftLeg.position.set(-0.12, 0.55, -0.05);
    this.group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, suitMat);
    rightLeg.position.set(0.12, 0.55, -0.05);
    this.group.add(rightLeg);

    // Shoes
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
    const shoeGeo = new THREE.BoxGeometry(0.1, 0.06, 0.16);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.12, 0.2, 0.02);
    this.group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.12, 0.2, 0.02);
    this.group.add(rightShoe);
  }

  setAnimation(state) {
    this._animationState = state;
    this._animTimer = 0;
  }

  update(delta, elapsed) {
    this._animTimer += delta;

    switch (this._animationState) {
      case 'idle':
        // Subtle breathing / bobbing
        this.torso.position.y = 1.35 + Math.sin(elapsed * 1.5) * 0.01;
        this.head.position.y = 2.0 + Math.sin(elapsed * 1.5) * 0.01;
        this.head.rotation.y = Math.sin(elapsed * 0.5) * 0.05;
        break;

      case 'nod':
        // Approving nod
        this.head.rotation.x = Math.sin(this._animTimer * 6) * 0.15;
        if (this._animTimer > 1.5) {
          this.head.rotation.x = 0;
          this._animationState = 'idle';
        }
        break;

      case 'shake':
        // Disapproving head shake
        this.head.rotation.y = Math.sin(this._animTimer * 8) * 0.2;
        if (this._animTimer > 1.5) {
          this.head.rotation.y = 0;
          this._animationState = 'idle';
        }
        break;

      case 'thinking':
        // Tilt head and look down at papers
        this.head.rotation.x = 0.1;
        this.head.rotation.z = Math.sin(elapsed * 2) * 0.05;
        this.rightArm.rotation.z = -0.15 + Math.sin(elapsed * 1.5) * 0.05;
        break;

      case 'welcome':
        // Small wave / open arms gesture
        this.leftArm.rotation.z = 0.15 + Math.sin(this._animTimer * 3) * 0.2;
        this.rightArm.rotation.z = -0.15 - Math.sin(this._animTimer * 3) * 0.2;
        if (this._animTimer > 2) {
          this.leftArm.rotation.z = 0.15;
          this.rightArm.rotation.z = -0.15;
          this._animationState = 'idle';
        }
        break;
    }
  }
}
