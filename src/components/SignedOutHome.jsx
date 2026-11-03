"use client";

import { useState } from "react";
import { Library, LogIn, UserPlus } from "lucide-react";
import styles from "./SignedOutHome.module.css";

export default function SignedOutHome({ profileName, profilePhone, onSignIn, onRegister, error }) {
  const [name, setName] = useState(profileName);
  const [phone, setPhone] = useState(profilePhone);
  const [formError, setFormError] = useState("");

  function submitRegistration(event) {
    event.preventDefault();
    const digitCount = phone.replace(/\D/g, "").length;

    if (digitCount < 8 || digitCount > 15) {
      setFormError("Masukkan nomor HP yang valid (8–15 digit).");
      return;
    }

    setFormError("");
    onRegister({ name, phone });
  }

  const hasSavedAccount = Boolean(profileName.trim() && profilePhone.trim());

  return (
    <main className={styles["home"]}>
      <a className={styles["brand"]} href="/" aria-label="LibraSpace">
        <span className={styles["brand__logo"]}><Library size={21} /></span>
        <span>Libra<span>Space</span></span>
      </a>
      <section className={styles["welcome"]}>
        <span className={styles["welcome__eyebrow"]}>PERPUSTAKAAN DIGITAL</span>
        <h1>Temukan inspirasi<br />di setiap halaman.</h1>
        <p>Jelajahi koleksi buku pilihan dan lanjutkan perjalanan membacamu bersama LibraSpace.</p>
        <form className={styles["registration"]} onSubmit={submitRegistration}>
          <h2>Buat akun</h2>
          <p>Masukkan nama dan nomor HP untuk mulai meminjam buku.</p>
          <label>
            <span>Nama</span>
            <input
              type="text"
              value={name}
              onChange={(event) => { setName(event.target.value); setFormError(""); }}
              autoComplete="name"
              maxLength={60}
              required
            />
          </label>
          <label>
            <span>Nomor HP</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => { setPhone(event.target.value); setFormError(""); }}
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              placeholder="Contoh: 081234567890"
              required
            />
          </label>
          {(formError || error) && <p className={styles["welcome__error"]} role="alert">{formError || error}</p>}
          <button className={styles["welcome__button"]} type="submit">
            <UserPlus size={16} /> Buat akun dan mulai membaca
          </button>
        </form>
        {hasSavedAccount && (
          <button className={styles["welcome__signin"]} type="button" onClick={onSignIn}>
            <LogIn size={15} /> Sudah punya akun? Masuk kembali sebagai {profileName}
          </button>
        )}
        <p className={styles["welcome__help"]}>
          Akun demo disimpan di browser ini dan hanya memerlukan nama serta nomor HP.
        </p>
      </section>
      <footer className={styles["footer"]}>© 2026 LibraSpace. Mini project Perpustakaan Digital.</footer>
    </main>
  );
}
