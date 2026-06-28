import type { CollectionSlug } from "@/lib/data";

/** Имена файлов в /public/images (исходники — папка images/ в корне проекта) */
const COLLECTION_IMAGE_FILES: Record<CollectionSlug, string> = {
  "nabory-sharov-bazovye": "Наборы шаров базовые.png",
  "bazovyi-premium": "Базовый Премиум.png",
  "premium-shary": "Премиум шары.png",
  "shary-pod-potolok-1": "Шары под потолок.png",
  "oblaka-iz-5-sharov-bez-gruzov": "Облака из 5 шаров без грузов.png",
  "fontany-iz-7-sharov": "Фонтаны из 7 шаров.png",
  "fontany-iz-sharov-1": "Фонтаны из шаров.png",
  "dlya-devochek-1": "Для девочек.png",
  "dlya-malchikov-1": "Для Мальчиков.png",
  "dlya-nee": "Для Нее.png",
  "dlya-nego": "Для Него.png",
  "bolshie-shary-bubble": "Шары Гигант.png",
  "shary-gigant-s-nadpisyami-1": "Шары Гигант с надписями.png",
  "shary-na-devichnik": "Шары на Девичник.png",
  "set-s-tsifroi": "Сет с цифрой.png",
  "1-godik-1": "1 годик.png",
  "korobki-s-sharami": "Коробки с шарами.png",
  "dlya-novorozhdennykh": "Для Новорожденных.jpg",
  "dlya-vliublennykh": "Для Влюбленных.png",
  pirotekhnika: "Пиротехника.png",
};

export function getCollectionImageSrc(slug: CollectionSlug): string {
  const file = COLLECTION_IMAGE_FILES[slug];
  return `/images/${encodeURIComponent(file)}`;
}
