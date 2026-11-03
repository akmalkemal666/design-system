"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { books } from "@/data/books";
import BookCard from "./BookCard";
import BookModal from "./BookModal";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LibraryCatalog from "./LibraryCatalog";
import Container from "./ui/Container";
import { useBorrowings } from "./BorrowingProvider";
import dashboardStyles from "./LibraryDashboard.module.css";
import styles from "./LibraryWorkspace.module.css";

const pageTitles = {
  catalog: "Katalog Buku",
  myBooks: "Buku Saya",
  history: "Riwayat",
  settings: "Pengaturan",
};

function SettingsPanel() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { profileName, profilePhone, reminders: savedReminders, updateProfile } = useBorrowings();
  const [reminders, setReminders] = useState(savedReminders);
  const [name, setName] = useState(profileName);
  const [phone, setPhone] = useState(profilePhone);

  useEffect(() => {
    setName(profileName);
    setPhone(profilePhone);
    setReminders(savedReminders);
  }, [profileName, profilePhone, savedReminders]);

  function saveSettings(event) {
    event.preventDefault();
    const digitCount = phone.replace(/\D/g, "").length;
    if (digitCount < 8 || digitCount > 15) {
      setSaved(false);
      setError("Masukkan nomor HP yang valid (8–15 digit).");
      return;
    }

    if (!updateProfile({ name, phone, nextReminders: reminders })) {
      setSaved(false);
      setError("Pengaturan gagal disimpan ke akun ini.");
      return;
    }
    setError("");
    setSaved(true);
  }

  return (
    <form className={styles["settings"]} onSubmit={saveSettings}>
      <label className={styles["field"]}>
        <span>Nama tampilan</span>
        <input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} required maxLength={60} />
      </label>
      <label className={styles["field"]}>
        <span>Nomor HP</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => { setPhone(event.target.value); setSaved(false); }}
          autoComplete="tel"
          maxLength={20}
          required
        />
      </label>
      <div className={styles["field"]}>
        <span>Status keanggotaan</span>
        <div className={styles["field__read-only"]}>Mahasiswa</div>
      </div>
      <label className={styles["toggle"]}>
        <span><strong>Pengingat peminjaman</strong><small>Ingatkan saya saat mendekati batas waktu pengembalian.</small></span>
        <input
          type="checkbox"
          checked={reminders}
          onChange={(event) => { setReminders(event.target.checked); setSaved(false); }}
        />
      </label>
      <div className={styles["settings__actions"]}>
        {error && <p className={styles["message--error"]} role="alert">{error}</p>}
        {saved && <p className={styles["message--success"]} role="status"><Check size={15} /> Pengaturan berhasil disimpan.</p>}
        <button className={styles["save-button"]} type="submit">Simpan pengaturan</button>
      </div>
    </form>
  );
}

export default function LibraryWorkspace({ page }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { borrowings, returnBorrowing, persistenceError } = useBorrowings();
  const [returnMessage, setReturnMessage] = useState("");
  const borrowingByBookId = new Map(borrowings.map((borrowing) => [borrowing.bookId, borrowing]));
  const borrowedBooks = books
    .filter((book) => borrowings.some(
      (borrowing) => borrowing.bookId === book.id && borrowing.status !== "returned",
    ))
    .map((book) => ({
      ...book,
      status: "Dipinjam",
      borrowing: borrowingByBookId.get(book.id),
    }));
  const borrowingHistory = borrowings
    .filter((borrowing) => borrowing.status === "returned")
    .map((borrowing) => ({
      ...borrowing,
      book: books.find((book) => book.id === borrowing.bookId),
    }))
    .filter((borrowing) => borrowing.book);

  function formatDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function confirmReturn(book) {
    const returned = returnBorrowing(book.id);
    if (returned) {
      setReturnMessage(`“${book.title}” telah dikonfirmasi dikembalikan dan masuk ke riwayat.`);
    }
  }

  return (
    <div className={styles["workspace"]}>
      <Sidebar mobileNavOpen={mobileNavOpen} />
      <main className={styles["workspace__main"]}>
        <Header
          title={pageTitles[page]}
          mobileMenuOpen={mobileNavOpen}
          onMenuClick={() => setMobileNavOpen((open) => !open)}
        />
        <Container className={styles["workspace__content"]}>
          {page === "catalog" && <LibraryCatalog />}

          {page === "myBooks" && (
            <>
              <div className={dashboardStyles["catalog__heading"]}>
                <div>
                  <span className={dashboardStyles["catalog__eyebrow"]}>KOLEKSI PRIBADI</span>
                  <h2>Sedang Dipinjam</h2>
                  <p>{borrowedBooks.length} buku yang sedang kamu pinjam.</p>
                </div>
              </div>
              {returnMessage && <p className={styles["return-message"]} role="status">{returnMessage}</p>}
              {persistenceError && <p className={styles["return-error"]} role="alert">{persistenceError}</p>}
              {borrowedBooks.length ? (
                <div className={dashboardStyles["catalog__grid"]}>
                  {borrowedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onDetail={setSelectedBook}
                      onReturn={confirmReturn}
                    />
                  ))}
                </div>
              ) : (
                <div className={dashboardStyles["catalog__empty"]}>
                  Belum ada buku yang dipinjam. <Link href="/katalog">Jelajahi katalog <ArrowRight size={14} /></Link>
                </div>
              )}
            </>
          )}

          {page === "history" && (
            <section>
              <div className={dashboardStyles["catalog__heading"]}>
                <div>
                  <span className={dashboardStyles["catalog__eyebrow"]}>AKTIVITAS ANDA</span>
                  <h2>Riwayat Pengembalian</h2>
                  <p>Daftar buku yang sudah dikonfirmasi dikembalikan.</p>
                </div>
              </div>
              <div className={dashboardStyles["catalog__empty"]}>
                {borrowingHistory.length === 0 ? (
                  <>Belum ada buku yang dikembalikan. <Link href="/katalog">Temukan buku <ArrowRight size={14} /></Link></>
                ) : (
                  <div className={styles["history"]}>
                    {borrowingHistory.map((borrowing) => (
                      <article key={borrowing.id} className={styles["history__item"]}>
                        <div>
                          <h3>{borrowing.book.title}</h3>
                          <p>{borrowing.book.author}</p>
                        </div>
                        <p>
                          {borrowing.loanDate ? (
                            <>
                              <time dateTime={borrowing.loanDate}>{formatDate(borrowing.loanDate)}</time>
                              {" — "}
                              <time dateTime={borrowing.returnDate}>{formatDate(borrowing.returnDate)}</time>
                            </>
                          ) : (
                            <>Tanggal peminjaman tidak tercatat</>
                          )}
                          {borrowing.status === "returned" && borrowing.returnedAt && (
                            <span className={styles["history__returned"]}>
                              Dikembalikan {formatDate(borrowing.returnedAt)}
                            </span>
                          )}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {page === "settings" && (
            <section>
              <div className={dashboardStyles["catalog__heading"]}>
                <div>
                  <span className={dashboardStyles["catalog__eyebrow"]}>PREFERENSI AKUN</span>
                  <h2>Pengaturan</h2>
                  <p>Atur informasi profil dan preferensi pemberitahuan.</p>
                </div>
              </div>
              <SettingsPanel />
            </section>
          )}

          <footer className={dashboardStyles["footer"]}>© 2026 LibraSpace. Mini project Perpustakaan Digital.</footer>
        </Container>
      </main>
      <BookModal key={selectedBook?.id ?? "closed"} book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
}
