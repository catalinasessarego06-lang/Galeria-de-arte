/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activeTouchId = useRef<number | null>(null);

  const radius = 48; // Max thumbstick radius in px

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsDragging(true);
    updateVector(touch.clientX, touch.clientY);
  };

  const updateVector = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance > radius) {
        dx = (dx / distance) * radius;
        dy = (dy / distance) * radius;
      }

      setKnobPos({ x: dx, y: dy });
      onMove({
        x: dx / radius,
        y: dy / radius,
      });
    },
    [onMove, radius]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          updateVector(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [updateVector]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          activeTouchId.current = null;
          setIsDragging(false);
          setKnobPos({ x: 0, y: 0 });
          onMove({ x: 0, y: 0 });
          break;
        }
      }
    },
    [onMove]
  );

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      data-ui-interactive="true"
      className="relative w-32 h-32 rounded-full bg-slate-900/60 border border-white/20 shadow-xl flex items-center justify-center select-none touch-none backdrop-blur-xs pointer-events-auto"
      style={{
        boxShadow: isDragging ? '0 0 16px rgba(244, 63, 94, 0.4)' : 'none',
      }}
    >
      {/* Center crosshair */}
      <div className="absolute w-2 h-2 rounded-full bg-white/30" />
      <div className="absolute w-8 h-8 rounded-full border border-white/15" />

      {/* Dynamic Thumb Knob */}
      <div
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 border-2 border-white/80 shadow-md flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white/40" />
      </div>

      <span className="absolute -bottom-5 text-[10px] uppercase tracking-widest text-white/50 font-medium">
        Caminar
      </span>
    </div>
  );
};
