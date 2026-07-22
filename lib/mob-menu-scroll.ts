/** Отложенная прокрутка к секции после закрытия бургер-меню. */
let pendingSectionId: string | null = null;

export function queueScrollAfterMobMenu(sectionId: string) {
  pendingSectionId = sectionId;
}

export function takeQueuedScrollAfterMobMenu(): string | null {
  const id = pendingSectionId;
  pendingSectionId = null;
  return id;
}

export function scrollToSiteSection(
  sectionId: string,
  behavior: ScrollBehavior = "smooth"
) {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior, block: "start" });
}
