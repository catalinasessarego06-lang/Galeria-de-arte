/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ArtworkData, WallCollider } from '../types';
import { GALLERY_PAINTINGS_CONFIG, PaintingSlotConfig } from '../config/galleryPaintings';

export interface GalleryBuildResult {
  rootGroup: THREE.Group;
  colliders: WallCollider[];
  artworkMeshes: Map<string, THREE.Mesh>;
  indicatorMeshes: Map<string, THREE.Mesh>;
  updateArtworkTexture: (artworkId: string, imageSrc: string) => Promise<boolean>;
  resetArtworkTexture: (artworkId: string) => void;
}

/**
 * Loads a texture from URL or dataURL with correct color space, anisotropy, and upright orientation (flipY = true)
 */
export function loadTextureSafely(
  url: string,
  maxAnisotropy: number = 8
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;
        // flipY = true ensures standard JPEG/PNG images are right side up on the canvas meshes
        texture.flipY = true;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      (err) => {
        console.error(`Error loading texture from ${url}:`, err);
        reject(err);
      }
    );
  });
}

/**
 * Loads the user's galeria.glb as the primary 3D environment,
 * connects the 12 picture planes to the interactive artwork state,
 * and sets up colliders and museum lighting.
 */
export async function loadGaleriaGLB(
  artworks: ArtworkData[],
  maxAnisotropy: number = 8,
  customImagesMap: Map<string, string> = new Map()
): Promise<GalleryBuildResult> {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'GaleriaGLBRoot';

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/galeria.glb');
  const model = gltf.scene;

  // Scale and position model so real-world dimensions feel grand and floor is at Y = 0
  const GALLERY_SCALE = 3.5;
  model.scale.set(GALLERY_SCALE, GALLERY_SCALE, GALLERY_SCALE);
  // Floor Y in raw GLB is at -1.0. Offset of +3.5 brings floor exactly to Y = 0.0
  model.position.set(0, GALLERY_SCALE, 0);

  rootGroup.add(model);

  const artworkMeshes = new Map<string, THREE.Mesh>();
  const indicatorMeshes = new Map<string, THREE.Mesh>();
  const originalTextures = new Map<string, THREE.Texture | null>();

  // Map configuration by both materialName and clean meshName for foolproof matching
  const matToConfig = new Map<string, PaintingSlotConfig>();
  const meshToConfig = new Map<string, PaintingSlotConfig>();
  GALLERY_PAINTINGS_CONFIG.forEach((cfg) => {
    matToConfig.set(cfg.materialName, cfg);
    meshToConfig.set(cfg.meshName, cfg);
    meshToConfig.set(cfg.meshName.replace(/\./g, ''), cfg);
  });

  // Traverse model to optimize materials and hook up picture planes
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      const meshName = child.name;
      const cleanMeshName = child.name.replace(/\./g, '');
      const matName = (child.material as THREE.Material)?.name;

      // Match by material name first (e.g. material_11, material_10, etc.), then mesh name
      const matchedConfig = matToConfig.get(matName) || meshToConfig.get(cleanMeshName) || meshToConfig.get(meshName);

      if (matchedConfig) {
        // Tag this canvas mesh as interactive artwork
        (child as unknown as { userData: Record<string, unknown> }).userData = {
          artworkId: matchedConfig.id,
          slotNumber: matchedConfig.slotNumber,
          isArtworkCanvas: true,
          wall: matchedConfig.wall,
        };

        // Clone material so texture modifications on one frame do not bleed to others
        if (child.material) {
          const originalMat = child.material as THREE.MeshStandardMaterial;
          const clonedMat = originalMat.clone();
          if (clonedMat.map) {
            clonedMat.map.colorSpace = THREE.SRGBColorSpace;
            clonedMat.map.anisotropy = maxAnisotropy;
            clonedMat.map.flipY = true;
            originalTextures.set(matchedConfig.id, clonedMat.map);
            // Subtle emissive map ensures the artwork colors are luminous and vivid without glare
            clonedMat.emissive = new THREE.Color(0xffffff);
            clonedMat.emissiveMap = clonedMat.map;
            clonedMat.emissiveIntensity = 0.22;
          }
          clonedMat.roughness = 0.98;
          clonedMat.metalness = 0.0;
          child.material = clonedMat;
        }

        artworkMeshes.set(matchedConfig.id, child);

        // Create 3D intruder indicator marker on the canvas plane
        const box = matchedConfig.intruderBox;
        const centerU = box.x + box.w / 2;
        const centerV = 1.0 - (box.y + box.h / 2);
        const localX = -1.0 + 2.0 * centerU;
        const localY = -1.0 + 2.0 * centerV;
        const localZ = 0.02; // In front of canvas face to avoid z-fighting

        const indicatorGroup = new THREE.Group();
        indicatorGroup.name = `Indicator_${matchedConfig.id}`;
        indicatorGroup.position.set(localX, localY, localZ);

        // Size proportional to intruder box
        const localW = Math.max(0.12, box.w * 2.0);
        const localH = Math.max(0.12, box.h * 2.0);
        const radius = Math.max(localW, localH) * 0.58;

        // Glowing outer gold ring
        const ringGeo = new THREE.RingGeometry(radius * 0.88, radius * 1.05, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfbbf24, // Bright warm gold
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        indicatorGroup.add(ringMesh);

        // Emerald inner target ring
        const innerGeo = new THREE.RingGeometry(radius * 0.65, radius * 0.72, 32);
        const innerMat = new THREE.MeshBasicMaterial({
          color: 0x10b981, // Emerald green
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        indicatorGroup.add(innerMesh);

        // Emerald verification check badge
        const badgeGeo = new THREE.CircleGeometry(radius * 0.28, 20);
        const badgeMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.position.set(radius * 0.75, radius * 0.75, 0.005);
        indicatorGroup.add(badgeMesh);

        const initialFound = artworks.find((a) => a.id === matchedConfig.id)?.found ?? false;
        indicatorGroup.visible = initialFound;

        child.add(indicatorGroup);
        indicatorMeshes.set(matchedConfig.id, indicatorGroup as unknown as THREE.Mesh);
        // Architectural surface (floor, walls, benches, frames)
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.map) {
            mat.map.anisotropy = maxAnisotropy;
            mat.map.colorSpace = THREE.SRGBColorSpace;
          }
          if (mat.name === 'Floor') {
            mat.roughness = 0.35;
            mat.metalness = 0.06;
          } else if (mat.name === 'Marco') {
            mat.roughness = 0.45;
            mat.metalness = 0.25;
          } else {
            // Walls, alcoves, pillars, ceiling: deep matte dark gallery finish (eliminates wall glare)
            mat.roughness = 1.0;
            mat.metalness = 0.0;
            mat.color.setRGB(0.12, 0.14, 0.18);
          }
        }
      }
    }
  });

  // Apply custom images for matched picture planes
  for (const [id, customSrc] of customImagesMap.entries()) {
    const mesh = artworkMeshes.get(id);
    if (mesh && customSrc) {
      try {
        const tex = await loadTextureSafely(customSrc, maxAnisotropy);
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.map = tex;
          mesh.material.emissive = new THREE.Color(0xffffff);
          mesh.material.emissiveMap = tex;
          mesh.material.emissiveIntensity = 0.22;
          mesh.material.roughness = 0.98;
          mesh.material.metalness = 0.0;
          mesh.material.needsUpdate = true;
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            map: tex,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: tex,
            emissiveIntensity: 0.22,
            roughness: 0.98,
            metalness: 0.0,
          });
        }
      } catch (e) {
        console.warn(`Could not apply custom image for ${id}:`, e);
      }
    }
  }

  // Museum Lighting Rig - Soft, diffused, non-glare illumination
  const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.85);
  rootGroup.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xffedd5, 0x0f172a, 0.45);
  rootGroup.add(hemisphereLight);

  // Central ceiling ambient soft fill - diffused gentle dome fill without harsh spots
  const centerLight = new THREE.PointLight(0xfffaf0, 0.4, 14, 1.8);
  centerLight.position.set(0, 5.0, 0);
  rootGroup.add(centerLight);

  // Walking area colliders (prevent walking outside walls or through center benches)
  const colliders: WallCollider[] = [
    { minX: -6.0, maxX: 6.0, minZ: -6.5, maxZ: -3.65 },
    { minX: -6.0, maxX: 6.0, minZ: 3.65, maxZ: 6.5 },
    { minX: -6.5, maxX: -3.6, minZ: -6.0, maxZ: 6.0 },
    { minX: 3.6, maxX: 6.5, minZ: -6.0, maxZ: 6.0 },
    { minX: -0.75, maxX: 0.75, minZ: -1.2, maxZ: 1.2 },
  ];

  // Dynamic texture update function
  const updateArtworkTexture = async (artworkId: string, imageSrc: string): Promise<boolean> => {
    const mesh = artworkMeshes.get(artworkId);
    if (!mesh) return false;

    try {
      const texture = await loadTextureSafely(imageSrc, maxAnisotropy);
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.map = texture;
        mesh.material.emissive = new THREE.Color(0xffffff);
        mesh.material.emissiveMap = texture;
        mesh.material.emissiveIntensity = 0.22;
        mesh.material.roughness = 0.98;
        mesh.material.metalness = 0.0;
        mesh.material.needsUpdate = true;
      } else {
        mesh.material = new THREE.MeshStandardMaterial({
          map: texture,
          emissive: new THREE.Color(0xffffff),
          emissiveMap: texture,
          emissiveIntensity: 0.22,
          roughness: 0.98,
          metalness: 0.0,
        });
      }
      return true;
    } catch (err) {
      console.error('Failed to update artwork texture:', err);
      return false;
    }
  };

  // Reset to original texture from GLB
  const resetArtworkTexture = (artworkId: string) => {
    const mesh = artworkMeshes.get(artworkId);
    if (!mesh) return;
    const origTex = originalTextures.get(artworkId);
    if (origTex && mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.map = origTex;
      mesh.material.needsUpdate = true;
    }
  };

  return {
    rootGroup,
    colliders,
    artworkMeshes,
    indicatorMeshes,
    updateArtworkTexture,
    resetArtworkTexture,
  };
}
