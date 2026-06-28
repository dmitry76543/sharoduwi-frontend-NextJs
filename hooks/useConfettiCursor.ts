"use client";

import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  CURSOR_PREF_CHANGE_EVENT,
  isBalloonCursorEnabled,
} from "@/lib/cursor-preference";

const CONF_COLORS = ["#FF2D95", "#36B7F0", "#FFC93C", "#2FD3A5", "#FF7A59", "#A98BF5"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
  decay: number;
  shape: "rect" | "circ";
}

interface RopePoint {
  x: number;
  y: number;
  ox: number;
  oy: number;
}

export function useConfettiCursor() {
  const { burstRef } = useApp();

  useEffect(() => {
    const canvas = document.getElementById("confetti") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let DPR = 1;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      W = canvas!.width = vw * DPR;
      H = canvas!.height = vh * DPR;
      canvas!.style.width = vw + "px";
      canvas!.style.height = vh + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];

    function burst(x: number, y: number, count = 18) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 7;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 3,
          g: 0.16 + Math.random() * 0.1,
          size: 5 + Math.random() * 6,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          color: CONF_COLORS[(Math.random() * CONF_COLORS.length) | 0],
          life: 1,
          decay: 0.008 + Math.random() * 0.01,
          shape: Math.random() < 0.5 ? "rect" : "circ",
        });
      }
      if (particles.length > 500) particles.splice(0, particles.length - 500);
    }

    burstRef.current = burst;

    const cursorEl = document.getElementById("cursor");
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const OFF_Y = 12;
    const HALF_H = 14;
    let bx = mouse.x;
    let by = mouse.y + OFF_Y;
    let svx = 0;
    let hasMoved = false;

    const ROPE_N = 8;
    const SEG = 2.6;
    let rope: RopePoint[] = [];

    function initRope() {
      rope = [];
      const sx = bx;
      const sy = by + HALF_H;
      for (let i = 0; i < ROPE_N; i++) {
        rope.push({ x: sx, y: sy + i * SEG, ox: sx, oy: sy + i * SEG });
      }
    }
    initRope();

    let ribbonPath: SVGPathElement | null = null;

    function syncCursorVisibility() {
      const enabled = isBalloonCursorEnabled();
      if (enabled) {
        document.documentElement.classList.add("has-balloon-cursor");
        if (cursorEl) cursorEl.style.display = "block";
      } else {
        document.documentElement.classList.remove("has-balloon-cursor");
        if (cursorEl) cursorEl.style.display = "none";
      }
      return enabled;
    }

    let cursorEnabled = syncCursorVisibility();

    if (cursorEnabled && cursorEl) {
      const ribbonSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      ribbonSvg.setAttribute("width", "50");
      ribbonSvg.setAttribute("height", "50");
      ribbonPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      ribbonPath.setAttribute("fill", "none");
      ribbonPath.setAttribute("stroke", "#FF2D95");
      ribbonPath.setAttribute("stroke-width", "1.6");
      ribbonPath.setAttribute("stroke-linecap", "round");
      ribbonSvg.appendChild(ribbonPath);
      cursorEl.appendChild(ribbonSvg);
    }

    const onViewportChange = () => {
      cursorEnabled = syncCursorVisibility();
    };
    window.addEventListener("resize", onViewportChange);
    window.addEventListener(CURSOR_PREF_CHANGE_EVENT, onViewportChange);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        bx = mouse.x;
        by = mouse.y + OFF_Y;
        initRope();
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const onMouseDown = (e: MouseEvent) => {
      if (!cursorEnabled) return;
      burst(e.clientX, e.clientY, 10);
    };
    window.addEventListener("mousedown", onMouseDown);

    let raf = 0;
    let canvasDirty = false;
    function loop() {
      if (cursorEnabled && cursorEl) {
        const tx = mouse.x;
        const ty = mouse.y + OFF_Y;
        const pbx = bx;
        bx += (tx - bx) * 0.68;
        by += (ty - by) * 0.68;
        const vx = bx - pbx;
        svx += (vx - svx) * 0.5;

        const knotX = bx;
        const knotY = by + HALF_H;
        const last = rope.length - 1;
        const sway = -svx * 1.0;
        for (let i = 0; i < rope.length; i++) {
          const p = rope[i];
          if (i === 0) {
            p.x = knotX;
            p.y = knotY;
            p.ox = knotX;
            p.oy = knotY;
            continue;
          }
          const w = Math.pow(i / last, 1.25);
          const nx = p.x + (p.x - p.ox) * 0.92 + sway * w;
          const ny = p.y + (p.y - p.oy) * 0.92 + 0.62;
          p.ox = p.x;
          p.oy = p.y;
          p.x = nx;
          p.y = ny;
        }
        rope[0].x = knotX;
        rope[0].y = knotY;
        for (let i2 = 1; i2 < rope.length; i2++) {
          const a = rope[i2 - 1];
          const b = rope[i2];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          b.x = a.x + (dx / dist) * SEG;
          b.y = a.y + (dy / dist) * SEG;
        }

        cursorEl.style.transform = `translate(${bx}px,${by}px)`;

        let d = `M ${knotX - bx} ${knotY - by}`;
        for (let i3 = 1; i3 < rope.length; i3++) {
          const prev = rope[i3 - 1];
          const cur = rope[i3];
          const mxp = (prev.x + cur.x) / 2 - bx;
          const myp = (prev.y + cur.y) / 2 - by;
          d += ` Q ${prev.x - bx} ${prev.y - by} ${mxp} ${myp}`;
        }
        if (ribbonPath) ribbonPath.setAttribute("d", d);
      }

      if (particles.length > 0) {
        ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvasDirty = true;
        for (let c = particles.length - 1; c >= 0; c--) {
          const pt = particles[c];
          pt.vy += pt.g;
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vx *= 0.99;
          pt.rot += pt.vr;
          pt.life -= pt.decay;
          if (pt.life <= 0 || pt.y > window.innerHeight + 40) {
            particles.splice(c, 1);
            continue;
          }
          ctx!.save();
          ctx!.globalAlpha = Math.max(0, pt.life);
          ctx!.translate(pt.x, pt.y);
          ctx!.rotate(pt.rot);
          ctx!.fillStyle = pt.color;
          if (pt.shape === "rect") {
            ctx!.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 0.6);
          } else {
            ctx!.beginPath();
            ctx!.arc(0, 0, pt.size / 2, 0, Math.PI * 2);
            ctx!.fill();
          }
          ctx!.restore();
        }
        ctx!.globalAlpha = 1;
      } else if (canvasDirty) {
        ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvasDirty = false;
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener(CURSOR_PREF_CHANGE_EVENT, onViewportChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      cancelAnimationFrame(raf);
      burstRef.current = null;
      document.documentElement.classList.remove("has-balloon-cursor");
    };
  }, [burstRef]);
}

