const ARTWORK_BACKGROUNDS = [
  'radial-gradient(circle at 72% 28%, rgba(255,181,160,.35), transparent 24%), linear-gradient(135deg, #411b12, #121010 68%)',
  'radial-gradient(circle at 22% 74%, rgba(180,156,255,.32), transparent 28%), linear-gradient(145deg, #20183d, #0c0b11 70%)',
  'radial-gradient(circle at 72% 70%, rgba(69,212,131,.23), transparent 27%), linear-gradient(140deg, #123126, #0b0e0c 70%)',
  'radial-gradient(circle at 30% 24%, rgba(255,207,112,.3), transparent 23%), linear-gradient(150deg, #3a2a10, #0f0d09 72%)',
];

export function artworkStyle(item, index = 0) {
  const seed = Number.isFinite(Number(item?.id)) ? Number(item.id) : index;
  return { background: ARTWORK_BACKGROUNDS[Math.abs(seed) % ARTWORK_BACKGROUNDS.length] };
}

export const TYPE_LABELS = {
  plugin: 'Plugins',
  workshop: 'Workshop',
  asset: 'Arte & Assets',
};
