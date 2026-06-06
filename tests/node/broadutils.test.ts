import { describe, expect, it } from "vitest";
import * as broadutils from "../../src/node/broadutils.ts";

describe("node/broadutils", () => {
  it("exposes each node utility module through the barrel", () => {
    expect(broadutils.data.array).to.be.an("object");
    expect(broadutils.filesystem.which).to.be.a("function");
    expect(broadutils.math.clamp(2, 1, 3)).to.equal(2);
    expect(broadutils.misc.noop()).to.equal(null);
    expect(broadutils.timing.time).to.be.a("function");
    expect(broadutils.validate.check.string("x")).to.equal(true);
  });
});
