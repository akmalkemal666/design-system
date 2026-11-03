import { useState } from "react";
import Link from "next/link";
import { X, UserRound, CalendarDays, BookOpen, CalendarPlus, Check } from "lucide-react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { useBorrowings } from "./BorrowingProvider";
import styles from "./BookModal.module.css";

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value, days) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export default function BookModal({ book, onClose, mode = "detail" }) {
  const today = localDateString(new Date());
  const [loanDate, setLoanDate] = useState(today);
  const [returnDate, setReturnDate] = useState(() => addDays(today, 1));
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeMode, setActiveMode] = useState(mode);
  const { addBorrowing, persistenceError, ready } = useBorrowings();

  if (!book) return null;
  const available = book.status === "Tersedia";

  function submitBorrowing(event) {
    event.preventDefault();
    if (returnDate <= loanDate) {
      setFormError("Tanggal pengembalian harus setelah tanggal peminjaman.");
      return;
    }

    const saved = addBorrowing({ bookId: book.id, loanDate, returnDate });
    if (saved) {
      setFormError("");
      setSubmitted(true);
    } else {
      setFormError(persistenceError || "Peminjaman belum dapat diproses. Coba lagi sebentar.");
    }
  }

  return (
    <div className={styles["book-modal"]} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles["book-modal__panel"]} role="dialog" aria-modal="true" aria-labelledby="book-modal-title">
        <button className={styles["book-modal__close"]} onClick={onClose} aria-label="Tutup"><X size={19} /></button>
        <img className={styles["book-modal__cover"]} src={book.cover} alt={`Sampul ${book.title}`} />
        <div className={styles["book-modal__content"]}>
          <Badge variant={available ? "success" : "warning"}>{book.status}</Badge>
          <h2 id="book-modal-title">{book.title}</h2>
          <p className={styles["book-modal__detail"]}><UserRound size={15} /> {book.author}</p>
          <p className={styles["book-modal__detail"]}><CalendarDays size={15} /> Tahun {book.year}</p>
          <p className={styles["book-modal__description"]}>{book.description}</p>
          {submitted ? (
            <div className={styles["book-modal__success"]} role="status">
              <p><Check size={16} /> Peminjaman berhasil dicatat untuk {loanDate} sampai {returnDate}.</p>
              <Link href="/buku-saya" onClick={onClose}>Lihat Buku Saya</Link>
            </div>
          ) : activeMode === "borrow" && available ? (
            <form className={styles["book-modal__form"]} onSubmit={submitBorrowing}>
              <label>
                <span>Tanggal peminjaman</span>
                <input
                  type="date"
                  value={loanDate}
                  min={today}
                  required
                  onChange={(event) => {
                    const nextLoanDate = event.target.value;
                    setLoanDate(nextLoanDate);
                    if (returnDate <= nextLoanDate) setReturnDate(addDays(nextLoanDate, 1));
                    setFormError("");
                  }}
                />
              </label>
              <label>
                <span>Tanggal pengembalian</span>
                <input
                  type="date"
                  value={returnDate}
                  min={addDays(loanDate, 1)}
                  required
                  onChange={(event) => { setReturnDate(event.target.value); setFormError(""); }}
                />
              </label>
              {formError && <p className={styles["book-modal__error"]} role="alert">{formError}</p>}
              <Button type="submit" disabled={!ready}>
                <CalendarPlus size={15} /> {ready ? "Konfirmasi Peminjaman" : "Memuat data peminjaman..."}
              </Button>
            </form>
          ) : (
            <div className={styles["book-modal__actions"]}>
              {available && (
                <Button onClick={() => setActiveMode("borrow")}>
                  <CalendarPlus size={15} /> Pinjam buku ini
                </Button>
              )}
              <Button variant="secondary" onClick={onClose}><BookOpen size={15} /> Mengerti</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
