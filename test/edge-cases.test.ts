import { describe, it, expect } from "vitest";
import {
  parse,
  isValid,
  parsePersonal,
  parseOrg,
  entityType,
  getAge,
  getDate,
} from "../src/index";
import { luhnCheckDigit } from "../src/checksum";
import { isValidCalendarDate } from "../src/dates";

describe("personnummer - invalid input", () => {
  it("rejects wrong Luhn check digit", () => {
    expect(isValid("090527+1475")).toBe(false); // last digit wrong
    expect(isValid("460823-9987")).toBe(false);
    expect(() => parsePersonal("090527+1475")).toThrow();
  });

  it("rejects invalid dates", () => {
    expect(isValid("700230-1234")).toBe(false); // Feb 30
    expect(isValid("701332-1231")).toBe(false); // month 13
    expect(isValid("700400-1238")).toBe(false); // April 0
    expect(() => parsePersonal("700230-1234")).toThrow();
  });

  it("rejects wrong length", () => {
    expect(isValid("")).toBe(false);
    expect(isValid("123456789")).toBe(false); // 9 digits
    expect(isValid("12345678901234")).toBe(false); // 14 digits
    expect(() => parsePersonal("123456789")).toThrow();
  });

  it("strips spaces (spaces are normalized away, so valid)", () => {
    expect(isValid("090527 1474")).toBe(true);
    const result = parse("090527 1474");
    expect(result.type).toBe("personnummer");
  });

  it("rejects allowCoordinationNumber: false with samordningsnummer", () => {
    expect(
      isValid("730288-9931", { allowCoordinationNumber: false })
    ).toBe(false);
    expect(() =>
      parsePersonal("730288-9931", { allowCoordinationNumber: false })
    ).toThrow();
  });

  it("rejects invalid interim letter (E not in TRSUWXJKLMN)", () => {
    expect(isValid("000101-E221", { allowInterimNumber: true })).toBe(false);
    expect(() =>
      parsePersonal("000101-E221", { allowInterimNumber: true })
    ).toThrow();
  });
});

describe("organisationsnummer - invalid input", () => {
  it("rejects wrong Luhn check digit", () => {
    expect(isValid("556703-7486")).toBe(false);
    expect(() => parseOrg("556703-7486")).toThrow();
  });

  it("parseOrg throws for personnummer (month 01-12)", () => {
    expect(() => parseOrg("090527-1474")).toThrow();
  });

  it("rejects wrong length", () => {
    expect(isValid("556703748")).toBe(false);
    expect(isValid("55670374856")).toBe(false);
    expect(() => parseOrg("556703748")).toThrow();
  });

  it("rejects 12-digit without 16 prefix when digits are org format", () => {
    expect(isValid("55567037485")).toBe(false);
  });
});

describe("unified parse - error handling", () => {
  it("isValid returns false for garbage input", () => {
    expect(isValid("abc")).toBe(false);
    expect(isValid("12345")).toBe(false);
    expect(isValid("090527+1474x")).toBe(false);
    expect(isValid("not-a-number")).toBe(false);
  });

  it("parse throws for invalid input", () => {
    expect(() => parse("")).toThrow();
    expect(() => parse("abc")).toThrow();
    expect(() => parse("090527+1475")).toThrow();
    expect(() => parse("556703-7486")).toThrow();
  });

  it("entityType throws for invalid string", () => {
    expect(() => entityType("")).toThrow();
    expect(() => entityType("invalid")).toThrow();
  });
});

describe("checksum and dates", () => {
  it("luhnCheckDigit returns correct check digit", () => {
    expect(luhnCheckDigit("811218987")).toBe(6);
  });

  it("isValidCalendarDate rejects invalid dates", () => {
    expect(isValidCalendarDate(2023, 2, 30)).toBe(false);
    expect(isValidCalendarDate(2023, 13, 1)).toBe(false);
    expect(isValidCalendarDate(2023, 0, 1)).toBe(false);
  });
});

describe("extraction on wrong type", () => {
  it("getAge throws for organisationsnummer", () => {
    const org = parse("556703-7485");
    expect(org.type).toBe("organisationsnummer");
    expect(() => getAge(org)).toThrow(
      "getAge only applies to personal identity numbers"
    );
  });

  it("getDate throws for organisationsnummer", () => {
    const org = parse("556703-7485");
    expect(() => getDate(org)).toThrow(
      "getDate only applies to personal identity numbers"
    );
  });
});
