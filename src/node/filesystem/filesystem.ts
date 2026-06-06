import { accessSync, type PathLike } from "node:fs";
import { open } from "node:fs/promises";
import { delimiter, join } from "node:path";
import type { BetterReadStream, BetterReadStreamOptions, Which, WhichOptions } from "./types.ts";

const IS_WINDOWS = process.platform === "win32";

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

export const which: Which = Object.assign(
  (name: string, options: WhichOptions = {}): string | null => {
    const _name = name.toLowerCase();
    const exeNames = [_name];
    IS_WINDOWS && !_name.endsWith(".exe") && exeNames.push(`${_name}.exe`);

    const env = options.env ?? process.env;
    const includeCwd = options.cwd != null || !!options.includeCwd;
    const cwd = options.cwd ?? process.cwd();

    const envPaths = (env.PATH || env.Path || env.path || "").split(delimiter);
    includeCwd && envPaths.unshift(cwd);

    for (const path of envPaths) {
      for (const exeName of exeNames) {
        const resolvedPath = join(path, exeName);
        try {
          accessSync(resolvedPath);
          return resolvedPath;
        } catch {}
      }
    }

    return null;
  },
  {
    many: <T extends string[]>(
      names: T,
      options: WhichOptions = {},
    ): { [Name in T[number]]: string | null } => {
      const exeNames = names.map((name) => {
        return IS_WINDOWS && !(name.endsWith(".exe") || name.endsWith(".EXE"))
          ? [name, `${name}.exe`, `${name}.EXE`]
          : [name];
      });

      const env = options.env ?? process.env;
      const includeCwd = options.cwd != null || !!options.includeCwd;
      const cwd = options.cwd ?? process.cwd();

      const envPaths = (env.PATH || env.Path || env.path || "").split(delimiter);
      includeCwd && envPaths.unshift(cwd);

      const exeLocations: (string | null)[] = new Array(names.length).fill(null);
      let located = 0;

      for (const path of envPaths) {
        for (let i = 0; i < exeNames.length; i++) {
          if (exeLocations[i]! !== null) continue;
          for (const exeName of exeNames[i]!) {
            const resolvedPath = join(path, exeName);
            try {
              accessSync(resolvedPath);
              exeLocations[i] = resolvedPath;
              located++;
              break;
            } catch {}
          }
        }

        if (located === exeNames.length) break;
      }

      const result = {} as { [Name in T[number]]: string | null };
      for (let i = 0; i < names.length; i++)
        result[names[i]! as T[number]] = exeLocations[i] ?? null;

      return result;
    },
  },
);

export * from "./types.ts";
