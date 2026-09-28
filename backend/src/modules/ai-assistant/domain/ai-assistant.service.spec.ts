import type { ProductSearchResult } from "../../catalog";

import { AiAssistantService } from "./ai-assistant.service";
import type { AiProviderAdapter } from "./providers/ai-provider.interface";
import { AiProviderUnavailableError } from "./providers/claude-provider";

/**
 * Pure unit tests, same convention as metrics-auth.guard.spec.ts: plain construction
 * with fake dependencies, no NestJS TestingModule and no real Postgres/Anthropic call.
 * The fake AiProviderAdapter is exactly the seam ADR-0005/Volume 4 E3 exists for — the
 * same DI-substitution technique payments-wallet's StubPaymentProvider demonstrates,
 * applied here to prove AiAssistantService's OWN logic (grounding, citations, the
 * handoff rule) without depending on a live Claude account or its cost.
 */
function fakeProvider(completions: string[]): AiProviderAdapter & { calls: unknown[] } {
  const calls: unknown[] = [];
  let i = 0;
  return {
    calls,
    complete: (input) => {
      calls.push(input);
      const text = completions[i] ?? completions[completions.length - 1];
      i += 1;
      return Promise.resolve({ text });
    },
  };
}

function unavailableProvider(): AiProviderAdapter {
  return {
    complete: () => Promise.reject(new AiProviderUnavailableError("no key configured")),
  };
}

function fakeCatalog(results: ProductSearchResult[] = []) {
  const calls: { q?: string; limit?: number }[] = [];
  return {
    calls,
    searchPublished: (query: { q?: string; limit?: number }) => {
      calls.push(query);
      return Promise.resolve(query.q ? results : []);
    },
  };
}

function product(overrides: Partial<ProductSearchResult> = {}): ProductSearchResult {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Wireless Headphones",
    slug: "wireless-headphones",
    description: "Over-ear, noise cancelling.",
    priceAmount: "45.00",
    priceCurrency: "SLE",
    inStock: true,
    ...overrides,
  };
}

const classify = (intent: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ intent, ...extra });

