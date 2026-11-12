/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Play } from 'lucide-react';

interface WelcomeModalProps {
  onStart: (enableGyro?: boolean, enableMic?: boolean) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md select-none overflow-hidden">
      {/* Ambient museum lighting backdrop glow */}
      <div className="absolute w-[440px] h-[440px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Frame container: exact 1156:1563 natural aspect ratio without distortion */}
      <div className="relative w-[min(90vw,calc(85vh*0.7396),410px)] aspect-[1156/1563] flex items-center justify-center animate-in fade-in zoom-in-95 duration-300 drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        {/* Inner Canvas / Placard perfectly centered inside the frame aperture */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ padding: '19.5% 17.3% 14% 17.3%' }}
        >
          <div className="w-full h-full bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 rounded-lg p-3 sm:p-4.5 flex flex-col items-center justify-between text-center shadow-inner border border-amber-900/40 overflow-hidden">
            {/* Title Section */}
            <div className="space-y-1 pt-1 w-full shrink-0 flex flex-col items-center">
              <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
              <h1 className="font-serif text-xl sm:text-2xl md:text-[26px] font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-sm leading-tight text-center">
                Galería de Arte 3D
              </h1>
              <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
            </div>

            {/* Mission Section (Clean, centered, and well-spaced) */}
            <div className="my-auto px-1 sm:px-2 py-1 space-y-1.5 sm:space-y-2 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                <span>Misión del Juego</span>
              </div>
              <p className="text-xs sm:text-[13px] md:text-sm text-stone-200 leading-relaxed font-sans font-medium max-w-[240px] sm:max-w-[270px] text-center">
                Recorre la galería y observa cada pintura con atención. Tu misión es descubrir los elementos intrusos ocultos en las obras y tocarlos para completar la colección.
              </p>
            </div>

            {/* Enter Button Section */}
            <div className="w-full pb-1 shrink-0 flex justify-center">
              <button
                onClick={() => onStart(true, false)}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-950/60 hover:shadow-amber-500/30 active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 border border-amber-200/50"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>Ingresar al Juego</span>
              </button>
            </div>
          </div>
        </div>

        {/* User's Ornate Golden Baroque Frame (recoratado) rendered with exact natural aspect ratio */}
        <img
          src="/assets/aistudio/cuadro_cortado.png"
          alt="Marco dorado ornamental - Galería de Arte 3D"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
        />
      </div>
    </div>
  );
};
