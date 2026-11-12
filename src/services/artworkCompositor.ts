/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ArtworkData } from '../types';

export const INITIAL_ARTWORKS: ArtworkData[] = [
  {
    id: 'mona-lisa-dog',
    title: 'La Gioconda (Mona Lisa)',
    artist: 'Leonardo da Vinci',
    year: '1503',
    roomName: 'Sala del Cuadro Rosa',
    isPinkFrame: true,
    frameColor: '#f43f5e', // Vibrant rose / pink
    description: 'La célebre obra maestra renacentista con su enigmática sonrisa.',
    intruderName: 'Perro Salchicha con Chaleco Naranja',
    intruderDescription: 'Un simpático perro teckel luciendo un chaleco inflable naranja acolchado.',
    intruderBox: {
      x: 0.48,
      y: 0.60,
      w: 0.40,
      h: 0.34,
    },
    found: false,
    position: [0, 2.3, -9.85], // Centerpiece of the Pink Frame room
    rotation: [0, 0, 0],
    width: 2.2,
    height: 3.1,
    imageSrc: '/assets/aistudio/image_fc3e2015.png',
    intruderSrc: '/assets/aistudio/image_b31526f8.png',
  },
  {
    id: 'starry-night-ufo',
    title: 'La noche estrellada',
    artist: 'Vincent van Gogh',
    year: '1889',
    roomName: 'Ala Postimpresionista',
    isPinkFrame: false,
    frameColor: '#b45309', // Gilded antique gold
    description: 'Cielo arremolinado sobre las colinas de Saint-Rémy-de-Provence.',
    intruderName: 'Platillo Volador (OVNI)',
    intruderDescription: 'Una nave espacial retrofuturista con luces de neón en el firmamento estelar.',
    intruderBox: {
      x: 0.45,
      y: 0.16,
      w: 0.20,
      h: 0.15,
    },
    found: false,
    position: [-11.85, 2.3, 0],
    rotation: [0, Math.PI / 2, 0],
    width: 3.2,
    height: 2.3,
  },
  {
    id: 'the-scream-headphones',
    title: 'El grito',
    artist: 'Edvard Munch',
    year: '1893',
    roomName: 'Galería Expresionista',
    isPinkFrame: false,
    frameColor: '#78350f', // Dark mahogany wood
    description: 'Figura angustiada bajo un cielo llameante y dramático.',
    intruderName: 'Auriculares Gamer con Cancelación de Ruido',
    intruderDescription: 'Modernos cascos de audio circumaurales cubriendo los oídos de la figura.',
    intruderBox: {
      x: 0.38,
      y: 0.42,
      w: 0.24,
      h: 0.19,
    },
    found: false,
    position: [11.85, 2.3, 0],
    rotation: [0, -Math.PI / 2, 0],
    width: 2.2,
    height: 2.9,
  },
  {
    id: 'birth-of-venus-phone',
    title: 'El nacimiento de Venus',
    artist: 'Sandro Botticelli',
    year: '1485',
    roomName: 'Ala Renacimiento Clásico',
    isPinkFrame: false,
    frameColor: '#ca8a04', // Gilded gold
    description: 'La diosa Venus emergiendo del mar sobre una concha gigante.',
    intruderName: 'Smartphone para Selfie',
    intruderDescription: 'Un teléfono inteligente moderno sostenido en su mano capturando el momento.',
    intruderBox: {
      x: 0.48,
      y: 0.38,
      w: 0.18,
      h: 0.20,
    },
    found: false,
    position: [-7.0, 2.3, 9.85],
    rotation: [0, Math.PI, 0],
    width: 3.4,
    height: 2.2,
  },
  {
    id: 'pearl-earring-airpod',
    title: 'La joven de la perla',
    artist: 'Johannes Vermeer',
    year: '1665',
    roomName: 'Salón Barroco Holandés',
    isPinkFrame: false,
    frameColor: '#d97706', // Burnished bronze
    description: 'Retrato de una joven con turbante oriental y una joya luminosa.',
    intruderName: 'AirPod Inalámbrico',
    intruderDescription: 'Un auricular inalámbrico moderno de color blanco en lugar de la perla clásica.',
    intruderBox: {
      x: 0.54,
      y: 0.50,
      w: 0.15,
      h: 0.18,
    },
    found: false,
    position: [7.0, 2.3, 9.85],
    rotation: [0, Math.PI, 0],
    width: 2.2,
    height: 2.7,
  },
];

