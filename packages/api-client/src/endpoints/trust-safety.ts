import { z } from "zod";

import {
  disputeDetailSchema,
  disputeEventSchema,
  disputeSchema,
  kycSubmissionSchema,
  sellerSuspensionRequestSchema,
  submitKycSchema,
  type AddDisputeEventInput,
  type DisputeDetailResponse,
  type DisputeEventResponse,
  type DisputeResponse,
  type KycSubmissionResponse,
  type ListDisputesQuery,
  type ListKycQuery,
  type ListSuspensionRequestsQuery,
  type ProposeKycDecisionInput,
  type SellerSuspensionRequestResponse,
  type SubmitKycInput,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

/** KYC review queues, seller-suspension dual-authorization, and dispute
 *  resolution (backend/docs/10) are apps/admin-only. submitKyc below is the one
 *  seller-facing exception — apps/seller's S-3 KYC onboarding. There is
 *  deliberately NO listMyKyc/getMyKycStatus here: GET /v1/trust-safety/kyc is
 *  admin-only at both the route (RequirePermission("read", "KYCSubmission"))
 *  and ability-policy level (ability.factory.ts grants no KYCSubmission rule to
 *  "seller" at all) — confirmed by reading both directly, not assumed. Logged
 *  as a backend follow-up in backend/docs/10, not built around with a guess. */
export function createTrustSafetyEndpoints(client: NovaHttpClient) {
  return {
    async listKyc(params: ListKycQuery = {}): Promise<KycSubmissionResponse[]> {
      const response = await client.get<ApiEnvelope>("/trust-safety/kyc", { params });
      return z.array(kycSubmissionSchema).parse(response.data.data);
    },

    /** POST /v1/trust-safety/kyc — seller-facing (backend/docs/10's disclosed
     *  addition). The server enforces that `subjectId` equals the authenticated
     *  caller (kyc.service.ts's submit() throws 403 KYC_SUBJECT_MUST_BE_CALLER
     *  otherwise), so callers must pass their own user ID. apps/seller's form
     *  never exposes subjectId as an editable field. */
    async submitKyc(input: SubmitKycInput): Promise<KycSubmissionResponse> {
      const response = await client.post<ApiEnvelope>(
        "/trust-safety/kyc",
        submitKycSchema.parse(input),
      );
      return kycSubmissionSchema.parse(response.data.data);
    },

    async proposeKycDecision(
      id: string,
      input: ProposeKycDecisionInput,
    ): Promise<KycSubmissionResponse> {
      const response = await client.patch<ApiEnvelope>(
        `/trust-safety/kyc/${id}/propose-decision`,
        input,
      );
      return kycSubmissionSchema.parse(response.data.data);
    },

    async confirmKycDecision(id: string): Promise<KycSubmissionResponse> {
      const response = await client.patch<ApiEnvelope>(`/trust-safety/kyc/${id}/confirm-decision`);
      return kycSubmissionSchema.parse(response.data.data);
    },

    async listSuspensionRequests(
      params: ListSuspensionRequestsQuery = {},
    ): Promise<SellerSuspensionRequestResponse[]> {
      const response = await client.get<ApiEnvelope>("/trust-safety/suspension-requests", {
        params,
      });
      return z.array(sellerSuspensionRequestSchema).parse(response.data.data);
    },

    async proposeSuspend(
      sellerId: string,
      reason: string,
    ): Promise<SellerSuspensionRequestResponse> {
      const response = await client.post<ApiEnvelope>(`/trust-safety/sellers/${sellerId}/suspend`, {
        reason,
      });
      return sellerSuspensionRequestSchema.parse(response.data.data);
    },

    async proposeReinstate(
      sellerId: string,
      reason: string,
    ): Promise<SellerSuspensionRequestResponse> {
      const response = await client.post<ApiEnvelope>(
        `/trust-safety/sellers/${sellerId}/reinstate`,
        { reason },
      );
      return sellerSuspensionRequestSchema.parse(response.data.data);
    },

    async confirmSuspensionRequest(id: string): Promise<SellerSuspensionRequestResponse> {
      const response = await client.patch<ApiEnvelope>(
        `/trust-safety/suspension-requests/${id}/confirm`,
      );
      return sellerSuspensionRequestSchema.parse(response.data.data);
    },

    async rejectSuspensionRequest(
      id: string,
      reason: string,
    ): Promise<SellerSuspensionRequestResponse> {
      const response = await client.patch<ApiEnvelope>(
        `/trust-safety/suspension-requests/${id}/reject`,
        { reason },
      );
      return sellerSuspensionRequestSchema.parse(response.data.data);
    },

    async listDisputes(params: ListDisputesQuery = {}): Promise<DisputeResponse[]> {
      const response = await client.get<ApiEnvelope>("/trust-safety/disputes", { params });
      return z.array(disputeSchema).parse(response.data.data);
    },

    async getDispute(id: string): Promise<DisputeDetailResponse> {
      const response = await client.get<ApiEnvelope>(`/trust-safety/disputes/${id}`);
      return disputeDetailSchema.parse(response.data.data);
    },

    async addDisputeComment(
      id: string,
      input: AddDisputeEventInput,
    ): Promise<DisputeEventResponse> {
      const response = await client.post<ApiEnvelope>(
        `/trust-safety/disputes/${id}/comments`,
        input,
      );
      return disputeEventSchema.parse(response.data.data);
    },

    async resolveDispute(id: string, resolution: string): Promise<DisputeResponse> {
      const response = await client.patch<ApiEnvelope>(`/trust-safety/disputes/${id}/resolve`, {
        resolution,
      });
      return disputeSchema.parse(response.data.data);
    },
  };
}
