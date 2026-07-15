/** Подпись зоны доставки для Hero / Footer */
export function buildAreaLabel(namePrepositional: string, district: string): string {
  if (district.includes("Люберц")) {
    return `${namePrepositional} и Люберецком округе`;
  }
  if (district.includes("Котельник")) {
    return `${namePrepositional} и городском округе Котельники`;
  }
  if (district.includes("Лыткарин")) {
    return `${namePrepositional} и городском округе Лыткарино`;
  }
  if (district.includes("Балаших")) {
    return `${namePrepositional} и городском округе Балашиха`;
  }
  if (district.includes("ЮВАО") || district.includes("Москва")) {
    return `${namePrepositional} и ближайших районах Москвы`;
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
