export const data: typeof import("./data/data.ts") = await import("./data/data.ts");
export const environment: typeof import("./environment/environment.ts") =
  await import("./environment/environment.ts");
export const filesystem: typeof import("./filesystem/filesystem.ts") =
  await import("./filesystem/filesystem.ts");
export const math: typeof import("./math/math.ts") = await import("./math/math.ts");
export const misc: typeof import("./misc/misc.ts") = await import("./misc/misc.ts");
export const timing: typeof import("./timing/timing.ts") = await import("./timing/timing.ts");
export const validate: typeof import("./validate/validate.ts") =
  await import("./validate/validate.ts");

export * as Types from "./types/types.ts";
