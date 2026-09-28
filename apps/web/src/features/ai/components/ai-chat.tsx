"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, CardBody, Spinner, Textarea } from "@nova/ui";
import type { AiAssistantCitation } from "@nova/validation";

import { useSendAssistantMessageMutation } from "../ai-assistant.mutations";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: AiAssistantCitation[];
  handoff?: boolean;
}

let nextId = 0;
function messageId() {
  nextId += 1;
  return `msg-${nextId}`;
}

/**
 * Real chat UI for the customer-facing AI Shopping Assistant (Tier 2, ADR-0005) —
 * product discovery, comparison, and policy questions, all through one natural-language
 * conversation, matching what Volume 4 Part B1 actually asks for (not a separate
 * side-by-side comparison widget). The conversation lives in this component's own state
 * only: the backend is stateless per message (Volume 4 Part A2's Stage 0), so nothing is
 * persisted server-side and a page reload starts a new conversation.
 */
export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const mutation = useSendAssistantMessageMutation();

  const send = () => {
    const text = input.trim();
    if (!text || mutation.isPending) return;

    setMessages((prev) => [...prev, { id: messageId(), role: "user", text }]);
    setInput("");

    mutation.mutate(text, {
      onSuccess: (result) => {
        setMessages((prev) => [
          ...prev,
          {
            id: messageId(),
            role: "assistant",
            text: result.reply,
            citations: result.citations,
            handoff: result.handoff,
          },
        ]);
      },
    });
  };

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex max-h-96 min-h-32 flex-col gap-3 overflow-y-auto" role="log">
          {messages.length === 0 && (
            <p className="text-sm text-[color:var(--color-foreground-muted)]">
              Ask about a product, compare a couple of them, or ask about shipping, returns, or
              payment methods.
            </p>
          )}
          {messages.map((entry) => (
            <div
              key={entry.id}
              className={entry.role === "user" ? "self-end text-right" : "self-start"}
            >
              <div
                className={
                  entry.role === "user"
                    ? "rounded-lg bg-[color:var(--color-primary)] p-3 text-sm text-white"
                    : "rounded-lg bg-[color:var(--color-muted)] p-3 text-sm text-[color:var(--color-foreground)]"
                }
              >
                {entry.text}
              </div>
              {entry.citations && entry.citations.length > 0 && (
                <p className="mt-1 text-xs text-[color:var(--color-foreground-subtle)]">
                  Source: {entry.citations.map((citation) => citation.source).join(", ")}
                </p>
              )}
              {entry.handoff && (
                <Link
                  className="mt-1 inline-block text-xs font-semibold text-[color:var(--color-primary)] hover:underline"
                  href="/support"
                >
                  Go to Support
                </Link>
              )}
            </div>
          ))}
          {mutation.isPending && (
            <div className="self-start">
              <Spinner className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              hideLabel
              label="Message"
              placeholder="Ask the assistant..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
            />
          </div>
          <Button disabled={mutation.isPending || !input.trim()} onClick={send}>
            Send
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