describe("AiAssistantService", () => {
  describe("the provider is unavailable", () => {
    it("hands off instead of throwing, for the classification call", async () => {
      const service = new AiAssistantService(unavailableProvider(), fakeCatalog() as never);
      const result = await service.chat("hello");
      expect(result.handoff).toBe(true);
      expect(result.citations).toEqual([]);
    });

    it("hands off instead of throwing when the SECOND (grounded-reply) call fails", async () => {
      const catalog = fakeCatalog([product()]);
      const provider: AiProviderAdapter = {
        complete: (input) => {
          const isClassify = input.messages.some((m) => m.content.includes("You classify"));
          if (isClassify)
            return Promise.resolve({
              text: classify("product_search", { searchQuery: "headphones" }),
            });
          return Promise.reject(new AiProviderUnavailableError("down"));
        },
      };
      const service = new AiAssistantService(provider, catalog as never);
      const result = await service.chat("show me headphones");
      expect(result.handoff).toBe(true);
    });
  });

  describe("classification the service cannot act on confidently", () => {
    it("hands off when the model's reply is not valid JSON", async () => {
      const service = new AiAssistantService(
        fakeProvider(["not json at all"]),
        fakeCatalog() as never,
      );
      const result = await service.chat("asdkjasd");
      expect(result.handoff).toBe(true);
    });

    it("hands off when the model returns an intent this service does not recognise", async () => {
      const service = new AiAssistantService(
        fakeProvider([classify("something_unexpected")]),
        fakeCatalog() as never,
      );
      const result = await service.chat("???");
      expect(result.handoff).toBe(true);
    });

    it('hands off for "sensitive" — refunds/account changes are never resolved by this assistant', async () => {
      const service = new AiAssistantService(
        fakeProvider([classify("sensitive")]),
        fakeCatalog() as never,
      );
      const result = await service.chat("please refund my last order");
      expect(result.handoff).toBe(true);
    });

    it('hands off for "other" — anything not confidently classified', async () => {
      const service = new AiAssistantService(
        fakeProvider([classify("other")]),
        fakeCatalog() as never,
      );
      const result = await service.chat("how's the weather");
      expect(result.handoff).toBe(true);
    });
  });

  describe("policy questions — retrieval only, no generation call", () => {
    it("returns the real knowledge-base answer, cited, and makes only ONE provider call (classify)", async () => {
      const provider = fakeProvider([classify("policy_question", { policyQuery: "how do I pay" })]);
      const service = new AiAssistantService(provider, fakeCatalog() as never);

      const result = await service.chat("how do I pay for my order?");

      expect(result.handoff).toBe(false);
      expect(result.reply).toMatch(/wallet balance, a card, or mobile money/i);
      expect(result.citations).toEqual([
        { source: "@nova/validation checkoutSchema (paymentMethod: wallet | card | mobile-money)" },
      ]);
      // No second (generation) call — a policy answer is retrieved verbatim, never paraphrased.
      expect(provider.calls).toHaveLength(1);
    });

    it("hands off when nothing in the knowledge base matches", async () => {
      const service = new AiAssistantService(
        fakeProvider([classify("policy_question", { policyQuery: "do you sell gift cards" })]),
        fakeCatalog() as never,
      );
      const result = await service.chat("do you sell gift cards?");
      expect(result.handoff).toBe(true);
    });
  });

  describe("product search — grounded in real catalog data only", () => {
    it("searches the real catalog and generates a reply grounded in what it actually returned", async () => {
      const realProduct = product();
      const catalog = fakeCatalog([realProduct]);
      const provider = fakeProvider([
        classify("product_search", { searchQuery: "wireless headphones" }),
        "Here's a great pair of wireless headphones for you.",
      ]);

      const service = new AiAssistantService(provider, catalog as never);
      const result = await service.chat("do you have wireless headphones?");

      expect(catalog.calls[0]).toEqual({ q: "wireless headphones", limit: 5 });
      expect(result.handoff).toBe(false);
      expect(result.citations).toEqual([{ source: "Nova catalog search" }]);

      // The grounding fed to the SECOND call must be exactly the real product's own
      // data — nothing invented, nothing from a different fixture.
      const secondCall = provider.calls[1] as { messages: { content: string }[] };
      const systemMessage = secondCall.messages.find((m) => m.content.includes("Real products"));
      expect(systemMessage?.content).toContain(realProduct.title);
      expect(systemMessage?.content).toContain(realProduct.priceAmount!);
    });

    it("answers honestly (not a handoff) when the real catalog has no matches", async () => {
      const service = new AiAssistantService(
        fakeProvider([classify("product_search", { searchQuery: "a flying carpet" })]),
        fakeCatalog([]) as never,
      );
      const result = await service.chat("do you sell flying carpets?");
      expect(result.handoff).toBe(false);
      expect(result.reply).toMatch(/couldn't find/i);
      expect(result.citations).toEqual([]);
    });
  });

  describe("product comparison — needs at least two real matches", () => {
    it("compares real matched products", async () => {
      // Two different named lookups, each finding one real product.
      let call = 0;
      const catalog = {
        calls: [] as unknown[],
        searchPublished: (query: { q?: string }) => {
          catalog.calls.push(query);
          call += 1;
          return Promise.resolve([product({ title: call === 1 ? "Phone A" : "Phone B" })]);
        },
      };
      const provider = fakeProvider([
        classify("product_comparison", { productNames: ["Phone A", "Phone B"] }),
        "Phone A and Phone B are both solid options.",
      ]);

      const service = new AiAssistantService(provider, catalog as never);
      const result = await service.chat("compare Phone A and Phone B");

      expect(result.handoff).toBe(false);
      expect(result.citations).toEqual([{ source: "Nova catalog search" }]);
      expect(catalog.calls).toHaveLength(2);
    });

    it("hands off when fewer than two of the named products are real catalog matches", async () => {
      const provider = fakeProvider([
        classify("product_comparison", { productNames: ["Nonexistent A", "Nonexistent B"] }),
      ]);
      const service = new AiAssistantService(provider, fakeCatalog([]) as never);

      const result = await service.chat("compare Nonexistent A and Nonexistent B");
      expect(result.handoff).toBe(false);
      expect(result.reply).toMatch(/couldn't find enough/i);
    });
  });
});
