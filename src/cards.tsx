import React from 'react';

// Nine of the most premium cards in the world, drawn in code (no image files):
// brushed metal, laser-etched type, no number on the front. Logos are simple
// geometric nods to each brand, not copies of the official artwork.
// `color` is the card body (also used for the edge), `ink` the etched text colour.

export type Network = 'visa' | 'mastercard' | 'none';

export interface PremiumCard {
  brand: string; // name used in the fine print on the back
  tier: string; // product name on the front ('' = none)
  network: Network;
  color: string;
  ink: string;
  bg: string; // CSS background of both faces (the metal)
  Logo: (p: { u: number; ink: string }) => React.ReactElement;
  Art?: (p: { u: number; ink: string }) => React.ReactElement; // optional centre piece
}

const sans = '"Montserrat", system-ui, sans-serif';
const serif = '"Cormorant Garamond", Georgia, serif';

// Laser etching: a fine light edge under the letters and a dark one above.
const etch = (ink: string, dark: boolean): React.CSSProperties => ({
  color: ink,
  textShadow: dark
    ? '0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.6)'
    : '0 1px 0 rgba(255,255,255,0.75), 0 -0.5px 0 rgba(0,0,0,0.12)',
});

// Brushed-metal grain laid over each base colour.
const brushed = (strength: number) =>
  `repeating-linear-gradient(90deg, rgba(255,255,255,${strength}) 0 1px, rgba(0,0,0,${strength * 0.8}) 1px 2px, rgba(255,255,255,0) 2px 4px)`;

// ---------- logo motifs ----------

// Outlined apple, engraved into the metal (no wordmark, like the real card).
function AppleLogo({ u, ink }: { u: number; ink: string }) {
  return (
    <svg width={8.4 * u} height={10 * u} viewBox="0 0 84 100" fill="none" stroke={ink} strokeWidth="2.6" strokeLinejoin="round">
      <path d="M42 30 C33 22 14 23 8 44 C2 66 18 94 31 95 C37 95 39 92 42 92 C45 92 48 95 54 95 C64 94 74 80 79 69 C68 64 64 51 72 41 C67 33 59 28 51 30 C47 31 45 32 42 30 Z" />
      <path d="M44 24 C44 13 53 4 62 3 C62 14 53 23 44 24 Z" />
    </svg>
  );
}

// Silver six-pad chip of the Apple Card.
function SilverChip({ u }: { u: number }) {
  return (
    <svg width={12 * u} height={9.4 * u} viewBox="0 0 48 37">
      <defs>
        <linearGradient id="chipSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F4F6" />
          <stop offset="0.5" stopColor="#C9CBD0" />
          <stop offset="1" stopColor="#E6E7EA" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((r) =>
        [0, 1].map((c) => (
          <rect
            key={`${r}${c}`}
            x={1 + c * 24}
            y={1 + r * 12}
            width="22"
            height="10.5"
            rx="5.2"
            fill="url(#chipSilver)"
            stroke="#A9ACB2"
            strokeWidth="0.8"
          />
        )),
      )}
    </svg>
  );
}

// X card (matched to the photo): one huge X pressed into matte black metal. The
// thick stroke is hollow (outline + inner cut-out), it runs the full height and
// bleeds off the bottom edge. Silver chip top-left, wide techy name top-right.
const X_PATH =
  'M714 519L1161 0H1055L667 451L357 0H0L468 682L0 1226H106L515 750L843 1226H1200L714 519ZM569 688L522 620L144 80H307L611 516L659 584L1055 1150H892L569 688Z';

