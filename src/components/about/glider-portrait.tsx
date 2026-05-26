/**
 * Placeholder portrait — a glider over a Belgian-heath horizon.
 *
 * Used when the Profile.portrait field is empty in Sanity. Once a portrait
 * is uploaded, the HeroSection swaps in the real image. The illustration
 * uses hardcoded colors (sky/heath/clouds) rather than theme tokens because
 * those are scene colors, not UI colors.
 */
export function GliderPortrait({className}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-label="Glider over Belgian heath"
      role="img"
    >
      <rect width="100" height="60" fill="#84A98C" />
      <rect y="60" width="100" height="40" fill="#D6A77A" />
      <ellipse cx="22" cy="20" rx="12" ry="3" fill="#FFFBEB" />
      <ellipse cx="75" cy="32" rx="14" ry="3.5" fill="#FFFBEB" />
      <ellipse cx="55" cy="14" rx="10" ry="2.5" fill="#FFFBEB" />
      <g transform="translate(50 42) rotate(-10)">
        <path d="M-13 0 L13 0" stroke="#1F2937" strokeWidth="1.2" />
        <path
          d="M-8 -1.5 L8 -1.5 L0 -7 Z"
          fill="#1F2937"
          stroke="#1F2937"
          strokeWidth="0.8"
        />
      </g>
      <path
        d="M0 75 Q 30 70 60 78 T 100 76"
        fill="none"
        stroke="#92400E"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <path
        d="M0 85 Q 25 82 50 87 T 100 84"
        fill="none"
        stroke="#92400E"
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  )
}
