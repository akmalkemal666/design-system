"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Bookmark, History, Settings, Library } from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Katalog Buku", icon: BookOpen, href: "/katalog" },
  { label: "Buku Saya", icon: Bookmark, href: "/buku-saya" },
  { label: "Riwayat", icon: History, href: "/riwayat" },
];

export default function Sidebar({ mobileNavOpen = false }) {
  const pathname = usePathname();

  return (
    <aside className={styles["sidebar"]}>
      <Link className={styles["sidebar__brand"]} href="/" aria-label="PojokBaca beranda">
        <span className={styles["sidebar__logo"]}><Library size={21} /></span>
        <span>Pojok<span>Baca</span></span>
      </Link>
      <div className={styles["sidebar__label"]}>MENU UTAMA</div>
      <nav
        className={`${styles["sidebar__nav"]} ${mobileNavOpen ? styles["sidebar__nav--open"] : ""}`}
        aria-label="Navigasi utama"
      >
        {navItems.map(({ label, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`${styles["sidebar__link"]} ${pathname === href ? styles["sidebar__link--active"] : ""}`}
          >
            <Icon size={18} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className={`${styles["sidebar__bottom"]} ${mobileNavOpen ? styles["sidebar__bottom--open"] : ""}`}>
        <Link
          href="/pengaturan"
          aria-current={pathname === "/pengaturan" ? "page" : undefined}
          className={`${styles["sidebar__link"]} ${pathname === "/pengaturan" ? styles["sidebar__link--active"] : ""}`}
        >
          <Settings size={18} /><span>Pengaturan</span>
        </Link>
        <div className={styles["sidebar__help"]}>
          <div className={styles["sidebar__help-icon"]}><BookOpen size={18} /></div>
          <strong>Butuh bantuan?</strong>
          <p>Hubungi pengelola perpustakaan.</p>
          <a href="mailto:perpustakaan@example.com">Hubungi kami</a>
        </div>
      </div>
    </aside>
  );
}
