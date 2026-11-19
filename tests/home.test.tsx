// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VisitorMap from "@/app/page";
import { CITIES } from "@/lib/visits";

// Mounted tests for the visitor map on the Dashboard shell: marks, empty state, city selection and storage.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const KEY = "book-visitor-map-v2";
let root: Root;
let host: HTMLDivElement;
const $ = (selector: string) => host.querySelector(selector) as HTMLElement | null;
const button = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent?.trim().startsWith(text)) as HTMLButtonElement;
const press = (el: Element) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
const stats = () => [...host.querySelectorAll(".ds-stat")].map((tile) => tile.textContent);
const mount = () => act(() => root.render(<VisitorMap />));
const zone = (timeZone: string) => vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({ timeZone } as Intl.ResolvedDateTimeFormatOptions);

beforeEach(() => {
  window.localStorage.clear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

describe("visitor map", () => {
  it("server-renders the empty map, every fixed city and the no-geo boundary", () => {
    const html = renderToString(<VisitorMap />);
    expect(html).toContain("Where visits were marked");
    expect(html).toContain("Not live analytics");
    for (const city of CITIES) expect(html).toContain(city.city);
    expect(html).toContain("No IP lookup, map provider, remote analytics or geographic accuracy is involved");
    expect(html).toContain('href="https://bookchaowalit.com/"');
  });

  it("opens empty with a prompt that points at Mark my visit and Clear disabled", () => {
    mount();
    expect($(".vm-empty-state")?.textContent).toContain("Press Mark my visit above");
    expect(stats()).toEqual(["Marked visits0newest 40 are kept", "Yours0by browser time zone", "Simulated0added with Simulate", "Busiest city—no marks yet"]);
    expect(button("Clear marks").disabled).toBe(true);
    expect($("svg")?.getAttribute("aria-label")).toBe("Map with no marks yet.");
    expect($(".ds-callout")?.textContent).toBe("No city selectedSelect a city to highlight it on the map.");
    expect(host.querySelectorAll(".ds-row-detail")[0].textContent).toBe("TH · no marks yet");
  });

  it("marks your own visit from the browser time zone and selects that city", () => {
    zone("Asia/Tokyo");
    mount();
    press(button("Mark my visit"));
    expect($('[role="status"]')?.textContent).toBe("Your visit was marked near Tokyo, based only on your browser time zone (Asia/Tokyo).");
    expect(stats()[1]).toBe("Yours1by browser time zone");
    expect(stats()[3]).toBe("Busiest cityTokyo1 mark");
    expect($(".vm-empty-state")).toBeNull();
    expect(host.querySelectorAll(".vm-self")).toHaveLength(1);
    expect(button("Tokyo").getAttribute("aria-pressed")).toBe("true");
    expect($(".ds-callout")?.textContent).toBe("Tokyo, JP1 mark: 1 yours, 0 simulated.");
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? "[]")).toHaveLength(1);
  });

  it("says so when the time zone is not near any city", () => {
    zone("Antarctica/Troll");
    mount();
    press(button("Mark my visit"));
    expect($('[role="status"]')?.textContent).toBe("Your time zone (Antarctica/Troll) is not near any city on this map.");
    expect(stats()[0]).toBe("Marked visits0newest 40 are kept");
  });

  it("adds simulated visitors as rings, counts shares and clears everything", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    mount();
    press(button("Simulate a visitor"));
    press(button("Simulate a visitor"));
    expect($('[role="status"]')?.textContent).toBe("Simulated visitor marked in Bangkok.");
    expect(stats()[2]).toBe("Simulated2added with Simulate");
    expect(host.querySelectorAll(".vm-sim")).toHaveLength(1);
    expect($("svg")?.getAttribute("aria-label")).toBe("Map with 2 marks: Bangkok 2.");
    expect(host.querySelectorAll(".ds-row-detail")[0].textContent).toBe("TH · 100% of marks");
    press(button("Berlin"));
    expect($(".ds-callout")?.textContent).toBe("Berlin, DENo marks here yet.");
    press(button("Clear marks"));
    expect($('[role="status"]')?.textContent).toBe("All marks cleared.");
    expect(stats()[0]).toBe("Marked visits0newest 40 are kept");
    expect($(".ds-callout")?.textContent).toContain("No city selected");
  });

  it("reads the result right under the buttons and keeps the empty note out of the map drawing", () => {
    mount();
    // The status sits with the buttons in the head, so a phone shows it without scrolling to the map.
    const status = $('[role="status"]');
    expect(status?.closest(".vm-controls")?.querySelector(".ds-actions")?.contains(button("Mark my visit"))).toBe(true);
    expect(status?.closest(".ds-head")).not.toBeNull();
    expect(host.querySelectorAll('[role="status"]')).toHaveLength(1);
    // The empty note comes before the map box, not inside it over the markers and city labels.
    const note = $(".vm-empty-state");
    const map = $(".vm-map");
    expect(note?.closest(".vm-map")).toBeNull();
    expect(note?.nextElementSibling).toBe(map);
    expect(map?.querySelector(".vm-empty-state")).toBeNull();
  });

  it("restores saved marks from this browser", () => {
    window.localStorage.setItem(KEY, JSON.stringify([{ city: "Sydney", id: "a", source: "self" }, { city: "Sydney", id: "b", source: "simulated" }]));
    mount();
    expect(stats()[3]).toBe("Busiest citySydney2 marks");
    expect(host.querySelectorAll(".ds-row-detail")[0].textContent).toBe("AU · 100% of marks · 1 yours");
  });
});
