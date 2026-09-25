#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f package.json ]] || ! grep -q '"name": "together-games"' package.json; then
  echo "Run this from the Together Games project root."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP=".visual-rebuild-backup-$STAMP"
mkdir -p "$BACKUP/src" "$BACKUP/public"
cp -a src/main.tsx src/index.css src/content/characters.ts src/pages/GameLibraryPage.tsx package.json "$BACKUP/"
cp -a public/characters "$BACKUP/public/characters"
[[ -f src/pages/GameLibraryPage.jsx ]] && cp -a src/pages/GameLibraryPage.jsx "$BACKUP/" || true

echo "Backup created at $BACKUP"

mkdir -p scripts src/theme public/characters

cat > scripts/generate-sticker-characters.mjs <<'EOF'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('public/characters')
fs.mkdirSync(OUT, { recursive: true })

const INK = '#151515'
const WHITE = '#ffffff'

const characters = [
  ['james-gabe', 'octopus', '#a96cff', '#ff4d8d'],
  ['roy', 'snail', '#b8ef32', '#a96cff'],
  ['coco', 'fish', '#ffe337', '#a96cff'],
  ['nickel', 'snail-goth', '#a96cff', '#232323'],
  ['rosie', 'butterfly', '#ff4d8d', '#ffe337'],
  ['flemish', 'bat', '#a96cff', '#ff4d8d'],
  ['dr-wierce', 'turtle', '#7edb46', '#16b9e8'],
  ['copy-wierce', 'monster', '#a96cff', '#232323'],
  ['jim-baby', 'tire', '#30343b', '#16b9e8'],
  ['easy-tony', 'clam', '#b66ef2', '#ff8fc0'],
  ['tough-tony', 'clam-goth', '#242424', '#777777'],
  ['richie-loco', 'shark', '#16b9e8', '#ffffff'],
  ['bruce-michael', 'crab', '#ff5a39', '#ff8b3d'],
  ['mini-bruce-michael', 'crab-mini', '#ff7952', '#ffe337'],
  ['party-james-lewis', 'zebra', '#ffffff', '#ff4d8d'],
  ['balloon-james-lewis', 'balloon-zebra', '#ffffff', '#16b9e8'],
  ['joshua-david', 'bee', '#ffe337', '#ffffff'],
  ['bad-joshua-david', 'bee-goth', '#ffe337', '#ff4d8d'],
  ['bogus', 'spider', '#252525', '#ff8b3d'],
  ['uncle-demi', 'cactus', '#69cf45', '#8fc9ff'],
]

const eye = (x, y, r = 14, pupil = 6) => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="${WHITE}"/>
  <circle cx="${x + 1}" cy="${y + 1}" r="${pupil}" fill="${INK}" stroke="none"/>
  <circle cx="${x - 2}" cy="${y - 3}" r="2.2" fill="${WHITE}" stroke="none"/>`

const mouth = (x, y, w = 54, h = 30, teeth = true) => `
  <path d="M ${x - w/2} ${y} Q ${x} ${y + h} ${x + w/2} ${y} Q ${x} ${y + h + 13} ${x - w/2} ${y} Z" fill="${INK}"/>
  ${teeth ? `<rect x="${x - w/2 + 10}" y="${y + 7}" width="${w - 20}" height="8" rx="3" fill="${WHITE}" stroke="none"/>` : ''}`

const svg = (body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-hidden="true">
  <g stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    ${body}
  </g>
</svg>`

