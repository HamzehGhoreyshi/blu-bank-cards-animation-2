import React from 'react';

// Seven cards from some of the best-known banks in the world, drawn in code
// (no image files). Wordmarks are set in type and the logo motifs are simple
// geometric nods to each brand, not copies of the official artwork.
// `color` is the card body (also used for the edge), `ink` the text colour.

export type Network = 'visa' | 'mastercard';

export interface BankCard {
  bank: string; // full name, used on the back
  tier: string; // product name on the front
  network: Network;
  color: string;
  ink: string;
  bg: string; // CSS background of the front
  Logo: (p: { u: number; ink: string }) => React.ReactElement;
}

const sans = '"Montserrat", system-ui, sans-serif';
const serif = '"Cormorant Garamond", Georgia, serif';

// ---------- logo motifs ----------

function ChaseLogo({ u, ink }: { u: number; ink: string }) {
  // Octagon made of four turning blades around a square hole, plus the wordmark.
  const s = 7 * u;
  return (
    <div className="flex items-center" style={{ gap: 2 * u }}>
      <svg width={s} height={s} viewBox="0 0 40 40" fill={ink}>
        <path d="M14 2h18l-8 8H6z" />
        <path d="M38 14v18l-8-8V6z" transform="translate(0 0)" />
        <path d="M26 38H8l8-8h18z" />
        <path d="M2 26V8l8 8v18z" />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 5.4 * u, letterSpacing: '0.04em' }}>CHASE</span>
    </div>
  );
}

function HsbcLogo({ u, ink }: { u: number; ink: string }) {
  // Hexagon of red and white triangles, plus the wordmark.
  const w = 11 * u;
  return (
    <div className="flex items-center" style={{ gap: 2 * u }}>
      <svg width={w} height={w / 2} viewBox="0 0 60 30">
        <rect x="15" y="0" width="30" height="30" fill="#fff" />
        <path d="M15 0h30L30 15z" fill="#DB0011" />
        <path d="M15 30h30L30 15z" fill="#DB0011" />
        <path d="M0 15L15 0v30z" fill="#DB0011" />
        <path d="M60 15L45 0v30z" fill="#DB0011" />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 5.6 * u, letterSpacing: '0.02em', color: ink }}>HSBC</span>
    </div>
  );
}

function CitiLogo({ u, ink }: { u: number; ink: string }) {
  // Lower-case wordmark with a red arc over it.
  return (
    <div className="relative" style={{ paddingTop: 2.2 * u }}>
      <svg
        className="absolute"
        style={{ left: 3.2 * u, top: 0 }}
        width={10 * u}
        height={4 * u}
        viewBox="0 0 50 20"
        fill="none"
      >
        <path d="M3 18 Q25 -4 47 18" stroke="#E31B23" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 8 * u, lineHeight: 1, letterSpacing: '-0.02em', color: ink }}>citi</span>
    </div>
  );
}

function BofaLogo({ u, ink }: { u: number; ink: string }) {
  // Flag-like ribbon mark beside a stacked wordmark.
  return (
    <div className="flex items-center" style={{ gap: 2 * u }}>
      <svg width={8 * u} height={5 * u} viewBox="0 0 40 25">
        <path d="M0 6 L20 0 L40 6 L20 12z" fill="#E31837" />
        <path d="M0 13 L20 7 L40 13 L20 19z" fill={ink} />
        <path d="M0 20 L20 14 L40 20 L20 26z" fill="#E31837" />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 3.6 * u, letterSpacing: '0.08em', lineHeight: 1.15, color: ink }}>
        BANK OF
        <br />
        AMERICA
      </span>
    </div>
  );
}

function BarclaysLogo({ u, ink }: { u: number; ink: string }) {
  // Wide-tracked wordmark with a small shield mark.
  return (
    <div className="flex items-center" style={{ gap: 2 * u }}>
      <svg width={5 * u} height={6 * u} viewBox="0 0 25 30" fill={ink}>
        <path d="M2 2h21v12c0 8-6 13-10.5 15C8 27 2 22 2 14z" />
        <path d="M8 10l4.5 7 4.5-7" stroke="#00AEEF" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 5.2 * u, letterSpacing: '0.16em', color: ink }}>BARCLAYS</span>
    </div>
  );
}

