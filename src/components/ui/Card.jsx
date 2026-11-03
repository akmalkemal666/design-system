import styles from "./Card.module.css";

export default function Card({ children, className = "" }) {
  return <section className={`${styles["ui-card"]} ${className}`}>{children}</section>;
}
