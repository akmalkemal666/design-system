"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { books } from "@/data/books";

const BORROWINGS_KEY = "libraspace-borrowings";
const SETTINGS_KEY = "libraspace-settings";
const SESSION_KEY = "libraspace-session";
const ACCOUNT_KEY_PREFIX = "libraspace-account-";
const BorrowingContext = createContext(null);

function isBorrowing(value) {
  return value
    && typeof value.id === "string"
    && Number.isInteger(value.bookId)
    && (value.status === undefined || value.status === "active" || value.status === "returned")
    && (typeof value.loanDate === "string" || value.loanDate === null)
    && (typeof value.returnDate === "string" || value.returnDate === null)
    && (value.status !== "returned" || typeof value.returnedAt === "string");
}

function parseBorrowings(value) {
  if (!Array.isArray(value) || !value.every(isBorrowing)) {
    throw new Error("Data peminjaman tidak valid.");
  }
  return value;
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

function accountKey(accountId) {
  return `${ACCOUNT_KEY_PREFIX}${accountId}`;
}

function isActive(borrowing) {
  return borrowing.status !== "returned";
}

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readAccount(accountId, legacySettings, legacyBorrowings) {
  const savedAccount = window.localStorage.getItem(accountKey(accountId));
  if (savedAccount) {
    const account = JSON.parse(savedAccount);
    if (!account || typeof account !== "object" || typeof account.name !== "string") {
      throw new Error("Data akun tidak valid.");
    }

    return {
      name: account.name,
      phone: typeof account.phone === "string" ? account.phone : "",
      reminders: typeof account.reminders === "boolean" ? account.reminders : true,
      borrowings: parseBorrowings(account.borrowings),
    };
  }

  const migratedAccount = {
    name: typeof legacySettings.name === "string" ? legacySettings.name : "",
    phone: typeof legacySettings.phone === "string" ? legacySettings.phone : "",
    reminders: typeof legacySettings.reminders === "boolean" ? legacySettings.reminders : true,
    borrowings: [
      ...legacyBorrowings,
      ...books
        .filter((book) => (
          book.status === "Dipinjam"
          && !legacyBorrowings.some((borrowing) => borrowing.bookId === book.id && isActive(borrowing))
        ))
        .map((book) => ({
          id: `legacy-${accountId}-${book.id}`,
          bookId: book.id,
          loanDate: null,
          returnDate: null,
          status: "active",
        })),
    ],
  };
  window.localStorage.setItem(accountKey(accountId), JSON.stringify(migratedAccount));
  return migratedAccount;
}

function writeSession(status, accountId) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ status, accountId }));
}

