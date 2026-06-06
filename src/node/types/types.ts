type _Number = -1 | _Numbers[number];
type _Numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
type _Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type _DigitString = `${_Digit}`;
type _NumbersNegShift = _Numbers extends [...infer T, infer _] ? [-1, ...T] : never;
type _NumbersPosShift = _Numbers extends [infer _, ...infer T] ? [...T, 21] : never;
type _Primitive = string | number | bigint | boolean | symbol | null | undefined;
type _SS = Exclude<_Primitive, symbol>;

/**
 * `ArrayOf<Value, Length>` creates a tuple type of a specified length filled with a specified value.
 * If `Length` is -1, it creates an array of any length filled with the value.
 * If `Length` is 0, it creates an empty tuple.
 * If `Length` is not a valid number (within 0 and 20, inclusive), it defaults to an array of any length filled with the value.
 */
export type ArrayOf<Value, Length extends number = -1> = Length extends _Number
  ? Length extends -1
    ? Value[]
    : Length extends 0
      ? []
      : [Value, ...ArrayOf<Value, _NumbersNegShift[Length]>]
  : Value[];

/** A type that represents null or undefined */
export type Nullish = null | undefined;

/** A type that represents either a value of type `T` or an array of values of type `T` */
export type OrArray<T> = T | T[];

/** A type that represents a 2D vector */
export type Vector2 = ArrayOf<number, 2>;
/** A type that represents a 3D vector */
export type Vector3 = ArrayOf<number, 3>;

/** A type that represents any function */
export type AnyFunction = (...args: any[]) => any;

/**
 * A type that represents a callback function with a specific argument list.
 * The type parameter `T` is a tuple that defines the types of the arguments that the callback
 * function accepts. For example, if `T` is `[string, number]`, then the callback function would
 * have the type `(arg1: string, arg2: number) => void`
 */
export type CallbackFunction<T extends any[]> = (...args: T) => void;

/** A type that represents a callback function that takes a single argument, `T` */
export type CallbackFunctionOne<T> = (value: T) => void;

/**
 * A type that represents a function that returns a value of type `T` and takes an optional list of
 * arguments of types specified in the `Args` tuple. For example, if `T` is string and `Args` is
 * `[number, boolean]`, then the function would have the type `(arg1: number, arg2: boolean) => string`
 */
export type FunctionThatReturns<T, Args extends any[] = []> = (...args: Args) => T;

/** A type that enforces that a value of type `T` is also of type `U` */
export type Enforce<T, U> = T extends U ? T : never;

/**
 * A type that checks if a type `T` extends another type `Extension` and returns `TrueType` if it
 * does, or `FalseType` if it doesn't.
 */
export type IfExtendsThenElse<T, Extension, TrueType, FalseType> = T extends Extension
  ? TrueType
  : FalseType;

type DeepFrozenObject<T extends object> = { readonly [K in keyof T]: DeepFrozen<T[K]> };
type DeepFrozenArray<T extends any[]> = any[] extends T
  ? Readonly<T>
  : T extends [infer Head, ...infer Rest]
    ? [DeepFrozen<Head>, ...DeepFrozenArray<Rest>]
    : [];

/**
 * A type that recursively makes all properties of an object and all elements of an array immutable (readonly).
 *
 * If `T` is an array, it applies `DeepFrozen` to each element of the array.
 *
 * If `T` is an object, it applies `DeepFrozen` to each property of the object.
 *
 * If `T` is neither an array nor an object, it returns `T` as is.
 *
 * This type is useful for creating deeply immutable data structures, ensuring that all nested
 * properties and elements cannot be modified after they are created.
 */
export type DeepFrozen<T> = T extends any[]
  ? DeepFrozenArray<T>
  : T extends object
    ? DeepFrozenObject<T>
    : T;

type ArrayFilterHelper<T extends unknown[], Condition, Collector extends unknown[]> = T extends [
  infer FirstElement,
  ...infer RestElements,
]
  ? ArrayFilterHelper<
      RestElements,
      Condition,
      FirstElement extends Condition ? [...Collector, FirstElement] : Collector
    >
  : Collector;

type ArrayReverseHelper<T extends unknown[], Collector extends unknown[]> = T extends [
  infer FirstElement,
  ...infer RestElements,
]
  ? ArrayReverseHelper<RestElements, [FirstElement, ...Collector]>
  : Collector;

type ArrayJoinHelper<
  T extends unknown[],
  Separator extends _SS,
  Collector extends string,
> = T extends [infer X, ...infer RestElements]
  ? X extends _SS
    ? ArrayJoinHelper<
        RestElements,
        Separator,
        `${Collector}${Collector extends "" ? Collector : Separator}${X}`
      >
    : string
  : Collector;

type StringReverseHelper<
  T extends string,
  Collector extends string,
