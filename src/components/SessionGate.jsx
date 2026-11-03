"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBorrowings } from "./BorrowingProvider";
import SignedOutHome from "./SignedOutHome";

export default function SessionGate({ children }) {
  const { isSignedIn, profileName, profilePhone, signIn, registerAccount, persistenceError, ready } = useBorrowings();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isSignedIn && pathname !== "/") router.replace("/");
  }, [ready, isSignedIn, pathname, router]);

  if (!ready) return children;
  if (!isSignedIn) {
    return (
      <SignedOutHome
        profileName={profileName}
        profilePhone={profilePhone}
        onSignIn={signIn}
        onRegister={registerAccount}
        error={persistenceError}
      />
    );
  }
  return children;
}
