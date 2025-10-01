import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Crescent Hotel • Crystal Ballroom Catering & Bar Calculator
// Interactive estimator based on the uploaded catering menu PDF.
// NOTE: Prices & rates can change; tune the editable rates to match your contract/BEO.

// ---------- Defaults (editable in UI) ----------
const FOOD_TAX_DEFAULT = 0.12375;
const LIQUOR_TAX_DEFAULT = 0.16375;
const SERVICE_CHG_DEFAULT = 0.1988;

// ---------- Menu Data (subset; extend as needed) ----------
// ... menu arrays unchanged ...

// ---------- UI Helpers ----------
function Section({ title, children, subtitle }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>}
      <div className="mt-3 grid gap-3">{children}</div>
    </section>
  );
}

function NumberField({ label, value, onChange, min = 0, step = 1 }) {
  return (
    <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm w-full">
      <span className="text-zinc-700 dark:text-zinc-200 break-words pr-1">{label}</span>
      <input
        type="number"
        className="w-full sm:w-40 max-w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-right text-zinc-900 dark:text-zinc-100 px-2 py-1"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TogglePill({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1 rounded-full border text-sm transition-colors " +
        (selected
          ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
          : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800")
      }
    >
      {children}
    </button>
  );
}

// ---------- Animated Cloud Background ----------
function MovingClouds() {
  const clouds = new Array(6).fill(null);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-32 bg-white/10 rounded-full blur-3xl"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          animate={{ x: [0, 100, -100, 0] }}
          transition={{ duration: 60 + i * 10, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ---------- Main Component ----------
export default function CrescentCateringCalculator() {
  const [guestCount, setGuestCount] = useState(60);
  // ... all state and calculations unchanged ...

  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }, []);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="relative min-h-screen bg-gradient-to-br from-[#120f1c] via-[#1b1430] to-[#120f1c] text-zinc-100 overflow-hidden">
        <MovingClouds />
        <div className="relative mx-auto max-w-6xl p-6 isolate">
          <header className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-[#EAD8B1]">Crescent Hotel • Crystal Ballroom Catering Calculator</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDark(!dark)}
                  className="rounded-xl border border-[#3a2a4a] bg-[#1b1526] px-3 py-1.5 text-sm text-[#EAD8B1] hover:bg-[#2a1e38]"
                  aria-label="Toggle dark mode"
                >
                  {dark ? "Light" : "Dark"} mode
                </button>
              </div>
            </div>
            <p className="text-sm text-[#EAD8B1]/80">Interactive estimator based on the uploaded catering menu. Edit assumptions to match your contract. This tool does not replace final BEO pricing.</p>
          </header>

          {/* Controls grid and footer remain unchanged */}
        </div>
      </div>
    </div>
  );
}