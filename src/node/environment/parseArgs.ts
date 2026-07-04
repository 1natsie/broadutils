import type {
  ArgType,
  ArgumentDescriptor,
  ArgumentsSpecification,
  ArgumentsSpecificationErrorOptions,
  ParseArgsConfig,
  ParseArgsResult,
  PositionalArguments,
  TypeOf,
} from "./types.ts";

class ArgumentsSpecificationError extends Error {
  declare public readonly specification: ArgumentsSpecification | null;
  constructor(message: string, options?: ArgumentsSpecificationErrorOptions) {
    super(message, options);
    this.specification = options?.specification ?? null;
  }
}

class ArgumentsParsingError extends Error {}

const check = {
  number: (v: unknown): v is number => typeof v === "number",
  string: (v: unknown): v is string => typeof v === "string",
  boolean: (v: unknown): v is boolean => typeof v === "boolean",
};

const ARG_TYPES: Set<ArgType> = new Set(["string", "number", "boolean"]);
const ARGUMENT_REGEX =
  /^(?<prefix>\-\-?)(?<argName>[a-z0-9][a-z0-9\-]*)(?:=(?<attachedValue>[^\s]+))?$/i;

const matchesType = (type: ArgType, value: string): boolean => {
  switch (type) {
    case "string":
      return true;
    case "number":
      return Number.isFinite(+value);
    case "boolean":
      return value === "true" || value === "false";
    default:
      throw new TypeError("Invalid type to check against.");
  }
};

const getArgumentValue = <T extends ArgType>(type: T, rawValue: string): TypeOf<T> => {
  switch (type) {
    case "string":
      return rawValue as TypeOf<T>;
    case "number":
      return +rawValue as TypeOf<T>;
    case "boolean":
      return (rawValue === "true") as TypeOf<T>;
    default:
      throw new TypeError("Invalid argument type.");
  }
};

const parseSpecification = (
  spec: ArgumentsSpecification,
): {
  requiredArgs: Set<string>;
  longNames: Map<string, string>;
  specification: Map<string, ArgumentDescriptor>;
} => {
  const requiredArgs: Set<string> = new Set();
  const seenArgs: Set<string> = new Set();
  const longNames: Map<string, string> = new Map();
  const specification: Map<string, ArgumentDescriptor> = new Map();

  for (const longName in spec) {
    const descriptor = spec[longName];
    const shortName = descriptor?.short ?? null;
    const argumentIdentifier = longName + ((shortName != null && "," + shortName) || "");

    if (!(descriptor != null && typeof descriptor === "object")) {
      throw new ArgumentsSpecificationError(
        `Failed to get argument descriptor: ${argumentIdentifier}.`,
        { specification: spec },
      );
    }
    if (seenArgs.has(longName) || seenArgs.has(descriptor.short ?? longName)) {
      throw new ArgumentsSpecificationError(`Name reuse detected: ${argumentIdentifier}`, {
        specification: spec,
      });
    }

    seenArgs.add(longName);
    seenArgs.add(descriptor.short ?? longName);

    if (!ARG_TYPES.has(descriptor.type)) {
      throw new ArgumentsSpecificationError(`Invalid argument type: ${argumentIdentifier}`, {
        specification: spec,
      });
    }

    if (descriptor.multiple !== true && Array.isArray(descriptor.default)) {
      throw new ArgumentsSpecificationError(
        `The default value of a single value argument cannot be an array: ${argumentIdentifier}`,
        { specification: spec },
      );
    }

    if (descriptor.default != null) {
      const { type: dtype, default: ddefault } = descriptor;
      let typeIsValid = false;

      if (descriptor.multiple !== true) typeIsValid = check[dtype](ddefault);
      else typeIsValid = Array.isArray(ddefault) && ddefault.every((v) => check[dtype](v));

      if (!typeIsValid)
        throw new ArgumentsSpecificationError(`Invalid default value type: ${argumentIdentifier}`, {
          specification: spec,
        });
    }

    descriptor.required === true && requiredArgs.add(longName);
    specification.set(longName, descriptor).set(shortName ?? longName, descriptor);
    longNames.set(longName, longName).set(shortName ?? longName, longName);
  }

  return { requiredArgs, longNames, specification };
};

