/** 2700 → „27 zł”, 2990 → „29,90 zł”. */
export function zl(gr: number) {
  const zlote = gr / 100;
  return `${Number.isInteger(zlote) ? zlote : zlote.toFixed(2).replace(".", ",")} zł`;
}

/** „2026-10-25” → „25.10.2026”. */
export function dataPl(iso: string) {
  const [r, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${r}`;
}
