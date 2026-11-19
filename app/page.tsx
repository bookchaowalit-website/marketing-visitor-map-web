"use client";

import { useMemo, useState } from "react";
import { DashFoot, DashTop, Pill, Stat } from "@/components/dashboard-shell";
import { addHit, cityForTimeZone, countByCity, MAX_HITS, parseHits, simulatedHit, type Hit } from "@/lib/visits";
import { useStoredState } from "@/lib/use-stored-state";

const STORAGE_KEY = "book-visitor-map-v2";
const EMPTY: Hit[] = [];
const SOURCE = "https://github.com/bookchaowalit-website/marketing-visitor-map-web";
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export default function VisitorMap() {
  const [hits, setHits] = useStoredState(STORAGE_KEY, EMPTY, parseHits);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const counts = useMemo(() => countByCity(hits), [hits]);
  const mine = hits.filter((hit) => hit.source === "self").length;
  const busiest = counts[0]?.count ? counts[0] : null;
  const chosen = counts.find((city) => city.city === selected) ?? null;

  function simulateVisitor() {
    const hit = simulatedHit(Math.random(), crypto.randomUUID());
    setHits((current) => addHit(current, hit));
    setSelected(hit.city);
    setNotice(`Simulated visitor marked in ${hit.city}.`);
  }

  function markMyVisit() {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    const city = cityForTimeZone(zone);
    if (!city) { setNotice(`Your time zone (${zone || "unknown"}) is not near any city on this map.`); return; }
    setHits((current) => addHit(current, { ...city, id: crypto.randomUUID(), source: "self" }));
    setSelected(city.city);
    setNotice(`Your visit was marked near ${city.city}, based only on your browser time zone (${zone}).`);
  }

  function clearMarks() {
    setHits([]);
    setSelected(null);
    setNotice("All marks cleared.");
  }

  return (
    <div className="ds">
      <a className="ds-skip" href="#main">Skip to content</a>
      <DashTop name="Visitor Map" tagline="Five fixed cities, marks kept in this browser" />

      <main id="main" tabIndex={-1} className="ds-main">
        <div className="ds-head">
          <div>
            <h1>Where visits were marked</h1>
            <p>Your own visit by time zone, plus simulated ones <Pill tone="grey">Not live analytics</Pill></p>
          </div>
          <div className="ds-actions">
            <button type="button" className="ds-button" onClick={markMyVisit}>Mark my visit</button>
            <button type="button" className="ds-plain" onClick={simulateVisitor}>Simulate a visitor</button>
            <button type="button" className="ds-plain" onClick={clearMarks} disabled={hits.length === 0}>Clear marks</button>
          </div>
        </div>

        <ul className="ds-stats" aria-label="Marks at a glance">
          <Stat label="Marked visits" value={hits.length} note={`newest ${MAX_HITS} are kept`} />
          <Stat label="Yours" value={mine} note="by browser time zone" />
          <Stat label="Simulated" value={hits.length - mine} note="added with Simulate" />
          <Stat label="Busiest city" value={busiest ? busiest.city : "—"} note={busiest ? plural(busiest.count, "mark") : "no marks yet"} />
        </ul>

        <div className="ds-grid">
          <section className="ds-panel" aria-labelledby="map-heading">
            <div className="ds-panel-head">
              <div>
                <h2 id="map-heading">Map</h2>
                <p>An abstract projection: positions are fixed per city, not latitude and longitude</p>
              </div>
            </div>
            <ul className="vm-legend" aria-label="Legend">
              <li><span className="vm-key vm-key-self" aria-hidden="true" />Your visit (filled dot)</li>
              <li><span className="vm-key vm-key-sim" aria-hidden="true" />Simulated (ring)</li>
            </ul>
            <div className="vm-map">
              <svg viewBox="0 0 100 84" role="img" aria-label={hits.length ? `Map with ${plural(hits.length, "mark")}: ${counts.filter((c) => c.count).map((c) => `${c.city} ${c.count}`).join(", ")}.` : "Map with no marks yet."}>
                <path className="vm-land" d="M8 21 C15 12 28 12 33 18 L39 25 34 31 28 29 23 35 16 31 10 34 5 28Z" />
                <path className="vm-land" d="M44 15 L54 12 60 17 57 25 63 30 61 39 55 42 51 35 46 34 44 27 39 24Z" />
                <path className="vm-land" d="M64 16 L77 12 89 19 94 28 86 34 79 30 73 35 67 29 61 27Z" />
                <path className="vm-land" d="M59 46 L68 49 73 58 69 66 65 74 59 69 56 58Z" />
                {counts.map((city) => {
                  const simulated = city.count - city.self;
                  const on = selected === city.city;
                  return (
                    <g key={city.city} className={on ? "vm-city selected" : "vm-city"}>
                      {city.count === 0 ? <circle className="vm-empty" cx={city.x} cy={city.y} r={0.9} /> : null}
                      {simulated > 0 ? <circle className="vm-sim" cx={city.x} cy={city.y} r={on ? 3.4 : 2.8} /> : null}
                      {city.self > 0 ? <circle className="vm-self" cx={city.x} cy={city.y} r={on ? 1.9 : 1.5} /> : null}
                    </g>
                  );
                })}
              </svg>
              {counts.map((city) => (
                <span key={city.city} className="vm-label" data-on={selected === city.city} data-side={city.y > 66 ? "left" : undefined} style={{ left: `${city.x}%`, top: `${(city.y / 84) * 100}%` }} aria-hidden="true">
                  {city.city}{city.count ? ` · ${city.count}` : ""}
                </span>
              ))}
              {hits.length === 0 ? (
                <p className="vm-empty-state">No marks yet. Press <strong>Mark my visit</strong> above to place yours, or simulate a visitor.</p>
              ) : null}
            </div>
            <p className="vm-status" role="status">{notice || "Marks stay in this browser and nowhere else."}</p>
          </section>

          <section className="ds-panel" aria-labelledby="cities-heading">
            <div className="ds-panel-head">
              <div>
                <h2 id="cities-heading">Cities</h2>
                <p>Marks per city, busiest first · select one to highlight it</p>
              </div>
            </div>
            <ul className="ds-rows">
              {counts.map((city) => {
                const share = hits.length ? Math.round((city.count / hits.length) * 100) : 0;
                return (
                  <li key={city.city}>
                    <button type="button" className="ds-row" aria-pressed={selected === city.city} onClick={() => setSelected(city.city)}>
                      <span className="ds-row-name">{city.city}</span>
                      <span className="ds-row-detail">{city.country} · {city.count ? `${share}% of marks${city.self ? ` · ${city.self} yours` : ""}` : "no marks yet"}</span>
                      <span className="ds-row-value">{city.count}</span>
                      <span className="ds-meter" aria-hidden="true"><span style={{ width: `${share}%` }} /></span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="ds-callout" aria-live="polite">
              {chosen ? (
                <>
                  <strong>{chosen.city}, {chosen.country}</strong>
                  <span>{chosen.count ? `${plural(chosen.count, "mark")}: ${chosen.self} yours, ${chosen.count - chosen.self} simulated.` : "No marks here yet."}</span>
                </>
              ) : (
                <>
                  <strong>No city selected</strong>
                  <span>Select a city to highlight it on the map.</span>
                </>
              )}
            </div>
          </section>
        </div>

        <p className="ds-note">Your mark uses only the browser time zone, snapped to the nearest of five listed cities. No IP lookup, map provider, remote analytics or geographic accuracy is involved, and nothing leaves this browser.</p>
      </main>

      <DashFoot source={SOURCE} />
    </div>
  );
}
