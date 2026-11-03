import "./globals.css";
import { BorrowingProvider } from "@/components/BorrowingProvider";
import SessionGate from "@/components/SessionGate";

export const metadata = {
  title: "LibraSpace — Perpustakaan Digital",
  description: "Temukan dan jelajahi koleksi buku di LibraSpace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <BorrowingProvider>
          <SessionGate>{children}</SessionGate>
        </BorrowingProvider>
      </body>
    </html>
  );
}
