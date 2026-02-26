import type { ReactNode } from "react";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type ButtonProps = {
    children?: ReactNode;
    className?: string;
    color?: CssVar;
};

function Button({ children, color, className = "" }: ButtonProps) {
    return (
        <button className={`${style.button} ${className}`} style={{ backgroundColor: color }}>
            {children}
        </button>
    );
}

export default Button;
