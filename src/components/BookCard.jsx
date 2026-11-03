import { BookOpen, CalendarPlus, Check, UserRound } from "lucide-react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import styles from "./BookCard.module.css";

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BookCard({ book, onDetail, onBorrow, onReturn }) {
  const isAvailable = book.status === "Tersedia";
  return (
    <Card className={styles["book-card"]}>
      <div className={styles["book-card__cover-wrap"]}>
        <img className={styles["book-card__cover"]} src={book.cover} alt={`Sampul buku ${book.title}`} />
        <span className={styles["book-card__category"]}>{book.category}</span>
      </div>
      <div className={styles["book-card__body"]}>
        <div className={styles["book-card__meta"]}><span>{book.year}</span><Badge variant={isAvailable ? "success" : "warning"}>{book.status}</Badge></div>
        <h3 className={styles["book-card__title"]}>{book.title}</h3>
        <p className={styles["book-card__author"]}><UserRound size={13} /> {book.author}</p>
        {book.borrowing && (
          <p className={styles["book-card__loan-dates"]}>
            Pinjam {formatDate(book.borrowing.loanDate)} · Kembali {formatDate(book.borrowing.returnDate)}
          </p>
        )}
        <div className={styles["book-card__actions"]}>
          <Button variant="secondary" size="small" onClick={() => onDetail(book)}><BookOpen size={14} /> Detail</Button>
          {isAvailable && (
            <Button size="small" onClick={() => onBorrow(book)}><CalendarPlus size={14} /> Pinjam</Button>
          )}
          {!isAvailable && onReturn && (
            <Button size="small" onClick={() => onReturn(book)}><Check size={14} /> Konfirmasi Pengembalian</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
