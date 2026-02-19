import type { ReactNode } from "react";
import type { CssVar } from "../../types/types";

type TextProps = {
    children: ReactNode;
    variant?: "h1" | "h2" | "h3" | "body" | "small";
    className?: string;
    color?: CssVar;
};

function Text({ children, variant = "body", className = "", color }: TextProps) {
    return (
        <span className={`${variant} ${className}`} style={{ color: color }}>
            {children}
        </span>
    );
}

export default Text;
