"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatCard from "./StatCard";
import LibraryCatalog from "./LibraryCatalog";
import Container from "./ui/Container";
import Button from "./ui/Button";
import styles from "./LibraryDashboard.module.css";

export default function LibraryDashboard() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={styles["dashboard"]}>
      <Sidebar mobileNavOpen={mobileNavOpen} />
      <main className={styles["dashboard__main"]}>
        <Header mobileMenuOpen={mobileNavOpen} onMenuClick={() => setMobileNavOpen((open) => !open)} />
        <Container className={styles["dashboard__content"]}>
          <section className={styles["welcome"]}>
            <div className={styles["welcome__copy"]}>
              <span className={styles["welcome__eyebrow"]}><Sparkles size={13} /> PERPUSTAKAAN DIGITAL</span>
              <h1>Temukan inspirasi<br />di setiap <span>halaman.</span></h1>
              <p>Jelajahi koleksi buku pilihan dan temukan bacaan yang sesuai dengan minatmu.</p>
              <a href="#katalog"><Button>Jelajahi Katalog <ArrowRight size={16} /></Button></a>
            </div>
            <div className={styles["welcome__art"]} aria-hidden="true">
              <div className={styles["welcome__circle"]} />
              <div className={`${styles["welcome__book"]} ${styles["welcome__book--one"]}`}>
              READ<br />MORE</div>
              <div className={`${styles["welcome__book"]} ${styles["welcome__book--two"]}`}>
              YOUR<br />NEXT<br />CHAPTER
              </div>
              <div className={`${styles["welcome__book"]} ${styles["welcome__book--three"]}`}>
              IDEAS<br />LIVE HERE</div>   
            </div>
          </section>

          <section className={styles["stats"]} aria-label="Statistik perpustakaan">
            <StatCard type="books" label="Total Koleksi Buku" value="250" note="Koleksi terdaftar" />
            <StatCard type="available" label="Buku Tersedia" value="180" note="Siap untuk dipinjam" />
            <StatCard type="borrowed" label="Sedang Dipinjam" value="70" note="Dalam masa peminjaman" />
            <StatCard type="members" label="Anggota Aktif" value="124" note="Pengguna terdaftar" />
          </section>

          <LibraryCatalog />
          <footer className={styles["footer"]} id="footer">© 2026 LibraSpace. Mini project Perpustakaan Digital.</footer>
        </Container>
      </main>
    </div>
  );
}
