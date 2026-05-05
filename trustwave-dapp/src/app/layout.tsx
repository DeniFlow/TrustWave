import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white">

        <WalletProvider>
          <Header />
          {children}
        </WalletProvider>

      </body>
    </html>
  );
}