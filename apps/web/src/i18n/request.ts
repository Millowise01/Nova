import { getRequestConfig } from "next-intl/server";

const locales = ["en", "fr", "ar"] as const;

type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = "en";
  }

  const messagesModule = (await import(`../messages/${locale}.json`)) as {
    default: Record<string, string>;
  };

  return {
    locale,
    messages: messagesModule.default,
  };
});
