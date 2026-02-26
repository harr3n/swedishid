/**
 * swedishid - Swedish personal and organisation identity numbers
 *
 * @packageDocumentation
 */

// Main API
export {
  fromString as parse,
  isValid,
  format,
  getAge,
  getDate,
  isMale,
  isFemale,
  isCoordinationNumber,
  entityType,
  getOrganizationType,
} from "./core";

// Type-specific parsers
export {
  fromString as parsePersonal,
  isValid as isValidPersonal,
  toFormattedString as formatPersonal,
} from "./personal-id";
export {
  fromString as parseOrg,
  isValid as isValidOrg,
  toFormattedString as formatOrg,
  organisationType,
} from "./org-id";

// Errors
export { InvalidPersonalIdError, InvalidOrgIdError } from "./errors";

// Constants
export { ENSKILD_FIRMA, ORGANISATION_TYPES } from "./constants";

// Types
export type {
  PersonalIdParts,
  OrgIdParts,
  SwedishId,
  OutputStyle,
  FormatConfig,
  PersonalIdOptions,
} from "./types";
export type { LegalForm } from "./constants";
