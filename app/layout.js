import { AuthProvider } from "@/context/AuthContext";
import { Public_Sans } from "next/font/google";
import StyledComponentsRegistry from "@/lib/AntRegistry";
import "./globals.css";
import "@/styles/typography.css";
import QueryProvider from "@/lib/QueryProvider";
import OnlineStatusManager from "@/components/OnlineStatusManager";
import { LanguageProvider } from "@/lib/i18n";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
export const metadata = {
  title: "YDestiny - Compatibilitate Astrologică",
  description: "Descoperă conexiuni autentice bazate pe compatibilitatea astrologică. Găsește-ți perechea perfectă prin intermediul astrelor!",
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
          <body className={publicSans.className}>
            <QueryProvider>
              <StyledComponentsRegistry>
                <OnlineStatusManager>
                  {children}
                </OnlineStatusManager>
              </StyledComponentsRegistry>
            </QueryProvider>
          </body>
        </html>
      </LanguageProvider>
    </AuthProvider>
  );
}
