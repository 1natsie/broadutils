import type { StringSplit } from "../types/types.ts";

export interface Average {
  /**
   * Calculates the average (arithmetic mean) of the provided values. The function can accept
   * either an iterable of numbers or a list of individual number arguments. If no values are
   * provided, it returns `0`.
   *
   * @param values - An iterable of numbers or a list of individual number arguments.
   * @returns The average of the provided values, or `0` if no values are given.
   */
  (...values: [Iterable<number>] | number[]): number;
}

export interface Min {
  /**
   * Determines the minimum value from a set of provided numbers. The function can accept
   * either an iterable of numbers or a list of individual number arguments. If no values are
   * provided, it returns `undefined`.
   *
   * @param values - An iterable of numbers or a list of individual number arguments.
   * @returns The minimum value from the provided numbers, or `Number.NEGATIVE_INFINITY` if no values are given.
   */
  (...values: number[]): number;
  (...values: bigint[]): bigint;
  (...values: (number | bigint)[]): number | bigint;
}

export interface Max {
  /**
   * Determines the maximum value from a set of provided numbers. The function can accept
   * either an iterable of numbers or a list of individual number arguments. If no values are
   * provided, it returns `undefined`.
   *
   * @param values - An iterable of numbers or a list of individual number arguments.
   * @returns The maximum value from the provided numbers, or `Number.POSITIVE_INFINITY` if no values are given.
   */
  (...values: number[]): number;
  (...values: bigint[]): bigint;
  (...values: (number | bigint)[]): number | bigint;
}

export interface Clamp {
  /**
   * Clamps a value between a minimum and maximum range. If the value is less than the minimum,
   * it returns the minimum. If the value is greater than the maximum, it returns the maximum.
   * Otherwise, it returns the value itself.
   *
   * @param value - The number to be clamped.
   * @param min - The minimum value of the range.
   * @param max - The maximum value of the range.
   * @returns The clamped value, which will be between `min` and `max`.
   */
  (value: number, min: number, max: number): number;
  (value: bigint, min: bigint, max: bigint): bigint;
}

export interface Constrain {
  /**
   * Normalizes a value to a range between 0 and 1 based on a specified minimum and maximum. If the
   * value is less than the minimum, it returns `0`. If the value is greater than the maximum, it
   * returns `1`. Otherwise, it returns a normalized value between `0` and `1`.
   *
   * @param value - The number to be constrained.
   * @param low - The minimum value of the range.
   * @param high - The maximum value of the range.
   * @returns A normalized value between `0` and `1`, based on the position of `value` within the
   * range defined by `low` and `high`.
   */
  (value: number, low: number, high: number): number;
}

export interface LCM {
  /**
   * Calculates the least common multiple (LCM) of a set of provided numbers. The function can
   * accept either an iterable of numbers or a list of individual number arguments. If no values
   * are provided, it returns `1`.
   *
   * @param values - An iterable of numbers or a list of individual number arguments.
   * @returns The least common multiple of the provided numbers, or `1` if no values are given.
   */
  (...values: [Iterable<number>] | number[]): number;
}

export interface HCF {
  /**
   * Calculates the highest common factor (HCF) of a set of provided numbers. The function can
   * accept either an iterable of numbers or a list of individual number arguments. If no values
   * are provided, it returns `1`.
   *
   * @param values - An iterable of numbers or a list of individual number arguments.
   * @returns The highest common factor of the provided numbers, or `1` if no values are given.
   */
  (...values: [Iterable<number>] | number[]): number;
}

type __FullDistanceConversionInterface = { [Unit in DistanceUnit]: (value: number) => number };

namespace DistanceUnit {
  export type Prefix =
    | "nano"
    | "micro"
    | "milli"
    | "centi"
    | "deci"
    | ""
    | "deca"
    | "hecto"
    | "kilo";

  export type Suffix = "meters" | "metres";
}

export type AngleUnit = "degrees" | "gradians" | "radians" | "turns";
export type DistanceUnit = `${DistanceUnit.Prefix}${DistanceUnit.Suffix}`;
export type MassUnit =
  | "nanograms"
  | "micrograms"
  | "milligrams"
  | "centigrams"
  | "decigrams"
  | "grams"
  | "decagrams"
  | "hectograms"
  | "kilograms"
  | "tonnes"
  | "pounds"
  | "ounces";
export type TimeUnit =
  | "nanoseconds"
  | "microseconds"
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks";

type AngleConversionInterface = {
  [Source in AngleUnit]: {
    [Target in Exclude<AngleUnit, Source>]: (value: number) => number;
  };
};

type DistanceConversionInterface = {
  [U in DistanceUnit]: Omit<
    __FullDistanceConversionInterface,
    `${StringSplit<U, DistanceUnit.Suffix>[0]}${DistanceUnit.Suffix}`
  >;
};

type MassConversionInterface = {
  [Source in MassUnit]: {
    [Target in Exclude<MassUnit, Source>]: (value: number) => number;
  };
};

type TimeConversionInterface = {
  [Source in TimeUnit]: {
    [Target in Exclude<TimeUnit, Source>]: (value: number) => number;
  };
};

/**
 * The `ConversionInterface` is a comprehensive interface that encompasses conversion functions for
 * angles, distances, masses, and time units. It extends the specific conversion interfaces for
 * each category, allowing for a structured and organized way to access various unit conversion
 * functions. Each conversion function takes a numerical value as input and returns the converted
 * value in the target unit.
 */
export interface ConversionInterface
  extends
    AngleConversionInterface,
    DistanceConversionInterface,
    MassConversionInterface,
    TimeConversionInterface {}

export namespace ConversionInterface {
  export type Angle = AngleConversionInterface;
  export type Distance = DistanceConversionInterface;
  export type Mass = MassConversionInterface;
  export type Time = TimeConversionInterface;
}
