export class InvalidPersonalIdError extends Error {
  constructor(message = "Invalid Swedish personal identity number") {
    super(message);
    this.name = "InvalidPersonalIdError";
  }
}

export class InvalidOrgIdError extends Error {
  constructor(message = "Invalid Swedish organisation number") {
    super(message);
    this.name = "InvalidOrgIdError";
  }
}
