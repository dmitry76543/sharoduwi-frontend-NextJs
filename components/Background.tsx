"use client";

import { useEffect, useRef } from "react";
import { COLORS } from "@/lib/data";
import { balloonSVG } from "@/lib/balloons";

const MOBILE_BG_MQ = "(max-width: 860px)";

interface BackgroundProps {
  /** Без aurora, зерна и плавающих шаров — для лёгких страниц на мобилке */
  lite?: boolean;
}

export function Background({ lite = false }: BackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lite) return;
    const bg = bgRef.current;
    if (!bg) return;

    const mq = window.matchMedia(MOBILE_BG_MQ);
    const nodes: HTMLElement[] = [];

    const clearBalloons = () => {
      nodes.splice(0).forEach((node) => node.remove());
    };

    const spawnBalloons = () => {
      clearBalloons();
      const bgCols = ["pink", "sky", "sun", "mint", "lav", "coral"] as const;
      for (let i = 0; i < 8; i++) {
        const d = document.createElement("div");
        d.className = "drift";
        const w = 40 + Math.random() * 60;
        d.style.left = Math.random() * 100 + "%";
        d.style.animationDuration = 16 + Math.random() * 14 + "s";
        d.style.animationDelay = -Math.random() * 20 + "s";
        d.innerHTML = balloonSVG(COLORS[bgCols[i % bgCols.length]], w);
        bg.appendChild(d);
        nodes.push(d);
      }
    };

    const sync = () => {
      if (mq.matches) clearBalloons();
      else spawnBalloons();
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      clearBalloons();
    };
  }, [lite]);

  if (lite) {
    return <div className="bg bg--lite" aria-hidden="true" />;
  }

  return (
    <>
      <div className="bg" />
      <div className="bg-grain" />
      <div className="bg-balloons" id="bgBalloons" ref={bgRef} />
    </>
  );
}