function GoldmanLogo({ u }: { u: number; ink: string }) {
  // Serif name stacked inside a solid square.
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: 14 * u,
        height: 14 * u,
        backgroundColor: '#5A84B4',
        color: '#fff',
        fontFamily: serif,
        fontWeight: 600,
        fontSize: 3.5 * u,
        lineHeight: 0.95,
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.35)',
      }}
    >
      <span>Goldman</span>
      <span>Sachs</span>
    </div>
  );
}

function DeutscheLogo({ u, ink }: { u: number; ink: string }) {
  // Square frame with a rising diagonal, plus the wordmark.
  const s = 7.5 * u;
  return (
    <div className="flex items-center" style={{ gap: 2.2 * u }}>
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" stroke={ink}>
        <rect x="3" y="3" width="34" height="34" strokeWidth="5" />
        <path d="M11 29L29 11" strokeWidth="5" />
      </svg>
      <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 4.8 * u, letterSpacing: '0.01em', color: ink }}>Deutsche Bank</span>
    </div>
  );
}

// ---------- the seven cards ----------

export const CARDS: BankCard[] = [
  {
    bank: 'JPMorgan Chase',
    tier: 'Sapphire Reserve',
    network: 'visa',
    color: '#13305A',
    ink: '#FFFFFF',
    bg: 'linear-gradient(135deg, #0A1B36 0%, #1B4277 48%, #0E2446 100%)',
    Logo: ChaseLogo,
  },
  {
    bank: 'HSBC',
    tier: 'Premier',
    network: 'mastercard',
    color: '#2A2B2E',
    ink: '#FFFFFF',
    bg: 'linear-gradient(140deg, #1A1B1E 0%, #3A3C41 55%, #202125 100%)',
    Logo: HsbcLogo,
  },
  {
    bank: 'Citibank',
    tier: 'Double Cash',
    network: 'mastercard',
    color: '#0A5AA0',
    ink: '#FFFFFF',
    bg: 'linear-gradient(135deg, #003A70 0%, #056DAE 60%, #2B8FD0 100%)',
    Logo: CitiLogo,
  },
  {
    bank: 'Bank of America',
    tier: 'Premium Rewards',
    network: 'visa',
    color: '#0B2A6B',
    ink: '#FFFFFF',
    bg: 'linear-gradient(160deg, #012169 0%, #0A2F7A 50%, #011A52 100%)',
    Logo: BofaLogo,
  },
  {
    bank: 'Barclays',
    tier: 'Visa Infinite',
    network: 'visa',
    color: '#0089C7',
    ink: '#FFFFFF',
    bg: 'linear-gradient(135deg, #00395D 0%, #0076B6 50%, #00AEEF 100%)',
    Logo: BarclaysLogo,
  },
  {
    bank: 'Goldman Sachs',
    tier: 'World Elite',
    network: 'mastercard',
    color: '#E9ECF0',
    ink: '#24303E',
    bg: 'linear-gradient(135deg, #F7F8FA 0%, #E3E7EC 55%, #CDD3DB 100%)',
    Logo: GoldmanLogo,
  },
  {
    bank: 'Deutsche Bank',
    tier: 'Platinum',
    network: 'mastercard',
    color: '#0018A8',
    ink: '#FFFFFF',
    bg: 'linear-gradient(135deg, #000F6E 0%, #0018A8 55%, #1A35C4 100%)',
    Logo: DeutscheLogo,
  },
];

// Extra pattern per card, drawn over the front background.
const FRONT_PATTERN: Record<string, React.CSSProperties> = {
  'JPMorgan Chase': {
    backgroundImage:
      'repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, rgba(255,255,255,0) 1px 3px), radial-gradient(90% 120% at 100% 100%, rgba(120,170,255,0.25), rgba(0,0,0,0) 60%)',
  },
  HSBC: {
    backgroundImage:
      'linear-gradient(120deg, rgba(219,0,17,0) 58%, rgba(219,0,17,0.85) 58.2%, rgba(219,0,17,0.85) 64%, rgba(219,0,17,0) 64.2%), linear-gradient(120deg, rgba(255,255,255,0) 66%, rgba(255,255,255,0.08) 66.2%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0) 70.2%)',
  },
  Citibank: {
    backgroundImage:
      'radial-gradient(70% 140% at 110% 120%, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%), radial-gradient(40% 70% at 95% 105%, rgba(227,27,35,0.35), rgba(227,27,35,0) 70%)',
  },
  'Bank of America': {
    backgroundImage:
      'linear-gradient(174deg, rgba(0,0,0,0) 58%, #E31837 58.2%, #E31837 62%, rgba(255,255,255,0.92) 62.2%, rgba(255,255,255,0.92) 64.4%, #E31837 64.6%, #E31837 68.4%, rgba(0,0,0,0) 68.6%)',
  },
  Barclays: {
    backgroundImage:
      'repeating-radial-gradient(circle at 110% -10%, rgba(255,255,255,0.09) 0 2px, rgba(255,255,255,0) 2px 14px)',
  },
  'Goldman Sachs': {
    backgroundImage:
      'repeating-linear-gradient(90deg, rgba(0,0,0,0.018) 0 1px, rgba(0,0,0,0) 1px 3px), linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0) 60%)',
  },
  'Deutsche Bank': {
    backgroundImage:
      'linear-gradient(135deg, rgba(255,255,255,0) 52%, rgba(255,255,255,0.1) 52.2%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 60.2%), linear-gradient(135deg, rgba(255,255,255,0) 64%, rgba(255,255,255,0.06) 64.2%, rgba(255,255,255,0.06) 76%, rgba(255,255,255,0) 76.2%)',
  },
};

