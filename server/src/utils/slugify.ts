export function slugify(text: string) {
  if (!text) return '';
  // normalize accents
  let s = text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  // replace ñ and Ñ explicitly
  s = s.replace(/ñ/g, 'n').replace(/Ñ/g, 'N');
  s = s.toLowerCase();
  s = s.replace(/[^a-z0-9\s-]/g, '');
  s = s.trim().replace(/\s+/g, '-');
  return s;
}
