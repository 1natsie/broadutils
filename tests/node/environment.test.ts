import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ArgumentsParsingError,
  ArgumentsSpecificationError,
  parseArgs,
  which,
  type ArgumentsSpecification,
} from "../../src/node/environment/environment.ts";

let tempDir = "";

describe("node/environment parseArgs", () => {
  it("validates arguments specification", () => {
    const ASError = ArgumentsSpecificationError;
    // @ts-expect-error
    expect(() => parseArgs({ args: [], specification: { alpha: {} } })).to.throw(ASError);
    // @ts-expect-error
    expect(() => parseArgs({ args: [], specification: { alpha: { type: "invalid" } } })).to.throw(
      ASError,
    );
    expect(() =>
      parseArgs({
        args: [],
        // @ts-expect-error
        specification: { alpha: { type: "string", short: "beta" }, beta: {} },
      }),
    ).to.throw(ASError);
    expect(() =>
      parseArgs({
        args: [],
        // @ts-expect-error
        specification: { alpha: { type: "string", multiple: true, default: 1 } },
      }),
    ).to.throw(ASError);
    expect(() =>
      parseArgs({
        args: [],
        // @ts-expect-error
        specification: { alpha: { type: "string", multiple: false, default: [1] } },
      }),
    ).to.throw(ASError);
  });

  it("parses named arguments from a string array", () => {
    const spec = {
      option1: { type: "string" },
      option2: { type: "string" },
    } satisfies ArgumentsSpecification;
    const args = ["--option1", "value1", "--option2", "value2"];
    const result = parseArgs({ args: args, specification: spec });
    expect(result).toHaveProperty("values");
    expect(result).toHaveProperty("positionals");
    expect(result.values).to.deep.equal({ option1: "value1", option2: "value2" });
  });

  it("parses argument values when their short names are used", () => {
    const spec = {
      option1: { type: "string", short: "o1" },
      option2: { type: "string", short: "o2" },
    } satisfies ArgumentsSpecification;
    const args = ["-o1", "value1", "--option2", "value2"];
    const result = parseArgs({ args: args, specification: spec });
    expect(result.values).to.deep.equal({ option1: "value1", option2: "value2" });
  });

  it("parses in-place assigned argument values", () => {
    expect(
      parseArgs({ args: ["-a=1"], specification: { alpha: { type: "number", short: "a" } } })
        .values,
    ).to.deep.equal({ alpha: 1 });
  });

  it("allows omission of argument value for boolean type arguments", () => {
    const specification = {
      alpha: { type: "boolean", default: false },
    } satisfies ArgumentsSpecification;

    expect(parseArgs({ args: ["--alpha", "true"], specification })).to.deep.equal(
      parseArgs({ args: ["--alpha"], specification }),
    );
  });

  it("throws if long and short name prefixes are mismatched", () => {
    const spec = {
      option1: { type: "string", short: "o1" },
      option2: { type: "string", short: "o2" },
    } satisfies ArgumentsSpecification;
    expect(() =>
      parseArgs({ args: ["--o1", "value1", "--option2", "value2"], specification: spec }),
    ).to.throw(ArgumentsParsingError);
    expect(() =>
      parseArgs({ args: ["--option1", "value1", "-option2", "value2"], specification: spec }),
    ).to.throw(ArgumentsParsingError);
  });

  it("converts argument values to their specified type", () => {
    expect(
      parseArgs({
        args: ["--alpha", "1", "--beta"],
        specification: { alpha: { type: "number" }, beta: { type: "boolean" } },
      }).values,
    ).to.deep.equal({ alpha: 1, beta: true });
  });

  it("uses the default value for arguments that were not provided", () => {
    expect(
      parseArgs({ args: [], specification: { alpha: { type: "number", default: 123 } } }).values,
    ).to.deep.equal({ alpha: 123 });
  });

  it("throws if some required arguments were not provided", () => {
    expect(() =>
      parseArgs({ args: [], specification: { alpha: { type: "number", required: true } } }),
    ).to.throw(ArgumentsParsingError, /Required argument not provided/);
  });

  it("replaces the default value of an multiple value argument when appendToDefault is false", () => {
    expect(
      parseArgs({
        args: ["--alpha=3"],
        specification: {
          alpha: { type: "number", multiple: true, default: [0], appendToDefault: false },
        },
      }).values,
    ).to.deep.equal({ alpha: [3] });
  });

  it("appends to the default value of an multiple value argument when appendToDefault is true", () => {
    expect(
      parseArgs({
        args: ["--alpha=3"],
        specification: {
          alpha: { type: "number", multiple: true, default: [0], appendToDefault: true },
        },
      }).values,
    ).to.deep.equal({ alpha: [0, 3] });
  });

  it("yields generic argument values if unknown arguments are encountered and allowUnknown is true", () => {
    expect(
      parseArgs({
        args: ["--unknownBooleanArgument", "--unknownStringArgument=value"],
        specification: {},
        allowUnknown: true,
      }).values,
    ).to.deep.equal({ unknownBooleanArgument: true, unknownStringArgument: "value" });
  });

  it("throws if positional arguments are encountered and allowUnknown is false", () => {
    expect(
      () =>
        parseArgs({
          args: ["--unknownBooleanArgument", "--unknownStringArgument=value"],
          specification: {},
          allowUnknown: false,
        }).values,
    ).to.throw(ArgumentsParsingError);
  });
});

describe("node/environment which", () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "broadutils-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("finds executables on PATH-like environment entries", async () => {
    const first = join(tempDir, "first");
    const second = join(tempDir, "second");
    await mkdir(first);
    await mkdir(second);
    await writeFile(join(second, "tool"), "");

    expect(which("tool", { env: { PATH: [first, second].join(delimiter) } })).to.equal(
      join(second, "tool"),
    );
  });

  it("can include cwd in the search path", async () => {
    await writeFile(join(tempDir, "local-tool"), "");

    expect(which("local-tool", { cwd: tempDir, env: { PATH: "" } })).to.equal(
      join(tempDir, "local-tool"),
    );
  });

  it("finds many names and reports misses", async () => {
    await writeFile(join(tempDir, "one"), "");

    expect(which.many(["one", "missing"], { env: { PATH: tempDir } })).to.deep.equal({
      one: join(tempDir, "one"),
      missing: null,
    });
  });
});
