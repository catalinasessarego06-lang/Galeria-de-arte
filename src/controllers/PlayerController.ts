/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ArtworkData, OrientationData, WallCollider } from '../types';

export interface InteractionResult {
  hit: boolean;
  artworkId?: string;
  artwork?: ArtworkData;
  isIntruder?: boolean;
  uv?: { u: number; v: number };
}

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private colliders: WallCollider[] = [];
  private artworks: Map<string, ArtworkData> = new Map();
  private artworkMeshes: Map<string, THREE.Mesh> = new Map();

  // Position & Velocity
  public position: THREE.Vector3 = new THREE.Vector3(0, 1.65, 2.3); // Start in central atrium facing north
  public velocity: THREE.Vector3 = new THREE.Vector3();
  private eyeHeight: number = 1.65;
  private moveSpeed: number = 4.2;

  // Angles (in radians)
  public yaw: number = 0; // Left-Right
  public pitch: number = 0; // Up-Down
  private targetYaw: number = 0;
  private targetPitch: number = 0;

  // Gyroscope tracking
  public gyroActive: boolean = false;
  private baseGyroAlpha: number | null = null;
  private gyroOrientation: OrientationData = { alpha: 0, beta: 0, gamma: 0 };
  private gyroDeltaYaw: number = 0;
  private gyroDeltaPitch: number = 0;

  // Input states
  private keys: Record<string, boolean> = {};
  public joystickInput: { x: number; y: number } = { x: 0, y: 0 };
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  // Smooth transition target (for teleport / inspection)
  private transitionTarget: { pos: THREE.Vector3; yaw: number; pitch: number } | null = null;

  // Footstep callback
  public onStep?: () => void;
  private distanceTraveled: number = 0;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';

    this.bindEvents();
  }

  public setColliders(colliders: WallCollider[]) {
    this.colliders = colliders;
  }

  public setArtworks(artworks: ArtworkData[], meshes: Map<string, THREE.Mesh>) {
    this.artworks.clear();
    artworks.forEach((a) => this.artworks.set(a.id, a));
    this.artworkMeshes = meshes;
  }

  private bindEvents() {
    // Keyboard
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Mouse / Touch Look
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    // Device Orientation listener
    window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
  }

  public dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation, true);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    this.transitionTarget = null; // User interrupted transition
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    // Only capture look if not clicking on UI buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-ui-interactive]')) {
      return;
    }
    this.isPointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.transitionTarget = null;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const deltaX = e.clientX - this.lastPointerX;
    const deltaY = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    const sensitivity = 0.0032;
    this.targetYaw -= deltaX * sensitivity;
    this.targetPitch -= deltaY * sensitivity;
    this.targetPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.targetPitch));
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  public handleLookDelta(deltaX: number, deltaY: number) {
    const sensitivity = 0.004;
    this.targetYaw -= deltaX * sensitivity;
    this.targetPitch -= deltaY * sensitivity;
    this.targetPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.targetPitch));
    this.transitionTarget = null;
  }

  private onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!this.gyroActive || event.alpha === null || event.beta === null || event.gamma === null) {
      return;
    }

    if (this.baseGyroAlpha === null) {
      this.baseGyroAlpha = event.alpha;
    }

    this.gyroOrientation = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    };

    // Calculate delta from initial orientation
    const yawAngle = ((event.alpha - this.baseGyroAlpha) * Math.PI) / 180;
    // Beta is pitch (-180 to 180). Usually ~45-90 deg when holding phone upright
    const pitchAngle = ((event.beta - 65) * Math.PI) / 180;

    this.gyroDeltaYaw = yawAngle;
    this.gyroDeltaPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, pitchAngle));
  };

  public async requestGyroPermission(): Promise<boolean> {
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation?.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          this.gyroActive = true;
          this.baseGyroAlpha = null;
          return true;
        }
        return false;
      } catch {
        return false;
      }
    } else {
      // Android / non-iOS permissions are granted by default
      this.gyroActive = true;
      this.baseGyroAlpha = null;
      return true;
    }
  }

  public toggleGyro() {
    this.gyroActive = !this.gyroActive;
    if (this.gyroActive) {
      this.baseGyroAlpha = null;
    }
  }

  public getGyroState(): { active: boolean; orientation: OrientationData } {
    return {
      active: this.gyroActive,
      orientation: this.gyroOrientation,
    };
  }

  /**
   * Raycast check when user taps on screen
   */
  public checkTapInteraction(clientX: number, clientY: number): InteractionResult {
    const rect = this.domElement.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

    // Filter canvas meshes
    const meshes = Array.from(this.artworkMeshes.values());
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length === 0) {
      return { hit: false };
    }

    const hit = intersects[0];
    const uv = hit.uv;
    if (!uv) {
      return { hit: true, isIntruder: false };
    }

    // Find corresponding artwork
    let hitArtwork: ArtworkData | undefined;
    for (const [id, mesh] of this.artworkMeshes.entries()) {
      if (mesh === hit.object) {
        hitArtwork = this.artworks.get(id);
        break;
      }
    }

    if (!hitArtwork) {
      return { hit: true, isIntruder: false };
    }

    // Check if UV coordinates match the intruder box
    // Note: Three.js Plane UV: u is 0..1 (left to right), v is 0..1 (bottom to top)
    // Artwork intruderBox: x: 0..1 (from left), y: 0..1 (from top)
    // So UV mapping: u matches x, (1.0 - v) matches y
    const box = hitArtwork.intruderBox;
    const clickU = uv.x;
    const clickV = uv.y;

    const targetUMin = box.x;
    const targetUMax = box.x + box.w;
    // Invert V because texture Y is from top down
    const targetVMin = 1.0 - (box.y + box.h);
    const targetVMax = 1.0 - box.y;

    // Strict margin: user must tap directly on the intruder element, not to the side (±1.5%)
    const margin = 0.015;
    const isInsideU = clickU >= targetUMin - margin && clickU <= targetUMax + margin;
    const isInsideV = clickV >= targetVMin - margin && clickV <= targetVMax + margin;

    const isIntruder = isInsideU && isInsideV;

    return {
      hit: true,
      artworkId: hitArtwork.id,
      artwork: hitArtwork,
      isIntruder,
      uv: { u: clickU, v: clickV },
    };
  }

  /**
   * Smoothly navigates the player to inspect an artwork
   */
  public navigateToArtwork(artwork: ArtworkData) {
    const artPos = new THREE.Vector3(...artwork.position);
    const rot = new THREE.Euler(...artwork.rotation);

    // Calculate position ~1.85 meters in front of the artwork
    const forward = new THREE.Vector3(0, 0, 1).applyEuler(rot);
    const targetPos = artPos.clone().add(forward.multiplyScalar(1.85));
    targetPos.y = this.eyeHeight;

    // Look directly at artwork center
    const lookDir = artPos.clone().sub(targetPos).normalize();
    const targetYaw = Math.atan2(-lookDir.x, -lookDir.z);
    const targetPitch = Math.asin(lookDir.y);

    this.transitionTarget = {
      pos: targetPos,
      yaw: targetYaw,
      pitch: targetPitch,
    };
  }

  public update(delta: number) {
    // 1. If undergoing smooth transition
    if (this.transitionTarget) {
      const lambda = 4.5;
      this.position.x = THREE.MathUtils.damp(this.position.x, this.transitionTarget.pos.x, lambda, delta);
      this.position.y = THREE.MathUtils.damp(this.position.y, this.transitionTarget.pos.y, lambda, delta);
      this.position.z = THREE.MathUtils.damp(this.position.z, this.transitionTarget.pos.z, lambda, delta);

      this.yaw = THREE.MathUtils.damp(this.yaw, this.transitionTarget.yaw, lambda, delta);
      this.pitch = THREE.MathUtils.damp(this.pitch, this.transitionTarget.pitch, lambda, delta);
      this.targetYaw = this.yaw;
      this.targetPitch = this.pitch;

      if (this.position.distanceTo(this.transitionTarget.pos) < 0.08) {
        this.transitionTarget = null;
      }
    } else {
      // 2. Normal User Movement
      // Calculate movement input
      let moveForward = 0;
      let moveRight = 0;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveForward += 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveForward -= 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveRight -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveRight += 1;

      // Add mobile joystick
      moveRight += this.joystickInput.x;
      moveForward -= this.joystickInput.y; // Joystick up is negative Y

      // Normalize movement vector
      const inputLen = Math.hypot(moveForward, moveRight);
      if (inputLen > 1) {
        moveForward /= inputLen;
        moveRight /= inputLen;
      }

      // Convert local input to world velocity using current yaw
      const forwardDir = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const rightDir = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

      const targetVelocity = forwardDir
        .multiplyScalar(moveForward)
        .add(rightDir.multiplyScalar(moveRight))
        .multiplyScalar(this.moveSpeed);

      // Damp velocity
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, targetVelocity.x, 8.0, delta);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, targetVelocity.z, 8.0, delta);

      // Desired new position
      const nextX = this.position.x + this.velocity.x * delta;
      const nextZ = this.position.z + this.velocity.z * delta;

      // Check wall collision with sliding
      let allowedX = nextX;
      let allowedZ = nextZ;

      for (const col of this.colliders) {
        if (allowedX >= col.minX && allowedX <= col.maxX && this.position.z >= col.minZ && this.position.z <= col.maxZ) {
          allowedX = this.position.x; // Block X movement
        }
        if (this.position.x >= col.minX && this.position.x <= col.maxX && allowedZ >= col.minZ && allowedZ <= col.maxZ) {
          allowedZ = this.position.z; // Block Z movement
        }
      }

      const movedDist = Math.hypot(allowedX - this.position.x, allowedZ - this.position.z);
      this.position.x = allowedX;
      this.position.z = allowedZ;
      this.position.y = this.eyeHeight;

      // Footstep sound trigger
      if (movedDist > 0.001) {
        this.distanceTraveled += movedDist;
        if (this.distanceTraveled > 1.3) {
          this.distanceTraveled = 0;
          this.onStep?.();
        }
      }

      // Smooth camera angles
      this.yaw = THREE.MathUtils.damp(this.yaw, this.targetYaw, 14.0, delta);
      this.pitch = THREE.MathUtils.damp(this.pitch, this.targetPitch, 14.0, delta);
    }

    // Apply orientation to camera (combining manual look + gyroscope if enabled)
    const effectiveYaw = this.yaw + (this.gyroActive ? this.gyroDeltaYaw : 0);
    const effectivePitch = this.pitch + (this.gyroActive ? this.gyroDeltaPitch : 0);

    this.camera.position.copy(this.position);
    this.camera.rotation.y = effectiveYaw;
    this.camera.rotation.x = effectivePitch;
    this.camera.rotation.z = 0;
  }
}