/**
 * Loads an image with a promise
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Composites the Mona Lisa and the Dachshund dog into a single texture
 */
export async function createMonaLisaDogTexture(maxAnisotropy: number): Promise<{
  texture: THREE.CanvasTexture;
  intruderBox: ArtworkData['intruderBox'];
}> {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1520;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  try {
    // 1. Load both images
    const [monaImg, dogImg] = await Promise.all([
      loadImage('/assets/aistudio/image_fc3e2015.png'),
      loadImage('/assets/aistudio/image_b31526f8.png'),
    ]);

    // 2. Draw Mona Lisa background
    ctx.drawImage(monaImg, 0, 0, canvas.width, canvas.height);

    // 3. Extract and crop the dog painting
    // The dog painting in image_b31526f8 (415x739) has black bars top and bottom
    // The canvas area is roughly sx=0, sy=150, sw=415, sh=430
    const cropX = 10;
    const cropY = 150;
    const cropW = dogImg.width - 20;
    const cropH = dogImg.height - 300;

    // Desired position on Mona Lisa's lap / crossed hands (bottom-right / center)
    const targetW = 410;
    const targetH = 480;
    const targetX = 500;
    const targetY = 910;

    // Draw a soft drop shadow beneath the dog
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetX = -10;
    ctx.shadowOffsetY = 12;

    // Rounded clipping path for the dog painting integration
    ctx.beginPath();
    ctx.roundRect(targetX, targetY, targetW, targetH, [24, 24, 24, 24]);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.clip();

    // Draw the cropped dog painting
    ctx.drawImage(
      dogImg,
      cropX,
      cropY,
      cropW,
      cropH,
      targetX,
      targetY,
      targetW,
      targetH
    );
    ctx.restore();

    // 4. Subtle classical varnish patina over the whole painting for artistic cohesion
    const patina = ctx.createLinearGradient(0, 0, 0, canvas.height);
    patina.addColorStop(0, 'rgba(40, 30, 10, 0.08)');
    patina.addColorStop(1, 'rgba(20, 15, 5, 0.16)');
    ctx.fillStyle = patina;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate exact normalized intruder box
    const normBox = {
      x: targetX / canvas.width,
      y: targetY / canvas.height,
      w: targetW / canvas.width,
      h: targetH / canvas.height,
    };

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    texture.generateMipmaps = true;

    return { texture, intruderBox: normBox };
  } catch (error) {
    console.warn('Fallback to procedural Mona Lisa due to load error', error);
    return createProceduralArtworkTexture('mona-lisa-dog', maxAnisotropy);
  }
}

/**
 * Procedural generator for museum masterpieces with intruders
 */
