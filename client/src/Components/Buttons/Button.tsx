import type { MouseEvent, ReactNode } from "react";
import style from "./Buttons.module.css";
import type { CssVar } from "../../Types/Types";

type ButtonProps = {
    children?: ReactNode;
    className?: string;
    color?: CssVar;
    tColor?: CssVar;
    disabled?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

function Button({ children, color, tColor, className = "", onClick, disabled = false }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${style.button} ${className} ${disabled ? style.disabled : ""}`}
            style={{ backgroundColor: color, color: tColor }}
        >
            {children}
        </button>
    );
}

export default Button;
