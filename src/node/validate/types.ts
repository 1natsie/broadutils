export type AssertFunction<T> = (value: unknown, message?: string) => asserts value is T;
export type CheckFunction<T> = (value: unknown) => value is T;
export interface Assert {
  /** Asserts that the value is a string. */
  string: AssertFunction<string>;
  /** Asserts that the value is a number. */
  number: AssertFunction<number> & {
    /** Asserts that the value is a positive number. */
    positive: AssertFunction<number>;
    /** Asserts that the value is a negative number. */
    negative: AssertFunction<number>;
    /** Asserts that the value is zero. */
    zero: AssertFunction<number>;
    /** Asserts that the value is an integer. */
    integer: AssertFunction<number>;
    /** Asserts that the value is a float. */
    float: AssertFunction<number>;
    /** Asserts that the value is a finite number. */
    finite: AssertFunction<number>;
    /** Asserts that the value is a safe integer. */
    safeInteger: AssertFunction<number>;
  };
  /** Asserts that the value is true. */
  true: AssertFunction<true>;
  /** Asserts that the value is false. */
  false: AssertFunction<false>;
  /** Asserts that the value is a boolean. */
  boolean: AssertFunction<boolean>;
  /** Asserts that the value is a symbol. */
  symbol: AssertFunction<symbol>;
  /** Asserts that the value is null. */
  null: AssertFunction<null>;
  /** Asserts that the value is undefined. */
  undefined: AssertFunction<undefined>;
  /** Asserts that the value is an object (excluding null). */
  object: AssertFunction<object>;
  /** Asserts that the value is an array. */
  array: AssertFunction<unknown[]>;
  /** Asserts that the value is an ArrayBuffer. */
  arraybuffer: AssertFunction<ArrayBuffer>;
  /** Asserts that the value is an ArrayBufferView. */
  arraybufferview: AssertFunction<ArrayBufferView>;
  /** Asserts that the value is a RegExp. */
  regexp: AssertFunction<RegExp>;
  /** Asserts that the value is not null or undefined. */
  nonNullable: <T>(value: T, message?: string) => asserts value is NonNullable<T>;
}
export interface Check {
  /** Returns a boolean indicating whether the value is a string. */
  string: CheckFunction<string>;
  /** Returns a boolean indicating whether the value is a number. */
  number: CheckFunction<number> & {
    /** Returns a boolean indicating whether the value is a positive number. */
    positive: CheckFunction<number>;
    /** Returns a boolean indicating whether the value is a negative number. */
    negative: CheckFunction<number>;
    /** Returns a boolean indicating whether the value is zero. */
    zero: CheckFunction<number>;
    /** Returns a boolean indicating whether the value is an integer. */
    integer: CheckFunction<number>;
    /** Returns a boolean indicating whether the value is a float. */
    float: CheckFunction<number>;
    /** Returns a boolean indicating whether the value is a finite number. */
    finite: CheckFunction<number>;
    /** Returns a boolean indicating whether the value is a safe integer. */
    safeInteger: CheckFunction<number>;
  };
  /** Returns a boolean indicating whether the value is a boolean. */
  boolean: CheckFunction<boolean>;
  /** Returns a boolean indicating whether the value is true. */
  true: CheckFunction<true>;
  /** Returns a boolean indicating whether the value is false. */
  false: CheckFunction<false>;
  /** Returns a boolean indicating whether the value is a symbol. */
  symbol: CheckFunction<symbol>;
  /** Returns a boolean indicating whether the value is null. */
  null: CheckFunction<null>;
  /** Returns a boolean indicating whether the value is undefined. */
  undefined: CheckFunction<undefined>;
  /** Returns a boolean indicating whether the value is an object (excluding null). */
  object: CheckFunction<object>;
  /** Returns a boolean indicating whether the value is an array. */
  array: CheckFunction<unknown[]>;
  /** Returns a boolean indicating whether the value is an ArrayBuffer. */
  arraybuffer: CheckFunction<ArrayBuffer>;
  /** Returns a boolean indicating whether the value is an ArrayBufferView. */
  arraybufferview: CheckFunction<ArrayBufferView>;
  /** Returns a boolean indicating whether the value is a RegExp. */
  regexp: CheckFunction<RegExp>;
  /** Returns a boolean indicating whether the value is not nullish. */
  nonNullable: <T>(value: T) => value is NonNullable<T>;
}
