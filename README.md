# swedishid

A TypeScript library for Swedish personnummer and organisationsnummer. Validate, parse, format, and extract metadata from Swedish identity numbers.

## Installation

```bash
pnpm add swedishid
# or npm install swedishid
```

## API


```ts
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
} from "swedishid";

// Parse any Swedish ID
const pnr = parse("090527+1474"); // { type: "personnummer", ... }
const org = parse("556703-7485"); // { type: "organisationsnummer", ... }

// Validate
isValid("090527+1474"); // true
isValid("556703-7485"); // true

// Format (works for both)
format(pnr, { format: "long" }); // "190905271474"
format(org, { format: "separated" }); // "556703-7485"

// Personnummer-only: age, date, gender
getAge(pnr); // number
getDate(pnr); // Date
isMale(pnr);
isFemale(pnr);
isCoordinationNumber(pnr);

// Entity type (works for both)
entityType("090527+1474"); // { code: "ENSKILD_FIRMA", name: "Enskild firma" }
entityType("556703-7485"); // { code: "AKTIEBOLAG", name: "Aktiebolag" }
```

### Options

```ts
parse("730288-9931", {
  allowCoordinationNumber: true, // default: true – accept samordningsnummer
  allowInterimNumber: false, // default: false – accept interim/T-numbers
});

parse("000101-T220", { allowInterimNumber: true });
```

### Type-specific parsers

If you already know the type:

```ts
import {
  parsePersonal,
  parseOrg,
  formatPersonal,
  formatOrg,
  organisationType,
} from "swedishid";

const pnr = parsePersonal("090527+1474");
const org = parseOrg("556703-7485");
```

## Storage and parsing

### Century inference for 10-digit input

When parsing personnummer without a separator and without explicit century (e.g. `1212121212`), the century is inferred so the birth year ends in the given two digits and is as close as possible to the current year. So in 2026, `1212121212` is interpreted as 2012-12-12, not 1912-12-12.

This can produce edge cases (e.g. someone born in 1912 parsed in 2026). The separator (`+` vs `-`) is authoritative when present: Skatteverket uses `+` for people 100 or older.

### Store 12 digits, format for display

**Recommended**: Store personnummer and organisationsnummer as **12 digits with no separator** in your database.

- **Personnummer**: Use `19`/`20` (century) + 10 digits. Example: `190905271474`.
- **Organisationsnummer**: Use `16` + 10 digits. Example: `165567037485`.

Benefits:

- No ambiguity about century
- No separator to update when someone turns 100
- Fixed length, digits only — easier to index and query
- Format to `separated` or other display formats only when rendering

```ts
const result = parse("090527+1474");
const forStorage = format(result, { format: "long" }); // "190905271474"
const forDisplay = format(result, { format: "separated" }); // "090527+1474"
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```
