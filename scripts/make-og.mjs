import sharp from 'sharp';

const W = 1200, H = 630;
const cx = 950, cy = 315, R = 210;
const spokes = [];
const ringPts = (r) => Array.from({ length: 8 }, (_, i) => {
  const a = (Math.PI / 4) * i - Math.PI / 2;
  return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');
for (let i = 0; i < 8; i++) {
  const a = (Math.PI / 4) * i - Math.PI / 2;
  spokes.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + R * Math.cos(a)).toFixed(1)}" y2="${(cy + R * Math.sin(a)).toFixed(1)}"/>`);
}
const dataR = [0.92, 0.78, 0.85, 0.6, 0.7, 0.88, 0.66, 0.8];
const dataPts = dataR.map((f, i) => {
  const a = (Math.PI / 4) * i - Math.PI / 2;
  return `${(cx + R * f * Math.cos(a)).toFixed(1)},${(cy + R * f * Math.sin(a)).toFixed(1)}`;
}).join(' ');

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#111827"/>
  <g stroke="#2563EB" fill="none">
    <g opacity="0.28" stroke-width="1.5">
      <polygon points="${ringPts(R * 0.33)}"/>
      <polygon points="${ringPts(R * 0.66)}"/>
    </g>
    <g opacity="0.45" stroke-width="2"><polygon points="${ringPts(R)}"/></g>
    <g opacity="0.3" stroke-width="1.5">${spokes.join('')}</g>
    <polygon points="${dataPts}" fill="#2563EB" fill-opacity="0.18" stroke="#2563EB" stroke-opacity="0.9" stroke-width="2.5"/>
  </g>
  ${dataR.map((f, i) => {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    return `<circle cx="${(cx + R * f * Math.cos(a)).toFixed(1)}" cy="${(cy + R * f * Math.sin(a)).toFixed(1)}" r="5" fill="${i === 0 ? '#22C55E' : '#2563EB'}"/>`;
  }).join('')}
  <text x="90" y="330" font-family="Space Grotesk" font-weight="700" font-size="128" letter-spacing="4" fill="#F1F5F9">GAUNTLET</text>
  <text x="94" y="400" font-family="Inter" font-size="36" fill="#94A3B8">Models run the gauntlet.</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');

// verify: title region must not be flat background
const img = sharp('public/og.png');
const meta = await img.metadata();
const region = async (o) => sharp(await sharp('public/og.png').extract(o).toBuffer()).stats();
const title = await region({ left: 90, top: 230, width: 620, height: 110 });
const tag = await region({ left: 90, top: 365, width: 420, height: 45 });
const corner = await region({ left: 0, top: 0, width: 40, height: 40 });
const s = (st) => st.channels.map((c) => c.stdev.toFixed(1)).join(',');
console.log(`size ${meta.width}x${meta.height}`);
console.log('title stdev', s(title), 'mean', title.channels.map(c=>c.mean.toFixed(1)).join(','));
console.log('tagline stdev', s(tag));
console.log('corner stdev', s(corner), 'mean', corner.channels.map(c=>c.mean.toFixed(1)).join(','));
if (title.channels[0].stdev < 10 || tag.channels[0].stdev < 5) { console.error('TEXT DID NOT RENDER'); process.exit(1); }
console.log('TEXT OK');
