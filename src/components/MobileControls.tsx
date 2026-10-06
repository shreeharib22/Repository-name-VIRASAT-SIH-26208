import { useRef, useState } from 'react';

type Stick = {
  x: number;
  y: number;
};

function emitMove(stick: Stick) {
  window.dispatchEvent(
    new CustomEvent('virasat-mobile-move', {
      detail: stick,
    }),
  );
}

function emitAction(action: 'jump' | 'interact', pressed: boolean) {
  window.dispatchEvent(
    new CustomEvent('virasat-mobile-action', {
      detail: { action, pressed },
    }),
  );
}

export default function MobileControls() {
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [stick, setStick] = useState<Stick>({ x: 0, y: 0 });

  const updateStick = (clientX: number, clientY: number) => {
    const base = joystickRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const max = rect.width * 0.34;
    const distance = Math.hypot(dx, dy);

    const scale = distance > max ? max / distance : 1;

    const x = (dx * scale) / max;
    const y = (dy * scale) / max;

    const next = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    };

    setStick(next);
    emitMove(next);
  };

  const resetStick = () => {
    pointerIdRef.current = null;
    setStick({ x: 0, y: 0 });
    emitMove({ x: 0, y: 0 });
  };

  return (
    <div className="mobile-controls" aria-label="Mobile game controls">
      <div
        ref={joystickRef}
        className="mobile-joystick"
        onPointerDown={(event) => {
          pointerIdRef.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateStick(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (pointerIdRef.current !== event.pointerId) return;
          updateStick(event.clientX, event.clientY);
        }}
        onPointerUp={resetStick}
        onPointerCancel={resetStick}
      >
        <div
          className="mobile-joystick-knob"
          style={{
            transform: `translate(calc(-50% + ${stick.x * 38}px), calc(-50% + ${stick.y * 38}px))`,
          }}
        />
      </div>

      <div className="mobile-action-stack">
        <button
          type="button"
          className="mobile-action-btn"
          onPointerDown={() => emitAction('jump', true)}
          onPointerUp={() => emitAction('jump', false)}
          onPointerCancel={() => emitAction('jump', false)}
        >
          JUMP
        </button>

        <button
          type="button"
          className="mobile-action-btn mobile-action-btn-small"
          onPointerDown={() => emitAction('interact', true)}
          onPointerUp={() => emitAction('interact', false)}
          onPointerCancel={() => emitAction('interact', false)}
        >
          INTERACT
        </button>
      </div>
    </div>
  );
}