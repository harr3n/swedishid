function cmp(a: Date, b: Date): number {
  const diff = a.getTime() - b.getTime();
  return diff < 0 ? -1 : diff > 0 ? 1 : 0;
}

export function yearsBetween(from: Date, to: Date): number {
  const sign = cmp(from, to);
  const yearDiff = Math.abs(from.getFullYear() - to.getFullYear());

  const d = new Date(from.getTime());
  d.setFullYear(d.getFullYear() - sign * yearDiff);

  const incompleteYear = cmp(d, to) === -sign;
  const result = sign * (yearDiff - (incompleteYear ? 1 : 0));

  return result === 0 ? 0 : result;
}

export function isValidCalendarDate(
  year: number,
  month: number,
  day: number,
): boolean {
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}
