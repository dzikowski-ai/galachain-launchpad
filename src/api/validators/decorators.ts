/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { NotImplementedError } from "@gala-chain/api";
import BigNumber from "bignumber.js";
import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";

export function IsWholeNumber(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, unknown>, propertyName: string): void {
    registerDecorator({
      name: "isWholeNumber",
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: Record<string, unknown>, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];
          const num = Number(relatedValue);

          return num - Math.floor(num) === 0;
        }
      }
    });
  };
}

export function IsDifferentValue(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "IsDifferentValue",
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: Record<string, unknown>, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];
          if (
            (typeof value !== "string" && value !== undefined) ||
            (typeof relatedValue !== "string" && relatedValue !== undefined)
          ) {
            throw new NotImplementedError("IsDifferentValue only works with string or undefined");
          }
          return value !== relatedValue;
        }
      }
    });
  };
}

export function ArrayUniqueConcat(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "ArrayUniqueConcat",
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown[], args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];

          // Cannot have tokens duplicated between from or to, or within the from or to itself
          const totalUniques = new Set(relatedValue.concat(value)).size;

          return totalUniques === relatedValue.length + value.length;
        }
      }
    });
  };
}

export function ArrayUniqueObjects(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "ArrayUniqueObjects",
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown[]): boolean {
          if (Array.isArray(value)) {
            const propertyValues = value.map((v) => (typeof v === "object" && !!v ? v[property] : undefined));
            return new Set(propertyValues).size === value.length;
          }
          return false;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must not contains duplicate entry for ${args.constraints[0]}`;
        }
      }
    });
  };
}

export function IsBigNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "IsBigNumber",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return BigNumber.isBigNumber(value);
        },
        defaultMessage(args: ValidationArguments) {
          const bn =
            typeof args.value === "string" || typeof args.value === "number"
              ? new BigNumber(args.value)
              : undefined;

          const suggestion = bn && !bn.isNaN() ? ` (valid value: ${bn?.toFixed()})` : "";

          return (
            `${args.property} should be a stringified number with fixed notation (not an exponential notation) ` +
            `and no trailing zeros in decimal part${suggestion}`
          );
        }
      }
    });
  };
}

function validateBigNumberOrIgnore(obj: unknown, fn: (bn: BigNumber) => boolean): boolean {
  if (BigNumber.isBigNumber(obj)) {
    return fn(obj);
  } else {
    return true;
  }
}

export function BigNumberIsPositive(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsBigNumber(validationOptions)(object, propertyName);
    registerDecorator({
      name: "BigNumberIsPositive",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return validateBigNumberOrIgnore(value, (b) => b.isPositive());
        },
        defaultMessage(args: ValidationArguments) {
          // here you can provide default error message if validation failed
          return `${args.property} must be positive but is ${args.value?.toString() ?? args.value}`;
        }
      }
    });
  };
}

export function BigNumberIsNegative(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsBigNumber(validationOptions)(object, propertyName);
    registerDecorator({
      name: "BigNumberIsNegative",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return validateBigNumberOrIgnore(value, (b) => b.isNegative());
        },
        defaultMessage(args: ValidationArguments) {
          // here you can provide default error message if validation failed
          return `${args.property} must be negative but is ${args.value?.toString() ?? args.value}`;
        }
      }
    });
  };
}

export function BigNumberIsNotInfinity(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsBigNumber(validationOptions)(object, propertyName);
    registerDecorator({
      name: "BigNumberIsNotInfinity",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return validateBigNumberOrIgnore(value, (b) => b.isFinite());
        },
        defaultMessage(args: ValidationArguments) {
          // here you can provide default error message if validation failed
          return `${args.property} must be finite BigNumber but is ${args.value?.toString() ?? args.value}`;
        }
      }
    });
  };
}

export function BigNumberIsNotNegative(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsBigNumber(validationOptions)(object, propertyName);
    registerDecorator({
      name: "BigNumberIsNotNegative",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return validateBigNumberOrIgnore(value, (b) => !b.isNegative());
        },
        defaultMessage(args: ValidationArguments) {
          // here you can provide default error message if validation failed
          return `${args.property} must be non-negative BigNumber but is ${
            args.value?.toString() ?? args.value
          }`;
        }
      }
    });
  };
}

export function BigNumberIsInteger(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsBigNumber(validationOptions)(object, propertyName);
    registerDecorator({
      name: "BigNumberIsInteger",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return validateBigNumberOrIgnore(value, (b) => b.isInteger());
        },
        defaultMessage(args: ValidationArguments) {
          // here you can provide default error message if validation failed
          return `${args.property} must be integer BigNumber but is ${args.value?.toString() ?? args.value}`;
        }
      }
    });
  };
}

export function IsNonZeroBigNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isNonZeroBigNumber",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return value instanceof BigNumber && !value.isZero();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a BigNumber and cannot be zero.`;
        }
      }
    });
  };
}

export function IsLessThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isLessThan",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return typeof value === "number" && typeof relatedValue === "number" && value < relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be less than ${relatedPropertyName}`;
        }
      }
    });
  };
}

export function IsStringRecord(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isStringRecord",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

          return Object.entries(value).every(
            ([key, val]) => typeof key === "string" && typeof val === "string"
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a Record<string, string>`;
        }
      }
    });
  };
}

export function IsStringArrayRecord(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isStringArrayRecord",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "object" || value === null || Array.isArray(value)) {
            return false;
          }

          return Object.entries(value).every(
            ([key, val]) =>
              typeof key === "string" && Array.isArray(val) && val.every((item) => typeof item === "string")
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a Record<string, string[]>`;
        }
      }
    });
  };
}

export function BigNumberMax(maxValue: BigNumber.Value, options?: ValidationOptions) {
  const max = new BigNumber(maxValue);

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "BigNumberMax",
      target: object.constructor,
      propertyName,
      options,
      constraints: [max],
      validator: {
        validate(value: unknown): boolean {
          try {
            const bn = new BigNumber(value as BigNumber.Value);
            return bn.isLessThanOrEqualTo(max);
          } catch {
            return false;
          }
        },

        defaultMessage(args: ValidationArguments): string {
          const [maxConstraint] = args.constraints as [BigNumber];
          return `${args.property} must be ≤ ${maxConstraint.toFixed()}`;
        }
      }
    });
  };
}

export function BigNumberLessThanOrEqualOther(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "BigNumberLessThanOrEqualOther",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          if (!(value instanceof BigNumber) || !(relatedValue instanceof BigNumber)) {
            return false;
          }

          return value.isLessThanOrEqualTo(relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be less than or equal to ${relatedPropertyName}`;
        }
      }
    });
  };
}
