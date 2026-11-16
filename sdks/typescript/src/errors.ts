import type { UuidV7 } from "./types.js";

export class CavernApiError extends Error {
  readonly code: string;
  readonly requestId: UuidV7;
  readonly retryAfterMilliseconds: number | null;
  readonly status: number;

  constructor(
    code: string,
    requestId: UuidV7,
    status: number,
    retryAfterMilliseconds: number | null,
  ) {
    super(code);
    this.name = "CavernApiError";
    this.code = code;
    this.requestId = requestId;
    this.status = status;
    this.retryAfterMilliseconds = retryAfterMilliseconds;
  }
}

export class CavernClientError extends Error {
  readonly code:
    | "CAVERN_CLIENT_ABORTED"
    | "CAVERN_CLIENT_CREDENTIAL_UNAVAILABLE"
    | "CAVERN_CLIENT_INPUT_INVALID"
    | "CAVERN_CLIENT_NETWORK"
    | "CAVERN_CLIENT_RESPONSE_INVALID";

  constructor(code: CavernClientError["code"]) {
    super(code);
    this.name = "CavernClientError";
    this.code = code;
  }
}

export class CavernTransferError extends Error {
  readonly code:
    | "CAVERN_TRANSFER_DESCRIPTOR_EXPIRED"
    | "CAVERN_TRANSFER_DESCRIPTOR_INVALID"
    | "CAVERN_TRANSFER_OUTCOME_UNKNOWN"
    | "CAVERN_TRANSFER_PART_REFUSED"
    | "CAVERN_TRANSFER_RESPONSE_INVALID";
  readonly partNumber: number | null;
  readonly status: number | null;

  constructor(
    code: CavernTransferError["code"],
    partNumber: number | null = null,
    status: number | null = null,
  ) {
    super(code);
    this.name = "CavernTransferError";
    this.code = code;
    this.partNumber = partNumber;
    this.status = status;
  }
}
