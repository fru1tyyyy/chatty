import styles from "./EmptyState.module.css";

export default function EmptyState(){
    return(
        <div className={styles.container}>
            <div className={styles.icon}>Chat</div>
            <h2 className={styles.title}>Select a Conversation :)</h2>
            <p className={styles.subtitle}>Choose an existing chat or start a new one</p>
        </div>
    );
}
