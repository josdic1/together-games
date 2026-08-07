export default function Whale() {
  return (
    <svg
      viewBox="0 0 240 180"
      role="img"
      aria-label="Blue whale"
    >
      {/* tail */}
      <ellipse
        cx="39"
        cy="88"
        rx="30"
        ry="18"
        transform="rotate(-28 39 88)"
        fill="var(--sea)"
        stroke="var(--ink)"
        strokeWidth="6"
      />

      <ellipse
        cx="39"
        cy="116"
        rx="30"
        ry="18"
        transform="rotate(28 39 116)"
        fill="var(--sea)"
        stroke="var(--ink)"
        strokeWidth="6"
      />

      {/* body */}
      <ellipse
        cx="133"
        cy="103"
        rx="87"
        ry="59"
        fill="var(--sea)"
        stroke="var(--ink)"
        strokeWidth="6"
      />

      {/* belly */}
      <ellipse
        cx="150"
        cy="126"
        rx="54"
        ry="25"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="6"
      />

      {/* fin */}
      <ellipse
        cx="123"
        cy="145"
        rx="30"
        ry="14"
        transform="rotate(18 123 145)"
        fill="var(--sea)"
        stroke="var(--ink)"
        strokeWidth="6"
      />

      {/* eyes */}
      <circle cx="158" cy="88" r="6" fill="var(--ink)" />
      <circle cx="184" cy="88" r="6" fill="var(--ink)" />

      {/* smile */}
      <path
        d="M158 106 Q171 120 188 105"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* blush */}
      <ellipse
        cx="198"
        cy="104"
        rx="10"
        ry="6"
        fill="var(--blush)"
      />

      {/* water spout */}
      <path
        d="M145 43 Q135 25 124 34"
        fill="none"
        stroke="var(--sea)"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <path
        d="M151 43 Q157 23 169 31"
        fill="none"
        stroke="var(--sea)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  )
}
