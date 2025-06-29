import { AuthProvider } from "@/context/AuthContext";
import { Public_Sans } from "next/font/google";
import StyledComponentsRegistry from "@/lib/AntRegistry";
import "./globals.css";
import "@/styles/typography.css";
import QueryProvider from "@/lib/QueryProvider";
import OnlineStatusManager from "@/components/OnlineStatusManager";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "react-hot-toast";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Script from "next/script";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Destiny - Social Media App",
  description: "Găsește-ți jumătatea perfectă cu cea mai avansată aplicație de dating și social media",
  manifest: "/manifest.json",
  themeColor: "#667eea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Destiny",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Destiny",
    title: "Destiny - Social Media App",
    description: "Găsește-ți jumătatea perfectă cu cea mai avansată aplicație de dating și social media",
  },
  twitter: {
    card: "summary",
    title: "Destiny - Social Media App",
    description: "Găsește-ți jumătatea perfectă cu cea mai avansată aplicație de dating și social media",
  },
  icons: {
    icon: "/images/destiny-logo.svg",
    shortcut: "/images/destiny-logo.svg",
    apple: "/images/logo.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <html lang="ro">
          <head>
            {/* PWA Meta Tags */}
            <meta name="application-name" content="Destiny" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Destiny" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
            <meta name="msapplication-TileColor" content="#667eea" />
            
            {/* Apple Touch Icons */}
            <link rel="apple-touch-icon" href="/images/logo.png" />
            <link rel="apple-touch-icon" sizes="152x152" href="/images/logo.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.png" />
            <link rel="apple-touch-icon" sizes="167x167" href="/images/logo.png" />
            
            {/* Manifest */}
            <link rel="manifest" href="/manifest.json" />
            
            {/* Theme Color */}
            <meta name="theme-color" content="#667eea" />
            <meta name="msapplication-navbutton-color" content="#667eea" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          </head>
          <body className={publicSans.className}>
            <QueryProvider>
              <StyledComponentsRegistry>
                <OnlineStatusManager>
                  {children}
                  <PWAInstallPrompt />
                </OnlineStatusManager>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#10b981',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      },
                    },
                  }}
                />
              </StyledComponentsRegistry>
            </QueryProvider>
            
            {/* Service Worker Registration */}
            <Script id="sw-register" strategy="afterInteractive">
              {`
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `}
            </Script>
          </body>
        </html>
      </LanguageProvider>
    </AuthProvider>
  );
}
