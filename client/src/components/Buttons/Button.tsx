import type { ReactNode } from "react";
import style from "./Buttons.module.css";
import type { CssVar } from "../../types/types";

type ButtonTypes = {
    children?: ReactNode;
    className?: string;
    color?: CssVar;
};

function Button({ children, color, className = "" }: ButtonTypes) {
    return (
        <div className={`${style.button} ${className}`} style={{ backgroundColor: color }}>
            {children}
        </div>
    );
}

export default Button;
