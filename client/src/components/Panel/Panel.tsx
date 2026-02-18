import type { ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelProps = {
    children?: ReactNode;
    direction?: "column" | "row";
    type: "main" | "secondary" | "terciary";
};

function Panel({ children, direction = "column", type }: PanelProps) {
    type += "Panel";
    return (
        <div className={styles[`${type}`]} style={{ flexDirection: direction }}>
            {children}
        </div>
    );
}

export default Panel;
