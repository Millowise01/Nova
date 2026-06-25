declare module "next" {
  const nextConfig: any;
  export default nextConfig;
  export type Metadata = any;
  export type Viewport = any;
}

declare module "next/server" {
  export const NextResponse: any;
  export type NextRequest = any;
}

declare module "next/navigation" {
  export const notFound: () => never;
}

declare module "next/link" {
  const Link: any;
  export default Link;
}

declare module "next/image" {
  const Image: any;
  export default Image;
}
