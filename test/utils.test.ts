import { describe, it, expect } from "vitest";
import { luhnCheckDigit } from "../src/checksum";
import {
  isValidCalendarDate,
  yearsBetween,
} from "../src/dates";

describe("luhnCheckDigit", () => {
  it("returns correct check digit for valid input", () => {
    expect(luhnCheckDigit("811218987")).toBe(6);
    expect(luhnCheckDigit("121212121")).toBe(2);
    expect(luhnCheckDigit("090527147")).toBe(4);
  });

  it("returns 0 when sum is divisible by 10", () => {
    expect(luhnCheckDigit("000000000")).toBe(0);
  });
});

describe("isValidCalendarDate", () => {
  it("returns true for valid dates", () => {
    expect(isValidCalendarDate(1964, 8, 23)).toBe(true);
    expect(isValidCalendarDate(2000, 2, 29)).toBe(true);
    expect(isValidCalendarDate(1990, 12, 31)).toBe(true);
    expect(isValidCalendarDate(1900, 1, 1)).toBe(true);
  });

  it("returns false for invalid dates", () => {
    expect(isValidCalendarDate(2023, 2, 30)).toBe(false);
    expect(isValidCalendarDate(2023, 13, 1)).toBe(false);
    expect(isValidCalendarDate(2023, 0, 1)).toBe(false);
    expect(isValidCalendarDate(1900, 2, 29)).toBe(false);
    expect(isValidCalendarDate(2023, 4, 31)).toBe(false);
  });
});

describe("yearsBetween", () => {
  it("returns 0 when same date", () => {
    const d = new Date(1990, 5, 15);
    expect(yearsBetween(d, d)).toBe(0);
  });

  it("returns positive when first date is later", () => {
    const later = new Date(2000, 5, 15);
    const earlier = new Date(1990, 5, 15);
    expect(yearsBetween(later, earlier)).toBe(10);
  });

  it("returns negative when first date is earlier", () => {
    const earlier = new Date(1990, 5, 15);
    const later = new Date(2000, 5, 15);
    expect(yearsBetween(earlier, later)).toBe(-10);
  });

  it("handles birthday not yet reached in current year", () => {
    const birth = new Date(1990, 11, 31); // Dec 31
    const now = new Date(2000, 0, 1); // Jan 1, 2000
    expect(yearsBetween(now, birth)).toBe(9); // 9 full years, not 10
  });

  it("handles birthday just passed", () => {
    const birth = new Date(1990, 0, 1); // Jan 1
    const now = new Date(2000, 0, 2); // Jan 2, 2000
    expect(yearsBetween(now, birth)).toBe(10);
  });
});