function XFront({ card, holder, u }: { card: PremiumCard; holder: string; u: number }) {
  const h = 63 * u; // X height ≈ card height, so it bleeds off the bottom
  const w = (h * 1200) / 1227;
  const box = { left: 25 * u, top: 5 * u, width: w, height: h };
  return (
    <div className="absolute inset-0" style={{ background: card.bg }}>
      {/* shadow side of the pressing (down-right) */}
      <svg className="absolute" style={{ ...box, transform: `translate(${0.35 * u}px, ${0.45 * u}px)` }} viewBox="0 0 1200 1227">
        <path d={X_PATH} fillRule="evenodd" fill="rgba(0,0,0,0.85)" />
      </svg>
      {/* lit side of the pressing (up-left) */}
      <svg className="absolute" style={{ ...box, transform: `translate(${-0.25 * u}px, ${-0.25 * u}px)` }} viewBox="0 0 1200 1227">
        <path d={X_PATH} fillRule="evenodd" fill="rgba(255,255,255,0.22)" />
      </svg>
      {/* the X face: a touch glossier than the matte card */}
      <svg className="absolute" style={box} viewBox="0 0 1200 1227">
        <defs>
          <linearGradient id="xFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1D1D20" />
            <stop offset="0.5" stopColor="#111113" />
            <stop offset="1" stopColor="#0B0B0C" />
          </linearGradient>
        </defs>
        <path d={X_PATH} fillRule="evenodd" fill="url(#xFace)" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      </svg>

      <div className="absolute" style={{ left: 8 * u, top: 6 * u }}>
        <Chip u={u} silver />
      </div>
      <div
        className="absolute whitespace-nowrap"
        style={{
          right: 6 * u,
          top: 8.6 * u,
          fontFamily: '"Michroma", "Montserrat", sans-serif',
          fontSize: 2.9 * u,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#E9E9EC',
          textShadow: '0 0 1px rgba(255,255,255,0.25)',
        }}
      >
        {holder}
      </div>
    </div>
  );
}

// Visa Platinum: brushed gunmetal, silver chip on the left, name bottom-left,
// a silver VISA with "Platinum" under it bottom-right. No issuer logo.
function VisaPlatinumFront({ card, holder, u }: { card: PremiumCard; holder: string; u: number }) {
  return (
    <div className="absolute inset-0" style={{ background: card.bg }}>
      <div className="absolute" style={{ left: 11 * u, top: 25 * u }}>
        <Chip u={u} silver />
      </div>
      <div
        className="absolute whitespace-nowrap"
        style={{
          left: 11 * u,
          bottom: 12 * u,
          fontFamily: sans,
          fontSize: 3.6 * u,
          fontWeight: 400,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#D6D8DC',
          textShadow: '0 -1px 0 rgba(0,0,0,0.7)',
        }}
      >
        {holder}
      </div>
      <div className="absolute flex flex-col items-end" style={{ right: 6 * u, bottom: 5.5 * u }}>
        <span
          style={{
            fontFamily: sans,
            fontWeight: 800,
            fontStyle: 'italic',
            fontSize: 9 * u,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #DADCE0 50%, #A9ACB2 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.5))',
          }}
        >
          VISA
        </span>
        <span style={{ fontFamily: sans, fontSize: 3.4 * u, fontWeight: 500, color: '#E4E5E8', marginTop: 0.4 * u }}>Platinum</span>
      </div>
    </div>
  );
}

// Mastercard World Elite: spun gunmetal, silver six-pad chip, "world elite" in
// spaced lower case, a silver interlocking-circles mark with "mastercard" under it.
function WorldEliteFront({ card, holder, u }: { card: PremiumCard; holder: string; u: number }) {
  void holder;
  return (
    <div className="absolute inset-0" style={{ background: card.bg }}>
      <div className="absolute" style={{ left: 11 * u, top: 20 * u, filter: 'brightness(0.78) contrast(1.15)' }}>
        <SilverChip u={u} />
      </div>
      <div
        className="absolute whitespace-nowrap"
        style={{
          left: 11 * u,
          top: 45 * u,
          fontFamily: sans,
          fontSize: 3.4 * u,
          fontWeight: 400,
          letterSpacing: '0.2em',
          color: '#C9CBCF',
          textShadow: '0 -1px 0 rgba(0,0,0,0.6)',
        }}
      >
        world elite
      </div>
      <div className="absolute flex flex-col items-center" style={{ right: 6 * u, bottom: 4.5 * u }}>
        <svg width={18 * u} height={11.25 * u} viewBox="0 0 48 30">
          <defs>
            <radialGradient id="mcSilverA" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#C5C7CC" />
              <stop offset="1" stopColor="#8C8F95" />
            </radialGradient>
            <radialGradient id="mcSilverB" cx="0.65" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#F4F4F6" />
              <stop offset="0.6" stopColor="#B4B7BC" />
              <stop offset="1" stopColor="#7E8187" />
            </radialGradient>
            <clipPath id="mcLeft">
              <circle cx="17" cy="15" r="13.2" />
            </clipPath>
          </defs>
          <circle cx="17" cy="15" r="13.2" fill="url(#mcSilverA)" />
          <circle cx="31" cy="15" r="13.2" fill="url(#mcSilverB)" />
          <circle cx="31" cy="15" r="13.2" fill="#5F6268" clipPath="url(#mcLeft)" />
        </svg>
        <span style={{ fontFamily: sans, fontSize: 3.4 * u, fontWeight: 500, color: '#E6E7EA', marginTop: 0.4 * u, letterSpacing: '0.01em' }}>
          mastercard
        </span>
      </div>
    </div>
  );
}

