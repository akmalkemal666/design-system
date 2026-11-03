import styles from "./Container.module.css";

export default function Container({ children, className = "" }) {
  return <div className={`${styles["ui-container"]} ${className}`}>{children}</div>;
}
