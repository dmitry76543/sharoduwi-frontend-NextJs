"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function revealElement(el: Element) {
  el.classList.add("in");
}

export function useScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    let io: IntersectionObserver | undefined;

    const setup = () => {
      io?.disconnect();
      const els = document.querySelectorAll(".reveal:not(.in)");
      if (!els.length) return;

      if (!("IntersectionObserver" in window)) {
        els.forEach(revealElement);
        return;
      }

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealElement(entry.target);
              io?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
      );

      els.forEach((el) => io!.observe(el));
    };

    setup();
    const raf = requestAnimationFrame(setup);
    const timer = window.setTimeout(setup, 200);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io?.disconnect();
    };
  }, [pathname]);
}

export function useHeaderScroll() {
  useEffect(() => {
    const header = document.getElementById("header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

export function useCountUp() {
  useEffect(() => {
    function animateCount(el: Element) {
      const target = parseInt(el.getAttribute("data-count") || "0", 10) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      const dur = 1300;
      let t0: number | null = null;
      function step(ts: number) {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e).toLocaleString("ru-RU") + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const els = document.querySelectorAll("[data-count]");
    if ("IntersectionObserver" in window) {
      const countIO = new IntersectionObserver(
        (ents) => {
          ents.forEach((en) => {
            if (en.isIntersecting) {
              animateCount(en.target);
              countIO.unobserve(en.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      els.forEach((el) => countIO.observe(el));
      return () => countIO.disconnect();
    }
    els.forEach((el) => {
      const t = parseInt(el.getAttribute("data-count") || "0", 10) || 0;
      el.textContent = t.toLocaleString("ru-RU") + (el.getAttribute("data-suffix") || "");
    });
  }, []);
}

export function useRisingLetters() {
  useEffect(() => {
    const word = document.getElementById("rising-word");
    if (!word) return;
    const letters = word.textContent?.split("") || [];
    word.innerHTML = letters
      .map((l) => `<span class="rising-letter">${l}</span>`)
      .join("");
    word.querySelectorAll(".rising-letter").forEach((el) => {
      (el as HTMLElement).style.animationDelay =
        (-(Math.random() * 2.2)).toFixed(2) + "s";
    });
  }, []);
}

export function useScrollProgressFallback() {
  useEffect(() => {
    const bar = document.querySelector(".scroll-progress") as HTMLElement | null;
    if (!bar) return;
    if (CSS.supports("animation-timeline", "scroll()")) return;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape]);
}

/** Прокрутка к якорю после перехода на главную (например /#how) */
export function useHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    scrollToHash();
    const timer = window.setTimeout(scrollToHash, 120);
    const retry = window.setTimeout(scrollToHash, 400);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(retry);
    };
  }, [pathname]);
}
