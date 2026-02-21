import type { ArrayUtils, CloneState, DataUrlSource, ObjectUtils, StringUtils } from "./types.ts";
export declare const convertToDataUrl: (source: DataUrlSource, mimeType?: string | undefined) => Promise<string>;
export declare const array: ArrayUtils;
export declare const clone: <T>(value: T, state?: CloneState) => T;
export declare const object: ObjectUtils;
export declare const string: StringUtils;
export * from "./types.ts";
//# sourceMappingURL=data.d.ts.map