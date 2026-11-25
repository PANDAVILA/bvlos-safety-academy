// SAFETI, the drone-bot mascot (head only). Same artwork as the assistant inside the app.
export default function SafetiMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      viewBox="0 4 80 64"
      width={size}
      height={Math.round((size * 64) / 80)}
      role="img"
      aria-label="SAFETI"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <line x1="40" y1="22" x2="40" y2="12" stroke="#142C56" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="40" cy="9.5" r="3.6" fill="#FF9A2E" stroke="#142C56" strokeWidth="1.6" />
      <line x1="22" y1="32" x2="12" y2="24" stroke="#142C56" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="58" y1="32" x2="68" y2="24" stroke="#142C56" strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="11" cy="22.5" rx="9" ry="2.3" fill="#1E88C9" stroke="#142C56" strokeWidth="1.6" />
      <ellipse cx="69" cy="22.5" rx="9" ry="2.3" fill="#1E88C9" stroke="#142C56" strokeWidth="1.6" />
      <circle cx="40" cy="44" r="22" fill="#F4F8FD" stroke="#142C56" strokeWidth="2.6" />
      <path d="M22 40 q3 -16 18 -18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".9" />
      <rect x="25" y="35" width="30" height="21" rx="10.5" fill="#0B2347" />
      <ellipse cx="34" cy="47" rx="4.2" ry="5.4" fill="#5FD0FF" />
      <ellipse cx="46" cy="47" rx="4.2" ry="5.4" fill="#5FD0FF" />
      <circle cx="35.4" cy="45" r="1.4" fill="#fff" />
      <circle cx="47.4" cy="45" r="1.4" fill="#fff" />
      <circle cx="23.5" cy="52" r="2.6" fill="#FF9A2E" opacity=".35" />
      <circle cx="56.5" cy="52" r="2.6" fill="#FF9A2E" opacity=".35" />
    </svg>
  );
}
