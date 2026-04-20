import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Сімейний гаманець",
  description: "Сімейний бюджет — доходи, витрати, цілі накопичень",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ overflowX: "hidden", maxWidth: "100vw" }}>{children}</body>
    </html>
  );
}
