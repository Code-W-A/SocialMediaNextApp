import { AuthProvider } from "@/context/AuthContext";
import { Public_Sans } from "next/font/google";
import StyledComponentsRegistry from "@/lib/AntRegistry";
import "./globals.css";
import "@/styles/typography.css";
import QueryProvider from "@/lib/QueryProvider";
import OnlineStatusManager from "@/components/OnlineStatusManager";
import { LanguageProvider } from "@/lib/i18n";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAServiceWorker from "@/components/PWAServiceWorker";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "YDestiny - Compatibilitate Astrologică",
  description: "Descoperă conexiuni autentice bazate pe compatibilitatea astrologică. Găsește-ți perechea perfectă prin intermediul astrelor!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YDestiny",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/images/sigla-512.png",
    apple: [
      { url: "/images/sigla-512.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "YDestiny",
    "application-name": "YDestiny",
    "msapplication-TileColor": "#667eea",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#667eea",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <html lang="ro">
          <head>
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/images/sigla-512.png" />
            <link rel="apple-touch-icon" href="/images/sigla-512.png" />
            <meta name="theme-color" content="#667eea" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="YDestiny" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="application-name" content="YDestiny" />
            <meta name="msapplication-TileColor" content="#667eea" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
          </head>
          <body className={publicSans.className}>
            <PWAServiceWorker />
            <QueryProvider>
              <StyledComponentsRegistry>
                <OnlineStatusManager>
                  {children}
                  <PWAInstallPrompt />
                </OnlineStatusManager>
              </StyledComponentsRegistry>
            </QueryProvider>
          </body>
        </html>
      </LanguageProvider>
    </AuthProvider>
  );
}