// The Apple Card front is almost empty: apple, name, chip — nothing else.
function AppleFront({ card, holder, u }: { card: PremiumCard; holder: string; u: number }) {
  return (
    <div className="absolute inset-0" style={{ background: card.bg }}>
      <div className="absolute" style={{ left: 8.5 * u, top: 8 * u, filter: 'drop-shadow(0 0.6px 0 rgba(255,255,255,0.9))' }}>
        <AppleLogo u={u} ink="#A3A5AB" />
      </div>
      <div
        className="absolute whitespace-nowrap"
        style={{
          left: 8.5 * u,
          top: 33 * u,
          fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", "Inter", Arial, sans-serif',
          fontSize: 5 * u,
          fontWeight: 500,
          letterSpacing: '0.01em',
          color: '#6E7076',
          textShadow: '0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {holder}
      </div>
      <div className="absolute" style={{ right: 13 * u, top: 37 * u }}>
        <SilverChip u={u} />
      </div>
    </div>
  );
}

function XLogo({ u, ink }: { u: number; ink: string }) {
  return (
    <svg width={7 * u} height={7 * u} viewBox="0 0 100 100" fill={ink}>
      <path d="M8 6h27l57 88H65z" />
      <path d="M84 6h9L56 47l-5-7zM16 94H7l38-42 5 7z" />
    </svg>
  );
}

function AmexWordmark({ u, ink }: { u: number; ink: string }) {
  return (
    <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 4.4 * u, letterSpacing: '0.2em', lineHeight: 1, color: ink }}>
      AMERICAN EXPRESS
    </span>
  );
}

function JPMorganLogo({ u, ink }: { u: number; ink: string }) {
  return (
    <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 5.6 * u, letterSpacing: '0.12em', lineHeight: 1, color: ink }}>
      J.P. MORGAN
    </span>
  );
}

function ChaseLogo({ u, ink }: { u: number; ink: string }) {
  const s = 6 * u;
  return (
    <div className="flex items-center" style={{ gap: 1.8 * u }}>
      <svg width={s} height={s} viewBox="0 0 40 40" fill={ink}>
        <path d="M14 2h18l-8 8H6z" />
        <path d="M38 14v18l-8-8V6z" />
        <path d="M26 38H8l8-8h18z" />
        <path d="M2 26V8l8 8v18z" />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 4.6 * u, letterSpacing: '0.08em', color: ink }}>CHASE</span>
    </div>
  );
}

function LuxuryLogo({ u, ink }: { u: number; ink: string }) {
  return (
    <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 3.8 * u, letterSpacing: '0.34em', lineHeight: 1, color: ink }}>
      LUXURY CARD
    </span>
  );
}

// Engraved guilloche medallion (Amex style), centred on the card.
function Medallion({ u, ink }: { u: number; ink: string }) {
  const d = 25 * u;
  return (
    <div
      className="absolute rounded-full"
      style={{
        width: d,
        height: d,
        left: `calc(50% - ${d / 2}px)`,
        top: `calc(50% - ${d / 2 + 2 * u}px)`,
        backgroundImage: `repeating-radial-gradient(circle, ${ink} 0 0.6px, rgba(0,0,0,0) 0.6px ${1.1 * u}px), repeating-conic-gradient(from 0deg, rgba(255,255,255,0.06) 0 4deg, rgba(0,0,0,0.06) 4deg 8deg)`,
        opacity: 0.32,
        boxShadow: `0 0 0 ${0.4 * u}px ${ink}`,
      }}
    />
  );
}

