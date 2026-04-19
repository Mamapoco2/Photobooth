/**
 * Decorative emoji hints from lens display names (your real lenses come from Lens Scheduler groups).
 */
export function snapLensEmoji(name) {
  const n = String(name).toLowerCase()
  if (/dog|puppy|woof|hound/.test(n)) return '🐶'
  if (/heart|love|float|valentine|cupid/.test(n)) return '💖'
  if (/mask|funny|silly|clown|face\s*paint|costume/.test(n)) return '😆'
  if (/cat|kitten|meow/.test(n)) return '🐱'
  if (/glasses|specs|sunglass/.test(n)) return '😎'
  return '✨'
}
