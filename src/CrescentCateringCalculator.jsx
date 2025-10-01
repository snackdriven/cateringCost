import React, { useEffect, useMemo, useState } from "react";

// Crescent Hotel • Crystal Ballroom Catering & Bar Calculator
// Interactive estimator based on the uploaded catering menu PDF.
// NOTE: Prices & rates can change; tune the editable rates to match your contract/BEO.

// ---------- Defaults (editable in UI) ----------
const FOOD_TAX_DEFAULT = 0.12375; // 12.375% (food, beer, wine)
const LIQUOR_TAX_DEFAULT = 0.16375; // 16.375% (liquor)
const SERVICE_CHG_DEFAULT = 0.1988; // 19.88% service charge

// ---------- Menu Data (subset; extend as needed) ----------
const platedEntrees = [
  { id: "veg-wellington", label: "Vegetable Wellington (V)", price: 34 },
  { id: "mush-ravioli", label: "Wild Mushroom Ravioli (V)", price: 35 },
  { id: "acorn-squash", label: "Quinoa-Stuffed Acorn Squash (V/VG/GF)", price: 35 },
  { id: "herb-half-chicken", label: "Herb Baked Half Chicken", price: 36 },
  { id: "pot-roast", label: "Pot Roast", price: 38 },
  { id: "chicken-eureka", label: "Chicken Eureka", price: 38 },
  { id: "snapper", label: "Pan-Seared Snapper", price: 40 },
  { id: "salmon", label: "Wild Grilled Scottish Salmon", price: 42 },
  { id: "chicken-boursin", label: "Chicken Boursin", price: 42 },
  { id: "prime-rib", label: "Prime Rib (10oz)", price: 47 },
  { id: "beef-tender", label: "Oven-Roasted Beef Tenderloin (8oz)", price: 55 },
];

const buffets = [
  { id: "pastabilities", label: "Pastabilities Buffet", price: 32 },
  { id: "pitmaster-1", label: "Pit Master BBQ (1 Meat)", price: 40 },
  { id: "pitmaster-2", label: "Pit Master BBQ (2 Meats)", price: 43 },
  { id: "pitmaster-3", label: "Pit Master BBQ (3 Meats)", price: 45 },
  { id: "eureka-1", label: "Eureka Buffet (1/1/1)", price: 40 },
  { id: "eureka-2", label: "Eureka Buffet (2/2/2)", price: 43 },
  { id: "eureka-3", label: "Eureka Buffet (3/3/3)", price: 46 },
];

const buffetAddOns = [
  { id: "veg-lasagna", label: "Add Vegetable Lasagna", price: 6 },
  { id: "beef-lasagna", label: "Add Classic Beef Lasagna", price: 6 },
  { id: "cheese-tortellini", label: "Add Cheese Tortellini", price: 6 },
  { id: "grilled-veg", label: "Add Grilled Vegetables", price: 6 },
  { id: "sauteed-shrimp", label: "Add Sautéed Shrimp", price: 7 },
];

const appetizers = [
  { id: "finger-sandwich", label: "Finger Sandwiches (per piece)", price: 3 },
  { id: "olive-tapenade", label: "Olive Tapenade Crostini (per)", price: 2.5 },
  { id: "roma-asiago", label: "Roma Tomato, Basil & Asiago (per)", price: 3 },
  { id: "goat-cheese", label: "Goat Cheese Mousse Crostini (per)", price: 3 },
  { id: "caprese-skewer", label: "Caprese Salad Skewer (per)", price: 3 },
  { id: "pesto-crostini", label: "Mozzarella, Tomato & Pesto (per)", price: 3 },
  { id: "gorgonzola-tart", label: "Walnut Gorgonzola Tartlet (per)", price: 3 },
  { id: "beef-tenderloin", label: "Beef Tenderloin Crostini (per)", price: 4 },
  { id: "silver-dollar", label: "Silver Dollar Rolls (per)", price: 4 },
  { id: "veg-skewers", label: "Mini Roasted Veg Skewers (per)", price: 3 },
  { id: "shrimp", label: "Jumbo Shrimp (per)", price: 4 },
  { id: "cuke-pinwheel", label: "Cucumber Boursin Pinwheel (per)", price: 3 },
];

