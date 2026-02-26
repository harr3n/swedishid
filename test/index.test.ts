import { describe, it, expect } from "vitest";
import {
  parse,
  isValid,
  format,
  getAge,
  getDate,
  isMale,
  isFemale,
  isCoordinationNumber,
  entityType,
  getOrganizationType,
  parsePersonal,
  parseOrg,
  formatPersonal,
  formatOrg,
} from "../src/index";

describe("unified API", () => {
  it("parse detects and parses personnummer", () => {
    const result = parse("090527+1474");
    expect(result.type).toBe("personnummer");
    if (result.type === "personnummer") {
      expect(result.year).toBe("09");
      expect(result.month).toBe("05");
      expect(result.day).toBe("27");
    }
  });

  it("parse detects and parses organisationsnummer", () => {
    const result = parse("556703-7485");
    expect(result.type).toBe("organisationsnummer");
    if (result.type === "organisationsnummer") {
      expect(result.raw).toBe("5567037485");
    }
  });

  it("isValid accepts both types", () => {
    expect(isValid("090527+1474")).toBe(true);
    expect(isValid("556703-7485")).toBe(true);
    expect(isValid("invalid")).toBe(false);
  });

  it("format works for both types", () => {
    const pnr = parse("090527+1474");
    expect(format(pnr, { format: "long" })).toBe("190905271474");
    expect(format(pnr, { format: "separated" })).toBe("090527+1474");

    const org = parse("556703-7485");
    expect(format(org, { format: "short" })).toBe("5567037485");
    expect(format(org, { format: "long" })).toBe("165567037485");
  });

  it("entityType works for both string and SwedishId", () => {
    expect(entityType("090527+1474")).toEqual({
      code: "ENSKILD_FIRMA",
      name: "Enskild firma",
    });
    expect(entityType("556703-7485")).toEqual({
      code: "AKTIEBOLAG",
      name: "Aktiebolag",
    });
    const result = parse("556703-7485");
    expect(entityType(result)).toEqual({
      code: "AKTIEBOLAG",
      name: "Aktiebolag",
    });
  });

  it("extraction functions work for personnummer results", () => {
    const result = parse("460823-9986");
    expect(result.type).toBe("personnummer");
    expect(getDate(result)).toBeInstanceOf(Date);
    expect(typeof getAge(result)).toBe("number");
    expect(isFemale(result)).toBe(true);
    expect(isMale(result)).toBe(false);
    expect(isCoordinationNumber(result)).toBe(false);
  });

  it("extraction functions throw for organisationsnummer", () => {
    const result = parse("556703-7485");
    expect(() => getAge(result)).toThrow(
      "getAge only applies to personal identity numbers"
    );
    expect(() => getDate(result)).toThrow(
      "getDate only applies to personal identity numbers"
    );
  });
});

describe("type-specific parsers", () => {
  it("parsePersonal and formatPersonal work", () => {
    const pnr = parsePersonal("090527+1474");
    expect(formatPersonal(pnr, { format: "long" })).toBe("190905271474");
    expect(getAge(pnr)).toBeDefined();
  });

  it("parseOrg and formatOrg work", () => {
    const org = parseOrg("556703-7485");
    expect(formatOrg(org, { format: "short" })).toBe("5567037485");
    const type = getOrganizationType(parse("556703-7485"));
    expect(type.code).toBe("AKTIEBOLAG");
  });
});