// ---------- shared card parts ----------

export function Chip({ u }: { u: number }) {
  return (
    <svg width={12 * u} height={9.4 * u} viewBox="0 0 48 37">
      <defs>
        <linearGradient id="chipGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3DE9A" />
          <stop offset="0.5" stopColor="#C9A44E" />
          <stop offset="1" stopColor="#E9CF82" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="47" height="36" rx="6" fill="url(#chipGold)" stroke="#9C7C32" strokeWidth="0.8" />
      <g stroke="#8E6F2A" strokeWidth="0.9" fill="none" opacity="0.75">
        <path d="M0 12h15M0 25h15M33 12h15M33 25h15M15 0v37M33 0v37" />
        <rect x="15" y="9" width="18" height="19" rx="3" />
      </g>
    </svg>
  );
}

export function Contactless({ u, ink }: { u: number; ink: string }) {
  return (
    <svg width={5 * u} height={6.5 * u} viewBox="0 0 20 26" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" opacity="0.85">
      <path d="M3 9a6 6 0 010 8" />
      <path d="M7.5 6a10.5 10.5 0 010 14" />
      <path d="M12 3a15 15 0 010 20" />
      <path d="M16.5 0.5a19 19 0 010 25" />
    </svg>
  );
}

export function NetworkMark({ network, u, ink }: { network: Network; u: number; ink: string }) {
  if (network === 'visa') {
    return (
      <span
        style={{
          fontFamily: sans,
          fontWeight: 800,
          fontStyle: 'italic',
          fontSize: 8.4 * u,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: ink,
        }}
      >
        VISA
      </span>
    );
  }
  // Two overlapping circles; the overlap is drawn in orange via a clip.
  const id = `mc-${Math.round(u * 1000)}`;
  return (
    <svg width={15 * u} height={9.4 * u} viewBox="0 0 48 30">
      <defs>
        <clipPath id={id}>
          <circle cx="17" cy="15" r="14" />
        </clipPath>
      </defs>
      <circle cx="17" cy="15" r="14" fill="#EB001B" />
      <circle cx="31" cy="15" r="14" fill="#F79E1B" />
      <circle cx="31" cy="15" r="14" fill="#FF5F00" clipPath={`url(#${id})`} />
    </svg>
  );
}

// ---------- front ----------

export function CardFront({ card, holder, w }: { card: BankCard; holder: string; w: number }) {
  const u = w / 100; // 1 unit = 1% of card width
  const { Logo } = card;
  return (
    <div className="absolute inset-0" style={{ background: card.bg, color: card.ink, fontFamily: sans }}>
      <div className="absolute inset-0" style={FRONT_PATTERN[card.bank]} />

      {/* bank logo, top-left */}
      <div className="absolute" style={{ left: 7 * u, top: 6.5 * u }}>
        <Logo u={u} ink={card.ink} />
      </div>

      {/* product name, top-right */}
      <div
        className="absolute text-right"
        style={{
          right: 7 * u,
          top: 7.5 * u,
          fontSize: 3 * u,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.85,
        }}
      >
        {card.tier}
      </div>

      {/* chip + contactless */}
      <div className="absolute flex items-center" style={{ left: 7 * u, top: 27.5 * u, gap: 3 * u }}>
        <Chip u={u} />
        <Contactless u={u} ink={card.ink} />
      </div>

      {/* holder name, bottom-left */}
      <div
        className="absolute whitespace-nowrap"
        style={{
          left: 7 * u,
          bottom: 7 * u,
          fontSize: 3.4 * u,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          opacity: 0.9,
        }}
      >
        {holder}
      </div>

      {/* card network, bottom-right */}
      <div className="absolute" style={{ right: 7 * u, bottom: 6 * u }}>
        <NetworkMark network={card.network} u={u} ink={card.ink} />
      </div>
    </div>
  );
}

