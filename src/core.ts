/**
 * Unified parser for Swedish IDs. Detects type and parses accordingly.
 * Tries organisation first (digits 3-4 ≥ 20), then personal.
 */
import { fromString as parsePersonal } from "./personal-id";
import { fromString as parseOrg } from "./org-id";
import { toFormattedString as formatPersonal } from "./personal-id";
import { toFormattedString as formatOrg } from "./org-id";
import {
  birthDate,
  age,
  male,
  female,
  isSamordningsnummer,
} from "./personal-id";
import { organisationType } from "./org-id";
import { InvalidPersonalIdError } from "./errors";
import { ENSKILD_FIRMA } from "./constants";
import type { SwedishId, PersonalIdParts, PersonalIdOptions, FormatConfig } from "./types";

export function fromString(
  input: string,
  options: PersonalIdOptions = {}
): SwedishId {
  try {
    const org = parseOrg(input);
    return { ...org, type: "organisationsnummer" as const };
  } catch {
    try {
      const pnr = parsePersonal(input, options);
      return { ...pnr, type: "personnummer" as const };
    } catch {
      throw new InvalidPersonalIdError();
    }
  }
}

export function isValid(input: string, options?: PersonalIdOptions): boolean {
  try {
    fromString(input, options ?? {});
    return true;
  } catch {
    return false;
  }
}

export function format(result: SwedishId, config: FormatConfig = {}): string {
  if (result.type === "personnummer") {
    return formatPersonal(result, config);
  }
  return formatOrg(result, config);
}

export function entityType(
  inputOrResult: string | SwedishId
): { code: string; name: string } {
  const result =
    typeof inputOrResult === "string" ? fromString(inputOrResult) : inputOrResult;
  if (result.type === "organisationsnummer") {
    return organisationType(result);
  }
  return ENSKILD_FIRMA;
}

type PersonalLike = SwedishId | PersonalIdParts;

function assertPersonal(result: PersonalLike, fn: string): void {
  if ("type" in result && result.type !== "personnummer") {
    throw new Error(`${fn} only applies to personal identity numbers`);
  }
}

export function getAge(result: PersonalLike): number {
  assertPersonal(result, "getAge");
  return age(result as PersonalIdParts);
}

export function getDate(result: PersonalLike): Date {
  assertPersonal(result, "getDate");
  return birthDate(result as PersonalIdParts);
}

export function isMale(result: PersonalLike): boolean {
  assertPersonal(result, "isMale");
  return male(result as PersonalIdParts);
}

export function isFemale(result: PersonalLike): boolean {
  assertPersonal(result, "isFemale");
  return female(result as PersonalIdParts);
}

export function isCoordinationNumber(result: PersonalLike): boolean {
  assertPersonal(result, "isCoordinationNumber");
  return isSamordningsnummer(result as PersonalIdParts);
}

export function getOrganizationType(result: SwedishId): {
  code: string;
  name: string;
} {
  return entityType(result);
}
