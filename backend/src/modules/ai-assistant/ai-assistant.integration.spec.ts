import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { createTestApp } from "../../test-utils/create-test-app";
import { signUpTestUser } from "../../test-utils/users";

/**
 * Real integration test — the actual controller, guards, validation pipe, and DI graph,
 * against the real running app. No ANTHROPIC_API_KEY is configured in this test
 * environment (backend/.env sets none, and none should ever be added just to run tests
 * against a paid third-party API), so this exercises the real, deployed default wiring's
 * safety property directly: with no key configured, the assistant hands off cleanly on
 * every request rather than crashing. AiAssistantService's actual classify/route/ground
 * logic (what happens WITH a working provider) is covered by
 * domain/ai-assistant.service.spec.ts's fakes — that is the right place for it, not here.
 */
describe("AI Shopping Assistant (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  it("requires authentication", async () => {
    await request(app.getHttpServer())
      .post("/v1/ai/assistant/message")
      .send({ message: "do you have headphones?" })
      .expect(401);
  });

  it("rejects an empty message via the shared @nova/validation schema", async () => {
    const user = await signUpTestUser(app, "ai-assistant-validation");

    const response = await request(app.getHttpServer())
      .post("/v1/ai/assistant/message")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ message: "" })
      .expect(400);
    expect(response.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("hands off cleanly (200, handoff: true) rather than crashing when no provider is configured", async () => {
    const user = await signUpTestUser(app, "ai-assistant-handoff");

    const response = await request(app.getHttpServer())
      .post("/v1/ai/assistant/message")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ message: "do you have wireless headphones?" })
      .expect(200);

    expect(response.body.data.handoff).toBe(true);
    expect(response.body.data.reply).toEqual(expect.any(String));
    expect(response.body.data.citations).toEqual([]);
  });
});
