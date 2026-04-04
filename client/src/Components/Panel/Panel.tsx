import type { ReactNode, MouseEvent } from "react";
import styles from "./Panel.module.css";

type PanelProps = {
    children?: ReactNode;
    className?: string;
    direction?: "column" | "row";
    type: "main" | "secondary" | "terciary";
    interactive?: boolean;
    onClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

function Panel({ children, direction = "column", type, className, interactive = false, onClick }: PanelProps) {
    type += "Panel";
    return (
        <div
            className={`${styles[type]} ${interactive ? styles.interactive : ""} ${className}`}
            style={{ flexDirection: direction }}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export default Panel;
