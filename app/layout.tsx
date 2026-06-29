import { JsonLd } from "@/components/JsonLd";
import { MetrikaTracker } from "@/components/MetrikaTracker";
import { YandexMetrika } from "@/components/YandexMetrika";
import { buildRootMetadata } from "@/lib/seo/metadata";
import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";
import "./fonts.css";
import "./globals.css";

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSchema = toJsonLdGraph(
    buildOrganizationSchema(),
    buildLocalBusinessSchema(),
    buildWebSiteSchema()
  );

  return (
    <html lang="ru">
      <body>
        <YandexMetrika />
        <MetrikaTracker />
        <JsonLd data={globalSchema} />
        {children}
      </body>
    </html>
  );
}