export function BorrowingProvider({ children }) {
  const [borrowings, setBorrowings] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [reminders, setReminders] = useState(true);
  const [accountId, setAccountId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [persistenceError, setPersistenceError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = window.localStorage.getItem(SETTINGS_KEY);
      const legacySettings = savedSettings ? JSON.parse(savedSettings) : {};
      if (!legacySettings || typeof legacySettings !== "object" || Array.isArray(legacySettings)) {
        throw new Error("Pengaturan akun tidak valid.");
      }

      const savedBorrowings = window.localStorage.getItem(BORROWINGS_KEY);
      const legacyBorrowings = savedBorrowings ? parseBorrowings(JSON.parse(savedBorrowings)) : [];
      const savedSession = window.localStorage.getItem(SESSION_KEY);
      let session = null;

      if (savedSession) {
        try {
          session = JSON.parse(savedSession);
        } catch {
          session = savedSession;
        }
      }

      const legacyAccountId = normalizePhone(
        typeof legacySettings.phone === "string" ? legacySettings.phone : "",
      ) || "legacy";
      const resolvedAccountId = session && typeof session === "object"
        ? session.accountId
        : legacyAccountId;
      const signedIn = session && typeof session === "object"
        ? session.status === "signed-in"
        : session === "signed-in";

      if (typeof resolvedAccountId === "string" && resolvedAccountId) {
        const account = readAccount(resolvedAccountId, legacySettings, legacyBorrowings);
        setAccountId(resolvedAccountId);
        setProfileName(account.name);
        setProfilePhone(account.phone);
        setReminders(account.reminders);
        setBorrowings(account.borrowings);
      }
      setIsSignedIn(Boolean(signedIn && resolvedAccountId));
    } catch {
      setPersistenceError("Data akun atau peminjaman tidak dapat dibaca dari browser.");
    } finally {
      setReady(true);
    }
  }, []);

  const persistAccount = useCallback((nextAccount) => {
    if (!accountId) {
      setPersistenceError("Buat akun terlebih dahulu sebelum menyimpan perubahan.");
      return false;
    }

    try {
      window.localStorage.setItem(accountKey(accountId), JSON.stringify(nextAccount));
      setPersistenceError("");
      return true;
    } catch {
      setPersistenceError("Data akun gagal disimpan di browser ini. Periksa ruang penyimpanan lalu coba lagi.");
      return false;
    }
  }, [accountId]);

  const addBorrowing = useCallback((borrowing) => {
    if (!ready || !isSignedIn || !accountId) return false;
    if (borrowings.some((item) => item.bookId === borrowing.bookId && isActive(item))) {
      setPersistenceError("Buku ini sudah tercatat dalam daftar peminjamanmu.");
      return false;
    }

    const updatedBorrowings = [
      ...borrowings,
      { ...borrowing, id: `${borrowing.bookId}-${Date.now()}`, status: "active" },
    ];
    if (!persistAccount({ name: profileName, phone: profilePhone, reminders, borrowings: updatedBorrowings })) {
      return false;
    }

    setBorrowings(updatedBorrowings);
    return true;
  }, [ready, isSignedIn, accountId, borrowings, persistAccount, profileName, profilePhone, reminders]);

  const returnBorrowing = useCallback((bookId) => {
    if (!ready || !isSignedIn || !accountId) {
      setPersistenceError("Masuk ke akun terlebih dahulu untuk mengonfirmasi pengembalian.");
      return false;
    }

    const activeBorrowing = borrowings.find((item) => item.bookId === bookId && isActive(item));
    const returnedAt = localDateString(new Date());
    const updatedBorrowings = activeBorrowing
      ? borrowings.map((item) => (
        item.id === activeBorrowing.id
          ? { ...item, status: "returned", returnedAt }
          : item
      ))
      : [
        ...borrowings,
        {
          id: `${bookId}-${Date.now()}`,
          bookId,
          loanDate: null,
          returnDate: null,
          status: "returned",
          returnedAt,
        },
      ];

    if (!persistAccount({ name: profileName, phone: profilePhone, reminders, borrowings: updatedBorrowings })) {
      return false;
    }

    setBorrowings(updatedBorrowings);
    return true;
  }, [ready, isSignedIn, accountId, borrowings, persistAccount, profileName, profilePhone, reminders]);

  const updateProfile = useCallback(({ name, phone, nextReminders = reminders }) => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const digitCount = normalizePhone(trimmedPhone).length;
    if (!trimmedName || digitCount < 8 || digitCount > 15) {
      setPersistenceError("Masukkan nama dan nomor HP yang valid (8–15 digit).");
      return false;
    }

    if (!persistAccount({ name: trimmedName, phone: trimmedPhone, reminders: nextReminders, borrowings })) {
      return false;
    }

    setProfileName(trimmedName);
    setProfilePhone(trimmedPhone);
    setReminders(nextReminders);
    return true;
  }, [borrowings, reminders, persistAccount]);

  const signOut = useCallback(() => {
    if (!accountId) {
      setPersistenceError("Tidak ada akun yang sedang masuk.");
      return false;
    }

    try {
      writeSession("signed-out", accountId);
      setIsSignedIn(false);
      setPersistenceError("");
      return true;
    } catch {
      setPersistenceError("Tidak dapat keluar dari akun karena penyimpanan browser bermasalah.");
      return false;
    }
  }, [accountId]);

  const signIn = useCallback(() => {
    if (!accountId) {
      setPersistenceError("Akun tidak ditemukan. Buat akun baru dengan nama dan nomor HP.");
      return false;
    }

    try {
      writeSession("signed-in", accountId);
      setIsSignedIn(true);
      setPersistenceError("");
      return true;
    } catch {
      setPersistenceError("Tidak dapat masuk kembali karena penyimpanan browser bermasalah.");
      return false;
    }
  }, [accountId]);

  const registerAccount = useCallback(({ name, phone }) => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const normalizedPhone = normalizePhone(trimmedPhone);

    if (!trimmedName || normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      setPersistenceError("Masukkan nama dan nomor HP yang valid (8–15 digit).");
      return false;
    }

    try {
      const existingAccount = window.localStorage.getItem(accountKey(normalizedPhone));
      const account = existingAccount
        ? readAccount(normalizedPhone, {}, [])
        : { name: trimmedName, phone: trimmedPhone, reminders: true, borrowings: [] };
      if (existingAccount) {
        account.name = trimmedName;
        account.phone = trimmedPhone;
      }

      window.localStorage.setItem(accountKey(normalizedPhone), JSON.stringify(account));
      writeSession("signed-in", normalizedPhone);
      setAccountId(normalizedPhone);
      setProfileName(account.name);
      setProfilePhone(account.phone);
      setReminders(account.reminders);
      setBorrowings(account.borrowings);
      setIsSignedIn(true);
      setPersistenceError("");
      return true;
    } catch {
      setPersistenceError("Akun tidak dapat disimpan di browser ini. Periksa ruang penyimpanan lalu coba lagi.");
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      borrowings,
      addBorrowing,
      returnBorrowing,
      profileName,
      profilePhone,
      reminders,
      isSignedIn,
      updateProfile,
      signIn,
      signOut,
      registerAccount,
      persistenceError,
      ready,
    }),
    [
      borrowings,
      addBorrowing,
      returnBorrowing,
      profileName,
      profilePhone,
      reminders,
      isSignedIn,
      updateProfile,
      signIn,
      signOut,
      registerAccount,
      persistenceError,
      ready,
    ],
  );

  return <BorrowingContext.Provider value={value}>{children}</BorrowingContext.Provider>;
}

export function useBorrowings() {
  const context = useContext(BorrowingContext);
  if (!context) {
    throw new Error("useBorrowings harus digunakan di dalam BorrowingProvider.");
  }
  return context;
}
