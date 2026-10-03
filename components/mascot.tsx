"use client";
import styles from "./mascot.module.css";

export type MascotMood="idle"|"happy"|"sus"|"epic";

/** The guide that reacts to every answer and teases the reveal. */
export function Mascot({mood="idle",line,compact=false,label}:{mood?:MascotMood;line?:string|null;compact?:boolean;label?:string}){
  return <div className={`${styles.mascot} ${styles[mood]} ${compact?styles.compact:""}`}>
    <div className={styles.body} aria-hidden="true"><span className={styles.eye}/><span className={styles.eye}/><span className={styles.spark}>✦</span></div>
    <p className={styles.line} role="status" aria-live="polite" aria-label={label}>{line||"Jag håller koll på detaljerna."}</p>
  </div>;
}
