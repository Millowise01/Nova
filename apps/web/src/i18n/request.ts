import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  // Retrieve the requested locale, resolving it if it is a Promise
  let locale = await requestLocale;

  // Validate locale or fall back to default
  const locales = ["en", "fr", "ar"];
  if (!locale || !locales.includes(locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
