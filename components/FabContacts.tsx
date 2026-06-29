"use client";

import { useCallback, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { FabChatIcon } from "@/components/FabChatIcon";

const FAB_CONFIG = { gapY: 66, fanX: 18, baseY: 84, stagger: 60 };

const MAX_URL = "https://max.ru/u/f9LHodD0cOJ0iFHpDtxRvHxZb55wWIT4L1UpmBingh61XxPU-GdBpm5h-ls";
const TELEGRAM_URL = "https://t.me/+79267086374";

const FAB_ITEMS = [
  {
    c: "transparent",
    href: MAX_URL,
    label: "MAX",
    external: true,
    iconSrc: "/images/max.svg",
    brandIcon: true,
  },
  {
    c: "#2AABEE",
    href: TELEGRAM_URL,
    label: "Telegram",
    external: true,
    icon: <path d="M21.9 4.3l-3.2 15c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.5 13 1.7 11.5c-1-.3-1-1 .2-1.5L20.7 2.8c.9-.3 1.6.2 1.2 1.5z" />,
    filled: true,
  },
  {
    c: "#25D366",
    href: "https://wa.me/79267086374",
    label: "WhatsApp",
    external: true,
    icon: <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2zm0 2a8 8 0 016.8 12.2l-.3.4.8 2.9-3-.8-.4.2A8 8 0 1112 4zm-3.4 4c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.8.5-.1 1.6-.7 1.9-1.4.2-.6.2-1.2.1-1.3 0-.1-.2-.2-.5-.4l-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.5-.6-2.4-1.6-.7-.7-1.2-1.5-1.3-1.7-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.2-.5s0-.4-.1-.5l-.8-2c-.2-.5-.4-.4-.6-.5h-.4z" />,
    filled: true,
  },
  {
    c: "#FF2D95",
    href: "tel:+79267086374",
    label: "Позвонить",
    external: false,
    icon: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />,
  },
];

function fabPositions(count: number) {
  const mobile = window.matchMedia("(max-width:480px)").matches;
  const gapY = mobile ? 60 : FAB_CONFIG.gapY;
  const fanX = mobile ? 0 : FAB_CONFIG.fanX;
  const baseY = mobile ? 74 : FAB_CONFIG.baseY;
  return Array.from({ length: count }, (_, i) => ({
    x: -(i * fanX),
    y: -(baseY + i * gapY),
  }));
}

export function FabContacts() {
  const { fabOpen, setFabOpen } = useApp();
  const fabRef = useRef<HTMLDivElement>(null);
  const justToggled = useRef(false);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const applyFab = useCallback((open: boolean) => {
    const items = itemRefs.current.filter(Boolean) as HTMLElement[];
    const pos = fabPositions(items.length);
    const n = items.length;
    items.forEach((el, i) => {
      const order = open ? i : n - 1 - i;
      el.style.transitionDelay = order * FAB_CONFIG.stagger + "ms";
      const tip = el.querySelector(".ftip") as HTMLElement | null;
      if (tip) tip.style.transitionDelay = order * FAB_CONFIG.stagger + 40 + "ms";
      el.style.setProperty("--x", (open ? pos[i].x : 0) + "px");
      el.style.setProperty("--y", (open ? pos[i].y : 0) + "px");
      el.style.setProperty("--s", open ? "1" : "0");
      el.style.setProperty("--r", open ? "0deg" : "-70deg");
      el.style.opacity = open ? "1" : "0";
      el.style.pointerEvents = open ? "auto" : "none";
    });
  }, []);

  useEffect(() => {
    applyFab(fabOpen);
  }, [fabOpen, applyFab]);

  useEffect(() => {
    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      if (fabOpen) {
        clearTimeout(rt);
        rt = setTimeout(() => applyFab(true), 120);
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(rt);
    };
  }, [fabOpen, applyFab]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (justToggled.current) return;
      if (fabOpen && fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [fabOpen, setFabOpen]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    justToggled.current = true;
    setTimeout(() => {
      justToggled.current = false;
    }, 0);
    setFabOpen(!fabOpen);
  };

  return (
    <>
      <div className={`fab-scrim${fabOpen ? " show" : ""}`} id="fabScrim" onClick={() => setFabOpen(false)} />
      <div className={`fab${fabOpen ? " open" : ""}`} id="fab" ref={fabRef}>
        {FAB_ITEMS.map((item, i) => (
          <a
            key={item.label}
            className={`fab-item${"brandIcon" in item && item.brandIcon ? " fab-item--brand" : ""}`}
            style={{ ["--c" as string]: item.c }}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-label={item.label}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => setFabOpen(false)}
          >
            <span className="ftip">{item.label}</span>
            <span className="fic">
              {"iconSrc" in item && item.iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.iconSrc} alt="" width={56} height={56} />
              ) : (
                <svg viewBox="0 0 24 24" fill={"filled" in item && item.filled ? "currentColor" : "none"} stroke={"filled" in item && item.filled ? undefined : "currentColor"} strokeWidth={"filled" in item && item.filled ? undefined : "2.4"} strokeLinecap="round" strokeLinejoin="round">
                  {"icon" in item ? item.icon : null}
                </svg>
              )}
            </span>
          </a>
        ))}
        <button
          className="fab-main"
          id="fabMain"
          aria-expanded={fabOpen}
          aria-label="Связаться с нами"
          type="button"
          onClick={toggle}
        >
          <span className="flabel" aria-hidden="true">
            <FabChatIcon />
          </span>
          <span className="fic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </span>
        </button>
      </div>
    </>
  );
}
