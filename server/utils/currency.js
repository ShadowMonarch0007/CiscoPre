// Convert rupees (number/string) to paise (int)
export function toPaise(x) {
  // e.g., "123.45" -> 12345
  const n = Number(x);
  return Math.round(n * 100);
}

// Convert paise (int) to rupees number with 2 decimals
export function fromPaise(paise) {
  return (paise / 100).toFixed(2);
}
