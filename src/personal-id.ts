import { InvalidPersonalIdError } from "./errors";
import { luhnCheckDigit } from "./checksum";
import { yearsBetween, isValidCalendarDate } from "./dates";
import type { PersonalIdParts, PersonalIdOptions, FormatConfig } from "./types";

const PERSONAL_ID_PATTERN =
  /^(\d{2}){0,1}(\d{2})(\d{2})(\d{2})([+\-]?)((?!000)\d{3}|[TRSUWXJKLMN]\d{2})(\d)$/;
const INTERIM_CHARS = /[TRSUWXJKLMN]/;

function serialForChecksum(serial: string): string {
  return serial.replace(INTERIM_CHARS, "1");
}

function passesChecksum(
  year2: string,
  fullYear: number,
  month: number,
  day: number,
  serial: string,
  checkDigit: string
): boolean {
  const s = serialForChecksum(serial);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const input = year2 + mm + dd + s;
  const expected = luhnCheckDigit(input);
  if (expected !== parseInt(checkDigit, 10)) return false;

  if (isValidCalendarDate(fullYear, month, day)) return true;
  return isValidCalendarDate(fullYear, month, day - 60);
}

/**
 * Parse a Swedish personal identity number (personnummer) from string.
 */
export function fromString(
  input: string,
  options: PersonalIdOptions = {}
): PersonalIdParts {
  const opts = {
    allowCoordinationNumber: true,
    allowInterimNumber: false,
    ...options,
  };

  const s = input.replace(/\s/g, "");
  if (s.length < 10 || s.length > 13) {
    throw new InvalidPersonalIdError();
  }

  const match = PERSONAL_ID_PATTERN.exec(s);
  if (!match) throw new InvalidPersonalIdError();

  const [, centuryPart, year, month, day, sepPart, serial, checkDigit] = match;

  if (parseInt(month, 10) >= 20) {
    throw new InvalidPersonalIdError();
  }

  let century: string;
  let sep: "-" | "+" = "-";

  if (centuryPart !== undefined && centuryPart.length > 0) {
    century = centuryPart;
    const fullYear = parseInt(century + year, 10);
    sep = new Date().getFullYear() - fullYear < 100 ? "-" : "+";
  } else {
    const now = new Date();
    const baseYear =
      sepPart === "+" ? now.getFullYear() - 100 : now.getFullYear();
    const yy = parseInt(year, 10);
    century = String(baseYear - ((baseYear - yy) % 100)).slice(0, 2);
    sep = sepPart === "+" ? "+" : "-";
  }

  const fullYear = century + year;
  const y = parseInt(fullYear, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);

  const isCoord =
    !isValidCalendarDate(y, m, d) && isValidCalendarDate(y, m, d - 60);
  const validSsn =
    isValidCalendarDate(y, m, d) &&
    passesChecksum(year, y, m, d, serial, checkDigit);
  const validCoord =
    isCoord && passesChecksum(year, y, m, d, serial, checkDigit);

  if (!validSsn && !validCoord) {
    throw new InvalidPersonalIdError();
  }

  if (isCoord && !opts.allowCoordinationNumber) {
    throw new InvalidPersonalIdError();
  }

  const isInterim = INTERIM_CHARS.test(serial);
  if (isInterim && !opts.allowInterimNumber) {
    throw new InvalidPersonalIdError();
  }

  return {
    century,
    fullYear,
    year,
    month,
    day,
    separator: sep,
    serial,
    checkDigit,
  };
}

export function isValid(input: string, options?: PersonalIdOptions): boolean {
  try {
    fromString(input, options ?? {});
    return true;
  } catch {
    return false;
  }
}

export function birthDate(id: PersonalIdParts): Date {
  let day = parseInt(id.day, 10);
  if (isSamordningsnummer(id)) day -= 60;
  const dateStr = `${id.fullYear}-${id.month}-${String(day).padStart(2, "0")}`;
  return new Date(dateStr);
}

export function age(id: PersonalIdParts): number {
  return yearsBetween(new Date(), birthDate(id));
}

export function male(id: PersonalIdParts): boolean {
  const lastSerial = id.serial.replace(/[TRSUWXJKLMN]/, "1");
  const sexDigit = parseInt(lastSerial.slice(-1), 10);
  return sexDigit % 2 === 1;
}

export function female(id: PersonalIdParts): boolean {
  return !male(id);
}

export function isSamordningsnummer(id: PersonalIdParts): boolean {
  const y = parseInt(id.fullYear, 10);
  const m = parseInt(id.month, 10);
  const d = parseInt(id.day, 10);
  return (
    !isValidCalendarDate(y, m, d) && isValidCalendarDate(y, m, d - 60)
  );
}

export function toFormattedString(
  id: PersonalIdParts,
  config: FormatConfig = {}
): string {
  const fmt = config.format ?? "separated";
  const sep = config.separator ?? id.separator;

  const datePart = id.year + id.month + id.day;
  const suffix = id.serial + id.checkDigit;

  switch (fmt) {
    case "long":
      return id.century + datePart + suffix;
    case "short":
      return datePart + suffix;
    case "separated":
      return `${datePart}${sep}${suffix}`;
    case "separatedLong":
      return `${id.century}${datePart}${sep}${suffix}`;
    default:
      return `${datePart}${sep}${suffix}`;
  }
}
