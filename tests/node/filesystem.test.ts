import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { betterReadStream } from "../../src/node/filesystem/filesystem.ts";

let tempDir = "";

describe("node/filesystem betterReadStream", () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "broadutils-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("streams a whole file in chunks", async () => {
    const path = join(tempDir, "file.txt");
    await writeFile(path, "abcdefghij");

    const chunks: Buffer[] = [];
    for await (const chunk of betterReadStream(path, { chunkSize: 4 })) {
      chunks.push(Buffer.from(chunk));
    }

    expect(Buffer.concat(chunks).toString()).to.equal("abcdefghij");
  });

  it("streams a bounded range", async () => {
    const path = join(tempDir, "file.txt");
    await writeFile(path, "abcdefghij");

    const chunks: Buffer[] = [];
    for await (const chunk of betterReadStream(path, { offset: 2, length: 5, chunkSize: 2 })) {
      chunks.push(Buffer.from(chunk));
    }

    expect(Buffer.concat(chunks).toString()).to.equal("cdefg");
  });

  it("rejects out-of-range offsets", async () => {
    const path = join(tempDir, "file.txt");
    await writeFile(path, "abc");

    const iterator = betterReadStream(path, { offset: 10 });
    try {
      await iterator.next();
      throw new Error("Expected betterReadStream to reject");
    } catch (error) {
      expect(error).to.be.instanceOf(RangeError);
      expect((error as Error).message).to.equal("Offset out of range.");
    }
  });
});
