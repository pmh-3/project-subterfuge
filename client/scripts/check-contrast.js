/**
 * WCAG AA contrast audit for design-system text/background pairings.
 * Run: npm run check-contrast
 */
const fs = require('fs');
const path = require('path');

const COLORS_PATH = path.join(__dirname, '../src/design-system/tokens/colors.ts');

function parseColors(fileContents) {
  const colors = {};
  for (const match of fileContents.matchAll(/(\w+):\s*'(#[0-9A-Fa-f]{6})'/g)) {
    colors[match[1]] = match[2];
  }
  return colors;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const PAIRS = [
  { fg: 'inkPrimary', bg: 'background', min: 4.5, label: 'body on background' },
  { fg: 'inkPrimary', bg: 'surface', min: 4.5, label: 'body on surface' },
  { fg: 'inkSecondary', bg: 'background', min: 4.5, label: 'secondary on background' },
  { fg: 'inkSecondary', bg: 'surface', min: 4.5, label: 'secondary on surface' },
  { fg: 'inkMuted', bg: 'background', min: 4.5, label: 'muted on background' },
  { fg: 'inkMuted', bg: 'surface', min: 4.5, label: 'muted on surface' },
  { fg: 'accentText', bg: 'background', min: 4.5, label: 'accent text on background' },
  { fg: 'accentText', bg: 'surface', min: 4.5, label: 'accent text on surface' },
  { fg: 'danger', bg: 'background', min: 4.5, label: 'danger on background' },
  { fg: 'inkOnDark', bg: 'accent', min: 4.5, label: 'ink on accent button' },
];

function main() {
  const fileContents = fs.readFileSync(COLORS_PATH, 'utf8');
  const colors = parseColors(fileContents);
  const failures = [];

  for (const { fg, bg, min, label } of PAIRS) {
    const fgHex = colors[fg];
    const bgHex = colors[bg];
    if (!fgHex || !bgHex) {
      failures.push(`Missing token: ${fg} or ${bg}`);
      continue;
    }
    const ratio = contrastRatio(fgHex, bgHex);
    if (ratio < min) {
      failures.push(`${label}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (need ${min}:1)`);
    }
  }

  if (failures.length > 0) {
    console.error('Contrast check FAILED:\n');
    for (const f of failures) {
      console.error(`  ✗ ${f}`);
    }
    process.exit(1);
  }

  console.log('Contrast check passed — all pairings meet WCAG AA.');
  for (const { fg, bg, min, label } of PAIRS) {
    const ratio = contrastRatio(colors[fg], colors[bg]);
    console.log(`  ✓ ${label}: ${ratio.toFixed(2)}:1 (≥ ${min}:1)`);
  }
}

main();
