import type { ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelProps = {
    children?: ReactNode;
    className?: string;
    direction?: "column" | "row";
    type: "main" | "secondary" | "terciary";
};

function Panel({ children, direction = "column", type, className }: PanelProps) {
    type += "Panel";
    return (
        <div className={`${styles[type]} ${className}`} style={{ flexDirection: direction }}>
            {children}
        </div>
    );
}

export default Panel;
