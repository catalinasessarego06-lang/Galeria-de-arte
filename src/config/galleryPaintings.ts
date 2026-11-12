/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArtworkData } from '../types';

export interface PaintingSlotConfig {
  id: string;
  slotNumber: number;
  meshName: string;
  materialName: string;
  wall: 'Pared Este' | 'Pared Norte' | 'Pared Oeste' | 'Pared Sur';
  wallPosition: 'Izquierda' | 'Centro' | 'Derecha';
  title: string;
  artist: string;
  year: string;
  description: string;
  defaultThumb: string;
  customImageUrl?: string;
  // Intruder details
  intruderName: string;
  intruderDescription: string;
  intruderBox: { x: number; y: number; w: number; h: number };
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}

/**
 * 12 paintings corresponding to the 12 picture planes in /galeria.glb
 */
export const GALLERY_PAINTINGS_CONFIG: PaintingSlotConfig[] = [
  // ================= CUADRO 1: LA ÚLTIMA CENA (1.jpg) =================
  {
    id: 'cuadro-1',
    slotNumber: 1,
    meshName: 'Plane_0',
    materialName: 'material_11',
    wall: 'Pared Este',
    wallPosition: 'Izquierda',
    title: 'La Última Cena',
    artist: 'Leonardo da Vinci',
    year: '1498',
    description: 'La célebre cena pascual con Jesús y sus doce apóstoles.',
    defaultThumb: '/assets/gallery/1.jpg',
    customImageUrl: '/assets/gallery/1.jpg',
    intruderName: 'Perro debajo de la mesa',
    intruderDescription: 'Un simpático perro escondido en el piso debajo del mantel de la mesa.',
    intruderBox: { x: 0.31, y: 0.90, w: 0.08, h: 0.10 },
    position: [4.2, 2.0, -2.87],
    rotation: [0, -Math.PI / 2, 0],
    width: 1.61,
    height: 1.61,
  },

  // ================= CUADRO 2: LA NOVIA VACILANTE (2.jpg) =================
  {
    id: 'cuadro-2',
    slotNumber: 2,
    meshName: 'Plane001_0',
    materialName: 'material_10',
    wall: 'Pared Este',
    wallPosition: 'Centro',
    title: 'La Novia Vacilante',
    artist: 'Auguste Toulmouche',
    year: '1866',
    description: 'Escena de damas victorianas acompañando a la joven novia antes del enlace.',
    defaultThumb: '/assets/gallery/2.jpg',
    customImageUrl: '/assets/gallery/2.jpg',
    intruderName: 'Perrito al lado del vestido rosa',
    intruderDescription: 'Un perrito blanco ubicado abajo a la derecha, al lado del vestido rosa.',
    intruderBox: { x: 0.88, y: 0.74, w: 0.10, h: 0.11 },
    position: [4.2, 2.0, 0.0],
    rotation: [0, -Math.PI / 2, 0],
    width: 1.23,
    height: 1.23,
  },

  // ================= CUADRO 3: EL COLUMPIO (3.jpg) =================
  {
    id: 'cuadro-3',
    slotNumber: 3,
    meshName: 'Plane002_0',
    materialName: 'material_9',
    wall: 'Pared Este',
    wallPosition: 'Derecha',
    title: 'El Columpio',
    artist: 'Jean-Honoré Fragonard',
    year: '1767',
    description: 'Fantasía rococó de una dama en un columpio en un frondoso jardín palaciego.',
    defaultThumb: '/assets/gallery/3.jpg',
    customImageUrl: '/assets/gallery/3.jpg',
    intruderName: 'Perro con capucha y vaso de café',
    intruderDescription: 'Un perro con traje gris y capucha sosteniendo un vaso de café a la derecha cerca del señor.',
    intruderBox: { x: 0.687, y: 0.663, w: 0.114, h: 0.124 },
    position: [4.2, 2.0, 2.87],
    rotation: [0, -Math.PI / 2, 0],
    width: 1.61,
    height: 1.61,
  },

  // ================= CUADRO 4: FIESTA CAMPESTRE (4.jpg) =================
  {
    id: 'cuadro-4',
    slotNumber: 4,
    meshName: 'Plane003_0',
    materialName: 'material_8',
    wall: 'Pared Norte',
    wallPosition: 'Derecha',
    title: 'Fiesta Campestre y Estatua',
    artist: 'Jean-Frédéric Schall',
    year: '1785',
    description: 'Grupo de jóvenes celebrando un alegre picnic alrededor de la estatua de Cupido.',
    defaultThumb: '/assets/gallery/4.jpg',
    customImageUrl: '/assets/gallery/4.jpg',
    intruderName: 'Conejo junto al señor agachado',
    intruderDescription: 'Un conejo de pie sobre el pasto al lado del señor de marrón que está agachado.',
    intruderBox: { x: 0.80, y: 0.72, w: 0.09, h: 0.13 },
    position: [2.8, 2.0, -4.29],
    rotation: [0, 0, 0],
    width: 1.23,
    height: 1.23,
  },

  // ================= CUADRO 5: MERCADO DE LA FUENTE (5.jpg) =================
  {
    id: 'cuadro-5',
    slotNumber: 5,
    meshName: 'Plane004_0',
    materialName: 'material_7',
    wall: 'Pared Norte',
    wallPosition: 'Centro',
    title: 'Mercado de la Fuente',
    artist: 'Pintura Clásica (Remix)',
    year: 'Siglo XVIII',
    description: 'Ajetreado mercado junto a una fuente monumental barroca y un acueducto.',
    defaultThumb: '/assets/gallery/5.jpg',
    customImageUrl: '/assets/gallery/5.jpg',
    intruderName: 'Perro con capucha y peluche',
    intruderDescription: 'Un perrito con capucha sosteniendo un muñeco rosa sentado en el muro adelante.',
    intruderBox: { x: 0.406, y: 0.751, w: 0.129, h: 0.223 },
    position: [0.0, 2.0, -4.29],
    rotation: [0, 0, 0],
    width: 1.61,
    height: 1.61,
  },

  // ================= CUADRO 6: PASEO DE OTOÑO (6.jpg) =================
  {
    id: 'cuadro-6',
    slotNumber: 6,
    meshName: 'Plane005_0',
    materialName: 'material_6',
    wall: 'Pared Norte',
    wallPosition: 'Izquierda',
    title: 'Paseo de Otoño',
    artist: 'Pintura Clásica (Remix)',
    year: 'Siglo XVIII',
    description: 'Paseo arbolado con carruajes y damas de época en tonos otoñales.',
    defaultThumb: '/assets/gallery/6.jpg',
    customImageUrl: '/assets/gallery/6.jpg',
    intruderName: 'Parte trasera de perro en la maceta',
    intruderDescription: 'La parte trasera de un perro asomándose desde una maceta de flores a la izquierda.',
    intruderBox: { x: 0.067, y: 0.536, w: 0.080, h: 0.087 },
    position: [-2.8, 2.0, -4.29],
    rotation: [0, 0, 0],
    width: 1.23,
    height: 1.23,
  },

  // ================= CUADRO 7: NAPOLEÓN CRUZANDO LOS ALPES (7.jpg) =================
  {
    id: 'cuadro-7',
    slotNumber: 7,
    meshName: 'Plane006_0',
    materialName: 'material_5',
    wall: 'Pared Oeste',
    wallPosition: 'Derecha',
    title: 'Napoleón cruzando los Alpes',
    artist: 'Jacques-Louis David (Remix)',
    year: '1801',
    description: 'El célebre retrato ecuestre de Napoleón en los Alpes.',
    defaultThumb: '/assets/gallery/7.jpg',
    customImageUrl: '/assets/gallery/7.jpg',
    intruderName: 'Perrito Napoleón',
    intruderDescription: 'Un perrito con sombrero bicornio y abrigo militar abajo a la izquierda.',
    intruderBox: { x: 0.104, y: 0.757, w: 0.110, h: 0.160 },
    position: [-4.2, 2.0, 2.87],
    rotation: [0, Math.PI / 2, 0],
    width: 1.61,
    height: 1.61,
  },

  // ================= CUADRO 8: LAS MENINAS (8.jpg) =================
  {
    id: 'cuadro-8',
    slotNumber: 8,
    meshName: 'Plane007_0',
    materialName: 'material_4',
    wall: 'Pared Oeste',
    wallPosition: 'Centro',
    title: 'Las Meninas',
    artist: 'Diego Velázquez (Remix)',
    year: '1656',
    description: 'La infanta Margarita y sus damas en el taller del maestro Diego Velázquez.',
    defaultThumb: '/assets/gallery/8.jpg',
    customImageUrl: '/assets/gallery/8.jpg',
    intruderName: 'Gato comiendo helado de naranja',
    intruderDescription: 'Un gato comiendo una paleta helada de naranja abajo a la derecha al lado del perro.',
    intruderBox: { x: 0.856, y: 0.808, w: 0.089, h: 0.137 },
    position: [-4.2, 2.0, 0.0],
    rotation: [0, Math.PI / 2, 0],
    width: 1.23,
    height: 1.23,
  },

  // ================= CUADRO 9: LA CORONACIÓN DE NAPOLEÓN (9.jpg) =================
  {
    id: 'cuadro-9',
    slotNumber: 9,
    meshName: 'Plane008_0',
    materialName: 'material_3',
    wall: 'Pared Oeste',
    wallPosition: 'Izquierda',
    title: 'La Coronación de Napoleón',
    artist: 'Jacques-Louis David (Remix)',
    year: '1807',
    description: 'Solemne consagración de Napoleón Bonaparte y Josefina en la catedral de Notre Dame.',
    defaultThumb: '/assets/gallery/9.jpg',
    customImageUrl: '/assets/gallery/9.jpg',
    intruderName: 'Perro con capa real',
    intruderDescription: 'Un simpático perro pomerania con capa azul real sentado abajo en el medio.',
    intruderBox: { x: 0.359, y: 0.774, w: 0.176, h: 0.200 },
    position: [-4.2, 2.0, -2.87],
    rotation: [0, Math.PI / 2, 0],
    width: 1.61,
    height: 1.61,
  },

  // ================= CUADRO 10: EL NACIMIENTO DE VENUS (10.jpg) =================
  {
    id: 'cuadro-10',
    slotNumber: 10,
    meshName: 'Plane009_0',
    materialName: 'material_2',
    wall: 'Pared Sur',
    wallPosition: 'Derecha',
    title: 'El Nacimiento de Venus',
    artist: 'Sandro Botticelli (Remix)',
    year: '1485',
    description: 'La diosa del amor sobre una concha marina escoltada por los vientos y la Primavera.',
    defaultThumb: '/assets/gallery/10.jpg',
    customImageUrl: '/assets/gallery/10.jpg',
    intruderName: 'Perro con pelo rubio',
    intruderDescription: 'Un perro shiba inu luciendo una larga melena rubia en una concha al centro a la derecha.',
    intruderBox: { x: 0.627, y: 0.487, w: 0.191, h: 0.191 },
    position: [2.8, 2.0, 4.29],
    rotation: [0, Math.PI, 0],
    width: 1.23,
    height: 1.23,
  },

  // ================= CUADRO 11: NIGHTHAWKS (11.jpg) =================
  {
    id: 'cuadro-11',
    slotNumber: 11,
    meshName: 'Plane010_0',
    materialName: 'material_1',
    wall: 'Pared Sur',
    wallPosition: 'Centro',
    title: 'Nighthawks (Halcones de la Noche)',
    artist: 'Edward Hopper (Remix)',
    year: '1942',
    description: 'Clientes solitarios en la barra de un café nocturno iluminado en la esquina.',
    defaultThumb: '/assets/gallery/11.jpg',
    customImageUrl: '/assets/gallery/11.jpg',
    intruderName: 'Perro al lado de la barra',
    intruderDescription: 'Un perrito con abrigo celeste y un muñeco a la izquierda al lado del ventanal de la barra.',
    intruderBox: { x: 0.122, y: 0.687, w: 0.107, h: 0.150 },
    position: [0.0, 2.0, 4.29],
    rotation: [0, Math.PI, 0],
    width: 1.61,
    height: 1.61,
  },

  // ================= CUADRO 12: LA PERSISTENCIA DE LA MEMORIA (12.jpg) =================
  {
    id: 'cuadro-12',
    slotNumber: 12,
    meshName: 'Plane011_0',
    materialName: 'material',
    wall: 'Pared Sur',
    wallPosition: 'Izquierda',
    title: 'La Persistencia de la Memoria',
    artist: 'Salvador Dalí (Remix)',
    year: '1931',
    description: 'El célebre paisaje desértico con relojes derretidos sobre la arena y las rocas.',
    defaultThumb: '/assets/gallery/12.jpg',
    customImageUrl: '/assets/gallery/12.jpg',
    intruderName: 'Persona colgándose del reloj',
    intruderDescription: 'Un acróbata en traje negro y sombrero colgándose de las agujas del reloj blando.',
    intruderBox: { x: 0.281, y: 0.670, w: 0.107, h: 0.316 },
    position: [-2.8, 2.0, 4.29],
    rotation: [0, Math.PI, 0],
    width: 1.23,
    height: 1.23,
  },
];

/**
 * Converts PaintingSlotConfig items into standard ArtworkData
 */
export function getInitialArtworkDataList(): ArtworkData[] {
  return GALLERY_PAINTINGS_CONFIG.map((cfg) => ({
    id: cfg.id,
    title: cfg.title,
    artist: cfg.artist,
    year: cfg.year,
    roomName: cfg.wall,
    isPinkFrame: cfg.slotNumber === 5,
    frameColor: cfg.slotNumber === 5 ? '#f43f5e' : '#b45309',
    description: cfg.description,
    intruderName: cfg.intruderName,
    intruderDescription: cfg.intruderDescription,
    intruderBox: cfg.intruderBox,
    found: false,
    position: cfg.position,
    rotation: cfg.rotation,
    width: cfg.width,
    height: cfg.height,
    imageSrc: cfg.customImageUrl || cfg.defaultThumb,
    intruderSrc: `/assets/gallery/crop_${cfg.slotNumber}.jpg`,
  }));
}
