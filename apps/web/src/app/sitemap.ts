import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nova.example.com";

const routes = [
  "",
  "/categories",
  "/search",
  "/deals",
  "/auth/login",
  "/auth/register",
  "/cart",
  "/checkout",
  "/account",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
  }));
}
