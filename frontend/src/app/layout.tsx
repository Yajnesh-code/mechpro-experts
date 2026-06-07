import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MechPro Experts | End-to-End Car Management & Claim Solutions",
  description:
    "Premium B2B2C automotive service, claims, inspection, and workshop-led support for enterprise clients.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
