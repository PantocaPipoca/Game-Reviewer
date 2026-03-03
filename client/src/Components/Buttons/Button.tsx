import type { ReactNode } from "react";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type ButtonProps = {
    children?: ReactNode;
    className?: string;
    color?: CssVar;
    tColor?: CssVar;
};

function Button({ children, color, tColor, className = "" }: ButtonProps) {
    return (
        <button className={`${style.button} ${className}`} style={{ backgroundColor: color, color: tColor }}>
            {children}
        </button>
    );
}

export default Button;