// Sapphire Reserve: a faceted gem outline etched in the middle.
function Gem({ u, ink }: { u: number; ink: string }) {
  return (
    <svg
      className="absolute"
      style={{ left: `calc(50% - ${11 * u}px)`, top: `calc(50% - ${11 * u}px)`, opacity: 0.22 }}
      width={22 * u}
      height={18 * u}
      viewBox="0 0 100 82"
      fill="none"
      stroke={ink}
      strokeWidth="1.4"
    >
      <path d="M20 2h60l18 24L50 80 2 26z" />
      <path d="M2 26h96M20 2l12 24L50 80M80 2 68 26 50 80M32 26 50 2l18 24" />
    </svg>
  );
}

// ---------- the seven cards ----------

export const CARDS: PremiumCard[] = [
  {
    brand: 'Apple Card',
    tier: '',
    network: 'mastercard',
    color: '#E6E7EA',
    ink: '#8E9097',
    // smooth white titanium: no brush lines, only a soft sheen
    bg: 'linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 65%), linear-gradient(135deg, #FFFFFF 0%, #F6F6F8 55%, #ECEDF0 100%)',
    Logo: AppleLogo,
  },
  {
    brand: 'X Money',
    tier: '',
    network: 'visa',
    color: '#141416',
    ink: '#E8E8EA',
    // matte black: a soft lift of light top-right, fine grain, darker lower-left
    bg: 'repeating-radial-gradient(circle at 37% 61%, rgba(255,255,255,0.018) 0 0.5px, rgba(0,0,0,0) 0.5px 1.7px), repeating-radial-gradient(circle at 73% 29%, rgba(0,0,0,0.12) 0 0.5px, rgba(0,0,0,0) 0.5px 2.3px), radial-gradient(110% 120% at 85% 0%, #2A2A2D 0%, #18181A 45%, #0D0D0E 100%)',
    Logo: XLogo,
  },
  {
    brand: 'Visa Platinum',
    tier: '',
    network: 'visa',
    color: '#1E1F22',
    ink: '#D6D8DC',
    // horizontally brushed gunmetal with a bright streak of light across the top
    bg: 'radial-gradient(60% 45% at 52% 0%, rgba(255,255,255,0.32), rgba(255,255,255,0) 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.18) 1px 2px, rgba(255,255,255,0.02) 2px 3px, rgba(0,0,0,0) 3px 5px), repeating-linear-gradient(0deg, rgba(255,255,255,0) 0 13px, rgba(255,255,255,0.035) 13px 14px, rgba(255,255,255,0) 14px 29px), linear-gradient(180deg, #3A3C40 0%, #1C1D20 45%, #141517 100%)',
    Logo: XLogo,
  },
  {
    brand: 'Mastercard World Elite',
    tier: '',
    network: 'mastercard',
    color: '#2A2B2E',
    ink: '#CFD1D5',
    // spun metal: fine circular grain from the centre, light caught in a cross of four lobes
    bg: 'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.12) 1px 2px, rgba(0,0,0,0) 2px 3px), conic-gradient(from 20deg at 50% 50%, #1B1C1F 0deg, #8E9096 40deg, #2A2B2F 85deg, #1A1B1E 135deg, #7A7C82 215deg, #26272A 265deg, #1B1C1F 360deg)',
    Logo: XLogo,
  },
  {
    brand: 'American Express',
    tier: 'Centurion',
    network: 'none',
    color: '#1A1A1C',
    ink: '#B9BBC0',
    bg: `${brushed(0.03)}, radial-gradient(100% 80% at 50% 45%, rgba(255,255,255,0.08), rgba(255,255,255,0) 70%), linear-gradient(140deg, #0E0E10 0%, #2A2A2E 55%, #121214 100%)`,
    Logo: AmexWordmark,
    Art: Medallion,
  },
  {
    brand: 'American Express',
    tier: 'Platinum Card',
    network: 'none',
    color: '#C9CBD0',
    ink: '#55585F',
    bg: `${brushed(0.07)}, linear-gradient(110deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0) 65%), linear-gradient(135deg, #E4E5E9 0%, #B9BCC2 50%, #D6D8DC 100%)`,
    Logo: AmexWordmark,
    Art: Medallion,
  },
  {
    brand: 'J.P. Morgan',
    tier: 'Reserve',
    network: 'visa',
    color: '#8E9096',
    ink: '#24262B',
    bg: `${brushed(0.06)}, linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.45) 48%, rgba(255,255,255,0) 66%), linear-gradient(135deg, #A9ABB1 0%, #7D8087 50%, #9A9CA2 100%)`,
    Logo: JPMorganLogo,
  },
  {
    brand: 'Chase',
    tier: 'Sapphire Reserve',
    network: 'visa',
    color: '#13243F',
    ink: '#D9DEE8',
    bg: `${brushed(0.03)}, radial-gradient(90% 120% at 100% 100%, rgba(110,150,220,0.28), rgba(0,0,0,0) 60%), linear-gradient(135deg, #0A1528 0%, #18304F 50%, #0C182C 100%)`,
    Logo: ChaseLogo,
    Art: Gem,
  },
  {
    brand: 'Luxury Card',
    tier: 'Gold Card',
    network: 'mastercard',
    color: '#C9A24A',
    ink: '#5E4313',
    bg: `${brushed(0.06)}, linear-gradient(115deg, rgba(255,255,255,0) 28%, rgba(255,246,214,0.75) 46%, rgba(255,255,255,0) 64%), linear-gradient(135deg, #E9CD84 0%, #B88E36 50%, #D8B663 100%)`,
    Logo: LuxuryLogo,
  },
];