> = T extends `${infer FirstChar extends string}${infer RestChars extends string}`
  ? StringReverseHelper<RestChars, `${FirstChar}${Collector}`>
  : Collector;

type StringSplitHelper<
  T extends string,
  Separator extends string,
  Collector extends string[],
> = T extends `${infer Left extends string}${Separator}${infer Right extends string}`
  ? StringSplitHelper<Right, Separator, [...Collector, Left]>
  : T extends ""
    ? Collector extends []
      ? [""]
      : Collector
    : [...Collector, T];

interface NumberDigitStringArrayValue {
  "0": [];
  "1": [null];
  "2": [null, null];
  "3": [null, null, null];
  "4": [null, null, null, null];
  "5": [null, null, null, null, null];
  "6": [null, null, null, null, null, null];
  "7": [null, null, null, null, null, null, null];
  "8": [null, null, null, null, null, null, null, null];
  "9": [null, null, null, null, null, null, null, null, null];
}

type NumberDigitStringAddHelper<
  A extends _DigitString,
  B extends _DigitString,
  C extends _DigitString,
> = [
  ...NumberDigitStringArrayValue[A],
  ...NumberDigitStringArrayValue[B],
  ...NumberDigitStringArrayValue[C],
]["length"] extends infer Sum extends number
  ? StringSplit<`${Sum}`, "">["length"] extends 2
    ? [StringSplit<`${Sum}`, "">[1], StringSplit<`${Sum}`, "">[0]]
    : [StringSplit<`${Sum}`, "">[0], "0"]
  : never;

type NumberAddHelper<
  A extends unknown[],
  B extends unknown[],
  C extends _DigitString,
  Collector extends _DigitString[],
> = A extends [infer A_First extends _DigitString, ...infer A_Rest extends _DigitString[]]
  ? B extends [infer B_First extends _DigitString, ...infer B_Rest extends _DigitString[]]
    ? NumberDigitStringAddHelper<A_First, B_First, C> extends [
        infer Sum extends _DigitString,
        infer Carry extends _DigitString,
      ]
      ? NumberAddHelper<A_Rest, B_Rest, Carry, [...Collector, Sum]>
      : never
    : NumberDigitStringAddHelper<A_First, "0", C> extends [
          infer Sum extends _DigitString,
          infer Carry extends _DigitString,
        ]
      ? NumberAddHelper<A_Rest, B, Carry, [...Collector, Sum]>
      : never
  : B extends [infer B_First extends _DigitString, ...infer B_Rest extends _DigitString[]]
    ? NumberDigitStringAddHelper<"0", B_First, C> extends [
        infer Sum extends _DigitString,
        infer Carry extends _DigitString,
      ]
      ? NumberAddHelper<A, B_Rest, Carry, [...Collector, Sum]>
      : never
    : NumberCast<ArrayJoin<ArrayReverse<C extends "0" ? Collector : [...Collector, C]>, "">>;

/** A type that filters an array type `T` based on a specified condition `Condition` */
export type ArrayFilter<T extends unknown[], Condition> = ArrayFilterHelper<T, Condition, []>;
/** A type that joins an array of strings, `T`, with a specified separator, `Sep` (default is ",") */
export type ArrayJoin<T extends _SS[], Sep extends _SS = ","> = ArrayJoinHelper<T, Sep, "">;
/** A type that reverses an array type `T` */
export type ArrayReverse<T extends unknown[]> = ArrayReverseHelper<T, []>;
/**
 * A type that adds two number types `A` and `B` together, returning the result as a number type.
 *
 * @deprecated You absolutely must NOT use this type in production code.
 * @warning "Meta" types like this one go against the general ideology of TypeScript's type system.
 * This type should be considered a "proof of concept" and is not intended for practical use in
 * real-world applications. Do NOT ship this type in production code. You will make other devs
 * very unhappy if you do so. Let this type serve as an inspiration to those looking to explore
 * the limits of TypeScript's type system, but please do not use it in actual projects.
 */
export type NumberAdd<A extends number, B extends number> = NumberAddHelper<
  ArrayReverse<StringSplit<`${A}`>>,
  ArrayReverse<StringSplit<`${B}`>>,
  "0",
  []
>;
/** A type that casts a string type to a number type */
export type NumberCast<T extends _SS> = `${T}` extends `${infer Num extends number}` ? Num : never;
/** A type that casts a stringifyable type to a string type */
export type StringCast<T extends _SS> = `${T}`;
/** A type that reverses a string type `T` */
export type StringReverse<T extends string> = StringReverseHelper<T, "">;
/** A type that splits a string type `T` by a specified separator, `Sep` (default is "") */
export type StringSplit<T extends string, Sep extends string = ""> = StringSplitHelper<T, Sep, []>;
