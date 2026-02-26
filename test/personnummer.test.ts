import { describe, it, expect } from "vitest";
import { yearsBetween } from "../src/dates";
import {
  parse,
  isValid,
  parsePersonal,
  isValidPersonal,
  format,
  getAge,
  getDate,
  isMale,
  isFemale,
  isCoordinationNumber,
} from "../src/index";
import list from "./fixtures/list.json";

const formats = [
  "long_format",
  "short_format",
  "separated_format",
  "separated_long",
] as const;

describe("personnummer parse and valid", () => {
  it("validates personnummer with control digit", () => {
    for (const item of list) {
      if (!("valid" in item) || typeof item.valid !== "boolean") continue;
      for (const fmt of formats) {
        const value = item[fmt];
        if (typeof value !== "string" || value.includes(" ")) continue;
        expect(isValid(value)).toBe(item.valid);
      }
    }
  });

  it("throws for invalid personnummer", () => {
    for (const item of list) {
      if (item.valid) continue;
      for (const fmt of formats) {
        const value = item[fmt];
        if (typeof value !== "string" || value.includes(" ")) continue;
        expect(() => parse(value)).toThrow();
      }
    }
  });

  it("parses valid personnummer across formats", () => {
    for (const item of list) {
      if (!item.valid) continue;
      for (const fmt of formats) {
        if (fmt === "short_format") continue;
        const value = item[fmt];
        if (typeof value !== "string") continue;
        const pnr = parse(value);
        if (pnr.type !== "personnummer") throw new Error("expected personnummer");
        expect(pnr.century + pnr.year + pnr.month + pnr.day).toBe(
          item.separated_long.replace(/[+\-]/, "").slice(0, 8)
        );
      }
    }
  });

  it("rejects organisation numbers (month >= 20)", () => {
    expect(isValidPersonal("212000-0142")).toBe(false);
    expect(isValidPersonal("5567037485")).toBe(false);
    expect(() => parsePersonal("5567037485")).toThrow();
  });
});

describe("personnummer format", () => {
  it("formats to separated and long formats", () => {
    for (const item of list) {
      if (!item.valid) continue;
      for (const fmt of formats) {
        if (fmt === "short_format") continue;
        const value = item[fmt];
        if (typeof value !== "string") continue;
        const pnr = parse(value);
        expect(format(pnr, { format: "separated" })).toBe(item.separated_format);
        expect(format(pnr, { format: "long" })).toBe(item.long_format);
      }
    }
  });
});

describe("personnummer extraction", () => {
  it("extracts sex correctly", () => {
    for (const item of list) {
      if (!item.valid) continue;
      for (const fmt of formats) {
        if (fmt === "short_format") continue;
        const value = item[fmt];
        if (typeof value !== "string") continue;
        const pnr = parse(value);
        expect(isMale(pnr)).toBe(item.isMale);
        expect(isFemale(pnr)).toBe(item.isFemale);
      }
    }
  });

  it("detects coordination numbers", () => {
    for (const item of list) {
      if (!item.valid) continue;
      const value = item.separated_format;
      if (typeof value !== "string") continue;
      const pnr = parse(value);
      expect(isCoordinationNumber(pnr)).toBe(item.type === "con");
    }
  });

  it("throws when allowInterimNumber is false and input is interim", () => {
    expect(isValid("000101-T220", { allowInterimNumber: false })).toBe(false);
    expect(() =>
      parse("000101-T220", { allowInterimNumber: false })
    ).toThrow();
  });
});

describe("personnummer interim numbers", () => {
  it("validates interim numbers with allowInterimNumber", () => {
    const interimList = [
      {
        separated_format: "000101-T220",
        valid: true,
        isMale: false,
        isFemale: true,
      },
      {
        separated_format: "000101-R220",
        valid: true,
        isMale: false,
        isFemale: true,
      },
      { separated_format: "000101-E221", valid: false },
    ];
    for (const item of interimList) {
      const opts = { allowInterimNumber: true };
      expect(isValid(item.separated_format, opts)).toBe(item.valid);
      if (item.valid) {
        const pnr = parse(item.separated_format, opts);
        expect(isFemale(pnr)).toBe(item.isFemale);
        expect(isMale(pnr)).toBe(item.isMale);
      }
    }
  });

  it("formats interim numbers", () => {
    const pnr = parse("000101-T220", { allowInterimNumber: true });
    expect(format(pnr, { format: "separated" })).toBe("000101-T220");
    expect(format(pnr, { format: "long" })).toBe("20000101T220");
  });
});

describe("personnummer extraction continued", () => {
  it("extracts date and age", () => {
    for (const item of list) {
      if (!item.valid) continue;
      const pin = item.separated_long;
      const year = pin.slice(0, 4);
      const month = pin.slice(4, 6);
      let day = pin.slice(6, 8);
      if (item.type === "con")
        day = String(parseInt(day, 10) - 60).padStart(2, "0");
      const expectedDate = new Date(`${year}-${month}-${day}`);
      const pnr = parse(item.separated_format);
      expect(getDate(pnr)).toEqual(expectedDate);
      const now = new Date();
      const expectedAge = yearsBetween(now, expectedDate);
      expect(getAge(pnr)).toBe(expectedAge);
    }
  });
});
