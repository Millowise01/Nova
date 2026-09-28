"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError } from "@nova/api-client";

import { useToast } from "@/providers/toast-provider";
import { sendAssistantMessage } from "@/services/ai-assistant.service";

export function useSendAssistantMessageMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (message: string) => sendAssistantMessage(message),
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Couldn't reach the assistant. Please try again.",
      );
    },
  });
}
