import { beforeAll, describe, expect, it } from "vitest";
import { installCanvasMocks } from "./browser-apis.ts";

let broadutils: typeof import("../../src/browser/broadutils.ts");

describe("browser/broadutils", () => {
  beforeAll(async () => {
    installCanvasMocks();
    broadutils = await import("../../src/browser/broadutils.ts");
  });

  it("exposes each browser utility module through the barrel", () => {
    expect(broadutils.canvas.resize).to.be.a("function");
    expect(broadutils.data.array).to.be.an("object");
    expect(broadutils.math.clamp(2, 1, 3)).to.equal(2);
    expect(broadutils.network.fetch).to.be.a("function");
    expect(broadutils.timing.time).to.be.a("function");
    expect(broadutils.validate.check.string("x")).to.equal(true);
  });
});
