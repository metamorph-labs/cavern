import { CavernClient } from "./client.js";
import { CavernDataClient } from "./data-client.js";
import type { CavernDataClientOptions } from "./data-client.js";
import type {
  CapabilitySessionGrant,
  CollectionReference,
  CreateCapabilitySessionRequest,
  MutationOptions,
} from "./types.js";

export interface CapabilityDataClientOptions
  extends Omit<CavernDataClientOptions, "capability" | "origin"> {}

export interface CapabilityDataClientSession {
  /** Sensitive grant returned only to the builder backend. Do not persist or log its token. */
  grant: CapabilitySessionGrant;
  /** Capability-only client ready for the browser/mobile audience in the grant. */
  dataClient: CavernDataClient;
}

/**
 * Exchanges current builder-workload evidence for one reusable capability and returns a
 * capability-only client. The workload credential is used only by `managementClient`; it is never
 * copied into the returned data client.
 */
export async function createCapabilityDataClient(
  managementClient: CavernClient,
  reference: CollectionReference,
  request: CreateCapabilitySessionRequest,
  mutation: MutationOptions,
  dataOptions: CapabilityDataClientOptions = {},
): Promise<CapabilityDataClientSession> {
  const grant = await managementClient.createCapabilitySession(reference, request, mutation);
  return {
    grant,
    dataClient: new CavernDataClient({
      ...dataOptions,
      capability: grant.token,
      origin: grant.audience,
    }),
  };
}
