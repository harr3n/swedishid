/** Parsed personal identity number (personnummer) fields */
export interface PersonalIdParts {
  century: string;
  fullYear: string;
  year: string;
  month: string;
  day: string;
  separator: "-" | "+";
  serial: string;
  checkDigit: string;
}

/** Parsed organisation number (organisationsnummer) fields */
export interface OrgIdParts {
  groupDigit: string;
  group: string;
  birthLikeMonth: string;
  birthLikeDay: string;
  serial: string;
  checkDigit: string;
  raw: string;
}

export type OutputStyle = "long" | "short" | "separated" | "separatedLong";

export interface FormatConfig {
  format?: OutputStyle;
  separator?: "-" | "+";
}

export interface PersonalIdOptions {
  allowCoordinationNumber?: boolean;
  allowInterimNumber?: boolean;
}

/** Result of parsing any Swedish ID (personal or organisation) */
export type SwedishId =
  | (PersonalIdParts & { type: "personnummer" })
  | (OrgIdParts & { type: "organisationsnummer" });
