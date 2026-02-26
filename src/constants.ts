/**
 * Group number (gruppnummer) – first digit of organisationsnummer (bolagsform / legal form).
 * @see https://sv.wikipedia.org/wiki/Organisationsnummer
 */
export interface LegalForm {
  code: string;
  name: string;
}

export const ORGANISATION_TYPES: Record<number, LegalForm> = {
  1: { code: "DODSBO", name: "Dödsbon" },
  2: {
    code: "STAT_REGIONER_KOMMUNER",
    name: "Stat, regioner, kommuner, församlingar",
  },
  3: {
    code: "UTLANDSKA_FORETAG",
    name:
      "Utländska företag som bedriver näringsverksamhet eller äger fastigheter i Sverige",
  },
  5: { code: "AKTIEBOLAG", name: "Aktiebolag" },
  6: { code: "SAMFALLIGHET", name: "Samfällighet" },
  7: {
    code: "EKONOMISKA_FORENINGAR",
    name: "Ekonomiska föreningar, bostadsrättsföreningar och samfällighetsföreningar",
  },
  8: {
    code: "IDEELLA_FORENINGAR_STIFTELSER",
    name: "Ideella föreningar och stiftelser",
  },
  9: {
    code: "HANDELSBOLAG_KOMMANDITBOLAG",
    name: "Handelsbolag och kommanditbolag",
  },
};

/** Sole proprietorship (enskild firma) – used when ID is personal, not org */
export const ENSKILD_FIRMA: LegalForm = {
  code: "ENSKILD_FIRMA",
  name: "Enskild firma",
};