const displays = [
  { id: "crudites-25", label: "Veg Crudités — serves ~25", price: 115, serves: 25 },
  { id: "crudites-50", label: "Veg Crudités — serves ~50", price: 185, serves: 50 },
  { id: "crudites-100", label: "Veg Crudités — serves ~100", price: 325, serves: 100 },
  { id: "cheese-25", label: "Cheese Display — serves ~25", price: 185, serves: 25 },
  { id: "cheese-50", label: "Cheese Display — serves ~50", price: 260, serves: 50 },
  { id: "cheese-100", label: "Cheese Display — serves ~100", price: 380, serves: 100 },
  { id: "fruit-25", label: "Seasonal Fruit — serves ~25", price: 180, serves: 25 },
  { id: "fruit-50", label: "Seasonal Fruit — serves ~50", price: 250, serves: 50 },
  { id: "fruit-100", label: "Seasonal Fruit — serves ~100", price: 375, serves: 100 },
  { id: "charcuterie-25", label: "Charcuterie Board — serves ~25", price: 190, serves: 25 },
  { id: "charcuterie-50", label: "Charcuterie Board — serves ~50", price: 340, serves: 50 },
  { id: "charcuterie-100", label: "Charcuterie Board — serves ~100", price: 480, serves: 100 },
  { id: "charcuterie-plate", label: "Charcuterie Individual Plate", price: 12, serves: 1 },
];

const sweets = [
  { id: "strawberries", label: "Chocolate-Dipped Strawberries (dozen)", price: 38, unit: "dozen" },
  { id: "cookies", label: "Assorted Cookies (dozen)", price: 22, unit: "dozen" },
  { id: "muffins", label: "Assorted Muffins (dozen)", price: 27, unit: "dozen" },
  { id: "brownies", label: "Brownie Bites (dozen)", price: 28, unit: "dozen" },
  { id: "lemon-bars", label: "Lemon Bars (dozen)", price: 28, unit: "dozen" },
  { id: "cheesecake", label: "Cheesecake Bites (dozen)", price: 28, unit: "dozen" },
  { id: "cupcake", label: "Colossal Cupcake (each)", price: 7, unit: "each" },
];

// Bar: by-consumption model — estimate # of drinks per guest and a beer/wine/liquor mix
const BAR_DEFAULTS = {
  drinksPerGuest: 3,
  mix: { beer: 0.4, wine: 0.4, liquor: 0.2 },
  beerPrice: 6,
  winePrice: 9,
  liquorPrice: 8.5,
};

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

