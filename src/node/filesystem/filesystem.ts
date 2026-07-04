import { type PathLike } from "node:fs";
import { open } from "node:fs/promises";
import type { BetterReadStream, BetterReadStreamOptions } from "./types.ts";

export const betterReadStream: BetterReadStream = async function* (
  path: PathLike,
  options?: BetterReadStreamOptions,
) {
  const handle = await open(path);
  const stat = await handle.stat().catch((error) => {
    handle.close();
    throw error;
  });

  try {
    let offset = options?.offset ?? 0;
    let endOffset = options?.length == null ? stat.size : offset + Math.floor(options.length);
    let chunkSize = options?.chunkSize ?? 16384;

    if (offset >= stat.size) throw new RangeError("Offset out of range.");
    if (endOffset > stat.size) endOffset = stat.size;
    if (endOffset < offset) throw new RangeError("Invalid end offset.");

    while (offset < endOffset) {
      const readSize = Math.min(chunkSize, endOffset - offset);
      const chunk = await handle.read(Buffer.allocUnsafe(readSize), 0, readSize, offset);

      offset += chunk.bytesRead;
      yield chunk.buffer;
    }
  } finally {
    await handle.close();
  }
};

export * from "./types.ts";