const parseArgs = <T extends ParseArgsConfig>(config: T): ParseArgsResult<T> => {
  const args: string[] = config.args.slice();
  const { requiredArgs, longNames, specification } = parseSpecification(config.specification);

  const values: Record<string, any> = {};
  const positionals: PositionalArguments = [];

  for (const longName in config.specification) {
    const spec = config.specification[longName];
    if (spec?.default == null) continue;
    values[longName] = Array.isArray(spec.default) ? spec.default.slice() : spec.default;
  }

  const parsedArgs: Set<string> = new Set();
  let index = 0;

  while (index < args.length) {
    const token = args[index];
    if (token == null) break;

    if (token[0] !== "-") {
      positionals.push({ index: index++, value: token });
      continue;
    }

    const regexMatch = token.match(ARGUMENT_REGEX);
    if (regexMatch == null) throw new ArgumentsParsingError(`Invalid argument syntax: ${token}`);

    const { prefix, argName, attachedValue } = regexMatch.groups ?? {};
    if (prefix == null) throw new TypeError("Prefix is null. Check regex.");
    if (argName == null) throw new TypeError("Argument name is null. Check regex.");

    const descriptor = specification.get(argName);

    if (descriptor == null) {
      if (!config.allowUnknown) {
        throw new ArgumentsParsingError(`Unknown argument encountered: ${argName}`);
      }
      values[argName] = attachedValue ?? true;
      index++;
      continue;
    }

    const shortName = descriptor.short;
    const longName = longNames.get(argName)!;
    const argumentIdentifier = longName + ((shortName != null && "," + shortName) || "");

    if (
      (prefix === "-" && argName !== descriptor.short) ||
      (prefix === "--" && argName === descriptor.short)
    ) {
      throw new ArgumentsParsingError(
        `Long argument names cannot be used with the short argument prefix and vice-versa. Use --${longName}${shortName != null ? ` or -${shortName}` : ""}`,
      );
    }

    let indexIncrement = 0;
    let actualValue: any;

    if (attachedValue != null) {
      if (!matchesType(descriptor.type, attachedValue)) {
        throw new ArgumentsParsingError(`Invalid value type for argument: ${argumentIdentifier}`);
      }

      actualValue = getArgumentValue(descriptor.type, attachedValue);
      indexIncrement = 1;
    } else {
      const nextToken = args[index + 1];
      if (nextToken == null || ARGUMENT_REGEX.test(nextToken)) {
        if (descriptor.type === "boolean") actualValue = true;
        else throw new ArgumentsParsingError(`Invalid token. Expected value for "${argName}"`);
        indexIncrement = 1;
      } else {
        if (!matchesType(descriptor.type, nextToken)) {
          throw new ArgumentsParsingError(`Invalid value type for argument: ${argumentIdentifier}`);
        }
        actualValue = getArgumentValue(descriptor.type, nextToken);
        indexIncrement = 2;
      }
    }

    if (descriptor.validator != null) {
      const validationResult = descriptor.validator(actualValue);
      if (!validationResult.valid) {
        throw new ArgumentsParsingError(
          `The value of the argument "${argumentIdentifier}" is not valid.${(validationResult.reason && " " + validationResult.reason) || ""}`,
        );
      }
    }

    if (descriptor.multiple !== true) values[longName] = actualValue;
    else {
      if (!parsedArgs.has(longName)) {
        if (!descriptor.appendToDefault) values[longName] = [actualValue];
        else Array.isArray(values[longName]) && values[longName].push(actualValue);
      } else Array.isArray(values[longName]) && values[longName].push(actualValue);
    }

    parsedArgs.add(longName);
    index += indexIncrement;
  }

  for (const arg of requiredArgs) {
    if (parsedArgs.has(arg)) continue;
    throw new ArgumentsParsingError(`Required argument not provided: ${arg}`);
  }

  return { values, positionals } as ParseArgsResult<T>;
};

export { ArgumentsParsingError, ArgumentsSpecificationError, parseArgs };
