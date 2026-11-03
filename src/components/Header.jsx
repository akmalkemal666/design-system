"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { books } from "@/data/books";
import { useBorrowings } from "./BorrowingProvider";
import styles from "./Header.module.css";

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function Header({ title = "Dashboard", onMenuClick, mobileMenuOpen = false }) {
  const { borrowings, profileName, profilePhone, isSignedIn, signIn, signOut, persistenceError } = useBorrowings();
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState(null);
  const actionsRef = useRef(null);
  const displayName = isSignedIn ? profileName : "Tamu";
  const avatar = displayName.trim().charAt(0).toUpperCase() || "A";

  const notifications = useMemo(() => borrowings.flatMap((borrowing) => {
    const book = books.find((item) => item.id === borrowing.bookId);
    if (!book) return [];

    if (borrowing.status === "returned") {
      return [{
        id: borrowing.id,
        href: "/riwayat",
        title: "Buku telah dikembalikan",
        description: `${book.title}${borrowing.returnedAt ? ` · ${formatDate(borrowing.returnedAt)}` : ""}`,
      }];
    }

    const dueDate = borrowing.returnDate;
    const message = !dueDate
      ? "Buku sedang dipinjam"
      : dueDate < getToday()
        ? `Terlambat dikembalikan · ${formatDate(dueDate)}`
        : dueDate === getToday()
          ? "Batas pengembalian hari ini"
          : `Batas pengembalian · ${formatDate(dueDate)}`;

    return [{
      id: borrowing.id,
      href: "/buku-saya",
      title: message,
      description: book.title,
    }];
  }), [borrowings]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) setOpenPanel(null);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpenPanel(null);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function handleSignOut() {
    if (signOut()) {
      setOpenPanel(null);
      router.replace("/");
    }
  }

  function handleSignIn() {
    if (signIn()) setOpenPanel(null);
  }

  return (
    <header className={styles["header"]}>
      <button
        className={styles["header__menu"]}
        type="button"
        aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={mobileMenuOpen}
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>
      <div className={styles["header__breadcrumb"]}>Halaman <span>/</span> <strong>{title}</strong></div>
      <div className={styles["header__actions"]} ref={actionsRef}>
        <div className={styles["header__popover-wrap"]}>
          <button
            className={styles["header__notification"]}
            type="button"
            aria-label={`Notifikasi${notifications.length ? ` (${notifications.length})` : ""}`}
            aria-expanded={openPanel === "notifications"}
            aria-controls="header-notifications"
            onClick={() => setOpenPanel((current) => current === "notifications" ? null : "notifications")}
          >
            <Bell size={18} />
            {notifications.length > 0 && <i />}
          </button>
          {openPanel === "notifications" && (
            <section className={`${styles["header__popover"]} ${styles["header__popover--notifications"]}`} id="header-notifications" aria-label="Notifikasi peminjaman">
              <div className={styles["header__popover-heading"]}>
                <strong>Notifikasi</strong>
                <span>{notifications.length}</span>
              </div>
              {notifications.length ? (
                <ul className={styles["header__notification-list"]}>
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <Link href={notification.href} onClick={() => setOpenPanel(null)}>
                        <strong>{notification.title}</strong>
                        <span>{notification.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles["header__empty"]}>Belum ada notifikasi peminjaman.</p>
              )}
            </section>
          )}
        </div>

        <div className={styles["header__popover-wrap"]}>
          <button
            className={styles["header__profile"]}
            type="button"
            aria-label={`Detail akun: ${displayName}`}
            aria-expanded={openPanel === "profile"}
            aria-controls="header-profile"
            onClick={() => setOpenPanel((current) => current === "profile" ? null : "profile")}
          >
            <span className={styles["header__avatar"]}>{avatar}</span>
            <span className={styles["header__profile-copy"]}>
              <strong>{displayName}</strong>
              <span>{isSignedIn ? "Mahasiswa" : "Tidak masuk"}</span>
            </span>
            <ChevronDown size={15} />
          </button>
          {openPanel === "profile" && (
            <section className={`${styles["header__popover"]} ${styles["header__popover--profile"]}`} id="header-profile" aria-label="Detail akun">
              <div className={styles["header__account"]}>
                <span className={styles["header__account-icon"]}><UserRound size={18} /></span>
                <span>
                  <strong>{isSignedIn ? profileName : "Sesi demo berakhir"}</strong>
                  <small>
                    {isSignedIn
                      ? profilePhone ? `Mahasiswa · ${profilePhone}` : "Mahasiswa · Anggota LibraSpace"
                      : `Profil tersimpan: ${profileName}`}
                  </small>
                </span>
              </div>
              <p className={styles["header__account-note"]}>
                Mode demo. Data peminjaman dan riwayat tetap tersimpan di browser ini.
              </p>
              {isSignedIn ? (
                <>
                  <Link className={styles["header__account-link"]} href="/pengaturan" onClick={() => setOpenPanel(null)}>
                    Pengaturan akun
                  </Link>
                  <button className={styles["header__signout"]} type="button" onClick={handleSignOut}>
                    <LogOut size={15} /> Keluar dari akun
                  </button>
                </>
              ) : (
                <button className={styles["header__signin"]} type="button" onClick={handleSignIn}>
                  Masuk kembali sebagai {profileName}
                </button>
              )}
              {persistenceError && <p className={styles["header__error"]} role="alert">{persistenceError}</p>}
            </section>
          )}
        </div>
      </div>
    </header>
  );
}
