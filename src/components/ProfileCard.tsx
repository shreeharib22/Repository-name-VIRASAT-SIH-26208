import React, {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react';

type ProfileCardProps = {
  xp?: number;
  rank?: string;
  artifacts?: number;
  worlds?: number;
  achievements?: number;
  heritageId?: string;
  playerName?: string;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
};

export function ProfileCard({
  xp = 0,
  rank = 'Explorer',
  artifacts = 0,
  worlds = 1,
  achievements = 1,
  heritageId = 'VR-001',
  playerName = 'Virasat Explorer',
  onClose,
  className = '',
  style,
}: ProfileCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  const [tilt, setTilt] = useState({
    x: -3,
    y: -8,
  });

  const [drag, setDrag] = useState({
    x: 0,
    y: 0,
  });

  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const dragOrigin = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f') {
        setFlipped((value) => !value);
      }

      if (event.key.toLowerCase() === 'r') {
        setTilt({
          x: -3,
          y: -8,
        });

        setDrag({
          x: 0,
          y: 0,
        });

        setFlipped(false);
      }

      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!stageRef.current || dragging) return;

    const rect =
      stageRef.current.getBoundingClientRect();

    const px =
      (event.clientX - rect.left) / rect.width - 0.5;

    const py =
      (event.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      x: -py * 18,
      y: px * 26,
    });
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    setDragging(true);

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    dragOrigin.current = {
      x: drag.x,
      y: drag.y,
    };
  };

  const handlePointerDrag = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!dragging) return;

    const dx =
      event.clientX - dragStart.current.x;

    const dy =
      event.clientY - dragStart.current.y;

    setDrag({
      x: dragOrigin.current.x - dy * 0.55,
      y: dragOrigin.current.y + dx * 0.55,
    });
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    setDragging(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    } catch {
      // Ignore pointer-capture errors.
    }
  };

  const cardTransform = `
    perspective(1500px)
    rotateX(${tilt.x + drag.x}deg)
    rotateY(${tilt.y + drag.y + (flipped ? 180 : 0)}deg)
    rotateZ(-2deg)
  `;

  const progress =
    Math.min(100, Math.max(0, (xp % 1000) / 10));

  return (
    <div
      className={`vr-profile-overlay ${className}`}
      style={style}
    >
      <style>{`
        .vr-profile-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            radial-gradient(
              circle at 68% 48%,
              rgba(188, 119, 40, .18),
              transparent 25%
            ),
            radial-gradient(
              circle at 23% 70%,
              rgba(24, 68, 98, .20),
              transparent 34%
            ),
            linear-gradient(
              115deg,
              #03070c 0%,
              #07101a 44%,
              #130a06 100%
            );

          user-select: none;
        }

        .vr-profile-overlay::before {
          content: "";
          position: absolute;
          inset: -30%;

          background:
            radial-gradient(
              circle,
              rgba(255, 174, 75, .75) 0 2px,
              transparent 3px
            );

          background-size: 120px 170px;
          opacity: .13;

          animation:
            vrProfileDust 16s linear infinite;

          pointer-events: none;
        }

        @keyframes vrProfileDust {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(-100px, -180px, 0);
          }
        }

        .vr-profile-vignette {
          position: absolute;
          inset: 0;

          background:
            radial-gradient(
              ellipse at center,
              transparent 32%,
              rgba(0, 0, 0, .45) 72%,
              rgba(0, 0, 0, .88) 100%
            );

          pointer-events: none;
        }

        .vr-profile-ambient {
          position: absolute;

          width: 560px;
          height: 560px;

          left: 56%;
          top: 53%;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(224, 155, 54, .22),
              transparent 63%
            );

          filter: blur(22px);

          pointer-events: none;
        }

        .vr-profile-stage {
          position: relative;
          z-index: 4;

          width: min(1200px, 95vw);
          height: min(770px, 90vh);

          display: flex;
          align-items: center;
          justify-content: flex-end;

          padding-right: 13%;

          perspective: 1800px;

          touch-action: none;
        }

        /* ---------------------------------------
           LEFT SIDE TEXT
        --------------------------------------- */

        .vr-profile-intro {
          position: absolute;

          left: 3%;
          top: 15%;

          width: min(420px, 36vw);

          z-index: 3;
        }

        .vr-profile-kicker {
          margin-bottom: 18px;

          color:
            rgba(240, 210, 157, .60);

          font-size: 10px;
          letter-spacing: .34em;
          text-transform: uppercase;
        }

        .vr-profile-heading {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(42px, 5vw, 72px);

          line-height: .94;

          letter-spacing: -.025em;

          color: #efe3c8;

          text-shadow:
            0 2px 22px rgba(0, 0, 0, .70);
        }

        .vr-profile-line {
          width: 170px;
          height: 1px;

          margin: 26px 0;

          background:
            linear-gradient(
              90deg,
              rgba(229, 179, 89, .82),
              transparent
            );
        }

        .vr-profile-copy {
          max-width: 370px;

          margin: 0;

          font-size: 13px;
          line-height: 1.9;

          color:
            rgba(224, 215, 196, .50);
        }

        /* ---------------------------------------
           SWORD
        --------------------------------------- */

        .vr-profile-sword {
          position: absolute;

          left: 8%;
          bottom: 7%;

          width: 150px;
          height: 625px;

          z-index: 2;

          transform:
            translateZ(40px)
            rotate(-4deg);

          transform-origin:
            center bottom;

          pointer-events: none;

          filter:
            drop-shadow(
              0 0 18px
              rgba(218, 158, 65, .30)
            )
            drop-shadow(
              0 30px 35px
              rgba(0, 0, 0, .75)
            );
        }

        .vr-profile-sword-blade {
          position: absolute;

          left: 64px;
          top: 108px;

          width: 31px;
          height: 395px;

          clip-path:
            polygon(
              18% 0,
              82% 0,
              100% 91%,
              50% 100%,
              0 91%
            );

          background:
            linear-gradient(
              90deg,
              #4d4437 0%,
              #bba77e 14%,
              #f3e5bd 40%,
              #fff6d8 50%,
              #ae905b 72%,
              #433b2e 100%
            );

          box-shadow:
            inset 0 0 5px
              rgba(255,255,255,.46),

            0 0 15px
              rgba(238,196,105,.18);
        }

        .vr-profile-sword-blade::after {
          content: "";

          position: absolute;

          left: 11px;
          top: 0;

          width: 2px;
          height: 100%;

          background:
            linear-gradient(
              to bottom,
              rgba(255,255,255,.95),
              rgba(255,255,255,.14)
            );

          opacity: .74;
        }

        .vr-profile-sword-edge {
          position: absolute;

          left: 80px;
          top: 112px;

          width: 2px;
          height: 375px;

          background:
            linear-gradient(
              to bottom,
              rgba(255,255,255,.9),
              rgba(255,255,255,.10)
            );

          opacity: .72;
        }

        .vr-profile-sword-guard {
          position: absolute;

          left: 40px;
          top: 92px;

          width: 82px;
          height: 25px;

          border-radius: 50%;

          background:
            linear-gradient(
              to bottom,
              #33230f,
              #d4a649 42%,
              #755021 72%,
              #24170c
            );

          border:
            1px solid
            rgba(247, 213, 139, .70);

          box-shadow:
            0 0 16px
              rgba(224, 162, 62, .24);
        }

        .vr-profile-sword-guard::before,
        .vr-profile-sword-guard::after {
          content: "";

          position: absolute;
          top: 4px;

          width: 12px;
          height: 16px;

          border:
            1px solid
            rgba(245, 207, 126, .48);

          background:
            linear-gradient(
              135deg,
              #8f6828,
              #e8c275
            );
        }

        .vr-profile-sword-guard::before {
          left: -10px;

          transform:
            skewY(-25deg);
        }

        .vr-profile-sword-guard::after {
          right: -10px;

          transform:
            skewY(25deg);
        }

        .vr-profile-sword-handle {
          position: absolute;

          left: 71px;
          top: 24px;

          width: 20px;
          height: 75px;

          border-radius: 8px;

          background:
            repeating-linear-gradient(
              0deg,
              #241c12 0 8px,
              #a7782e 8px 11px
            );

          border:
            1px solid
            rgba(224, 185, 104, .56);

          box-shadow:
            0 0 12px
              rgba(226, 164, 65, .18);
        }

        .vr-profile-sword-handle::before {
          content: "";

          position: absolute;

          inset: 5px 4px;

          border-left:
            1px solid
            rgba(255, 218, 138, .22);

          border-right:
            1px solid
            rgba(255, 218, 138, .16);
        }

        .vr-profile-sword-pommel {
          position: absolute;

          left: 63px;
          top: 4px;

          width: 36px;
          height: 36px;

          border-radius: 50%;

          border:
            2px solid
            rgba(235, 194, 104, .74);

          background:
            radial-gradient(
              circle,
              #e1b95f 0 16%,
              #765021 17% 42%,
              #23160a 43% 70%,
              #c7963e 71% 74%,
              transparent 75%
            );

          box-shadow:
            0 0 20px
              rgba(234, 179, 68, .30);
        }

        .vr-profile-sword-gem {
          position: absolute;

          left: 76px;
          top: 11px;

          width: 10px;
          height: 10px;

          border-radius: 50%;

          background:
            #f5d37d;

          box-shadow:
            0 0 14px
              rgba(255, 213, 111, .95);
        }

        .vr-profile-sword-base {
          position: absolute;

          left: 43px;
          bottom: 0;

          width: 76px;
          height: 48px;

          border-radius: 50%;

          background:
            radial-gradient(
              ellipse at center,
              rgba(236, 174, 73, .78),
              rgba(65, 40, 17, .72) 45%,
              transparent 73%
            );

          filter: blur(2px);
        }

        .vr-profile-sword-base::after {
          content: "";

          position: absolute;

          left: 21px;
          top: 10px;

          width: 34px;
          height: 19px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255, 211, 104, .98),
              rgba(217, 145, 40, .35) 40%,
              transparent 73%
            );

          box-shadow:
            0 0 27px
              rgba(228, 164, 55, .72);

          animation:
            vrSwordGlow 2.2s
            ease-in-out
            infinite;
        }

        @keyframes vrSwordGlow {
          0%,
          100% {
            opacity: .62;
            transform: scale(.90);
          }

          50% {
            opacity: 1;
            transform: scale(1.13);
          }
        }

        /* ---------------------------------------
           CARD
        --------------------------------------- */

        .vr-profile-card {
          position: relative;

          width: min(365px, 72vw);

          aspect-ratio: .64;

          transform-style: preserve-3d;

          cursor: grab;

          will-change: transform;

          transition:
            transform
            160ms
            cubic-bezier(.2,.8,.2,1);
        }

        .vr-profile-card:active {
          cursor: grabbing;
        }

        .vr-profile-face {
          position: absolute;
          inset: 0;

          overflow: hidden;

          border-radius: 8px;

          transform-style: preserve-3d;

          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;

          background:
            linear-gradient(
              145deg,
              #19120c,
              #080c10 52%,
              #171009
            );

          box-shadow:
            0 44px 95px
              rgba(0,0,0,.78),

            0 15px 32px
              rgba(0,0,0,.60),

            0 0 48px
              rgba(211,147,62,.20);
        }

        .vr-profile-back {
          transform:
            rotateY(180deg);
        }

        /* ---------------------------------------
           ORNATE FRAME
        --------------------------------------- */

        .vr-profile-frame-outer {
          position: absolute;
          inset: 7px;

          border:
            2px solid
            rgba(205,159,77,.84);

          box-shadow:
            inset 0 0 0 1px
              rgba(255,224,158,.26),

            inset 0 0 25px
              rgba(224,164,74,.15);

          pointer-events: none;
        }

        .vr-profile-frame-inner {
          position: absolute;
          inset: 17px;

          border:
            1px solid
            rgba(244,207,127,.48);

          box-shadow:
            inset 0 0 20px
              rgba(218,153,59,.08);

          pointer-events: none;
        }

        .vr-profile-corner {
          position: absolute;

          width: 45px;
          height: 45px;

          border-color:
            rgba(226,178,90,.82);

          border-style: solid;

          opacity: .84;

          pointer-events: none;
        }

        .vr-profile-corner.tl {
          top: 10px;
          left: 10px;

          border-width:
            3px 0 0 3px;
        }

        .vr-profile-corner.tr {
          top: 10px;
          right: 10px;

          border-width:
            3px 3px 0 0;
        }

        .vr-profile-corner.bl {
          bottom: 10px;
          left: 10px;

          border-width:
            0 0 3px 3px;
        }

        .vr-profile-corner.br {
          bottom: 10px;
          right: 10px;

          border-width:
            0 3px 3px 0;
        }

        .vr-profile-ornament {
          position: absolute;

          left: 50%;

          width: 54px;
          height: 54px;

          transform:
            translateX(-50%)
            rotate(45deg);

          border:
            1px solid
            rgba(234,193,104,.62);

          background:
            linear-gradient(
              145deg,
              rgba(236,194,99,.16),
              rgba(42,30,15,.38)
            );

          box-shadow:
            0 0 20px
              rgba(228,169,71,.08);
        }

        .vr-profile-ornament.top {
          top: -19px;
        }

        .vr-profile-ornament.bottom {
          bottom: -19px;
        }

        /* ---------------------------------------
           CARD CONTENT
        --------------------------------------- */

        .vr-profile-content {
          position: relative;
          z-index: 3;

          height: 100%;

          padding:
            28px 31px;

          display: flex;
          flex-direction: column;

          color: #eee2c3;

          transform:
            translateZ(36px);
        }

        .vr-profile-top {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 14px;
        }

        .vr-profile-brand {
          font-size: 10px;
          font-weight: 700;

          letter-spacing: .27em;

          color:
            rgba(240,211,156,.72);
        }

        .vr-profile-id {
          font-size: 8px;

          letter-spacing: .16em;

          color:
            rgba(237,219,181,.42);
        }

        .vr-profile-central {
          flex: 1;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          position: relative;

          min-height: 0;
        }

        .vr-profile-emblem {
          position: relative;

          width: 135px;
          height: 135px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            radial-gradient(
              circle,
              rgba(236,178,70,.24),
              rgba(13,15,17,.74) 60%,
              transparent 61%
            );

          border:
            1px solid
            rgba(235,193,101,.65);

          box-shadow:
            0 0 35px
              rgba(221,157,56,.16),

            inset 0 0 30px
              rgba(224,172,72,.10);
        }

        .vr-profile-emblem::before,
        .vr-profile-emblem::after {
          content: "";

          position: absolute;

          border-radius: 50%;

          border:
            1px dashed
            rgba(235,193,101,.48);
        }

        .vr-profile-emblem::before {
          inset: 11px;
        }

        .vr-profile-emblem::after {
          inset: 27px;

          border-style: solid;
        }

        .vr-profile-emblem-mark {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 34px;
          font-weight: 700;

          letter-spacing: .09em;

          color: #efcc83;

          text-shadow:
            0 0 23px
            rgba(235,187,89,.58);
        }

        .vr-profile-name {
          margin-top: 28px;

          text-align: center;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(25px, 4vw, 34px);

          line-height: 1;

          color: #f5ead1;

          text-shadow:
            0 2px 16px
            rgba(0,0,0,.72);
        }

        .vr-profile-role {
          margin-top: 9px;

          text-align: center;

          font-size: 8px;

          letter-spacing: .28em;

          text-transform: uppercase;

          color:
            rgba(236,214,173,.48);
        }

        .vr-profile-rank {
          margin-top: 18px;

          padding:
            7px 15px;

          border:
            1px solid
            rgba(223,179,94,.35);

          background:
            rgba(191,142,54,.07);

          color: #e5c27e;

          font-size: 8px;

          letter-spacing: .20em;

          text-transform: uppercase;
        }

        .vr-profile-stats {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 6px;

          margin-top: 18px;

          width: 100%;
        }

        .vr-profile-stat {
          padding:
            10px 5px;

          text-align: center;

          border:
            1px solid
            rgba(220,181,103,.15);

          background:
            rgba(255,255,255,.018);
        }

        .vr-profile-stat-value {
          display: block;

          font-size: 17px;
          font-weight: 700;

          color: #f1dfb9;
        }

        .vr-profile-stat-label {
          display: block;

          margin-top: 5px;

          font-size: 6px;

          letter-spacing: .16em;

          text-transform: uppercase;

          color:
            rgba(231,215,182,.42);
        }

        /* ---------------------------------------
           XP AREA
        --------------------------------------- */

        .vr-profile-bottom {
          border-top:
            1px solid
            rgba(230,190,106,.19);

          padding-top: 15px;
        }

        .vr-profile-xp-head {
          display: flex;

          justify-content: space-between;

          font-size: 7px;

          letter-spacing: .14em;

          text-transform: uppercase;

          color:
            rgba(231,216,185,.44);
        }

        .vr-profile-xp-track {
          margin-top: 7px;

          height: 3px;

          background:
            rgba(255,255,255,.07);
        }

        .vr-profile-xp-fill {
          height: 100%;

          background:
            linear-gradient(
              90deg,
              #77501f,
              #d3a756,
              #f7e0a5
            );

          box-shadow:
            0 0 12px
            rgba(223,173,74,.42);
        }

        .vr-profile-footer {
          display: flex;

          justify-content: space-between;
          align-items: flex-end;

          margin-top: 13px;
        }

        .vr-profile-footer-label {
          font-size: 7px;

          letter-spacing: .14em;

          color:
            rgba(231,214,179,.38);
        }

        .vr-profile-footer-value {
          margin-top: 4px;

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            monospace;

          font-size: 9px;

          letter-spacing: .15em;

          color: #e2bc6d;
        }

        .vr-profile-chip {
          width: 35px;
          height: 24px;

          border-radius: 5px;

          border:
            1px solid
            rgba(239,202,128,.45);

          background:
            linear-gradient(
              135deg,
              rgba(255,228,163,.30),
              rgba(109,74,25,.12)
            );
        }

        /* ---------------------------------------
           HOLOGRAPHIC EFFECTS
        --------------------------------------- */

        .vr-profile-holo {
          position: absolute;

          inset: -40%;

          pointer-events: none;

          background:
            linear-gradient(
              116deg,
              transparent 32%,
              rgba(255,255,255,.04) 42%,
              rgba(255,208,102,.22) 49%,
              rgba(104,199,255,.14) 53%,
              rgba(255,255,255,.04) 59%,
              transparent 68%
            );

          transform:
            rotate(8deg)
            translateX(-15%);

          animation:
            vrHoloSweep
            4.8s
            ease-in-out
            infinite;

          mix-blend-mode: screen;

          z-index: 5;
        }

        @keyframes vrHoloSweep {
          0%,
          100% {
            transform:
              rotate(8deg)
              translateX(-28%);
          }

          48%,
          58% {
            transform:
              rotate(8deg)
              translateX(16%);
          }
        }

        .vr-profile-scan {
          position: absolute;

          left: 8%;
          right: 8%;

          top: 20%;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(249,209,124,.72),
              transparent
            );

          box-shadow:
            0 0 14px
            rgba(231,175,72,.52);

          animation:
            vrScan
            3.4s
            linear
            infinite;

          opacity: .5;

          pointer-events: none;

          z-index: 6;
        }

        @keyframes vrScan {
          0% {
            top: 18%;
            opacity: 0;
          }

          12% {
            opacity: .65;
          }

          88% {
            opacity: .65;
          }

          100% {
            top: 88%;
            opacity: 0;
          }
        }

        .vr-profile-noise {
          position: absolute;
          inset: 0;

          background-image:
            radial-gradient(
              rgba(255,255,255,.8) .6px,
              transparent .6px
            );

          background-size: 5px 5px;

          opacity: .055;

          pointer-events: none;

          z-index: 7;

          mix-blend-mode: screen;
        }

        .vr-profile-glare {
          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              120deg,
              transparent 0 38%,
              rgba(255,210,119,.11) 46%,
              rgba(255,255,255,.05) 49%,
              transparent 57%
            );

          z-index: 8;

          mix-blend-mode: screen;
        }

        /* ---------------------------------------
           BACK
        --------------------------------------- */

        .vr-profile-back-content {
          height: 100%;

          padding: 31px;

          position: relative;

          z-index: 4;

          color: #eee2c3;

          transform:
            translateZ(36px);
        }

        .vr-profile-back-title {
          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 31px;

          color: #edd093;
        }

        .vr-profile-back-subtitle {
          margin-top: 8px;

          font-size: 8px;

          letter-spacing: .26em;

          color:
            rgba(232,211,172,.44);

          text-transform: uppercase;
        }

        .vr-profile-back-rule {
          margin: 24px 0;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              rgba(229,185,92,.65),
              transparent
            );
        }

        .vr-profile-back-grid {
          display: grid;

          gap: 8px;
        }

        .vr-profile-back-row {
          display: flex;

          justify-content: space-between;

          padding: 12px 11px;

          border:
            1px solid
            rgba(225,188,107,.13);

          background:
            rgba(255,255,255,.018);
        }

        .vr-profile-back-row span:first-child {
          font-size: 7px;

          letter-spacing: .13em;

          text-transform: uppercase;

          color:
            rgba(233,214,177,.42);
        }

        .vr-profile-back-row span:last-child {
          font-size: 10px;
          font-weight: 700;

          color: #ebc97f;
        }

        .vr-profile-back-copy {
          margin-top: 22px;

          font-size: 11px;

          line-height: 1.8;

          color:
            rgba(227,215,188,.48);
        }

        /* ---------------------------------------
           CONTROLS
        --------------------------------------- */

        .vr-profile-controls {
          position: absolute;

          z-index: 7;

          bottom: 28px;
          left: 50%;

          transform:
            translateX(-50%);

          padding:
            9px 15px;

          border:
            1px solid
            rgba(218,181,106,.16);

          background:
            rgba(2,5,8,.54);

          backdrop-filter:
            blur(12px);

          color:
            rgba(227,210,174,.42);

          border-radius: 999px;

          font-size: 7px;

          letter-spacing: .13em;

          text-transform: uppercase;

          white-space: nowrap;
        }

        .vr-profile-close {
          position: absolute;

          z-index: 20;

          top: 25px;
          right: 25px;

          padding:
            10px 14px;

          border:
            1px solid
            rgba(222,186,106,.22);

          background:
            rgba(4,7,10,.55);

          color:
            rgba(236,217,178,.65);

          border-radius: 7px;

          font-size: 8px;

          letter-spacing: .16em;

          text-transform: uppercase;

          cursor: pointer;
        }

        .vr-profile-close:hover {
          border-color:
            rgba(231,191,103,.52);

          color:
            #f4dfad;
        }

        /* ---------------------------------------
           RESPONSIVE
        --------------------------------------- */

        @media (max-width: 950px) {
          .vr-profile-stage {
            justify-content: center;
            padding-right: 0;
          }

          .vr-profile-intro {
            display: none;
          }

          .vr-profile-sword {
            left: 4%;
            transform:
              translateZ(20px)
              rotate(-4deg)
              scale(.72);

            transform-origin:
              center bottom;
          }
        }

        @media (max-width: 650px) {
          .vr-profile-sword {
            display: none;
          }

          .vr-profile-card {
            width:
              min(325px, 82vw);
          }

          .vr-profile-controls {
            max-width: 90vw;

            overflow: hidden;
            text-overflow: ellipsis;
          }

          .vr-profile-close {
            top: 16px;
            right: 16px;
          }
        }
      `}</style>

      <div className="vr-profile-ambient" />

      <div className="vr-profile-vignette" />

      <button
        className="vr-profile-close"
        onClick={onClose}
      >
        CLOSE · ESC
      </button>

      <div className="vr-profile-intro">
        <div className="vr-profile-kicker">
          VIRASAT · HERITAGE ARCHIVE
        </div>

        <h1 className="vr-profile-heading">
          The
          <br />
          Explorer
        </h1>

        <div className="vr-profile-line" />

        <p className="vr-profile-copy">
          Your expedition through India's civilization,
          preserved as a digital heritage profile.
          Discover monuments, solve cultural puzzles,
          collect artifacts and unlock the stories behind
          the past.
        </p>
      </div>

      <div
        ref={stageRef}
        className="vr-profile-stage"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (!dragging) {
            setTilt({
              x: -3,
              y: -8,
            });
          }
        }}
        onDoubleClick={() =>
          setFlipped((value) => !value)
        }
        onPointerMoveCapture={handlePointerDrag}
      >
        {/* SWORD */}
        <div className="vr-profile-sword">
          <div className="vr-profile-sword-pommel" />

          <div className="vr-profile-sword-gem" />

          <div className="vr-profile-sword-handle" />

          <div className="vr-profile-sword-guard" />

          <div className="vr-profile-sword-blade" />

          <div className="vr-profile-sword-edge" />

          <div className="vr-profile-sword-base" />
        </div>

        {/* PROFILE CARD */}
        <div
          className="vr-profile-card"
          style={{
            transform: cardTransform,
            transition: dragging
              ? 'none'
              : 'transform 160ms cubic-bezier(.2,.8,.2,1)',
          }}
        >
          {/* FRONT */}
          <div className="vr-profile-face">
            <div className="vr-profile-frame-outer" />
            <div className="vr-profile-frame-inner" />

            <div className="vr-profile-corner tl" />
            <div className="vr-profile-corner tr" />
            <div className="vr-profile-corner bl" />
            <div className="vr-profile-corner br" />

            <div className="vr-profile-ornament top" />
            <div className="vr-profile-ornament bottom" />

            <div className="vr-profile-holo" />
            <div className="vr-profile-scan" />
            <div className="vr-profile-noise" />
            <div className="vr-profile-glare" />

            <div className="vr-profile-content">
              <div className="vr-profile-top">
                <div className="vr-profile-brand">
                  VIRASAT
                </div>

                <div className="vr-profile-id">
                  ARCHIVE · {heritageId}
                </div>
              </div>

              <div className="vr-profile-central">
                <div className="vr-profile-emblem">
                  <div className="vr-profile-emblem-mark">
                    VR
                  </div>
                </div>

                <div className="vr-profile-name">
                  {playerName}
                </div>

                <div className="vr-profile-role">
                  PLAYER PROFILE
                </div>

                <div className="vr-profile-rank">
                  {rank}
                </div>

                <div className="vr-profile-stats">
                  <div className="vr-profile-stat">
                    <span className="vr-profile-stat-value">
                      {xp}
                    </span>

                    <span className="vr-profile-stat-label">
                      XP
                    </span>
                  </div>

                  <div className="vr-profile-stat">
                    <span className="vr-profile-stat-value">
                      {artifacts}
                    </span>

                    <span className="vr-profile-stat-label">
                      ARTIFACTS
                    </span>
                  </div>

                  <div className="vr-profile-stat">
                    <span className="vr-profile-stat-value">
                      {worlds}
                    </span>

                    <span className="vr-profile-stat-label">
                      WORLDS
                    </span>
                  </div>
                </div>
              </div>

              <div className="vr-profile-bottom">
                <div className="vr-profile-xp-head">
                  <span>
                    HERITAGE PROGRESSION
                  </span>

                  <span>
                    {achievements} ACHIEVEMENTS
                  </span>
                </div>

                <div className="vr-profile-xp-track">
                  <div
                    className="vr-profile-xp-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="vr-profile-footer">
                  <div>
                    <div className="vr-profile-footer-label">
                      HERITAGE ID
                    </div>

                    <div className="vr-profile-footer-value">
                      {heritageId}
                    </div>
                  </div>

                  <div className="vr-profile-chip" />
                </div>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="vr-profile-face vr-profile-back">
            <div className="vr-profile-frame-outer" />
            <div className="vr-profile-frame-inner" />

            <div className="vr-profile-corner tl" />
            <div className="vr-profile-corner tr" />
            <div className="vr-profile-corner bl" />
            <div className="vr-profile-corner br" />

            <div className="vr-profile-holo" />
            <div className="vr-profile-noise" />

            <div className="vr-profile-back-content">
              <div className="vr-profile-back-title">
                VIRASAT
              </div>

              <div className="vr-profile-back-subtitle">
                HERITAGE PASSPORT · PLAYER DOSSIER
              </div>

              <div className="vr-profile-back-rule" />

              <div className="vr-profile-back-grid">
                <div className="vr-profile-back-row">
                  <span>
                    EXPLORER
                  </span>

                  <span>
                    {playerName}
                  </span>
                </div>

                <div className="vr-profile-back-row">
                  <span>
                    RANK
                  </span>

                  <span>
                    {rank}
                  </span>
                </div>

                <div className="vr-profile-back-row">
                  <span>
                    EXPERIENCE
                  </span>

                  <span>
                    {xp} XP
                  </span>
                </div>

                <div className="vr-profile-back-row">
                  <span>
                    ARTIFACTS
                  </span>

                  <span>
                    {artifacts}
                  </span>
                </div>

                <div className="vr-profile-back-row">
                  <span>
                    WORLDS
                  </span>

                  <span>
                    {worlds}
                  </span>
                </div>

                <div className="vr-profile-back-row">
                  <span>
                    ACHIEVEMENTS
                  </span>

                  <span>
                    {achievements}
                  </span>
                </div>
              </div>

              <p className="vr-profile-back-copy">
                Every discovery becomes part of your
                heritage journey. Your profile records
                the monuments explored, stories learned,
                artifacts recovered and challenges solved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="vr-profile-controls">
        HOVER TO TILT · DRAG TO ROTATE · DOUBLE CLICK / F TO FLIP
      </div>
    </div>
  );
}