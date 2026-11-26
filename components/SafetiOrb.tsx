// SAFETI, animated: the drone-bot floats inside a circular "orb" with orbiting rings.
// Pure CSS animation (see .safeti-* in globals.css); it stops for people who prefer reduced motion.
export default function SafetiOrb({ size = 300 }: { size?: number }) {
  const bot = Math.round(size * 0.66);
  return (
    <div className="safeti-orb relative mx-auto" style={{ width: size, height: size }} aria-label="SAFETI, the AI assistant" role="img">
      {/* glow */}
      <div className="safeti-glow absolute inset-0 rounded-full" />
      {/* rotating rings */}
      <div className="safeti-ring absolute inset-0 rounded-full border border-dashed border-gold-400/50" />
      <div className="safeti-ring-rev absolute rounded-full border border-sky-300/25" style={{ inset: size * 0.07 }}>
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold-400 shadow-[0_0_10px_2px_rgba(224,177,74,0.8)]" />
        <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-300 shadow-[0_0_8px_2px_rgba(125,211,252,0.7)]" />
      </div>
      {/* inner disc */}
      <div
        className="absolute rounded-full border border-gold-500/40 bg-[radial-gradient(circle_at_50%_35%,rgba(30,70,130,0.9),rgba(8,20,42,0.95)_70%)]"
        style={{ inset: size * 0.13 }}
      />
      {/* the bot */}
      <div className="safeti-float absolute left-1/2 top-1/2" style={{ width: bot, marginLeft: -bot / 2, marginTop: -bot * 0.43 }}>
        <svg viewBox="0 0 80 64" width={bot} height={Math.round((bot * 64) / 80)} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g transform="translate(0,-4)">
            <line x1="40" y1="22" x2="40" y2="12" stroke="#142C56" strokeWidth="2.6" strokeLinecap="round" />
            <circle className="safeti-beacon" cx="40" cy="9.5" r="3.6" fill="#FF9A2E" stroke="#142C56" strokeWidth="1.6" />
            <line x1="22" y1="32" x2="12" y2="24" stroke="#142C56" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="58" y1="32" x2="68" y2="24" stroke="#142C56" strokeWidth="2.6" strokeLinecap="round" />
            <ellipse className="safeti-rotor" cx="11" cy="22.5" rx="9" ry="2.3" fill="#1E88C9" stroke="#142C56" strokeWidth="1.6" />
            <ellipse className="safeti-rotor safeti-rotor-b" cx="69" cy="22.5" rx="9" ry="2.3" fill="#1E88C9" stroke="#142C56" strokeWidth="1.6" />
            <circle cx="40" cy="44" r="22" fill="#F4F8FD" stroke="#142C56" strokeWidth="2.6" />
            <path d="M22 40 q3 -16 18 -18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".9" />
            <rect x="25" y="35" width="30" height="21" rx="10.5" fill="#0B2347" />
            <g className="safeti-eyes">
              <ellipse cx="34" cy="47" rx="4.2" ry="5.4" fill="#5FD0FF" />
              <ellipse cx="46" cy="47" rx="4.2" ry="5.4" fill="#5FD0FF" />
              <circle cx="35.4" cy="45" r="1.4" fill="#fff" />
              <circle cx="47.4" cy="45" r="1.4" fill="#fff" />
            </g>
            <circle cx="23.5" cy="52" r="2.6" fill="#FF9A2E" opacity=".35" />
            <circle cx="56.5" cy="52" r="2.6" fill="#FF9A2E" opacity=".35" />
          </g>
        </svg>
      </div>
      {/* shadow under the bot */}
      <div
        className="safeti-shadow absolute left-1/2 rounded-full bg-black/40 blur-md"
        style={{ width: size * 0.3, height: size * 0.04, marginLeft: -size * 0.15, bottom: size * 0.2 }}
      />
    </div>
  );
}
