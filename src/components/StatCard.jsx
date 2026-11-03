import { BookOpen, CheckCircle2, Bookmark, Users } from "lucide-react";
import Card from "./ui/Card";
import styles from "./StatCard.module.css";

const iconMap = { books: BookOpen, available: CheckCircle2, borrowed: Bookmark, members: Users };

export default function StatCard({ label, value, note, type }) {
  const Icon = iconMap[type] || BookOpen;
  return (
    <Card className={styles["stat-card"]}>
      <div className={`${styles["stat-card__icon"]} ${styles[`stat-card__icon--${type}`]}`}><Icon size={19} /></div>
      <div className={styles["stat-card__label"]}>{label}</div>
      <div className={styles["stat-card__value"]}>{value}</div>
      <div className={styles["stat-card__note"]}>{note}</div>
    </Card>
  );
}
