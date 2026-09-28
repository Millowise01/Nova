import { Inject, Injectable, Logger } from "@nestjs/common";
import { z } from "zod";

import type { AiAssistantResponse } from "@nova/validation";

import { CatalogPublicService, type ProductSearchResult } from "../../catalog";

import { findPolicyAnswer } from "./policy-knowledge-base";
import type { AiProviderAdapter } from "./providers/ai-provider.interface";
import { AI_PROVIDER_ADAPTER } from "./providers/ai-provider.token";
import { AiProviderUnavailableError } from "./providers/claude-provider";

const MAX_COMPARISON_PRODUCTS = 3;

const HANDOFF_REPLY =
  "I'm not confident I can help with that one — a Nova support agent can. You can reach them from the Support page.";

function handoff(): AiAssistantResponse {
  return { reply: HANDOFF_REPLY, citations: [], handoff: true };
}

const intentSchema = z.object({
  intent: z.enum(["product_search", "product_comparison", "policy_question", "sensitive", "other"]),
  searchQuery: z.string().optional(),
  productNames: z.array(z.string()).max(MAX_COMPARISON_PRODUCTS).optional(),
  policyQuery: z.string().optional(),
});

const CLASSIFY_SYSTEM_PROMPT = `You classify a Nova shopping assistant message. Reply with ONLY a JSON object, no other text, matching exactly:
{"intent": "product_search" | "product_comparison" | "policy_question" | "sensitive" | "other", "searchQuery": string (for product_search, a short search phrase), "productNames": string[] (for product_comparison, the products the caller named), "policyQuery": string (for policy_question, what they're actually asking about shipping/returns/payment/orders)}
Use "sensitive" for anything about refunds, account changes, payments failing, or a specific order needing help — a human should handle those, not you.
Use "other" for anything else you cannot confidently classify (greetings, unrelated chit-chat, anything ambiguous).`;

function productGroundingBlock(products: ProductSearchResult[]): string {
  return products
    .map(
      (product) =>
        `- ${product.title}: ${
          product.priceAmount
            ? `${product.priceAmount} ${product.priceCurrency}`
            : "price unavailable"
        }, ${product.inStock ? "in stock" : "out of stock"}${
          product.description ? ` — ${product.description}` : ""
        }`,
    )
    .join("\n");
}

const GROUNDED_REPLY_SYSTEM_PROMPT = `You are Nova's shopping assistant. Describe ONLY the products listed below — never mention a product, price, or attribute that is not in this list, and never invent one. If the list is empty, say so plainly. Keep the reply short and conversational.`;

/**
 * Customer-facing AI Shopping Assistant (Tier 2, Volume 4 Part B1 — ADR-0005). Stage 0
 * per Volume 4 Part A2: a deterministic, explainable baseline — classify, then either
 * retrieve a real, cited policy answer or generate a reply grounded in real catalog data
 * this service fetched itself, never data the model invented or looked up on its own.
 * Anything the classifier is not confident about, or that touches a sensitive action, is
 * a handoff (Volume 4 B1's hard handoff rule) — enforced here in code, not left to the
 * model's judgment alone.
 */
@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    @Inject(AI_PROVIDER_ADAPTER) private readonly provider: AiProviderAdapter,
    private readonly catalogPublic: CatalogPublicService,
  ) {}

  async chat(message: string): Promise<AiAssistantResponse> {
    // Everything below can call the provider (classify, and product_search/comparison's
    // grounded-generation step) — a single try/catch means the provider being
    // unavailable at ANY point in the flow hands off cleanly instead of a 500,
    // regardless of which step it fails on.
    try {
      const classified = await this.classify(message);

      if (!classified || classified.intent === "sensitive" || classified.intent === "other") {
        return handoff();
      }

      switch (classified.intent) {
        case "policy_question":
          return this.answerPolicyQuestion(classified.policyQuery ?? message);
        case "product_search":
          return await this.answerProductSearch(classified.searchQuery ?? message);
        case "product_comparison":
          return await this.answerProductComparison(classified.productNames ?? []);
      }
    } catch (error) {
      if (error instanceof AiProviderUnavailableError) {
        this.logger.warn(`AI provider unavailable, handing off: ${error.message}`);
        return handoff();
      }
      throw error;
    }
  }

  private async classify(message: string): Promise<z.infer<typeof intentSchema> | null> {
    const completion = await this.provider.complete({
      messages: [
        { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      maxTokens: 256,
    });

    try {
      const parsed = JSON.parse(completion.text) as unknown;
      return intentSchema.parse(parsed);
    } catch {
      // Could not parse a confident classification — handoff rather than guess at intent.
      return null;
    }
  }

  private answerPolicyQuestion(question: string): AiAssistantResponse {
    // Direct retrieval, no generation call: Volume 4 A2's "deterministic, explainable
    // baseline" applies most literally here — a static, already-accurate policy answer
    // has nothing to gain from paraphrasing, and paraphrasing risks altering the fact.
    const entry = findPolicyAnswer(question);
    if (!entry) return handoff();
    return { reply: entry.answer, citations: [{ source: entry.source }], handoff: false };
  }

  private async answerProductSearch(searchQuery: string): Promise<AiAssistantResponse> {
    const products = await this.catalogPublic.searchPublished({ q: searchQuery, limit: 5 });
    if (products.length === 0) {
      return {
        reply:
          "I couldn't find anything matching that in Nova's catalog. Try different words, or browse the catalog directly.",
        citations: [],
        handoff: false,
      };
    }
    const reply = await this.generateGroundedReply(searchQuery, products);
    return { reply, citations: [{ source: "Nova catalog search" }], handoff: false };
  }

  private async answerProductComparison(productNames: string[]): Promise<AiAssistantResponse> {
    const matches = await Promise.all(
      productNames
        .slice(0, MAX_COMPARISON_PRODUCTS)
        .map((name) => this.catalogPublic.searchPublished({ q: name, limit: 1 })),
    );
    const products = matches
      .map((result) => result[0])
      .filter((p): p is ProductSearchResult => !!p);

    if (products.length < 2) {
      return {
        reply:
          "I couldn't find enough of those products in Nova's catalog to compare — try naming them more specifically, or browse the catalog directly.",
        citations: [],
        handoff: false,
      };
    }

    const reply = await this.generateGroundedReply(
      `Compare these products for the shopper: ${productNames.join(", ")}`,
      products,
    );
    return { reply, citations: [{ source: "Nova catalog search" }], handoff: false };
  }

  private async generateGroundedReply(
    userMessage: string,
    products: ProductSearchResult[],
  ): Promise<string> {
    const completion = await this.provider.complete({
      messages: [
        {
          role: "system",
          content: `${GROUNDED_REPLY_SYSTEM_PROMPT}\n\nReal products:\n${productGroundingBlock(products)}`,
        },
        { role: "user", content: userMessage },
      ],
      maxTokens: 400,
    });
    return completion.text;
  }
}
