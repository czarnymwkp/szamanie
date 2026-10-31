/** Seeded random numbers (the same on the server and in the browser), so scattered decorations do not jump after load. */
export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