export function useHeroParallax() {
  useEffect(() => {
    const heroMini = document.getElementById("heroMini");
    if (!heroMini) return;

    let active = isBalloonCursorEnabled();
    let pmx = 0;
    let pmy = 0;
    let ptx = 0;
    let pty = 0;
    let praf = 0;

    function pstep() {
      pmx += (ptx - pmx) * 0.08;
      pmy += (pty - pmy) * 0.08;
      heroMini!.style.transform = `translate(${pmx.toFixed(2)}px,${pmy.toFixed(2)}px)`;
      if (Math.abs(ptx - pmx) > 0.1 || Math.abs(pty - pmy) > 0.1) {
        praf = requestAnimationFrame(pstep);
      } else {
        praf = 0;
      }
    }

    const onMove = (e: MouseEvent) => {
      if (!active) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.42;
      ptx = ((e.clientX - cx) / cx) * 18;
      pty = ((e.clientY - cy) / cy) * 14;
      if (!praf) praf = requestAnimationFrame(pstep);
    };

    const onPrefChange = () => {
      active = isBalloonCursorEnabled();
      if (!active) {
        ptx = 0;
        pty = 0;
        heroMini!.style.transform = "";
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onPrefChange);
    window.addEventListener(CURSOR_PREF_CHANGE_EVENT, onPrefChange);

    if (!active) heroMini.style.transform = "";

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onPrefChange);
      window.removeEventListener(CURSOR_PREF_CHANGE_EVENT, onPrefChange);
      if (praf) cancelAnimationFrame(praf);
    };
  }, []);
}
