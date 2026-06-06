import type { Assert, Check } from "./types.ts";
export declare const assert: Assert;
export declare const check: Check;
export declare const isNonNullable: <T>(value: T) => value is NonNullable<T>;
export declare const nonNullable: <T>(value: T, message?: string) => NonNullable<T>;
export * from "./types.ts";
//# sourceMappingURL=validate.d.ts.map