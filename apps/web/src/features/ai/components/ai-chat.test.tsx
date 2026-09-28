import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

import { AiChat } from "./ai-chat";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderChat() {
  return render(<AiChat />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });
}

describe("AiChat", () => {
  it("sends the typed message, shows it, and renders the real grounded reply with its citation", async () => {
    server.use(
      http.post(`${BASE_URL}/ai/assistant/message`, async ({ request }) => {
        expect(await request.json()).toEqual({ message: "do you have headphones?" });
        return HttpResponse.json({
          data: {
            reply: "Nova has wireless headphones in stock for 45.00 SLE.",
            citations: [{ source: "Nova catalog search" }],
            handoff: false,
          },
        });
      }),
    );

    renderChat();
    await userEvent.type(screen.getByLabelText("Message"), "do you have headphones?");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("do you have headphones?")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByText("Nova has wireless headphones in stock for 45.00 SLE."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/Source: Nova catalog search/)).toBeInTheDocument();
  });

  it("shows a link to Support for a handoff reply, and no citation", async () => {
    server.use(
      http.post(`${BASE_URL}/ai/assistant/message`, () =>
        HttpResponse.json({
          data: {
            reply: "I'm not confident I can help with that one.",
            citations: [],
            handoff: true,
          },
        }),
      ),
    );

    renderChat();
    await userEvent.type(screen.getByLabelText("Message"), "please refund my order");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Go to Support" })).toHaveAttribute(
        "href",
        "/support",
      ),
    );
    expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
  });

  it("does not send an empty or whitespace-only message", async () => {
    renderChat();
    const sendButton = screen.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Message"), "   ");
    expect(sendButton).toBeDisabled();
  });

  it("sends on Enter (without Shift), keeping Shift+Enter free for a newline", async () => {
    server.use(
      http.post(`${BASE_URL}/ai/assistant/message`, () =>
        HttpResponse.json({ data: { reply: "Got it.", citations: [], handoff: false } }),
      ),
    );

    renderChat();
    const input = screen.getByLabelText("Message");
    await userEvent.type(input, "hello{enter}");

    await waitFor(() => expect(screen.getByText("hello")).toBeInTheDocument());
    expect(screen.getByText("Got it.")).toBeInTheDocument();
  });
});
