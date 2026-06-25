import { useUiStore } from "@/store/ui-store";
import { messages } from "@/i18n/messages";

export function useTranslation() {
  const locale = useUiStore((s) => s.locale);
  return (key: keyof typeof messages["en"]): string => messages[locale]?.[key] ?? messages.en[key];
}
