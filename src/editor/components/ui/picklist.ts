export function pickedValues(
  value: string[],
  options: { value: string }[],
): string[] {
  const known = new Set(options.map(option => option.value));
  return [...new Set(value)].filter(item => known.has(item));
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
