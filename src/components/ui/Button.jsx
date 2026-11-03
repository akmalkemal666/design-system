import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  onClick,
  disabled = false,
}) {
  return (
    <button
      className={`${styles["ui-button"]} ${styles[`ui-button--${variant}`]} ${styles[`ui-button--${size}`]}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
