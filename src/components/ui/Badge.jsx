import styles from "./Badge.module.css";

export default function Badge({ children, variant = "neutral" }) {
  return <span className={`${styles["ui-badge"]} ${styles[`ui-badge--${variant}`]}`}>{children}</span>;
}
