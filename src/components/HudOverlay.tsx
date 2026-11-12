/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Search,
} from 'lucide-react';
import { ArtworkData } from '../types';
import { GALLERY_PAINTINGS_CONFIG } from '../config/galleryPaintings';

interface HudOverlayProps {
  artworks: ArtworkData[];
  foundCount: number;
  totalCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigateToArtwork: (art: ArtworkData) => void;
  recentDiscovery: string | null;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  artworks,
  foundCount,
  totalCount,
  isMuted,
  onToggleMute,
  onNavigateToArtwork,
  recentDiscovery,
}) => {
  const [showArtworkList, setShowArtworkList] = useState(false);

  const displayTotal = totalCount > 0 ? totalCount : 12;
  const progressPct = (foundCount / displayTotal) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Top-Left: Gallery Info & Quick Painting List Toggle */}
        <div
          data-ui-interactive="true"
          onClick={() => setShowArtworkList(!showArtworkList)}
          className="pointer-events-auto bg-slate-900/85 border border-slate-700/80 rounded-2xl p-2.5 md:px-4 md:py-3 shadow-xl backdrop-blur-xs flex items-center gap-3 cursor-pointer hover:border-slate-500 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <span>12</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Galería 3D
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-medium">
                12 Cuadros
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Toca para ver lista
            </p>
          </div>
        </div>

        {/* Top-Center: Toast Discovery Notification */}
        {recentDiscovery && (
          <div className="pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-400/50 flex items-center gap-2 text-xs md:text-sm font-semibold max-w-sm">
            <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="truncate">{recentDiscovery}</span>
          </div>
        )}

        {/* Top-Right: Intrusos Counter (0/12, 1/12...) & Sound Toggle */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* Contador de Intrusos */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 md:px-4 md:py-2.5 shadow-xl backdrop-blur-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Search className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Intrusos
                </span>
                <span className="text-xs font-extrabold text-white">
                  <span className="text-rose-400 text-sm md:text-base font-black">
                    {foundCount}
                  </span>
                  <span className="text-slate-400 font-semibold">/{displayTotal}</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-20 md:w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className="p-2.5 md:p-3 rounded-2xl bg-slate-900/85 border border-slate-700/80 text-slate-400 hover:text-white transition shadow-xl backdrop-blur-xs cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Artwork Checklist Popover */}
      {showArtworkList && (
        <div
          data-ui-interactive="true"
          className="pointer-events-auto absolute top-20 left-3 md:left-6 w-84 max-w-[92vw] max-h-[70vh] bg-slate-900/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-slate-200 z-30 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Colección (12 Cuadros)
            </span>
            <button
              onClick={() => setShowArtworkList(false)}
              className="text-xs text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 flex-1 text-xs">
            {GALLERY_PAINTINGS_CONFIG.map((cfg) => {
              const art = artworks.find((a) => a.id === cfg.id);
              return (
                <div
                  key={cfg.id}
                  onClick={() => {
                    if (art) onNavigateToArtwork(art);
                    setShowArtworkList(false);
                  }}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-750 border border-slate-700/60 cursor-pointer flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    {art?.found && art?.intruderSrc ? (
                      <img
                        src={art.intruderSrc}
                        alt={art.intruderName}
                        className="w-7 h-7 rounded-lg object-cover border border-emerald-400/80 shadow-xs shrink-0"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {cfg.slotNumber}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white group-hover:text-rose-300 transition truncate max-w-[155px]">
                        {art?.title || cfg.title}
                      </h4>
                      <p className={`text-[10px] truncate max-w-[155px] ${art?.found ? 'text-emerald-300 font-medium' : 'text-slate-400'}`}>
                        {art?.found ? `✓ ${art.intruderName}` : 'Intruso oculto en la obra'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-sky-400 font-medium group-hover:underline shrink-0">
                    Ver &rarr;
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom spacer (no bottom dock with replacement buttons) */}
      <div />
    </div>
  );
};
