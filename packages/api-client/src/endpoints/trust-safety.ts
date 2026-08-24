import { z } from "zod";

import {
  disputeDetailSchema,
  disputeEventSchema,
  disputeSchema,
  kycSubmissionSchema,
  sellerSuspensionRequestSchema,
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
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

/** apps/admin-only — KYC/seller-suspension dual-authorization queues and dispute
 *  resolution (backend/docs/10). Unlike Refunds & Payouts, KYC and suspension DO
 *  expose propose actions here — the Seller Approval & Suspension screen is the
 *  place those decisions get made, not just reviewed. */
export function createTrustSafetyEndpoints(client: NovaHttpClient) {
  return {
    async listKyc(params: ListKycQuery = {}): Promise<KycSubmissionResponse[]> {
      const response = await client.get<ApiEnvelope>("/trust-safety/kyc", { params });
      return z.array(kycSubmissionSchema).parse(response.data.data);
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
