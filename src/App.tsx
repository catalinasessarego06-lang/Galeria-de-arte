/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import { PlayerController } from './controllers/PlayerController';
import { loadGaleriaGLB, GalleryBuildResult } from './services/galleryBuilder';
import {
  getInitialArtworkDataList,
  GALLERY_PAINTINGS_CONFIG,
} from './config/galleryPaintings';
import { soundService } from './services/sound';
import { ArtworkData } from './types';
import { VirtualJoystick } from './components/VirtualJoystick';
import { HudOverlay } from './components/HudOverlay';
import { WelcomeModal } from './components/WelcomeModal';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Core 3D references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerControllerRef = useRef<PlayerController | null>(null);
  const galleryDataRef = useRef<GalleryBuildResult | null>(null);

  // Application State
  const [hasStarted, setHasStarted] = useState(false);
  const [artworks, setArtworks] = useState<ArtworkData[]>(() => getInitialArtworkDataList());
  const [hasDismissedVictory, setHasDismissedVictory] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recentDiscovery, setRecentDiscovery] = useState<string | null>(null);

  // Calculated counts
  const foundCount = artworks.filter((a) => a.found).length;
  const totalCount = artworks.length;
  const isVictory = totalCount > 0 && foundCount === totalCount && !hasDismissedVictory;

  // Initialize Three.js Scene and load galeria.glb
  useEffect(() => {
    if (!mountRef.current) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.Fog(0x0a0f1d, 18, 36);

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 2. High-Fidelity Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 3. Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Initialize Player Controller
    const controller = new PlayerController(camera, renderer.domElement);
    playerControllerRef.current = controller;
    controller.onStep = () => {
      soundService.playFootstep();
    };

    // 5. Asynchronously load galeria.glb
    let isCancelled = false;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    async function setupGallery() {
      try {
        // Build initial custom images map
        const customMap = new Map<string, string>();
        customMap.set('cuadro-1', '/assets/gallery/1.jpg');
        customMap.set('cuadro-2', '/assets/gallery/2.jpg');
        customMap.set('cuadro-3', '/assets/gallery/3.jpg');
        customMap.set('cuadro-4', '/assets/gallery/4.jpg');
        customMap.set('cuadro-5', '/assets/gallery/5.jpg');
        customMap.set('cuadro-6', '/assets/gallery/6.jpg');
        customMap.set('cuadro-7', '/assets/gallery/7.jpg');
        customMap.set('cuadro-8', '/assets/gallery/8.jpg');
        customMap.set('cuadro-9', '/assets/gallery/9.jpg');
        customMap.set('cuadro-10', '/assets/gallery/10.jpg');
        customMap.set('cuadro-11', '/assets/gallery/11.jpg');
        customMap.set('cuadro-12', '/assets/gallery/12.jpg');

        GALLERY_PAINTINGS_CONFIG.forEach((cfg) => {
          if (cfg.customImageUrl) {
            customMap.set(cfg.id, cfg.customImageUrl);
          }
        });

        const gallery = await loadGaleriaGLB(artworks, maxAnisotropy, customMap);
        if (isCancelled) return;

        galleryDataRef.current = gallery;
        scene.add(gallery.rootGroup);

        // Connect controller with colliders & interactive canvas meshes
        controller.setColliders(gallery.colliders);
        controller.setArtworks(artworks, gallery.artworkMeshes);
      } catch (err) {
        console.error('Failed to load galeria.glb:', err);
      }
    }

    setupGallery();

    // 6. Animation Loop with Clock & Delta
    const clock = new THREE.Clock();
    let animFrameId = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      controller.update(delta);

      // Subtle pulse and shimmer on visible 3D intruder indicator markers
      if (galleryDataRef.current) {
        const time = clock.getElapsedTime();
        galleryDataRef.current.indicatorMeshes.forEach((mesh) => {
          if (mesh.visible) {
            mesh.rotation.z = Math.sin(time * 2.5) * 0.08;
            const s = 1.0 + Math.sin(time * 3.5) * 0.035;
            mesh.scale.set(s, s, 1.0);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // 7. Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isCancelled = true;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      controller.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Synchronize 3D intruder indicators and controller state with artworks
  useEffect(() => {
    if (galleryDataRef.current) {
      artworks.forEach((art) => {
        const marker = galleryDataRef.current?.indicatorMeshes.get(art.id);
        if (marker) {
          marker.visible = art.found;
        }
      });
    }
    if (playerControllerRef.current && galleryDataRef.current) {
      playerControllerRef.current.setArtworks(artworks, galleryDataRef.current.artworkMeshes);
    }
  }, [artworks]);

  // Handle tap / click on 3D canvas
  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[data-ui-interactive]')) {
        return;
      }

      if (!playerControllerRef.current) return;

      const result = playerControllerRef.current.checkTapInteraction(e.clientX, e.clientY);

      if (result.hit && result.artwork) {
        if (result.isIntruder) {
          const artId = result.artwork.id;
          const alreadyFound = artworks.find((a) => a.id === artId)?.found;

          if (!alreadyFound) {
            soundService.playSuccessChime();
            setArtworks((prev) =>
              prev.map((a) => (a.id === artId ? { ...a, found: true } : a))
            );

            if ('vibrate' in navigator) {
              try {
                navigator.vibrate([40, 60, 100]);
              } catch {
                // Ignore
              }
            }

            confetti({
              particleCount: 50,
              spread: 60,
              origin: { x: 0.5, y: 0.6 },
              colors: ['#f43f5e', '#fb7185', '#22c55e', '#38bdf8', '#fbbf24'],
            });

            setRecentDiscovery(`¡Intruso encontrado: ${result.artwork.intruderName}!`);
            setTimeout(() => setRecentDiscovery(null), 4000);
          } else {
            soundService.playClick();
          }
        } else {
          // Clicked painting, but didn't hit the intruder spot
          soundService.playClick();
        }
      }
    },
    [artworks]
  );

  // Navigate smoothly in 3D towards an artwork
  const handleNavigateToArtwork = (art: ArtworkData) => {
    if (playerControllerRef.current) {
      playerControllerRef.current.navigateToArtwork(art);
    }
  };

  // Start Experience from Welcome Modal
  const handleStartExperience = async (enableGyro: boolean = true, enableMic: boolean = false) => {
    setHasStarted(true);
    await soundService.startAudio();

    if (enableGyro && playerControllerRef.current) {
      const allowed = await playerControllerRef.current.requestGyroPermission();
      setGyroActive(allowed);
    }

    if (enableMic) {
      await soundService.enableMicrophone();
    }
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundService.setMuted(nextMuted);
  };

  // Restart game / discovery status
  const handleRestartGame = () => {
    setArtworks((prev) => prev.map((a) => ({ ...a, found: false })));
    setHasDismissedVictory(false);
    if (galleryDataRef.current) {
      galleryDataRef.current.indicatorMeshes.forEach((mesh) => {
        mesh.visible = false;
      });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerUp={handleCanvasPointerUp}
        className="w-full h-full cursor-crosshair touch-none"
      />

      {/* Welcome Screen & Instruction Modal */}
      {!hasStarted && <WelcomeModal onStart={handleStartExperience} />}

      {/* Main HUD Overlay */}
      {hasStarted && (
        <HudOverlay
          artworks={artworks}
          foundCount={foundCount}
          totalCount={totalCount}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onNavigateToArtwork={handleNavigateToArtwork}
          recentDiscovery={recentDiscovery}
        />
      )}

      {/* Mobile Virtual Joystick (Left hand) */}
      {hasStarted && (
        <div className="absolute bottom-6 left-6 z-30 pointer-events-auto">
          <VirtualJoystick
            onMove={(vec) => {
              if (playerControllerRef.current) {
                playerControllerRef.current.joystickInput = vec;
              }
            }}
          />
        </div>
      )}

      {/* Victory Celebration Modal */}
      {hasStarted && isVictory && (
        <VictoryModal
          artworks={artworks}
          onRestart={handleRestartGame}
          onContinue={() => setHasDismissedVictory(true)}
        />
      )}
    </div>
  );
}
