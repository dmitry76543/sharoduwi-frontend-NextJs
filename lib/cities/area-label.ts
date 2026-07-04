/** Подпись зоны доставки для Hero / Footer */
export function buildAreaLabel(namePrepositional: string, district: string): string {
  if (district.includes("Люберц")) {
    return `${namePrepositional} и Люберецком округе`;
  }
  if (district.includes("Бронниц")) {
    return `${namePrepositional} и Бронницком округе`;
  }
  if (district.includes("Фрязино")) {
    return `${namePrepositional} и городском округе Фрязино`;
  }
  if (district.includes("Жуковск")) {
    return `${namePrepositional} и Раменском районе`;
  }
  return `${namePrepositional} и Раменском районе`;
}
