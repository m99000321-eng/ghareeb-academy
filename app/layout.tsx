import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site/SiteChrome";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ghareeb-academy.vercel.app",
  ),
  title: {
    default: "الغريب | GHAREEB — معدات قتالية من عالم آخر",
    template: "%s | الغريب",
  },
  description:
    "الغريب — متجر معدات القتال من بُعد آخر. قفازات وأدوات كيك بوكس، بوكس، كونغ فو، وإم إم إيه بتجربة ثلاثية الأبعاد.",
  keywords: [
    "كيك بوكس",
    "بوكس",
    "كونغ فو",
    "mma",
    "قفازات ملاكمة",
    "معدات قتالية",
    "الغريب",
    "GHAREEB",
  ],
  openGraph: {
    title: "الغريب | GHAREEB — معدات قتالية من عالم آخر",
    description:
      "قفازات وأدوات كيك بوكس، بوكس، كونغ فو، وإم إم إيه في تجربة ثلاثية الأبعاد من بُعد آخر.",
    locale: "ar_SA",
    type: "website",
    siteName: "الغريب | GHAREEB",
  },
  twitter: {
    card: "summary_large_image",
    title: "الغريب | GHAREEB",
    description: "معدات قتالية من عالم آخر — كيك بوكس، بوكس، كونغ فو، إم إم إيه.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05050b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="min-h-screen bg-ink font-body text-[#f5f5f7] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-acid focus:px-5 focus:py-2 focus:text-ink"
        >
          تخطَّ إلى المحتوى
        </a>
        <SiteChrome>
          <main id="main">{children}</main>
        </SiteChrome>
      </body>
    </html>
  );
}
