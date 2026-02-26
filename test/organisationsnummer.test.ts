import { describe, it, expect } from "vitest";
import {
  parseOrg,
  isValidOrg,
  formatOrg,
  organisationType,
} from "../src/index";
import orgnumber from "./fixtures/orgnumber.json";

const formats = ["short_format", "separated_format"] as const;

describe("organisationsnummer parse and valid", () => {
  it("validates organisation numbers", () => {
    for (const item of orgnumber) {
      for (const fmt of formats) {
        const value = item[fmt];
        if (typeof value !== "string") continue;
        expect(isValidOrg(value)).toBe(true);
      }
    }
  });

  it("parses organisation numbers", () => {
    for (const item of orgnumber) {
      const value = item.separated_format;
      if (typeof value !== "string") continue;
      const org = parseOrg(value);
      const expected = value.replace(/-/g, "");
      expect(org.raw).toBe(expected);
      expect(parseInt(org.birthLikeMonth, 10)).toBeGreaterThanOrEqual(20);
    }
  });

  it("rejects personnummer (month < 20)", () => {
    expect(isValidOrg("090527+1474")).toBe(false);
    expect(() => parseOrg("090527+1474")).toThrow();
  });

  it("accepts 12-digit format with 16 prefix", () => {
    expect(isValidOrg("165567037485")).toBe(true);
    const org = parseOrg("165567037485");
    expect(org.raw).toBe("5567037485");
  });
});

describe("organisationsnummer format", () => {
  it("formats to all output formats", () => {
    const org = parseOrg("556703-7485");
    expect(formatOrg(org, { format: "short" })).toBe("5567037485");
    expect(formatOrg(org, { format: "separated" })).toBe("556703-7485");
    expect(formatOrg(org, { format: "long" })).toBe("165567037485");
  });
});

describe("organisationsnummer type", () => {
  it("extracts organisation type from gruppnummer (first digit)", () => {
    const spotify = parseOrg("556703-7485");
    expect(organisationType(spotify)).toEqual({
      code: "AKTIEBOLAG",
      name: "Aktiebolag",
    });
    const stockholm = parseOrg("212000-0142");
    expect(organisationType(stockholm)).toEqual({
      code: "STAT_REGIONER_KOMMUNER",
      name: "Stat, regioner, kommuner, församlingar",
    });
    const apfond = parseOrg("857209-0606");
    expect(organisationType(apfond)).toEqual({
      code: "IDEELLA_FORENINGAR_STIFTELSER",
      name: "Ideella föreningar och stiftelser",
    });
  });
});
