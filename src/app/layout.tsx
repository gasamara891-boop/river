import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import ClientProviders from "@/components/ClientProviders/ClientProviders";
import ConditionalLayout from "@/components/Layout/ConditionalLayout";
import SimulatedAlertBubble from "@/components/SimulatedAlertBubble";
import BackToTop from "@/components/BackToTop";
import Preloader from "@/components/Preloader";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "River - Crypto Trading & Investments",
  description: "River — Crypto trading and investments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-darkmode text-white overflow-x-hidden`}>
        <Preloader />
        {/* ConditionalLayout will render Header/Footer except on routes we hide (e.g., /profile) */}
        <ConditionalLayout>
          <ClientProviders>{children}</ClientProviders>
        </ConditionalLayout>

        <BackToTop />
        {/* Google Translate Widget */}
        <div id="google_translate_element" style={{ position: "fixed", width:"100px",  bottom: "15px", left: "0", zIndex: 9999 }} />

        <SimulatedAlertBubble />

        {/* ✅ Add Google Translate Script */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          id="google-translate-widget"
          strategy="afterInteractive"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />

        {/* ✅ Add Tawk.to Live Chat  */}
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/692dc91dbb2f8419802dbb67/1jbddj7mb';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}