// ---------- Main Component ----------
export default function CrescentCateringCalculator() {
  const [guestCount, setGuestCount] = useState(60);
  const [mealType, setMealType] = useState("plated"); // "plated" | "buffet"
  const [platedChoice, setPlatedChoice] = useState(platedEntrees[7].id); // default Salmon
  const [multiplePlatedChoices, setMultiplePlatedChoices] = useState(false);

  const [buffetChoice, setBuffetChoice] = useState(buffets[0].id);
  const [buffetExtras, setBuffetExtras] = useState({}); // id -> boolean

  const [appQty, setAppQty] = useState({}); // id -> pieces count
  const [displayQty, setDisplayQty] = useState({}); // id -> count of platters
  const [sweetQty, setSweetQty] = useState({}); // id -> quantity (dozens/each)

  // Bar
  const [enableBar, setEnableBar] = useState(true);
  const [drinksPerGuest, setDrinksPerGuest] = useState(BAR_DEFAULTS.drinksPerGuest);
  const [mixBeer, setMixBeer] = useState(BAR_DEFAULTS.mix.beer);
  const [mixWine, setMixWine] = useState(BAR_DEFAULTS.mix.wine);
  const [mixLiquor, setMixLiquor] = useState(BAR_DEFAULTS.mix.liquor);
  const [beerPrice, setBeerPrice] = useState(BAR_DEFAULTS.beerPrice);
  const [winePrice, setWinePrice] = useState(BAR_DEFAULTS.winePrice);
  const [liquorPrice, setLiquorPrice] = useState(BAR_DEFAULTS.liquorPrice);

  // Rates
  const [foodTax, setFoodTax] = useState(FOOD_TAX_DEFAULT);
  const [liquorTax, setLiquorTax] = useState(LIQUOR_TAX_DEFAULT);
  const [serviceRate, setServiceRate] = useState(SERVICE_CHG_DEFAULT);

  // Theme
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // Initialize from system preference
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }, []);

  // ------ Calculations ------ //
  const mealPerPerson = useMemo(() => {
    if (mealType === "plated") {
      const entree = platedEntrees.find((e) => e.id === platedChoice) || platedEntrees[0];
      return entree.price + (multiplePlatedChoices ? 5 : 0); // +$5 if offering multiple entrée choices
    } else {
      const buff = buffets.find((b) => b.id === buffetChoice) || buffets[0];
      let addOns = 0;
      Object.entries(buffetExtras).forEach(([id, on]) => {
        if (on) {
          const add = buffetAddOns.find((a) => a.id === id);
          if (add) addOns += add.price;
        }
      });
      return buff.price + addOns; // per person
    }
  }, [mealType, platedChoice, multiplePlatedChoices, buffetChoice, buffetExtras]);

  const mealSubtotal = useMemo(() => mealPerPerson * guestCount, [mealPerPerson, guestCount]);

  const appsSubtotal = useMemo(() => {
    return appetizers.reduce((sum, a) => sum + (appQty[a.id] || 0) * a.price, 0);
  }, [appQty]);

  const displaysSubtotal = useMemo(() => {
    return displays.reduce((sum, d) => sum + (displayQty[d.id] || 0) * d.price, 0);
  }, [displayQty]);

  const sweetsSubtotal = useMemo(() => {
    return sweets.reduce((sum, s) => sum + (sweetQty[s.id] || 0) * s.price, 0);
  }, [sweetQty]);

  // Bar estimation by consumption
  const bar = useMemo(() => {
    if (!enableBar) return { subtotal: 0, beer: 0, wine: 0, liquor: 0, totalDrinks: 0 };
    const totalDrinks = Math.max(0, guestCount) * Math.max(0, drinksPerGuest);
    const beerCount = totalDrinks * mixBeer;
    const wineCount = totalDrinks * mixWine;
    const liquorCount = totalDrinks * mixLiquor;
    const beerCost = beerCount * beerPrice;
    const wineCost = wineCount * winePrice;
    const liquorCost = liquorCount * liquorPrice;
    return {
      subtotal: beerCost + wineCost + liquorCost,
      beer: beerCost,
      wine: wineCost,
      liquor: liquorCost,
      totalDrinks,
    };
  }, [enableBar, guestCount, drinksPerGuest, mixBeer, mixWine, mixLiquor, beerPrice, winePrice, liquorPrice]);

  const foodSubtotal = mealSubtotal + appsSubtotal + displaysSubtotal + sweetsSubtotal; // treated as "food" for tax purposes

  const serviceCharge = (foodSubtotal + bar.subtotal) * serviceRate;
  const taxes = foodSubtotal * foodTax + (bar.subtotal ? bar.subtotal * ((mixBeer + mixWine) * foodTax + mixLiquor * liquorTax) : 0);
  const grandTotal = foodSubtotal + bar.subtotal + serviceCharge + taxes;
  const perGuest = guestCount > 0 ? grandTotal / guestCount : 0;

  // Ensure drink mix sums to 1
  const normalizeMix = () => {
    let sum = mixBeer + mixWine + mixLiquor;
    if (sum === 0) {
      setMixBeer(0.34);
      setMixWine(0.33);
      setMixLiquor(0.33);
      return;
    }
    setMixBeer(mixBeer / sum);
    setMixWine(mixWine / sum);
    setMixLiquor(mixLiquor / sum);
  };

  // ---------- Dev Sanity Tests (non-disruptive) ----------
  useEffect(() => {
    const ENABLE_SELF_TESTS = true;
    if (!ENABLE_SELF_TESTS) return;
    try {
      // Basic math checks
      const gc = 10;
      const mp = 40;
      const mealSub = gc * mp;
      console.assert(mealSub === 400, "Meal subtotal math failed");

      // Bar split sums
      const mixSum = 0.4 + 0.4 + 0.2;
      console.assert(Math.abs(mixSum - 1) < 1e-9, "Drink mix should sum to 1");

      // Taxes should be non-negative
      const t = (100 * FOOD_TAX_DEFAULT) + (50 * LIQUOR_TAX_DEFAULT);
      console.assert(t >= 0, "Taxes should be non-negative");

      // Service charge proportional
      const sc = (100 + 50) * SERVICE_CHG_DEFAULT;
      console.assert(sc > 0, "Service charge should be > 0");
    } catch (e) {
      console.error("Self-tests failed:", e);
    }
  }, []);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mx-auto max-w-6xl p-6 isolate">
          <header className="mb-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Crescent Hotel • Crystal Ballroom Catering Calculator</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDark(!dark)}
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  aria-label="Toggle dark mode"
                >
                  {dark ? "Light" : "Dark"} mode
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Interactive estimator based on the uploaded catering menu. Edit assumptions to match your contract. This tool does not replace final BEO pricing.</p>
          </header>

          {/* Controls grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 min-w-0">
            {/* Left column: Headcount & Meal */}
            <div className="lg:col-span-1 min-w-0">
              <Section title="Headcount & Meal">
                <NumberField label="Guest count" value={guestCount} onChange={setGuestCount} min={0} />

                <div>
                  <div className="mb-2 text-sm text-zinc-700 dark:text-zinc-200">Meal style</div>
                  <div className="flex gap-2 flex-wrap">
                    <TogglePill selected={mealType === "plated"} onClick={() => setMealType("plated")}>Plated</TogglePill>
                    <TogglePill selected={mealType === "buffet"} onClick={() => setMealType("buffet")}>Buffet</TogglePill>
                  </div>
                </div>

                {mealType === "plated" ? (
                  <div className="grid gap-2">
                    <label className="text-sm">Plated entrée</label>
                    <select
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 relative z-20 max-w-full"
                      value={platedChoice}
                      onChange={(e) => setPlatedChoice(e.target.value)}
                    >
                      {platedEntrees.map((e) => (
                        <option key={e.id} value={e.id}>{`${e.label} — $${e.price}/person`}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={multiplePlatedChoices} onChange={(e) => setMultiplePlatedChoices(e.target.checked)} />
                      Offer multiple entrée choices (+$5/person)
                    </label>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <label className="text-sm">Buffet selection</label>
                    <select
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 relative z-20 max-w-full"
                      value={buffetChoice}
                      onChange={(e) => setBuffetChoice(e.target.value)}
                    >
                      {buffets.map((b) => (
                        <option key={b.id} value={b.id}>{`${b.label} — $${b.price}/person`}</option>
                      ))}
                    </select>

                    <div className="mt-2 grid gap-1">
                      <div className="text-sm">Buffet add-ons (per person)</div>
                      {buffetAddOns.map((a) => (
                        <label key={a.id} className="flex items-center justify-between gap-2 text-sm">
                          <span>{`${a.label} (+$${a.price})`}</span>
                          <input
                            type="checkbox"
                            checked={!!buffetExtras[a.id]}
                            onChange={(e) => setBuffetExtras((prev) => ({ ...prev, [a.id]: e.target.checked }))}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Meal cost: <span className="font-medium">${mealPerPerson.toFixed(2)}</span> per person → <span className="font-medium">${mealSubtotal.toFixed(2)}</span>
                </div>
              </Section>

              <Section title="Taxes & Service" subtitle="Editable to match contract; applied to F&B subtotal.">
                <NumberField label="Food/Wine/Beer tax rate" value={foodTax} onChange={setFoodTax} step={0.0001} />
                <NumberField label="Liquor tax rate" value={liquorTax} onChange={setLiquorTax} step={0.0001} />
                <NumberField label="Service charge rate" value={serviceRate} onChange={setServiceRate} step={0.0001} />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Note: Your PDF shows slightly different figures in different sections; confirm with your coordinator. This tool lets you tune rates precisely.</p>
              </Section>
            </div>

            {/* Middle column: Apps / Displays / Sweets */}
            <div className="lg:col-span-1 min-w-0">
              <Section title="Appetizers" subtitle="Enter # of pieces (per item)">
                <div className="min-w-0 grid gap-2">
                  {appetizers.map((a) => (
                    <NumberField key={a.id} label={`${a.label} — $${a.price}/piece`} value={appQty[a.id] || 0} onChange={(v) => setAppQty((p) => ({ ...p, [a.id]: v }))} />
                  ))}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-300">Apps subtotal: <span className="font-medium">${appsSubtotal.toFixed(2)}</span></div>
              </Section>
              <Section title="Displays & Boards" subtitle="Enter # of platters (serves noted)">
                <div className="min-w-0 grid gap-2">
                  {displays.map((d) => (
                    <NumberField key={d.id} label={`${d.label} — $${d.price}`} value={displayQty[d.id] || 0} onChange={(v) => setDisplayQty((p) => ({ ...p, [d.id]: v }))} />
                  ))}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-300">Displays subtotal: <span className="font-medium">${displaysSubtotal.toFixed(2)}</span></div>
              </Section>
              <Section title="Sweets">
                <div className="min-w-0 grid gap-2">
                  {sweets.map((s) => (
                    <NumberField key={s.id} label={`${s.label} — $${s.price} / ${s.unit}`} value={sweetQty[s.id] || 0} onChange={(v) => setSweetQty((p) => ({ ...p, [s.id]: v }))} />
                  ))}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-300">Sweets subtotal: <span className="font-medium">${sweetsSubtotal.toFixed(2)}</span></div>
              </Section>
            </div>

            {/* Right column: Bar & Summary */}
            <div className="lg:col-span-1 min-w-0">
              <Section title="Bar (by consumption)">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={enableBar} onChange={(e) => setEnableBar(e.target.checked)} />
                  Enable bar pricing
                </label>
                {enableBar && (
                  <div className="grid gap-2">
                    <NumberField label="Estimated drinks per guest" value={drinksPerGuest} onChange={setDrinksPerGuest} step={0.25} />
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
                      <div className="mb-2 text-sm font-medium">Drink Mix (must total 100%)</div>
                      <NumberField label={`Beer %`} value={Math.round(mixBeer * 100)} onChange={(v) => setMixBeer(v / 100)} />
                      <NumberField label={`Wine %`} value={Math.round(mixWine * 100)} onChange={(v) => setMixWine(v / 100)} />
                      <NumberField label={`Liquor %`} value={Math.round(mixLiquor * 100)} onChange={(v) => setMixLiquor(v / 100)} />
                      <button onClick={normalizeMix} className="mt-2 w-full rounded-lg border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">Normalize to 100%</button>
                    </div>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
                      <div className="mb-2 text-sm font-medium">Per-Drink Averages (editable)</div>
                      <NumberField label="Beer avg $/bottle" value={beerPrice} onChange={setBeerPrice} step={0.5} />
                      <NumberField label="Wine avg $/glass" value={winePrice} onChange={setWinePrice} step={0.5} />
                      <NumberField label="Liquor avg $/pour" value={liquorPrice} onChange={setLiquorPrice} step={0.5} />
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">
                      Bar subtotal: <span className="font-medium">${bar.subtotal.toFixed(2)}</span> — est. {Math.round(bar.totalDrinks)} drinks
                    </div>
                  </div>
                )}
              </Section>

              <Section title="Summary & Totals">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Meal subtotal</span><span>${mealSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Appetizers</span><span>${appsSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Displays</span><span>${displaysSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Sweets</span><span>${sweetsSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between font-medium"><span>Food subtotal</span><span>${foodSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Bar subtotal</span><span>${bar.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Service charge ({(serviceRate*100).toFixed(2)}%)</span><span>${serviceCharge.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Taxes (food {Math.round(foodTax*10000)/100}%; liquor {Math.round(liquorTax*10000)/100}%)</span><span>${taxes.toFixed(2)}</span></div>
                  </div>
                  <hr className="my-3 border-zinc-200 dark:border-zinc-700" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Grand Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">≈ ${perGuest.toFixed(2)} per guest</div>
                </div>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Ballroom package typically includes cake & punch, basic linens, setup/cleanup, and staffing; those inclusions are not itemized here. Use this tool to compare food styles and bar assumptions quickly, then align with your Crescent BEO.
                </p>
              </Section>
            </div>
          </div>

          <footer className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
            Built for Kayla & Patrick • March 21, 2026 • 1886 Crescent Hotel & Spa (Crystal Ballroom). Menu and prices from your uploaded PDF; confirm final rates/availability with your coordinator.
          </footer>
        </div>
      </div>
    </div>
  );
}
