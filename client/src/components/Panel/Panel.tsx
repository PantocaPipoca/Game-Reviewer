import type { ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelProps = {
    children?: ReactNode;
    direction?: "column" | "row";
};

function Panel({ children, direction = "column" }: PanelProps) {
    return (
        <div className={styles.Panel} style={{ flexDirection: direction }}>
            {children}
        </div>
    );
}

export default Panel;