export function createProceduralArtworkTexture(
  artworkId: string,
  maxAnisotropy: number
): { texture: THREE.CanvasTexture; intruderBox: ArtworkData['intruderBox'] } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  let intruderBox: ArtworkData['intruderBox'] = { x: 0.4, y: 0.4, w: 0.2, h: 0.2 };

  if (artworkId === 'starry-night-ufo') {
    canvas.width = 1024;
    canvas.height = 768;
    // Van Gogh swirling sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0c1a30');
    skyGrad.addColorStop(0.6, '#183863');
    skyGrad.addColorStop(1, '#081426');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Swirls
    ctx.strokeStyle = '#2d588f';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      const cx = 200 + (i % 4) * 220;
      const cy = 120 + Math.floor(i / 4) * 80;
      ctx.arc(cx, cy, 50 + (i % 3) * 20, 0, Math.PI * 1.5);
      ctx.stroke();
    }

    // Glowing stars
    const starColors = ['#fde047', '#facc15', '#ffffff'];
    const stars = [
      { x: 180, y: 140, r: 24 },
      { x: 340, y: 100, r: 32 },
      { x: 800, y: 120, r: 42 },
      { x: 680, y: 220, r: 28 },
    ];
    stars.forEach((s) => {
      const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r * 2);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.3, starColors[1]);
      g.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dark cypress tree on the left
    ctx.fillStyle = '#061713';
    ctx.beginPath();
    ctx.moveTo(100, canvas.height);
    ctx.bezierCurveTo(90, 400, 130, 260, 120, 120);
    ctx.bezierCurveTo(150, 280, 190, 480, 210, canvas.height);
    ctx.fill();

    // Hills & Village
    ctx.fillStyle = '#0a1f33';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 520);
    ctx.bezierCurveTo(300, 480, 600, 560, canvas.width, 510);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // INTRUDER: Retro UFO hovering in the sky!
    const ufoX = 470;
    const ufoY = 130;
    const ufoW = 190;
    const ufoH = 90;

    // UFO tractor beam
    const beam = ctx.createLinearGradient(0, ufoY + 40, 0, canvas.height);
    beam.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    beam.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(ufoX + ufoW * 0.35, ufoY + 40);
    ctx.lineTo(ufoX + ufoW * 0.65, ufoY + 40);
    ctx.lineTo(ufoX + ufoW * 0.9, ufoY + 280);
    ctx.lineTo(ufoX + ufoW * 0.1, ufoY + 280);
    ctx.fill();

    // Saucer dome (glass)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ufoX + ufoW / 2, ufoY + 24, 30, Math.PI, 0);
    ctx.fill();

    // Saucer body (metallic disc)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(ufoX + ufoW / 2, ufoY + 36, ufoW * 0.45, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neon blinking lights on the rim
    const lights = [0.15, 0.3, 0.5, 0.7, 0.85];
    lights.forEach((pct) => {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(ufoX + ufoW * pct, ufoY + 38, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    intruderBox = {
      x: ufoX / canvas.width,
      y: (ufoY - 10) / canvas.height,
      w: ufoW / canvas.width,
      h: (ufoH + 30) / canvas.height,
    };
  } else if (artworkId === 'the-scream-headphones') {
    canvas.width = 768;
    canvas.height = 1024;

    // Fiery orange / red sky
    const sky = ctx.createLinearGradient(0, 0, 0, 420);
    sky.addColorStop(0, '#ea580c');
    sky.addColorStop(0.4, '#f97316');
    sky.addColorStop(0.7, '#fbbf24');
    sky.addColorStop(1, '#0e7490');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wavy fjord water
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.6, 520, 240, 80, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Angled bridge railing
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 450);
    ctx.lineTo(canvas.width, 920);
    ctx.stroke();

    // Screaming figure silhouette
    const headX = 384;
    const headY = 560;

    // Body
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(headX - 60, canvas.height);
    ctx.bezierCurveTo(headX - 80, 750, headX - 50, 640, headX - 40, headY + 50);
    ctx.lineTo(headX + 40, headY + 50);
    ctx.bezierCurveTo(headX + 50, 640, headX + 90, 750, headX + 80, canvas.height);
    ctx.fill();

    // Pale oval head
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(headX, headY, 54, 76, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hands to face
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(headX - 54, headY + 10, 18, 48, -0.3, 0, Math.PI * 2);
    ctx.ellipse(headX + 54, headY + 10, 18, 48, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Open screaming mouth
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 36, 18, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.ellipse(headX - 22, headY - 14, 9, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(headX + 22, headY - 14, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // INTRUDER: Modern RGB gamer headphones!
    const hpW = 160;
    const hpH = 140;
    const hpX = headX - hpW / 2;
    const hpY = headY - 80;

    // Headband
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(headX, headY - 20, 68, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Earcups
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(headX - 82, headY - 26, 26, 60, 12);
    ctx.roundRect(headX + 56, headY - 26, 26, 60, 12);
    ctx.fill();

    // Glowing RGB ring on earcup
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.strokeRect(headX - 80, headY - 22, 22, 52);
    ctx.strokeRect(headX + 58, headY - 22, 22, 52);

    intruderBox = {
      x: hpX / canvas.width,
      y: hpY / canvas.height,
      w: hpW / canvas.width,
      h: hpH / canvas.height,
    };
  } else if (artworkId === 'birth-of-venus-phone') {
    canvas.width = 1024;
    canvas.height = 700;

    // Sea & Sky
    const sea = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sea.addColorStop(0, '#bae6fd');
    sea.addColorStop(0.5, '#7dd3fc');
    sea.addColorStop(1, '#0284c7');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Giant Scallop Shell
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, 580, 280, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Classical Venus Silhouette
    const vx = canvas.width / 2;
    ctx.fillStyle = '#fce7f3';
    // Torso & legs
    ctx.beginPath();
    ctx.ellipse(vx, 380, 48, 140, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Golden flowing hair
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(vx, 220, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.bezierCurveTo(vx - 70, 240, vx - 120, 420, vx - 80, 500);
    ctx.bezierCurveTo(vx + 40, 520, vx + 100, 380, vx + 60, 250);
    ctx.fill();

    // Face
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(vx, 220, 28, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // INTRUDER: Raised arm holding glowing smartphone taking a selfie!
    const phoneX = vx + 40;
    const phoneY = 170;
    const phoneW = 90;
    const phoneH = 120;

    // Arm reaching up
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(vx + 30, 270);
    ctx.lineTo(phoneX + 20, phoneY + 60);
    ctx.stroke();

    // Smartphone
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(phoneX + 15, phoneY + 10, 42, 75, 8);
    ctx.fill();

    // Glowing screen
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(phoneX + 19, phoneY + 15, 34, 62);

    // Camera flash sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(phoneX + 36, phoneY + 12, 5, 0, Math.PI * 2);
    ctx.fill();

    intruderBox = {
      x: phoneX / canvas.width,
      y: phoneY / canvas.height,
      w: phoneW / canvas.width,
      h: phoneH / canvas.height,
    };
  } else if (artworkId === 'pearl-earring-airpod') {
    canvas.width = 768;
    canvas.height = 960;

    // Deep dark chiaroscuro background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Brown mantle
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(cx - 160, canvas.height);
    ctx.bezierCurveTo(cx - 120, cy + 180, cx + 80, cy + 180, cx + 180, canvas.height);
    ctx.fill();

    // Blue & yellow turban
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx, cy - 80, 110, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(cx - 90, cy - 90, 180, 40, 12);
    ctx.fill();

    // Gentle face profile turned over shoulder
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 20, 72, 94, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + 18, cy - 35, 7, 0, Math.PI * 2);
    ctx.fill();

    // Lips
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy + 30, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // INTRUDER: Sleek modern white AirPod with stem!
    const podX = cx - 36;
    const podY = cy + 10;
    const podW = 70;
    const podH = 90;

    // Earbud head
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(podX + 24, podY + 22, 14, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.beginPath();
    ctx.roundRect(podX + 20, podY + 26, 9, 36, 4);
    ctx.fill();

    // Subtle silver charging tip
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(podX + 20, podY + 58, 9, 4);

    intruderBox = {
      x: podX / canvas.width,
      y: podY / canvas.height,
      w: podW / canvas.width,
      h: podH / canvas.height,
    };
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.generateMipmaps = true;

  return { texture, intruderBox };
}
