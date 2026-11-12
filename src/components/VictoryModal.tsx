/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Compass, CheckCircle2 } from 'lucide-react';
import { ArtworkData } from '../types';

interface VictoryModalProps {
  artworks: ArtworkData[];
  onRestart: () => void;
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ artworks, onRestart, onContinue }) => {
  useEffect(() => {
    // Launch celebratory fireworks
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#10b981'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#10b981'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100 overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400" />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          ¡Misión Cumplida!
        </h2>
        <p className="text-sm text-amber-300 font-medium mt-1 mb-4">
          Encontraste todos los elementos intrusos en la galería
        </p>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed max-w-sm mx-auto">
          Tu agudeza visual ha identificado con éxito los 12 elementos intrusos ocultos en las obras maestras de la galería.
        </p>

        {/* Found intruders checklist */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 mb-6 text-left space-y-2.5 max-h-52 overflow-y-auto">
          {artworks.map((art) => (
            <div key={art.id} className="flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {art.intruderSrc ? (
                <img
                  src={art.intruderSrc}
                  alt={art.intruderName}
                  className="w-6 h-6 rounded-md object-cover border border-emerald-500/60 shrink-0"
                />
              ) : null}
              <div className="truncate">
                <span className="font-semibold text-slate-200">{art.title}: </span>
                <span className="text-amber-300/90 font-medium">{art.intruderName}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Desafío</span>
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Seguir Explorando</span>
          </button>
        </div>
      </div>
    </div>
  );
};
