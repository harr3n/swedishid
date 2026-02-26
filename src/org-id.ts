import { InvalidOrgIdError } from "./errors";
import { luhnCheckDigit } from "./checksum";
import { ORGANISATION_TYPES } from "./constants";
import type { OrgIdParts, FormatConfig } from "./types";

function toDigits(input: string): string {
  const s = input.replace(/\s/g, "").replace(/[+\-]/g, "");
  if (s.length === 12 && s.startsWith("16")) {
    return s.slice(2);
  }
  return s;
}

/**
 * Parse a Swedish organisation number (organisationsnummer) from string.
 */
export function fromString(input: string): OrgIdParts {
  const digits = toDigits(input);
  if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
    throw new InvalidOrgIdError();
  }

  const monthVal = parseInt(digits.slice(2, 4), 10);
  if (monthVal < 20) {
    throw new InvalidOrgIdError();
  }

  const prefix = digits.slice(0, 9);
  const givenCheck = parseInt(digits.slice(9, 10), 10);
  if (luhnCheckDigit(prefix) !== givenCheck) {
    throw new InvalidOrgIdError();
  }

  return {
    groupDigit: digits.slice(0, 1),
    group: digits.slice(0, 2),
    birthLikeMonth: digits.slice(2, 4),
    birthLikeDay: digits.slice(4, 6),
    serial: digits.slice(6, 9),
    checkDigit: digits.slice(9, 10),
    raw: digits,
  };
}

export function isValid(input: string): boolean {
  try {
    fromString(input);
    return true;
  } catch {
    return false;
  }
}

export function toFormattedString(
  id: OrgIdParts,
  config: FormatConfig = {}
): string {
  const fmt = config.format ?? "separated";
  const sep = config.separator ?? "-";

  switch (fmt) {
    case "long":
      return "16" + id.raw;
    case "short":
      return id.raw;
    case "separated":
      return `${id.raw.slice(0, 6)}${sep}${id.raw.slice(6)}`;
    case "separatedLong":
      return `16${id.raw.slice(0, 6)}${sep}${id.raw.slice(6)}`;
    default:
      return `${id.raw.slice(0, 6)}${sep}${id.raw.slice(6)}`;
  }
}

export function organisationType(id: OrgIdParts): {
  code: string;
  name: string;
} {
  const g = parseInt(id.groupDigit, 10);
  return (
    ORGANISATION_TYPES[g] ?? {
      code: "UNKNOWN",
      name: `Okänd grupp (${id.groupDigit})`,
    }
  );
}
