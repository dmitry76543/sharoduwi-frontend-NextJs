import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ШАРОДУВЫ — гелиевые шары и композиции в Жуковском",
  description:
    "ШАРОДУВЫ — гелиевые шары, фольгированные цифры и праздничные композиции в Жуковском и Раменском районе. Делаем праздник с 2005 года.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
