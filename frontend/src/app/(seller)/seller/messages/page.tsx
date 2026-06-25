"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";

interface Message { id: string; from: "seller" | "buyer"; text: string; time: string }
interface Conversation { id: string; buyer: string; lastMessage: string; time: string; unread: number; messages: Message[] }

const CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    buyer: "Aminata Koroma",
    lastMessage: "Is the solar lantern still available?",
    time: new Date(Date.now() - 1_800_000).toISOString(),
    unread: 2,
    messages: [
      { id: "m-1", from: "buyer", text: "Hi, is the solar lantern still available?", time: new Date(Date.now() - 1_800_000).toISOString() },
      { id: "m-2", from: "seller", text: "Yes, we have 48 in stock!", time: new Date(Date.now() - 1_200_000).toISOString() },
      { id: "m-3", from: "buyer", text: "Great, does it come with a warranty?", time: new Date(Date.now() - 900_000).toISOString() },
    ],
  },
  {
    id: "conv-2",
    buyer: "Mohamed Sesay",
    lastMessage: "When will my order arrive?",
    time: new Date(Date.now() - 7_200_000).toISOString(),
    unread: 0,
    messages: [
      { id: "m-4", from: "buyer", text: "When will my order #ord-102 arrive?", time: new Date(Date.now() - 7_200_000).toISOString() },
      { id: "m-5", from: "seller", text: "Your order is packed and will be dispatched tomorrow morning.", time: new Date(Date.now() - 7_000_000).toISOString() },
    ],
  },
];

export default function SellerMessagesPage() {
  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0]!.id);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);

  const active = conversations.find((c) => c.id === activeId)!;

  function sendMessage() {
    if (!input.trim()) return;
    const newMsg: Message = { id: `m-${Date.now()}`, from: "seller", text: input, time: new Date().toISOString() };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: input, time: newMsg.time }
          : c,
      ),
    );
    setInput("");
  }

  return (
    <main className="py-6">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>
      <div className="flex h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800">
          <div className="space-y-1 p-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl p-3 text-left transition",
                  activeId === conv.id ? "bg-primary/10" : "hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  {conv.buyer[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{conv.buyer}</p>
                    {conv.unread > 0 && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">{conv.lastMessage}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(conv.time)}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Thread */}
        <div className="flex flex-1 flex-col">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="font-semibold">{active.buyer}</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {active.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.from === "seller" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-xs rounded-2xl px-4 py-2.5 text-sm",
                    msg.from === "seller"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                  )}
                >
                  {msg.text}
                  <p className={cn("mt-1 text-[10px]", msg.from === "seller" ? "text-white/70" : "text-slate-400")}>
                    {formatRelativeTime(msg.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700"
            />
            <button
              onClick={sendMessage}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