const isDark = (c: PremiumCard) => ['#141416', '#1A1A1C', '#13243F', '#1E1F22', '#2A2B2E'].includes(c.color);

// ---------- shared card parts ----------

export function Chip({ u, silver = false }: { u: number; silver?: boolean }) {
  const id = silver ? 'chipSilverEmv' : 'chipGold';
  return (
    <svg width={11 * u} height={8.6 * u} viewBox="0 0 48 37">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={silver ? '#F2F2F4' : '#F3DE9A'} />
          <stop offset="0.5" stopColor={silver ? '#A9ACB3' : '#C9A44E'} />
          <stop offset="1" stopColor={silver ? '#DCDDE1' : '#E9CF82'} />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="47" height="36" rx="6" fill={`url(#${id})`} stroke={silver ? '#7C7F86' : '#9C7C32'} strokeWidth="0.8" />
      <g stroke={silver ? '#6F727A' : '#8E6F2A'} strokeWidth="0.9" fill="none" opacity="0.75">
        <path d="M0 12h15M0 25h15M33 12h15M33 25h15M15 0v37M33 0v37" />
        <rect x="15" y="9" width="18" height="19" rx="3" />
      </g>
    </svg>
  );
}

export function Contactless({ u, ink }: { u: number; ink: string }) {
  return (
    <svg width={4.4 * u} height={5.8 * u} viewBox="0 0 20 26" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" opacity="0.9">
      <path d="M3 9a6 6 0 010 8" />
      <path d="M7.5 6a10.5 10.5 0 010 14" />
      <path d="M12 3a15 15 0 010 20" />
      <path d="M16.5 0.5a19 19 0 010 25" />
    </svg>
  );
}

// Network marks in the card's etched ink (premium metal cards print them in one colour).
export function NetworkMark({ network, u, ink }: { network: Network; u: number; ink: string }) {
  if (network === 'none') return null;
  if (network === 'visa') {
    return (
      <span style={{ fontFamily: sans, fontWeight: 800, fontStyle: 'italic', fontSize: 7 * u, lineHeight: 1, letterSpacing: '-0.02em', color: ink }}>
        VISA
      </span>
    );
  }
  return (
    <svg width={12.5 * u} height={7.8 * u} viewBox="0 0 48 30" fill="none" stroke={ink} strokeWidth="2.2">
      <circle cx="17" cy="15" r="13" />
      <circle cx="31" cy="15" r="13" />
    </svg>
  );
}

