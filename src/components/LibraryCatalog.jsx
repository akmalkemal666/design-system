"use client";

import { useMemo, useState } from "react";
import { books, categories } from "@/data/books";
import BookCard from "./BookCard";
import BookModal from "./BookModal";
import Input from "./ui/Input";
import { useBorrowings } from "./BorrowingProvider";
import styles from "./LibraryDashboard.module.css";

export default function LibraryCatalog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalMode, setModalMode] = useState("detail");
  const { borrowings } = useBorrowings();

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();

    return books.map((book) => {
      const isActivelyBorrowed = borrowings.some(
        (borrowing) => borrowing.bookId === book.id && borrowing.status !== "returned",
      );
      return { ...book, status: isActivelyBorrowed ? "Dipinjam" : "Tersedia" };
    }).filter((book) => {
      const matchesCategory = activeCategory === "Semua" || book.category === activeCategory;
      const matchesSearch = book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, borrowings]);

  function openBook(book, mode) {
    setSelectedBook(book);
    setModalMode(mode);
  }

  return (
    <>
      <section className={styles["catalog"]} id="katalog">
        <div className={styles["catalog__heading"]}>
          <div><span className={styles["catalog__eyebrow"]}>KOLEKSI PILIHAN</span><h2>Jelajahi Katalog Buku</h2><p>Pilih buku yang ingin kamu baca.</p></div>
          <span className={styles["catalog__count"]}>{filteredBooks.length} buku ditemukan</span>
        </div>
        <div className={styles["catalog__tools"]}>
          <div className={styles["catalog__search"]}><Input value={search} onChange={setSearch} /></div>
          <div className={styles["catalog__filters"]} aria-label="Filter kategori">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`${styles["catalog__filter"]} ${activeCategory === category ? styles["catalog__filter--active"] : ""}`}
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        {filteredBooks.length > 0 ? (
          <div className={styles["catalog__grid"]}>
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onDetail={(selected) => openBook(selected, "detail")}
                onBorrow={(selected) => openBook(selected, "borrow")}
              />
            ))}
          </div>
        ) : (
          <div className={styles["catalog__empty"]}>Buku tidak ditemukan. Coba kata kunci atau kategori lain.</div>
        )}
      </section>
      <BookModal key={selectedBook?.id ?? "closed"} book={selectedBook} mode={modalMode} onClose={() => setSelectedBook(null)} />
    </>
  );
}
