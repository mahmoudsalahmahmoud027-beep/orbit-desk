import type { Metadata } from "next";
import { headers } from "next/headers";
import OrbitApp from "../src/OrbitApp";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "Orbit Desk";
  const description = "A calm, local-first productivity workspace.";
  return { title: { absolute: title }, description, openGraph: { title, description, type: "website", images: [{ url: image, width: 1728, height: 909, alt: "Orbit Desk productivity workspace" }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default function Home() { return <OrbitApp />; }
