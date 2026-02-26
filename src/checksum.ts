/**
 * Luhn mod-10 checksum. Returns the check digit (0-9) that validates the input.
 */
export function luhnCheckDigit(str: string | number): number {
  let sum = 0;
  const s = String(str);

  for (let i = 0; i < s.length; i++) {
    let v = parseInt(s[i], 10);
    v *= 2 - (i % 2);
    if (v > 9) v -= 9;
    sum += v;
  }

  return (Math.ceil(sum / 10) * 10 - sum) % 10;
}
