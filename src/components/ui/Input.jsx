import { Search } from "lucide-react";
import styles from "./Input.module.css";

export default function Input({ value, onChange, placeholder = "Cari buku...", ariaLabel = "Cari buku" }) {
  return (
    <label className={styles["ui-input"]}>
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </label>
  );
}
