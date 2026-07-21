/** Русское склонение для «N вариант(а/ов)». */
export function formatVariantCount(count: number): string {
  const n = Math.abs(Math.trunc(count));
  const mod100 = n % 100;
  const mod10 = n % 10;

  let word = "вариантов";
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = "вариант";
    else if (mod10 >= 2 && mod10 <= 4) word = "варианта";
  }

  return `${count} ${word}`;
}
