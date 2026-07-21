// components/AlertBanner.jsx
import styles from "./AlertBanner.module.css";

export function HotspotBanner({ hotspots }) {
  if (!hotspots?.length) return null;
  return (
    <div className={`${styles.banner} ${styles.danger}`}>
      <div className={styles.bannerHead}>
        <WarningIcon />
        <span className={styles.bannerTitle}>Hotspot Alert</span>
        <span className={styles.count}>{hotspots.length} zone{hotspots.length > 1 ? "s" : ""}</span>
      </div>
      <div className={styles.items}>
        {hotspots.map((h, i) => (
          <div key={i} className={styles.item}>
            <span className={`${styles.level} ${h.level === "CRITICAL" ? styles.critical : styles.warning}`}>
              {h.level}
            </span>
            <span className={styles.itemText}>
              <strong>{h.city}</strong> — {h.count} reports
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EscalatedBanner({ escalated }) {
  if (!escalated?.length) return null;
  return (
    <div className={`${styles.banner} ${styles.warning}`}>
      <div className={styles.bannerHead}>
        <AlertIcon />
        <span className={styles.bannerTitle}>Escalated Cases</span>
        <span className={styles.count}>{escalated.length} case{escalated.length > 1 ? "s" : ""}</span>
      </div>
      <div className={styles.items}>
        {escalated.map((e, i) => (
          <div key={i} className={styles.item}>
            <span className={`${styles.level} ${styles.warning}`}>ESCALATED</span>
            <span className={styles.itemText}>
              <strong>{e.id}</strong> in <strong>{e.city}</strong> — {e.reason} &middot; {e.hoursOld}h old
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}