// ---------- front ----------

export function CardFront({ card, holder, w }: { card: PremiumCard; holder: string; w: number }) {
  const u = w / 100; // 1 unit = 1% of card width
  const dark = isDark(card);
  const { Logo, Art } = card;
  if (card.brand === 'Apple Card') return <AppleFront card={card} holder={holder} u={u} />;
  if (card.brand === 'X Money') return <XFront card={card} holder={holder} u={u} />;
  if (card.brand === 'Visa Platinum') return <VisaPlatinumFront card={card} holder={holder} u={u} />;
  if (card.brand === 'Mastercard World Elite') return <WorldEliteFront card={card} holder={holder} u={u} />;
  return (
    <div className="absolute inset-0" style={{ background: card.bg, fontFamily: sans }}>
      {Art && <Art u={u} ink={card.ink} />}

      <div className="absolute" style={{ left: 7 * u, top: 7 * u, ...etch(card.ink, dark) }}>
        <Logo u={u} ink={card.ink} />
      </div>

      {card.tier && (
        <div
          className="absolute text-right"
          style={{
            right: 7 * u,
            // Amex cards carry no network mark, so their product name takes the bottom-right corner
            ...(card.network === 'none' ? { bottom: 7.4 * u } : { top: 7.8 * u }),
            fontFamily: serif,
            fontSize: 3.6 * u,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            lineHeight: 1,
            ...etch(card.ink, dark),
          }}
        >
          {card.tier}
        </div>
      )}

      <div className="absolute flex items-center" style={{ left: 7 * u, top: 25 * u, gap: 2.6 * u }}>
        <Chip u={u} />
        <Contactless u={u} ink={card.ink} />
      </div>

      <div
        className="absolute whitespace-nowrap"
        style={{
          left: 7 * u,
          bottom: 7 * u,
          fontSize: 3.2 * u,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          ...etch(card.ink, dark),
        }}
      >
        {holder}
      </div>

      <div className="absolute" style={{ right: 7 * u, bottom: 6.5 * u }}>
        <NetworkMark network={card.network} u={u} ink={card.ink} />
      </div>
    </div>
  );
}

// ---------- back ----------

// Apple Card back (matched to the photo): plain white, silver "Goldman Sachs"
// top-left, outline Mastercard circles + "mastercard" top-right, light silver
// stripe across the bottom. No number, name or signature panel.
const silverText: React.CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #D9DADD 0%, #8F9298 55%, #B8BABF 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 0.5px 0 rgba(255,255,255,0.9))',
};

function AppleBack({ card, u }: { card: PremiumCard; u: number }) {
  return (
    <div className="absolute inset-0" style={{ background: card.bg }}>
      <div className="absolute" style={{ left: 7.8 * u, top: 7 * u, fontFamily: serif, fontWeight: 600, fontSize: 4.9 * u, lineHeight: 0.92, ...silverText }}>
        Goldman
        <br />
        Sachs
      </div>
      <div className="absolute flex flex-col items-center" style={{ right: 6.5 * u, top: 6.3 * u }}>
        <svg width={20.6 * u} height={12.9 * u} viewBox="0 0 48 30" fill="none">
          <defs>
            <linearGradient id="appleMcSilver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E4E5E8" />
              <stop offset="0.5" stopColor="#9DA0A6" />
              <stop offset="1" stopColor="#CDCFD3" />
            </linearGradient>
          </defs>
          <circle cx="17" cy="15" r="13.6" stroke="url(#appleMcSilver)" strokeWidth="0.9" />
          <circle cx="31" cy="15" r="13.6" stroke="url(#appleMcSilver)" strokeWidth="0.9" />
        </svg>
        <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 3 * u, lineHeight: 1, marginTop: 0.6 * u, ...silverText }}>mastercard</span>
      </div>
      {/* light silver stripe, flush with the bottom edge */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '23%',
          backgroundImage: 'linear-gradient(180deg, #D3D4D8 0%, #C6C8CC 40%, #D8D9DC 100%), linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0))',
          boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.06)',
        }}
      />
    </div>
  );
}

