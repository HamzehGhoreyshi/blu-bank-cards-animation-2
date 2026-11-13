import { useState, useEffect, useRef } from 'react';
import { CARDS, CardFront, CardBack, randomHolder } from './cards';

export default function App() {
  const cardCount = CARDS.length;
  // One random holder per card, picked once when the page loads.
  const [holders] = useState(() => CARDS.map((c) => randomHolder(c.network)));
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameId = useRef<number>(0);

  // Continuous scroll progress
  const progress = useRef<number>(0);

  // Click → glide to the next card with a slow, eased move (1.6 s), then rest there.
  // Clicking again mid-glide extends it by one more card.
  const JUMP_MS = 1600;
  const jump = useRef<{ from: number; to: number; start: number } | null>(null);
  const virtualIndex = useRef<number>(0); // the card position actually shown last frame
  const handleClick = () => {
    const now = performance.now();
    const to = (jump.current ? jump.current.to : Math.round(virtualIndex.current)) + 1;
    jump.current = { from: virtualIndex.current, to, start: now };
  };

  // Track mouse coordinates for interactive 3D parallax tilt with inertia damping
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Responsive state containing card dimensions
  const [metrics, setMetrics] = useState({
    cardW: 336,
    cardH: 211, // 1.59 standard credit card ratio
  });

  // Typography metrics to prevent collisions beautifully across all viewports
  const [fontMetrics, setFontMetrics] = useState({
    titleFontSize: '1.5rem',
    sigFontSize: '2.5rem',
    descFontSize: '14px',
    titleGap: '40px',
    pl: '0px'
  });
  void fontMetrics;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Screen-space cursor offset relative to window center, clamped to [-1.0, 1.0] range
      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };

    const handleMouseLeave = () => {
      // Return gently to center orientation when mouse focus is lost or moves away
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. Calculate Card Metrics (shrink cards if height is small to save vertical space)
      let cardW = Math.round(w * 0.16 + 130);

      const heightFactor = Math.min(1.0, Math.max(0.65, h / 850));
      cardW = Math.round(cardW * heightFactor);

      cardW = Math.min(336, Math.max(150, cardW));
      const cardH = Math.round(cardW / 1.5925); // Standard credit card ratio

      setMetrics({ cardW, cardH });

      // 2. Calculate Typography Metrics (shrink font sizes aggressively if height or width is small)
      const isMobile = w < 640;

      let titleSize = '';
      let sigSize = '';
      let descSize = '';
      let titleGap = '40px';
      let plVal = '0px';

      if (isMobile) {
        // Mobile style: centered, text size increased by 30% for high legibility
        titleSize = 'clamp(1.8rem, 5.2vw + 0.4rem, 2.2rem)';
        sigSize = 'clamp(2.86rem, 7.8vw + 0.6rem, 3.5rem)';
        descSize = 'clamp(0.72rem, 1.4vw + 0.35rem, 0.95rem)';
        titleGap = '24px';
        plVal = '0px';
      } else {
        // Desktop / Tablet style: aligned bottom-left
        // Scale factor depends on width and height to shrink before hitting cards
        const scale = Math.min(1.0, Math.max(0.48, (w * 0.45 + h * 0.55) / 1300));

        titleSize = `${Math.max(1.15, 3.5 * scale).toFixed(3)}rem`;
        sigSize = `${Math.max(1.5, 4.5 * scale).toFixed(3)}rem`;
        descSize = `${Math.max(11, 16 * scale).toFixed(1)}px`;
        titleGap = `${Math.max(16, Math.round(40 * scale))}px`;
        plVal = `${Math.min(6, Math.max(2.8, 3.5 * scale + 2.2)).toFixed(2)}rem`;
      }

      setFontMetrics({
        titleFontSize: titleSize,
        sigFontSize: sigSize,
        descFontSize: descSize,
        titleGap,
        pl: plVal
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute positions, rotations, and visual rules at 60fps
  const renderLoop = () => {
    // No auto flow: the cards rest on the current card and only move when clicked.

    // Smoothly interpolate current mouse variables towards their target positions (damping/inertia logic)
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

    const cards = cardsRefs.current;
    const h = window.innerHeight;
    const { cardH } = metrics;

    let virtualActiveIndex: number;
    if (jump.current) {
      // Click glide: ease-in-out from where the cards were to the next card.
      const t = Math.min(1, (performance.now() - jump.current.start) / JUMP_MS);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      virtualActiveIndex = jump.current.from + (jump.current.to - jump.current.from) * e;
      if (t >= 1) {
        progress.current = jump.current.to; // rest on this card until the next click
        jump.current = null;
      }
    } else {
      const continuousProgress = progress.current;
      const roundedIndex = Math.round(continuousProgress);
      const diffFromRound = continuousProgress - roundedIndex; // ranges between [-0.5, 0.5]

      // Custom non-linear magnetic step logic
      // It creates a gorgeous brief "dwell/pause" at front center before accelerating to the next card
      const easedDiff = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2) / 2;
      virtualActiveIndex = roundedIndex + easedDiff;
    }
    virtualIndex.current = virtualActiveIndex;

    for (let i = 0; i < cardCount; i++) {
      const card = cards[i];
      if (!card) continue;

      // Solve circular wrapping to get closest representation in [-cardCount/2, cardCount/2]
      let offset = i - virtualActiveIndex;
      const halfCount = cardCount / 2;
      while (offset > halfCount) offset -= cardCount;
      while (offset < -halfCount) offset += cardCount;

      const absOffset = Math.abs(offset);
      const sign = Math.sign(offset);

      // Allow cards to render completely off-screen smoothly up to offset 3.0. This prevents any clipping or sudden pop-outs.
      if (absOffset > 3.0) {
        card.style.visibility = 'hidden';
        continue;
      } else {
        card.style.visibility = 'visible';
      }

      // Spacing gap between center card and adjacent cards
      const peekAmount = -55; // Push the card's edge 55px past the screen boundary to hide a premium portion of it!
      const D = 1350; // Perspective distance

      // Even spacing, as seen on screen: the visible gap between neighbouring cards is
      // the same everywhere. Each resting spot has its own depth (z) and turn, so its
      // on-screen half-height differs: centre card (z 400, flat), next (z 220, turned
      // 132° → 0.67 tall), next (z -60, turned 175° → nearly full height). Solve for
      // one gap G so the card two places away just reaches past the screen edge;
      // on short screens G never drops below 56 px.
      const s0 = D / (D - 400), s1 = D / (D - 220), s2 = D / (D + 60);
      const hh0 = (cardH / 2) * s0;
      const hh1 = (cardH / 2) * Math.abs(Math.cos((132 * Math.PI) / 180)) * s1;
      const hh2 = (cardH / 2) * Math.abs(Math.cos((175 * Math.PI) / 180)) * s2;
      const G = Math.max(56, (h / 2 - peekAmount - hh0 - 2 * hh1 - 2 * hh2) / 2);
      const Y1 = (hh0 + G + hh1) / s1; // resting spot of offset 1 (before perspective)
      const Y2 = (hh0 + 2 * G + 2 * hh1 + hh2) / s2; // resting spot of offset 2

      let y = 0;
      let z = 0;
      let rot = 0;

      if (absOffset <= 1) {
        // Smoothstep interpolation from 0 to 1 (Center card to first adjacent card)
        const t = absOffset;
        const easedT = t * t * (3 - 2 * t);

        // Y moves from 0 to (cardH + gap)
        y = -sign * (easedT * Y1);

        // Z moves from 400 (center) to 220 (adjacent)
        z = 400 + easedT * (220 - 400);

        // Rotation moves from 0 to 132 degrees (beautiful tilted back face)
        rot = easedT * 132;
      } else if (absOffset <= 2) {
        // Smoothstep interpolation from 1 to 2 (Adjacent card to peeking screen-edge card)
        const t = absOffset - 1;
        const easedT = t * t * (3 - 2 * t);

        const yStart = Y1;
        const zStart = 220;
        const rotStart = 132;

        const zEnd = -60;
        const rotEnd = 175;

        // Perspective-aware formula for exact edge alignment at the screen boundary (peekAmount = 26px inside)
        const sEnd = D / (D - zEnd);
        void sEnd;
        const yEnd = Y2;

        const currentY = yStart + easedT * (yEnd - yStart);
        y = -sign * currentY;

        z = zStart + easedT * (zEnd - zStart);
        rot = rotStart + easedT * (rotEnd - rotStart);
      } else {
        // Smoothstep interpolation from 2 to 3 (Peeking card to completely off-screen card)
        const t = Math.min(absOffset - 2, 1);
        const easedT = t * t * (3 - 2 * t);

        const zStart = -60;
        const rotStart = 175;

        const zEnd3 = -250;
        const rotEnd3 = 195;

        const sEnd2 = D / (D - zStart);
        void sEnd2;
        const yEnd2 = Y2;

        // Calculate yEnd3 dynamically so that the card's edge is completely 100px past the screen boundary
        const sEnd3 = D / (D - zEnd3);
        // fully off-screen, and at least one more even step out
        const yEnd3 = Math.max((h / 2 + 100) / sEnd3 + cardH / 2, Y2 + (Y2 - Y1));

        const currentY = yEnd2 + easedT * (yEnd3 - yEnd2);
        y = -sign * currentY;

        z = zStart + easedT * (zEnd3 - zStart);
        rot = rotStart + easedT * (rotEnd3 - rotStart);
      }

      const localCardRotation = -sign * rot;

      // Determine how close this card is to the exact center (1.0 = center, 0.0 = adjacent/offscreen)
      const centerFactor = Math.max(0, 1 - absOffset);

      // Vertical tilt (around X-axis) and horizontal tilt (around Y-axis) driven by mouse coordinates
      const maxTiltY = 15; // Max angle tilt left-to-right (degrees)
      const maxTiltX = 12; // Max angle tilt up-and-down (degrees)

      const activeTiltX = -mouse.current.y * maxTiltX * centerFactor;
      const activeTiltY = mouse.current.x * maxTiltY * centerFactor;

      const totalRotX = localCardRotation + activeTiltX;
      const totalRotY = activeTiltY;

      // Depth z-index layer
      card.style.zIndex = Math.round(z).toString();
      card.style.opacity = '1';

      // Lighting, read by the faces through CSS variables:
      // --gx  where the glossy streak sits (follows tilt and the roll of the card)
      // --shade how much a face darkens as it turns away from the viewer
      const facing = Math.abs(Math.cos((totalRotX * Math.PI) / 180)) * Math.cos((totalRotY * Math.PI) / 180);
      const gx = 50 + totalRotY * 3.2 + Math.sin((totalRotX * Math.PI) / 180) * 45;
      card.style.setProperty('--gx', `${gx.toFixed(1)}%`);
      card.style.setProperty('--shade', ((1 - facing) * 0.5).toFixed(3));

      // Inject translation matrix with the premium -3deg tilt combined with dynamic mouse-interactive 3D tilt
      card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) rotateZ(-3deg)`;
    }
  };

  useEffect(() => {
    const tick = () => {
      renderLoop();
      frameId.current = requestAnimationFrame(tick);
    };

    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [metrics]);

  // Card body: 7 slices across 4.4 px give a solid, visible edge when a card turns.
  // Outer slices are a darker shade of the card colour, the middle one a light core,
  // like the laminated layers of a real plastic card.
  const thicknessLayers = [-2.2, -1.47, -0.73, 0, 0.73, 1.47, 2.2];

  // Shared overlays that make each face feel physical: lighting, gloss, bevelled rim.
  const Surface = () => (
    <>
      {/* turns darker as the face rotates away */}
      <div className="absolute inset-0 rounded-[16px] bg-black" style={{ opacity: 'var(--shade, 0)' }} />
      {/* moving glossy streak */}
      <div
        className="absolute inset-0 rounded-[16px]"
        style={{
          backgroundImage:
            'linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.55) 49%, rgba(255,255,255,0.12) 53%, rgba(255,255,255,0) 62%)',
          backgroundSize: '300% 300%',
          backgroundPosition: 'var(--gx, 50%) 50%',
          mixBlendMode: 'overlay',
        }}
      />
      {/* bevelled rim: light top edge, darker bottom edge, thin glass outline */}
      <div
        className="absolute inset-0 rounded-[16px]"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.28), inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1.5px 0 rgba(0,0,0,0.25), inset 0 0 14px rgba(255,255,255,0.08)',
        }}
      />
    </>
  );

  return (
    <div
      className="absolute inset-0 bg-white text-neutral-900 flex items-center justify-center overflow-hidden select-none cursor-pointer"
      onClick={handleClick}
    >

      {/* 3D perspective camera space */}
      <div
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
        style={{
          perspective: '1350px',
        }}
      >
        {/* Dynamic 3D coordinate viewport */}
        <div
          className="absolute"
          style={{
            width: `${metrics.cardW}px`,
            height: `${metrics.cardH}px`,
            transformStyle: 'preserve-3d',
          }}
        >
          {Array.from({ length: cardCount }).map((_, i) => (
            <div
              key={i}
              ref={(el) => { cardsRefs.current[i] = el; }}
              className="absolute inset-0"
              style={{
                width: `${metrics.cardW}px`,
                height: `${metrics.cardH}px`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'visible',
              }}
            >
              {/* Build physical 3D volumetric thickness by dense parallel layering */}
              {thicknessLayers.map((zOffset, layerIdx) => {
                const isFrontFace = layerIdx === thicknessLayers.length - 1;
                const isBackFace = layerIdx === 0;

                const card = CARDS[i];
                const back = card;
                const softShadow = '0 22px 38px -16px rgba(40, 36, 80, 0.45), 0 6px 12px -6px rgba(40, 36, 80, 0.25)';

                // Edge slices
                if (!isFrontFace && !isBackFace) {
                  const core = zOffset === 0;
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] pointer-events-none"
                      style={{
                        backgroundColor: core
                          ? `color-mix(in srgb, ${back.color} 45%, white)`
                          : `color-mix(in srgb, ${back.color} 70%, black)`,
                        transform: `translateZ(${zOffset}px)`,
                      }}
                    />
                  );
                }

                // Front face: bank logo, product name, chip, holder name, card network
                if (isFrontFace) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] pointer-events-none overflow-hidden"
                      style={{
                        backgroundColor: back.color,
                        transform: `translateZ(${zOffset}px)`,
                        backfaceVisibility: 'hidden',
                        boxShadow: softShadow,
                      }}
                    >
                      <CardFront card={card} holder={holders[i].name} w={metrics.cardW} />
                      <Surface />
                    </div>
                  );
                }

                // Back face: magnetic stripe, signature panel + CVV, number, name, expiry
                if (isBackFace) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] pointer-events-none overflow-hidden"
                      style={{
                        backgroundColor: back.color,
                        transform: `translateZ(${zOffset}px) rotateX(180deg)`,
                        backfaceVisibility: 'hidden',
                        boxShadow: softShadow,
                      }}
                    >
                      <CardBack card={card} holder={holders[i]} w={metrics.cardW} h={metrics.cardH} />
                      <Surface />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