function render(kind, fill, accent) {
  switch (kind) {
    case 'octopus':
      return svg(`
        <path d="M48 176 C34 187 37 208 54 211 C70 213 74 193 83 187 C78 205 91 219 105 212 C116 205 111 187 119 183 C122 206 136 218 149 209 C160 201 149 184 155 178 C165 193 180 198 189 187 C198 175 183 164 176 153" fill="${fill}"/>
        <path d="M58 148 C52 98 72 59 120 55 C168 59 189 98 181 149 C166 171 145 183 120 183 C94 183 73 171 58 148Z" fill="${fill}"/>
        ${eye(96,112)}${eye(143,112)}
        ${mouth(120,137,60,27)}
        <circle cx="74" cy="86" r="7" fill="${accent}" stroke="none"/><circle cx="168" cy="91" r="6" fill="${accent}" stroke="none"/>
      `)
    case 'snail':
      return svg(`
        <ellipse cx="151" cy="128" rx="58" ry="55" fill="${accent}"/>
        <path d="M151 93 C127 93 118 114 128 130 C140 149 170 144 174 123 C178 101 158 91 145 104 C134 116 140 128 151 128" fill="none"/>
        <path d="M46 158 C55 130 81 116 113 119 C127 121 139 134 138 151 C136 171 118 184 91 183 L55 183 C40 183 36 169 46 158Z" fill="${fill}"/>
        <path d="M68 132 C63 108 60 92 53 82" fill="none"/><circle cx="52" cy="78" r="7" fill="${fill}"/>
        <path d="M91 124 C93 102 96 87 105 77" fill="none"/><circle cx="108" cy="73" r="7" fill="${fill}"/>
        ${eye(69,146,10,4)}${eye(101,143,10,4)}
        <path d="M74 166 Q87 177 102 164" fill="none"/>
      `)
    case 'snail-goth':
      return svg(`
        <ellipse cx="151" cy="128" rx="58" ry="55" fill="${accent}"/>
        <path d="M151 93 C127 93 118 114 128 130 C140 149 170 144 174 123 C178 101 158 91 145 104 C134 116 140 128 151 128" fill="none" stroke="${fill}"/>
        <path d="M46 158 C55 130 81 116 113 119 C127 121 139 134 138 151 C136 171 118 184 91 183 L55 183 C40 183 36 169 46 158Z" fill="${fill}"/>
        <path d="M65 126 C63 101 61 91 54 79 M92 124 C94 101 98 87 107 76" fill="none"/>
        <circle cx="54" cy="77" r="7" fill="${fill}"/><circle cx="108" cy="73" r="7" fill="${fill}"/>
        <path d="M53 132 Q70 116 87 130 Q102 113 119 132" fill="${accent}"/>
        ${eye(72,148,10,4)}${eye(103,145,10,4)}
        <path d="M75 168 Q87 158 102 169" fill="none"/>
      `)
    case 'fish':
      return svg(`
        <path d="M54 120 L25 87 Q18 119 25 153 Z" fill="${accent}"/>
        <ellipse cx="126" cy="121" rx="73" ry="55" fill="${fill}"/>
        <path d="M113 69 Q128 38 151 62 Q135 78 121 83Z" fill="${accent}"/>
        <path d="M113 174 Q129 202 151 179 Q136 164 122 159Z" fill="${accent}"/>
        ${eye(145,105,13,5)}${eye(173,112,11,4)}
        <path d="M150 143 Q166 157 183 141" fill="none"/>
        <path d="M82 94 Q101 120 83 146" fill="none"/>
      `)
    case 'butterfly':
      return svg(`
        <path d="M105 116 C70 65 30 56 27 93 C24 122 52 130 74 129 C45 142 40 176 67 188 C91 199 104 168 112 143Z" fill="${fill}"/>
        <path d="M135 116 C170 65 210 56 213 93 C216 122 188 130 166 129 C195 142 200 176 173 188 C149 199 136 168 128 143Z" fill="${fill}"/>
        <ellipse cx="120" cy="132" rx="24" ry="54" fill="${accent}"/>
        <path d="M109 80 Q94 59 89 44 M131 80 Q146 59 151 44" fill="none"/>
        <circle cx="88" cy="42" r="5" fill="${accent}"/><circle cx="152" cy="42" r="5" fill="${accent}"/>
        ${eye(111,119,9,4)}${eye(130,119,9,4)}
        <path d="M110 143 Q120 151 131 142" fill="none"/>
        <circle cx="62" cy="99" r="13" fill="${accent}"/><circle cx="179" cy="99" r="13" fill="${accent}"/>
      `)
    case 'bat':
      return svg(`
        <path d="M92 102 C62 70 25 73 22 113 L51 105 L43 139 L76 126 L90 145Z" fill="${accent}"/>
        <path d="M148 102 C178 70 215 73 218 113 L189 105 L197 139 L164 126 L150 145Z" fill="${accent}"/>
        <path d="M73 93 L90 55 L108 89 M132 89 L151 55 L168 94" fill="${fill}"/>
        <path d="M73 109 C73 78 95 69 120 69 C145 69 167 78 167 109 V154 C167 184 146 197 120 197 C94 197 73 184 73 154Z" fill="${fill}"/>
        ${eye(102,121,13,5)}${eye(139,121,13,5)}
        ${mouth(120,151,54,22)}
        <path d="M109 162 l8 14 l7-14" fill="${WHITE}"/>
      `)
    case 'turtle':
      return svg(`
        <ellipse cx="119" cy="131" rx="72" ry="63" fill="${fill}"/>
        <ellipse cx="119" cy="132" rx="49" ry="45" fill="${accent}"/>
        <path d="M92 108 L145 157 M148 108 L95 157 M87 132 H151" fill="none"/>
        <circle cx="119" cy="65" r="38" fill="${fill}"/>
        ${eye(105,60,11,4)}${eye(134,60,11,4)}
        <path d="M105 82 Q119 91 134 82" fill="none"/>
        <path d="M85 177 L70 198 M154 177 L170 198" fill="none"/>
        <path d="M84 74 Q63 88 71 107 M155 74 Q176 88 168 107" fill="none"/>
        <rect x="102" y="91" width="34" height="15" rx="5" fill="${WHITE}"/>
        <path d="M119 91 V106 M111 98 H127" stroke="${fill}"/>
      `)
    case 'monster':
      return svg(`
        <path d="M55 183 L68 84 Q71 53 99 55 L120 69 L142 55 Q170 53 173 84 L185 183 Q152 203 120 193 Q86 204 55 183Z" fill="${fill}"/>
        <path d="M73 88 Q86 50 104 73 Q121 43 136 72 Q157 49 168 89" fill="${accent}"/>
        <path d="M79 116 Q96 99 111 114 M130 114 Q146 99 162 116" fill="none"/>
        ${eye(95,128,13,5)}${eye(146,128,13,5)}
        <path d="M90 156 Q120 139 151 156 Q139 180 120 180 Q100 180 90 156Z" fill="${INK}"/>
        <path d="M103 158 H137" stroke="${WHITE}"/>
      `)
    case 'tire':
      return svg(`
        <circle cx="120" cy="124" r="76" fill="${fill}"/>
        <circle cx="120" cy="124" r="48" fill="#656b74"/>
        <circle cx="120" cy="124" r="27" fill="${WHITE}"/>
        <circle cx="120" cy="124" r="11" fill="${accent}"/>
        <path d="M72 74 L90 92 M150 88 L168 70 M67 148 L90 143 M150 158 L170 172" fill="none"/>
        ${eye(82,119,10,4)}${eye(157,119,10,4)}
        <path d="M95 156 Q120 172 145 156" fill="none" stroke="${WHITE}"/>
      `)
    case 'clam':
    case 'clam-goth':
      return svg(`
        <path d="M49 117 Q57 55 120 48 Q183 55 191 117 Q164 99 120 105 Q76 99 49 117Z" fill="${fill}"/>
        <path d="M48 120 Q59 194 120 195 Q181 194 192 120 Q166 107 120 112 Q74 107 48 120Z" fill="${accent}"/>
        ${eye(96,131,13,5)}${eye(145,131,13,5)}
        ${kind === 'clam-goth' ? '<path d="M80 91 Q120 67 160 91" fill="none"/><path d="M92 157 Q120 143 148 157" fill="none"/>' : '<path d="M91 157 Q120 178 151 155" fill="none"/>'}
      `)
    case 'shark':
      return svg(`
        <path d="M42 147 C55 89 101 65 157 79 L188 58 L184 95 Q215 109 204 143 Q194 170 162 170 C107 191 62 178 42 147Z" fill="${fill}"/>
        <path d="M88 151 Q127 187 171 145 Q160 181 126 184 Q96 181 88 151Z" fill="${accent}"/>
        <path d="M112 78 L127 42 L145 82" fill="${fill}"/>
        ${eye(157,111,12,5)}
        <path d="M144 139 Q171 157 193 134" fill="${INK}"/>
        <path d="M153 141 l8 14 l8-11 l8 10 l7-13" fill="${WHITE}" stroke="none"/>
      `)
    case 'crab':
    case 'crab-mini': {
      const s = kind === 'crab-mini' ? 'transform="translate(24 28) scale(.8)"' : ''
      return svg(`<g ${s}>
        <ellipse cx="120" cy="137" rx="58" ry="44" fill="${fill}"/>
        <path d="M76 121 L50 96 M164 121 L190 96 M75 151 L48 168 M165 151 L192 168" fill="none"/>
        <path d="M52 96 C29 83 27 56 51 49 C72 43 82 62 73 77 C66 88 55 91 52 96Z" fill="${accent}"/>
        <path d="M188 96 C211 83 213 56 189 49 C168 43 158 62 167 77 C174 88 185 91 188 96Z" fill="${accent}"/>
        <path d="M97 105 V88 M143 105 V88" fill="none"/>
        ${eye(96,85,11,4)}${eye(144,85,11,4)}
        <path d="M96 146 Q120 161 145 145" fill="none"/>
      </g>`)
    }
    case 'zebra':
      return svg(`
        <path d="M73 81 L52 49 L86 58 M167 81 L188 49 L154 58" fill="${fill}"/>
        <ellipse cx="120" cy="123" rx="66" ry="74" fill="${fill}"/>
        <path d="M83 73 L103 97 M66 100 L96 113 M70 139 L101 131 M157 71 L139 98 M174 100 L145 112 M170 141 L140 131" fill="none"/>
        <path d="M96 55 Q120 24 144 55 L133 73 H107Z" fill="${accent}"/>
        ${eye(97,119,13,5)}${eye(144,119,13,5)}
        <ellipse cx="120" cy="158" rx="35" ry="24" fill="#b8b8b8"/>
        <path d="M102 159 Q120 173 139 158" fill="none"/>
      `)
    case 'balloon-zebra':
      return svg(`
        <ellipse cx="120" cy="105" rx="70" ry="65" fill="${fill}"/>
        <path d="M78 63 L102 88 M61 94 L94 104 M73 132 L99 122 M163 61 L139 88 M179 94 L147 104 M169 133 L141 122" fill="none"/>
        ${eye(97,105,13,5)}${eye(144,105,13,5)}
        <path d="M95 138 Q120 155 146 136" fill="none"/>
        <path d="M112 170 L128 170 L120 187Z" fill="${accent}"/>
        <path d="M120 187 C98 205 143 213 119 231" fill="none"/>
      `)
    case 'bee':
    case 'bee-goth':
      return svg(`
        <path d="M84 112 C51 77 24 97 40 133 C49 153 68 153 86 143 M156 112 C189 77 216 97 200 133 C191 153 172 153 154 143" fill="${WHITE}"/>
        <ellipse cx="120" cy="133" rx="55" ry="65" fill="${fill}"/>
        <path d="M70 112 H171 M67 142 H174 M80 170 H160" fill="none"/>
        <path d="M101 75 Q92 49 76 45 M139 75 Q148 49 164 45" fill="none"/>
        <circle cx="75" cy="44" r="7" fill="${INK}"/><circle cx="165" cy="44" r="7" fill="${INK}"/>
        ${eye(100,118,12,5)}${eye(141,118,12,5)}
        ${kind === 'bee-goth' ? '<path d="M84 89 Q120 61 156 89" fill="#202020"/><path d="M98 151 Q120 138 143 151" fill="none"/>' : '<path d="M95 151 Q120 171 146 149" fill="none"/>'}
        ${kind === 'bee-goth' ? `<path d="M85 92 L120 64 L155 92" fill="${accent}"/>` : ''}
      `)
    case 'spider':
      return svg(`
        <path d="M76 111 L37 83 M72 128 L29 126 M78 146 L42 172 M164 111 L203 83 M168 128 L211 126 M162 146 L198 172" fill="none"/>
        <ellipse cx="120" cy="134" rx="58" ry="54" fill="${fill}"/>
        <ellipse cx="120" cy="82" rx="38" ry="34" fill="${accent}"/>
        ${eye(105,79,11,4)}${eye(136,79,11,4)}
        <path d="M105 100 Q120 111 136 99" fill="none"/>
        <circle cx="94" cy="128" r="5" fill="${accent}" stroke="none"/><circle cx="145" cy="148" r="6" fill="${accent}" stroke="none"/>
      `)
    case 'cactus':
      return svg(`
        <path d="M87 190 V91 Q87 53 120 53 Q153 53 153 91 V190Z" fill="${fill}"/>
        <path d="M88 123 C68 105 53 111 53 132 V149 M152 117 C173 96 190 108 190 130 V145" fill="none"/>
        <path d="M75 74 Q120 44 165 74 L153 46 Q119 29 87 47Z" fill="${accent}"/>
        <circle cx="163" cy="46" r="13" fill="${WHITE}"/>
        ${eye(106,113,11,4)}${eye(137,113,11,4)}
        <path d="M103 145 Q120 138 138 145" fill="none"/>
        <path d="M104 82 L101 92 M136 77 L140 88 M116 165 L111 178 M141 157 L146 169" fill="none" stroke-width="4"/>
      `)
    default:
      return svg(`<circle cx="120" cy="120" r="70" fill="${fill}"/>${eye(98,112)}${eye(143,112)}${mouth(120,143)}`)
  }
}

