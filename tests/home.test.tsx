import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VisitorMap from "@/app/page";
import { CITIES } from "@/lib/visits";

describe("home page", () => {
  it("renders the empty atlas, every fixed city and the no-geo-claim boundary", () => {
    const html = renderToString(<VisitorMap />);
    expect(html).toContain("Read the room,");
    expect(html).toContain("Mark my visit");
    expect(html).toContain("Simulate visitor");
    expect(html).toContain("NO LAST MARK");
    for (const city of CITIES) expect(html).toContain(city.city);
    expect(html).toContain("No IP lookup, map provider, remote analytics, or geographic accuracy is involved.");
    expect(html).toContain("LOCAL SIMULATION · NO GEO CLAIM");
  });
});
