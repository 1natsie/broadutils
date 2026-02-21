import type { CallbackFunctionOne, DeepFrozen, IfExtendsThenElse, Nullish, OrArray } from "../types/types.ts";
export type CloneState = {
    cache: WeakMap<object, object>;
};
export type DataUrlSource = OrArray<Blob | ArrayBuffer | ArrayBufferView<ArrayBuffer>>;
export type WalkConfig = {
    leafPriority: boolean;
};
export type WalkEncounterDetails<T = any> = {
    key: string | null;
    value: T;
    parent: object | null;
    children: [PropertyKey, any][] | null;
};
export interface ArrayUtils {
    append: {
        <T extends unknown[], A1 extends unknown[]>(target: T, ...sources: [A1]): [...T, ...A1];
        <T extends unknown[], A1 extends unknown[], A2 extends unknown[]>(target: T, ...sources: [A1, A2]): [...T, ...A1, ...A2];
        <T extends unknown[], A1 extends unknown[], A2 extends unknown[], A3 extends unknown[]>(target: T, ...sources: [A1, A2, A3]): [...T, ...A1, ...A2, ...A3];
        <T extends unknown[], Appended>(target: T, ...sources: Appended[]): [...T, ...Appended[]];
    };
    prepend: {
        <T extends unknown[], P1 extends unknown[]>(target: T, ...sources: [P1]): [...P1, ...T];
        <T extends unknown[], P1 extends unknown[], P2 extends unknown[]>(target: T, ...sources: [P1, P2]): [...P1, ...P2, ...T];
        <T extends unknown[], P1 extends unknown[], P2 extends unknown[], P3 extends unknown[]>(target: T, ...sources: [P1, P2, P3]): [...P1, ...P2, ...P3, ...T];
        <T extends unknown[], Prepended>(target: T, ...sources: Prepended[]): [...Prepended[], ...T];
    };
    compare: <T, U>(a: T[], b: U[], compareFn?: (a: T, b: U) => number) => -1 | 0 | 1;
    padStart: <T extends unknown[]>(value: T, length: number, padWith?: unknown) => T;
    padEnd: <T extends unknown[]>(value: T, length: number, padWith?: unknown) => T;
    toReversed: <T>(value: T[]) => T[];
}
export interface ObjectUtils {
    deepFreeze<T extends object>(obj: T): DeepFrozen<T>;
    merge<T, U, V, W>(...sources: [T?, U?, V?, W?]): IfExtendsThenElse<T, Nullish, {}, T> & IfExtendsThenElse<U, Nullish, {}, U> & IfExtendsThenElse<V, Nullish, {}, V> & IfExtendsThenElse<W, Nullish, {}, W>;
    merge(...sources: unknown[]): unknown;
    mergeInto<T extends object, U, V, W>(...sources: [T, U?, V?, W?]): T & IfExtendsThenElse<U, Nullish, {}, U> & IfExtendsThenElse<V, Nullish, {}, V> & IfExtendsThenElse<W, Nullish, {}, W>;
    mergeInto(...sources: unknown[]): unknown;
    omit<T extends {}, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
    pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
    walk: (value: object, config?: WalkConfig | null, callback?: CallbackFunctionOne<WalkEncounterDetails>) => Iterable<WalkEncounterDetails>;
}
export interface StringUtils {
    reverse(inputStr: string): string;
    substitute(inputStr: string, substitionMap: Map<string | RegExp, string> | Record<string, string>): string;
}
//# sourceMappingURL=types.d.ts.map