for (const [id, kind, fill, accent] of characters) {
  fs.writeFileSync(path.join(OUT, `${id}.svg`), render(kind, fill, accent))
}

console.log(`Generated ${characters.length} sticker characters in ${OUT}`)
EOF

cat > src/theme/sticker.css <<'EOF'
/* TOGETHER GAMES — canonical sticker-cartoon visual system */

:root {
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --paper: #fffdf7;
  --white: #ffffff;
  --ink: #151515;
  --tomato: #ff4d73;
  --sun: #ffe436;
  --sea: #18bde9;
  --leaf: #66d34d;
  --grape: #a86df0;
  --blush: #ff9dc8;
  --orange: #ff8b3d;
  --blue: #3187ff;
  --line: 4px;
  --shadow-x: 4px;
  --shadow-y: 5px;
  --hard-shadow: var(--shadow-x) var(--shadow-y) 0 var(--ink);
}

html,
body,
#root {
  background: var(--paper);
}

body {
  color: var(--ink);
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button:focus-visible,
a:focus-visible {
  outline: 4px solid var(--blue);
  outline-offset: 3px;
}

img[src$='.svg'] {
  image-rendering: auto;
}

/* Shared title language */
:is(
  .memory-topbar,
  .copy-me-topbar,
  .spot-difference-topbar,
  .cake-drop-topbar,
  .parker-topbar,
  .find-unicorn-topbar,
  .bug-jump-topbar,
  .find-floor-topbar
) h1 {
  text-transform: uppercase;
  letter-spacing: -0.055em;
  text-wrap: balance;
  color: var(--ink);
  text-shadow: none;
}

/* Shared controls */
:is(
  .memory-home,
  .memory-reset,
  .copy-me-home,
  .copy-me-reset,
  .spot-difference-home,
  .spot-difference-reset,
  .cake-drop-home,
  .cake-drop-reset,
  .cake-drop-mode,
  .parker-home,
  .parker-reset,
  .parker-mode,
  .find-unicorn-home,
  .find-unicorn-reset,
  .find-unicorn-action,
  .bug-jump-home,
  .bug-jump-reset,
  .bug-jump-mode,
  .bug-jump-action,
  .find-floor-home,
  .find-floor-reset,
  .find-floor-mode
) {
  border: var(--line) solid var(--ink);
  border-radius: 14px;
  background: var(--white);
  color: var(--ink);
  box-shadow: 3px 4px 0 var(--ink);
  font-weight: 700;
  text-decoration: none;
  transition: transform 90ms ease, box-shadow 90ms ease;
}

:is(
  .memory-home,
  .memory-reset,
  .copy-me-home,
  .copy-me-reset,
  .spot-difference-home,
  .spot-difference-reset,
  .cake-drop-home,
  .cake-drop-reset,
  .cake-drop-mode,
  .parker-home,
  .parker-reset,
  .parker-mode,
  .find-unicorn-home,
  .find-unicorn-reset,
  .find-unicorn-action,
  .bug-jump-home,
  .bug-jump-reset,
  .bug-jump-mode,
  .bug-jump-action,
  .find-floor-home,
  .find-floor-reset,
  .find-floor-mode
):active {
  transform: translate(3px, 4px) !important;
  box-shadow: 0 0 0 var(--ink) !important;
}

:is(
  .memory-home,
  .copy-me-home,
  .spot-difference-home,
  .cake-drop-home,
  .parker-home,
  .find-unicorn-home,
  .bug-jump-home,
  .find-floor-home
)::first-letter {
  font-size: 1.1em;
}

/* Shared stage/card language */
:is(
  .spot-difference-scene,
  .cake-drop-stage,
  .parker-stage,
  .find-unicorn-stage,
  .bug-jump-stage,
  .find-floor-stage
) {
  border: 5px solid var(--ink);
  border-radius: 20px;
  box-shadow: 5px 6px 0 var(--ink);
}

:is(
  .memory-player,
  .copy-me-score,
  .copy-me-pattern,
  .cake-drop-player,
  .cake-drop-stats span,
  .parker-player,
  .parker-stats span,
  .bug-jump-score,
  .find-floor-score
) {
  border-color: var(--ink);
  box-shadow: 3px 4px 0 var(--ink);
  border-radius: 16px;
}

:is(
  .copy-me-status,
  .spot-difference-progress,
  .cake-drop-status,
  .parker-status,
  .find-unicorn-status,
  .bug-jump-status,
  .find-floor-status
) {
  border-color: var(--ink);
  border-radius: 12px;
  box-shadow: 3px 4px 0 var(--ink);
}

/* ============================================================
   GAME LIBRARY
   ============================================================ */

.paper-zoo-library {
  width: min(100%, 1180px);
  padding: 22px 28px 28px;
  background: var(--paper);
}

.paper-zoo-library__header {
  position: relative;
  margin-bottom: 20px;
}

.paper-zoo-library__header::before,
.paper-zoo-library__header::after {
  content: '';
  position: absolute;
  top: 50%;
  width: clamp(46px, 8vw, 110px);
  height: 16px;
  border-top: 5px solid var(--ink);
  border-bottom: 5px solid var(--ink);
  transform: rotate(-5deg);
}

.paper-zoo-library__header::before { left: 2%; }
.paper-zoo-library__header::after { right: 2%; transform: rotate(5deg); }

.paper-zoo-library__header p {
  display: inline-block;
  margin: 0 0 7px;
  padding: 4px 10px;
  border: 3px solid var(--ink);
  border-radius: 999px;
  background: var(--sun);
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.paper-zoo-library__header h1 {
  font-size: clamp(2.8rem, 6vh, 5.2rem);
  text-transform: uppercase;
  letter-spacing: -.065em;
}

.paper-zoo-library__games {
  gap: 18px;
}

.paper-zoo-game-card {
  position: relative;
  border: 5px solid var(--ink);
  border-radius: 18px;
  box-shadow: 5px 6px 0 var(--ink);
  background: var(--white);
  overflow: hidden;
}

.paper-zoo-game-card:nth-child(1) .paper-zoo-game-card__art { background: var(--sun); }
.paper-zoo-game-card:nth-child(2) .paper-zoo-game-card__art { background: var(--sea); }
.paper-zoo-game-card:nth-child(3) .paper-zoo-game-card__art { background: var(--blush); }
.paper-zoo-game-card:nth-child(4) .paper-zoo-game-card__art { background: var(--tomato); }
.paper-zoo-game-card:nth-child(5) .paper-zoo-game-card__art { background: var(--leaf); }
.paper-zoo-game-card:nth-child(6) .paper-zoo-game-card__art { background: var(--sun); }
.paper-zoo-game-card:nth-child(7) .paper-zoo-game-card__art { background: var(--grape); }
.paper-zoo-game-card:nth-child(8) .paper-zoo-game-card__art { background: var(--sea); }

.paper-zoo-game-card__art {
  position: relative;
  min-height: 0;
  padding: 10px;
}

.paper-zoo-game-card__art::before {
  content: '';
  position: absolute;
  width: 68%;
  aspect-ratio: 1;
  border: 4px solid var(--ink);
  border-radius: 50%;
  background: var(--white);
  transform: rotate(-5deg);
}

.paper-zoo-game-card:nth-child(even) .paper-zoo-game-card__art::before {
  transform: rotate(5deg);
}

.paper-zoo-game-card__character-image {
  position: relative;
  z-index: 2;
  width: 86%;
  height: 86%;
  max-height: 175px;
  filter: none;
  transform: rotate(-2deg);
}

.paper-zoo-game-card:nth-child(even) .paper-zoo-game-card__character-image {
  transform: rotate(2deg);
}

.paper-zoo-game-card__footer {
  border-top: 5px solid var(--ink);
  padding: 11px 14px;
}

.paper-zoo-game-card__footer h2 {
  text-transform: uppercase;
  letter-spacing: -.035em;
}

.paper-zoo-game-card__play {
  border: 3px solid var(--ink);
  border-radius: 10px;
  box-shadow: 2px 2px 0 var(--ink);
}

.paper-zoo-game-card:active {
  transform: translate(5px, 6px);
  box-shadow: 0 0 0 var(--ink);
}

/* Library CSS illustrations */
.library-cake,
.library-parker,
.library-unicorn,
.library-bug,
.library-floor {
  position: relative;
  z-index: 2;
  width: 150px;
  height: 145px;
}

.library-cake__plate {
  position: absolute; left: 17px; right: 17px; bottom: 13px; height: 18px;
  border: 4px solid var(--ink); border-radius: 50%; background: var(--sea);
}
.library-cake__layer { position: absolute; left: 35px; width: 80px; height: 31px; border: 4px solid var(--ink); border-radius: 12px; }
.library-cake__layer--one { bottom: 27px; background: var(--tomato); }
.library-cake__layer--two { bottom: 54px; background: var(--sun); transform: rotate(-3deg); }
.library-cake__layer--three { bottom: 81px; background: var(--blush); transform: rotate(3deg); }
.library-cake__cherry { position: absolute; z-index: 2; left: 64px; top: 12px; width: 25px; height: 25px; border: 4px solid var(--ink); border-radius: 50%; background: var(--tomato); }
.library-cake__cherry::before { content:''; position:absolute; width:22px; height:24px; left:11px; top:-21px; border-left:4px solid var(--ink); border-radius:50%; transform:rotate(22deg); }

.library-parker__garage { position:absolute; left:20px; right:20px; top:18px; height:96px; border:4px solid var(--ink); border-radius:22px 22px 4px 4px; background:var(--sun); }
.library-parker__window { position:absolute; top:14px; width:22px; height:20px; border:4px solid var(--ink); background:var(--sea); }
.library-parker__window--one { left:17px; }.library-parker__window--two { right:17px; }
.library-parker__door { position:absolute; left:43px; bottom:-4px; width:45px; height:58px; border:4px solid var(--ink); background:var(--white); }
.library-parker__car { position:absolute; z-index:3; left:43px; bottom:8px; width:72px; height:43px; border:4px solid var(--ink); border-radius:28px 28px 14px 14px; background:var(--tomato); transform:rotate(-5deg); }
.library-parker__car::before,.library-parker__car::after { content:''; position:absolute; bottom:-12px; width:18px; height:18px; border:4px solid var(--ink); border-radius:50%; background:var(--ink); }
.library-parker__car::before { left:7px; }.library-parker__car::after { right:7px; }
.library-parker__glass { position:absolute; left:20px; top:7px; width:35px; height:14px; border:3px solid var(--ink); border-radius:12px 12px 4px 4px; background:var(--sea); }

.library-unicorn__head { position:absolute; left:37px; top:50px; width:78px; height:70px; border:4px solid var(--ink); border-radius:48% 48% 42% 42%; background:var(--white); }
.library-unicorn__ear { position:absolute; top:34px; width:26px; height:35px; border:4px solid var(--ink); background:var(--blush); transform:rotate(25deg); }
.library-unicorn__ear--left { left:35px; }.library-unicorn__ear--right { right:35px; transform:rotate(-25deg); }
.library-unicorn__horn { position:absolute; z-index:4; top:4px; left:65px; width:22px; height:58px; border:4px solid var(--ink); background:var(--sun); clip-path:polygon(50% 0,100% 100%,0 100%); }
.library-unicorn__eye { position:absolute; top:24px; width:10px; height:14px; border-radius:50%; background:var(--ink); }
.library-unicorn__eye--left { left:20px; }.library-unicorn__eye--right { right:20px; }
.library-unicorn__smile { position:absolute; left:29px; top:45px; width:22px; height:12px; border-bottom:4px solid var(--ink); border-radius:0 0 20px 20px; }

.library-bug__body { position:absolute; left:39px; top:53px; width:74px; height:70px; border:4px solid var(--ink); border-radius:48% 48% 44% 44%; background:var(--leaf); }
.library-bug__body::before { content:''; position:absolute; left:31px; top:-4px; bottom:-4px; border-left:4px solid var(--ink); }
.library-bug__antenna { position:absolute; top:27px; width:30px; height:38px; border-top:4px solid var(--ink); }
.library-bug__antenna--left { left:41px; transform:rotate(-35deg); }.library-bug__antenna--right { right:41px; transform:rotate(35deg); }
.library-bug__eye { position:absolute; top:21px; width:12px; height:16px; border-radius:50%; background:var(--white); border:3px solid var(--ink); }
.library-bug__eye--left { left:13px; }.library-bug__eye--right { right:13px; }
.library-bug__jump { position:absolute; right:4px; top:1px; font-size:54px; line-height:1; transform:rotate(9deg); }

.library-floor__building { position:absolute; left:32px; top:9px; width:88px; height:124px; border:4px solid var(--ink); background:var(--blush); }
.library-floor__level { display:block; height:30px; border-bottom:4px solid var(--ink); }
.library-floor__shaft { position:absolute; right:8px; top:7px; bottom:7px; width:31px; border-left:4px solid var(--ink); background:var(--white); }
.library-floor__car { position:absolute; left:4px; right:4px; bottom:9px; height:34px; border:3px solid var(--ink); background:var(--sea); }

/* ============================================================
   MEMORY
   ============================================================ */

.memory-game { background: var(--paper); }
.memory-player--one { background: var(--tomato); }
.memory-player--two { background: var(--sea); }
.memory-player:not(.is-active) { opacity: .55; filter: saturate(.65); }
.memory-turn-label { border-radius: 10px; background: var(--white); box-shadow: 2px 3px 0 var(--ink); }

.memory-card {
  border: 4px solid var(--ink);
  border-radius: 14px;
  box-shadow: 3px 4px 0 var(--ink);
  background: var(--tomato);
}
.memory-card:nth-child(4n + 2) { background: var(--sea); }
.memory-card:nth-child(4n + 3) { background: var(--sun); }
.memory-card:nth-child(4n) { background: var(--grape); }
.memory-card.visible { background: var(--white); }
.memory-card img { width: 94%; height: 94%; object-fit: contain; }
.memory-card-back { font-size: clamp(1.5rem, 4vh, 3rem); color: var(--ink); transform: rotate(-8deg); }
.memory-card:nth-child(even) .memory-card-back { transform: rotate(8deg); }
.memory-game-over { border: 5px solid var(--ink); border-radius: 18px; background: var(--sun); box-shadow: var(--hard-shadow); }
.memory-game-over button { border: 4px solid var(--ink); border-radius: 12px; background: var(--white); box-shadow: 3px 4px 0 var(--ink); }

/* ============================================================
   COPY ME
   ============================================================ */

.copy-me-score--one.is-active { background: var(--tomato); }
.copy-me-score--two.is-active { background: var(--sea); }
.copy-me-score-tick { border-radius: 8px; background: var(--sun); }
.copy-me-status { background: var(--sun); }
.copy-me-pattern { background: var(--white); }
.copy-me-character {
  position: relative;
  border: 0;
  background: transparent;
  transform: rotate(-2deg);
  transition: transform 100ms ease;
}
.copy-me-character:nth-child(even) { transform: rotate(2deg); }
.copy-me-character::before {
  content:'';
  position:absolute;
  inset:8%;
  z-index:-1;
  border:4px solid var(--ink);
  border-radius:50%;
  background:var(--white);
}
.copy-me-character:nth-child(1)::before { background:var(--sun); }
.copy-me-character:nth-child(2)::before { background:var(--leaf); }
.copy-me-character:nth-child(3)::before { background:var(--blush); }
.copy-me-character:nth-child(4)::before { background:var(--sea); }
.copy-me-character:active { transform: scale(.91) rotate(3deg); }
.copy-me-character img { max-width:88%; max-height:88%; }
.copy-me-hint { border:4px solid var(--ink); border-radius:14px; background:var(--sun); box-shadow:3px 4px 0 var(--ink); }
.copy-me-hint img { object-fit:contain; }
.copy-me-action { border:4px solid var(--ink); border-radius:14px; box-shadow:3px 4px 0 var(--ink); }

/* ============================================================
   SPOT IT
   ============================================================ */

.spot-difference-progress { background: var(--leaf); }
.spot-difference-scene { background: var(--white); padding: 12px; gap: 9px; }
.spot-difference-scene:first-child { transform: rotate(-.35deg); }
.spot-difference-scene:last-child { transform: rotate(.35deg); }
.spot-difference-item {
  border: 4px solid var(--ink);
  border-radius: 14px;
  box-shadow: 3px 4px 0 var(--ink);
  background: var(--grape);
}
.spot-difference-item:nth-child(4n + 2) { background: var(--leaf); }
.spot-difference-item:nth-child(4n + 3) { background: var(--sun); }
.spot-difference-item:nth-child(4n) { background: var(--blush); }
.spot-difference-item img { max-width:94%; max-height:94%; }
.spot-difference-item.found { background: var(--white); }
.spot-difference-item.found::after { border-radius:8px; background:var(--tomato); box-shadow:2px 2px 0 var(--ink); }
.spot-difference-complete h2 { border-radius:12px; background:var(--sun); box-shadow:3px 4px 0 var(--ink); }

/* ============================================================
   CAKE DROP
   ============================================================ */

.cake-drop-player--one { background: var(--tomato); }
.cake-drop-player--two { background: var(--sea); }
.cake-drop-player:not(.is-active) { opacity:.5; }
.cake-drop-player strong,
.cake-drop-stats span { background: var(--white); }
.cake-drop-stage { background: var(--sea); }
.cake-drop-stage::before {
  content:'';
  position:absolute;
  width:140px;
  height:140px;
  right:-40px;
  top:-48px;
  border:5px solid var(--ink);
  border-radius:50%;
  background:var(--sun);
}
.cake-drop-guide { background: transparent; border-left: 4px dashed rgba(21,21,21,.22); }
.cake-drop-rail { background: var(--white); box-shadow: 3px 3px 0 var(--ink); }
.cake-drop-roller { background: var(--sun); }
.cake-drop-belt::after { content:''; position:absolute; left:0; right:0; top:68px; border-top:5px solid var(--ink); }
.cake-drop-layer { border-color:var(--ink); box-shadow:3px 3px 0 var(--ink); }
.cake-drop-layer--tomato { background: var(--tomato); }
.cake-drop-layer--sun { background: var(--sun); }
.cake-drop-layer--sea { background: var(--blush); }
.cake-drop-layer--band::before { background:var(--white); border-top:3px solid var(--ink); border-bottom:3px solid var(--ink); }
.cake-drop-plate { background: var(--white); border-color:var(--ink); }
.cake-drop-cherry { background:var(--tomato); border-color:var(--ink); }
.cake-drop-splat { border:4px solid var(--ink); }
.cake-drop-action { background:var(--sun); border:4px solid var(--ink); border-radius:14px; box-shadow:4px 5px 0 var(--ink); }

/* ============================================================
   PARKER
   ============================================================ */

.parker-player--one { background: var(--tomato); }
.parker-player--two { background: var(--sea); }
.parker-player:not(.is-active) { opacity:.5; }
.parker-player strong,
.parker-stats span { background:var(--white); }
.parker-stage { background: var(--sun); }
.parker-garage { background:var(--blush); border-color:var(--ink); border-radius:18px 18px 0 0; box-shadow:4px 4px 0 var(--ink); }
.parker-window { background:var(--sea); border-color:var(--ink); }
.parker-opening { background:var(--white); border-color:var(--ink); }
.parker-road { background:var(--sea); border-color:var(--ink); }
.parker-guide { border-color:rgba(21,21,21,.35); }
.parker-car { background:var(--tomato); border-color:var(--ink); box-shadow:4px 4px 0 var(--ink); }
.parker-windshield { background:var(--white); border-color:var(--ink); }
.parker-lamp { background:var(--sun); border-color:var(--ink); }
.parker-action { background:var(--leaf); border:4px solid var(--ink); border-radius:14px; box-shadow:4px 5px 0 var(--ink); }

/* ============================================================
   FIND THE UNICORN
   ============================================================ */

.find-unicorn-status { background: var(--sun); }
.find-unicorn-status--win { background: var(--leaf); }
.find-unicorn-stage { background: var(--white); }
.find-unicorn-sky { background: var(--sea) !important; }
.find-unicorn-ground { background: var(--leaf) !important; border-top:5px solid var(--ink); }
.find-unicorn-stage--beach .find-unicorn-ground { background:var(--sun) !important; }
.find-unicorn-stage--shop .find-unicorn-ground { background:var(--blush) !important; }
.find-unicorn-stage--playground .find-unicorn-ground { background:var(--grape) !important; }
.find-unicorn-hideout { filter:none; }
.find-unicorn-cover { border-color:var(--ink) !important; box-shadow:3px 4px 0 var(--ink); }
.find-unicorn-cover--tomato { background:var(--tomato) !important; }
.find-unicorn-cover--sun { background:var(--sun) !important; }
.find-unicorn-cover--sea { background:var(--sea) !important; }
.find-unicorn-cover--leaf { background:var(--leaf) !important; }
.find-unicorn-cover--grape { background:var(--grape) !important; }
.find-unicorn-reveal img { object-fit:contain; filter:none; mix-blend-mode:normal; }
.find-unicorn-scene-button { border:4px solid var(--ink); border-radius:12px; background:var(--white); box-shadow:3px 4px 0 var(--ink); }
.find-unicorn-scene-button.is-active { background:var(--sun); transform:translateY(-2px); }
.paper-unicorn__head { background:var(--white); border-color:var(--ink); }
.paper-unicorn__ear { background:var(--blush); border-color:var(--ink); }
.paper-unicorn__horn { background:var(--sun); border-color:var(--ink); }
.paper-unicorn__eye { background:var(--ink); }
.paper-unicorn__nose { border-color:var(--ink); }

/* ============================================================
   BUG JUMP
   ============================================================ */

.bug-jump-stage { background: var(--sea); }
.bug-jump-stage::before { background:var(--white); border:5px solid var(--ink); }
.bug-jump-stage::after { background:var(--white); border:5px solid var(--ink); }
.bug-jump-sky-shape--one { background:var(--sun); border:5px solid var(--ink); }
.bug-jump-ground { background:var(--leaf); border-color:var(--ink); }
.bug-jump-dash { background:var(--white); border:2px solid var(--ink); }
.bug-jump-princess { filter:none; }
.bug-jump-head { background:var(--blush); border-color:var(--ink); }
.bug-jump-crown { background:var(--sun); border-color:var(--ink); }
.bug-jump-dress { background:var(--tomato); border-color:var(--ink); }
.bug-jump-eye { background:var(--white); border-color:var(--ink); }
.bug-jump-smile { border-color:var(--ink); }
.bug-jump-leg { background:var(--ink); }
.bug-jump-bug { background:var(--orange); border-color:var(--ink); box-shadow:3px 3px 0 var(--ink); }
.bug-jump-bug-eye { background:var(--white); border-color:var(--ink); }
.bug-jump-status { background:var(--sun); }
.bug-jump-status--warn { background:var(--tomato); }
.bug-jump-action { background:var(--sun); border:4px solid var(--ink); border-radius:14px; box-shadow:4px 5px 0 var(--ink); }
.bug-jump-point { border-color:var(--ink); background:var(--white); }
.bug-jump-point--lit { background:var(--sun); }

/* ============================================================
   FIND THE FLOOR
   ============================================================ */

.find-floor-game { background:var(--paper); }
.find-floor-status { background:var(--sun); text-shadow:none !important; }
.find-floor-status--win { background:var(--leaf) !important; text-shadow:none !important; }
.find-floor-score { background:var(--white); }
.find-floor-stage { background:var(--sea); }
.find-floor-level { border-color:var(--ink); background:transparent; }
.find-floor-level--top { background:transparent; }
.find-floor-tag { border-color:var(--ink); background:var(--white); }
.find-floor-tag--here { background:var(--sun); }
.find-floor-room { background:var(--white) !important; border-color:var(--ink); }
.find-floor-room--occupied { background:var(--blush) !important; }
.find-floor-prize { mix-blend-mode:normal !important; filter:none !important; }
.find-floor-prize-shelf { background:var(--ink); }
.find-floor-shaft { background:var(--ink); opacity:.12; }
.find-floor-car { background:var(--sun) !important; border-color:var(--ink); box-shadow:3px 4px 0 var(--ink); }
.find-floor-door { background:var(--sea); border-color:var(--ink); }
.find-floor-key { background:var(--blush) !important; border:4px solid var(--ink); border-radius:14px; box-shadow:3px 4px 0 var(--ink); }
.find-floor-key:nth-child(2) { background:var(--sun) !important; }
.find-floor-key:nth-child(3) { background:var(--sea) !important; }
.find-floor-key:nth-child(4) { background:var(--leaf) !important; }
.find-floor-key:nth-child(5) { background:var(--grape) !important; }
.find-floor-key:active:not(:disabled) { transform:translate(3px,4px); box-shadow:none; }
.find-floor-dot { background:var(--ink); }

/* Flat-only enforcement for known old effects */
.find-floor-game *,
.find-unicorn-game *,
.cake-drop-game *,
.parker-game *,
.bug-jump-game * {
  text-shadow: none;
}

/* Responsive tightening */
@media (max-width: 700px) {
  :is(
    .memory-game,
    .copy-me-game,
    .spot-difference-game,
    .cake-drop-game,
    .parker-game,
    .find-unicorn-game,
    .bug-jump-game,
    .find-floor-game
  ) {
    padding-left: 12px;
    padding-right: 12px;
  }

  .paper-zoo-library { padding:16px 14px 22px; }
  .paper-zoo-library__header::before,
  .paper-zoo-library__header::after { display:none; }
}
EOF

cat > src/index.css <<'EOF'
@import '@fontsource/fredoka/700.css';

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  width: 100%;
  min-width: 100%;
  height: 100%;
  max-height: 100dvh;
  overflow: hidden;
}

button,
a {
  font: inherit;
  color: inherit;
  cursor: pointer;
}
EOF

node <<'NODE'
const fs = require('node:fs')

function replaceFile(path, fn) {
  const before = fs.readFileSync(path, 'utf8')
  const after = fn(before)
  fs.writeFileSync(path, after)
}

replaceFile('src/content/characters.ts', (s) => s.replaceAll('.png\'', '.svg\''))

replaceFile('src/pages/GameLibraryPage.tsx', (s) =>
  s
    .replaceAll('/characters/coco.png', '/characters/coco.svg')
    .replaceAll('/characters/copy-wierce.png', '/characters/copy-wierce.svg')
    .replaceAll('/characters/roy.png', '/characters/roy.svg'),
)

replaceFile('src/main.tsx', (s) => {
  if (s.includes("./theme/sticker.css")) return s
  return s.replace(
    "import App from './App.tsx'\n",
    "import App from './App.tsx'\nimport './theme/sticker.css'\n",
  )
})

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const old = pkg.scripts || {}
pkg.scripts = {
  dev: old.dev || 'vite',
  art: 'node scripts/generate-sticker-characters.mjs',
  prebuild: 'npm run art',
  build: old.build || 'tsc -b && vite build',
  lint: old.lint || 'eslint .',
  preview: old.preview || 'vite preview',
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
NODE

node scripts/generate-sticker-characters.mjs

rm -f public/characters/*.png
rm -f src/pages/GameLibraryPage.jsx
find . -name '._*' -type f -delete
find . -name '.DS_Store' -type f -delete

echo
echo "Visual rebuild applied."
echo "Old touched files are in: $BACKUP"
echo
if [[ "${SKIP_BUILD:-0}" == "1" ]]; then
  echo "Build skipped because SKIP_BUILD=1."
else
  echo "Running build..."
  npm run build
fi
