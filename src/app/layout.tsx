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

        {/* ConditionalLayout shows/hides header/footer depending on page */}
        <ConditionalLayout>
          <ClientProviders>{children}</ClientProviders>
        </ConditionalLayout>

        <BackToTop />

        {/* 🌍 Custom Google Translate Toggle Button */}
        <div id="google_translate_wrapper">
          <button id="translateBtn">🌐 Translate</button>
          <div id="google_translate_element" />
        </div>

        <SimulatedAlertBubble />

        {/* 🌍 Google Translate initialization */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,fr,es,de,hi,zh-CN,ar,pt,ru,sw,yo,ig,ha',
                autoDisplay: false
              }, 'google_translate_element');
            }

            function hideGoogleJunk() {
              const interval = setInterval(() => {
                document.querySelector('.goog-logo-link')?.remove();
                document.querySelector('.goog-te-gadget')?.style.setProperty('font-size', '0');
                const frame = document.querySelector('iframe.goog-te-menu-frame');
                if (frame) {
                  frame.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
                  clearInterval(interval);
                }
              }, 300);
            }

            document.addEventListener("DOMContentLoaded", hideGoogleJunk);

            // Toggle Translate Dropdown
            document.addEventListener("click", (e) => {
              if (e.target.id === 'translateBtn') {
                document.getElementById('google_translate_element').classList.toggle('show');
              } else {
                document.getElementById('google_translate_element').classList.remove('show');
              }
            });
          `}
        </Script>

        {/* Google Translate Source Script */}
        <Script
          id="google-translate-widget"
          strategy="afterInteractive"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />

        {/* 💬 Tawk.to Live Chat */}
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