export function CardBack({
  card,
  holder,
  w,
  h,
}: {
  card: PremiumCard;
  holder: { name: string; number: string; exp: string; cvv: string };
  w: number;
  h: number;
}) {
  const u = w / 100;
  const v = h / 100;
  if (card.brand === 'Apple Card') return <AppleBack card={card} u={u} />;
  const dark = isDark(card);
  const text = etch(card.ink, dark);
  return (
    <div className="absolute inset-0" style={{ background: card.bg, fontFamily: sans }}>
      {/* magnetic stripe */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: 9 * v,
          height: 18 * v,
          backgroundColor: '#18161A',
          backgroundImage: 'linear-gradient(180deg, #121014 0%, #2E2A2C 45%, #221F22 70%, #141215 100%)',
        }}
      />

      {/* number, name, expiry, CVV — etched, like the backs of metal cards */}
      <div className="absolute" style={{ left: 7 * u, top: 38 * v, ...text }}>
        <div style={{ fontSize: 5.2 * u, fontWeight: 500, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
          {holder.number}
        </div>
        <div className="flex items-end" style={{ gap: 5 * u, marginTop: 3 * u }}>
          {[
            { label: 'VALID THRU', value: holder.exp },
            { label: 'CVV', value: holder.cvv },
          ].map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: 1.9 * u, letterSpacing: '0.14em', opacity: 0.8 }}>{f.label}</div>
              <div style={{ fontSize: 3.4 * u, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 3 * u, fontSize: 3 * u, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {holder.name}
        </div>
      </div>

      <div
        className="absolute"
        style={{ left: 7 * u, bottom: 5.5 * u, fontSize: 1.8 * u, letterSpacing: '0.04em', maxWidth: 60 * u, lineHeight: 1.4, ...text, opacity: 0.8 }}
      >
        Concept design, not a real card. {card.brand} and its marks belong to their owners.
      </div>
      <div className="absolute" style={{ right: 7 * u, bottom: 5 * u, transform: 'scale(0.75)', transformOrigin: 'right bottom' }}>
        <NetworkMark network={card.network} u={u} ink={card.ink} />
      </div>
    </div>
  );
}

// ---------- random holder data ----------

const FIRST = ['Olivia', 'James', 'Sophia', 'Liam', 'Emma', 'Noah', 'Ava', 'Lucas', 'Mia', 'Ethan', 'Isabella', 'Oliver', 'Amelia', 'Leo', 'Charlotte', 'Daniel', 'Hannah', 'Adam', 'Sara', 'Elias'];
const LAST = ['Carter', 'Bennett', 'Hughes', 'Foster', 'Reed', 'Morgan', 'Hayes', 'Brooks', 'Sullivan', 'Parker', 'Collins', 'Ward', 'Fischer', 'Laurent', 'Rossi', 'Novak', 'Keller', 'Hart'];

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pickOne = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

// Visa numbers start with 4, Mastercard with 51–55, American Express with 34/37
// (15 digits, 4-6-5 groups). Last digit is a valid Luhn check digit. Made up.
function randomCardNumber(network: Network): string {
  const amex = network === 'none';
  const len = amex ? 15 : 16;
  const prefix = amex ? pickOne(['34', '37']) : network === 'visa' ? '4' : `5${randInt(1, 5)}`;
  const digits = prefix.split('').map(Number);
  while (digits.length < len - 1) digits.push(randInt(0, 9));
  let sum = 0;
  for (let k = 0; k < len - 1; k++) {
    let d = digits[len - 2 - k];
    if (k % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  digits.push((10 - (sum % 10)) % 10);
  const s = digits.join('');
  return amex ? `${s.slice(0, 4)} ${s.slice(4, 10)} ${s.slice(10)}` : s.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function randomHolder(network: Network) {
  return {
    name: `${pickOne(FIRST)} ${pickOne(LAST)}`,
    number: randomCardNumber(network),
    exp: `${String(randInt(1, 12)).padStart(2, '0')}/${randInt(27, 31)}`,
    cvv: String(randInt(network === 'none' ? 1000 : 100, network === 'none' ? 9999 : 999)),
  };
}