// ---------- back ----------

export function CardBack({
  card,
  holder,
  w,
  h,
}: {
  card: BankCard;
  holder: { name: string; number: string; exp: string; cvv: string };
  w: number;
  h: number;
}) {
  const u = w / 100;
  const v = h / 100;
  return (
    <div
      className="absolute inset-0"
      style={{
        background: card.bg,
        color: card.ink,
        fontFamily: sans,
      }}
    >
      {/* soft printed-plastic light */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.14), rgba(255,255,255,0) 60%)' }}
      />

      {/* magnetic stripe across the top */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: 9 * v,
          height: 19 * v,
          backgroundColor: '#1E1B1D',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, rgba(0,0,0,0) 1px 3px), linear-gradient(180deg, #1A1719 0%, #36302F 45%, #2A2527 70%, #1B181A 100%)',
        }}
      />

      {/* signature panel + CVV */}
      <div className="absolute flex items-center" style={{ left: 7 * u, top: 36 * v, gap: 2.5 * u }}>
        <div
          style={{
            width: 52 * u,
            height: 9 * u,
            backgroundColor: '#F4F1EA',
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 2px, rgba(0,0,0,0) 2px 6px)',
            borderRadius: 0.8 * u,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 2 * u,
            color: '#2B2B2B',
            fontSize: 3 * u,
            fontStyle: 'italic',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {holder.number.slice(-4)}
        </div>
        <div
          style={{
            height: 9 * u,
            padding: `0 ${2.2 * u}px`,
            backgroundColor: '#FFFFFF',
            borderRadius: 0.8 * u,
            display: 'flex',
            alignItems: 'center',
            color: '#1A1A1A',
            fontSize: 3.6 * u,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {holder.cvv}
        </div>
        <span style={{ fontSize: 2.2 * u, letterSpacing: '0.1em', opacity: 0.7 }}>CVV</span>
      </div>

      {/* number, name, expiry */}
      <div className="absolute" style={{ left: 7 * u, top: 59 * v }}>
        <div style={{ fontSize: 5.6 * u, fontWeight: 400, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
          {holder.number}
        </div>
        <div className="flex items-end" style={{ gap: 6 * u, marginTop: 2.6 * u }}>
          <div style={{ fontSize: 3.1 * u, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{holder.name}</div>
          <div className="flex items-center" style={{ gap: 1.2 * u }}>
            <span style={{ fontSize: 1.8 * u, lineHeight: 1.1, letterSpacing: '0.08em', opacity: 0.7 }}>
              VALID
              <br />
              THRU
            </span>
            <span style={{ fontSize: 3.4 * u, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{holder.exp}</span>
          </div>
        </div>
      </div>

      {/* fine print + network, along the bottom */}
      <div
        className="absolute"
        style={{ left: 7 * u, bottom: 5.5 * u, fontSize: 1.9 * u, opacity: 0.6, letterSpacing: '0.02em', maxWidth: 62 * u, lineHeight: 1.35 }}
      >
        This card is issued by {card.bank} and remains its property. Concept design — not a real card.
      </div>
      <div className="absolute" style={{ right: 7 * u, bottom: 5 * u, transform: 'scale(0.72)', transformOrigin: 'right bottom' }}>
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

// Visa numbers start with 4, Mastercard with 51–55. Last digit is a valid Luhn
// check digit (the checksum real card numbers use). The numbers are made up.
function randomCardNumber(network: Network): string {
  const digits = (network === 'visa' ? '4' : `5${randInt(1, 5)}`).split('').map(Number);
  while (digits.length < 15) digits.push(randInt(0, 9));
  let sum = 0;
  for (let k = 0; k < 15; k++) {
    let d = digits[14 - k];
    if (k % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  digits.push((10 - (sum % 10)) % 10);
  return digits.join('').replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function randomHolder(network: Network) {
  return {
    name: `${pickOne(FIRST)} ${pickOne(LAST)}`,
    number: randomCardNumber(network),
    exp: `${String(randInt(1, 12)).padStart(2, '0')}/${randInt(27, 31)}`,
    cvv: String(randInt(100, 999)),
  };
}
