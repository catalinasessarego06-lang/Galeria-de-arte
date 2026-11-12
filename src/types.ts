/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BoundingBox2D {
  x: number; // 0 to 1 (from left)
  y: number; // 0 to 1 (from top)
  w: number; // width in 0 to 1
  h: number; // height in 0 to 1
}

export interface ArtworkData {
  id: string;
  title: string;
  artist: string;
  year: string;
  roomName: string;
  isPinkFrame: boolean;
  frameColor: string;
  description: string;
  intruderName: string;
  intruderDescription: string;
  intruderBox: BoundingBox2D; // Normalized coordinates on the painting texture
  found: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  imageSrc?: string;
  intruderSrc?: string;
  canvasTexture?: any;
}

export interface AppSensors {
  gyroscopeAllowed: boolean;
  gyroscopeActive: boolean;
  micAllowed: boolean;
  cameraAllowed: boolean;
}

export interface OrientationData {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface AudioMetrics {
  volume: number;
  bassLevel: number;
}

export interface WallCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
